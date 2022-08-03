import { ContentHandler } from './../content-handler.js';
import { isNull, isNullOrUndefined, isUndefined, valOrDefault } from 'zenkai';
import { Simulation } from './simulation.js';
5
const BasePatternSimulation = {

    init(){
        this.width = 350;
        this.height = 350;

        return this;
    },

    render(){

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.setAttribute("width", 400);
            this.container.setAttribute("height", 400);

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "pattern";
            this.container.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.visualization)){
            this.visualization = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.visualization.setAttribute("viewBox", "0 0 400 400");
            this.visualization.setAttribute("width", 400);
            this.visualization.setAttribute("height", 400);

            this.visualization.setAttribute("preserveAspectRatio", "xMidYMid meet")

            this.container.append(this.visualization);
        }

        if(isNullOrUndefined(this.interaction)){
            this.interaction = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.interaction.setAttribute("viewBox", "0 0 400 400");

            this.interaction.setAttribute("width", 400);
            this.interaction.setAttribute("height", 400)

            this.container.append(this.interaction);
        }

        if(isNullOrUndefined(this.firstX)){
            this.firstX = this.source.getAttributeByName("first").target.getAttributeByName("x").target;
            this.firstY = this.source.getAttributeByName("first").target.getAttributeByName("y").target;
        }

        if(isNullOrUndefined(this.nextX)){
            this.nextX = this.source.getAttributeByName("next").target.getAttributeByName("x").target;
            this.nextY = this.source.getAttributeByName("next").target.getAttributeByName("y").target;
        }

        if(isNullOrUndefined(this.itemWidth)){
            this.itemWidth = this.source.getAttributeByName("itemWidth").target;

            this.itemWidthTextual = ContentHandler.call(this, {
                type: "attribute",
                name: "itemWidth",
                tag: "simulation-large"
            });

            this.itemWidthTextual.setAttribute("x", 57);
            this.itemWidthTextual.setAttribute("y", 30)

            this.itemWidthStatic = ContentHandler.call(this, {
                kind: "static",
                type: "svg-text",
                content: "ItemWidth:",
                style:{
                    font: "Segoe UI",
                    size: 11,
                    anchor: "end",
                    baseline: "auto",
                    color: "black",
                    weight: 500
                }
            });

            this.itemWidthStatic.setAttribute("x", 56);
            this.itemWidthStatic.setAttribute("y", 30);

            this.interaction.append(this.itemWidthTextual);
            this.interaction.append(this.itemWidthStatic);
        }

        if(isNullOrUndefined(this.widthTextual)){
            this.widthAttr = this.source.getAttributeByName("width").target;

            this.widthTextual = ContentHandler.call(this, {
                type: "attribute",
                name: "width",
                tag: "simulation-large"
            });

            this.widthTextual.setAttribute("x", 34);
            this.widthTextual.setAttribute("y", 45)

            this.widthStatic = ContentHandler.call(this, {
                kind: "static",
                type: "svg-text",
                content: "Width:",
                style:{
                    font: "Segoe UI",
                    size: 11,
                    anchor: "end",
                    baseline: "auto",
                    color: "black",
                    weight: 500
                }
            });

            this.widthStatic.setAttribute("x", 33);
            this.widthStatic.setAttribute("y", 45);

            this.interaction.append(this.widthTextual);
            this.interaction.append(this.widthStatic);
        }

        if(isNullOrUndefined(this.heightTextual)){
            this.heightAttr = this.source.getAttributeByName("height").target;


            this.heightTextual = ContentHandler.call(this, {
                type: "attribute",
                name: "height",
                tag: "simulation-large"
            });

            this.heightTextual.setAttribute("x", 38);
            this.heightTextual.setAttribute("y", 60)

            this.heightStatic = ContentHandler.call(this, {
                kind: "static",
                type: "svg-text",
                content: "Height:",
                style:{
                    font: "Segoe UI",
                    size: 11,
                    anchor: "end",
                    baseline: "auto",
                    color: "black",
                    weight: 500
                }
            });

            this.heightStatic.setAttribute("x", 37);
            this.heightStatic.setAttribute("y", 60);

            this.interaction.append(this.heightTextual);
            this.interaction.append(this.heightStatic);
        }


        if(isNullOrUndefined(this.nbItem)){
            this.nbItem = this.source.getAttributeByName("nbItem").target;

            this.nbItemText = ContentHandler.call(this, {
                type: "attribute",
                name: "nbItem",
                tag: "simulation-large"
            })

            this.nbItemStatic = ContentHandler.call(this, {
                kind: "static",
                type: "svg-text",
                content: "nbItem:",
                style:{
                    font: "Segoe UI",
                    size: 11,
                    anchor: "end",
                    baseline: "auto",
                    color: "black",
                    weight: 500
                }
            })

            this.nbItemText.setAttribute("x", 26);
            this.nbItemText.setAttribute("y", 15);
            
            this.nbItemStatic.setAttribute("x", 25);
            this.nbItemStatic.setAttribute("y", 15);

            this.interaction.append(this.nbItemStatic);
            this.interaction.append(this.nbItemText);

            this.setUpItems();
        }
        

        this.bindEvents();

        return this.container;
    },

    setUpItems(){
        let nb = this.nbItem.value;

        this.items = [];

        for(let i = 0; i < nb; i ++){
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", this.itemWidth.value);
            rect.setAttribute("height", this.itemWidth.value);

            rect.setAttribute("fill", "white");
            rect.setAttribute("stroke", "#738CFF");
            rect.setAttribute("stroke-width", 5);

            rect.setAttribute("x", i * this.nextX.value + this.firstX.value);
            rect.setAttribute("y", i * this.nextY.value + this.firstY.value);

            this.visualization.append(rect);

            this.items.push(rect);
        }
    },

    updateContainer(){
        if(!isNullOrUndefined(this.widthAttr.value) && !isNullOrUndefined(this.heightAttr.value)){
            this.visualization.setAttribute("viewBox", "0 0 " + this.widthAttr.value + " " + this.heightAttr.value);
        }
    },

    updateItems(){
        let nb = this.nbItem.value;

        if(isNullOrUndefined(nb)){
            return;
        }

        if(this.items.length > nb){
            for(let i = nb; i < this.items.length; i++){
                this.items[i].remove();
            }

            this.items.splice(nb, this.items.length - nb);
        }

        if(this.items.length < nb){
            for(let i = this.items.length; i < nb; i++){
                let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

                rect.setAttribute("fill", "white");
                rect.setAttribute("stroke", "#738CFF");
                rect.setAttribute("stroke-width", 5);

                this.visualization.append(rect);

                this.items.push(rect);
            }
        }

        for(let i = 0; i < this.items.length; i++){
            this.items[i].setAttribute("width", valOrDefault(this.itemWidth.value, 50));
            this.items[i].setAttribute("height", valOrDefault(this.itemWidth.value, 50));
            this.items[i].setAttribute("x", i * this.nextX.value + this.firstX.value);
            this.items[i].setAttribute("y", i * this.nextY.value + this.firstY.value);
        }
    },

    bindEvents(){
        this.nbItem.register(this.projection);

        this.firstX.register(this.projection);
        this.firstY.register(this.projection);

        this.nextX.register(this.projection);
        this.nextY.register(this.projection);

        this.itemWidth.register(this.projection);

        this.widthAttr.register(this.projection);
        this.heightAttr.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.updateContainer();
            this.updateItems()
        });
    }
}

export const PatternSimulation = Object.assign(
    Object.create(Simulation),
    BasePatternSimulation
);