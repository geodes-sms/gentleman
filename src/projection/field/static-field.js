import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn, isNullOrUndefined, POST,
} from "zenkai";
import { Field } from "./field.js";

const BaseStaticField = {
    
    init(){
        return this;
    },

    render(){
        const fragment = createDocFragment();

        const { content, mv } = this.schema;

        var parser = new DOMParser();
        
        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: [],
                dataset:{
                    nature: "field",
                    view: "static",
                    id: this.id
                }
            })
        }

        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }

        if(isNullOrUndefined(this.mv)){
            this.mv = mv;
        }

        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }

        return this;
    },
}




export const StaticField = Object.assign(
    Object.create(Field),
    BaseStaticField
);