import { AnchorHandler } from "./../algorithm/anchor-handler.js";
import { isNullOrUndefined, isString } from "zenkai";
import { Arrow } from "./arrow.js";
import { ContentHandler } from "./../content-handler.js";

const BaseAnchorArrow = {
    init(){
        return this;
    },

    render(){

        const { aiming, model, move, decorator = false, style } = this.schema;

        if(isNullOrUndefined(this.path)){
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.classList.add("arrow-path");
            this.path.dataset.nature = "arrow";
            this.path.dataset.algorithm = "anchor";
            this.path.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.aiming)){
            this.aiming = this.source.getAttributeByName(aiming.name).target;
        }

        if(isNullOrUndefined(this.anchorModel)){
            this.anchorModel = model;

            AnchorHandler.registerListener(model, this);
        }

        if(move){
            this.movingPiece = this.source.getAttributeByName(move.name).target;
            this.movingPiece.register(this);
        }


        if(decorator && isNullOrUndefined(this.decorator)){
            this.createDecorator(decorator);
        }

        this.bind = this.projection.bind;

        this.bindEvents();

        this.stylePath(style);

        return this.path;

    },

    update(){
        if(!isNullOrUndefined(this.movingPiece) && this.movingPiece.hasValue()){
            let value = this.movingPiece.getValue();

            if(isString(value)){
                value = this.movingPiece.getValue(true);
            }


            value.notify("accept", (this.bind));

            console.log("accept");
            console.log(value);
            if(!isNullOrUndefined(this.path.parenNode)){
                value.notify("cover", (this));
            }
        }
    },

    deleteFromView(){
        AnchorHandler.unregister(this.anchorModel,this);
        this.movingPiece = null;
        this.path.remove();
        this.decorator.remove();
    },

    createDecorator(decorator){
        this.decorator = ContentHandler.call(this, decorator.render);
    },

    updateValue(){
        if(!this.aiming.hasValue()){
            this.path.remove();
            this.decorator.remove();
            this.definitions.remove();
            return;
        }

        let value = this.aiming.value.id || this.aiming.value;

        let source = AnchorHandler.findSource(this.anchorModel, this.bind.element || this.bind.container);
        let target = AnchorHandler.findTarget(this.anchorModel, value, source.index);

        if(this.schema.offset){
            source.x += this.schema.offset.x;
            source.y += this.schema.offset.y;
            target.x += this.schema.offset.x;
            target.y += this.schema.offset.y;
        }

        if(this.decorator){
            const {origin, x, y} = this.schema.decorator.coordinates;

            switch(origin){
                case "source":
                    this.decorator.setAttribute("x", source.x + x);
                    this.decorator.setAttribute("y", source.y + y);
                    this.projection.parent.container.append(this.decorator);
                    break;
                case "target":
                    this.decorator.setAttribute("x", target.x + x);
                    this.decorator.setAttribute("y", target.y + y);
                    this.projection.parent.container.append(this.decorator);
                    break;
                case "minX":
                    if(source.x < target.x){
                        this.decorator.setAttribute("x", source.x + x);
                        this.decorator.setAttribute("y", source.y + y);
                    }else{
                        this.decorator.setAttribute("x", target.x + x);
                        this.decorator.setAttribute("y", target.y + y);
                    }
                    this.projection.parent.container.append(this.decorator);
                    break;
                case "minY":
                    if(source.y < target.y){
                        this.decorator.setAttribute("x", source.x + x);
                        this.decorator.setAttribute("y", source.y + y);
                    }else{
                        this.decorator.setAttribute("x", target.x + x);
                        this.decorator.setAttribute("y", target.y + y);
                    }
                    this.projection.parent.container.append(this.decorator);
                    break;
                case "maxX":
                    if(source.x > target.x){
                        this.decorator.setAttribute("x", source.x + x);
                        this.decorator.setAttribute("y", source.y + y);
                    }else{
                        this.decorator.setAttribute("x", target.x + x);
                        this.decorator.setAttribute("y", target.y + y);
                    }
                    this.projection.parent.container.append(this.decorator);
                    break;
                case "maxY":
                    if(source.y > target.y){
                        this.decorator.setAttribute("x", source.x + x);
                        this.decorator.setAttribute("y", source.y + y);
                    }else{
                        this.decorator.setAttribute("x", target.x + x);
                        this.decorator.setAttribute("y", target.y + y);
                    }
                    this.projection.parent.container.append(this.decorator);
                    break;

            }
        }


        this.setPath("M " + source.x + " " + source.y + " L " + target.x + " " + target.y);

        if(this.definitions){
            this.projection.parent.container.append(this.definitions);
        }
        this.projection.parent.container.prepend(this.path);
        if(this.decorator){
            this.environment.resolveElement(this.decorator).projection.update("displayed");
        }

        this.calcS = source.calc;
        this.calcT = target.calc;

        if(this.movingPiece && this.movingPiece.hasValue()){
            let moveValue = this.movingPiece.value;

            if(isString(moveValue)){
                moveValue = this.movingPiece.getValue(true);
            }

            moveValue.notify("cover", this);
        }
    },

    bindEvents(){
        this.aiming.register(this.projection);

        this.projection.registerHandler("value.changed", (value) => {
            this.updateValue(value);
        })

    }
}

export const AnchorArrow = Object.assign({},
    Arrow,
    BaseAnchorArrow
);