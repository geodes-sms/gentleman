import { isNullOrWhitespace, valOrDefault, isNullOrUndefined, isObject, isEmpty } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401,
    MINLENGTH_ERROR: 402,
    MAXLENGTH_ERROR: 403,
    FIXLENGTH_ERROR: 404,
    PATTERN_ERROR: 405,
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
        case ResponseCode.MAXLENGTH_ERROR:
            return {
                success: false,
                message: `The length of the value exceeds the maximum allowed: ${this.length.max.value}.`
            };
        case ResponseCode.MINLENGTH_ERROR:
            return {
                success: false,
                message: `The length of the value is beneath the minimum allowed: ${this.length.min.value}.`
            };
        case ResponseCode.FIXLENGTH_ERROR:
            return {
                success: false,
                message: `The length of the value is different from the fixed value: ${this.length.value}.`
            };
        case ResponseCode.PATTERN_ERROR:
            return {
                success: false,
                message: `The value does not match the valid pattern.`
            };
    }
}

const _StringConcept = {
    nature: 'primitive',
    /** @type {string} */
    pattern: null,

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.values = valOrDefault(this.schema.values, []);
        this.alias = this.schema.alias;
        this.default = valOrDefault(this.schema.default, "");
        this.description = this.schema.description;
        this.length = this.schema.length;
        this.pattern = this.schema.pattern;

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        if (isNullOrUndefined(args)) {
            this.value = this.default;

            return this;
        }


        if (isObject(args)) {
            // this.id = this.id || args.id;
            this.setValue(args.value);
        } else {
            this.setValue(args);
        }

        return this;
    },

    hasValue() {
        return !isNullOrWhitespace(this.value);
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
                    responseHandler.call(this, result).message
                ]
            };
        }

        this.value = value;

        this.notify("value.changed", value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },

    getCandidates() {
        this.values.forEach(value => {
            if (isObject(value)) {
                value.type = "value";
            }
        });

        return this.values;
    },
    getChildren(name) {
        return [];
    },

    update(message, value) {
        return true;
    },

    validate(value) {
        if (isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

        if (this.length) {
            const { min, max } = this.length;
            if (this.length.value && value.length !== this.length.value) {
                return ResponseCode.FIXLENGTH_ERROR;
            }

            if (min) {
                if (min.included && value.length < min.value) {
                    return ResponseCode.MINLENGTH_ERROR;
                }
                if (!min.included && value.length <= min.value) {
                    return ResponseCode.MINLENGTH_ERROR;
                }
            }

            if (max) {
                if (max.included && value.length > max.value) {
                    return ResponseCode.MAXLENGTH_ERROR;
                }
                if (!max.included && value.length >= max.value) {
                    return ResponseCode.MAXLENGTH_ERROR;
                }
            }
        }

        if (this.pattern && !(new RegExp(this.pattern, "gi")).test(value)) {
            return ResponseCode.PATTERN_ERROR;
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

    build() {
        return this.getValue();
    },
    copy(save = true) {
        if (!this.hasValue()) {
            return null;
        }

        var copy = {
            name: this.name,
            value: this.getValue()
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    export() {
        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: this.getValue()
        };
    },
    toString() {
        return this.value;
    }
};

export const StringConcept = Object.assign(
    Object.create(Concept),
    _StringConcept
);