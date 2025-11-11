const { isNullOrUndefined } = require("zenkai");
import { Simulation } from "./simulation";


const BaseConnectorStyleSimulation = {
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

        if(isNullOrUndefined(this.connector)) {
            this.connector = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.connector.dataset.nature = "simulation-component";
            this.connector.dataset.view = "connector";
            this.connector.dataset.id = this.id;

            this.connector.setAttribute("x1", 45);
            this.connector.setAttribute("x2", 255);
            this.connector.setAttribute("y1", 35);
            this.connector.setAttribute("y2", 35);

            this.container.append(this.connector);
        }

        this.bindEvents();
        this.update();

        return this.container;
    },

    update() {
        this.connector.setAttribute("stroke", this.color.value);
        this.connector.setAttribute("stroke-width", this.stroke.value);
        this.connector.setAttribute("stroke-opacity", this.opacity.value);
        
        if(this.linecap.getValue()) {
            this.connector.setAttribute("stroke-linecap", "round");
        } else {
            this.connector.setAttribute("stroke-linecap", "butt");
        }

        if(this.dasharray.getValue()) {
            this.connector.setAttribute("stroke-dasharray", this.stroke.value * 2);
        } else {
            this.connector.removeAttribute("stroke-dasharray");
        }
    },
    
    bindEvents() {
        const color = this.source.getAttributeByName("color").target;
        this.color = color.getAttributeByName("value").target;
        this.color.register(this.projection);

        this.stroke = this.source.getAttributeByName("stroke").target;
        this.stroke.register(this);

        this.linecap = this.source.getAttributeByName("rounded-linecap").target;
        this.linecap.register(this);

        this.dasharray = this.source.getAttributeByName("dasharray").target;
        this.dasharray.register(this);

        this.opacity = this.source.getAttributeByName("opacity").target;
        this.opacity.register(this);

        this.projection.registerHandler("value.changed", () => {
            this.update();
        })

        this.projection.registerHandler("displayed", () => {
            this.update();
        })
    }
}

export const ConnectorStyleSimulation = Object.assign(
    Object.create(Simulation),
    BaseConnectorStyleSimulation
)