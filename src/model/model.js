import { cloneObject, hasOwn, valOrDefault, isNullOrUndefined } from "zenkai";
import { MetaModel } from './metamodel.js';
import { ConceptFactory } from "./concept/factory.js";

export const Model = {
    /** 
     * Creates a `Model` instance.
     * @param {MetaModel} metamodel
     * @returns {Model}
     */
    create(metamodel) {
        const instance = Object.create(this);

        instance.metamodel = metamodel;

        return instance;
    },
    schema: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Concept.BaseConcept} */
    root: null,
    /** @type {Editor} */
    editor: null,

    /**
     * Initialize the model.
     * @param {Object} model 
     * @param {Editor} editor 
     * @param {Object} args 
     */
    init(model, editor) {
        this.schema = !isNullOrUndefined(model) ? model : initSchema(this.metamodel);
        this.editor = editor;
        this.root = ConceptFactory.createConcept(this, 'root', this.schema.root);
        
        // (?) Uncomment to add optional argument parameters
        // Object.assign(this, args);

        return this;
    },
    /**
     * Creates and returns a model element
     * @param {string} name
     * @returns {Concept}
     */
    createConcept(name) {
        // console.log(`Create concept: ${name}`);
        const schema = this.metamodel.getCompleteModelConcept(name);

        return ConceptFactory.createConcept(this, name, schema);
    },
    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        const element = this.metamodel.getModelConcept(type);

        return element && !(this.isEnum(type) || this.isDataType(type)) ? cloneObject(element) : "";
    },

    toString() { return this.root.toString(); }
};

function initSchema(metamodel) {
    const schema = { "root": metamodel.getCompleteModelConcept(metamodel.root) };

    if (!hasOwn(schema.root, 'name')) {
        schema.root['name'] = metamodel.root;
    }

    return schema;
}