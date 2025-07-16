import { Simulation } from "./../simulation";

const { isNullOrUndefined } = require("zenkai");

const BaseRectShapeSimulation = {
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
            this.container.dataset.view = "rect-shape";
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

        if (isNullOrUndefined(this.rectElement)) {
            this.rectElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            
            this.rectElement.dataset.nature = "simulation-component";
            this.rectElement.dataset.view = "rect";
            this.rectElement.dataset.id = this.id;

            this.container.append(this.rectElement);
        }

        this.bindEvents();

        return this.container;
    },

    updateRect() {
        this.rectElement.setAttribute("width", this.witdhAttr.getValue());
        this.rectElement.setAttribute("height", this.heightAttr.getValue());
        
        this.rectElement.setAttribute("rx", this.rxAttr.getValue());
        this.rectElement.setAttribute("ry", this.ryAttr.getValue());

        this.rectElement.setAttribute("fill", this.fillAttr.getValue());
        this.rectElement.setAttribute("opacity", this.opacityAttr.getValue());

        this.rectElement.setAttribute("stroke-width", this.strokeWidthAttr.getValue());
        this.rectElement.setAttribute("stroke", this.strokeAttr.getValue());

        this.updateContainer();
    },

    updateContainer() {
        const maxWidth = Math.max(this.width, this.witdhAttr.getValue() + 2 * this.strokeWidthAttr.getValue() + 10);
        const maxHeight = Math.max(this.height, this.heightAttr.getValue() + 2 * this.strokeWidthAttr.getValue() + 10);

        const ratio =  Math.max(maxWidth / this.width, maxHeight / this.height);

        const width = this.width * ratio;
        const height = this.height * ratio;

        const x = width / 2 - this.witdhAttr.getValue() / 2;
        const y = height /2 - this.heightAttr.getValue() / 2;

        const viewBox = "0 0 " + width + " " + height;

        this.container.setAttribute("viewBox", viewBox);

        this.background.setAttribute("width", width);
        this.background.setAttribute("height", height);

        this.rectElement.setAttribute("x", x);
        this.rectElement.setAttribute("y", y);
    },

    register() {
        this.witdhAttr = this.source.getAttributeByName("width").target;
        this.witdhAttr.register(this.projection);

        this.heightAttr = this.source.getAttributeByName("height").target;
        this.heightAttr.register(this.projection);

        this.rxAttr = this.source.getAttributeByName("rx").target;
        this.rxAttr.register(this.projection);

        this.ryAttr = this.source.getAttributeByName("ry").target;
        this.ryAttr.register(this.projection);

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
        this.projection.registerHandler("displayed", () => {
            this.updateRect();
        })

        this.projection.registerHandler("value.changed", () => {
            this.updateRect();
        })

        this.register();
    }
}

export const RectShapeSimulation = Object.assign(
    Object.create(Simulation),
    BaseRectShapeSimulation
)