import { isNullOrUndefined } from "zenkai";

import { Simulation } from "./simulation";
import { ForceSimulation } from "./force-simulation";
import { ArrowSimulation } from "./arrow-simulation";
import { TextSimulation } from "./text-simulation";
import { SelectionSimulation } from "./selection-simulation";
import { MarkerSimulation } from "./marker-simulation";
import { ContentSimulation } from "./content-simulation";
import { PatternSimulation } from "./pattern-simulation";
import { MultiSimulation } from "./multi-simulation";
import { SubPathSimulation } from "./sub-path";

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
    'arrow': (model, schema, projection) => Object.create(ArrowSimulation, {
        object: { value: "simulation" },
        name: { value: "arrow-simulation" },
        type: { value: "arrow" },
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
    'marker': (model, schema, projection) => Object.create(MarkerSimulation, {
        object: { value: "simulation" },
        name: { value: "marker-simulation" },
        type: { value: "marker" },
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
    'multi': (model, schema, projection) => Object.create(MultiSimulation, {
        object: { value: "simulation" },
        name: { value: "multi-simulation" },
        type: { value: "multi" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'sub-path': (model, schema, projection) => Object.create(SubPathSimulation, {
        object: { value: "simulation" },
        name: { value: "subPath-simulation" },
        type: { value: "subPath" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
};

export const SimulationFactory = {
    createSimulation(model, schema, projection) {
        console.log(schema);

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

        console.log("About to return simu");
        console.log(simulation);

        return simulation;
    }
};