import './concept.js';
import { BaseConcept } from "./base-concept.js";
import { StringConcept, SetConcept } from "./primitive/index.js";
import { valOrDefault } from '@zenkai';

export const ConceptFactory = {
    createConcept(model, type, schema) {
        if(['boolean', 'integer', 'number', 'string'].includes(type)){
            return StringConcept.create(model);
        }
        
        if (type.startsWith('set:')) {
            return SetConcept.create(model, type.substring(type.indexOf(':') + 1));
        }

        return createBaseConcept(model, schema);
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