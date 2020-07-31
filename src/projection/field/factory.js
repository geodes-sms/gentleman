import { ChoiceField } from './choice-field.js';
import { BinaryField } from './binary-field.js';
import { LinkField } from './link-field.js';
import { ListField } from './list-field.js';
import { TableField } from './table-field.js';
import { TextField } from './text-field.js';
import { isNullOrUndefined } from 'zenkai';


const Handler = {
    'choice': (concept, schema) => ChoiceField.create(concept, schema),
    'binary': (concept, schema) => BinaryField.create(concept, schema),
    'link': (concept, schema) => LinkField.create(concept, schema),
    'list': (concept, schema) => ListField.create(concept, schema),
    'table': (concept, schema) => TableField.create(concept, schema),
    'text': (concept, schema) => TextField.create(concept, schema),
};

var inc = 0;
const nextId = () => `field${inc++}`;

export const FieldFactory = {
    createField(schema, concept) {
        const { view } = schema;
        var handler = Handler[view];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' field could not be handled`);
        }

        var field = handler(concept, schema);

        if (isNullOrUndefined(field)) {
            throw new Error(`Bad request: The '${name}' field could not be created`);
        }

        if (isNullOrUndefined(field.id)) {
            field.id = nextId();
        }

        return field;
    }
};