import { ContentHandler } from "./../content-handler";
import { createDocFragment, isHTMLElement, createDiv, valOrDefault, isNullOrUndefined, isEmpty, isNull } from "zenkai";
import { Algorithm } from "./algorithm";
import { DimensionHandler } from "./dimension-handler";
import { AnchorHandler } from "./anchor-handler.js"

const BasePatternAlgorithm = {
    init() {
        const { dimensions } = this.schema;

        this.dimensions = dimensions; 

        return this;
    },

    render(){
        const fragment = createDocFragment();

        const { dimensions, saturation, overflow = false, create, add, style} = this.schema; 

        this.focusable = true;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            if(dimensions){
                this.container.setAttribute("width", dimensions.width);
                this.container.setAttribute("height", dimensions.height);
            }

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "pattern";
            this.container.dataset.id = this.id;
            this.container.dataset.click = "container"
            this.container.tabIndex = 0;
        }
        
        if(overflow){
            this.container.style.overflow = "visible";
        }


        if(saturation){
            this.saturation = saturation.value;
            this.satTarget = saturation.target;

            if(!isNullOrUndefined(saturation.satParams)){
                this.satParams = saturation.satParams;
            }

            if(!isNullOrUndefined(saturation.acceptTarget)){
                this.acceptTarget = saturation.acceptTarget
            }

        }

        if(isNullOrUndefined(this.anchors)){
            this.setUpAnchors();
        }

        if(add && isNullOrUndefined(this.add)){
            const { coordinates = false, render } = add;

            this.add = ContentHandler.call(this, render);

            if(coordinates){
                this.add.setAttribute("x", coordinates.x);
                this.add.setAttribute("y", coordinates.y);    
            }else{
                this.add.setAttribute("x", this.anchors.current.x);
                this.add.setAttribute("y", this.anchors.current.y);
            }
            this.container.append(this.add);
            this.add.style.overflow = "visible";

            this.add.addEventListener("click", () => {
                //this.source.createElement();
            })
        }

        this.displayed = false;

        if(style){
            this.container.style = style
        }

        this.bindEvents();


        if(create){
            this.source.createElement();
        }


        if(style){
            this.container.style = style;
        }
        return this.container;
    },

    checkDim(x, y, item){
        if(y + 20 + Number(item.getAttribute("y"))> Number(this.items[0].render.getAttribute("height"))){
            this.items.forEach(i => {
                this.projection.resolveElement(i.render).augment();
            })
        } 
    },

    checkSpeDim(x, y, item){

        while(y + 20 + Number(item.getAttribute("y"))> Number(this.items[this.items.length - 1].render.getAttribute("height"))){
            this.projection.resolveElement(this.items[this.items.length - 1].render).augment();
        } 
    },

    createItem(object){
        const {tag} = this.schema.pattern;

        let itemProjection = this.model.createProjection(object,tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        

        let container = itemProjection.init().render();

        //itemProjection.element.addDelete();
 
        return {render: container, projection : itemProjection}
    },

    addItem(value){

        if(this.saturation){
            if(isNullOrUndefined(this.count)){
                this.count = 0;
            }

            if(this.count >= this.saturation){
                this.environment.getActiveReceiver(this.satTarget).source.createElement()
                this.saturate(value);
                return;
            }
        }

        let {render, projection} = this.createItem(value);
        
        if(isNullOrUndefined(this.dimSchema)){
            this.dimSchema = new Map();
        }
        
        this.dimSchema.set(render.dataset.id, DimensionHandler.analyseDim(render, this.schema.pattern))

        this.container.append(render);

        let current = this.anchors.current;

        if(isNullOrUndefined(this.items)){
            this.items = [];
        }
        this.items.push({render: render, position: current, index: this.anchorIndex, id: value.id});
        
        if(this.displayed){
            DimensionHandler.setDimensions(this.dimSchema.get(render.dataset.id));
            projection.update("displayed", render.dataset.id)
        }else{
            if(isNullOrUndefined(this.waiting)){
                this.waiting = []
            }

            this.waiting.push({render: render, projection: projection});
        }

        if(isNullOrUndefined(this.anchors)){
            this.setUpAnchors();
        }
      

        DimensionHandler.positionElement(current, render);

        this.nextAnchor(true);
        
        

        this.count++;

        if(this.warnings){
            this.warnings.forEach( w => {
                projection.warn(w)
            })
           
        }

    },

    placeAdd(){
        this.add.setAttribute("x", this.anchors.current.x);
        this.add.setAttribute("y", this.anchors.current.y);
    },

    setUpAnchors(){
        const { first, next } = this.schema.pattern;

        this.anchors = {};

        this.anchors.current = first;
        this.anchors.next = next;
        this.anchors.indexes = [first];

        this.anchorIndex = 0;
    },

    saturate(value){
        let projection = this.environment.projectionModel.createProjection(this.projection.concept, this.projection.tag).init();

        projection.render();

        this.environment.getActiveReceiver("solo").accept(projection.element.container, this.satParams.dimension, this.satParams.coordinates);

        projection.element.addItem(value);

        this.full = true;
        this.saturated = true;
    },

    accept(element, arrow = false){
        const {render, params} = element;

        if(arrow){
            let projection = this.projection.resolveElement(render);
            projection.parent = this;
            if(projection.definitions){
                this.container.append(projection.definitions);
            }
            return;
        }

        this.container.append(render);
    },

    acceptAnchor(elem){
        this.container.append(elem);

        let current = this.anchors.current;

        this.items.push({render: elem, anchor: current, index: this.anchorIndex, id: elem.id});

        DimensionHandler.positionElement(current, elem);

        this.nextAnchor(true);

        this.count++;

        if(this.count >= this.saturation){
            this.full = true;
        }
    },

    nextAnchor(balance = false){
        let {x, y} = this.anchors.current;
        let xOff = this.anchors.next.x;
        let yOff = this.anchors.next.y;

        this.anchors.current = {
            x: x + xOff,
            y: y + yOff
        }
        
       if(balance && this.anchorModel){
           AnchorHandler.nextAnchor(this.schema.handler.id, this.id);
       }
       
        if(!isNullOrUndefined(this.add) && !this.schema.add.coordinates){
            this.placeAdd();
        }

        this.anchors.indexes.push({
            x: x + xOff,
            y: y + yOff
        })

        this.anchorIndex++;

        if(!isNullOrUndefined(this.parent)){
            this.parent.checkAugment(this.anchors.current, this.container);
        }
    },


    createHolder(item){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        foreign.append(item);
        holder.append(foreign);

        return holder;
    },

    adapt(item, dimensions){
        let holder = item.parentNode.parentNode;
        let foreign = item.parentNode;
        let rect;
        
        switch(dimensions.type){
            case "fixed":
                holder.setAttribute("width", dimensions.value);
                foreign.setAttribute("width", dimensions.value)
                rect = item.getBoundingClientRect();


                foreign.setAttribute("height", rect.height);
                foreign.setAttribute("width", rect.width);

                holder.setAttribute("height", rect.height * dimensions.value / rect.width);
                holder.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
                break;
        }
    },

    transmitFirst(){
        const  { render, position, index, id} = this.items[0];

        this.removeItem({id: id});

        return render;
    },
    
    removeItem(value){
        let buffer, i;
            for(i = 0; i < this.items.length; i++){
                if(this.items[i].id === value.id){
                    const {position} = this.items[i];
                    buffer = position;

                    break;
                }
            }

            if(i >= this.items.length || isNullOrUndefined(this.items[i])){
                return;
            }
            const index = this.items[i].index;
            this.items.splice(i, 1);
            if(i > this.items.length){
                i--;
            }

            while(i < this.items.length){
                let altBuff = this.items[i].position;
                this.items[i].position = buffer;
                this.items[i].render.setAttribute("x", buffer.x);
                this.items[i].render.setAttribute("y", buffer.y);
                this.items[i].index--;
                buffer = altBuff;
                i++;
            }


            this.anchors.indexes.splice(this.anchors.indexes.length - 1, 1);
            this.anchors.current =  this.anchors.indexes[this.anchors.indexes.length - 1];
            if(!isNullOrUndefined(this.add) && !this.schema.add.coordinates){
                this.placeAdd();
            }

            if(!isNullOrUndefined(this.parent)){
                this.parent.checkAugment(this.anchors.current, this.container);
            }            
            
            if(this.anchorModel){
                AnchorHandler.deleteItem(this.schema.handler.id, this.id, index);
            }

            if(!isNullOrUndefined(this.count)){
                this.count--;
                
                if(this.full){
                    this.full = false;
                    this.environment.saturationRevolved(this, this.projection.rtag);
                    this.saturated = true;
                }

                if(this.count === 0){

                    
                }
            }

    },

    removeAnchor(index){
       if(!isNullOrUndefined(this.items)){
            for(let i = 0; i < this.items.length; i++){
                if(this.items[i].index > index){
                    this.items[i].position.x -= this.anchors.next.x;
                    this.items[i].position.y -= this.anchors.next.y;
                    this.items[i].render.setAttribute("x", this.items[i].position.x);
                    this.items[i].render.setAttribute("y", this.items[i].position.y);
                    this.items[i].index--;
                }
            }
       }

        this.anchors.indexes.splice(this.anchors.indexes.length - 1, 1);
        this.anchors.current =  this.anchors.indexes[this.anchors.indexes.length - 1];
        if(!isNullOrUndefined(this.add) && !this.schema.add.coordinates){
            this.placeAdd();
        }

        if(!isNullOrUndefined(this.parent)){
            this.parent.checkAugment(this.anchors.current, this.container);
        }       

    },

    moveElemToAnchor(index, itemIndex){
        if(this.anchors.indexes.length <= index + 1 ){
            this.nextAnchor(true);
            if(!isNullOrUndefined(this.add) && !this.schema.add.coordinates){
                this.placeAdd();
            }
        }

        let newAnchor = this.anchors.indexes[index];

        this.items[itemIndex].position = newAnchor;
        this.items[itemIndex].index = index;

        let render = this.items[itemIndex].render;

        render.setAttribute("x", newAnchor.x);
        render.setAttribute("y", newAnchor.y);

        return render;
    },

    increaseAnchors(from, to, fix, forbiden){

        if(to > this.anchors.indexes.length){
            this.nextAnchor(true);
        }

        if(!isNullOrUndefined(this.items)){
            this.items.forEach(item => {

                if(item.render !== fix && item.index >= from && item.index <= to){
                        item.index++;
                        if(!forbiden.includes(item.index)){
                            item.position = this.anchors.indexes[item.index];
                            item.render.setAttribute("x", item.position.x);
                            item.render.setAttribute("y", item.position.y);
                        }else{
                            this.projection.resolveElement(item.render).increaseAnchor();
                        }

                }         
            })
        }

    },

    decreaseAnchors(from, to, fix, forbiden){


        if(!isNullOrUndefined(this.items)){
            this.items.forEach(item => {
                if(item.render !== fix && item.index >= from && item.index <= to){
                    item.index--;
                    if(!forbiden.includes(item.index)){
                        item.position = this.anchors.indexes[item.index];
                        item.render.setAttribute("x", item.position.x);
                        item.render.setAttribute("y", item.position.y);
                    }else{
                        this.projection.resolveElement(item.render).decreaseAnchor();
                    }
                }
            })
        }
    },

    clickHandler(target){

    },

    focusIn() {
        if(this.add){
            this.container.append(this.add);
        }

        this.focused = true;
        this.container.classList.add("active");
        this.container.classList.add("focus");

        return this;
    },
    focusOut() {
        if(this.hide){
            if(this.add){
                this.add.remove();
            }
        }

        this.container.classList.remove("active");
        this.container.classList.remove("focus");

        this.focused = false;

        return this;
    },


    bindEvents(){
        this.projection.registerHandler("displayed", (id) => {
            if(!this.displayed){
                this.displayed = true;
                if(!isNullOrUndefined(this.waiting)){
                    this.waiting.forEach((i) => {
                        let { render, projection } = i;

                        DimensionHandler.setDimensions(this.dimSchema.get(render.dataset.id));
                        projection.update("displayed");
                    })
                }

            }

            if(this.schema.handler){
               this.anchorModel = AnchorHandler.create(this, this.schema.handler)
            }
        });

        this.projection.registerHandler("value.added", (value) => {
            if(!this.full){
                this.addItem(value);
            }else if(!this.saturated){
                this.saturate()
            }

        })

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        })

    }

}

export const PatternAlgorithm = Object.assign({},
    Algorithm,
    BasePatternAlgorithm
);