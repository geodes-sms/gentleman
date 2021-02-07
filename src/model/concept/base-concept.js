import { isNullOrUndefined } from "zenkai";
import { Concept } from "./concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
    }
}

const _BaseConcept = {
    nature: "concrete",

    initValue(args) {
        if (isNullOrUndefined(args)) {
            return false;
        }

        const { id, attributes } = args;
        // this.id = id;

        attributes.forEach(attr => {
            const { name, value } = attr;

            let attribute = this.getAttributeByName(name);

            if (value) {
                attribute.target.initValue(value);
            }
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