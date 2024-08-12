import { isNullOrUndefined } from 'zenkai';
import {Static} from './static.js';


const BaseSVGStatic = {
    init(){
        this.displayed = false;

        return this;
    },

    render(){
        const parser = new DOMParser();

        const { content } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-static";
            this.element.dataset.ignore = "all";
        }

        this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;

        this.element.append(this.content);

        this.bindEvents();

        return this.element;
    },

    updateSize() {
        if(!isNullOrUndefined(this.content.getAttribute("width")) && !isNullOrUndefined(this.content.getAttribute("height"))) {
            this.element.setAttribute("width", Number(this.content.getAttribute("width"))); 
            this.element.setAttribute("height", Number(this.content.getAttribute("height"))); 
        } else {
            const { width, height } = this.content.getBBox();
            this.element.setAttribute("width", width);
            this.element.setAttribute("height", height);            
        }
    },

    display() {
        if(this.displayed) {
            return;
        }

        this.displayed = true;

        this.updateSize();
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
            
            if(this.parent.displayed){
                this.parent.updateSize();
            }
        })
    }
}

export const SVGStatic = Object.assign(
    Object.create(Static),
    BaseSVGStatic
);