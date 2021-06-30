import {
    isNullOrWhitespace, valOrDefault, isNullOrUndefined, isObject, isEmpty,
    hasOwn, isIterable, toBoolean
} from "zenkai";
import { deepCopy } from "@utils/index.js";
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
                message: `Maximum length: ${ctx.value}.`
            };
        case ResponseCode.MINLENGTH_ERROR:
            return {
                success: false,
                message: `Minimum length: ${ctx.value}.`
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
    restore(state) {
        const { value } = state;

        this.setValue(value);
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
    setValue(arg) {
        let value = isObject(arg) ? arg.value : arg;
        
        var { code, ctx } = this.validate(value);

        if (this.value !== value) {
            this.value = value;

            this.notify("value.changed", value);
        }

        if (code !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed.",
            };
        }

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    /**
     * Gets the value of a property
     * @param {string} name 
     */
    getProperty(name, meta) {
        if (name === "refname") {
            return this.ref.name;
        }

        if (name === "name") {
            return this.name;
        }

        if (name === "value") {
            return this.value;
        }

        if (name === "length") {
            return this.value.length;
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
    /**
     * Returns a value indicating whether the concept has a property
     * @param {string} name Property's name
     * @returns {boolean}
     */
    hasProperty(name) {
        if (["refname", "name", "value", "length"].includes(name)) {
            return true;
        }

        let propSchema = valOrDefault(this.schema.properties, []);

        return propSchema.findIndex(prop => prop.name === name) !== -1;
    },

    getCandidates() {
        let values = valOrDefault(this.getConstraint("values"), []);

        if (isEmpty(values)) {
            return [...this.src.map(val => {
                if (val.type === "reference") {
                    const { source, target } = val;

                    let model = this.model.environment.getModel(source.name || source);
                    if (isNullOrUndefined(model)) {
                        return null;
                    }

                    let cmodel = model.concept || model;

                    if (!Array.isArray(cmodel)) {
                        return null;
                    }

                    cmodel.forEach(c => {
                        const baseSchema = getConceptBaseSchema(cmodel, c.prototype);

                        c.attributes.push(...baseSchema.attributes);
                    });

                    if (isNullOrUndefined(target.rel)) {
                        return cmodel.map(x => x[target.value]);
                    }

                    let result = resolveReference.call(this, target, cmodel);

                    if (isNullOrUndefined(result)) {
                        return [];
                    }

                    return result;
                }

                return val;
            })].flat().filter(x => !isNullOrUndefined(x));
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
        this.errors = [];

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
                    let code = ResponseCode.MINLENGTH_ERROR;

                    this.errors.push(responseHandler.call(this, code, min).message);

                    return {
                        code: code,
                        ctx: min
                    };
                }

                if (max && value.length > max.value) {
                    let code = ResponseCode.MAXLENGTH_ERROR;

                    this.errors.push(responseHandler.call(this, code, max).message);

                    return {
                        code: code,
                        ctx: max
                    };
                }
            } else if (type === "fixed") {
                const { value: fixedValue } = lengthConstraint[type];

                if (value.length !== fixedValue) {
                    let code = ResponseCode.FIXLENGTH_ERROR;

                    this.errors.push(responseHandler.call(this, code, lengthConstraint[type]).message);

                    return {
                        code: code,
                        ctx: lengthConstraint[type]
                    };
                }
            }
        }

        if (this.hasConstraint("value")) {
            let valueConstraint = this.getConstraint("value");

            const { type } = valueConstraint;

            if (type === "pattern") {
                const { value: patternValue, insensitive = true, global = true } = valueConstraint["pattern"];

                let flags = "";
                if (insensitive) {
                    flags += "g";
                }
                if (global) {
                    flags += "i";
                }

                if (!(new RegExp(patternValue, flags)).test(value)) {
                    let code = ResponseCode.PATTERN_ERROR;

                    this.errors.push(responseHandler.call(this, code, valueConstraint["pattern"]).message);

                    return {
                        code: code,
                        ctx: valueConstraint["pattern"]
                    };
                }
            } else if (type === "match".startsWith) {
                const { start, end } = valueConstraint[type];

                if (start && !value.startsWith < start.value) {
                    let code = ResponseCode.PATTERN_ERROR;

                    this.errors.push(responseHandler.call(this, code, valueConstraint["match"]).message);

                    return {
                        code: code,
                        ctx: valueConstraint["match"]
                    };
                }

                if (end && value.length > end.value) {
                    let code = ResponseCode.PATTERN_ERROR;

                    this.errors.push(responseHandler.call(this, code, valueConstraint["match"]).message);

                    return {
                        code: code,
                        ctx: valueConstraint["match"]
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


/**
 * Gets the concept base schema
 * @param {string} protoName 
 * @this {ConceptModel}
 */
function getConceptBaseSchema(concepts, protoName) {
    var prototype = protoName;

    const attributes = [];

    /**
     * Gets a model concept by name
     * @param {string} name 
     */
    const getConceptSchema = (name) => {
        let concept = concepts.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return undefined;
        }

        return deepCopy(concept);
    };

    const appendAttributes = ($attributes) => {
        if (!Array.isArray($attributes)) {
            return;
        }

        $attributes.forEach($attr => {
            const attribute = attributes.find((attr => attr.name === $attr.name));

            if (isNullOrUndefined(attribute)) {
                attributes.push($attr);

                return;
            }

            if ($attr.required) {
                attribute.required = $attr.required;
            }

            if ($attr.description) {
                attribute.description = $attr.description;
            }
        });
    };

    while (!isNullOrUndefined(prototype)) {
        const schema = valOrDefault(getConceptSchema(prototype), {});

        appendAttributes(schema.attributes);

        prototype = schema['prototype'];
    }

    return {
        attributes: attributes,
    };
}

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

function resolveReference(target, source) {
    const { name, rel, scope, value } = target;

    let targetSource = null;

    if (rel === "parent") {
        let parent = this.getParent(name);

        if (isNullOrUndefined(value)) {
            return parent;
        }

        if (value.type === "reference") {
            return resolveReference.call(parent, value);
        }

        if (value.type === "attribute") {
            return parent.getAttributeByName(value.name).getValue();
        }
    }

    if (rel === "children") {
        let children = this.getChildren(name);

        if (isNullOrUndefined(value)) {
            return children;
        }

        if (value.type === "reference") {
            return children.map(c => resolveReference.call(c, value));
        }

        if (value.type === "attribute") {
            return children.filter(c => hasAttr(c, value.name) && hasValue(c, value.name))
                .map(c => getValue(c, value.name));
        }
    }

    if (target.source) {
        const { type, value } = target.source;

        if (type === "reference") {
            targetSource = resolveReference.call(this, target.source);
        } else {
            targetSource = value;
        }
    }

    if (isNullOrUndefined(targetSource)) {
        return source.map(x => x[name].map(attr => attr[value]));
    }

    if (isIterable(targetSource) && isEmpty(targetSource)) {
        return [];
    }

    let concept = source.find(x => Array.isArray(targetSource) ? targetSource.includes(x.name) : x.name === targetSource);

    if (isNullOrUndefined(concept) || !hasOwn(concept, name)) {
        return [];
    }

    return concept[name].map(attr => attr[value]);
}

const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getValue = (concept, attr) => getAttr(concept, attr).getValue();

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);


export const StringConcept = Object.assign(
    Object.create(Concept),
    _StringConcept
);