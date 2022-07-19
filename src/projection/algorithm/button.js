import { isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm.js"

const ActionHandler = {
    "CREATE": createElement,
}

function createElement(target, value){
    this.source.createElement(value);
}

const BaseSVGButton = {
    init(){
        return this;
    },

    render(){
        const { action, content, background } = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "button";
            this.container.dataset.id = this.id;
        }

        if(content && isNullOrUndefined(this.content)){
            this.createContent(content);
        }

        if(background){
            const parser = new DOMParser();

            this.background = parser.parseFromString(background.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
        
            this.container.append(this.background);
        }


        return this.container
    },

    createContent(content){
        switch(content.type){
            case "text":
                this.content = document.createElementNS("http://www.w3.org/2000/svg", "text");

                const {placeholder, font, size, anchor} = content.text;
                
                this.content.setAttribute("font-family", font);
                this.content.setAttribute("font-size", size);
                this.content.setAttribute("text-anchor", anchor);
                this.content.style["dominant-baseline"] = "hanging"
                this.content.textContent = placeholder;

                this.container.append(this.content);
                break;
        }
    },
    
    focusIn(){

    },

    focusOut(){

    },

    /*clickHandler(){
        const { type, target, value } = this.schema.action;
        ActionHandler[type].call(this, target, value);
    }*/
}

export const SVGButton = Object.assign({},
    Algorithm,
    BaseSVGButton
)