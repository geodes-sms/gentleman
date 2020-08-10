import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { UUID } from '@utils/uuid.js';
import { StringConcept, SetConcept, BooleanConcept, NumberConcept, ReferenceConcept, BaseConcept, PrototypeConcept } from "./index.js";


function init(model, schema) {
    return {
        object: { value: "concept" },
        model: { value: model },
        schema: { value: schema },
    };
}

const Handler = {
    // Primitive
    string: (model, schema) => Object.create(StringConcept, init(model, schema)),
    number: (model, schema) => Object.create(NumberConcept, init(model, schema)),
    boolean: (model, schema) => Object.create(BooleanConcept, init(model, schema)),
    set: (model, schema) => Object.create(SetConcept, init(model, schema)),
    reference: (model, schema) => Object.create(ReferenceConcept, init(model, schema)),
    // Complex
    prototype: (model, schema) => Object.create(PrototypeConcept, init(model, schema)),
    concrete: (model, schema) => Object.create(BaseConcept, init(model, schema)),
    derivative: (model, schema) => Handler[schema.base](model, schema),
};

export const ConceptFactory = {
    createConcept(name, model, schema, args) {
        var handler = Handler[name] || Handler[schema.nature];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' concept could not be handled`);
        }

        var concept = handler(model, valOrDefault(schema, {}));
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