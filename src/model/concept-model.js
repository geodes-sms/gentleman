import { isString, isObject, isNullOrUndefined, isEmpty, hasOwn, isIterable } from "zenkai";
import { deepCopy } from "@utils/index.js";
import { ConceptFactory } from "./concept/factory.js";
import { ObserverHandler } from "./structure/index.js";


export const ConceptModel = {
    /** @type {Concept[]} */
    concepts: null,
    /** @type {*[]} */
    listeners: null,
    /** @type {*[]} */
    watchers: null,

    init() {
        this.concepts = [];
        this.listeners = [];
        this.watchers = [];

        return this;
    },

    register(listener, watch) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
            this.watchers.push(watch);
        }

        return true;
    },
    unregister(listener) {
        var index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);

            return true;
        }

        return false;
    },
    notify(message, value) {
        this.listeners.forEach(listener => {
            listener.update(message, value);
        });
    },

    /**
     * Creates and returns a model element
     * @param {string} name
     * @returns {Concept}
     */
    createConcept(name, args) {
        const schema = this.getCompleteModelConcept(name);

        var concept = ConceptFactory.createConcept(name, this, schema, args);

        this.addConcept(concept);

        return concept;
    },
    getConcepts(name) {
        if (isIterable(name)) {
            const pred = Array.isArray(name) ? (concept) => name.includes(concept.name) : (concept) => concept.name === name;

            return this.concepts.filter(concept => pred(concept));
        }

        return this.concepts.slice();
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

        if (this.watchers.includes(concept.name)) {
            this.notify('concept.added', concept);
        }

        // console.warn("concept added", this.concepts.length);

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

        let removedConcept = this.concepts.splice(index, 1)[0];

        // console.warn("concept removed", this.concepts.length);

        return removedConcept;
    },

    /**
     * Gets a value indicating whether this concept is declared in the model
     * @param {string} name 
     * @returns {boolean}
     */
    isConcept(name) {
        return this.schema.findIndex(concept => concept.name === name) !== -1;
    },
    /**
     * Gets a value indicating whether this concept is concrete
     * @param {string} name 
     * @returns {boolean}
     */
    isConcrete(name) {
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        return concept.nature === "concrete";
    },
    /**
     * Gets a value indicating whether this concept is a prototype
     * @param {string} name 
     * @returns {boolean}
     */
    isPrototype(name) {
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        return concept.nature === "prototype";
    },

    /**
     * Gets a model concept by name
     * @param {string} name 
     */
    getConceptSchema(name) {
        const concept = this.schema.find(concept => concept.name === name);

        if (isNullOrUndefined(concept)) {
            return undefined;
        }

        return deepCopy(concept);
    },
    getCompleteModelConcept(name) {
        const conceptSchema = this.getConceptSchema(name);

        if (isNullOrUndefined(conceptSchema)) {
            return undefined;
        }

        if (!hasOwn(conceptSchema, 'attribute')) {
            conceptSchema.attribute = {};
        }
        if (!hasOwn(conceptSchema, 'component')) {
            conceptSchema.component = {};
        }

        const baseSchema = getConceptBaseSchema.call(this, conceptSchema.prototype);

        Object.assign(conceptSchema.attribute, baseSchema.attribute);
        Object.assign(conceptSchema.component, baseSchema.component);

        return conceptSchema;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} prototype 
     */
    getConcreteConcepts(prototype) {
        const concepts = this.schema.filter(concept => concept.nature === "concrete");

        if (prototype) {
            return concepts.filter(concept => concept.prototype === prototype);
        }

        return concepts;
    },

    /**
     * Gets a list of concepts based on a prototype
     * @param {string} base 
     */
    getDerivedConcepts(base) {
        if (isNullOrUndefined(base)) {
            throw new TypeError("Bad argument");
        }

        const concepts = this.schema.filter(concept => concept.base === base);

        return concepts;
    },


    build() {
        const concepts = [];

        this.getConcepts(["prototype_concept", "concrete_concept"]).forEach(concept => {
            var attributes = [];
            if (concept.isAttributeCreated("attributes")) {
                attributes = getAttr(concept, 'attributes').getValue();
            }

            var components = [];
            if (concept.isAttributeCreated("components")) {
                components = getAttr(concept, 'components').getValue();
            }

            const ConceptNature = {
                "concrete_concept": "concrete",
                "prototype_concept": "prototype",
            };

            let schema = {
                "nature": ConceptNature[concept.name],
                "prototype": concept.isAttributeCreated("prototype") ? getAttr(concept, 'prototype').getValue() : null,
                "name": getName(concept),
                "id": concept.id,
                "attribute": buildAttribute(attributes),
                "component": buildComponent(components),
            };

            concepts.push(schema);
        });

        console.log(concepts);

        return JSON.stringify({
            "concepts": concepts
        });
    },
    export() {
        return JSON.stringify(this.root.export());
    },
    toString() {
        return JSON.stringify({
            [this.root.name]: this.root.toString()
        });
    },
};

