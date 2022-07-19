const { isNullOrUndefined, isEmpty } = require("zenkai");
import { ContentHandler } from "./../content-handler.js";
import { Shape } from "./shape.js";


const BaseGroup = {
    init(){
        this.items = [];

        return this;
    },

    render(){
        const {add} = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");

            this.container.classList.add("shape-container");
            this.container.dataset.nature = "shape";
            this.container.dataset.shape = "group";
            this.container.dataset.id = this.id;
        }

        if(add){
            this.addButton = ContentHandler.call(this, {
                kind: "static",
                type: "svg-button",
                action: {
                    type: "CREATE",
                },
                content: "<svg style=\"overflow:visible\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.0\"><text style=\"dominant-baseline:hanging;\" font-family=\"Segoe UI\" font-size=\"16\">+</text></svg>"
            })

            this.container.append(this.addButton)
        }

        if(!isEmpty(this.source)){
            this.reconstruct()
        }

        this.bindEvents();

        return this.container;
    },

    reconstruct(){
        console.log(this.projection);

        let values = this.source.value;

        for(let i = 0; i < values.length; i++){
            let object = this.projection.environment.conceptModel.getConcept(values[i]).getValue(true);
            
            let itemProjection = this.model.createProjection(object, "shape");
            itemProjection.parent = this.projection;

            let container = itemProjection.init().render();

            this.items.push({concept: itemProjection.concept, projection: container, centered: true});
            itemProjection.concept.register(this.projection);

            this.container.append(container);
            this.blur();
        }
    },

    createItem(object){
        const tag = "shape";

        let itemProjection = this.model.createProjection(object,tag);
        itemProjection.parent = this.projection;

        let container = itemProjection.init().render();

        //itemProjection.element.addDelete();

        this.items.push({concept: itemProjection.concept, projection: container, centered: false});
        itemProjection.concept.register(this.projection);

        this.blur();

        return container;
    },

    addItem(value){
        let container = this.createItem(value);

        this.container.append(container);
    },

    removeItem(value){

        for(let i = 0; i < this.items.length; i++){
            console.log(value);
            console.log(this.items[i]);
            if(this.items[i].concept.id === value.id){
                console.log("EQUAL");
                this.items[i].projection.remove();
                if(!isNullOrUndefined(this.items[i].container)){
                    this.items[i].container.remove();
                }
                this.items.splice(i, 1);

                console.log("Items");
                console.log(this.items);
                return;
            }
        }
    },

    update(){
        for(let i = 0; i < this.items.length; i++){
            if(!this.items[i].centered){
                this.center(this.items[i]);
            }
            this.items[i].centered = true;
        }
    },

    center(item){

        const shape = item.concept.getValue(true);

        const window = this.getWindow();

        switch(shape.name){
            case "circle":
                shape.getAttributeByName("cx").setValue((window.minX + window.vW)/ 2);
                shape.getAttributeByName("cy").setValue((window.minY + window.vH)/ 2);
                shape.getAttributeByName("r").setValue(window.vW * 20 / window.width);
                break;

            case "rectangle":
                const widthRect = window.vW * 40 / window.width;
                const heightRect = window.vH * 30 / window.height;

                shape.getAttributeByName("x").setValue((window.minX + window.vW)/ 2 - widthRect / 2);
                shape.getAttributeByName("y").setValue((window.minY + window.vH)/ 2 - heightRect / 2);
                shape.getAttributeByName("width").setValue(widthRect);
                shape.getAttributeByName("height").setValue(heightRect);

                break;
            case "ellipse":
                const widthEllipse = window.vW * 40 / (window.width * 2) ;
                const heightEllipse = window.vH * 30 / (window.height * 2);

                shape.getAttributeByName("cx").setValue((window.minX + window.vW)/ 2);
                shape.getAttributeByName("cy").setValue((window.minY + window.vH)/ 2);
                shape.getAttributeByName("rx").setValue(widthEllipse);
                shape.getAttributeByName("ry").setValue(heightEllipse);

                break;
            case "polygon":
                const widthPoly = window.vW * 40 / (window.width * 2) ;
                const heightPoly = window.vH * 30 / (window.height * 2);

                const centerX = (window.minX + window.vW)/ 2;
                const centerY = (window.minY + window.vH)/ 2;

                const p1 = {
                    x: centerX - widthPoly / 4,
                    y: centerY - heightPoly / 2
                };

                const p2 = {
                    x: centerX + widthPoly / 4,
                    y: centerY - heightPoly / 2
                };

                const p3 = {
                    x: centerX + widthPoly / 2,
                    y: centerY - heightPoly / 4
                };

                const p4 = {
                    x: centerX + widthPoly / 2,
                    y: centerY + heightPoly / 4
                };

                const p5 = {
                    x: centerX + widthPoly / 4,
                    y: centerY + heightPoly / 2
                };

                const p6 = {
                    x: centerX - widthPoly / 4,
                    y: centerY + heightPoly / 2
                };

                const p7 = {
                    x: centerX - widthPoly / 2,
                    y: centerY + heightPoly / 4
                };

                const p8 = {
                    x: centerX - widthPoly / 2,
                    y: centerY - heightPoly / 4
                };

                shape.getAttributeByName("points").setValue(
                    "" + p1.x + " " + p1.y +
                    ", " + p2.x + " " + p2.y +
                    ", " + p3.x + " " + p3.y +
                    ", " + p4.x + " " + p4.y +
                    ", " + p5.x + " " + p5.y +
                    ", " + p6.x + " " + p6.y +
                    ", " + p7.x + " " + p7.y +
                    ", " + p8.x + " " + p8.y
                );

                break;
            case "path":
                const widthPath = window.vW * 40 / (window.width * 2) ;
                const heightPath = window.vH * 30 / (window.height * 2);

                const pathX = (window.minX + window.vW)/ 2;
                const pathY = (window.minY + window.vH)/ 2;

                shape.getAttributeByName("d").setValue(
                    "M " + (pathX - widthPath / 2) + " "  + pathY + " " +
                    "L " + (pathX + widthPath / 2) + " "  + pathY
                )
        }

        
        let itemProjection = this.model.createProjection(shape,"shape");
        itemProjection.parent = this.projection;

        let container = itemProjection.init().render();

        this.container.append(container);

        item.container = container;
    },

    focusIn(){

    },

    focusOut(){
        
    },

    blur(){

    },

    getWindow(){
        const parent = this.container.parentNode;

        const viewBox = parent.viewBox.baseVal;

        return {
            width: Number(parent.getAttribute("width")),
            height: Number(parent.getAttribute("height")),
            vW: viewBox.width,
            vH: viewBox.height,
            minX: viewBox.x,
            minY: viewBox.y,
        }
    },

    bindEvents(){
        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value)
        })

        this.projection.registerHandler("value.changed", (value) => {
            this.update();
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        })
    }
}

export const Group = Object.assign(
    Object.create(Shape),
    BaseGroup
);