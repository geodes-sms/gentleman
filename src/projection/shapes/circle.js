const { isNullOrUndefined } = require("zenkai");
import { Shape } from './shape.js';

const BaseCircle = {
    init(){
        return this;
    },

    render(){

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            this.element.classList.add("shape-container");
            this.element.dataset.nature = "shape";
            this.element.dataset.shape = "circle";
            this.element.dataset.id = this.id;
        }

        this.cx = this.source.getAttributeByName("cx").target;
        this.cy = this.source.getAttributeByName("cy").target;
        this.r = this.source.getAttributeByName("r").target;

        this.refresh();

        this.bindEvents();
        this.bindStyle();

        return this.element;
    },

    refresh(){
        this.element.setAttribute("cx", this.cx.value);
        this.element.setAttribute("cy", this.cy.value);
        this.element.setAttribute("r", this.r.value);
    },


    bindEvents(){
        this.cx.register(this);
        this.cy.register(this);
        this.r.register(this);

        this.element.addEventListener("click", () => {
            this.source.notify("current.updated", this.source);
        })
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

    update(message){
        this.refresh();

        if(!isNullOrUndefined(this.fill.value)){
            this.element.setAttribute("fill", this.fill.value)
        }


        if(!isNullOrUndefined(this.stroke.value)){
            this.element.setAttribute("stroke", this.stroke.value);
        }

        if(!isNullOrUndefined(this.width.value)){
            this.element.style["stroke-width"] =this.width.value;
        }

        if(!isNullOrUndefined(this.dash.value)){
            this.element.style["stroke-dasharray"] = this.dash.value;
        }
    },

    focusIn(){

    },

    focusOut(){
        
    }
}

export const Circle = Object.assign(
    Object.create(Shape),
    BaseCircle
);