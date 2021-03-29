import {
    isString, isObject, isEmpty, hasOwn, isIterable, valOrDefault, isNullOrUndefined
} from "zenkai";
import { deepCopy, Events } from "@utils/index.js";
import { ConceptFactory } from "./concept/factory.js";


var inc = 0;

const nextValueId = () => `value${inc++}`;


export const ConceptModel = {
    /** @type {Concept[]} */
    concepts: null,
    /** @type {Concept[]} */
    values: null,

    init(values) {
        this.concepts = [];
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
    done() {
        // TODO check if has model changes

        this.concepts.forEach(concept => {
            concept.unregisterAll();
        });

        this.concepts = [];

        return true;
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
    /**
     * Returns the list of concepts matching the optional parameters
     * @param {string|Object} name
     * @returns {Concept[]}
     */
    getConcepts(name) {
        if (isIterable(name)) {
            const pred = Array.isArray(name) ? (concept) => name.includes(concept.name) : (concept) => concept.name === name;

            return this.concepts.filter(concept => pred(concept));
        }

        return this.concepts.slice();
    },
    /**
     * Returns the list of root concepts
     * @returns {Concept[]}
     */
    getRootConcepts() {
        return this.concepts.filter(concept => concept.isRoot());
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

        Events.emit("value.added", value);

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

        Events.emit("value.removed", removedValue);

        return removedValue;
    },

    /**
     * Gets a value indicating whether this concept is declared in the model
     * @param {string} name 
     * @returns {boolean}
     */
    isConcept(name) {
        if(!isString(name)) {
            return false;
        }

        return this.schema.findIndex(concept => concept.name === name) !== -1;
    },
    /**
     * Gets a value indicating whether this concept is concrete
     * @param {string} name 
     * @returns {boolean}
     */
    isConcrete(name) {
        if(!isString(name)) {
            return false;
        }

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
        if(!isString(name)) {
            return false;
        }
        
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        return concept.nature === "prototype";
    },

    getSchema(nature) {
        if (isIterable(nature)) {
            const pred = Array.isArray(nature) ? (concept) => nature.includes(concept.nature) : (concept) => concept.nature === nature;

            return this.schema.filter(concept => pred(concept));
        }

        return this.schema.slice();
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
        let schema = concept;

        if (isString(concept)) {
            schema = {
                name: concept
            };
        }

        const conceptSchema = this.getConceptSchema(schema.name);

        if (isNullOrUndefined(conceptSchema)) {
            return undefined;
        }

        Object.assign(conceptSchema, schema);

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
    let result = schema.find(concept => concept.name === name);

    if (isNullOrUndefined(result)) {
        result = primitives.find(concept => concept.name === name);
    }

    return result;
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