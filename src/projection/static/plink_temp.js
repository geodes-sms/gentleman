import { ContentHandler } from "../content-handler";
import { Static } from "./static";
import { DimensionHandler } from "../dimension-handler";
import { SizeHandler } from "../size-handler";

const { isNullOrUndefined, isEmpty } = require("zenkai");

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
        const { content } = this.schema;

        if(isNullOrUndefined(this.element)) {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.tabIndex = -1;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-link";
            this.element.dataset.ignore = "all";
        }

        if(isNullOrUndefined(this.content) && !isEmpty(content)) {
            this.content = [];
            this.displayWaitings = [];

            content.forEach( (element) => {
                let render = ContentHandler.call(this, element.render);
                let projection = this.projection.resolveElement(render);

                let dimensions = DimensionHandler.analyseDim(element);
                let position = DimensionHandler.analysePos(element);

                this.displayWaitings.push({
                        render: render,
                        dimensions: dimensions,
                        position: position,
                        placeholder: isNullOrUndefined(projection) ? null : projection.projection.placeholder
                });

                this.element.append(dimensions.await ? dimensions.holder : render);
            });
        }

        this.bindEvents();

        this.displayed = false;

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
     * Updates the size of the projection
     * @returns nothing
     */
    updateSize() {
        if(this.fixed) {
            return;
        }

        if(!this.displayed) {
            this.display();
            return;
        }

        SizeHandler["wrap"].call(this);

        this.parent.updateSize();
    },


    /**
     * Adapts the projection to the DOM
     * @returns nothing
     */
    display(){
        if(!this.parent.displayed) {
            return;
        }

        if(this.displayed) {
            return;
        }

        this.displayed = true;

        if(!isNullOrUndefined(this.displayWaitings)){
            this.fixed = true;
            this.displayWaitings.forEach(element => {
                DimensionHandler.setDimensions(element.render, element.dimensions);
                DimensionHandler.setPosition(element.render, element.position);
               

                let projection = this.projection.resolveElement(element.render);

                if(!isNullOrUndefined(projection)){    
                    this.content.push(projection);
                    projection.projection.update("displayed");
                }
            })
        }else{
            this.element.dataset.contentWidth = 0;
            this.element.dataset.contentHeight = 0;
        }

        this.fixed = false;

        this.updateSize();
    },

    /**
     * Creates the handlers for the projection
     * @returns nothing
     */
    bindEvents(){
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