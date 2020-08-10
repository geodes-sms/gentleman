import { isNullOrWhitespace, isNullOrUndefined, isObject, isEmpty, isString } from "zenkai";
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

const _ReferenceConcept = {
    name: 'reference',
    reference: null,

    initValue(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        this.id = args.id;
        this.setValue(args.value);

        return this;
    },
    hasValue() {
        return !isNullOrWhitespace(this.value);
    },
    getValue() {
        if (isNullOrUndefined(this.value)) {
            return null;
        }

        return this.value;
    },
    getReference() {
        if (isNullOrUndefined(this.reference)) {
            return null;
        }

        return this.reference;
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

        if (isNullOrUndefined(value) || this.value === value) {
            return;
        }

        if (this.reference) {
            this.reference.unregister(this);
        }
        this.reference = this.model.getConcept(value);
        this.reference.register(this);

        this.value = value;
        this.notify("value.changed", this.reference);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },

    getCandidates() {
        if (isNullOrUndefined(this.accept)) {
            throw new Error("Bad reference: 'accept' property is not defined");
        }

        var candidates = resolveAccept.call(this, this.accept);

        var values = candidates.map((candidate) => ({
            type: "concept",
            value: candidate
        }));

        return values;
    },
    getChildren(name) {
        return [];
    },
    delete(force = false) {
        if (!force) {
            let result = this.getParent().remove(this);

            if (!result.success) {
                return result;
            }
        }
        
        if (this.reference) {
            this.reference.unregister(this);
        }

        this.model.removeConcept(this.id);

        this.notify("delete");

        return {
            message: `The concept '${name}' was successfully deleted.`,
            success: true,
        };
    },

    update(message, value) {
        switch (message) {
            case "delete":
                this.reference.unregister(this);
                this.value = null;
                this.reference = null;

                this.notify("value.changed", this.reference);
                break;

            default:
                break;
        }
        return true;
    },
    validate(value) {
        if (isNullOrWhitespace(value) || isEmpty(this.values)) {
            return ResponseCode.SUCCESS;
        }

        return ResponseCode.SUCCESS;
    },

    export() {
        return {
            id: this.id,
            name: this.name,
            value: this.value
        };
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });

        return output;
    }
};

function resolveAccept(accept) {
    if (isString(accept)) {
        const { concepts } = this.model;

        if (this.model.isPrototype(accept)) {
            return concepts.filter((concept) => concept.schema.prototype === accept);
        }

        return concepts.filter((concept) => concept.name === accept);
    }
    if (isObject(accept)) {
        const { name, scope, rel } = accept;

        if (rel === "parent") {
            let parent = this.getParent(scope);
            return parent.getChildren(name);
        }

        return resolveAccept.call(this, name);
    }

    return [];
}


export const ReferenceConcept = Object.assign({},
    Concept,
    _ReferenceConcept
);