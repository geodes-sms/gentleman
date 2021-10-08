import { isNullOrWhitespace, isObject, isNullOrUndefined, valOrDefault } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_NUMBER: 400,
    INVALID_VALUE: 401,
    MIN_ERROR: 402,
    MAX_ERROR: 403,
    FIX_ERROR: 404,
};

function responseHandler(code, ctx) {
    switch (code) {
        case ResponseCode.INVALID_NUMBER:
            return {
                success: false,
                message: "The value is not a number."
            };
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: `Valid values: ${ctx}`
            };
        case ResponseCode.MAX_ERROR:
            return {
                success: false,
                message: `Maximum allowed: ${ctx.value}.`
            };
        case ResponseCode.MIN_ERROR:
            return {
                success: false,
                message: `Minimum allowed: ${ctx.value}.`
            };
        case ResponseCode.FIX_ERROR:
            return {
                success: false,
                message: `Value allowed: ${ctx.value}.`
            };
    }
}

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

const _NumberConcept = {
    nature: 'primitive',

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
        return typeof this.value === 'number' && !isNaN(this.value);
    },
    getValue() {
        if (!this.hasValue()) {
            return null;
        }

        return +this.value;
    },
    setValue(arg) {
        let value = isObject(arg) ? arg.value : arg;

        const { code, ctx } = this.validate(value);

        if (this.value !== value) {
            this.value = isNullOrWhitespace(value) ? null : +value;

            this.notify("value.changed", value);
        }

        if (code !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed."
            };
        }

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    removeValue() {
        this.value = null;

        this.notify("value.changed", this.value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    restore(state) {
        const { value } = state;

        this.setValue(value);
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
        this.errors = [];

        if (isNaN(value)) {
            let code = ResponseCode.INVALID_NUMBER;

            this.errors.push(responseHandler.call(this, code).message);

            return {
                code: code
            };
        }

        if (!this.hasConstraint()) {
            return {
                code: ResponseCode.SUCCESS
            };
        }

        if (this.hasConstraint("value")) {
            let valueConstraint = this.getConstraint("value");

            const { type } = valueConstraint;

            if (type === "range") {
                const { min, max } = valueConstraint[type];

                if (min && +value < min.value) {
                    let code = ResponseCode.MIN_ERROR;

                    this.errors.push(responseHandler.call(this, code, min).message);

                    return {
                        code: code,
                        ctx: min
                    };
                }

                if (max && +value > max.value) {
                    let code = ResponseCode.MAX_ERROR;

                    this.errors.push(responseHandler.call(this, code, max).message);

                    return {
                        code: code,
                        ctx: max
                    };
                }
            } else if (type === "fixed") {
                const { value: fixedValue } = valueConstraint[type];

                if (value !== fixedValue) {
                    let code = ResponseCode.FIX_ERROR;

                    this.errors.push(responseHandler.call(this, code, valueConstraint[type]).message);

                    return {
                        code: code,
                        ctx: valueConstraint[type]
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
                let code = ResponseCode.INVALID_VALUE;

                this.errors.push(responseHandler.call(this, code, values).message);

                return {
                    code: code,
                    ctx: values
                };
            }
        }

        return {
            code: ResponseCode.SUCCESS
        };
    },


    copy(save = true) {
        if (!this.hasValue()) {
            return null;
        }

        const copy = {
            name: this.name,
            nature: this.nature,
            value: this.getValue()
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    clone() {
        return {
            id: this.id,
            name: this.name,
            value: this.getValue()
        };
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
    },
    toXML() {
        let name = this.getName();

        let start = `<${name} id="${this.id}">`;
        let body = this.getValue();
        let end = `</${name}>`;

        return start + body + end;
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
    }

    return value;
}


export const NumberConcept = Object.assign(
    Object.create(Concept),
    _NumberConcept
);