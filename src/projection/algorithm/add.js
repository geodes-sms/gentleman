import { Algorithm } from "./algorithm.js";
const { isHTMLElement, createDiv, isNullOrUndefined, createDocFragment, isEmpty, isNull, valOrDefault } = require("zenkai");


const BaseAdd = {
    init(){
        return this;
    },

    render(){
        const { content, dimensions } = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "add";
            this.container.dataset.id = this.id;
            this.container.setAttribute("font-size", 12);
            this.container.style["dominant-baseline"] = "hanging";

        }

        this.container.textContent = content;

        return this.container;
    },

    focusIn(){

    },

    focusOut(){

    },

    clickHandler(){
        this.source.createElement();
    },

    bindEvents(){
        this.container.addEventListener("click", () => {
            this.source.createElement();
        })
    }
}

export const Add = Object.assign({},
    Algorithm,
    BaseAdd
)