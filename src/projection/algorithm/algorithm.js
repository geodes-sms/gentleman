import { ContentHandler } from "./../content-handler";
import { createArticle, createI, isNullOrUndefined , findAncestor, isFunction} from "zenkai";

export const Algorithm = {
    
    clickHandler(target) {
        console.warn(`CLICK_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return false;
    },

    getContainer(){ return this.container },
    getWidth(){
        return this.width;
    },

    getHeight(){
        return this.height;
    },

    setViewBox(viewBox){
        this.container.setAttribute("viewBox", viewBox);
        this.notifyObsevers();
    },

    setWidth(width){
        this.width = width;
        this.container.setAttribute("width", width);
        this.notifyObsevers();
    },

    setWidth(height){
        this.height = height;
        this.container.setAttribute("height", height);
        this.notifyObsevers();
    },

    notifyDimObservers(){
        if(isNullOrUndefined(this.observers)){
            return;
        }

        this.observers.forEach(o => {
            o.analyseContentDim();
        })
    },

    registerDimensionsObserver(observer){
        if(isNullOrUndefined(this.observers)){
            this.observers = [];
        }

        this.observers.push(observer);
    },

    setInteraction(listener){
        if(isNullOrUndefined(this.items)){
            return;
        }
        
        if(isNullOrUndefined(this.warnings)){
            this.warnings = [];
        }

        this.warnings.push(listener);

        this.items.forEach(i => {
            this.projection.resolveElement(i.render).warn(listener);
            
        })
    },

    checkAugment(point, container){
        if(!isNullOrUndefined(this.background)){
            if((point.x + Number(container.getAttribute("x"))) > (Number(this.background.getAttribute("x")) + Number(this.background.getAttribute("width")))
            || (point.y + Number(container.getAttribute("y"))) > (Number(this.background.getAttribute("y")) + Number(this.background.getAttribute("height")))){
                let target = this.background.querySelector("[data-augment]");
                
                const targetY = Number(target.getAttribute("y"));
                const refY = point.y + Number(container.getAttribute("y"));


                target.setAttribute("height", refY - targetY);


            }else if((point.y + Number(container.getAttribute("y"))) < (Number(this.background.getAttribute("y")) + Number(this.background.getAttribute("height")))){
                let target = this.background.querySelector("[data-augment]");
                
                const targetY = Number(target.getAttribute("y"));
                const refY = point.y + Number(container.getAttribute("y"));

                target.setAttribute("height", refY - targetY);
            }
        }
    },

    createDelete(){
        const { type } = this.schema.rmv;
        switch(type){
            case "bind":
                this.deleteMap = new Map();

                let i = 0;
                this.schema.rmv.bind.forEach((value) => {
                    i++;
                    const {alias, focus, coordinates, content} = value;

                    const parser = new DOMParser();

                    let render = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                
                    render.dataset.nature = "static";
                    render.dataset.algorithm = "button";

                    render.setAttribute("x", coordinates.x);
                    render.setAttribute("y", coordinates.y);

                    render.addEventListener("click", () => {
                        this.source.delete();
                    })

                    /*if(focus){
                        render.dataset.focusable = true;
                    }*/

                    this.deleteMap.set(alias, render)
                });

                this.projection.registerHandler("value.changed", (value) => {
                    if(!isNullOrUndefined(this.deleteElem)){
                        this.deleteElem.remove();
                    }

                    this.deleteMap.get("default").remove();

                    const name = value.name || value;

                    let button = this.deleteMap.get(name);

                    if(button.dataset.focusable && !this.focused){
                        this.deleteElem = button;
                        return;
                    }

                    if(!isNullOrUndefined(button)){
                        this.container.append(button);
                        this.deleteElem = button;
                        return;
                    }else{
                        this.container.append(this.deleteMap.get("default"));
                        this.deleteElem = this.deleteMap.get("default")
            
                    }
                });

                   

                if(this.source.hasValue()){
                    this.container.append(this.deleteMap.get(this.source.value));
                    this.deleteElem = this.deleteMap.get(this.source.value)
                }else{
                    this.container.append(this.deleteMap.get("default"));
                    this.deleteElem = this.deleteMap.get("default");
                }
                break;
            default:
                const {focus, coordinates, dimensions, render} = this.schema.rmv;

                let proj = ContentHandler.call(this, render);

                proj.setAttribute("x", coordinates.x);
                proj.setAttribute("y" , coordinates.y);

                this.container.append(proj);

                proj.addEventListener("click", () => {
                    this.source.delete();
                })

                if(focus){
                    this.rmv = proj;
                }

                break;
        }

    },

    findItem(id){
        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].render.dataset.concept === id){
                return this.items[i];
            }
        }
    },

    findAncestor(elem){

        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].render.contains(elem)){
                return this.items[i];
            }
        }
    },

    findAnchorIndex(elem){
        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].render === elem){
                return this.items[i].index;
            }
        }
    },

    findAnchorIndex(index){
        return this.anchors.indexes[index];
    }
};