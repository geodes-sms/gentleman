const { isNullOrUndefined } = require("zenkai");
import { Shape } from './shape.js';

const BasePolygon = {
    init(){
        return this;
    },

    render(){
        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

            this.element.classList.add("shape-container");
            this.element.dataset.nature = "shape";
            this.element.dataset.shape = "polygon";
            this.element.dataset.id = this.id;
        }

        this.points = this.source.getAttributeByName("points").target;

        this.refresh();

        this.bindEvents();

        return this.element;
    },

    refresh(){
        this.element.setAttribute("points", this.points.value)
    },
    
    update(message){
        this.refresh();
    },

    bindEvents(){
        this.points.register(this);
    }
}

export const Polygon = Object.assign(
    Object.create(Shape),
    BasePolygon
);