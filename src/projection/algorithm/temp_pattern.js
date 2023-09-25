import { isEmpty, isNullOrUndefined, valOrDefault } from "zenkai";
import { Algorithm } from "./algorithm"

export const BasePatternAlgorithm = {
    initAnchors(){
        const { first, next } = this.schema.anchor;

        this.anchors = {
            current : {
                x: first.x,
                y: first.y
            },
            x: next.x,
            y: next.y
        }
    },

    init(args){
        Object.assign(this.schema, args);

        const { focusable = true } = this.schema;
        const { padding = 0 } = this.schema.list.option;

        this.focusable = focusable;

        this.initAnchors();

        this.items = new Map();
        this.content = [];
        this.padding = padding;

        return this;
    },

    render(){
        const { } = this.schema;
        
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";

            this.container.dataset.algorithm = "pattern";
            this.container.dataset.id = this.id;
            this.container.id = this.id;
        }


        this.source.getValue().forEach((value) => {
            var item = this.createItem(value);
            this.container.append(item);
        })

        this.displayed = false;

        this.bindEvents();

        return this.container;
    },

    createItem(value){
        const { template = {} } = this.schema.list.item;

        if(!this.model.hasProjectionSchema(value, template.tag)){
            return "";
        }

        let itemProjection = this.model.createProjection(value, template.tag);
        itemProjection.optional = true;
        itemProjection.collapsible = true;
        itemProjection.parent = this.projection;

        let container = itemProjection.init().render();
        container.dataset.index = value.index;

        const {x, y} = this.anchors.current;
        container.setAttribute("x", x);
        container.setAttribute("y", y);

        itemProjection.element.parent = this;

        this.content.push(itemProjection.element);
        this.items.set(value.id, container);

        this.nextAnchor();

        return container;
    },

    nextAnchor(){
        this.anchors.current.x += this.anchors.x;
        this.anchors.current.y += this.anchors.y;
    },

    addItem(value){
        const item = this.createItem(value);

        this.container.append(item);

        if(this.displayed){
            this.content[this.content.length - 1].projection.update("displayed");
        }
    },

    display(){
        if(!isNullOrUndefined(this.parent) && !this.parent.displayed){
            return;
        }

        if(this.displayed){
            return;
        }

        this.displayed = true;
        this.container.dataset.displayed = "visible";

        this.fixed = true;

        if(!isEmpty(this.content)){
            this.content.forEach((element) => {
                element.projection.update("displayed");
            })
        }

        this.fixed = false;

        this.updateSize();
    },

    updateSize(){
        if(this.fixed){
            return;
        }

        if(!this.displayed){
            this.display();
        }

        if(isEmpty(this.content)){
            return;
        }

        this.adaptView();

        if(!isNullOrUndefined(this.parent)){
            this.parent.updateSize();
        }
    },

    adaptView(){
        let minX, minY, maxX, maxY;

        let contentBase = this.content[0].container || this.content[0].element;

        minX = Number(contentBase.getAttribute("x"));
        minY = Number(contentBase.getAttribute("y"));

        if(!isNullOrUndefined(this.content[0].containerView)){
            maxX = minX + this.content[0].containerView.targetW;
            maxY = minY + this.content[0].containerView.targetH;
        }else{
            maxX = minX + Number(contentBase.getAttribute("width"));
            maxY = minY + Number(contentBase.getAttribute("height"));
        }


        this.content.forEach((element) => {
            let container = element.element || element.container;

            minX = Math.min(minX, Number(container.getAttribute("x")));
            minY = Math.min(minX, Number(container.getAttribute("y")));

            if(!isNullOrUndefined(element.containerView)){
                maxX = Math.max(maxX, Number(container.getAttribute("x")) + element.containerView.targetW);
                maxY = Math.max(maxY, Number(container.getAttribute("y")) + element.containerView.targetH);
            }else{
                maxX = Math.max(maxX, Number(container.getAttribute("x")) + Number(container.getAttribute("width")));
                maxY = Math.max(maxY, Number(container.getAttribute("y")) + Number(container.getAttribute("height")));
            }
        })

        this.containerView = {
            x: minX,
            y: minY,
            w: maxX,
            h: maxY,
            targetW: maxX,
            targetH: maxY,
            targetX: minX,
            targetY: minY 
        }
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        })

        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        })
    }
}

export const PatternAlgorithm = Object.assign({},
    Algorithm,
    BasePatternAlgorithm
)