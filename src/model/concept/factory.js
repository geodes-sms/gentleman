import { isNullOrUndefined } from 'zenkai';
import { UUID } from '@utils/uuid.js';
import { StringConcept, SetConcept, NumberConcept, ReferenceConcept, BaseConcept, PrototypeConcept } from "./index.js";

const primitiveHandler = {
    string: (model, schema) => StringConcept.create(model),
    number: (model, schema) => NumberConcept.create(model),
    set: (model, schema) => SetConcept.create(model),
    reference: (model, schema) => ReferenceConcept.create(model)
};

const complexHandler = {
    prototype: (model, schema) => PrototypeConcept.create(model, schema),
    concrete: (model, schema) => BaseConcept.create(model, schema),
    derivative: (model, schema) => primitiveHandler[schema.base](model)
};

export const ConceptFactory = {
    createConcept(name, model, schema, args) {
        var handler = primitiveHandler[name] || complexHandler[schema.nature];
        if (isNullOrUndefined(handler)) {
            throw new Error(`The '${name}' concept could not be created`);
        }

        var concept = handler(model, schema);

        if (isNullOrUndefined(concept)) {
            throw new Error(`The '${name}' concept could not be created`);
        }

        concept.id = UUID.generate();
        concept.name = name;

        concept.init(args);

        return concept;
    }
};