import { cloneObject, hasOwn, valOrDefault, isNullOrUndefined } from "@zenkai/utils/datatype/index.js";
import { ModelElement } from './concept/model-element.js';
import { InvalidModelError } from '@src/exception/index.js';
import { DataType, ModelType } from '@src/global/enums.js';
import { BaseConcept } from "./concept/base-concept.js";

const COMPOSITION = 'composition';
const KEY_ROOT = '@root';

export const Model = {
    /** 
     * Creates a `Model` instance.
     * @returns {Model}
     */
    create(metamodel) {
        var instance = Object.create(this);

        instance.metamodel = metamodel;

        instance.ID = [];      // list of IDs declared in the concrete model
        instance.path = [];    // list of paths,
        instance.options = [];
        instance.projections = [];

        return instance;
    },
    schema: null,
    root: null,
    ID: null,
    path: null,
    options: null,
    editor: null,

    /**
     * Initialize the metamodel.
     * @param {Object} model 
     */
    init(model, editor, args) {
        const MM = this.metamodel;
        this.schema = !isNullOrUndefined(model) ? model : { "root": MM.getModelElement(MM.root) };
        this.editor = editor;
        this.root =  BaseConcept.create(this, this.schema.root);
        Object.assign(this, args);
    

        return this;
    },

    /**
     * Creates and returns a model element
     * @param {Object} el
     * @param {boolean} asRoot
     * @returns {BaseConcept}
     */
    createConcept(name) {
        var schema = this.metamodel.getModelElement(name);
        var concept = BaseConcept.create(schema);

        return concept;
    },

    generateID() { return this.projections.length.toString(); },

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
    isDataType(type) { return hasOwn(DataType, type.split(':')[0]) || this.isModelDataType(type); },
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
    hasComposition(type) { return this.isElement(type) && hasOwn(this.MM[type], COMPOSITION); },

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
    if (!hasOwn(el, 'base')) return el.name;

    return getModelElementType(this.getModelElement(el.base)) + "." + el.name;
}