const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getName = (concept) => getAttr(concept, 'name').getValue().toLowerCase();

const nameMap = {
    string_primitive: (concept) => "string",
    number_primitive: (concept) => "number",
    boolean_primitive: (concept) => "boolean",
    reference_primitive: (concept) => "reference",
    set_primitive: (concept) => "set",
    concept_primitive: (concept) => getAttr(concept, 'concept').getValue(),
};


function buildAttribute(attributes) {
    if (!Array.isArray(attributes)) {
        return {};
    }

    var attributeSchema = {};

    attributes.forEach(attribute => {
        var schema = {};

        const primitive = getAttr(attribute, "target").getValue();

        schema.target = nameMap[primitive.name](primitive);

        if (primitive.isAttributeCreated("accept")) {
            schema.accept = getAttr(primitive, "accept").getValue();
        }

        if (primitive.isAttributeCreated("min")) {
            schema.min = getAttr(primitive, 'min').getValue();
        }

        if (primitive.isAttributeCreated("max")) {
            schema.max = getAttr(primitive, "max").getValue();
        }

        if (attribute.isAttributeCreated("alias")) {
            schema.alias = getAttr(attribute, "alias").getValue();
        }

        if (attribute.isAttributeCreated("description")) {
            schema.alias = getAttr(attribute, "description").getValue();
        }

        if (attribute.isAttributeCreated("required")) {
            schema.required = getAttr(attribute, "required").getValue();
        }

        Object.assign(attributeSchema, {
            [getName(attribute)]: schema
        });
    });

    return attributeSchema;
}

function buildComponent(components) {
    if (!Array.isArray(components)) {
        return {};
    }

    var componentSchema = {};

    components.forEach(component => {
        var schema = {};

        if (component.isAttributeCreated("alias")) {
            schema.alias = getAttr(component, "alias").getValue();
        }

        if (component.isAttributeCreated("description")) {
            schema.alias = getAttr(component, "description").getValue();
        }

        if (component.isAttributeCreated("required")) {
            schema.required = getAttr(component, "required").getValue();
        }

        var attributes = [];
        if (component.isAttributeCreated("attributes")) {
            attributes = getAttr(component, 'attributes').getValue();
        }

        schema.attribute = buildAttribute(attributes);

        Object.assign(componentSchema, {
            [getName(component)]: schema,
        });
    });

    return componentSchema;
}


/**
 * Gets the concept base schema
 * @param {string} protoName 
 * @this {ConceptModel}
 */
function getConceptBaseSchema(protoName) {
    var prototype = protoName;

    const baseSchema = {
        attribute: {},
        component: {},
    };

    while (!isNullOrUndefined(prototype)) {
        let schema = this.getConceptSchema(prototype);

        if (schema) {
            Object.assign(baseSchema.attribute, schema.attribute);
            Object.assign(baseSchema.component, schema.component);
            prototype = schema['prototype'];
        } else {
            prototype = null;
        }
    }

    return baseSchema;
}