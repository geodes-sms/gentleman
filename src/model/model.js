import { isString, isObject, isNullOrUndefined, isEmpty } from "zenkai";
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
    /** @type {Concept} */
    root: null,
    /** @type {Concept[]} */
    concepts: null,

    /**
     * Initializes the model.
     * @param {Object} model 
     */
    init(model) {
        this.concepts = [];
        this.root = this.createConcept(this.metamodel.root, { value: model });

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
    /**
     * Returns a concept with matching id from the list of concepts held by the model
     * @param {string} id 
     * @returns {Concept}
     */
    getConcept(id) {
        if (!(isString(id) && !isEmpty(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        return this.concepts.find(concept => concept.id === id);
    },
    /**
     * Adds a concept to the list of concepts held by the model
     * @param {Concept} concept 
     */
    addConcept(concept) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Bad request: The 'concept' argument must be a Concept");
        }

        this.concepts.push(concept);

        return this;
    },
    /**
     * Removes a concept from the list of concepts held by the model
     * @param {string} id 
     * @returns {Concept} The removed concept
     */
    removeConcept(id) {
        if (!(isObject(id) || isString(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        var index = this.concepts.findIndex(concept => concept.id === id);

        if (index === -1) {
            return null;
        }

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