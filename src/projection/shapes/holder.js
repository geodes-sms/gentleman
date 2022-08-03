import { Shape } from "./shape";

const { isNullOrUndefined } = require("zenkai");

const BaseHolder = {
    init(){
        return this;
    },

    render(){
        
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("shape-container");
            this.container.dataset.nature = "shape";
            this.container.dataset.shape = "group";
            this.container.dataset.id = this.id;

        }

        this.bindEvents();

        this.container.style.overflow = "visible"

        return this.container
    },

    bindEvents(){
        this.projection.registerHandler("value.changed", (value) => {
            let itemProjection = this.model.createProjection(this.source.getValue(true),"shape");
            itemProjection.parent = this.projection;

            let container = itemProjection.init().render();

            this.container.append(container);
        })
    }
}

export const Holder = Object.assign(
    Object.create(Shape),
    BaseHolder
);