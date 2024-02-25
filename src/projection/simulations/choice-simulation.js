import { Simulation } from "./simulation";

const { isNullOrUndefined } = require("zenkai");

const BaseChoiceSimulation = {
    
    init(args) {
        Object.assign(this.schema, args);

        const { expanded = true } = this.schema;

        this.expanded = expanded;

        return this;
    },

    render() {

        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "choice";
            this.container.dataset.id = this.id;

            this.container.setAttribute("width", 320);
            this.container.setAttribute("height", 100);
        }

        if(isNullOrUndefined(this.choices)) {
            this.createChoices();
        }

        console.log(this);

        if(isNullOrUndefined(this.direction)) {
            this.direction = this.source.parent.parent.getAttributeByName("direction").target;
            this.direction.register(this.projection);
        }

        if(!this.expanded) {

        }

        this.bindEvents();

        this.update();

        return this.container;
    },

    createChoices() {
        this.choices = [];

        const letters = ["A", "B", "C"];

        for(let i = 0; i < 3; i++) {
            const projection = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            projection.setAttribute("width", 32);
            projection.setAttribute("height", 32);

            const holder = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            holder.setAttribute("width", 30);
            holder.setAttribute("height", 30);
            holder.setAttribute("x", 1);
            holder.setAttribute("y", 1);
            holder.setAttribute("stroke", "black");
            holder.setAttribute("stroke-width", 1);
            holder.setAttribute("fill", "transparent");

            
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = letters[i];
            text.setAttribute("x", 16);
            text.setAttribute("y", 16);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("font-size", "20");
            text.setAttribute("font-family", "Segoe UI");

            projection.append(holder);
            projection.append(text)
            this.container.append(projection);

            this.choices.push(projection);
        }
    },

    expandVertical() {
        this.container.setAttribute("height", 320);
        for(let i = 0; i < 3; i++) {
            this.choices[i].setAttribute("y", i * 32 + (i + 1) * 56);
            this.choices[i].setAttribute("x", 144);
        }
    },

    expandHorizontal() {
        this.container.setAttribute("height", 100);
        for(let i = 0; i < 3; i++) {
            this.choices[i].setAttribute("x", i * 32 + (i + 1) * 56);
            this.choices[i].setAttribute("y", 42);
        }
    },

    update() {

        if(this.expanded) {
            if(this.direction.getValue() == "vertical") {
                this.expandVertical();
            } else {
                this.expandHorizontal();
            }

            return;
        }
    },

    bindEvents() {
        this.projection.registerHandler("value.changed", () => {
            this.update();
        });
    }
}

export const ChoiceSimulation = Object.assign( 
    Object.create(Simulation),
    BaseChoiceSimulation
)