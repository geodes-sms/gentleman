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


const BaseSVGChoice = {

    init(){
        this.width = 0;
        this.height = 0;

        this.items = new Map();

        return this;
    },

    render(){
        const { selection, dimensions, openSelection} = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "field",
            this.element.dataset.view = "svg-choice";
            
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.classList.add("field--svg_choice");
        }

        if(dimensions){
            this.element.setAttribute("width", dimensions.width);
            this.element.setAttribute("height", dimensions.height);
        }else{
            this.element.style.overflow = "visible";
        }

        this.candidates = this.source.getCandidates();

        if(isNullOrUndefined(this.selection)){
            this.createSelection(selection);
            this.element.append(this.selection);
        }

        if(openSelection && isNullOrUndefined(this.openSelection)){
            const parser = new DOMParser();
            this.openSelection = parser.parseFromString(openSelection.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.element.append(this.openSelection);
            this.openSelection.addEventListener("click", () => {
                this.element.append(this.selection);
            })
        }

        this.bindEvents();

        return this.element;
    },

    setValue(value){
        this.source.setValue(value);
    },


    createSelection(selection){
        const { item, breakPoint = false, direction, close} = selection;

        this.selection =  document.createElementNS("http://www.w3.org/2000/svg", "svg");

        let i = 0;


        this.candidates.forEach((value)  => {

            const isConcept = isObject(value);
            const {dimension, tag} = item;

            let {holder, foreign} = this.createChoiceContainer(dimension);

            this.items.set(value.id, holder);

            if(value.type === "meta-concept"){
                let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault (tag))[0];

                let type = choiceProjectionSchema.type;
                let schema = {
                    "type": type,
                    [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection,
                };

                let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });
                holder.dataset.type = "meta-concept";
                holder.dataset.value = value.name;
                render.style.position = "fixed";
                foreign.append(render);

            }else if (isConcept) {
                
                if (!this.model.hasProjectionSchema(value, tag)) {
                    return container;
                }
    
                let choiceProjection = this.model.createProjection(value, tag).init({ focusable: false });
                choiceProjection.readonly = true;
                choiceProjection.focusable = false;
                choiceProjection.parent = this.projection;

                foreign.append(choiceProjection.render());
                foreign.childNodes[0].style.position = "fixed";

                holder.dataset.type = "concept";
                holder.dataset.value = value.id;
            } else {
                foreign.append(value.toString());
            }

            switch(direction){
                case "horizontal":
                    if(breakPoint){
                        holder.setAttribute("y",  ~~(i / breakPoint) * dimension.height);
                        holder.setAttribute("x", (i % breakPoint) * dimension.width);
                        this.width = breakPoint * dimension.width;
                        this.height = (~~(i / breakPoint) + 1) * dimension.height;
                    }else{
                        holder.setAttribute("x", i  * dimension.width);
                        this.width = (i + 1) * dimension.width ;
                        this.height = dimension.height;
                    }
                    break;
                case "vertical":
                    if(breakPoint){
                        holder.setAttribute("x",  ~~(i/breakPoint) * dimension.width);
                        holder.setAttribute("y", (i % breakPoint) * dimension.height);
                    }else{
                        holder.setAttribute("y", i * dimension.height);
                    }
                    break;
            }
            this.bindEvent(holder);
            this.selection.append(holder);
            holder.style.border = "dotted black"
            i++;
        })

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
            this.setValue(getItemValue.call(this, choice));
            if(this.schema.selection.close){
                this.selection.remove();
                this.width = 0;
                this.height = 0;
                this.notifyDimObservers();
            }
        })
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            if(!this.displayed){
                this.displayed = true;
                this.items.forEach((value, key) => {

                    const element = value.childNodes[0].childNodes[0];

                    this.projection.resolveElement(element).projection.update("displayed");
                })
            }
        })

        this.projection.registerHandler("value.changed", () => {
            if(this.schema.selection.close){
                this.selection.remove();
                this.width = 0;
                this.height = 0;
                this.notifyDimObservers();
            }
        })
    },

    createChoiceContainer(dimension){
        const { width, height } = dimension;

        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        holder.setAttribute("width", width);
        holder.setAttribute("height", height);

        foreign.setAttribute("width", width);
        foreign.setAttribute("height", height);

        holder.append(foreign);

        return {holder: holder, foreign: foreign};
    },
    
    focusIn(){

    },

    focusOut(){
        
    }
}

export const SVGChoice = Object.assign(
    Object.create(Field),
    BaseSVGChoice
);