import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./../simulation"

const BaseShapeSimulation = {
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

        if(isNullOrUndefined(this.rootElement)) {
            this.rootElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.rootElement.dataset.nature = "simulation-component";
            this.rootElement.dataset.view = "shape";
            this.rootElement.dataset.id = this.id;

            this.container.append(this.rootElement)
        }

        if(isNullOrUndefined(this.groupElement)) {
            this.groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");

            this.groupElement.dataset.nature = "simulation-component";
            this.groupElement.dataset.view = "group";
            this.groupElement.dataset.id = this.id;

            this.source.getAttributeByName("elements").getValue().forEach( component => {
                const shapeComponent = component.getValue(true);
                const renderedShape = ShapeFactory.render(shapeComponent);

                this.groupElement.append(renderedShape);
            });

            this.rootElement.append(this.groupElement);
        }

        this.bindEvents();

        return this.container;
    },

    updateShape() {
        this.rootElement.setAttribute("width", this.widthAttr.getValue());
        this.rootElement.setAttribute("height", this.heightAttr.getValue());

        const viewBox = this.viewXAttr.getValue() + " " + this.viewYAttr.getValue() + " " + this.viewWAttr.getValue() + " " + this.viewHAttr.getValue();

        this.rootElement.setAttribute("viewBox", viewBox);

        this.groupElement.setAttribute("fill", this.fillAttr.getValue());
        this.groupElement.setAttribute("opacity", this.opacityAttr.getValue());
        this.groupElement.setAttribute("stroke", this.strokeAttr.getValue());
        this.groupElement.setAttribute("stroke-width", this.strokeWidthAttr.getValue());

        this.updateContainer();
    },

    updateContainer() {
        const maxWidth = Math.max(this.width, this.widthAttr.getValue() + 10);
        const maxHeight = Math.max(this.height, this.heightAttr.getValue() + 10);

        const ratio = Math.max(maxWidth / this.width, maxHeight / this.height);

        const width = this.width * ratio;
        const height = this.height * ratio;

        const x = width / 2 - this.widthAttr.getValue() / 2;
        const y = height /2 - this.heightAttr.getValue() / 2;

        const viewBox = "0 0 " + width + " " + height;

        this.container.setAttribute("viewBox", viewBox);

        this.background.setAttribute("width", width);
        this.background.setAttribute("height", height);

        this.rootElement.setAttribute("x", x);
        this.rootElement.setAttribute("y", y);
    },

    register() {
        this.widthAttr = this.source.getAttributeByName("width").target;
        this.widthAttr.register(this.projection);

        this.heightAttr = this.source.getAttributeByName("height").target;
        this.heightAttr.register(this.projection);

        const viewBoxAttr = this.source.getAttributeByName("viewBox").target;

        this.viewXAttr = viewBoxAttr.getAttributeByName("x").target;
        this.viewXAttr.register(this.projection);

        this.viewYAttr = viewBoxAttr.getAttributeByName("y").target;
        this.viewYAttr.register(this.projection);

        this.viewWAttr = viewBoxAttr.getAttributeByName("width").target;
        this.viewWAttr.register(this.projection);

        this.viewHAttr = viewBoxAttr.getAttributeByName("height").target;
        this.viewHAttr.register(this.projection);

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
            this.updateShape();
        })

        this.projection.registerHandler( "value.changed", () => {
            this.updateShape();
        })

        this.register();
    }

}


const ShapeFactory = {
    render(shape) {
        switch(shape.name) {
            case 'circle-component':
                return this.drawCircle(shape);
            case 'rect-component':
                return this.drawRect(shape);
            case 'ellipse-component':
                return this.drawEllipse(shape);
            case 'line-component':
                return this.drawLine(shape);
            case 'path-component':
                return this.drawPath(shape);
        }
    },

    drawCircle(shape) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        const coordinates = shape.getAttributeByName("coordinates").target;

        circle.setAttribute("cx", coordinates.getAttributeByName("x").target.getValue());
        circle.setAttribute("cy", coordinates.getAttributeByName("y").target.getValue());
        circle.setAttribute("r", shape.getAttributeByName("radius").target.getValue());

        this.fill(circle, shape);
        this.outline(circle, shape);

        return circle;
    },

    drawRect(shape) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        const coordinates = shape.getAttributeByName("coordinates").target;

        rect.setAttribute("x", coordinates.getAttributeByName("x").target.getValue());
        rect.setAttribute("y", coordinates.getAttributeByName("y").target.getValue());

        rect.setAttribute("width", shape.getAttributeByName("width").target.getValue());
        rect.setAttribute("height", shape.getAttributeByName("height").target.getValue());

        rect.setAttribute("rx", shape.getAttributeByName("rx").target.getValue());
        rect.setAttribute("ry", shape.getAttributeByName("ry").target.getValue());

        this.fill(rect, shape);
        this.outline(rect, shape);

        return rect;
    },

    drawEllipse(shape) {
        const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");

        const coordinates = shape.getAttributeByName("center").target;

        ellipse.setAttribute("cx", coordinates.getAttributeByName("x").target.getValue());
        ellipse.setAttribute("cy", coordinates.getAttributeByName("y").target.getValue());

        ellipse.setAttribute("rx", shape.getAttributeByName("rx").target.getValue());
        ellipse.setAttribute("ry", shape.getAttributeByName("ry").target.getValue());

        this.fill(ellipse, shape);
        this.outline(ellipse, shape);

        return ellipse;
    },

    drawLine(shape) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        const start = shape.getAttributeByName("start").target;
        const end = shape.getAttributeByName("end").target;

        line.setAttribute("x1", start.getAttributeByName("x").target.getValue());
        line.setAttribute("y1", start.getAttributeByName("y").target.getValue());

        line.setAttribute("x2", end.getAttributeByName("x").target.getValue());
        line.setAttribute("y2", end.getAttributeByName("y").target.getValue());

        this.outline(line, shape)

        return line;
    },

    drawPath(shape) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", shape.getAttributeByName("d").target.getValue());

        this.fill(path, shape);
        this.outline(path, shape);
        
        return path;
    },

    fill(component, shape) {
        component.setAttribute("fill", shape.getAttributeByName("fill").target.getAttributeByName("value").target.getValue());
        component.setAttribute("opacity", shape.getAttributeByName("opacity").target.getValue());
    },

    outline(component, shape) {
        component.setAttribute("stroke", shape.getAttributeByName("stroke").target.getAttributeByName("value").target.getValue());
        component.setAttribute("stroke-width", shape.getAttributeByName("stroke-width").target.getValue());
    }
}

export const ShapeSimulation = Object.assign(
    Object.create(Simulation),
    BaseShapeSimulation
)