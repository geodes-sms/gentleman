import {
    createDocFragment, createDiv, createUnorderedList, createListItem, createButton,
    findAncestor, removeChildren, isHTMLElement, isNullOrUndefined, valOrDefault, hasOwn,
} from "zenkai";
import {
    hide, show, shake, NotificationType, getClosest, isHidden,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";

const BaseArrow ={
    init(){
        this.arrowStyle = this.schema.arrowStyle;

        return this;
    },
    render(){
        const { /*target = "self", source = "source",*/ decorator} = this.schema;

        const target = "target";
        const source = "source";

        if(!isHTMLElement(this.element)){
        
            this.element = document.createElementNS('http://www.w3.org/2000/svg', "path");
            this.element.style["fill"] = "transparent";

            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabindex = -1;
            this.element.dataset["nature"] = "field";
            this.element.dataset["view"] = "arrow";
            this.element.dataset["id"] = this.id;
            
        }

        if(target != "self"){
            this.source.getAttributeByName(target).target.register(this.projection);
        }

        if(source != "self"){
            this.source.getAttributeByName(source).target.register(this.projection);
        }

        if(!isHTMLElement(this.decorator) && (!isNullOrUndefined(decorator.attribute.dynamic.name))){
            this.decorator = ContentHandler.call(this, decorator.attribute);
            this.base = "left";
            this.ratio = 0.02;
        }

        if(isNullOrUndefined(this.registered)){
            this.registered = [];
        }

        this.computeStyle();

        this.bindEvent();

        return this.element;
    },

    /*Find a way to know what source to transmit*/

    getStyle(){

    },

    signal(){
        if(!isNullOrUndefined(this.valSource) && !isNullOrUndefined(this.valTarget)){
            this.projection.parent.accept(this.valSource, this.valTarget, this);
        }        
    },


    computeStyle(){
        const { stroke, dasharray, width, linecap, end, start } = this.schema.arrowStyle;

        this.element.style.stroke = stroke;

        if(!isNullOrUndefined(dasharray)){
            this.element.style["stroke-dasharray"] = dasharray;
        }

        this.element.style["stroke-width"] = valOrDefault(width, 1);

        this.element.style["stroke-linecap"] = linecap;

        if(end){
            this.createMarkerEnd();
        }

        if(start){
            //this.createMarkerStart();
        }
    },

    createMarkerEnd(){
        if(isNullOrUndefined(this.definitions)){
            this.definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        }

        this.end = document.createElementNS("http://www.w3.org/2000/svg", "marker");

        this.end.id = "marker" + this.id;

        this.end.setAttribute("refY", 5);
        this.end.setAttribute("refX", 10);
        this.end.setAttribute("markerUnit", "strokeWidth");
        this.end.setAttribute("markerWidth", 10);
        this.end.setAttribute("markerHeight", 10)
        this.end.setAttribute("orient", "auto");
        this.end.classList.add("end");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "black");

        this.end.appendChild(path);

        this.definitions.appendChild(this.end);

        this.element.setAttribute("marker-end", "url(#" + this.end.id + ")");
    },

    createMarkerStart(){
        if(isNullOrUndefined(this.definitions)){
            this.definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        }

        this.start = document.createElementNS("http://www.w3.org/2000/svg", "marker");

        this.start.id = "marker" + this.id;

        this.start.setAttribute("refY", 5);
        this.start.setAttribute("refX", 1);
        this.start.setAttribute("markerUnit", "strokeWidth");
        this.start.setAttribute("markerWidth", 10);
        this.start.setAttribute("markerHeight", 10)
        this.start.setAttribute("orient", "auto");
        this.start.classList.add("start");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "black");

        this.start.appendChild(path);

        this.definitions.appendChild(this.end);

        this.element.setAttribute("marker-start", "url(#" + this.end.id + ")");
    },

    setValues(){
        if(!isNullOrUndefined(this.source.getAttributeByName("target").target.value)){
            this.valTarget = this.source.getAttributeByName("target").target.value;
        }

        if(!isNullOrUndefined(this.source.getAttributeByName("source").target.value)){
            this.valSource = this.source.getAttributeByName("source").target.value;
        }

    },

    refresh(){
        this.setValues();
        this.updateRegister();
        this.signal();
    },


    deleteRef(value, i){
        if(this.valTarget === value.id || this.valSource === value.id){
            this.projection.parent.removeArrow(this, i);
        }
    },

    setLine(p1, p2){
        this.element.setAttribute("d",
            "M " + p1.x + ", " + p1.y +
            "L " + p2.x + ", " + p2.y
        );
    },

    setPath(d){
        this.element.setAttribute("d", d);
    },

    updateRegister(){
        for(let i = 0; i < this.registered.length; i++){
            this.registered[i] = 
            { name : this.registered[i].name,
            value : this.source.getAttributeByName(this.registered[i].name).target.value};
        }
    },

    register(attribute){
        if(!isNullOrUndefined(this.getAttribute)){
            return;
        }
        
        this.registered.push(
            {name: attribute, 
            value: this.source.getAttributeByName(attribute).target.value
        });

        this.source.getAttributeByName(attribute).target.register(this.projection);
        this.projection.registerHandler("value.added", (value) => {
            this.refresh();
        })
    },

    get(name){
        console.log(this.registered);
        for(let i = 0; i < this.registered.length; i++){
            if(this.registered[i].name === name){
                return this.registered[i].value;
            }
        }
    },


    bindEvent(){
        this.projection.registerHandler("value.changed", (value) => {
            console.log(value);
            this.refresh();    
        });

        this.projection.registerHandler("displayed", () => {
            this.refresh();
        })
    }
}

export const Arrow = Object.assign(
    Object.create(Field),
    BaseArrow
);