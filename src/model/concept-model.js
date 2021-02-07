import {
    isString, isObject, isEmpty, hasOwn, isIterable, valOrDefault,
    isNullOrUndefined, isNullOrWhitespace
} from "zenkai";
import { deepCopy } from "@utils/index.js";
import { ConceptFactory } from "./concept/factory.js";
import { ObserverHandler } from "./structure/index.js";



var inc = 0;

const nextValueId = () => `value${inc++}`;


const projections = [
    {
        "concept": { "name": "set" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "list"
        }
    },
    {
        "concept": { "name": "string" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "text",
            "content": [
                {
                    "type": "input"
                }
            ]
        }
    },
    {
        "concept": { "name": "boolean" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "binary"
        }
    },
    {
        "concept": { "name": "number" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "text"
        }
    },
    {
        "concept": { "name": "reference" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "link"
        }
    },
    {
        "concept": { "name": "prototype" },
        "type": "field",
        "tags": [],
        "projection": {
            "type": "choice"
        }
    }
];

const PROP_NATURE = "nature";
const PROP_TYPE = "type";
const PROP_HANDLER = "handler";

const ATTR_ATTRIBUTES = "attributes";
const ATTR_ALIAS = "alias";
const ATTR_BASE = "base";
const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
const ATTR_DESCRIPTION = "description";
const ATTR_GLOBAL = "global";
const ATTR_NAME = "name";
const ATTR_REQUIRED = "required";
const ATTR_PROPERTIES = "properties";
const ATTR_PROTOTYPE = "prototype";
const ATTR_TAGS = "tags";


