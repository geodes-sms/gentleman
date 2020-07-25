import { isNullOrUndefined, hasOwn, valOrDefault, isString, isNullOrWhitespace } from "zenkai";
import { deepCopy, tryResolve } from "@utils/index.js";
import { InvalidMetaModelError } from '@exception/index.js';
import { Model } from "./model.js";


const KEY_ROOT = '@root';
const KEY_CONFIG = '@config';
const KEY_RESOURCES = '@resources';
const PROP_LANGUAGE = 'language';
const PROP_STYLE = 'style';

export const MetaModel = {
    /** @returns {MetaModel} */
    create(metamodel) {
        const instance = Object.create(this);

        instance.schema = metamodel;
        instance.models = [];

        return instance;
    },
    schema: null,
    models: null,

    /** @type {string} */
    get root() { return this.schema[KEY_ROOT]; },
    /** @type {string} */
    get config() { return this.schema[KEY_CONFIG]; },
    /** @type {string} */
    get language() { return valOrDefault(tryResolve(this.config, PROP_LANGUAGE, ""), ""); },
    get style() { return valOrDefault(tryResolve(this.config, PROP_STYLE, ""), ""); },
    /** @type {string[]} */
    get resources() { return this.schema[KEY_RESOURCES]; },

    createModel() {
        if (isNullOrWhitespace(this.root)) {
            // throw an error if the root was not found.
            throw InvalidMetaModelError.create("Root not found: The metamodel does not contain a concept with the property `root`");
        }

        var model = Model.create(this);
        this.models.push(model);

        return model;
    },
    getModel(id) { return isString(id) ? this.models.find((m) => m.id === id) : this.models[id]; },

    /**
     * Gets a value indicating whether this concept is declared in the model
     * @param {string} name 
     * @returns {boolean}
     */
    isConcept(name) { return hasOwn(this.schema, name); },
    /**
     * Gets a value indicating whether this concept is concrete
     * @param {string} name 
     * @returns {boolean}
     */
    isConcrete(name) { return this.isConcept(name) && this.schema[name].nature === "concrete"; },
    /**
     * Gets a value indicating whether this concept is a prototype
     * @param {string} name 
     * @returns {boolean}
     */
    isPrototype(name) { return this.isConcept(name) && this.schema[name].nature === "prototype"; },

    /**
     * Gets a model concept by name
     * @param {string} name 
     */
    getConceptSchema(name) {
        if (!this.isConcept(name)) {
            return undefined;
        }

        var concept = deepCopy(this.schema[name]);

        return concept;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} prototype 
     */
    getConcreteConcepts(prototype) {
        const concepts = [];

        for (const key in this.schema) {
            if (this.schema[key].prototype === prototype) {
                const concept = this.getConceptSchema(key);
                concept.name = key;
                concept.type = "concept";
                concepts.push(concept);
            }
        }

        return concepts;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} base 
     */
    getDerivedConcepts(base) {
        const concepts = [];

        for (const key in this.schema) {
            const concept = this.schema[key];
            if ( concept.base === base) {
                concept.name = key;
                concepts.push(concept);
            }
        }

        return concepts;
    },

    getCompleteModelConcept(name) {
        if (!this.isConcept(name)) {
            return undefined;
        }

        const conceptSchema = this.getConceptSchema(name);
        
        if (!hasOwn(conceptSchema, 'attribute')) {
            conceptSchema.attribute = {};
        }
        if (!hasOwn(conceptSchema, 'component')) {
            conceptSchema.component = {};
        }

        const baseSchema = getConceptBaseSchema.call(this, conceptSchema.prototype);

        Object.assign(conceptSchema.attribute, baseSchema.attribute);
        Object.assign(conceptSchema.component, baseSchema.component);

        return conceptSchema;
    },
    getProjectionSchema(conceptName) {
        if (!this.isConcept(conceptName)) {
            return null;
        }

        var conceptSchema = this.getConceptSchema(conceptName);

        return conceptSchema.projection;
    }
};

/**
 * Gets the concept base schema
 * @param {string} protoName 
 */
function getConceptBaseSchema(protoName) {
    var prototype = protoName;

    const baseSchema = {
        attribute: {},
        component: {},
    };

    while (!isNullOrUndefined(prototype)) {
        let schema = this.schema[prototype];

        if (schema) {
            Object.assign(baseSchema.attribute, schema.attribute);
            Object.assign(baseSchema.component, schema.component);
            prototype = schema['prototype'];
        } else {
            prototype = null;
        }
    }

    return baseSchema;
}