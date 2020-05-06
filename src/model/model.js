import { hasOwn, isNullOrUndefined, createSpan } from "zenkai";
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
    root: null,
    /** @type {Concept[]} */
    concepts: null,

    /**
     * Initialize the model.
     * @param {Object} model 
     * @param {Object} args 
     */
    init(model) {
        this.concepts = [];
        this.root = this.createConcept(this.metamodel.root, { value: model });
        this.concepts.push(this.root);

        return this;
    },
    /**
     * Creates and returns a model element
     * @param {string} name
     * @returns {Concept}
     */
    createConcept(name, args) {
        const schema = this.metamodel.getCompleteModelConcept(name);
        var concept = ConceptFactory.createConcept(name, this, schema, args);

        this.addConcept(concept);

        return concept;
    },
    addConcept(concept) {
        this.concepts.push(concept);
        return this;
    },
    getConcept(id) {
        return this.concepts.find(concept => concept.id === id);
    },
    removeConcept(id) {
        var index = this.concepts.findIndex(concept => concept.id === id);
        return this.concepts.splice(index, 1);
    },
    export() {
        return JSON.stringify(this.root.toString());
    },
    toString() {
        return JSON.stringify({
            [this.root.name]: this.root.toString()
        });
    },
    project() {
        return this.root.project();
    }
};