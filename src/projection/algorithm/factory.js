import { isNullOrUndefined } from "zenkai";
import { ForceAlgorithm } from "./force-algorithm.js";
import { PatternAlgorithm } from "./pattern-algorithm.js";
import { DecorationAlgorithm } from "./decoration-algorithm.js";
import { AlgorithmHolder } from "./algorithm-holder.js";
import { AnchorAlgorithm } from "./anchor-algorithm.js";
import { AltView } from "./alt-view.js";
import { Add } from "./add.js";
import { SVGButton } from "./button.js";
import { TreeLayout } from "./tree-algorithm.js";

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
    'holder': (model, schema, projection) => Object.create(AlgorithmHolder, {
        object: { value: "algorithm" },
        name: { value: "holder-algorithm" },
        type: { value: "holder" },
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
    'alt-view': (model, schema, projection) => Object.create(AltView, {
        object: { value: "algorithm" },
        name: { value: "alt-view" },
        type: { value: "alt-view" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'add': (model, schema, projection) => Object.create(Add, {
        object: { value: "algorithm" },
        name: { value: "add" },
        type: { value: "add" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'button': (model, schema, projection) => Object.create(SVGButton, {
        object: { value: "algorithm" },
        name: { value: "svg-button" },
        type: { value: "button" },
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