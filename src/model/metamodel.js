import { cloneObject, isNullOrUndefined, hasOwn, valOrDefault, isString, isNullOrWhitespace, isUndefined } from "@zenkai/utils/datatype/index.js";
import { ModelElement } from './concept/model-element';
import { InvalidMetaModelError } from '@src/exception/index.js';
import { DataType, ModelType } from '@src/global/enums.js';
import { Model } from "./model.js";
import { random } from "@zenkai/utils/math-utils.js";

const COMPOSITION = 'composition';
const KEY_ROOT = '@root';
const KEY_CONFIG = '@config';
const KEY_RESOURCE = '@resources';

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const MetaModel = {
    create(metamodel) {
        var instance = Object.create(this);

        instance.schema = metamodel;
        instance._root = metamodel[KEY_ROOT];
        instance._config = metamodel[KEY_CONFIG];
        instance._resources = metamodel[KEY_RESOURCE];
        instance.models = [];

        return instance;
    },
    schema: null,
    models: null,

    get root() { return this._root; },
    get language() {
        if (!isNullOrUndefined(this._config) && isString(this._config.language)) {
            return this._config.language;
        }
        return null;
    },
    get resources() { return this._resources; },
    getModel(id) { return isString(id) ? this.models.find((m) => m.id === id) : this.models[id]; },

    init(metamodel, args) {
        this.schema = metamodel;

        return this;
    },

    createModel() {
        if (!isNullOrWhitespace(this.root)) {
            let model = Model.create(this);
            this.models.push(model);
            return model;
        }

        // throw an error if the root was not found.
        var error = InvalidMetaModelError.create("Root not found: The metamodel does not contain a concept with the property `root`");
        throw error;
    },

    /**
     * Creates and returns a model element
     * @param {Object} el
     * @param {boolean} asRoot
     * @returns {ModelElement}
     */
    createModelElement(el, asRoot) {
        asRoot = valOrDefault(asRoot, false);
        var mElement = ModelElement.create(this, el);
        if (asRoot) {
            this.root = mElement;
        }

        return mElement;
    },
    /**
     * Gets a model element by type
     * @param {string} type 
     */
    getModelElement(type) { return this.isElement(type) ? deepCopy(this.schema[type]) : undefined; },

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