export const ConceptModel = {
    /** @type {Concept[]} */
    concepts: null,
    /** @type {Concept[]} */
    values: null,
    /** @type {*[]} */
    listeners: null,
    /** @type {*[]} */
    watchers: null,

    init(values) {
        this.concepts = [];
        this.listeners = [];
        this.watchers = [];
        this.values = [];

        if (Array.isArray(values)) {
            this.values = values;

            values.filter(value => value.root).forEach(value => {
                this.createConcept({
                    "name": value.name
                }, {
                    "value": value
                });
            });
        }

        return this;
    },

    register(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }

        return true;
    },
    unregister(listener) {
        var index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);

            return true;
        }

        return false;
    },
    notify(message, value) {
        this.listeners.forEach(listener => {
            listener.update(message, value);
        });
    },

    /**
     * Creates and returns a model element
     * @param {string} name
     * @returns {Concept}
     */
    createConcept(name, args) {
        const schema = this.getCompleteModelConcept(name);

        var concept = ConceptFactory.createConcept(this, schema, args);

        this.addConcept(concept);

        return concept;
    },
    getConcepts(name) {
        if (isIterable(name)) {
            const pred = Array.isArray(name) ? (concept) => name.includes(concept.name) : (concept) => concept.name === name;

            return this.concepts.filter(concept => pred(concept));
        }

        return this.concepts.slice();
    },
    getConceptsByPrototype(prototype) {
        return this.concepts.filter((concept) => concept.schema.prototype === prototype);
    },
    /**
     * Returns a concept with matching id from the list of concepts held by the model
     * @param {string} id
     * @returns {Concept}
     */
    getConcept(id) {
        if (!(isString(id) && !isEmpty(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        return this.concepts.find(concept => concept.id === id);
    },
    /**
     * Adds a concept to the list of concepts held by the model
     * @param {Concept} concept
     */
    addConcept(concept) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Bad request: The 'concept' argument must be a Concept");
        }

        this.concepts.push(concept);

        if (this.watchers.includes(concept.name)) {
            this.notify('concept.added', concept);
        }

        // console.warn("concept added", this.concepts.length);

        return this;
    },
    /**
     * Removes a concept from the list of concepts held by the model
     * @param {string} id
     * @returns {Concept} The removed concept
     */
    removeConcept(id) {
        if (!(isObject(id) || isString(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        var index = this.concepts.findIndex(concept => concept.id === id);

        if (index === -1) {
            return null;
        }

        let removedConcept = this.concepts.splice(index, 1)[0];

        // console.warn("concept removed", this.concepts.length);

        return removedConcept;
    },

    /**
     * Get the list of values
     * @param {string|string[]} [name] 
     */
    getValues(name) {
        if (isIterable(name)) {
            const pred = Array.isArray(name) ? (value) => name.includes(value.name) : (value) => value.name === name;

            return this.values.filter(value => pred(value));
        }

        return this.values.slice();
    },
    getValue(arg) {
        if (isNullOrUndefined(arg)) {
            return null;
        }

        const isValue = hasOwn(arg, "value") || hasOwn(arg, "attributes");

        if (isValue) {
            return arg;
        }

        if (hasOwn(arg, "id")) {
            return this.values.find(value => value.id === arg.id);
        }

        return this.values.find(value => value.id === arg);
    },
    /**
     * Adds a value to the list of values held by the model
     * @param {*} value
     */
    addValue(value) {
        if (isNullOrUndefined(value)) {
            throw new TypeError("Bad request: The 'value' argument must be a Value");
        }

        if (this.values.some((val) => Equiv(val, value))) {
            return this;
        }

        value.id = nextValueId();
        this.values.push(value);

        this.notify('value.added', value);

        return this;
    },
    /**
     * Removes a concept from the list of concepts held by the model
     * @param {string} id
     * @returns {Concept} The removed concept
     */
    removeValue(id) {
        if (!(isObject(id) || isString(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        var index = this.values.findIndex(value => value.id === id);

        if (index === -1) {
            return null;
        }

        let removedValue = this.values.splice(index, 1)[0];

        this.notify('value.removed', removedValue);

        return removedValue;
    },

    /**
     * Gets a value indicating whether this concept is declared in the model
     * @param {string} name 
     * @returns {boolean}
     */
    isConcept(name) {
        return this.schema.findIndex(concept => concept.name === name) !== -1;
    },
    /**
     * Gets a value indicating whether this concept is concrete
     * @param {string} name 
     * @returns {boolean}
     */
    isConcrete(name) {
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        return concept.nature === "concrete";
    },
    /**
     * Gets a value indicating whether this concept is a prototype
     * @param {string} name 
     * @returns {boolean}
     */
    isPrototype(name) {
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        return concept.nature === "prototype";
    },

    /**
     * Gets a model concept by name
     * @param {string} name 
     */
    getConceptSchema(name) {
        const concept = getSchema(this.schema, name);

        if (isNullOrUndefined(concept)) {
            return undefined;
        }

        return deepCopy(concept);
    },
    getCompleteModelConcept(concept) {
        const conceptSchema = this.getConceptSchema(concept.name);

        if (isNullOrUndefined(conceptSchema)) {
            return undefined;
        }

        Object.assign(conceptSchema, concept);

        if (!hasOwn(conceptSchema, 'attributes')) {
            conceptSchema.attributes = [];
        }

        const baseSchema = getConceptBaseSchema.call(this, conceptSchema.prototype);

        conceptSchema.attributes.push(...baseSchema.attributes);

        return conceptSchema;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} prototype 
     */
    getConcreteConcepts($prototype) {
        const hasPrototype = (concept) => {
            var prototype = concept.prototype;

            while (!isNullOrUndefined(prototype)) {
                if (prototype === $prototype) {
                    return true;
                }

                const schema = valOrDefault(getSchema(this.schema, prototype), {});

                prototype = schema['prototype'];
            }

            return false;
        };

        const concepts = this.schema.filter(concept => concept.nature === "concrete");

        if ($prototype) {
            return concepts.filter(concept => hasPrototype(concept));
        }

        return concepts;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} base 
     */
    getDerivedConcepts(base) {
        if (isNullOrUndefined(base)) {
            throw new TypeError("Bad argument");
        }

        const concepts = this.schema.filter(concept => concept.base === base);

        return concepts;
    },


    buildConcept() {
        const concepts = [];

        this.getConcepts(["prototype concept", "concrete concept", "derivative concept"]).forEach(concept => {

            concepts.push(this.buildSingleConcept(concept).message);
        });

        return JSON.stringify(concepts);
    },
    buildSingleConcept(concept) {
        const errors = [];

        const name = getName(concept);
        const description = getDescription(concept);
        const attributes = [];
        const properties = [];

        if (isNullOrWhitespace(name)) {
            errors.push("The concept's 'name' is missing a value.");
        }

        if (concept.isAttributeCreated(ATTR_ATTRIBUTES)) {
            getValue(concept, ATTR_ATTRIBUTES).forEach(attribute => {
                const result = buildAttribute(attribute);

                if (!result.success) {
                    errors.push(...result.errors);
                } else {
                    attributes.push(result.message);
                }
            });
        }

        if (concept.isAttributeCreated(ATTR_PROPERTIES)) {
            getValue(concept, ATTR_PROPERTIES).forEach(property => {
                const result = buildProperty(property);

                if (!result.success) {
                    errors.push(...result.errors);
                } else {
                    properties.push(result.message);
                }
            });
        }

        if (!isEmpty(errors)) {
            return {
                success: false,
                message: "Validation failed: The concept could not be built.",
                errors: errors,
            };
        }

        let schema = {
            "id": concept.id,
            "name": name,
            "description": description,
            "nature": concept.getBuildProperty(PROP_NATURE),
            "attributes": attributes,
            "properties": properties,
        };

        

        if (concept.isAttributeCreated(ATTR_PROTOTYPE) && hasValue(concept, ATTR_PROTOTYPE)) {
            schema.prototype = getName(getReference(concept, ATTR_PROTOTYPE));
        }

        if (concept.isAttributeCreated(ATTR_BASE) && hasValue(concept, ATTR_BASE)) {
            const base = getValue(concept, ATTR_BASE);

            schema.base = buildTarget(base);
        }

        return {
            success: true,
            message: schema,
        };
    },
    buildProjection() {
        const result = [...projections];

        this.getConcepts(["projection", "template"]).forEach(concept => {
            result.push(this.buildSingleProjection(concept).message);
        });

        return JSON.stringify(result);
    },
    buildSingleProjection(concept) {
        const errors = [];

        const handler = concept.getBuildProperty(PROP_HANDLER);

        if (isNullOrUndefined(handler)) {
            errors.push("The projection's is missing a build handler.");
        }

        if (!isEmpty(errors)) {
            return {
                success: false,
                message: "The projection could not be built.",
                errors: errors,
            };
        }

        const schema = ProjectionBuildHandler[handler](concept);

        return {
            success: true,
            message: schema,
        };
    },
    export() {
        const values = [];

        this.getConcepts().forEach(concept => {
            values.push(concept.export());
        });

        return values;
    },
    toString() {
        return JSON.stringify({
            [this.root.name]: this.root.toString()
        });
    },
};

const ProjectionBuildHandler = {
    "projection": (concept) => buildProjection(concept),
    "template": (concept) => buildTemplate(concept),
};

const ProjectionHandler = {
    "layout": (concept) => buildLayout(getValue(concept, "layout")),
    "field": (concept) => buildField(getValue(concept, "field")),
    "element": (concept) => buildElement(getValue(concept, "element")),
};


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();

const getDescription = (concept) => getValue(concept, ATTR_DESCRIPTION);

const nameMap = {
    "string primitive": (concept) => "string",
    "number primitive": (concept) => "number",
    "boolean primitive": (concept) => "boolean",
    "reference primitive": (concept) => "reference",
    "set primitive": (concept) => "set",
    "concept primitive": (concept) => getName(getReference(concept, 'concept')),
};


/**
 * Build a concept attribute
 * @param {*} attributes 
 */
function buildAttribute(attribute) {
    const name = getName(attribute);
    const description = getDescription(attribute);
    const required = hasAttr(attribute, ATTR_REQUIRED) && hasValue(attribute, ATTR_REQUIRED) ? getValue(attribute, ATTR_REQUIRED) : true;

    const errors = [];

    if (isNullOrWhitespace(name)) {
        errors.push("The attribute's 'name' is missing a value.");
    }

    if (!(hasAttr(attribute, "target") && hasValue(attribute, "target"))) {
        errors.push(`The attribute '${name}' 'target' is missing a value.`);
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The concept could not be built.",
            errors: errors,
        };
    }

    const schema = {
        "name": name,
        "description": description,
        "required": required,
        "target": buildTarget(getValue(attribute, "target")),
    };

    return {
        success: true,
        message: schema,
    };
}

function buildTarget(target) {
    const result = {
        "name": nameMap[target.name](target)
    };

    if (target.isAttributeCreated("accept")) {
        let accept = getValue(target, "accept");

        result["accept"] = buildTarget(accept);
    }

    if (hasAttr(target, "default") && hasValue(target, "default")) {
        result["default"] = getValue(target, "default");
    }

    ["length", "value", "cardinality"].forEach(prop => {
        if (hasAttr(target, prop) && hasValue(target, prop)) {
            let constraint = getValue(target, prop);

            let rules = {};

            if (constraint.name === "number constraint value") {
                if (hasValue(constraint, "value")) {
                    rules["value"] = getValue(constraint, "value");
                }
            } else if (constraint.name === "number constraint range") {
                let min = getAttr(constraint, "min");
                if (hasValue(min, "value")) {
                    rules["min"] = {
                        "value": getValue(min, "value"),
                        "included": getValue(min, "included"),
                    };
                }

                let max = getAttr(constraint, "max");
                if (hasValue(max, "value")) {
                    rules["max"] = {
                        "value": getValue(max, "value"),
                        "included": getValue(max, "included"),
                    };
                }
            }

            result[prop] = rules;
        }
    });


    if (hasAttr(target, "values") && hasValue(target, "values")) {
        result["values"] = getValue(target, "values", true);
    }

    return result;
}

/**
 * 
 * @param {*[]} attributes 
 */
function buildProperty(property) {
    const errors = [];

    const name = getName(property);
    const description = getDescription(property);


    if (isNullOrWhitespace(name)) {
        errors.push("The property's 'name' is missing a value.");
    }

    if (!(hasAttr(property, "target") && hasValue(property, "target"))) {
        errors.push(`The property '${name}' 'target' is missing a value.`);
    }

    var target = getValue(property, "target");

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The concept could not be built.",
            errors: errors,
        };
    }

    var schema = {
        "name": getName(property),
        "description": description,
        "value": getValue(target, "value"),
    };

    return {
        success: true,
        message: schema,
    };
}

/**
 * Gets the concept base schema
 * @param {string} protoName 
 * @this {ConceptModel}
 */
function getConceptBaseSchema(protoName) {
    var prototype = protoName;

    const attributes = [];

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
        const schema = valOrDefault(this.getConceptSchema(prototype), {});

        appendAttributes(schema.attributes);

        prototype = schema['prototype'];
    }

    return {
        attributes: attributes,
    };
}

const primitives = [
    { "name": "string", "nature": "primitive" },
    { "name": "number", "nature": "primitive" },
    { "name": "boolean", "nature": "primitive" },
    { "name": "reference", "nature": "primitive" },
    { "name": "set", "nature": "primitive" },
];

function getSchema(schema, name) {
    var result = schema.find(concept => concept.name === name);

    if (isNullOrUndefined(result)) {
        result = primitives.find(concept => concept.name === name);
    }

    return result;
}

function buildProjection(concept) {
    const errors = [];

    const global = hasAttr(concept, ATTR_GLOBAL) ? getValue(concept, ATTR_GLOBAL) : false;
    const tags = hasAttr(concept, ATTR_TAGS) ? getAttr(concept, ATTR_TAGS).build() : [];


    if (!hasValue(concept, ATTR_CONTENT)) {
        errors.push("The projection is missing a content.");
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The projection could not be built.",
            errors: errors,
        };
    }

    const content = getValue(concept, ATTR_CONTENT);

    const type = content.getBuildProperty(PROP_TYPE);

    let schema = {
        "id": concept.id,
        "concept": buildConcept(getAttr(concept, ATTR_CONCEPT)),
        "type": type,
        "global": global,
        "tags": tags,
        "content": ProjectionHandler[type](content),
    };

    if (hasAttr(concept, ATTR_NAME) && hasValue(concept, ATTR_NAME)) {
        schema.name = getName(concept);
    }

    return {
        success: true,
        message: schema,
    };
}

function buildTemplate(concept) {
    const errors = [];

    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        errors.push("The template is missing a name.");
    }

    if (!hasValue(concept, ATTR_CONTENT)) {
        errors.push("The template is missing a content.");
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The template could not be built.",
            errors: errors,
        };
    }

    const content = [];

    getValue(concept, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue();
        content.push(buildElement(element));
    });

    let schema = {
        "id": concept.id,
        "type": "template",
        "name": name,
        "content": content,
    };

    return schema;
}

