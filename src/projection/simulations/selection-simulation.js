import { ContentHandler } from './../content-handler.js';
import { isNull, isNullOrUndefined, valOrDefault } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseSelectionSimulation = {

    init(){
        this.width = 400;
        this.height = 200;

        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.setAttribute("width", 200);
            this.container.setAttribute("height", 200);
            this.container.setAttribute("viewBox", "0 0 400 400")


            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.simulation = "selection";
            this.container.dataset.id = this.id;

            this.container.style = "border:solid rgb(135, 161, 255); border-radius:10%;";

            this.container.id = this.id;
        }

        this.bindEvents();

        this.setUpSimulation();

        return this.container;
        
    },

    bindEvents(){
        this.nbItem = this.source.getAttributeByName("nbItem").target;
        this.orientation = this.source.getAttributeByName("orientation").target;
        this.break = this.source.getAttributeByName("break").target;
        this.itemW = this.source.getAttributeByName("dimensions").target.getAttributeByName("width").target;
        this.itemH = this.source.getAttributeByName("dimensions").target.getAttributeByName("height").target;



        this.nbItem.register(this.projection);
        this.orientation.register(this.projection);
        this.break.register(this.projection);
        this.itemW.register(this.projection);
        this.itemH.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.setUpSimulation();
        })
    },

    setUpSimulation(){
        this.baseLetter = 65;

        if(!isNullOrUndefined(this.selection)){
            this.selection.remove();
        }

        this.selection = document.createElementNS("http://www.w3.org/2000/svg", "svg");


        for(let i = 0; i < this.nbItem.value; i++){
            let item = this.createItem();

            this.place(item, i);

            this.baseLetter++;
        }

        this.center();

        this.container.append(this.selection);
    },

    focusIn(){

    },

    focusOut(){

    },

    place(item, index){
        const width = valOrDefault(this.itemW.value, 50);;
        const height = valOrDefault(this.itemH.value, 50);;
        const breakDown = this.break.value;

        switch(this.orientation.value){
            case "horizontal":
                if(breakDown > 0){
                    item.setAttribute("x", (index % breakDown) * width);
                    item.setAttribute("y", ~~(index/breakDown) * height);
                }else{
                    item.setAttribute("x", index * width);
                }
                break;
            case "vertical":
                if(breakDown > 0){
                    item.setAttribute("x", ~~(index/breakDown) * height);
                    item.setAttribute("y", (index % breakDown) * width);
                }else{
                    item.setAttribute("y", index * height);
                }
        }
    },

    createItem(){
        let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        
        const width = valOrDefault(this.itemW.value, 50);
        const height = valOrDefault(this.itemH.value, 50);
        const breakDown = this.break.value;

        container.setAttribute("width", width);
        container.setAttribute("height", height);

        let element = document.createElementNS("http://www.w3.org/2000/svg", "text");

        element.textContent = String.fromCharCode(this.baseLetter);

        element.setAttribute("x", width / 2);
        element.setAttribute("y", height / 2);

        element.setAttribute("text-anchor", "middle");
        element.setAttribute("font-size", height / 2);
        element.setAttribute("font-family", "Segoe UI");
        element.setAttribute("font-weight", 500);

        container.append(element);

        this.selection.append(container);

        return container;
    },

    center(){
        const orientation = this.orientation.value;
        const breakDown = this.break.value;
        const width = valOrDefault(this.itemW.value, 50);
        const height = valOrDefault(this.itemH.value, 50);
        const nb = this.nbItem.value;

        switch(orientation){
            case "horizontal":
                if(breakDown > 0 && nb > breakDown){
                    this.selection.setAttribute("x", 200 - (breakDown * width) / 2);
                    console.log(Math.ceil(nb / breakDown));
                    this.selection.setAttribute("y", 200 - (Math.ceil(nb / breakDown) * height/ 2));
                }else{
                    this.selection.setAttribute("x", 200 - (nb * width) / 2);
                    this.selection.setAttribute("y", 200 - height / 2);
                }
                break;
            case "vertical":
                if(breakDown > 0 && nb > breakDown){
                    this.selection.setAttribute("y", 200 - (breakDown * height) / 2);
                    this.selection.setAttribute("x", 200 - (Math.ceil(nb / breakDown) * width/ 2));
                }else{
                    this.selection.setAttribute("y", 200 - (nb * height) / 2);
                    this.selection.setAttribute("x", 200 - width / 2);
                }
                break;
        }
    }



}

export const SelectionSimulation = Object.assign(
    Object.create(Simulation),
    BaseSelectionSimulation
);