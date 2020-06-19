import { valOrDefault, isNullOrWhitespace, isNullOrUndefined } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";


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

export const ReferenceConcept = extend(Concept, {
    name: 'reference',

    initValue(value) {
        this.value = valOrDefault(value, "");

        return this;
    },
    hasValue() {
        return !isNullOrWhitespace(this.value);
    },
    getValue() {
        if (isNullOrUndefined(this.value)) {
            return null;
        }

        return this.model.concepts.find((concept) => concept.id === this.value);
    },
    setValue(value) {
        if (isNullOrUndefined(value) || this.value == value) {
            return;
        }

        this.value = value;
        this.notify("value.changed", value);
    },

    update(value) {
        this.value = value;

        return true;
    },
    getCandidates() {
        const { concepts } = this.model;

        var candidates = [];
        var parent = this.getConceptParent();

        if (this.metamodel.isPrototype(this.accept)) {
            candidates = concepts.filter((concept) => concept !== parent && concept.prototype && concept.prototype.name === this.accept);
        } else {
            candidates = concepts.filter((concept) => concept !== parent && concept.name === this.accept);
        }

        var values = candidates.map((candidate) => ({
            type: "concept",
            id: candidate.id,
            name: candidate.name
        }));

        return values;
    },

    validate(value) {
        if (!Array.isArray(this.values) || isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

        if (!this.values.includes(value)) {
            return ResponseCode.INVALID_VALUE;
        }

        return ResponseCode.SUCCESS;
    },

    export() {
        return this.value;
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });

        return output;
    }
});