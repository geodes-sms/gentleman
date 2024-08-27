import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation";

const First = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">1</text></svg>"
const Second = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">2</text></svg>"
const Third = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">3</text></svg>" 

const BaseChoiceDisplaySimulation = {
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
            this.container.dataset.view = "choice-display";
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
            this.choices.dataset.view = "text-anchor";
            this.choices.dataset.id = this.id;

            const parser = new DOMParser();

            this.choices.append(parser.parseFromString(First.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);
            this.choices.append(parser.parseFromString(Second.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);
            this.choices.append(parser.parseFromString(Third.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);

            this.container.append(this.choices);
        }

        this.bindEvents();

        return this.container;
    },


    update() {
        const orientation = this.orientation.getValue();
        const padding = this.padding.getValue();

        const choices = this.choices.childNodes;

        switch(orientation) {
            case "horizontal":
                const width = 90 + 2 * padding;

                if( 300 < width + 40) {
                    this.width = width + 40;
                } else {
                    this.width = 300
                }

                this.height = 75 * this.width / 300;

                choices[0].setAttribute("x", this.width / 2 - 45 - padding);
                choices[0].setAttribute("y", this.height / 2 - 15);

                choices[1].setAttribute("x", this.width / 2 - 15);
                choices[1].setAttribute("y", this.height / 2 - 15);

                choices[2].setAttribute("x", this.width / 2 + 15 +  padding);
                choices[2].setAttribute("y", this.height / 2 - 15);

                this.container.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);

                this.background.setAttribute("width", this.width);
                this.background.setAttribute("height", this.height);

                break;
            case "vertical":
                const height = 90 + 2 * padding;

                if(75 < height + 10) {
                    this.height = height + 10;
                } else {
                    this.height = 75
                }
                
                this.width = 300 * this.height / 75;

                choices[0].setAttribute("x", this.width / 2 - 15);
                choices[0].setAttribute("y", this.height / 2 - 45 - padding);

                choices[1].setAttribute("x", this.width / 2 - 15);
                choices[1].setAttribute("y", this.height / 2 - 15);

                choices[2].setAttribute("x", this.width / 2 - 15);
                choices[2].setAttribute("y", this.height / 2 + 15 + padding);

                this.container.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
                
                this.background.setAttribute("width", this.width);
                this.background.setAttribute("height", this.height);
                
                break;
        }
    },


    bindEvents() {
        this.orientation = this.source.getAttributeByName("orientation").target;
        this.orientation.register(this);

        this.padding = this.source.getAttributeByName("padding").target;
        this.padding.register(this);

        this.projection.registerHandler("value.changed", () => {
            this.update();
        })

        this.projection.registerHandler("displayed", () => {
            this.update();
        })
    }
    
}

export const ChoiceDisplaySimulation = Object.assign(
    Object.create(Simulation),
    BaseChoiceDisplaySimulation
)