import { isNullOrWhitespace, isObject, isEmpty, isNullOrUndefined, valOrDefault } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_NUMBER: 400,
    INVALID_VALUE: 401,
    MIN_ERROR: 402,
    MAX_ERROR: 403,
    FIX_ERROR: 404,
};

function responseHandler(code) {
    let cvalue = this.constraint.value;

    switch (code) {
        case ResponseCode.INVALID_NUMBER:
            return {
                success: false,
                message: "The value is not a number."
            };
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
        case ResponseCode.MAX_ERROR:
            return {
                success: false,
                message: `The value is greater than the maximum allowed: ${cvalue.max.value}.`
            };
        case ResponseCode.MIN_ERROR:
            return {
                success: false,
                message: `The value is less than the minimum allowed: ${cvalue.min.value}.`
            };
        case ResponseCode.FIX_ERROR:
            return {
                success: false,
                message: `The value is different from the value allowed: ${cvalue.value}.`
            };
    }
}

const _NumberConcept = {
    nature: 'primitive',

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.values = valOrDefault(this.schema.values, []);
        this.default = valOrDefault(this.schema.default, null);
        this.alias = this.schema.alias;
        this.description = this.schema.description;
        this.constraint = {};
        this.constraint.value = this.schema.value;

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
            this.id = args.id;
            this.setValue(args.value);
        } else {
            this.setValue(args);
        }

        return this;
    },
    hasValue() {
        return typeof this.value === 'number' && !isNaN(this.value);
    },
    getValue() {
        if (!this.hasValue()) {
            return null;
        }

        return +this.value;
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

        if (isNullOrWhitespace(value)) {
            this.value = null;
        } else {
            this.value = +value;
        }

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
        if (isNaN(value)) {
            return ResponseCode.INVALID_NUMBER;
        }


        let cvalue = this.constraint.value;

        if (cvalue) {
            const { min, max } = cvalue;

            if (cvalue.value && value !== cvalue.value) {
                return ResponseCode.FIX_ERROR;
            }

            if (min) {
                if (min.included && value < min.value) {
                    return ResponseCode.MIN_ERROR;
                }
                if (!min.included && value <= min.value) {
                    return ResponseCode.MIN_ERROR;
                }
            }

            if (max) {
                if (max.included && value > max.value) {
                    return ResponseCode.MAX_ERROR;
                }
                if (!max.included && value >= max.value) {
                    return ResponseCode.MAX_ERROR;
                }
            }
        }

        if (isNullOrWhitespace(value) || isEmpty(this.values)) {
            return ResponseCode.SUCCESS;
        }

        var found = false;
        for (let i = 0; !found && i < this.values.length; i++) {
            const val = this.values[i];
            if (isObject(val)) {
                found = val.value == value;
            } else {
                found = val == value;
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
            root: this.isRoot(),
            value: this.getValue()
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    export() {
        return {
            name: this.name,
            value: this.getValue()
        };
    },
    toString() {
        return this.value;
    },
};


export const NumberConcept = Object.assign(
    Object.create(Concept),
    _NumberConcept
);