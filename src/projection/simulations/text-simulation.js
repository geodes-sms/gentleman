import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseTextSimulation = {

    init(args) {
        Object.assign(this.schema, args);

        const { width = 70, height = 70, detailed = false } = this.schema;

        this.width = width;
        this.height = height;

        return this;
    },

    render() {

        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "text";
            this.container.dataset.id = this.id;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height)

        }

        if(isNullOrUndefined(this.landmark)) {
            this.createLandmark();
        }


        if(isNullOrUndefined(this.textElement)) {
            this.createTextElement();
        }

        this.multiline = this.source.getAttributeByName("multiline").target;
        this.content = this.source.hasAttribute("content") ? this.source.getAttributeByName("content").target : this.source.getAttributeByName("placeholder").target;
        this.anchor = this.source.getAttributeByName("anchor").target;
        this.baseline = this.source.getAttributeByName("baseline").target;

        const style = this.source.getAttributeByName("style").target;
        this.font = style.getAttributeByName("font").target;
        this.size = style.getAttributeByName("size").target;
        this.color = style.getAttributeByName("color").target;
        this.weight = style.getAttributeByName("weight").target


        this.bindEvents();

        this.update();

        return this.container;

    },

    createLandmark() {
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", 5);
        xAxis.setAttribute("y1", this.height / 2);
        xAxis.setAttribute("x2", this.width - 5);
        xAxis.setAttribute("y2", this.height / 2);
        this.styleAxis(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", this.width / 2);
        yAxis.setAttribute("y1", 5);
        yAxis.setAttribute("x2", this.width / 2);
        yAxis.setAttribute("y2", this.height - 5);
        this.styleAxis(yAxis);

        this.container.append(xAxis);
        this.container.append(yAxis);

        this.landmark = { x: xAxis, y: yAxis};
    },

    styleAxis(axis) {
        axis.setAttribute("stroke", "#5c222c");
        axis.setAttribute("stroke-width", "1");
        axis.setAttribute("stroke-dasharray", "3");
    },

    createTextElement() {
        this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.textElement.setAttribute("x", this.width / 2);
        this.textElement.setAttribute("y", this.height / 2);

        if(!this.detailed) {
            this.textElement.setAttribute("lengthAdjust", "spacing");
        }

        this.container.append(this.textElement);

    },

    update() {
        this.textElement.textContent = valOrDefault(this.content.getValue());
        this.textElement.setAttribute("text-anchor", this.anchor.getValue());
        this.textElement.setAttribute("dominant-baseline", this.baseline.getValue());

        this.textElement.setAttribute("font-family", this.font.getValue());
        this.textElement.setAttribute("font-size", this.size.getValue());
        this.textElement.setAttribute("fill", this.color.getValue());
        this.textElement.setAttribute("font-weight", this.weight.getValue());

        this.resize();
    },

    resize() {
        const rect = this.textElement.getBBox();

        let x = Math.min(rect.x - 5, 0);
        let y = Math.min(rect.y - 5, 0);
        let w = Math.max(rect.x + rect.width + 5, this.width);
        let h = Math.max(rect.y + rect.height +  5, this.height);

        this.container.setAttribute("viewBox", x + " " + y + " " + w + " " + h);

        console.log(this);

        this.landmark.x.setAttribute("x1", x);
        this.landmark.x.setAttribute("x2", w);
        this.landmark.x.setAttribute("y1", h / 2);
        this.landmark.x.setAttribute("y2", h / 2);

        this.landmark.y.setAttribute("x1", w / 2);
        this.landmark.y.setAttribute("x2", w / 2);
        this.landmark.y.setAttribute("y1", y);
        this.landmark.y.setAttribute("y2", h);
        
        this.textElement.setAttribute("x", w / 2);
        this.textElement.setAttribute("y", h / 2 );
    },

    bindEvents() {
        this.multiline.register(this.projection);
        this.content.register(this.projection);
        this.anchor.register(this.projection);
        this.baseline.register(this.projection);

        this.font.register(this.projection);
        this.size.register(this.projection);
        this.color.register(this.projection);
        this.weight.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.update();
        })
    }
   
}

export const TextSimulation = Object.assign(
    Object.create(Simulation),
    BaseTextSimulation
);