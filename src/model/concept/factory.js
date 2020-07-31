import { isNullOrUndefined, cloneObject, hasOwn } from 'zenkai';
import { UUID } from '@utils/uuid.js';
import {
    StringConcept,
    SetConcept,
    BooleanConcept,
    NumberConcept,
    ReferenceConcept,
    BaseConcept,
    PrototypeConcept
} from "./index.js";


const DefaultSchema = {
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
                view: "text"
            }
        ]
    },
    boolean: {
        projection: [
            {
                type: "field",
                view: "binary"
            }
        ]
    },
    number: {
        projection: [
            {
                type: "field",
                view: "text"
            }
        ]
    },
    reference: {
        projection: [
            {
                type: "field",
                view: "link"
            }
        ]
    },
    prototype: {
        projection: [
            {
                type: "field",
                view: "choice"
            }
        ]
    }
};

const resolveSchema = (conceptName, customSchema) => {
    if (isNullOrUndefined(customSchema)) {
        return cloneObject(DefaultSchema[conceptName]);
    }

    var schema = cloneObject(customSchema);
    if (schema && !hasOwn(schema, 'projection')) {
        schema.projection = cloneObject(DefaultSchema[conceptName].projection);
    }

    return schema;
};

const Handler = {
    // Primitive
    string: (model, schema) => StringConcept.create(model, resolveSchema('string', schema)),
    number: (model, schema) => NumberConcept.create(model, resolveSchema('number', schema)),
    boolean: (model, schema) => BooleanConcept.create(model, resolveSchema('boolean', schema)),
    set: (model, schema) => SetConcept.create(model, resolveSchema('set', schema)),
    reference: (model, schema) => ReferenceConcept.create(model, resolveSchema('reference', schema)),
    // Complex
    prototype: (model, schema) => PrototypeConcept.create(model, resolveSchema('prototype', schema)),
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