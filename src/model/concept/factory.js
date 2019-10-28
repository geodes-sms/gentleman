import { BaseConcept } from "./base-concept.js";
import { StringConcept, SetConcept, NumberConcept } from "./primitive/index.js";
import { valOrDefault, isNullOrUndefined } from 'zenkai';

export const ConceptFactory = {
    createConcept(model, type, schema) {
        switch (type) {
            case 'string':
                return StringConcept.create(model);
            case 'number':
                return NumberConcept.create(model);
            case 'set':
                return SetConcept.create(model);
            default:
                return BaseConcept.create(model, schema);
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