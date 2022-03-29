import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { BinaryField } from './binary-field.js';
import { ChoiceField } from './choice-field.js';
import { ListField } from './list-field.js';
import { TableField } from './table-field.js';
import { TextField } from './text-field.js';


const Handler = {
    'binary': (model, schema, projection) => Object.create(BinaryField, {
        object: { value: "field" },
        name: { value: "binary-field" },
        type: { value: "binary" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'choice': (model, schema, projection) => Object.create(ChoiceField, {
        object: { value: "field" },
        name: { value: "choice-field" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'list': (model, schema, projection) => Object.create(ListField, {
        object: { value: "field" },
        name: { value: "list-field" },
        type: { value: "list" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'table': (model, schema, projection) => Object.create(TableField, {
        object: { value: "field" },
        name: { value: "table-field" },
        type: { value: "table" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'text': (model, schema, projection) => Object.create(TextField, {
        object: { value: "field" },
        name: { value: "text-field" },
        type: { value: "text" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    }),
};

var inc = 0;
const nextId = () => `field${inc++}`;

export const FieldFactory = {
    createField(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${type}' field could not be handled`);
        }

        var field = handler(model, schema, projection);

        if (isNullOrUndefined(field)) {
            throw new Error(`Bad request: The '${type}' field could not be created`);
        }

        field.errors = [];
        field.readonly = valOrDefault(schema.readonly, false);

        if (isNullOrUndefined(field.id)) {
            field.id = nextId();
        }

        return field;
    }
};