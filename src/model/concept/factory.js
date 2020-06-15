import { isNullOrUndefined, cloneObject } from 'zenkai';
import { UUID } from '@utils/uuid.js';
import {
    StringConcept,
    SetConcept,
    NumberConcept,
    ReferenceConcept,
    BaseConcept,
    PrototypeConcept
} from "./index.js";

const schemaHandler = {
    set: {
        projection: [
            {
                type: "field",
                view: "list",
            }
        ]
    },
    string: {
        projection: [
            {
                type: "field",
                view: "textbox"
            }
        ]
    }
};

const Handler = {
    // Primitive
    string: (model, schema) => StringConcept.create(model, schema),
    number: (model, schema) => NumberConcept.create(model, schema),
    set: (model, schema) => SetConcept.create(model, cloneObject(schemaHandler['set'])),
    reference: (model, schema) => ReferenceConcept.create(model, schema),
    // Complex
    prototype: (model, schema) => PrototypeConcept.create(model, schema),
    concrete: (model, schema) => BaseConcept.create(model, schema),
    derivative: (model, schema) => Handler[schema.base](model, schema),
};

export const ConceptFactory = {
    createConcept(name, model, schema, args) {
        var handler = Handler[name] || Handler[schema.nature];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' concept could not be handled`);
        }

        var concept = handler(model, schema);
        if (isNullOrUndefined(concept)) {
            throw new Error(`Bad request: The '${name}' concept could not be created`);
        }

        concept.name = name;
        concept.init(args);

        if (isNullOrUndefined(concept.id)) {
            concept.id = UUID.generate();
        }

        return concept;
    }
};