import { isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm.js";

const BaseAltView = {
    init(){
        return this;
    },

    render(){
        const { button, view } = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            
            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "decoration";
            this.container.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.button)){
            const parser = new DOMParser();

            const {content, coordinates} = button;

            this.button = parser.parseFromString(parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement)
        
            this.button.setAttribute("x", coordinates.x);
            this.button.setAttribute("y", coordinates.y);

            this.container.append(button);
        }
        
        this.bindEvents();

        return this.container
    },


    bindEvents(){

    }
}

export const AltView = Object.assign({},
    Algorithm,
    BaseAltView)