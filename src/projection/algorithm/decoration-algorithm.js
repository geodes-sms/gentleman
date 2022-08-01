import { ContentHandler } from "./../content-handler.js";
import { Algorithm } from "./algorithm.js";
import { DimensionHandler } from "./dimension-handler.js";

const { isHTMLElement, createDiv, isNullOrUndefined, createDocFragment, isEmpty, isNull, valOrDefault, isUndefined } = require("zenkai");


const BaseDecorationAlgorithm = {
    init(){    
        return this;
    },

    render(){
        const { content = [], coordinates = false, background, data = false, reference = false, dimensions = false, style, rmv = false} = this.schema;

        const fragment = createDocFragment();

        const parser = new DOMParser();

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            if(background){
                this.background = parser.parseFromString(background.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                this.container.append(this.background);

                this.container.setAttribute("width", this.background.getAttribute("width"));
                
                this.container.setAttribute("height", this.background.getAttribute("height"));
                this.width = Number(this.background.getAttribute("width"));
                this.height = Number(this.background.getAttribute("height"));
                this.fixed = true;
            }

            if(dimensions){
                const { width, height, viewBox = false} = dimensions;

                this.container.setAttribute("width", width);
                this.container.setAttribute("height",height);
                this.width = dimensions.width;
                this.height = dimensions.height;
                this.fixed = true;

                if(viewBox){
                    this.container.setAttribute("viewBox",
                        viewBox.minX + " " + viewBox.minY + " " + viewBox.width + " " + viewBox.height
                    );
                }
            }

            if(!background && !dimensions){
                this.container.style.overflow = "visible";
            }

            if(coordinates){
                const {x, y} = coordinates;

                this.container.setAttribute("x", x);
                this.container.setAttribute("y", y);
            }

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "decoration";
            this.container.dataset.id = this.id;

            if(reference){
                this.container.dataset.reference = true;
            }
        }

        if(data){
            this.container.setAttribute("data-shape", data);
        }

        if(isNullOrUndefined(this.content) && !isEmpty(content)){
            this.waiting = [];
            this.positioning = [];
            this.itemsPos = new Map();
            this.itemsDim = new Map();
            this.content = [];

            content.forEach(element => {
                
                let render = ContentHandler.call(this, element.render);

                let schemaDim = DimensionHandler.analyseDim(render, element);

                this.itemsDim.set(render.dataset.id, schemaDim);

                let resolved = this.projection.resolveElement(render)

                if(isNullOrUndefined(resolved)){
                    this.waitingRendered = true;
                }else{
                    this.content.push(resolved);
                }
               
                if(schemaDim.await){
                    this.waiting.push(render.dataset.id);
                }

                let schemaPos = DimensionHandler.analysePos(render, element);

                this.itemsPos.set(render.dataset.id, schemaPos);

                if(schemaPos.await){
                    this.positioning.push(schemaPos);
                }
                if(isNullOrUndefined(schemaDim.holder)){
                    this.container.append(schemaDim.item)
                }else{
                    this.container.append(schemaDim.holder);
                }
            }); 
        }

        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        if(style){
            this.container.style = style;
        }

        this.displayed = false;

        this.bindEvents();

        return this.container;
    },

    focus(element){
        this.container.focus();

    },

    focusIn() {
        if(!isNullOrUndefined(this.deleteElem) && this.deleteElem.dataset.focusable){
            this.container.append(this.deleteElem);
        }

        if(!isNullOrUndefined(this.focusedElement)){
            this.focusedElement.forEach((e) => {
                this.container.append(e);
            })
        }

        this.content.forEach(c => {
            c.focusIn();
        })

        this.focused = true;
        this.container.classList.add("active");
        this.container.classList.add("focus");

        return this;
    },
    focusOut() {
        if(!isNullOrUndefined(this.deleteElem) && this.deleteElem.dataset.focusable){
            this.deleteElem.remove();
        }

        if(!isNullOrUndefined(this.focusedElement)){
            this.focusedElement.forEach((e) => {
                e.remove();
            })
        }  

        if(!isNullOrUndefined(this.content)){
            this.content.forEach(c => {
                c.focusOut();
            })
        }

        this.container.classList.remove("active");
        this.container.classList.remove("focus");

        this.focused = false;

        return this;
    },

    notify(element){
        this.updateContentDim(element.id);
    },

    augment(){
        let target = this.container.querySelector("[data-augment]");

        target.setAttribute("height", Number(target.getAttribute("height")) + 30);

        if(!isNullOrUndefined(this.container.getAttribute("height"))){
            this.container.setAttribute("height", Number(this.container.getAttribute("height")) + 30);
        }

        if(!isNull(this.background)){
            this.background.setAttribute("height", Number(this.background.getAttribute("height")) + 30);
        }

    },

    updateContentDim(id){
        let schemaDim = this.itemsDim.get(id);
        let schemaPos = this.itemsPos.get(id);

        if(schemaDim.type === "ratio"){
            DimensionHandler.adaptRatio(schemaDim.item, schemaDim.ratio);
            DimensionHandler.positionElement(schemaPos, schemaDim.holder);
        }
    },

    accept(element, dimension, coordinates){
        let schemaDim = DimensionHandler.analyseDim(element, {dimension: dimension});
        let schemaPos = DimensionHandler.analysePos(element, {coordinates: coordinates});

        if(isNullOrUndefined(this.itemsDim)){
            this.itemsDim = new Map();
        }
        this.itemsDim.set(element.dataset.id, schemaDim);

        if(isNullOrUndefined(this.itemsPos)){
            this.itemsPos = new Map();
        }
        this.itemsPos.set(element.dataset.id, schemaPos);

        if(!this.displayed){
            if(isNullOrUndefined(this.content)){
                this.content = [];
                this.waiting = [];
                this.positioning = [];
            }

            this.content.push(this.projection.resolveElement(element));
        
            if(schemaDim.await){
                this.waiting.push(element.dataset.id);
            }
            if(schemaPos.await){
                this.positioning.push(schemaPos);
            }    
        }else{
            DimensionHandler.setDimensions(schemaDim);
            DimensionHandler.positionElement(schemaPos, element);
        }
    
        if(isNullOrUndefined(schemaDim.holder)){
            this.container.append(schemaDim.item)
        }else{
            this.container.append(schemaDim.holder);
        }
    },

    analyseContentDim(){
        if(this.fixed){
            return;
        }

        let index = 0;

        if(this.content.length === 0){
            return;
        }

        while(index < this.content.length && isNullOrUndefined(this.content[index])){
            index++;
        }

        if(index > this.content.length){
            return;
        }

        let dimSchema = this.itemsDim.get(this.content[index].id);

        if(dimSchema.type === "pure"){
            let xB, yB, wB, hB;
            if(isNullOrUndefined(this.content[index].container)){
                xB = Number(this.content[index].element.getAttribute("x"));
                yB = Number(this.content[index].element.getAttribute("y"));
                wB = Number(this.content[index].width);
                hB = Number(this.content[index].height);
            }else{
                xB = Number(this.content[index].container.getAttribute("x"));
                yB = Number(this.content[index].container.getAttribute("y"));
                wB = Number(this.content[index].width);
                hB = Number(this.content[index].height);
            }
            this.width = xB + wB;
            this.height = yB + hB;
        }

        
        for(let i = index + 1; i < this.content.length; i++){
            
            if(!isNullOrUndefined(this.content[i])){
                dimSchema = this.itemsDim.get(this.content[i].id);
                
                if(dimSchema.type === "pure"){
                    let x, y, w, h;
                    if(isNullOrUndefined(this.content[i].container)){
                        x = Number(this.content[i].element.getAttribute("x"));
                        y = Number(this.content[i].element.getAttribute("y"));
                        w = Number(this.content[i].width);
                        h = Number(this.content[i].height);
                    }else{
                        x = Number(this.content[i].container.getAttribute("x"));
                        y = Number(this.content[i].container.getAttribute("y"));
                        w = Number(this.content[i].width);
                        h = Number(this.content[i].height);
                    }
                    if(isNullOrUndefined(this.width) ||  (this.width < x + w)){
                        this.width = x + w;
                    }
                    if(isNullOrUndefined(this.height) ||  (this.height < y + h)){
                        this.height = y + h;
                    }
                }

            }
        }


        this.notifyDimObservers();
    },

    notifyDim(w, h, container){
        if(this.fixed){
            return;
        }
        this.analyseContentDim();

        let x = Number(container.getAttribute("x"));
        let y = Number(container.getAttribute("y"));
        
        
        if(isNullOrUndefined(this.width) ||  (this.width < x + w)){
            this.width = x + w;
        }
        if(isNullOrUndefined(this.height) ||  (this.height < y + h)){
            this.height = y + h;
        }

    },

    clickHandler(target){
        if(this.container.contains(target)){
            while((target !== this.container) && isNullOrUndefined(target.dataset.nature)){
                target = target.parentNode;
            }
            
            if(target !== this.container){
               
                this.projection.resolveElement(target).clickHandler(target);
            }
        }
        return false;
    },

    bindEvents(){
        if(!isNullOrUndefined(this.content)){
            this.content.forEach((c) => {
                if(!isNullOrUndefined(c) && c.object !== "static" && c.object !== "simulation"){
                    c.registerDimensionsObserver(this);
                }
            })
        }

        this.projection.registerHandler("displayed", (id) => {

            if(!this.displayed){
                this.displayed = true;
                if(!isNullOrUndefined(this.waiting)){
                    this.waiting.forEach((id) => {
                        DimensionHandler.setDimensions(this.itemsDim.get(id));
                    })
                }
                if(!isNullOrUndefined(this.positioning)){
                    this.positioning.forEach((p) => {
                        let schema = this.itemsDim.get(p.render.dataset.id);
                        if(schema.holder){
                            DimensionHandler.positionElement(p, schema.holder);
                        }else{
                            DimensionHandler.positionElement(p, p.render);
                        }
                        
                    })
                }
                if(!isNullOrUndefined(this.content)){
                    this.content.forEach((c) => {
                        if(!isNullOrUndefined(c)){
                            c.projection.update("displayed", c.id);
                        }
                    })
                }

                if(isNullOrUndefined(this.width)){
                    this.analyseContentDim();
                }

                if(!isNullOrUndefined(this.parent) && !isHTMLElement(this.parent.element) && !isHTMLElement(this.parent.container)){
                    this.parent.notifyDim(this.width, this.height, this.container);
                }
            }
        })

        if(this.waitingRendered){
            this.projection.registerHandler("binding", (element) => {

                this.itemsDim.set(element.dataset.id, {await: false, item: element, type: "pure"})                

                this.content.push(this.projection.resolveElement(element));
    
                this.analyseContentDim();
            })
        }       
    }
}

export const DecorationAlgorithm = Object.assign({},
    Algorithm,
    BaseDecorationAlgorithm
);