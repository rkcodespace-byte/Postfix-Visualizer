
const expressionInput = document.getElementById("expression");
const evaluateBtn = document.getElementById("evaluateBtn");
const exampleBtn = document.getElementById("exampleBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const stackView = document.getElementById("stack");
const stepsBody = document.getElementById("stepsBody");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const stepCounter = document.getElementById("stepCounter");

let steps = [];
let currentStep = 0;
let finalResult = null;

function displayStack(values) {
    stackView.replaceChildren();

    if (values.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Stack is empty";
        stackView.appendChild(empty);
        return;
    }

    values.forEach((value, index) => {
        const node = document.createElement("div");
        node.className = "node";

        const number = document.createElement("strong");
        number.textContent = value;

        const label = document.createElement("small");
        label.textContent = index === 0 ? "TOP" : `Node ${index + 1}`;

        node.append(number, label);
        stackView.appendChild(node);
    });
}

function showStep(index) {
    if (!steps.length) return;

    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[currentStep];

    displayStack(step.stack);
    stepCounter.textContent =
        `Step ${currentStep + 1} of ${steps.length}`;

    Array.from(stepsBody.rows).forEach((row, rowIndex) => {
        row.classList.toggle("active", rowIndex === currentStep);
    });

    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;

    result.textContent =
        currentStep === steps.length - 1 && finalResult !== null
            ? finalResult
            : "—";
}

function renderSteps() {
    stepsBody.replaceChildren();

    steps.forEach((step, index) => {
        const row = document.createElement("tr");

        [index + 1, step.token, step.action,
         step.stack.length ? step.stack.join(" → ") : "Empty"
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        stepsBody.appendChild(row);
    });

    showStep(0);
}

async function evaluateExpression() {
    const expression = expressionInput.value.trim();

    message.textContent = "";
    result.textContent = "—";
    steps = [];
    finalResult = null;
    stepsBody.replaceChildren();
    displayStack([]);

    if (!expression) {
        message.textContent = "Please enter a postfix expression.";
        return;
    }

    evaluateBtn.disabled = true;
    evaluateBtn.textContent = "Evaluating...";

    try {
        const response = await fetch("/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            message.textContent = data.error || "Evaluation failed.";
            return;
        }

        steps = data.steps;
        finalResult = data.result;
        renderSteps();
        showStep(steps.length - 1);
    } catch (error) {
        message.textContent =
            "Cannot connect to Flask. Check that app.py is running.";
    } finally {
        evaluateBtn.disabled = false;
        evaluateBtn.textContent = "Evaluate";
    }
}

evaluateBtn.addEventListener("click", evaluateExpression);

expressionInput.addEventListener("keydown", event => {
    if (event.key === "Enter") evaluateExpression();
});

exampleBtn.addEventListener("click", () => {
    expressionInput.value = "8 3 - 2 4 * + 6 /";
    evaluateExpression();
});

clearBtn.addEventListener("click", () => {
    expressionInput.value = "";
    message.textContent = "";
    result.textContent = "—";
    steps = [];
    finalResult = null;
    stepsBody.replaceChildren();
    displayStack([]);
    stepCounter.textContent = "No steps yet";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
});

prevBtn.addEventListener("click", () => showStep(currentStep - 1));
nextBtn.addEventListener("click", () => showStep(currentStep + 1));

displayStack([]);
