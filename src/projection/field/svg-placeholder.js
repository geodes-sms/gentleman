import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";
import { DimensionHandler } from "./../algorithm/dimension-handler";

const { createDocFragment, isNullOrUndefined, createI, createArticle, findAncestor, removeChildren, windowWidth, isObject, valOrDefault } = require("zenkai");

function getItemValue(item) {
    const { type, value } = item.dataset;

    if (type === "concept") {
        return this.candidates.find(val => val.id === value).id;
    }

    if (type === "meta-concept") {
        return this.candidates.find(val => val.name === value).name;
    }

    if (type === "value") {
        return value;
    }

    if (type === "placeholder") {
        return null;
    }

    return value;
}


const BaseSVGPlaceholder = {

    init(){
        this.width = 0;
        this.height = 0;

        this.items = new Map();

        return this;
    },

    render(){
        const { selection, dimensions, open, overflow = false} = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "field",
            this.element.dataset.view = "svg-placeholder";
            
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.classList.add("field--svg_choice");
        }

        if(overflow){
            this.element.style.overflow = "visible";
        }

        if(dimensions){
            this.element.setAttribute("width", dimensions.width);
            this.element.setAttribute("height", dimensions.height);
        }

        if(isNullOrUndefined(this.openBack)){
            const {render, coordinates, dimensions } = open;

            console.log("rendering open-back");
            console.log(open);
            this.openBack = ContentHandler.call(this, Object.assign(render,
                {
                    action:{
                        type: "OPEN",
                        target: this
                    }
                }
                ));

            this.openBack.setAttribute("x", valOrDefault(coordinates.x, 0));
            this.openBack.setAttribute("y", valOrDefault(coordinates.y, 0));
        }

        this.candidates = this.source.getCandidates();

        if(isNullOrUndefined(this.selection)){
            this.createSelection(selection);
            this.element.append(this.selection);
        }

        if(isNullOrUndefined(this.source.value)){
            this.opened = true;
        }else{
            this.opened = false;
            this.element.append(this.openBack);
        }

        return this.element;
    },

    clickHandler(target){
    },

    setValue(value){
        this.source.setValue(value);
        this.element.append(this.openBack);
        this.opened = false;
    },

    open(){
        this.opened = true;
        this.element.append(this.selection);
        this.openBack.remove();
        this.source.removeValue();
    },

    createSelection(selection){
        const { item, breakPoint = false, direction, close} = selection;

     

        this.selection =  document.createElementNS("http://www.w3.org/2000/svg", "svg");

        this.candidates.forEach((value)  => {

            const isConcept = isObject(value);
            const {tag} = item;



            if(value.type === "meta-concept"){
                let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault (tag))[0];

                let type = choiceProjectionSchema.type;
                let schema = {
                    "type": type,
                    [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection,
                };

                let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });
                render.dataset.type = "meta-concept";
                render.dataset.value = value.name;

                const choiceSchemaCoords = this.projection.resolveElement(render).schema.coordinates;

                render.setAttribute("x", choiceSchemaCoords.x);
                render.setAttribute("y", choiceSchemaCoords.y);

                this.bindEvent(render);
                this.selection.append(render);

                this.items.set(value.id, render);

            }else if (isConcept) {
                if (!this.model.hasProjectionSchema(value, tag)) {
                    return container;
                }
    
                let choiceProjection = this.model.createProjection(value, tag).init({ focusable: false });
                choiceProjection.readonly = true;
                choiceProjection.focusable = false;
                choiceProjection.parent = this.projection;
    
                let choiceProj = choiceProjection.render();


                const choiceCoords = choiceProjection.element.schema.coordinates;

                choiceProj.setAttribute("x", choiceCoords.x);
                choiceProj.setAttribute("y", choiceCoords.y);

                this.bindEvent(choiceProj);
                this.selection.append(choiceProj);

                this.items.set(value.id, choiceProj);

            }

        })

    },

    focusIn(){
        if(!this.opened){
            this.element.append(this.openBack)
        }
    },

    focusOut(){
        if(!this.opened){
            this.openBack.remove();
        }
    },

    registerDimensionsObserver(o){
        if(isNullOrUndefined(this.observers)){
            this.observers = []
        }
        this.observers.push(o);
    },

    notifyDimObservers(){
        if(isNullOrUndefined(this.observers)){
            return;
        }

        this.observers.forEach(o => {
            o.analyseContentDim();
        })
    },

    bindEvent(choice){
        choice.addEventListener("click", () => {
            const value = getItemValue.call(this, choice);
            
            this.setValue(value);
           
            this.selection.remove();
            this.element.append(this.openBack);
        })
    }
    
}

export const SVGPlaceholder = Object.assign(
    Object.create(Field),
    BaseSVGPlaceholder
);