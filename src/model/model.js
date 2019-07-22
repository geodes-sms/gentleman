import { cloneObject, hasOwn, valOrDefault, isNullOrUndefined } from "@zenkai/utils/datatype/index.js";
import { InvalidModelError } from '@src/exception/index.js';
import { DataType, ModelType } from '@global/enums.js';
import { ConceptFactory } from "./concept/factory.js";

export const Model = {
    /** 
     * Creates a `Model` instance.
     * @returns {Model}
     */
    create(metamodel) {
        var instance = Object.create(this);

        instance.metamodel = metamodel;

        return instance;
    },
    schema: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {BaseConcept} */
    root: null,
    editor: null,

    /**
     * Initialize the model.
     * @param {Object} model 
     * @param {Editor} editor 
     * @param {Object} args 
     */
    init(model, editor, args) {
        this.schema = !isNullOrUndefined(model) ? model : initSchema(this.metamodel);
        this.editor = editor;
        this.root = ConceptFactory.createConcept(this, 'root', this.schema.root);
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

        return ConceptFactory.createConcept(this, name, schema);
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
    hasComposition(type) { return this.isElement(type) && hasOwn(this.MM[type], 'composition'); },

    /**
     * Gets a model element type
     * @param {Object} el element
     */
    getModelElementType(el) {
        return this.isElement(el.name) ? getModelElementType.call(this, el) : undefined;
    },

    toString() { return this.root.toString(); }
};

function initSchema(metamodel) {
    var schema = { "root": metamodel.getModelElement(metamodel.root) };
    if (!hasOwn(schema.root, 'name')) {
        schema.root['name'] = metamodel.root;
    }
    return schema;
}

function getModelElementType(el) {
    if (!hasOwn(el, 'base')) return el.name;

    return getModelElementType(this.getModelElement(el.base)) + "." + el.name;
}

function isPrimitive(type) {
    return hasOwn(DataType, type);
}