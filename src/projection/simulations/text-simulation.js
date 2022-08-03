import { isNullOrUndefined } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseTextSimulation = {

    init(){
        this.width = 350;
        this.height = 100;

        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.setAttribute("width", 200);
            this.container.setAttribute("height", 200);
            this.container.setAttribute("viewBox", "0 0 50 50")

            this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.text.setAttribute("x", 25);
            this.text.setAttribute("y", 25);
            this.text.textContent = "Element";

            this.heightTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.heightTxt.setAttribute("x", 2);
            this.heightTxt.setAttribute("y", 45);
            this.heightTxt.setAttribute("font-size", 2);
            this.heightTxt.textContent = "dimensions: 50x50";

            this.xyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.xyText.setAttribute("x", 2);
            this.xyText.setAttribute("y", 47);
            this.xyText.setAttribute("font-size", 2);
            this.xyText.textContent = "x,y: 25, 25";

            this.container.append(this.text);
            this.container.append(this.widthTxt);
            this.container.append(this.heightTxt);
            this.container.append(this.xyText);

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "text";
            this.container.dataset.id = this.id;

            this.container.style = "border:solid rgb(135, 161, 255); border-radius:10%;";

            this.container.id = this.id;
        }

        this.bindEvents();

        return this.container;
        
    },

    applyStyle(){
        if(this.font.hasValue()){
            this.text.setAttribute("font-family", this.font.value);
        }

        if(this.size.hasValue()){
            this.text.setAttribute("font-size", this.size.value);
        }

        if(this.anchor.hasValue()){
            this.text.setAttribute("text-anchor", this.anchor.value);
        }

        if(this.weight.hasValue()){
            this.text.setAttribute("font-weight", this.weight.value);
        }

        if(this.baseline.hasValue()){
            this.text.style["dominant-baseline"] = this.baseline.value;
        }
    },

    bindEvents(){
        this.font = this.source.getAttributeByName("font").target;
        this.font.register(this.projection);

        this.text.setAttribute("font-family", "Verdana");

        this.size = this.source.getAttributeByName("size").target;
        this.size.register(this.projection);

        if(this.size.hasValue()){
            this.text.setAttribute("font-size", this.size.value);
        }

        this.weight = this.source.getAttributeByName("weight").target;
        this.weight.register(this.projection);

        if(this.weight.hasValue()){
            this.text.setAttribute("font-weight", this.weight.value);
        }

        this.anchor = this.source.getAttributeByName("anchor").target;
        this.anchor.register(this.projection);

        if(this.anchor.hasValue()){
            this.text.setAttribute("text-anchor", this.anchor.value);
        }

        this.baseline = this.source.getAttributeByName("baseline").target;
        this.baseline.register(this.projection);

        if(this.baseline.hasValue()){
            this.text.setAttribute("dominant-baseline", this.anchor.value);
        }

        this.projection.registerHandler("value.changed", () => {
            this.applyStyle()
        })

    }

}

export const TextSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextSimulation
);