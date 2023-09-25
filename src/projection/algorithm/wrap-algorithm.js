import { ContentHandler } from "./../content-handler";
import { Algorithm } from "./algorithm";
import { DimensionHandler } from "./../dimension-handler";
import { SizeHandler } from "./../size-handler";
const { isNullOrUndefined, isEmpty } = require("zenkai");

const BaseWrapAlgorithm = {
    init(args){
        Object.assign(this.schema, args);

        const {focusable = true, speed = 1} = this.schema;

        this.speed = speed;
        this.focusable = focusable;

        return this;
    },

    render(){
        const {content} = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("agorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.view = "wrap";
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

    display(){

        if(!isNullOrUndefined(this.parent) && !this.parent.displayed){
            return;
        }

        if(this.displayed){
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
        this.updateSize();
    },

    updateSize(){
        console.log("wrapping update");

        if(this.fixed){
            return;
        }

        if(!this.displayed){
            this.display();
        }

        console.log("Content?");
        console.log(this.content);
        if(isNullOrUndefined(this.content) || isEmpty(this.content)){
            this.containerView = {
                targetW: 0,
                targetH: 0
            }
            return;
        }

        SizeHandler["wrap"].call(this);

        if(!isNullOrUndefined(this.parent)){
            this.parent.updateSize();
        }
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        });
    },
}

export const WrapAlgoritm = Object.assign({},
    Object.create(Algorithm),
    BaseWrapAlgorithm
)
