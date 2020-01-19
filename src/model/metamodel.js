import { cloneObject, isNullOrUndefined, hasOwn, valOrDefault, isString, isNullOrWhitespace, isUndefined } from "zenkai";
import { InvalidMetaModelError } from '@src/exception/index.js';
import { Model } from "./model.js";

const KEY_ROOT = '@root';
const KEY_CONFIG = '@config';
const KEY_RESOURCES = '@resources';
const PROP_LANGUAGE = 'language';
const PROP_STYLE = 'style';

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

export const MetaModel = {
    /** @returns {MetaModel} */
    create(metamodel) {
        var instance = Object.create(this);

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

    init(metamodel, args) {
        this.schema = metamodel;

        return this;
    },

    getModel(id) { return isString(id) ? this.models.find((m) => m.id === id) : this.models[id]; },

    createModel() {
        if (!isNullOrWhitespace(this.root)) {
            let model = Model.create(this);
            this.models.push(model);

            return model;
        }

        // throw an error if the root was not found.
        throw InvalidMetaModelError.create("Root not found: The metamodel does not contain a concept with the property `root`");
    },

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

    getCompleteModelConcept(type) {
        if (!this.isConcept(type)) {
            return undefined;
        }
        const conceptSchema = this.getModelConcept(type);
        const baseSchema = getConceptBaseSchema.call(this, conceptSchema.prototype);
        if (!hasOwn(conceptSchema, 'attribute')) {
            conceptSchema.attribute = {};
        }

        Object.assign(conceptSchema.attribute, baseSchema);

        return conceptSchema;
    },

    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        const element = this.getModelConcept(type);
        return cloneObject(element);
    },

    /**
     * Gets a value indicating whether this type is declared in the model
     * @param {string} type 
     * @returns {boolean}
     */
    isConcept(type) { return !isUndefined(this.schema[type]); },

    /**
     * Gets a model element type
     * @param {Object} el element
     */
    getModelElementType(el) { return this.isElement(el.name) ? getModelElementType.call(this, el) : undefined; },

    toString() {
        return this.root.toString();
    }
};

function getModelElementType(el) {
    if (!hasOwn(el, 'prototype')) return el.name;

    return getModelElementType(this.getModelConcept(el.prototype)) + "." + el.name;
}

function getConceptBaseSchema(baseConceptName) {
    var prototype = baseConceptName;
    var baseSchema = {};
    while (!isNullOrUndefined(prototype)) {
        let schema = this.schema[prototype];
        if (schema) {
            Object.assign(baseSchema, schema.attribute);
            prototype = schema['prototype'];
        } else {
            prototype = null;
        }
    }

    return baseSchema;
}