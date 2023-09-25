import { isNullOrUndefined, valOrDefault, isObject } from "zenkai";
import { Static } from "./static.js"

const ActionHandler = {
    "CREATE": createElement,
    "CREATES": createAndSelect,
    "DELETE": deleteElement,
    "EXTRACT": extractShape,
    "SIDE": openSide,
    "OPEN": openSelection,
    "CREATE-TREE": addTree,
}

function addTree(target, value){
    let find = this.container;

    while(isNullOrUndefined(find.getAttribute("data-tree")) && !(find.getAttribute("data-tree") === target)){
        find = find.parentNode;
    }

    let element = this.source.createElement();

    this.environment.getActiveReceiver(target).accept(element, find, valOrDefault(value, "main"));
}

function openSelection(target){
    if(isNullOrUndefined(this.target)){
        this.target = target
    }
    this.target.open();
}

function createAndSelect(target, value){
    let item = this.source.createElement();
    item.setValue(valOrDefault(value.name, value));
}

function openSide(target, value){
    let projection = this.environment.createProjection(this.source, target);

    let window = this.environment.findWindow("side-instance");
    if (isNullOrUndefined(window)) {
        window = this.environment.createWindow("side-instance");
        window.container.classList.add("model-projection-sideview");
    }

    if (window.instances.size > 0) {
        let instance = Array.from(window.instances)[0];
        instance.delete();
    }

    let instance = this.environment.createInstance(this.source, projection, {
        type: "projection",
        close: "DELETE-PROJECTION"
    });

    window.addInstance(instance);
}

function createElement(target, value){
    this.source.createElement(value);
}

function deleteElement(target, value){
    if(this.source.parent.schema.nature === "prototype"){
        this.source.parent.delete();
        return;
    }
    this.source.delete();
}

function extractShape(target, value){
    const cname = "graphical"; 

    const environment = this.projection.environment;

    let concept = environment.actions.get("extract-instance")("graphical");

    let shapeCollection = concept.getAttribute("shape").target.getAttribute("elements").target;
    
    let element = shapeCollection.createElement();

    element.setValue(this.source.name);

    createCopy.call(this, element.getValue(true));

    copyStyle.call(this, element.getValue(true));

    deleteElement.call(this);
}

function createCopy(element){

    switch(this.source.name){
        case "circle": 
            element.getAttributeByName("cx").target.setValue(this.source.getAttributeByName("cx").target.value);
            element.getAttributeByName("cy").target.setValue(this.source.getAttributeByName("cy").target.value);
            element.getAttributeByName("r").target.setValue(this.source.getAttributeByName("r").target.value);

            break;
        case "ellipse":
            element.getAttributeByName("cx").target.setValue(this.source.getAttributeByName("cx").target.value);
            element.getAttributeByName("cy").target.setValue(this.source.getAttributeByName("cy").target.value);
            element.getAttributeByName("rx").target.setValue(this.source.getAttributeByName("rx").target.value);
            element.getAttributeByName("ry").target.setValue(this.source.getAttributeByName("ry").target.value);

            break;

        case "rectangle":
            element.getAttributeByName("x").target.setValue(this.source.getAttributeByName("x").target.value);
            element.getAttributeByName("y").target.setValue(this.source.getAttributeByName("y").target.value);
            element.getAttributeByName("width").target.setValue(this.source.getAttributeByName("width").target.value);
            element.getAttributeByName("height").target.setValue(this.source.getAttributeByName("height").target.value);

            break;
        
        case "polygon":
            element.getAttributeByName("points").target.setValue(this.source.getAttributeByName("points").target.value);

            break;

        case "path":
            element.getAttributeByName("d").target.setValue(this.source.getAttributeByName("d").target.value);

            break;
    }

}

function copyStyle(element){
    const styleTarget = element.getAttributeByName("style").target;
    const styleSource = this.source.getAttributeByName("style").target;

    styleTarget.getAttributeByName("fill").target.setValue(styleSource.getAttributeByName("fill").target.value);
    styleTarget.getAttributeByName("stroke").target.setValue(styleSource.getAttributeByName("stroke").target.value);
    styleTarget.getAttributeByName("s-width").target.setValue(styleSource.getAttributeByName("s-width").target.value);
    styleTarget.getAttributeByName("s-dash").target.setValue(styleSource.getAttributeByName("s-dash").target.value);
    styleTarget.getAttributeByName("rx").target.setValue(styleSource.getAttributeByName("rx").target.value);
    styleTarget.getAttributeByName("ry").target.setValue(styleSource.getAttributeByName("ry").target.value);

}


const BaseSVGButton = {
    init(){
        return this;
    },

    render(){
        const { action, content } = this.schema;

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

        this.action = action;

        this.bindEvents();

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

export const SVGButton = Object.assign({},
    Object.create(Static),
    BaseSVGButton
)