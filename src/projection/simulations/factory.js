import { isNullOrUndefined } from "zenkai";

import { ForceSimulation } from "./force-simulation";
import { TextSimulation } from "./text-simulation";
import { SelectionSimulation } from "./selection-simulation";
import { ContentSimulation } from "./content-simulation";
import { PatternSimulation } from "./pattern-simulation";
import { SetSimulation } from "./set-simulation";
import { TreeSimulation } from "./tree-simulation";
import { ChoiceSimulation } from "./choice-simulation";
import { TextAnchorSimulation } from "./text-anchor-simulation";
import { TextBaselineSimulation } from "./text-baseline-simulation";
import { TextStyleSimulation } from "./text-style-simulation";

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
    'choice': (model, schema, projection) => Object.create(ChoiceSimulation, {
        object: { value: "simulation" },
        name: { value: "choice-simulation" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-anchor': (model, schema, projection) => Object.create(TextAnchorSimulation, {
        object: { value: "simulation" },
        name: { value: "choice-simulation" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-baseline': (model, schema, projection) => Object.create(TextBaselineSimulation, {
        object: { value: "simulation" },
        name: { value: "choice-simulation" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'text-style': (model, schema, projection) => Object.create(TextStyleSimulation, {
        object: { value: "simulation" },
        name: { value: "choice-simulation" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    })
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