import { Static } from "./static";

const { isNullOrUndefined, valOrDefault } = require("zenkai");

const BaseProjectionLinkSVGStatic = {
    /** @type {SVGElement} */
    element: null,
    /** @type {SVGElement} */
    content: null,

    /** @type {boolean} */
    focusable: null,
    /** @type {boolean} */
    displayed: null,

    /** @type {boolean} */
    /** TO DO: Unknown Property*/
    discardable: null,
    
    
    /** 
     * Creates the object from its schema
     * @returns An instance of ProjectionLink
    */
    init(args){
        Object.assign(this.schema, args);

        const { focusable = false, discardable = false } = this.schema;

        this.focusable = focusable;
        this.discardable = discardable;

        return this;
    },

    /** 
     * Creates the SVG elements and binds the events
     * @return An SVG element
    */
    render(){
        const { content, dimensions } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.tabIndex = -1;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-plink";
            this.element.dataset.ignore = "all";
        }

        if(!isNullOrUndefined(dimensions)) {
            const { width, height } = dimensions;
            this.element.setAttribute("width", width);
            this.element.setAttribute("height", height);            
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

    /**
     * Handles the focusin event
     * @returns this
     */
    focusIn(){
        console.warn(`FOCUSIN_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
    },

    /**
     * Handles the focusin event
     * @returns this
     */
    focusOut(){
        console.warn(`FOCUSOUT_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
    },

    /**
     * Handles the click event
     * Changes the view of the projection using the targeted tag
     * @returns false if the event is handled
     */
    clickHandler(){
        let index = this.projection.findView(this.schema.tag);

        if(index === -1){
            return false;
        }


        this.projection.changeView(index);

        return false;
    },


    /**
     * Adapts the projection to the DOM
     * @returns nothing
     */
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
        
        return;
    },

    /**
     * Creates the handlers for the projection
     * @returns nothing
     */
    bindEvent(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        })
        return;
    }
}

export const ProjectionLinkSVGStatic = Object.assign(
    Object.create(Static),
    BaseProjectionLinkSVGStatic
)