function buildConcept(concept) {
    const result = {};

    if (hasAttr(concept, ATTR_NAME)) {
        result[ATTR_NAME] = hasValue(concept, ATTR_NAME) ? getValue(concept, ATTR_NAME).toLowerCase() : null;
    }

    if (hasAttr(concept, ATTR_PROTOTYPE)) {
        result[ATTR_PROTOTYPE] = hasValue(concept, ATTR_PROTOTYPE) ? getValue(concept, ATTR_PROTOTYPE).toLowerCase() : null;
    }

    return result;
}

function buildLayout(layout) {
    var schema = {};
    var disposition = [];

    if (layout.name === "stack layout") {
        schema.type = "stack";
        schema.orientation = getValue(layout, 'orientation');

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    } else if (layout.name === "wrap layout") {
        schema.type = "wrap";

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    } else if (layout.name === "cell layout") {
        schema.type = "table";
        schema.orientation = getValue(layout, 'orientation');
        getValue(layout, "rows").forEach(row => {
            const cells = [];
            getValue(row, "cells").forEach(cell => {
                let span = getValue(cell, "span");
                let content = getValue(cell, "content");
                cells.push({
                    "type": "cell",
                    "span": span,
                    "content": buildElement(content)
                });
            });
            disposition.push(cells);
        });
    } else if (layout.name === "relative layout") {
        schema.type = "relative";
    }

    if (layout.isAttributeCreated("style")) {
        schema.style = buildStyle(getAttr(layout, 'style'));
    }

    schema.disposition = disposition;

    return schema;
}

