const { isNullOrUndefined } = require("zenkai");
import { Shape } from './shape.js';

const BaseRectangle = {
    init(){
        return this;
    },

    render(){
        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            this.element.classList.add("shape-container");
            this.element.dataset.nature = "shape";
            this.element.dataset.shape = "circle";
            this.element.dataset.id = this.id;
        }

        this.x = this.source.getAttributeByName("x").target;
        this.y = this.source.getAttributeByName("y").target;
        this.width = this.source.getAttributeByName("width").target;
        this.height = this.source.getAttributeByName("height").target;

        this.refresh();

        this.bindEvents();
        this.bindStyle();

        return this.element;
    },

    refresh(){
        this.element.setAttribute("x", this.x.value);
        this.element.setAttribute("y", this.y.value);
        this.element.setAttribute("height", this.height.value);
        this.element.setAttribute("width", this.width.value);
    },

    bindStyle(){
        const style = this.source.getAttributeByName("style").target;

        this.fill = style.getAttributeByName("fill").target;
        this.stroke = style.getAttributeByName("stroke").target;
        this.widthS = style.getAttributeByName("s-width").target;
        this.dash = style.getAttributeByName("s-dash").target;
        this.rx = style.getAttributeByName("rx").target;
        this.ry = style.getAttributeByName("ry").target;

        this.fill.register(this);
        this.stroke.register(this);
        this.widthS.register(this);
        this.dash.register(this);
        this.rx.register(this);
        this.ry.register(this);
    },

    update(message){
        this.refresh();

        if(!isNullOrUndefined(this.fill.value)){
            this.element.setAttribute("fill", this.fill.value)
        }

        if(!isNullOrUndefined(this.stroke.value)){
            this.element.style.stroke = this.stroke.value;
        }

        if(!isNullOrUndefined(this.widthS.value)){
            this.element.style["stroke-width"] =this.widthS.value;
        }

        if(!isNullOrUndefined(this.dash.value)){
            this.element.style["stroke-dasharray"] = this.dash.value;
        }

        if(!isNullOrUndefined(this.rx.value)){
            this.element.setAttribute("rx", this.rx.value);
        }

        if(!isNullOrUndefined(this.ry.value)){
            this.element.setAttribute("ry", this.ry.value);
        }
    },

    bindEvents(){
        this.x.register(this);
        this.y.register(this);
        this.width.register(this);
        this.height.register(this);
    }
}

export const Rectangle = Object.assign(
    Object.create(Shape),
    BaseRectangle
);