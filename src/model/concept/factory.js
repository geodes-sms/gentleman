import './concept.js';
import { BaseConcept } from "./base-concept.js";
import { StringConcept } from "./primitive/string-concept.js";
import { valOrDefault } from '@zenkai/utils/datatype/index.js';

export const ConceptFactory = {
    createConcept(model, type, schema) {
        switch (type) {
            case 'boolean':
            case 'integer':
            case 'number':
            case 'string':
                return StringConcept.create(model);
            default:
                return createBaseConcept(model, schema);
        }
    }
};

function createBaseConcept(model, schema) {
    var base = valOrDefault(schema.base, 'concept');

    if (base === 'string') {
        let stringConcept = StringConcept.create(model);
        stringConcept.values = schema.values;
        return stringConcept;
    }

    return BaseConcept.create(model, schema);
}