import { ContentHandler } from "./../content-handler";
import { DimensionHandler } from "./../dimension-handler";
import { MeetHandler, SizeHandler, SizeSchema } from "./../size-handler";
import { isEmpty, isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm"
import { OverlapManager } from "./overlap-manager";


const BaseAdaptiveAlgorithm = {
    init(args){
        Object.assign(this.schema, args);

        const {focusable = true, meet = false, overlap = false} = this.schema;

        if(overlap){
            this.overlap = overlap;
        }

        this.focusable = focusable;
        this.meet = meet;
        

        return this;
    },

    render(){
        const {background, coordinates, content = [], meet = false} = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "adaptive";
            this.container.dataset.id = this.id;
            this.container.id = this.id;
        }

        if(isNullOrUndefined(this.background) && background){
            const parser = new DOMParser();

            this.background = parser.parseFromString(background.content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            
            this.background.childNodes.forEach(child => {
                this.container.append(child);
            })

            this.container.setAttribute("width", this.background.getAttribute("width"));
            this.container.setAttribute("height", this.background.getAttribute("height"));

            this.width = Number(this.container.getAttribute("width"));
            this.height = Number(this.container.getAttribute("height"));

            this.wrap = background.wrap;
            this.padding = background.padding;
            this.speed = background.speed;
            this.strategy = background.strategy;
        }

        if(isNullOrUndefined(this.container.getAttribute("x")) && coordinates){
            const {x, y} = coordinates;

            this.container.setAttribute("x", x);
            this.container.setAttribute("y", y);
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

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }

        this.bindEvents();
        
        this.displayed = false;

        return this.container;
    },

    updateSize(){
        /*if(!isNullOrUndefined(this.overlap)){
            OverlapManager.call(this);
        }*/
        if(this.fixed){
            return;
        }

        if(!this.displayed){
            this.display();
        }

        if(isNullOrUndefined(this.content) || isEmpty(this.content)){
            return;
        }

        if(!isNullOrUndefined(this.overlap)){
            OverlapManager[this.overlap.orientation].call(this);
        }

        SizeHandler[this.adapter.tagName].call(this, this.adapter);

        this.source.notify("dimension.changed", this.id);

        if(!isNullOrUndefined(this.parent)){
            this.parent.updateSize();
        }
    },

    display(){

        if((!isNullOrUndefined(this.parent) && !this.parent.displayed) || !document.body.contains(this.container)){
            return;
        }

        if(this.displayed){
            return;
        }
        console.log(this.container);
        console.log(this.container.parentNode);

        this.displayed = true;

        let adapter = this.container.querySelector("[data-" + this.wrap + "]");

        this.adapter = SizeSchema[adapter.tagName].call(this, adapter);

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
            this.container.dataset.contentWidth = Number(this.container.getAttribute("width"));
            this.container.dataset.contentHeight = Number(this.container.getAttribute("height"));
        }

        this.fixed = false;

        if(this.meet){
            this.parent.source.register(this.projection);
        }

        this.updateSize();
    },

    focus(){
        if(!this.displayed){
            this.display();
        }
    },

    focusIn(){
        if(this.focusable){
            
        }
    },

    focusOut(){

    },

    clickHandler(target){

    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        });

        this.projection.registerHandler("binding", (schema) => {
            const {projection, id} = schema;
            if(this.id === id){
                let waiter;
                for(let i = 0; i < this.displayWaitings.length; i++){
                    if(this.displayWaitings[i].placeholder === projection.placeholder || this.displayWaitings[i].render === projection.placeholder){
                        waiter = this.displayWaitings[i];
                        break;                
                    }
                }
                
                waiter.placeholder = projection.placeholder;
                waiter.render = projection.element.container || projection.element.element;

                for(let i = 0; i < this.content.length; i++){
                    if(this.content[i].projection.placeholder === projection.placeholder){
                        this.content.splice(i, 1);
                        break;
                    }
                }

                if(this.displayed){
                    DimensionHandler.setDimensions(waiter.render, waiter.dimensions);
                    DimensionHandler.setPosition(waiter.render, waiter.position);  

                    this.content.push(projection.element);
                    projection.update("displayed");

                    this.updateSize();
                }

            }
        })

        if(this.meet){
            this.projection.registerHandler("dimension.changed", (id) => {
                if(id === this.parent.id){ MeetHandler[this.adapter.tagName].call(this, this.adapter)};
            })
        }
    }
}

export const AdaptiveAlgorithm = Object.assign({},
    Algorithm,
    BaseAdaptiveAlgorithm
)