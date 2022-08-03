import { isNullOrUndefined } from "zenkai";
import { Canvas } from "./canvas.js";
import { Group } from "./group.js";
import { Circle } from "./circle.js";
import { Holder } from "./holder.js";
import { Rectangle } from "./rect.js";
import { Ellipse } from "./ellipse.js";
import { Polygon } from "./polygon.js";
import { Path } from "./path.js";

var inc = 0;
const nextId = () => `algo${inc++}`;

const Handler = {
    'canvas': (model, schema, projection) => Object.create(Canvas, {
        object: { value: "shape" },
        name: { value: "canvas-shape" },
        type: { value: "canvas" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'group': (model, schema, projection) => Object.create(Group, {
        object: { value: "shape" },
        name: { value: "group-shape" },
        type: { value: "group" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'circle': (model, schema, projection) => Object.create(Circle, {
        object: { value: "shape" },
        name: { value: "circle-shape" },
        type: { value: "circle" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'holder': (model, schema, projection) => Object.create(Holder, {
        object: { value: "shape" },
        name: { value: "holder-shape" },
        type: { value: "holder" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'rectangle':(model, schema, projection) => Object.create(Rectangle, {
        object: { value: "shape" },
        name: { value: "rectangle-shape" },
        type: { value: "rectangle" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'ellipse':(model, schema, projection) => Object.create(Ellipse, {
        object: { value: "shape" },
        name: { value: "ellipse-shape" },
        type: { value: "ellipse" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'polygon':(model, schema, projection) => Object.create(Polygon, {
        object: { value: "shape" },
        name: { value: "polygon-shape" },
        type: { value: "polygon" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'path':(model, schema, projection) => Object.create(Path, {
        object: { value: "shape" },
        name: { value: "path-shape" },
        type: { value: "path" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
};

export const ShapeFactory = {
    createShape(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];
        
        if (isNullOrUndefined(handler)) {
            throw new TypeError(`Missing handler: The '${type}' shape could not be handled`);
        }
        
        const shape = handler(model, schema, projection);

        if (isNullOrUndefined(shape)) {
            throw new Error(`Bad request: The '${type}' shape could not be created`);
        }

        shape.createShape = this.createShape;

        if (isNullOrUndefined(shape.id)) {
            shape.id = nextId();
        }

        return shape;
    }
};