import { cloneObject, hasOwn, isNullOrUndefined } from "zenkai";
import { UUID } from "@utils/index.js";
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
        instance.concepts = [];

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
        this.root = ConceptFactory.createConcept(this, this.schema.root['name'], this.schema.root);

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
        const schema = this.metamodel.getCompleteModelConcept(name);

        var concept = ConceptFactory.createConcept(this, name, schema);
        this.concepts.push(concept);

        return concept;
    },
    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        const element = this.metamodel.getModelConcept(type);

        return element && !(this.isEnum(type) || this.isDataType(type)) ? cloneObject(element) : "";
    },
    generateId() {
        return UUID.generate();
    },
    export() {
        return JSON.stringify(this.root.export());
    },
    toString() {
        return JSON.stringify(this.root.toString());
    },
};


function initSchema(metamodel) {
    const schema = { "root": metamodel.getCompleteModelConcept(metamodel.root) };

    if (!hasOwn(schema.root, 'name')) {
        schema.root['name'] = metamodel.root;
    }

    return schema;
}