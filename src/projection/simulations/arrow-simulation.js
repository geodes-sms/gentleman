import { ContentHandler } from './../content-handler.js';
import { isNullOrUndefined } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseArrowSimulation = {

    init(){
        this.width = 350;
        this.height = 100;

        return this;
    },

    focusIn(){

    },

    focusOut(){

    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.setAttribute("width", 300);
            this.container.setAttribute("height", 50)
            this.container.setAttribute("x", 100);
            this.container.setAttribute("y", 0);

            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            if(this.schema.wider){
                this.path.setAttribute("d", "M 0 25 L 275 25");
            }else{
                this.path.setAttribute("d", "M 0 25 L 200 25");   
            }

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "arrow";
            this.container.dataset.id = this.id;

            this.container.id = this.id;

            this.path.id = "path" + this.id;

            this.container.append(this.path);
        }

        this.markerStart = ContentHandler.call(this, {
            type: "attribute",
            name: "start",
            placeholder: false,
            tag: "simulation-start"
        })

        this.markerEnd = ContentHandler.call(this, {
            type: "attribute",
            name: "end",
            placeholder: false,
            tag: "simulation-end"
        })


        this.container.append(this.markerStart);
        this.container.append(this.markerEnd);

        this.bindEvents();

        return this.container;
        
    },

    applyStyle(){
        if(this.stroke.hasValue()){
            this.path.setAttribute("stroke", this.stroke.value);
        }

        if(this.width.hasValue()){
            this.path.setAttribute("stroke-width", this.width.value);
        }

        if(this.dasharray.hasValue()){
            this.path.setAttribute("stroke-dasharray", this.dasharray.value);
        }

        if(this.linecap.hasValue()){
            this.path.setAttribute("stroke-linecap", this.linecap.value);
        }
    },

    bindEvents(){
        this.stroke = this.source.getAttributeByName("stroke").target;
        this.stroke.register(this.projection);

       this.path.setAttribute("stroke", "black");

        this.width = this.source.getAttributeByName("width").target;
        this.width.register(this.projection);

        if(this.width.hasValue()){
            this.path.setAttribute("stroke-width", this.width.value);
        }

        this.dasharray = this.source.getAttributeByName("dasharray").target;
        this.dasharray.register(this.projection);

        if(this.dasharray.hasValue()){
            this.path.setAttribute("stroke-dasharray", this.dasharray.value);
        }

        this.linecap = this.source.getAttributeByName("linecap").target;
        this.linecap.register(this.projection);

        if(this.linecap.hasValue()){
            this.path.setAttribute("stroke-linecap", this.linecap.value);
        }

        this.projection.registerHandler("value.changed", () => {
            this.applyStyle()
        })

    }

}

export const ArrowSimulation = Object.assign(
    Object.create(Simulation),
    BaseArrowSimulation
);