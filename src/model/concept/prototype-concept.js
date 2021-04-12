import {
    isString, isNullOrUndefined, isObject, isNullOrWhitespace, isEmpty,
    valOrDefault, toBoolean, hasOwn
} from "zenkai";
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
            if (this.default) {
                let concept = this.createConcept(this.default);
                this.setValue(concept);
            }

            return this;
        }

        const { id = "", value, name } = args;

        if (id.length > 10) {
            this.id = id;
        }

        let concept = null;
        if (value) {
            concept = this.createConcept(value.name, value);
        } else if (name) {
            concept = this.createConcept(name, args);
        }

        if (concept) {
            this.setValue(concept);
        }

        return this;
    },
    getValue(deep = false) {
        if (isNullOrUndefined(this.value)) {
            return null;
        }

        if (deep) {
            return this.target;
        }

        return this.value;
    },
    getTarget() {
        return this.target;
    },
    setValue(_value) {
        let value = _value.name || _value;
        
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

        let concept = _value;
        let isConcept = _value && _value.object === "concept" && hasOwn(_value, "id");

        if (!isConcept) {
            concept = this.createConcept(value);
        }

        if (this.target) {
            this.target.delete(true);
        }

        this.target = concept;
        this.value = value;

        this.notify("value.changed", this.value);
        this.model.notify("value.changed", this);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    removeValue() {
        if (isNullOrUndefined(this.value)) {
            return {
                success: true,
                message: "The value has been successfully updated."
            };
        }

        this.value = null;

        this.notify("value.changed", this.value);
        this.model.notify("value.changed", this);

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
            candidate => {
                return {
                    type: "meta-concept",
                    name: candidate.name,
                    concept: Object.create(metaConcept, {
                        object: { value: "meta-concept" },
                        type: { value: "meta-concept" },
                        name: { value: candidate.name },
                        model: { value: this.model },
                        schema: { value: candidate }
                    })
                };
            }
        );

        // this.candidates = resolveAccept.call(this, this.schema.accept).map(
        //     candidate => Object.create(Concept, {
        //         object: { value: "concept" },
        //         nature: { value: "fake" },
        //         model: { value: this.model },
        //         id: { value: this.hasValue() && this.value.name === candidate.name ? this.value.id : UUID.generate() },
        //         name: { value: candidate.name },
        //         schema: { value: candidate },
        //     }).init(this)
        // );

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

        if (isNullOrUndefined(name)) {
            children.push(this.target);
        } else if (this.target.name === name) {
            children.push(this.target);
        }

        return children;
    },

    createConcept(name, _value) {
        let value = this.model.getValue(_value);

        const options = {
            parent: this,
            ref: this,
        };

        if (value) {
            options.value = value;
        }

        const concept = this.model.createConcept(name, options);

        // const schema = this.model.getCompleteModelConcept({ name: name });
        // const concept = this._createConcept(this.model, schema, options);

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

    copy(save = true) {
        if (!this.hasValue()) {
            return null;
        }

        const copy = {
            name: this.name,
            nature: this.nature,
            value: this.target.copy(false)
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    export() {
        let value = null;

        if (this.hasValue()) {
            value = {
                id: this.target.id,
                name: this.target.name
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

const metaConcept = {
    /**
     * Gets the value of a property
     * @param {string} name 
     */
    getProperty(name, meta) {
        if (name === "refname") {
            return this.name;
        }

        if (name === "name") {
            return this.name;
        }

        let propSchema = valOrDefault(this.schema.properties, []);
        let property = propSchema.find(prop => prop.name === name);

        if (isNullOrUndefined(property)) {
            return undefined;
        }

        const { type, value } = property;

        if (type === "string") {
            return value;
        }

        if (type === "number") {
            return +value;
        }

        if (type === "boolean") {
            return toBoolean(value);
        }

        return value;
    },
    hasPrototype(name) {
        if (isNullOrUndefined(this.schema.prototype)) {
            return false;
        }

        let prototype = this.model.getConceptSchema(this.schema.prototype);

        while (!isNullOrUndefined(prototype)) {
            if (prototype.name === name) {
                return true;
            }

            prototype = this.model.getConceptSchema(prototype.prototype);
        }

        return false;
    }
};


export const PrototypeConcept = Object.assign({},
    Concept,
    BasePrototypeConcept
);