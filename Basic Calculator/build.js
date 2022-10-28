import CalculatorLogic from "./logic.js";

export default class CalculatorFront {
    constructor(logic){
        this.logic = logic;
        this.screen = this.screenGenerator();
        this.result = 0;
    }
    screenGenerator() {
        const display = document.createElement("input");
        display.type = "text";
        display.id = "display";
        display.className = "item";
        return display;
    }

    setResult() {
        const text = this.screen.value;
        let result;
        if(text) {
            result = this.logic.getResult(text);
        } else {
            console.log("le texte n'est pas lu")
        }
        this.screen.value = result;
    }


    buttons() {
        const buttonContainer = document.createElement("div");
        const numButtons = document.createElement("div");
        const utilButtons = document.createElement("div");
        const operators = document.createElement("div");
        operators.id = "operators";
        utilButtons.id = "util-buttons";
        numButtons.id = "num-buttons";
        buttonContainer.id = "button-container";
        buttonContainer.className = "item";
        for(let i = 0; i < 10; i++){
            const button = document.createElement("button");
            button.type = "submit";
            button.id = i;
            button.textContent = String(i);
            button.addEventListener('click', () => {
                this.screen.value += i;
            })
            numButtons.appendChild(button);
        }

        const spaceButton = document.createElement("button");
        spaceButton.id = "space-button";
        spaceButton.className = "task-button";
        spaceButton.type = "submit";
        spaceButton.innerText = "space";
        spaceButton.addEventListener('click', () => {
            this.screen.value += " ";
        })


        const clearButton = document.createElement("button");
        clearButton.type = "submit";
        clearButton.id = "clear";
        clearButton.innerText = "clear";
        clearButton.className = "task-button";
        clearButton.addEventListener('click', () => {
            this.screen.value = "";
        })

        
        const equalButton = document.createElement("button");
        equalButton.id = "equal";
        equalButton.innerText = "equal";

        equalButton.className = "task-button";
        equalButton.addEventListener('click', () => {
            this.setResult();
        })

        const backspaceButton = document.createElement("button");
        backspaceButton.type = "submit";
        backspaceButton.innerText = "Backspace";
        backspaceButton.id = "backspace";
        backspaceButton.className = "task-button";
        backspaceButton.addEventListener('click', () => {
            const text = this.screen.textContent;
            this.screen.value = text.slice(text.slice(0, -1));
        })

        utilButtons.appendChild(clearButton);
        utilButtons.appendChild(spaceButton);
        utilButtons.appendChild(equalButton);

        for(const op of this.logic.operators) {
            const button = document.createElement("button");
            button.id = op;
            button.className = "operator";
            button.innerText = op;
            button.addEventListener('click', () => {
                this.screen.value += ` ${op} `;
            })
            operators.appendChild(button);
        }

        buttonContainer.appendChild(numButtons);
        buttonContainer.appendChild(utilButtons);
        buttonContainer.appendChild(operators);

        return buttonContainer;
    }
    
    start() {
        const calculator = document.createElement("section");
        calculator.appendChild(this.screen);
        calculator.appendChild(this.buttons());
        return calculator;
    }

}

function go() {
    const logic = new CalculatorLogic();
    const calc = new CalculatorFront(logic);
    const body = document.getElementById('ici');
    body.appendChild(calc.start());
}

window.onload = () => {
    go();

}