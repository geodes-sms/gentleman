import { ContentHandler } from "./../content-handler";
import { isNullOrUndefined } from "zenkai";
import { Arrow } from "./arrow";

const BaseForceArrow = {

    init(){
        return this;
    },

    render(){
        const { style, from, to, decorator } = this.schema;

        if(isNullOrUndefined(this.path)){
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.classList.add("arrow-path");
            this.path.dataset.nature = "arrow";
            this.path.dataset.algorithm = "force";
            this.path.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.from)){
            this.registerAttribute(from, true);
        }

        if(isNullOrUndefined(this.to)){
            this.registerAttribute(to);
        }

        if(style){
            this.stylePath(style);
        }

        if(decorator && isNullOrUndefined(this.decorator)){
            this.decorator = ContentHandler.call(this, decorator);
        }

        this.bindEvents();

        return this.path;
    },

    registerAttribute(attr, from = false){
        const { name } = attr;

        if(from){
            this.from = this.source.getAttributeByName(name).target;
        }else{
            this.to = this.source.getAttributeByName(name).target;
        }   
    },

    updateValue(){
        this.fromVal = this.from.value;       
        this.toVal = this.to.value;

        if(!isNullOrUndefined(this.fromVal) && !isNullOrUndefined(this.toVal)){
            this.projection.parent.addArrow(this, this.fromVal, this.toVal, this.decorator);
        }else{
            this.projection.parent.removeArrow(this, false, this.decorator);
        }
    },

    setPath(d){
        this.path.setAttribute("d", d);
    },

    bindEvents(){
        this.from.register(this.projection);
        this.to.register(this.projection);
        
        this.projection.registerHandler("value.changed", () => {
            this.updateValue();
        })
    }

}

export const ForceArrow = Object.assign({},
    Arrow,
    BaseForceArrow
);