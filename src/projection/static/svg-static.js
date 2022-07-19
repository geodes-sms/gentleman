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
        }

        return this.element;
    },

    focusIn(){

    },

    focusOut(){

    },

    clickHandler(target){

    }
}

export const SVGStatic = Object.assign(
    Object.create(Static),
    BaseSVGStatic
);