import { isNullOrUndefined } from 'zenkai';
import { UUID } from '@utils/uuid.js';
import { StringConcept, SetConcept, BooleanConcept, NumberConcept, ReferenceConcept, BaseConcept, PrototypeConcept, MetaConcept } from "./index.js";


function init(model, schema) {
    return {
        object: { value: "concept" },
        type: { value: "concept" },
        model: { value: model },
        name: { value: schema.name },
        base: { value: schema.base },
        schema: { value: schema, writable: true },
    };
}

const PrimitiveHandler = {
    boolean: (model, schema) => Object.create(BooleanConcept, init(model, schema)),
    number: (model, schema) => Object.create(NumberConcept, init(model, schema)),
    reference: (model, schema) => Object.create(ReferenceConcept, init(model, schema)),
    set: (model, schema) => Object.create(SetConcept, init(model, schema)),
    string: (model, schema) => Object.create(StringConcept, init(model, schema)),
    meta: (model, schema) => Object.create(MetaConcept, init(model, schema)),
};

const Handler = {
    primitive: (model, schema) => PrimitiveHandler[schema.name](model, schema),
    prototype: (model, schema) => Object.create(PrototypeConcept, init(model, schema)),
    concrete: (model, schema) => Object.create(BaseConcept, init(model, schema)),
    derivative: (model, schema) => PrimitiveHandler[schema.base](model, schema),
};

export const ConceptFactory = {
    createConcept(model, schema, args) {
        const { name, nature } = schema;

        const handler = Handler[nature];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${name}' concept could not be handled`);
        }

        const concept = handler(model, schema);

        if (isNullOrUndefined(concept)) {
            throw new Error(`Bad request: The '${name}' concept could not be created`);
        }
        concept._createConcept = this.createConcept;
        
        concept.init(args);

        if (isNullOrUndefined(concept.id)) {
            concept.id = UUID.generate();
        }

        return concept;
    }
};