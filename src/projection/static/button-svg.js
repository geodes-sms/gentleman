import { isNullOrUndefined, valOrDefault, isObject } from "zenkai";
import { Static } from "./static.js"

const ActionHandler = {
    "CREATE": createElement,
    "CREATE-SELECT": createAndSelect,
    "DELETE": deleteElement,
}

function createAndSelect(target, value){
    let item = this.source.createElement();
    item.setValue(valOrDefault(value.name, value));
}

function createElement(target, value){
    this.source.createElement(value);
}

function deleteElement(target, value){
    this.source.delete();
}

const BaseSVGButton = {
    init(){
        return this;
    },

    render(){
        const { action, content, dimensions } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.element.classList.add("static");
            this.element.dataset.nature = "static";
            this.element.dataset.algorithm = "button";
            this.element.tabIndex = -1;
            this.element.dataset.id = this.id;
        }

        if(content && isNullOrUndefined(this.content)){
            this.createContent(content);
        }

        if(dimensions) {
            this.element.setAttribute("width", dimensions.width);
            this.element.setAttribute("height", dimensions.height);
        }

        this.action = action;

        this.bindEvents();

        if(this.action == "DELETE" && !this.projection.optional) {
            this.container.classList.add("hidden");
        }

        return this.element
    },

    createContent(content){
        const parser = new DOMParser()
        this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;

        this.element.append(this.content);
    },
    
    focusIn(){

    },

    focusOut(){

    },

    clickHandler(){
        const { type, target, value } = this.schema.action;
        ActionHandler[type].call(this, target, value);
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            if(!this.parent.displayed){
                return;
            }

            this.element.setAttribute("width", valOrDefault(Number(this.content.getAttribute("width")), this.content.getBBox().width));
            this.element.setAttribute("height", valOrDefault(Number(this.content.getAttribute("height")), this.content.getBBox().height));
        })
    }
}

export const SVGButton = Object.assign(
    Object.create(Static),
    BaseSVGButton
)