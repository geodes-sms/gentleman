import { TextField } from './text-field.js';
import { ListField } from './list-field.js';
import { LinkField } from './link-field.js';
import { TableField } from './table-field.js';
import { ChoiceField } from './choice-field.js';
import { isNullOrUndefined } from 'zenkai';


const Handler = {
    'text': (model, schema) => TextField.create(model, schema),
    'link': (model, schema) => LinkField.create(model, schema),
    'list': (model, schema) => ListField.create(model, schema),
    'table': (model, schema) => TableField.create(model, schema),
    'choice': (model, schema) => ChoiceField.create(model, schema),
};

var inc = 0;
const nextId = () => `field${inc++}`;

export const FieldFactory = {
    createField(schema, model) {
        const { view } = schema;

        var handler = Handler[view];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' field could not be handled`);
        }

        var field = handler(model, schema);
        if (isNullOrUndefined(field)) {
            throw new Error(`Bad request: The '${name}' field could not be created`);
        }

        if (isNullOrUndefined(field.id)) {
            field.id = nextId();
        }

        return field;
    }
};