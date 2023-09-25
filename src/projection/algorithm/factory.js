import { isNullOrUndefined } from "zenkai";
import { ForceAlgorithm } from "./temp_force.js";
//import { PatternAlgorithm } from "./pattern-algorithm.js";
import { PatternAlgorithm } from "./temp_pattern.js";
import { DecorationAlgorithm } from "./decoration-algorithm.js";
import { AnchorAlgorithm } from "./anchor-algorithm.js";
import { TreeLayout } from "./tree-algorithm.js";
import { AdaptiveAlgorithm } from "./adaptive-algorithm.js";
import { WrapAlgoritm } from "./wrap-algorithm.js";

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
    'decoration':(model, schema, projection) => Object.create(DecorationAlgorithm, {
        object: { value: "algorithm" },
        name: { value: "decoration-algorithm" },
        type: { value: "decoration" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'anchor': (model, schema, projection) => Object.create(AnchorAlgorithm, {
        object: { value: "algorithm" },
        name: { value: "anchor-algorithm" },
        type: { value: "anchor" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'tree': (model, schema, projection) => Object.create(TreeLayout, {
        object: { value: "algorithm" },
        name: { value: "tree-layout" },
        type: { value: "tree" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'adaptive': (model, schema, projection) => Object.create(AdaptiveAlgorithm, {
        object: { value: "algorithm" },
        name: { value: "adaptive-layout" },
        type: { value: "adaptive" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'wrap': (model, schema, projection) => Object.create(WrapAlgoritm, {
        object: { value: "algorithm" },
        name: { value: "adaptive-layout" },
        type: { value: "adaptive" },
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