import { BaseConcept } from "./base-concept.js";
import { StringConcept, SetConcept, NumberConcept } from "./primitive/index.js";
import { valOrDefault, isNullOrUndefined } from 'zenkai';

export const ConceptFactory = {
    createConcept(model, name, schema) {
        var concept = null;
        
        switch (name) {
            case 'string':
                concept = StringConcept.create(model);
                break;
            case 'number':
                concept = NumberConcept.create(model);
                break;
            case 'set':
                concept = SetConcept.create(model);
                break;
            default:
                concept = BaseConcept.create(model, schema);
                break;
        }

        if (isNullOrUndefined(concept)) {
            // error handler
            console.error(`The '${name}' concept could not be created`);
            
            return null;
        }

        concept.id = model.generateId(); 
        concept.name = name;
        concept.attributes = [];
        concept._attributes = [];
        concept.components = [];
        concept._components = [];

        return concept;
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