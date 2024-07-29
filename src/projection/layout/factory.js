import { isNullOrUndefined } from "zenkai";
import { StackLayout } from "./stack-layout.js";
import { WrapLayout } from "./wrap-layout.js";
import { TableLayout } from "./table-layout.js";
import { FlexLayout } from "./flex-layout.js";
import { Visualizer } from "./visualizer.js";


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
        source: { value: projection.concept, writable: true },
    }),
    'wrap': (model, schema, projection) => Object.create(WrapLayout, {
        object: { value: "layout" },
        name: { value: "wrap-layout" },
        type: { value: "wrap" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'table': (model, schema, projection) => Object.create(TableLayout, {
        object: { value: "layout" },
        name: { value: "table-layout" },
        type: { value: "table" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'flex': (model, schema, projection) => Object.create(FlexLayout, {
        object: { value: "layout" },
        name: { value: "flex-layout" },
        type: { value: "flex" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
    'visualizer': (model, schema, projection) => Object.create(Visualizer, {
        object: { value: "layout" },
        name: { value: "svg-layout" },
        type: { value: "svg" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
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

        if (isNullOrUndefined(layout)) {
            throw new Error(`Bad request: The '${type}' layout could not be created`);
        }

        layout.createLayout = this.createLayout;

        if (isNullOrUndefined(layout.id)) {
            layout.id = nextId();
        }

        return layout;
    }
};