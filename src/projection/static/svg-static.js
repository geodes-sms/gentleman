import { isNullOrUndefined } from 'zenkai';
import {Static} from './static.js';


const BaseSVGStatic = {
    init(){
        return this;
    },

    render(){
        const parser = new DOMParser();

        const { content } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-static";
            this.element.dataset.ignore = "all";
        }

        return this.element;
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
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