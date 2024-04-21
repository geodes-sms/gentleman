import { ContentHandler } from "./../content-handler";
import { Algorithm } from "./algorithm";
import { DimensionHandler } from "./../dimension-handler";
import { SizeHandler, MeetHandler } from "./../size-handler";
import { getFirstGraphical } from "@utils/index.js";
const { isNullOrUndefined, isEmpty } = require("zenkai");

const BaseWrapAlgorithm = {
    init(args){
        Object.assign(this.schema, args);

        const {focusable = true, speed = 1, meet = false} = this.schema;

        this.speed = speed;
        this.focusable = focusable;
        this.adapter = { tagName: "wrap" };
        this.meet = meet;

        return this;
    },

    render(){
        const {content} = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("agorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "wrap";
            this.container.dataset.id = this.id;
            this.container.id = this.id;
        }

        if(isNullOrUndefined(this.content) && !isEmpty(content)){
            this.content = [];
            this.displayWaitings = [];

            content.forEach(element => {
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

                this.container.append(dimensions.await ? dimensions.holder : render);
            })
        }

        if(this.focusable){
            this.container.tabIndex = 0;
        }else{
            this.container.dataset.ignore = "all";
        }

        this.bindEvents();

        this.displayed = false;

        return this.container;
    },

    focus(){
        if(!this.displayed){
            this.display();
        }

        this.container.focus();
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

    display(){
        if(!isNullOrUndefined(this.parent) && !this.parent.displayed){
            return;
        }

        if(this.displayed || !document.getElementById(this.id)){
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
        }

        this.fixed = false;

        if(this.meet){
            this.parent.source.register(this.projection);
        }
        
        this.updateSize();
    },

    updateContent(conceptId, projection) {
        for(let i = 0; i < this.content.length; i++) {
            if(this.content[i].source.id === conceptId) {
                this.content[i] = projection;
                return;
            }   
        }
        this.content.push(projection);
    },

    updateSize(){
        if(this.fixed){
            return;
        }

        if(!this.displayed){
            this.display();
        }
        if(isNullOrUndefined(this.content) || isEmpty(this.content)){
            this.containerView = {
                targetW: 0,
                targetH: 0,
                targetX: 0,
                targetY: 0,
                x: 0,
                y: 0,
                w: 0,
                h: 0
            }
            return;
        }
        
        SizeHandler["wrap"].call(this);

        if(!isNullOrUndefined(this.parent)){
            this.parent.updateSize();
        }

        this.content.forEach( (item) => {
            item.meetSize();
        })
    },

    enterHandler(target) {
        if(isNullOrUndefined(this.content) || isEmpty(this.content)) {
            return;
        }

        let focusableElement = getFirstGraphical(this.content, this.containerView.targetX, this.containerView.targetY);

        if(isNullOrUndefined(focusableElement)) {
            return;
        }

        let child = this.projection.resolveElement(focusableElement);

        if(isNullOrUndefined(child)) {
            return;
        }
        console.log(child);

        child.focus();



        return true;
    },

    /**
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target element
     */
    arrowHandler(dir, target) {
        if(target === this.container) {
            if(isNullOrUndefined(this.parent)) {
                return;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let closestElement = getClosestSVG(target, dir, this.content);

        if(isNullOrUndefined(closestElement)) {
            if(isNullOrUndefined(this.parent) || this.parent.object !== "algorithm") {
                return false;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let element = this.projection.resolveElement(closestElement);
        console.log("Arrow");
        console.log(element);
        if(element) {
            element.focus();
        }

        return true;

    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        });
    },
}

export const WrapAlgorithm = Object.assign({},
    Algorithm,
    BaseWrapAlgorithm
)
