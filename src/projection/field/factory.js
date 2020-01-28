import { valOrDefault } from 'zenkai';
import { SetField } from './set-field.js';
import { StringField } from './string-field.js';
import { Field } from './field.js';
import { ReferenceField } from './reference-field.js';

export const FieldFactory = {
    createField(type, model, schema) {
        switch (type) {
            case 'number':
            case 'string':
                return StringField.create(model);
            case 'reference':
                return ReferenceField.create(model);
            case 'set':
                return SetField.create(model);
            default:
                return createBaseField(model, schema);
        }
    }
};

/**
 * 
 * @param {*} model 
 * @param {*} schema 
 */
function createBaseField(model, schema) {
    var base = valOrDefault(schema.base, 'concept');

    return Field.create({ _mAttribute: this.concept.parent.schema });
}