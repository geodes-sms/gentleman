import { isNullOrUndefined } from "zenkai";

import { ForceSimulation } from "./force-simulation";
import { TextSimulation } from "./text-simulation";
import { SelectionSimulation } from "./selection-simulation";
import { ContentSimulation } from "./content-simulation";
import { PatternSimulation } from "./pattern-simulation";
import { SetSimulation } from "./set-simulation";
import { TreeSimulation } from "./tree-simulation";
import { TextAnchorSimulation } from "./text-anchor-simulation";
import { TextBaselineSimulation } from "./text-baseline-simulation";
import { TextStyleSimulation } from "./text-style-simulation";
import { ChoiceDisplaySimulation } from "./choices-display-simulation";
import { RectShapeSimulation } from "./shapes/rect-shape-simulation";
import { CircleShapeSimulation } from "./shapes/circle-shape-simulation";
import { EllipseShapeSimulation } from "./shapes/ellipse-shape-simulation";
import { LineShapeSimulation } from "./shapes/line-shape-simulation";
import { PathShapeSimulation } from "./shapes/path-shape-simulation";
import { ShapeSimulation } from "./shapes/shape-simulation";

var inc = 0;
const nextId = () => `algo${inc++}`;

const Handler = {
    'force': (model, schema, projection) => Object.create(ForceSimulation, {
        object: { value: "simulation" },
        name: { value: "force-simulation" },
        type: { value: "force" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text': (model, schema, projection) => Object.create(TextSimulation, {
        object: { value: "simulation" },
        name: { value: "text-simulation" },
        type: { value: "text" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'selection': (model, schema, projection) => Object.create(SelectionSimulation, {
        object: { value: "simulation" },
        name: { value: "selection-simulation" },
        type: { value: "selection" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'content': (model, schema, projection) => Object.create(ContentSimulation, {
        object: { value: "simulation" },
        name: { value: "content-simulation" },
        type: { value: "content" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'pattern': (model, schema, projection) => Object.create(PatternSimulation, {
        object: { value: "simulation" },
        name: { value: "pattern-simulation" },
        type: { value: "pattern" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'set': (model, schema, projection) => Object.create(SetSimulation, {
        object: { value: "simulation" },
        name: { value: "set-simulation" },
        type: { value: "set" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'tree': (model, schema, projection) => Object.create(TreeSimulation, {
        object: { value: "simulation" },
        name: { value: "tree-simulation" },
        type: { value: "tree" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-anchor': (model, schema, projection) => Object.create(TextAnchorSimulation, {
        object: { value: "simulation" },
        name: { value: "text-anchor-simulation" },
        type: { value: "text-anchor" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-baseline': (model, schema, projection) => Object.create(TextBaselineSimulation, {
        object: { value: "simulation" },
        name: { value: "text-baseline-simulation" },
        type: { value: "text-baseline" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-style': (model, schema, projection) => Object.create(TextStyleSimulation, {
        object: { value: "simulation" },
        name: { value: "text-style-simulation" },
        type: { value: "text-style" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'choices-display': (model, schema, projection) => Object.create(ChoiceDisplaySimulation, {
        object: { value: "simulation" },
        name: { value: "choice-display-simulation" },
        type: { value: "choice-display" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'rect-shape': (model, schema, projection) => Object.create(RectShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "rect-shape-simulation" },
        type: { value: "rect-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'circle-shape': (model, schema, projection) => Object.create(CircleShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "circle-shape-simulation" },
        type: { value: "circle-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'ellipse-shape': (model, schema, projection) => Object.create(EllipseShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "ellipse-shape-simulation" },
        type: { value: "ellipse-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'line-shape': (model, schema, projection) => Object.create(LineShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "line-shape-simulation" },
        type: { value: "line-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'path-shape': (model, schema, projection) => Object.create(PathShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "path-shape-simulation" },
        type: { value: "path-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'root-shape': (model, schema, projection) => Object.create(ShapeSimulation, {
        object: { value: "simulation" },
        name: { value: "path-shape-simulation" },
        type: { value: "path-shape" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
};

export const SimulationFactory = {
    createSimulation(model, schema, projection) {

        const { type } = schema;

        const handler = Handler[type];
        
        if (isNullOrUndefined(handler)) {
            throw new TypeError(`Missing handler: The '${type}' simulation could not be handled`);
        }
        
        const simulation = handler(model, schema, projection);

        if (isNullOrUndefined(simulation)) {
            throw new Error(`Bad request: The '${type}' simulation could not be created`);
        }

        simulation.createSimulation = this.createSimulation;

        if (isNullOrUndefined(simulation.id)) {
            simulation.id = nextId();
        }

        return simulation;
    }
};