function buildElement(element) {
    const contentType = element.getBuildProperty("contentType");
    const elementType = element.getBuildProperty("elementType");

    if (contentType === "static") {
        let schema = {
            type: contentType,
            static: buildStatic(element, elementType)
        };

        return schema;
    }

    if (contentType === "dynamic") {
        return buildDynamic(element, elementType);
    }

    if (contentType === "attribute") {
        let schema = {
            type: contentType,
            name: getValue(element, "value")
        };

        if (element.isAttributeCreated("tag")) {
            schema.tag = getValue(element, "tag");
        }

        return schema;
    }

    if (contentType === "layout") {
        return {
            type: contentType,
            layout: buildLayout(element)
        };
    }

    return null;
}

function buildStatic(element, type) {
    let schema = {
        type: type
    };

    if (type === "text") {
        schema.content = getValue(element, "content");
        schema.contentType = getValue(element, "content type");
    } else if (type === "image") {
        schema.url = getValue(element, "url");
        schema.alt = getValue(element, "alternative text");
        schema.width = getValue(element, "width");
        schema.height = getValue(element, "height");
    } else if (type === "html") {
        schema.selector = getValue(element, "selector");
    } else if (type === "link") {
        schema.url = getValue(element, "url");
        schema.urlType = getValue(element, "url type");
        schema.content = [];

        getValue(element, "content").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            schema.content.push(buildElement(element));
        });
    }

    if (hasAttr(element, "style")) {
        schema.style = buildStyle(getAttr(element, 'style'));
    }

    return schema;
}

