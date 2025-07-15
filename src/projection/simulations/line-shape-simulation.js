import { Simulation } from "./simulation";

const { isNullOrUndefined } = require("zenkai");

const BaseLineShapeSimulation = {
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
            this.container.dataset.view = "line-shape";
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

        if (isNullOrUndefined(this.lineElement)) {
            this.lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
            
            this.lineElement.dataset.nature = "simulation-component";
            this.lineElement.dataset.view = "line";
            this.lineElement.dataset.id = this.id;

            this.container.append(this.lineElement);
        }

        this.bindEvents();

        return this.container;
    },

    updateLine() {
        this.lineElement.setAttribute("stroke-width", this.strokeWidthAttr.getValue());
        this.lineElement.setAttribute("stroke", this.strokeAttr.getValue());

        this.updateContainer();
    },

    updateContainer() {
        const height = Math.max(this.height, this.strokeWidthAttr.getValue() * 2 + 30);
        const width = this.width * (height / this.height);

        const x1 = width / 8;
        const x2 = width - x1;

        const y = height /2;

        const viewBox = "0 0 " + width + " " + height;

        this.container.setAttribute("viewBox", viewBox);

        this.background.setAttribute("width", width);
        this.background.setAttribute("height", height);

        this.lineElement.setAttribute("x1", x1);
        this.lineElement.setAttribute("y1", y);
        this.lineElement.setAttribute("x2", x2);
        this.lineElement.setAttribute("y2", y);
    },

    register() {
        this.strokeWidthAttr = this.source.getAttributeByName("stroke-width").target;
        this.strokeWidthAttr.register(this.projection);

        this.strokeAttr = this.source.getAttributeByName("stroke").target.getAttributeByName("value").target;
        this.strokeAttr.register(this.projection);
    },

    bindEvents() {
        this.projection.registerHandler( "displayed", () => {
            this.updateLine();
        })

        this.projection.registerHandler( "value.changed", () =>{
            this.updateLine();
        })

        this.register();
    }
}

export const LineShapeSimulation = Object.assign(
    Object.create(Simulation),
    BaseLineShapeSimulation
) 