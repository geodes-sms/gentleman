import { Field } from "./field";

const { isNull, isNullOrUndefined } = require("zenkai");


const BaseSVGSwitch = {
    init(){
        return this;
    },

    render(){
        const { order } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg"); 

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "field",
            this.element.dataset.view = "svg-choice";
            
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.classList.add("field--svg_choice");
        }

        if(isNullOrUndefined(this.index)){
            this.index = 0;
        }

        this.order = order;

        if(this.source.hasValue()){
            for(let i = 0; i < this.order.length; i++){
                if(this.order[i] === this.source.value){
                    this.index = i;
                    break;
                }
            }
        }

        this.bindEvents();

        return this.element;
    },

    clickHandler(){
    },

    registerDimensionsObserver(o){

    },

    focusIn(){

    },

    focusOut(){

    },

    bindEvents(){
        this.element.addEventListener("click", () => {
            this.index = (this.index + 1) % this.order.length;
            
            this.source.setValue(this.order[this.index]);

        })
    }
}

export const SVGSwitch = Object.assign(
    Object.create(Field),
    BaseSVGSwitch
);