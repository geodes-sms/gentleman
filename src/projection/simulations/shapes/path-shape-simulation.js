import { Simulation } from "./../simulation";

const { isNullOrUndefined } = require("zenkai");

const BasePathShapeSimulation = {
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
            this.container.dataset.view = "path-shape";
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

        if (isNullOrUndefined(this.pathElement)) {
            this.pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            
            this.pathElement.dataset.nature = "simulation-component";
            this.pathElement.dataset.view = "path";
            this.pathElement.dataset.id = this.id;

            this.container.append(this.pathElement);
        }

        this.bindEvents();

        return this.container;
    },

    updatePath() {
        this.pathElement.setAttribute("d", this.dAttr.getValue());

        this.pathElement.setAttribute("fill", this.fillAttr.getValue());
        this.pathElement.setAttribute("opacity", this.opacityAttr.getValue());

        this.pathElement.setAttribute("stroke-width", this.strokeWidthAttr.getValue());
        this.pathElement.setAttribute("stroke", this.strokeAttr.getValue());

        this.updateContainer();
    },

    updateContainer() {
        const bBox = this.pathElement.getBBox();

        const minX = Math.min(0, bBox.x - this.strokeWidthAttr.getValue() - 10);
        const minY = Math.min(0, bBox.y - this.strokeWidthAttr.getValue() - 10);
        const maxX = Math.max(this.width, bBox.x + bBox.width + this.strokeWidthAttr.getValue() + 10);
        const maxY = Math.max(this.height, bBox.y + bBox.height + this.strokeWidthAttr.getValue() + 10);

        const diffW = maxX - minX;
        const diffH = maxY - minY;

        const ratio = Math.max(diffW / this.width, diffH / this.height);

        const width = this.width * ratio;
        const height = this.height * ratio;

        const viewBox = minX + " " + minY + " " + width + " " + height;

        this.container.setAttribute("viewBox", viewBox);

        this.background.setAttribute("width", width);
        this.background.setAttribute("height", height);
    },

    register() {
        this.dAttr = this.source.getAttributeByName("d").target;
        this.dAttr.register(this.projection);

        this.fillAttr = this.source.getAttributeByName("fill").target.getAttributeByName("value").target;
        this.fillAttr.register(this.projection);

        this.opacityAttr = this.source.getAttributeByName("opacity").target;
        this.opacityAttr.register(this.projection);

        this.strokeWidthAttr = this.source.getAttributeByName("stroke-width").target;
        this.strokeWidthAttr.register(this.projection);

        this.strokeAttr = this.source.getAttributeByName("stroke").target.getAttributeByName("value").target;
        this.strokeAttr.register(this.projection);
    },

    bindEvents() {
        this.projection.registerHandler( "displayed", () => {
            this.updatePath();
        })

        this.projection.registerHandler( "value.changed", () => {
            this.updatePath();
        })

        this.register();
    }

}

export const PathShapeSimulation = Object.assign(
    Object.create(Simulation),
    BasePathShapeSimulation
)