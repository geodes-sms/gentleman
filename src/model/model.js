import { UTILS as $, HELPER as _ } from '@utils';
import { ModelElement } from './model-element';
import { Exception as ERR } from '@src/exception';
import { DataType, ModelType } from '@src/enums';

const COMPOSITION = 'composition';
const KEY_ROOT = '@root';

export const MetaModel = {
    /** 
     * Creates a `MetaModel` instance.
     * @returns {MetaModel}
     */
    create(metamodel) {
        var instance = Object.create(this);

        instance._metamodel = metamodel;
        instance.ID = [];      // list of IDs declared in the concrete model
        instance.path = [];    // list of paths,
        instance.options = [];
        instance.projections = [];
        instance.root = undefined;

        return instance;
    },

    /**
     * Gets the model
     */
    get concrete() { return this._model; },
    /**
     * Gets the metamodel
     * @readonly
     */
    get MM() { return this._metamodel; },

    /**
     * Initialize the metamodel.
     * @param {Object} model 
     */
    init(model) {
        this._model = model;
        this.ID = [];
        this.path = [];
        this.options = [];
        this.projections = [];

        return this;
    },

    createModel() {
        var root = this.MM[KEY_ROOT];
        if (root) {
            return { root: JSON.parse(JSON.stringify(this.MM[root])) };
        }
        // throw an error if the root was not found.
        var error = ERR.InvalidModelError.create("Root not found: The metamodel does not contain an element with the attribute root");
        throw error;
    },
    /**
     * Creates and returns a model element
     * @param {Object} el
     * @param {boolean} asRoot
     * @returns {ModelElement}
     */
    createModelElement(el, asRoot) {
        asRoot = _.valOrDefault(asRoot, false);
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
    getModelElement(type) { return this.isElement(type) ? JSON.parse(JSON.stringify(this.MM[type])) : undefined; },

    generateID() { return this.projections.length.toString(); },

    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        var element = this.getModelElement(type);
        return element && !(this.isEnum(type) || this.isDataType(type)) ? _.cloneObject(element) : "";
    },

    /**
     * Gets a value indicating whether this type is declared in the model
     * @param {string} type 
     * @returns {boolean}
     */
    isElement(type) { return this.MM[type] !== undefined; },
    /**
     * Gets a value indicating whether the element is of type "ENUM"
     * @param {string} type 
     * @returns {boolean}
     */
    isEnum(type) { return this.isElement(type) && this.MM[type].type == ModelType.ENUM; },
    /**
     * Gets a value indicating whether the element is of type "PRIMITIVE" or "DATATYPE"
     * @param {string} type 
     * @returns {boolean}
     */
    isDataType(type) { return _.hasOwn(DataType, type.split(':')[0]) || this.isModelDataType(type); },
    /**
     * Gets a value indicating whether the element is of type "DATATYPE"
     * @param {string} type 
     * @returns {boolean}
     */
    isModelDataType(type) { return this.isElement(type) && this.MM[type].type === ModelType.DATATYPE; },
    /**
     * Gets a value indicating whether the element has a composition
     * @param {string} type 
     * @returns {boolean}
     */
    hasComposition(type) { return this.isElement(type) && _.hasOwn(this.MM[type], COMPOSITION); },

    /**
     * Gets a model element type
     * @param {Object} el element
     */
    getModelElementType(el) {
        return this.isElement(el.name) ? getModelElementType.call(this, el) : undefined;
    },

    toString() { return this.root.toString(); }
};

function getModelElementType(el) {
    if (!_.hasOwn(el, 'base')) return el.name;

    return getModelElementType(this.getModelElement(el.base)) + "." + el.name;
}