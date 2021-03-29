import { isNullOrWhitespace, valOrDefault, isNullOrUndefined, isObject, isEmpty, hasOwn } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401,
    MINLENGTH_ERROR: 402,
    MAXLENGTH_ERROR: 403,
    FIXLENGTH_ERROR: 404,
    PATTERN_ERROR: 405,
};

function responseHandler(code, ctx) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: `Valid values: ${ctx}`
            };
        case ResponseCode.MAXLENGTH_ERROR:
            return {
                success: false,
                message: `Maximum length: ${this.value.length}/${ctx.value}.`
            };
        case ResponseCode.MINLENGTH_ERROR:
            return {
                success: false,
                message: `Minimum length: ${this.value.length}/${ctx.value}.`
            };
        case ResponseCode.FIXLENGTH_ERROR:
            return {
                success: false,
                message: `Fixed length: ${ctx.value}.`
            };
        case ResponseCode.PATTERN_ERROR:
            return {
                success: false,
                message: `The value is not valid.`
            };
    }
}

const _StringConcept = {
    nature: 'primitive',

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.default = valOrDefault(this.schema.default, "");
        this.description = this.schema.description;
        this.constraint = this.schema.constraint;
        this.src = valOrDefault(this.schema.src, []);

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
            const { id = "", value } = args;

            if (id.length > 10) {
                this.id = id;
            }

            this.setValue(value);
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
    removeValue() {
        this.value = null;

        this.notify("value.changed", this.value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    setValue(value) {
        var { code, ctx } = this.validate(value);

        this.value = value;

        if (code !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated.",
                errors: [
                    responseHandler.call(this, code, ctx).message
                ]
            };
        }

        this.notify("value.changed", value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },

    getCandidates() {
        let values = valOrDefault(this.getConstraint("values"), []);

        if (isEmpty(values)) {
            let uniqueValues = new Set(
                this.model.getConcepts(this.name)
                    .filter(c => c.hasValue() && c.value !== this.value)
                    .map(c => c.getValue()));
            return [...uniqueValues, ...this.src];
        }

        return values.map(value => resolveValue.call(this, value)).flat().filter(val => !isNullOrWhitespace(val));
    },
    getChildren(name) {
        return [];
    },

    update(message, value) {
        return true;
    },

    validate(value) {
        if (isNullOrWhitespace(value)) {
            return {
                code: ResponseCode.SUCCESS
            };
        }

        if (!this.hasConstraint()) {
            return {
                code: ResponseCode.SUCCESS
            };
        }

        if (this.hasConstraint("length")) {
            let lengthConstraint = this.getConstraint("length");

            const { type } = lengthConstraint;

            if (type === "range") {
                const { min, max } = lengthConstraint[type];

                if (min && value.length < min.value) {
                    return {
                        code: ResponseCode.MINLENGTH_ERROR,
                        ctx: min
                    };
                }

                if (max && value.length > max.value) {
                    return {
                        code: ResponseCode.MAXLENGTH_ERROR,
                        ctx: max
                    };
                }
            } else if (type === "fixed") {
                const { value: fixedValue } = lengthConstraint["fixed"];

                if (value.length !== fixedValue) {
                    return {
                        code: ResponseCode.FIXLENGTH_ERROR,
                        ctx: lengthConstraint["fixed"]
                    };
                }
            }
        }

        if (this.hasConstraint("value")) {
            let valueConstraint = this.getConstraint("value");

            const { type } = valueConstraint;

            if (type === "pattern") {
                const { value: patternValue } = valueConstraint["pattern"];

                if (!(new RegExp(patternValue, "gi")).test(value)) {
                    return {
                        code: ResponseCode.PATTERN_ERROR,
                        ctx: valueConstraint["pattern"]
                    };
                }
            }
        }

        if (this.hasConstraint("values")) {
            let values = this.getConstraint("values").map(value => resolveValue.call(this, value)).flat();

            let found = false;
            for (let i = 0; !found && i < values.length; i++) {
                const val = values[i];

                if (isObject(val)) {
                    found = val.value === value;
                } else {
                    found = val === value;
                }
            }

            if (!found) {
                return {
                    code: ResponseCode.INVALID_VALUE,
                    ctx: values
                };
            }
        }

        return {
            code: ResponseCode.SUCCESS
        };
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
            nature: this.nature,
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


function resolveValue(value) {
    if (value.type === "reference") {
        let concepts = [];

        if (this.model.isPrototype("model concept")) {
            concepts = this.model.getConceptsByPrototype("model concept");
        }

        let values = concepts.map(c => c.getChildren(this.name)).flat().map(c => c.value);

        return values;
    } else if (value.type === "meta-reference") {
        let concepts = [];

        if (this.model.isPrototype("model concept")) {
            concepts = this.model.getConceptsByPrototype("model concept");
        }

        let values = concepts.map(c => c.getChildren(this.name)).flat().map(c => c.value);

        return values;
    }

    return value;
}


export const StringConcept = Object.assign(
    Object.create(Concept),
    _StringConcept
);