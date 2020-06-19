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
        instance._root = metamodel[KEY_ROOT];
        instance._config = metamodel[KEY_CONFIG];
        instance._resources = valOrDefault(metamodel[KEY_RESOURCES], []);
        instance.models = [];

        return instance;
    },
    schema: null,
    models: null,

    /** @type {string} */
    get root() { return this._root; },
    /** @type {string} */
    get language() { return valOrDefault(tryResolve(this._config, PROP_LANGUAGE, ""), ""); },
    get style() { return valOrDefault(tryResolve(this._config, PROP_STYLE, ""), ""); },
    /** @type {string[]} */
    get resources() { return this._resources; },

    getModel(id) { return isString(id) ? this.models.find((m) => m.id === id) : this.models[id]; },

    createModel() {
        if (isNullOrWhitespace(this.root)) {
            // throw an error if the root was not found.
            throw InvalidMetaModelError.create("Root not found: The metamodel does not contain a concept with the property `root`");
        }

        var model = Model.create(this);
        this.models.push(model);

        return model;
    },

    /**
     * Gets a value indicating whether this type is declared in the model
     * @param {string} type 
     * @returns {boolean}
     */
    isConcept(type) { return hasOwn(this.schema, type); },
    /**
     * Gets a value indicating whether this concept is a prototype
     * @param {string} type 
     * @returns {boolean}
     */
    isPrototype(type) { return this.isConcept(type) && this.schema[type].nature === "prototype"; },
    /**
     * Gets a value indicating whether this concept is concrete
     * @param {string} type 
     * @returns {boolean}
     */
    isConcrete(type) { return this.isConcept(type) && this.schema[type].nature === "concrete"; },

    /**
     * Gets a model concept by type
     * @param {string} type 
     */
    getModelConcept(type) {
        const [conceptName, prop] = type.split('.');

        if (!this.isConcept(conceptName)) {
            return undefined;
        }

        var concept = deepCopy(this.schema[conceptName]);
        if (isString(prop) && prop.startsWith('component')) {
            let componentName = prop.substring(prop.indexOf('[') + 1, prop.indexOf(']'));
            concept = concept.component.find((c) => c.name === componentName);
        }

        return concept;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} prototype 
     */
    getConcreteConcepts(prototype) {
        const concepts = [];
        
        for (const key in this.schema) {
            const concept = this.schema[key];
            if (concept.prototype === prototype) {
                concept.name = key;
                concepts.push(concept);
            }
        }

        return concepts;
    },

    getCompleteModelConcept(type) {
        if (!this.isConcept(type)) {
            return undefined;
        }

        const conceptSchema = this.getModelConcept(type);
        const baseSchema = getConceptBaseSchema.call(this, conceptSchema.prototype);
        if (!hasOwn(conceptSchema, 'attribute')) {
            conceptSchema.attribute = {};
        }
        if (!hasOwn(conceptSchema, 'component')) {
            conceptSchema.component = [];
        }

        Object.assign(conceptSchema.attribute, baseSchema.attribute);
        Object.assign(conceptSchema.component, baseSchema.component);

        return conceptSchema;
    },
    getProjectionSchema(concept) {
        if (!this.isConcept(concept)) {
            return null;
        }

        return this.schema[concept].projection;
    }
};

function getConceptBaseSchema(baseConceptName) {
    var prototype = baseConceptName;
    const baseSchema = {
        attribute: {},
        component: {}
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