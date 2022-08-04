import { ContentHandler } from "./../content-handler.js";
import { Algorithm } from "./algorithm.js";

const { createDocFragment, isNullOrUndefined, isEmpty, isNull } = require("zenkai");
const { AnchorHandler } = require("./anchor-handler");

const BaseAnchorAlgorithm = {
    init(){
        return this;
    },

    render(){
        const { dimensions, overflow = false, contains, reserve, model, style, offset, zindex, content = [] } = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "anchor";
            this.container.dataset.id = this.id;
        }

        if(overflow){
            this.container.style.overflow = "visible";
        }

        if(dimensions){
            const {width, height} = dimensions;
            this.container.setAttribute("width", width);
            this.container.setAttribute("height", height)
        }

        if(!isEmpty(content) && isNullOrUndefined(this.items)){
            this.items = [];

            content.forEach(element => {
                const { coordinates, render, dimension} = element;

                let item = ContentHandler.call(this, render);

                item.setAttribute("x", coordinates.x);
                item.setAttribute("y", coordinates.y);

                this.container.append(item);
                this.items.push(item);
            })

            
        }

        if(model){
            AnchorHandler.createSubModel(model, this);
            this.anchorModel = model;
        }

        this.bindEvents();

        if(style){
            this.createStyleMimic(style);
        }

        return this.container;
    },

    focusIn(){

    },

    focusOut(){

    },

    increaseSize(){
        const height = Number(this.container.getAttribute("height"));

        this.container.setAttribute("height", height + this.anchors.y);
        this.mimic.setAttribute("height", height + this.anchors.y)
    },

    decreaseSize(){
        const height = Number(this.container.getAttribute("height"));
        this.container.setAttribute("height", height - this.anchors.y);
        this.mimic.setAttribute("height", height - this.anchors.y)
    },

    increaseAnchor(){
        const y = Number(this.container.getAttribute("y"));
        this.container.setAttribute("y", y + this.anchors.y);
    },

    decreaseAnchor(){
        const y = Number(this.container.getAttribute("y"));
        this.container.setAttribute("y", y - this.anchors.y);
    },

    createStyleMimic(style){
        this.mimic = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        this.mimic.setAttribute("width", this.container.getAttribute("width"));
        this.mimic.setAttribute("height", this.container.getAttribute("height"));

        this.mimic.style = style;

        this.container.prepend(this.mimic);
    },

    checkCover(){
        let from, to;

        for(let i = 0; i < this.covering.length; i++){
            if(isNullOrUndefined(from)){
                from = Math.min(this.covering[i].from.x, this.covering[i].to.x);
                to = Math.max(this.covering[i].from.x, this.covering[i].to.x);
            }else{
                if(from > Math.min(this.covering[i].from.x, this.covering[i].to.x)){
                    from = Math.min(this.covering[i].from.x, this.covering[i].to.x);
                }

                if(to < Math.max(this.covering[i].from.x, this.covering[i].to.x)){
                    to = Math.max(this.covering[i].from.x, this.covering[i].to.x);
                }
            }
        }



        const x = Number(this.container.getAttribute("x"));
        if(x < from){
            this.container.setAttribute("width", to - from +  2 * this.schema.offset.x + (from- x));
            this.mimic.setAttribute("width", to - from + 2 * this.schema.offset.x + (from- x));
        }else{
            this.container.setAttribute("width", to - from +  2 * this.schema.offset.x);
            this.mimic.setAttribute("width", to - from + 2 * this.schema.offset.x);
        }

        //this.rtag.container.prepend(this.container);
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {

            let position = AnchorHandler.estimatePositionCondamn(this.anchorModel, this);

            const {offset = false} = this.schema;
            if(offset){
                this.container.setAttribute("x", position.x - offset.x);
                this.container.setAttribute("y", position.y - offset.y)
            }

            this.anchors = position.anchors;

            this.rtag = this.environment.getActiveReceiver(this.schema.rtag);

            this.rtag.container.prepend(this.container);

                
        })

        this.projection.registerHandler("accept", (value) => {
            AnchorHandler.registerSubModel(this.anchorModel,this, value);
        })

        this.projection.registerHandler("cover", (item) => {
            if(isNullOrUndefined(this.rtag)){
                this.rtag = this.findActiveReceiver(this.schema.rtag);
            }
            const from = AnchorHandler.estimatePosition(item.calcS);
            const to = AnchorHandler.estimatePosition(item.calcT);

            if(isNullOrUndefined(this.covering)){
                this.covering = []
            }

            this.setCovering(item, from ,to);

            this.checkCover();

        })
    },

    setCovering(item, from, to){
        for(let i = 0; i < this.covering.length; i++){
            if(this.covering[i].item === item){
                this.covering[i].from = from;
                this.covering[i].to = to;
                return;
            }
        }
        this.covering.push({item: item, from: from, to: to});
    }
}

export const AnchorAlgorithm = Object.assign({},
    Algorithm,
    BaseAnchorAlgorithm
)