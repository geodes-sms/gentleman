import { Static } from "./static";

const { isNullOrUndefined, valOrDefault } = require("zenkai");

const BaseProjectionLinkSVGStatic = {
    init(args){
        Object.assign(this.schema, args);

        const { focusable = false, discardable = false } = this.schema;

        this.focusable = focusable;
        this.discardable = discardable;

        return this;
    },

    render(){
        const { content } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-plink";
            this.element.dataset.ignore = "all";
        }

        const parser = new DOMParser();

        this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;

        this.element.append(this.content);

        if(this.discardable){
            this.element.dataset.discard = "absolute";
        }

        this.bindEvent();

        return this.element;

    },

    focusIn(){

    },

    focusOut(){

    },

    clickHandler(){
        let index = this.projection.findView(this.schema.tag);

        if(index === -1){
            return false;
        }

        this.projection.changeView(index);

        return false;
    },

    display(){
        if(!this.parent.displayed){
            return;
        }

        if(this.displayed){
            return;
        }

        this.displayed = true;

        this.element.setAttribute("width", valOrDefault(Number(this.content.getAttribute("width"))), this.content.getBBox().width);
        this.element.setAttribute("height", valOrDefault(Number(this.content.getAttribute("height"))), this.content.getBBox().height);

        this.parent.updateSize();
    },

    bindEvent(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        })
    }
}

export const ProjectionLinkSVGStatic = Object.assign(
    Object.create(Static),
    BaseProjectionLinkSVGStatic
)