import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation";

const First = "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"45\" y=\"20\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect></svg>"
const Second = "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"105\" y=\"20\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect></svg>"
const Third = "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"165\" y=\"20\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect></svg>" 
const Fourth = "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"225\" y=\"20\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect></svg>" 


const BaseSimpleConnectorSimulation = {
    init(args) {
        Object.assign(this.schema, args);

        const { width, height } = this.schema;
        this.width = width;
        this.height = height;

        return this;
    },

    render() {
        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "simple-connector";
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

        if(isNullOrUndefined(this.choices)) {
            this.choices = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.choices.dataset.nature = "simulation-component";
            this.choices.dataset.view = "nodes";
            this.choices.dataset.id = this.id;

            const parser = new DOMParser();

            this.first = parser.parseFromString(First.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.second = parser.parseFromString(Second.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.third = parser.parseFromString(Third.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.fourth = parser.parseFromString(Fourth.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;

            this.choices.append(this.first);
            this.choices.append(this.second);
            this.choices.append(this.third);
            this.choices.append(this.fourth);

            this.container.append(this.choices);
        }

        if(isNullOrUndefined(this.connector)) {
            this.connector = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.connector.dataset.nature = "simulation-component";
            this.connector.dataset.view = "connector";
            this.connector.dataset.id = this.id;

            this.container.append(this.connector);
        }

        this.bindEvents();

        return this.container;
    },

    applyStyle() {
        this.connector.setAttribute("stroke", "black");
        this.connector.setAttribute("stroke-width", 1);
    },

    update() {

        this.applyStyle();

        switch(this.candidates.value) {
            case "always":
                this.first.classList.remove("hidden");
                this.second.classList.remove("hidden");
                this.third.classList.remove("hidden");
                this.fourth.classList.remove("hidden");
                break;
            case "selected": {
                this.first.classList.remove("hidden");
                this.second.classList.add("hidden");
                this.third.classList.add("hidden");
                this.fourth.classList.remove("hidden");
                break;
            }
            case "hidden": {
                this.first.classList.add("hidden");
                this.second.classList.add("hidden");
                this.third.classList.add("hidden");
                this.fourth.classList.add("hidden");
            }
        }

        switch(this.connection.value) {
            case "absolute":
                this.connector.setAttribute("x1", 45);
                this.connector.setAttribute("x2", 225);
                this.connector.setAttribute("y1", 20);
                this.connector.setAttribute("y2", 20)
                break;
            case "centered":
                this.connector.setAttribute("x1", 60);
                this.connector.setAttribute("x2", 240);
                this.connector.setAttribute("y1", 35);
                this.connector.setAttribute("y2", 35)
                break;
            case "bordered":
                this.connector.setAttribute("x1", 75);
                this.connector.setAttribute("x2", 225);
                this.connector.setAttribute("y1", 35);
                this.connector.setAttribute("y2", 35)
                break;
        }
    },

    bindEvents() {
        this.candidates = this.source.getAttributeByName("candidate-policy").target;
        this.candidates.register(this);

        this.connection = this.source.getAttributeByName("connection-point").target;
        this.connection.register(this);

        this.projection.registerHandler("displayed", () => {
            this.update();
        })

        this.projection.registerHandler("value.changed", () => {
            this.update();
        })
    }
}

export const SimpleConnectorSimulation = Object.assign(
    Object.create(Simulation),
    BaseSimpleConnectorSimulation
)