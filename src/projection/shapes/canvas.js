const { isNullOrUndefined, valOrDefault } = require("zenkai");
import { ContentHandler } from "./../content-handler.js";
import { Shape } from "./shape.js";


const BaseCanvas = {
    init(){
        return this;
    },

    render(){
        const {content} = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("shape-container");
            this.container.dataset.nature = "shape";
            this.container.dataset.shape = "canas";
            this.container.dataset.id = this.id;
        }

        if(!isNullOrUndefined(content)){
            content.forEach(c => {
                this.container.append(ContentHandler.call(this, c))
            })
        }

        this.w = this.source.getAttributeByName("width").target;
        this.h = this.source.getAttributeByName("height").target;
        this.minX = this.source.getAttributeByName("minX").target;
        this.minY = this.source.getAttributeByName("minY").target;
        this.windowW = this.source.getAttributeByName("windowW").target;
        this.windowH = this.source.getAttributeByName("windowH").target;

        this.container.style.border = "solid #87a1ff";

        this.refresh();

        this.bindEvents();

        return this.container;
    },

    refresh(){
        this.container.setAttribute("width", this.w.value);
        this.container.setAttribute("height", this.h.value);
        const w = valOrDefault(this.windowW.value, this.w.value);
        const h = valOrDefault(this.windowH.value, this.h.value);

        this.container.setAttribute("viewBox", this.minX.value + " " + this.minY.value + " " + w + " " + h);
    },

    update(){
        this.refresh()
    },

    bindEvents(){
        this.w.register(this);
        this.h.register(this);
        this.minX.register(this);
        this.minY.register(this);
        this.windowW.register(this);
        this.windowH.register(this);

        this.container.addEventListener("click", (event) => {
            const target = event.target;

            const { concept = null, nature = null, shape = null } = target.dataset;

            if(!isNullOrUndefined(nature) && nature === "shape" && shape !== "canvas"){
                this.source.getAttributeByName("current").setValue(concept);
            }
        })
        
    },

    focusIn(){

    },

    focusOut(){
        
    },

    clickHandler(target){

    }
}

export const Canvas = Object.assign(
    Object.create(Shape),
    BaseCanvas
);