import { Field } from './field.js';
import { TextField } from './text-field.js';
import { ListField } from './list-field.js';
import { LinkField } from './link-field.js';


export const FieldFactory = {
    createField(schema, model) {
        let { view } = schema;
        switch (view) {
            case 'textbox':
                return TextField.create(model, schema);
            case 'link':
                return LinkField.create(model, schema);
            case 'list':
                return ListField.create(model, schema);
            default:
                return Field.create(model, schema);
        }
    }
};