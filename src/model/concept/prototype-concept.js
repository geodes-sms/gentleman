import { UUID } from "@utils/uuid.js";
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

        const { id, value } = args;

        // this.id = id;

        if (value) {
            return;
            let concept = this.createConcept(value.name, value);
            this.setValue(concept);
        } else if (args.name) {
            let concept = this.createConcept(args.name, args);
            this.setValue(concept);
        }

        return this;
    },
    getValue() {
        return this.value;
    },
    exportValue() {
        if (!this.hasValue()) {
            return null;
        }

        let concept = this.getValue();

        return concept.exportValue();

    },
    setValue(_value) {
        let value = isObject(_value) ? _value.name : _value;

        let result = this.validate(value);

        if (result !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated.",
                errors: [
                    responseHandler(result).message
                ]
            };
        }

        var concept = value;
        if (isString(value)) {
            concept = this.createConcept(value);
            if(isObject(_value)) {
                concept.id = _value.id;
            }
        }

        if (this.value) {
            this.value.getChildren().forEach(child => {
                child.delete(true);
                // this.model.removeConcept(this.value.id);
            });

            this.model.removeConcept(this.value.id);
            this.value.notify("delete");
        }

        this.value = concept;

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
        if (this.candidates) {
            return this.candidates;
        }

        this.candidates = resolveAccept.call(this, this.schema.accept).map(
            candidate => Object.create(Concept, {
                object: { value: "concept" },
                nature: { value: "fake" },
                model: { value: this.model },
                id: { value: UUID.generate() },
                name: { value: candidate.name },
                schema: { value: candidate },
            }).init(this)
        );

        return this.candidates;
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

    createConcept(name, _value) {
        let value = this.model.getValue(_value);

        const options = {
            parent: this.parent,
            ref: this.ref,
        };

        if (value) {
            options.value = value;
        }

        const schema = this.model.getCompleteModelConcept({ name: name });
        const concept = this._createConcept(this.model, schema, options);

        concept.prototype = this;

        return concept;
    },
    validate(value) {
        if (isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

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
        let value = null;

        if (this.hasValue()) {
            let concept = this.getValue();

            value = {
                id: concept.id,
                name: concept.name
            };
        }

        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: value,
        };
    },
};

function resolveAccept(accept) {
    const candidates = this.model.getConcreteConcepts(this.name);

    if (isNullOrUndefined(accept)) {
        return candidates;
    }

    if (Array.isArray(accept)) {
        return candidates.filter(candidate => accept.some(x => x.name === candidate.name));
    }

    return candidates.filter(candidate => accept === candidate.name);
}


export const PrototypeConcept = Object.assign({},
    Concept,
    BasePrototypeConcept
);