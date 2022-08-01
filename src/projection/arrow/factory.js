import { isNullOrUndefined } from "zenkai";
import { AnchorArrow } from "./anchor-arrow.js";
import { ForceArrow } from "./force-arrow.js";
import { MultiArrow } from "./multi-arrow.js";


var inc = 0;
const nextId = () => `algo${inc++}`;

const Handler = {
    'force': (model, schema, projection) => Object.create(ForceArrow, {
        object: { value: "arrow" },
        name: { value: "force-arrow" },
        type: { value: "force" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'anchor': (model, schema, projection) => Object.create(AnchorArrow, {
        object: { value: "arrow" },
        name: { value: "anchor-arrow" },
        type: { value: "anchor" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'multi': (model, schema, projection) => Object.create(MultiArrow, {
        object: { value: "arrow" },
        name: { value: "multi-arrow" },
        type: { value: "multi" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    })
};

export const ArrowFactory = {
    createArrow(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];
        
        if (isNullOrUndefined(handler)) {
            throw new TypeError(`Missing handler: The '${type}' arrow could not be handled`);
        }
        
        const arrow = handler(model, schema, projection);

        if (isNullOrUndefined(arrow)) {
            throw new Error(`Bad request: The '${type}' arrow could not be created`);
        }

        arrow.createArrow = this.createArrow;

        if (isNullOrUndefined(arrow.id)) {
            arrow.id = nextId();
        }

        return arrow;
    }
};