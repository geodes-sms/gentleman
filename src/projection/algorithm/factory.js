import { isNullOrUndefined } from "zenkai";
import { ForceAlgorithm } from "./force-algorithm.js";
import { PatternAlgorithm } from "./pattern-algorithm.js";

var inc = 0;
const nextId = () => `algo${inc++}`;

const Handler = {
    'force': (model, schema, projection) => Object.create(ForceAlgorithm, {
        object: { value: "algorithm" },
        name: { value: "force-algorithm" },
        type: { value: "force" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'pattern': (model, schema, projection) => Object.create(PatternAlgorithm, {
        object: { value: "algorithm" },
        name: { value: "pattern-algorithm" },
        type: { value: "pattern" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
};

export const AlgorithmFactory = {
    createAlgo(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];
        
        if (isNullOrUndefined(handler)) {
            throw new TypeError(`Missing handler: The '${type}' algo could not be handled`);
        }

        const layout = handler(model, schema, projection);

        if (isNullOrUndefined(layout)) {
            throw new Error(`Bad request: The '${type}' algo could not be created`);
        }

        layout.createAlgo = this.createAlgo;

        if (isNullOrUndefined(layout.id)) {
            layout.id = nextId();
        }

        return layout;
    }
};