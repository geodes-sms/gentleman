import { isEmpty, isNullOrUndefined } from "zenkai";
import { Concept } from "./concept.js";



const _BaseConcept = {
    nature: "concrete",

    initValue(args) {
        if (isNullOrUndefined(args)) {
            return false;
        }

        const { id = "", attributes = [] } = args;
        
        if (id.length > 10) {
            this.id = id;
        }
        
        attributes.forEach(attr => {
            const { name, id, value } = attr;

            this.createAttribute(name, value);
        });

        return true;
    },
    hasValue() {
        return true;
    },
    getValue() {
        return this.getAttributes().map(attr => {
            return {
                "name": attr.name,
                "value": attr.copy(false)
            };
        });
    },

    build() {
        const ConceptNature = {
            "concrete_concept": "concrete",
            "prototype_concept": "prototype",
        };
    }
};

export const BaseConcept = Object.assign(
    Object.create(Concept),
    _BaseConcept
);