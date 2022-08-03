import { ContentHandler } from "./../content-handler.js";
import { createDocFragment, isHTMLElement, isNullOrUndefined, createDiv, valOrDefault } from "zenkai";
import { Layout } from "./layout.js";

const BasePatternLayout = {

    init(){

        this.startingPoint = valOrDefault(this.schema.startingPoint, {x: 129, y: 190});
        this.next = valOrDefault(this.schema.next, {x: 0, y : 40});
        this.items = new Map();
        this.places = new Map();
        this.color = "#d5d5d5";

        return this;
    },

    render(){
        const {base, attributes = [], anchor = "top", width = 400, height = 400, baseX, baseY, baseRatio = 0.2} = this.schema;

        const fragment = createDocFragment();

        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: [],
                dataset:{
                    nature: "layout",
                    view: "pattern",
                    id: this.id
                }
            });
        }
        
        if(isNullOrUndefined(this.svgArea)){
            this.svgArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.templateArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.itemsArea = document.createElementNS("http://www.w3.org/2000/svg", "g");

            this.svgArea.appendChild(this.templateArea);
            this.svgArea.appendChild(this.itemsArea);

            fragment.appendChild(this.svgArea);
        }

        if(!isHTMLElement(this.base)){
            this.base = ContentHandler.call(this, base.pattern);
            this.baseHolder = this.createHolder(this.base);

            this.baseHolder.setAttribute("x", 0);
            this.baseHolder.setAttribute("y", 0);

            this.svgArea.prepend(this.baseHolder);
        }

        if(isNullOrUndefined(this.buttons)){
            this.buttons = new Map();

            this.button = ContentHandler.call(this, attributes[0].attribute);

            let buttonHolder = this.createHolder(this.button);
            buttonHolder.setAttribute("x", this.startingPoint.x);
            buttonHolder.setAttribute("y", this.startingPoint.y);
            buttonHolder.dataset["x"] = this.startingPoint.x;
            buttonHolder.dataset["y"] = this.startingPoint.y;

            this.places.set("x" + this.startingPoint.x + "y" + this.startingPoint.y, buttonHolder);

            this.button.parentNode.style.background = "white";

            this.buttons.set(this.button, buttonHolder);

            this.itemsArea.appendChild(buttonHolder);

        }

        if(fragment.hasChildNodes()){
            this.element.append(fragment);
        }

        this.bindEvents();

        return this.element;
    },

    createHolder(element, color){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        holder.appendChild(foreign);
        foreign.appendChild(element);

        if(!isNullOrUndefined(color)){
            foreign.style.background = this.color;
        }

        return holder;
    },

    adapt(svg){
        this.adaptForeign(svg.parentNode, svg);
        return this.adaptSVG(svg.parentNode.parentNode, svg.parentNode);
    },

    adaptForeign(container, element){
        element.style.width = "fit-content";

        let rect = element.getBoundingClientRect();

        container.setAttribute("width", rect.width);
        container.setAttribute("height", rect.height);
    },
    
    adaptSVG(container, element){
        let w = Number(element.getAttribute("width"));
        let h = Number(element.getAttribute("height"));

        container.setAttribute("width", w);
        container.setAttribute("height", h);
        container.setAttribute("viewBox", "0 0 " + w + " " + h);

        return {w, h};
    },

    upSize(w, h){

        if(isNullOrUndefined(this.svgArea.getAttribute("width"))){
            this.svgArea.setAttribute("width", w);
            this.svgArea.setAttribute("height", h); 
        }

        let svgW = Number(this.svgArea.getAttribute("width"));
        let svgH = Number(this.svgArea.getAttribute("height"));

        if(svgW < w || svgH < h){

            const template = ContentHandler.call(this, {type: "g-fragment", name: name});

            let holder = this.createHolder(template, this.color);

            this.svgArea.prepend(holder);

            this.adapt(template);

            if(isNullOrUndefined(this.last)){
                this.last = this.svgArea;
            }

            this.addTemplate(holder);

            this.last = holder;
        }
    },

    bindEvents(){
        this.projection.registerHandler("displayed", (value) =>{
            const schemaBase = this.adapt(this.base);
            this.upSize(schemaBase.w, schemaBase.h);

            const schemaButton = this.adapt(this.button);
            this.center(schemaButton, this.buttons.get(this.button));
        });

    },

    createItem(object, button){
        const n = button.item;

        /*PRETEND RATIO 0.1*/

        if(!this.model.hasProjectionSchema(object, n.tag)){
            return "";
        }

        let itemProjection = this.model.createProjection(object);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        let container = itemProjection.init().render();

        return container;
    },

    addTemplate(template){
        let x = (Number(this.last.getAttribute("width")) / 2 + Number(this.last.getAttribute("x"))) - (template.getAttribute("width") / 2);
        let y = Number(this.last.getAttribute("height")) + Number(this.last.getAttribute("y"));

        template.setAttribute("x", x);
        template.setAttribute("y", y);

        let newH = Number(this.svgArea.getAttribute("height")) + Number(template.getAttribute("height"));
        this.svgArea.setAttribute("height", newH);
    },

    addItem(value, button){
        if(!isNullOrUndefined(this.items.get(value.id)) || this.prio != button.element){
            return;
        }
        let buttonHolder = this.buttons.get(button.element);
        let item = this.createItem(value, button);

        let holder = this.createHolder(item, this.color);
        this.items.set(value.id, holder);
        this.itemsArea.appendChild(holder);

        let schema = this.adapt(item);
        
        this.placeItem(holder, buttonHolder);
        this.center(schema, holder);
        
        this.placeButton(buttonHolder, button.element);
    },

    placeItem(item, buttonHolder){
        let x = Number(buttonHolder.getAttribute("x"));
        let y = Number(buttonHolder.getAttribute("y"));

        item.setAttribute("x", x);
        item.setAttribute("y", y);

        let dataX = Number(buttonHolder.dataset["x"]);
        let dataY = Number(buttonHolder.dataset["y"]);
        item.dataset["x"] = dataX;
        item.dataset["y"] = dataY;

        this.places.set("x" + dataX + "y" + dataY, item);
    },

    center(schema, button){
        button.setAttribute("x", Number(button.dataset["x"]) - schema.w / 2);
    },

    placeButton(button, key){
        let x = Number(button.getAttribute("x")) + this.next.x;
        let dataX = Number(button.dataset["x"]) + this.next.x;

        let y = Number(button.getAttribute("y")) + this.next.y;
        let dataY = Number(button.dataset["y"]) + this.next.y;

        if(isNullOrUndefined(this.places.get("x" + dataX + "y" + dataY))){
            button.setAttribute("x", x );
            button.dataset["x"] = dataX;
    
            button.setAttribute("y", y );
            button.dataset["y"] = dataY;
    
            this.places.set("x" + dataX + "y" +dataY, button);

            this.upSize(x + Number(button.getAttribute("width")), y + Number(button.getAttribute("height")));
        }else{
            button.remove();
            this.buttons.delete(key);
        }        
    },

    removeItem(value){
        let item = this.items.get(value.id);
        
        if(!isNullOrUndefined(item)){
            this.createNewButton(item);

            item.remove();
    
            this.items.delete(value.id);
        }

    },

    createNewButton(item){

        let x = Number(item.dataset["x"]);
        let y = Number(item.dataset["y"]);

        let button = ContentHandler.call(this, this.schema.attributes[0].attribute);

        this.createHolder(button);

        let buttonHolder = this.createHolder(button);
        buttonHolder.setAttribute("x", x);
        buttonHolder.setAttribute("y", y);
        buttonHolder.dataset["x"] = x;
        buttonHolder.dataset["y"] = y;

        this.places.set("x" + this.startingPoint.x + "y" + this.startingPoint.y, buttonHolder);

        button.parentNode.style.background = "white";

        this.itemsArea.appendChild(buttonHolder);
        const schema = this.adapt(button);
        this.center(schema, buttonHolder);
        
        this.buttons.set(button, buttonHolder);
    }
};

export const PatternLayout = Object.assign({},
    Layout,
    BasePatternLayout
);