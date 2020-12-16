import { isNullOrUndefined } from "zenkai";
import { StackLayout } from "./stack-layout.js";
import { WrapLayout } from "./wrap-layout.js";


var inc = 0;
const nextId = () => `layout${inc++}`;


const Handler = {
    'stack': (model, schema, projection) => Object.create(StackLayout, {
        object: { value: "layout" },
        name: { value: "stack-layout" },
        type: { value: "stack" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    }),
    'wrap': (model, schema, projection) => Object.create(WrapLayout, {
        object: { value: "layout" },
        name: { value: "wrap-layout" },
        type: { value: "wrap" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    })
};

export const LayoutFactory = {
    createLayout(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];

        if (isNullOrUndefined(handler)) {
            throw new TypeError(`Missing handler: The '${type}' layout could not be handled`);
        }

        const layout = handler(model, schema, projection);
        layout.createLayout = this.createLayout;

        if (isNullOrUndefined(layout)) {
            throw new Error(`Bad request: The '${type}' layout could not be created`);
        }

        if (isNullOrUndefined(layout.id)) {
            layout.id = nextId();
        }

        return layout;
    }
};