import { ContentHandler } from "../content-handler.js";
import { Layout } from "./layout.js";

const { createDocFragment, isNullOrUndefined, isEmpty, isHTMLElement } = require("zenkai");


const BaseHolder = {
    init(){
        const { coordinates = null, dimensions = null } = this.schema;


        this.coordinates = coordinates;
        this.dimensions = dimensions;

        return this;
    },

    render(){
        
        const { content } = this.schema;

        const fragment = createDocFragment();

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("layout-container");
            this.container.dataset.nature = "layout";
            this.container.dataset.layout = "holder";
            this.container.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.foreign)){
            this.foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

            fragment.append(this.foreign);
        }

        if(isNullOrUndefined(this.content) && !isEmpty(content)){
            this.content = new Map();
            content.forEach(element => {
                switch(element.type){
                    case "projection":
                        let render = this.projection.model.createProjection(this.projection.concept.getValue(true), element.tag).init().render();

                        let projection = this.projection.resolveElement(render);

                        this.element = render;

                        this.foreign.append(render);

                        this.content.set(element.correspondance, {render: render, projection: projection});
                        break;

                    case "attribute":
                        this.container.append(ContentHandler.call(this, element));
                        break;
                }
            })
                
        }

        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        this.bindEvents();

        return this.container;
    },

    registerRelative(dimensions){
        this.apply = dimensions.apply;

        this.relative = true;

        switch(dimensions.listen.type){
            case "duo":
                this.from = this.source.getValue(true).getAttributeByName(dimensions.listen.from).target;
                this.from.register(this.projection);

                this.to = this.source.getValue(true).getAttributeByName(dimensions.listen.to).target;
                this.to.register(this.projection);

                this.rtag = this.environment.getActiveReceiver(dimensions.rtag);

                break;
        }
    },

    adapt(){
        /*
        if(isHTMLElement(this.element)){
            this.element.style.width = "fit-content";
        }
        const rect = this.element.getBoundingClientRect();

        this.foreign.setAttribute("width", rect.width);
        this.foreign.setAttribute("height", rect.height);

        this.container.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height)

        this.width = rect.width;
        this.height = rect.height;
        */
    },

    getDimensions(){
        return {
            width: this.dimensions.width,
            height: this.dimensions.height
        }
    },

    placeItem(item){
        switch(this.coordinates.type){
            case "delegate":
                this.container.setAttribute("x", item.schema.coordinates.x);
                this.container.setAttribute("y", item.schema.coordinates.y);
                break;
        }
    },

    setDimensions(){
        if(this.relative){

            let from = this.rtag.container.querySelector('[data-concept="' + this.from.value + '"]');
            let to = this.rtag.container.querySelector('[data-concept="' + this.to.value + '"]');

            let pt = this.rtag.container.createSVGPoint();

            let box = from.getBoundingClientRect();

            pt.x = box.x;
            pt.y = box.y;

            let ptFrom = pt.matrixTransform(this.rtag.container.getScreenCTM().inverse());

            box = to.getBoundingClientRect();

            pt.x = box.x;
            pt.y = box.y;

            let ptTo = pt.matrixTransform(this.rtag.container.getScreenCTM().inverse());

            let dx = (ptFrom.x - ptTo.x);
            let dy = (ptFrom.y - ptTo.y);

            let dr = Math.sqrt(dx * dx + dy + dy);

            this.width = dr;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", 30);
            this.foreign.setAttribute("width", this.width);
            this.foreign.setAttribute("height", 30);
            this.container.setAttribute("x", ptFrom.x);
            this.container.setAttribute("y", ptFrom.y)

            this.projection.resolveElement(this.element).setDimensions(this.width);
            
            

        }else{
            this.adapt();
            this.parent.notify(this.container);
        }
    },

    setHolder(width, height){
        this.container.setAttribute("width", width);
        if(!isNullOrUndefined(height)){
            this.container.setAttribute("height", height);
            return;
        }

        this.container.setAttribute("height", width * this.height / this.width);
    },

    bindEvents(){
        this.projection.registerHandler("value.changed", (value) => {
            /*if(!isNullOrUndefined(this.from) && (!isNullOrUndefined(this.from.value) && !isNullOrUndefined(this.to.value))){
                this.setDimensions(true);
            }else{
                if(isNullOrUndefined(this.rtag)){
                    this.element.remove();
                    let { render, projection } = this.content.get(this.source.value);
                    this.element = render;
                    this.foreign.append(this.element);
                    this.setDimensions();
        
                    if(this.coordinates){
                        this.placeItem(projection);
                    }
                }
            }*/
                        
        });

        this.projection.registerHandler("displayed", (id) => {
            let { render, projection } = this.content.get(this.source.value);
            this.element = render;
            this.foreign.append(this.element);
            this.setDimensions();

            if(this.coordinates){
                this.placeItem(projection);
            }
        })
    }
}

export const Holder = Object.assign(
    Object.create(Layout),
    BaseHolder)