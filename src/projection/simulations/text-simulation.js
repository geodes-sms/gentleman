import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseTextSimulation = {

    init(args) {
        Object.assign(this.schema, args);

        return this;
    },

    render() {
        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "text";
            this.container.dataset.id = this.id;
            this.container.id = this.id;

            this.container.setAttribute("width", 200);
            this.container.setAttribute("height", 200);
        }

        if(isNullOrUndefined(this.borders)) {
            this.borders = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            this.borders.setAttribute("fill", "transparent");
            this.borders.setAttribute("stroke", "black");
            this.borders.setAttribute("stroke-width", 3);
            this.borders.setAttribute("rx", 5);

            this.borders.setAttribute("width", 194);
            this.borders.setAttribute("height", 194);
            this.borders.setAttribute("x", 3);
            this.borders.setAttribute("y", 3);

            this.container.append(this.borders);
        }

        if(isNullOrUndefined(this.simulator)){
            this.simulator = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.simulator.textContent = "Gentleman";

            this.simulator.setAttribute("x", 97);
            this.simulator.setAttribute("y", 97);

            this.container.append(this.simulator);
        }

        this.registerAttributes();
        this.registerStyle();

        this.update();

        this.bindEvents();

        return this.container;
    },

    registerAttributes() {
        this.anchor = this.source.getAttributeByName("anchor").target;
        this.baseline = this.source.getAttributeByName("baseline").target;

        this.anchor.register(this.projection);
        this.baseline.register(this.projection);
    },

    registerStyle() {
        const style = this.source.getAttributeByName("style").target;
        this.color = style.getAttributeByName("color").target.getAttributeByName("value").target;
        this.size = style.getAttributeByName("size").target.getAttributeByName("value").target;
        this.unit = style.getAttributeByName("size").target.getAttributeByName("unit").target;
        this.font = style.getAttributeByName("font").target;
        this.bold = style.getAttributeByName("bold").target;
        this.italic = style.getAttributeByName("italic").target;
        this.underline = style.getAttributeByName("underline").target;
        this.strikethrough = style.getAttributeByName("strikethrough").target;

        this.color.register(this.projection);
        this.size.register(this.projection);
        this.underline.register(this.projection);
        this.font.register(this.projection);
        this.bold.register(this.projection);
        this.italic.register(this.projection);
        this.underline.register(this.projection);
        this.strikethrough.register(this.projection);
    },

    update(){
        this.simulator.setAttribute("text-anchor", this.anchor.getValue());
        this.simulator.setAttribute("dominant-baseline", this.baseline.getValue());
        this.updateStyle();
    },

    updateStyle() {
        this.simulator.setAttribute("fill", this.color.getValue());
        this.simulator.setAttribute("font-size", this.size.getValue() + this.unit.getValue());
        this.simulator.setAttribute("font-family", this.font.getValue());
        this.simulator.setAttribute("font-weight", this.bold.getValue() ? "bold" : "normal");
        this.simulator.setAttribute("font-style", this.italic.getValue() ? "italic" : "normal");
        let textDecoration = ""
        
        if(this.underline.getValue()) {
            textDecoration += "underline";
        }

        if(this.strikethrough.getValue()) {
            textDecoration+= " line-through"
        }

        this.simulator.setAttribute("text-decoration", textDecoration);
    },

    bindEvents() {
        this.projection.registerHandler("value.changed", () => {
            console.log(this);
            this.update();
        })
    }
   
}

export const TextSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextSimulation
);