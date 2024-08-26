import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation.js"

const Cue = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\" viewBox=\"0 0 10 10\"><line x1=\"5\" x2=\"5\" y1=\"0\" y2=\"10\" stroke=\"black\" stroke-width=\"1\"></line><line x1=\"0\" x2=\"10\" y1=\"5\" y2=\"5\" stroke=\"black\" stroke-width=\"1\"></line><circle fill=\"red\" cx=\"5\" cy=\"5\" r=\"1\"></circle></svg>";

const BaseTextAnchorSimulation = {
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
            this.container.dataset.view = "text-anchor";
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
            this.textElement.dataset.view = "text-anchor";
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

        if(isNullOrUndefined(this.visualCue)) {
            const parser = new DOMParser();

            this.visualCue = parser.parseFromString(Cue.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            
            /*this.visualCue.dataset.nature = "simulation-component";
            this.visualCue.dataset.view = "text-anchor";
            this.visualCue.dataset.id = this.id;*/

            this.container.append(this.visualCue);
        }


        this.bindEvents();

        return this.container
    },

    updateAnchor() {
        const anchor = this.source.getValue();
        const box = this.textElement.getBBox();;
        switch(anchor) {
            case "start":
                this.visualCue.setAttribute("x", box.x - 5);
                break;
            case "middle":
                this.visualCue.setAttribute("x", box.x + box.width / 2 - 5);
                break;
            case "end":
                this.visualCue.setAttribute("x", box.x + box.width - 5);
                break;
        }

        this.visualCue.setAttribute("y", box.y + box.height - 10);
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

export const TextAnchorSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextAnchorSimulation
)