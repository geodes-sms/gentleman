import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation.js"


const BaseTextBaselineSimulation = {
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


        if(isNullOrUndefined(this.visualCue)) {
            this.visualCue = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.visualCue.setAttribute("opacity", "25%");
            this.visualCue.setAttribute("stroke", "black");
            
            this.container.append(this.visualCue);
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

    updateAnchor() {
        const anchor = this.source.getValue();
        const box = this.textElement.getBBox();;
        switch(anchor) {
            case "auto":
                this.visualCue.setAttribute("y1", box.y + box.height - 4);
                this.visualCue.setAttribute("y2", box.y + box.height - 4);
                break;
            case "middle":
                this.visualCue.setAttribute("y1", box.y + box.height / 2 + 2.5);
                this.visualCue.setAttribute("y2", box.y + box.height / 2 + 2.5);
                break;
            case "hanging":
                this.visualCue.setAttribute("y1", box.y + 6);
                this.visualCue.setAttribute("y2", box.y + 6);
                break;
        }

        this.visualCue.setAttribute("x1", box.x - 10);
        this.visualCue.setAttribute("x2", box.x + box.width + 10);
    },

    bindEvents() {
        this.projection.registerHandler("value.changed", () => {
            this.updateAnchor()
        })

        this.projection.registerHandler("displayed", () => {
            this.updateAnchor();
        })

        this.source.parent.register(this.projection);
    }
}

export const TextBaselineSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextBaselineSimulation
)