import { cloneObject, isNullOrUndefined, hasOwn, valOrDefault, isString, isNullOrWhitespace, isUndefined } from "@zenkai/utils/datatype/index.js";
import { InvalidMetaModelError } from '@src/exception/index.js';
import { DataType, ModelType } from '@src/global/enums.js';
import { Model } from "./model.js";

const COMPOSITION = 'composition';
const KEY_ROOT = '@root';
const KEY_CONFIG = '@config';
const KEY_RESOURCES = '@resources';
const PROP_LANGUAGE = 'language';

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
     * Gets a model element by type
     * @param {string} type 
     */
    getModelElement(type) { 
        var [concept, prop] = type.split('.');

        if(!this.isElement(concept)) {
            return undefined;
        }

        var conceptTarget =  deepCopy(this.schema[concept]);
        if (isString(prop) && prop.startsWith('component')) {
            let componentName = prop.substring(prop.indexOf('[') + 1, prop.indexOf(']'));
            conceptTarget = conceptTarget.component.find((c) => c.name === componentName);
        }

        return conceptTarget; 
    },

    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        var element = this.getModelElement(type);
        return element && !(this.isEnum(type) || this.isDataType(type)) ? cloneObject(element) : "";
    },

    /**
     * Gets a value indicating whether this type is declared in the model
     * @param {string} type 
     * @returns {boolean}
     */
    isElement(type) { return !isUndefined(this.schema[type]); },

    /**
     * Gets a value indicating whether this type is declared in the model
     * @param {string} type 
     * @returns {boolean}
     */
    isConcept(type) { return !isUndefined(this.schema[type]); },

    /**
     * Gets a value indicating whether the element is of type "ENUM"
     * @param {string} type 
     * @returns {boolean}
     */
    isEnum(type) { return this.isElement(type) && this.schema[type].type == ModelType.ENUM; },

    /**
     * Gets a value indicating whether the element is of type "PRIMITIVE" or "DATATYPE"
     * @param {string} type 
     * @returns {boolean}
     */
    isDataType(type) { return hasOwn(DataType, type.split(':')[0]) || this.isModelDataType(type); },

    /**
     * Gets a value indicating whether the element is of type "DATATYPE"
     * @param {string} type 
     * @returns {boolean}
     */
    isModelDataType(type) { return this.isElement(type) && this.schema[type].type === ModelType.DATATYPE; },

    /**
     * Gets a value indicating whether the element has a composition
     * @param {string} type 
     * @returns {boolean}
     */
    hasComposition(type) { return this.isElement(type) && hasOwn(this.schema[type], COMPOSITION); },

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
    if (!hasOwn(el, 'base')) return el.name;

    return getModelElementType(this.getModelElement(el.base)) + "." + el.name;
}