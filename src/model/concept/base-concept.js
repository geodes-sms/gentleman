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
    restore(state) {
        const { attributes } = state;

        attributes.forEach(attr => {
            const { name, id, value } = attr;

            if (!this.isAttributeCreated(name)) {
                this.createAttribute(name, value);
            }
        });
    },
    hasValue() {
        return true;
    },
    getValue() {
        return {
            name: this.name,
            attributes: this.getAttributes().map(attr => {
                return {
                    "name": attr.name,
                    "value": attr.copy(false)
                };
            })
        };
    }
};

export const BaseConcept = Object.assign(
    Object.create(Concept),
    _BaseConcept
);