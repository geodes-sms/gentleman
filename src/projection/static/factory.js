import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { BinaryField } from './binary-field.js';
import { ChoiceField } from './choice-field.js';
import { LinkField } from './link-field.js';
import { TextField } from './text-field.js';


const Handler = {
    'audio': (model, schema, concept) => Object.create(BinaryField, {
        object: { value: "field" },
        name: { value: "binary-field" },
        type: { value: "binary" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        source: { value: concept },
    }),
    'image': (model, schema, concept) => Object.create(ChoiceField, {
        object: { value: "field" },
        name: { value: "choice-field" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        source: { value: concept },
    }),
    'link': (model, schema, concept) => Object.create(LinkField, {
        object: { value: "field" },
        name: { value: "link-field" },
        type: { value: "link" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        source: { value: concept },
    }),
    'text': (model, schema, concept) => Object.create(TextField, {
        object: { value: "field" },
        name: { value: "text-field" },
        type: { value: "text" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        source: { value: concept },
    }),
};

var inc = 0;
const nextId = () => `static${inc++}`;

export const StaticFactory = {
    createField(model, schema, concept) {
        const { type } = schema;

        const handler = Handler[type];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' field could not be handled`);
        }

        var field = handler(model, schema, concept);

        if (isNullOrUndefined(field)) {
            throw new Error(`Bad request: The '${name}' field could not be created`);
        }

        field.errors = [];
        field.readonly = valOrDefault(schema.readonly, false);
        field.initObserver();

        if (isNullOrUndefined(field.id)) {
            field.id = nextId();
        }

        return field;
    }
};