function buildDynamic(element, type) {
    let schema = {
        type: type
    };

    if (type === "input") {
        schema.placeholder = getValue(element, "placeholder");
    } else if (type === "checkbox") {
        schema.label = getValue(element, "label");
    } else if (type === "list") {
        schema.selector = getValue(element, "item");
    }

    if (hasAttr(element, "style")) {
        schema.style = buildStyle(getAttr(element, 'style'));
    }

    return schema;
}

function buildField(field) {
    var schema = {
        readonly: getValue(field, "readonly"),
        disabled: getValue(field, "disabled"),
    };

    if (field.isAttributeCreated("style")) {
        schema.style = buildStyle(getAttr(field, "style"));
    }

    if (field.name === "text field") {
        schema.type = "text";
        schema.multiline = getValue(field, "multiline");

        schema.content = [];

        getValue(field, "content").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            schema.content.push(buildElement(element));
        });
    } else if (field.name === "binary field") {
        schema.type = "binary";
        schema.state = [];

        getValue(field, "content").forEach(state => {
            if (hasAttr(state, "state")) {
                schema.state.push({
                    "rule": {
                        "type": "eq",
                        "eq": [{ "prop": "value" }, getValue(state, "state")]
                    },
                    "result": {
                        "label": {
                            "projection": buildElement(getValue(state, "content"))
                        }
                    }
                });
            } else {
                schema.label = {
                    "projection": buildElement(getValue(state, "content"))
                };
            }
        });
    } else if (field.name === "choice field") {
        schema.type = "choice";

        let choice = getAttr(field, "choice template");
        let selection = getAttr(field, "selection template");

        schema.choice = {
            "option": {
                "template": {
                    "tag": getValue(choice, "tag"),
                    "name": getValue(choice, "name"),
                }
            },
            "selection": {
                "template": {
                    "tag": getValue(selection, "tag"),
                    "name": getValue(selection, "name"),
                }
            }
        };
    } else if (field.name === "link field") {
        schema.type = "link";

        let choice = getAttr(field, "choice template");
        let value = getAttr(field, "value template");

        schema.choice = {
            "option": {
                "template": {
                    "tag": getValue(choice, "tag"),
                    "name": getValue(choice, "name"),
                }
            },
            "selection": {
                "template": {
                    "tag": getValue(value, "tag"),
                    "name": getValue(value, "name"),
                }
            }
        };

    } else if (field.name === "list field") {
        schema.type = "list";

        if (hasAttr("orientation")) {
            schema.orientation = getValue(field, 'orientation');
        }

        let item = getAttr(field, "item template");

        schema.list = {
            "item": {
                "template": {
                    "tag": getValue(item, "tag"),
                    "name": getValue(item, "name"),
                }
            }
        };
    } else if (field.name === "table field") {
        let template = {};

        if (field.isAttributeCreated("template")) {
            template.name = getAttr(field, 'template').getValue();
        }
        if (field.isAttributeCreated("concept")) {
            template.concept = getAttr(field, 'concept').getValue();
        }

        schema.template = template;

        schema.type = "table";
    }

    return schema;
}

function buildStyle(style) {
    if (style.isAttributeCreated("css")) {
        return {
            css: getAttr(style, 'css').build()
        };
    }

    return null;
}

function buildFieldTemplate(tpl) {
    var schema = {};

    if (tpl.name === "table template") {
        let hcells = [];
        let bcells = [];

        getValue(tpl, "header").forEach(cell => {
            const element = getAttr(cell, "projection");
            hcells.push({
                "content": buildElement(element)
            });
        });

        getValue(tpl, "body").forEach(cell => {
            const element = getAttr(cell, "projection");
            bcells.push({
                "content": buildElement(element)
            });
        });

        Object.assign(schema, {
            type: "table",
            header: {
                "cell": hcells
            },
            body: {
                "cell": bcells
            }
        });
    }

    return schema;
}

function Equiv(val1, val2) {
    if (val1.name !== val2.name) {
        return false;
    }

    if (val1.value) {
        return val1.value === val2.value;
    }

    return JSON.stringify(val1.attributes) === JSON.stringify(val2.attributes);
}