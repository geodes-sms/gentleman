import { Field } from "./field";

const { isNullOrUndefined } = require("zenkai");


const BaseSpanField = {
    init(){
        return this;
    },

    render(){
        const {} = schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "field";
            this.element.dataset.view = "span";
        }

        return this.element;
    },

    setValue(value){
        this.element.textContent = value;
    },

    hide(){
        this.element.setAttribute("fill", "transparent");
    },

    clickHandler(target){
        console.log("Span getting clicked");
        console.log(target);
    },

    focusIn(target){
        console.log("Focusing in span");
        console.log(target);
    },

    focusOut(target){
        console.log("Focusing out");
        console.log(target);
    }
}

export const SpanField = Object.assign({},
    Object.create(Field),
    BaseSpanField
)