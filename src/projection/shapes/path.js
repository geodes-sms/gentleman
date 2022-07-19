const { isNullOrUndefined } = require("zenkai");
import { Shape } from './shape.js';

const BasePath = {
    init(){
        return this;
    },

    render(){

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.element.classList.add("shape-container");
            this.element.dataset.nature = "shape";
            this.element.dataset.shape = "path";
            this.element.dataset.id = this.id;
        }

        this.d = this.source.getAttributeByName("d").target;

        this.element.style["stroke-width"] = 5;
        this.element.style["stroke"] = "black";
        this.source.getAttributeByName("style").target.getAttributeByName("s-width").setValue(5);

        this.refresh();

        this.bindEvents();
        this.bindStyle();

        return this.element;
    },

    refresh(){
        this.element.setAttribute("d", this.d.value);
    },


    bindEvents(){
        this.d.register(this);

    },

    bindStyle(){

    },

    update(message){
        this.refresh();

        if(!isNullOrUndefined(this.stroke.value)){
            this.element.setAttribute("fill", this.fill.value)
        }

        if(!isNullOrUndefined(this.stroke.value)){
            this.element.style.stroke = this.stroke.value;
        }

        if(!isNullOrUndefined(this.width.value)){
            this.element.style["stroke-width"] = this.width.value;
        }

        if(!isNullOrUndefined(this.dash.value)){
            this.element.style["stroke-dasharray"] = this.dash.value;
        }

    },

    bindStyle(){
        const style = this.source.getAttributeByName("style").target;

        this.fill = style.getAttributeByName("fill").target;
        this.stroke = style.getAttributeByName("stroke").target;
        this.width = style.getAttributeByName("s-width").target;
        this.dash = style.getAttributeByName("s-dash").target;

        this.fill.register(this);
        this.stroke.register(this);
        this.width.register(this);
        this.dash.register(this);
    },

    focusIn(){

    },

    focusOut(){
        
    }
}

export const Path = Object.assign(
    Object.create(Shape),
    BasePath
);