import { isNullOrUndefined } from 'zenkai';
import {Static} from './static.js';


const BaseSVGTextStatic = {
    init(){
        return this;
    },

    render(){
        const parser = new DOMParser();

        const { content, style } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.element.textContent = content;
        }

        this.style();

        return this.element;
    },

    style(){
        const { font, size, anchor = "left", weight, baseline } = this.schema.style;

        this.element.setAttribute("text-anchor", anchor);
        this.element.setAttribute("font-family", font);
        this.element.setAttribute("font-size", size);
        this.element.style["dominant-baseline"] = baseline;
        if(weight){
            this.element.setAttribute("font-weight", weight);
        }
    },

    focusIn(){

    },

    focusOut(){

    },

    clickHandler(target){

    }
}

export const SVGTextStatic = Object.assign(
    Object.create(Static),
    BaseSVGTextStatic
);