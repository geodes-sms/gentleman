import { isString, isNullOrUndefined, isObject, isNullOrWhitespace, isEmpty } from "zenkai";
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

const BasePrototypeConcept = {
    name: 'prototype',
    nature: "prototype",

    initValue(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        var concept = this.createConcept(args.name, args);
        this.value = concept;

        return this;
    },
    getValue() {
        return this.value;
    },
    setValue(value) {
        var result = this.validate(value);

        if (result !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated.",
                errors: [
                    responseHandler(result).message
                ]
            };
        }

        if (isString(value)) {
            this.createConcept(value);
        } else {
            this.value = value;
        }
        this.notify("value.changed", this.value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    hasValue() {
        return !isNullOrUndefined(this.value);
    },

    getCandidates() {
        var candidates = resolveAccept.call(this, this.accept);

        var values = candidates.map((candidate) => ({
            type: "concept-metamodel",
            value: candidate.name,
            schema: candidate
        }));

        return values;
    },
    /**
     * Gets the concept parent if exist
     * @returns {Concept}
     */
    getChildren(name) {
        if (!this.hasValue()) {
            return [];
        }

        const children = [];
        const concept = this.getValue();

        if (isNullOrUndefined(name)) {
            children.push(concept);
        } else if (concept.name === name) {
            children.push(concept);
        }

        return children;
    },
    getDescendant(name) {
        return [];
    },

    createConcept(name, value) {
        var concept = null;

        var options = {
            parent: this.parent,
            refname: this.refname,
            reftype: this.reftype,
        };

        if (value) {
            options.value = value;
        }

        if (isString(name)) {
            concept = this.model.createConcept(name, options);
        }

        this.value = concept;
        concept.prototype = this;

        return concept;
    },
    validate(value) {
        if (isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

        // if(this.metamodel.getConcreteConcepts(this.name)) {

        // }

        if (isEmpty(this.values)) {
            return ResponseCode.SUCCESS;
        }

        var found = false;
        for (let i = 0; !found && i < this.values.length; i++) {
            const val = this.values[i];
            if (isObject(val)) {
                found = val.value === value;
            } else {
                found = val === value;
            }
        }

        if (!found) {
            return ResponseCode.INVALID_VALUE;
        }

        return ResponseCode.SUCCESS;
    },
    export() {
        if (!this.hasValue()) {
            return null;
        }

        return this.value.export();
    },
};

function resolveAccept(accept) {
    var candidates = this.metamodel.getConcreteConcepts(this.name);
    if (isNullOrUndefined(accept)) {
        return candidates;
    }

    if (Array.isArray(accept)) {
        return candidates.filter(candidate => accept.includes(candidate.name));
    }

    return candidates.filter(candidate => accept === candidate.name);
}


export const PrototypeConcept = Object.assign({},
    Concept,
    BasePrototypeConcept
);