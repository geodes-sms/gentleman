import { isEmpty, isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation.js"


const BaseTextStyleSimulation = {
    init(args) {
        Object.assign(this.schema, args);

        this.width = this.schema.width;
        this.height = this.schema.height;

        return this;
    },

    render() {
        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "text-baseline";
            this.container.dataset.id = this.id;
            
            this.background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.background.setAttribute("fill", "#f5f5f5");
            this.background.setAttribute("rx", 5);
            this.background.setAttribute("width", this.width);
            this.background.setAttribute("height", this.height);

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
            this.container.append(this.background);
        }
        
        if(isNullOrUndefined(this.textElement)) {
            this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.textElement.dataset.nature = "simulation-component";
            this.textElement.dataset.view = "text-baseline";
            this.textElement.dataset.id = this.id;

            this.textElement.textContent = "Gentleman";
            this.textElement.setAttribute("font-family", "Segoe UI");
            this.textElement.setAttribute("font-size", 22);

            this.textElement.setAttribute("text-anchor", "middle");
            this.textElement.setAttribute("dominant-baseline", "middle");

            this.textElement.setAttribute("x", 150);
            this.textElement.setAttribute("y", 37.5);

            this.container.append(this.textElement);
        }

        this.bindEvents();

        return this.container
    },

    update(){
        if(this.bold.getValue()) {
            this.textElement.setAttribute("font-weight", "bold");
        } else {
            this.textElement.removeAttribute("font-weight");
        }
        
        if(this.italic.getValue()) {
            this.textElement.setAttribute("font-style", "italic");
        } else {
            this.textElement.removeAttribute("font-style");
        }

        let textDecoration = "";

        if(this.underline.getValue()) {
            textDecoration += "underline "
        }

        if(this.strikethrough.getValue()) {
            textDecoration += "line-through ";
        }

        if(!isEmpty(textDecoration)) {
            this.textElement.setAttribute("text-decoration", textDecoration);
        } else {
            this.textElement.removeAttribute("text-decoration");
        }

        this.textElement.setAttribute("fill", this.color.getValue());
    },



    bindEvents() {
        const style = this.source.getAttributeByName("style").target;

        this.bold = style.getAttributeByName("bold").target;
        this.bold.register(this.projection);

        this.italic = style.getAttributeByName("italic").target;
        this.italic.register(this.projection);

        this.underline = style.getAttributeByName("underline").target;
        this.underline.register(this.projection);

        this.strikethrough = style.getAttributeByName("strikethrough").target;
        this.strikethrough.register(this.projection);

        const color = style.getAttributeByName("color").target;
        this.color = color.getAttributeByName("value").target;
        this.color.register(this.projection);
        
        this.projection.registerHandler("value.changed", () => {
            this.update();
        })

    }
}

export const TextStyleSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextStyleSimulation
)