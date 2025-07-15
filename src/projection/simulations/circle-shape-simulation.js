import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation"

const  BaseCirclShapeSimulation = {
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
            this.container.dataset.view = "circle-shape";
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

        if(isNullOrUndefined(this.circleElement)) {
            this.circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            this.circleElement.dataset.nature = "simulation-component";
            this.circleElement.dataset.view = "circle";
            this.circleElement.dataset.id = this.id;

            this.container.append(this.circleElement);
        }

        this.bindEvents();

        return this.container;
    },

    updateCircle() {
        this.circleElement.setAttribute("r", this.radiusAttr.getValue());

        this.circleElement.setAttribute("fill", this.fillAttr.getValue());
        this.circleElement.setAttribute("opacity", this.opacityAttr.getValue());

        this.circleElement.setAttribute("stroke-width", this.strokeWidthAttr.getValue());
        this.circleElement.setAttribute("stroke", this.strokeAttr.getValue());

        this.updateContainer();
    },

    updateContainer() {
        const height = Math.max(this.height, this.radiusAttr.getValue() * 2 + 2 * this.strokeWidthAttr.getValue() + 10);
        const width = this.width * (height / this.height);

        const cx = width / 2;
        const cy = height / 2;

        const viewBox = "0 0 " + width + " " + height;

        this.container.setAttribute("viewBox", viewBox);

        this.background.setAttribute("width", width);
        this.background.setAttribute("height", height);

        this.circleElement.setAttribute("cx", cx);
        this.circleElement.setAttribute("cy", cy);
    },

    register() {
        this.radiusAttr = this.source.getAttributeByName("radius").target;
        this.radiusAttr.register(this.projection);

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
            this.updateCircle();
        })

        this.projection.registerHandler( "value.changed", () => {
            this.updateCircle();
        })

        this.register();
    }
}

export const CircleShapeSimulation = Object.assign(
    Object.create(Simulation),
    BaseCirclShapeSimulation
)