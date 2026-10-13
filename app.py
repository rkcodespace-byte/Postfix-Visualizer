
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node


class LinkedListStack:
    def __init__(self):
        self.top = None
        self.size = 0

    def push(self, value):
        self.top = Node(value, self.top)
        self.size += 1

    def pop(self):
        if self.top is None:
            raise ValueError("Insufficient operands")
        value = self.top.value
        self.top = self.top.next
        self.size -= 1
        return value

    def values(self):
        result = []
        current = self.top
        while current:
            result.append(current.value)
            current = current.next
        return result


def evaluate_postfix(expression):
    tokens = expression.split()
    if not tokens:
        raise ValueError("Enter a postfix expression.")

    stack = LinkedListStack()
    steps = [{
        "token": "Start",
        "action": "Stack initialized",
        "stack": []
    }]

    operators = {"+", "-", "*", "/", "//", "%", "**"}

    for token in tokens:
        if token in operators:
            if stack.size < 2:
                raise ValueError(
                    f"Insufficient operands for operator {token}"
                )

            right = stack.pop()
            left = stack.pop()

            if token == "+":
                result = left + right
            elif token == "-":
                result = left - right
            elif token == "*":
                result = left * right
            elif token == "/":
                if right == 0:
                    raise ValueError("Division by zero is not allowed.")
                result = left / right
            elif token == "//":
                if right == 0:
                    raise ValueError("Division by zero is not allowed.")
                result = left // right
            elif token == "%":
                if right == 0:
                    raise ValueError("Modulo by zero is not allowed.")
                result = left % right
            else:
                result = left ** right

            stack.push(result)
            action = f"Pop {left} and {right}; calculate {left} {token} {right}; push {result}"

        else:
            try:
                value = float(token)
            except ValueError:
                raise ValueError(f"Invalid token: {token}")

            stack.push(value)
            action = f"Push {value}"

        steps.append({
            "token": token,
            "action": action,
            "stack": stack.values()
        })

    if stack.size != 1:
        raise ValueError(
            "Invalid expression: too many operands remain in the stack."
        )

    return {
        "steps": steps,
        "result": stack.pop()
    }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json(silent=True) or {}
    expression = str(data.get("expression", ""))

    try:
        output = evaluate_postfix(expression)
        return jsonify({
            "success": True,
            "steps": output["steps"],
            "result": output["result"]
        })
    except (ValueError, OverflowError) as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 400


if __name__ == "__main__":
    app.run(debug=True)
