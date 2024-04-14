import { Simulation } from "./simulation";

const { isNullOrUndefined, isHTMLElement } = require("zenkai");

const BaseImageSimulation = {
    default: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><rect x=\"0.5\" y=\"0.5\" width=\"39\" height=\"39\" fill=\"transparent\" stroke=\"#3b3bba\" stroke-width=\"1\" stroke-dasharray=\"0 20 40 40 40 20\"/><text x=\"20\" y=\"20\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-size=\"10\" font-family=\"Segoe UI\">Empty</text></svg>",


    init(args) {
        Object.assign(this.schema, args);

        const { width, height } = this.schema;

        this.width = width;
        this.height = height;

        return this;
    },

    render() {
        let parser = new DOMParser();

        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");


            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "image";
            this.container.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.defaultView)) {
            this.defaultView = parser.parseFromString(this.default, "image/svg+xml").documentElement;
        }

        this.updateContent();

        this.bindEvents();

        return this.container;
    },

    updateContent() {
        const value = this.source.getValue();

        if(!isNullOrUndefined(this.content)) {
            this.content.remove();
        }

        let parser = new DOMParser();
        const content = parser.parseFromString(value, "image/svg+xml").documentElement;

        if(isHTMLElement(content)) {
            this.setDefaultView();
        } else {
            this.setCustomView(content);
        }
        
    },

    setCustomView(content) {
        this.defaultView.remove();

        this.container.append(content);

        this.content = content;

        let box = content.getBBox();

        if(box.width == 0 && box.height == 0) {
            this.setDefaultView();
            return;
        }
        
        if (box.width > box.height) {
            this.container.setAttribute("viewBox", "0 0 " + box.width + " " + box.width);
        } else {
            this.container.setAttribute("viewBox", "0 0 " + box.height + " " + box.height);
        }
    },

    setDefaultView() {
        this.container.setAttribute("width", this.width);
        this.container.setAttribute("height", this.height);

        this.container.setAttribute("viewBox", "0 0 40 40");
        this.container.append(this.defaultView);
    },
    
    bindEvents() {
        this.projection.registerHandler("displayed", () => {
            console.log("Displayed");
            this.updateContent();
        })

        this.projection.registerHandler("value.changed", () => {
            this.updateContent();
        })
    }

}

export const ImageSimulation = Object.assign(
    Object.create(Simulation),
    BaseImageSimulation
)