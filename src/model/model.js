import { isString, isObject, isNullOrUndefined, isEmpty } from "zenkai";
import { MetaModel } from './metamodel.js';
import { ConceptFactory } from "./concept/factory.js";
import { ObserverHandler } from "./structure/index.js";


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
    /** @type {*[]} */
    listeners: null,
    /** @type {*[]} */
    watchers: null,
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
     * Initializes the model.
     * @param {Object} model
     */
    init(model) {
        this.concepts = [];
        this.listeners = [];
        this.watchers = [];
        this.root = this.createConcept(this.metamodel.root, {
            value: model
        });

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
    getConcepts(name) {
        if (!isNullOrUndefined(name)) {
            return this.concepts.filter(concept => concept.name === name);
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

        return this.concepts.splice(index, 1)[0];
    },
    /**
     * Verifies that a concept is part of the list of concepts held by the model
     * @param {string} id
     * @returns {boolean} Value indicating whether the concept is present
     */
    hasConcept(id) {
        if (!(isObject(id) || isString(id))) {
            throw new TypeError("Bad request: The 'id' argument must be a non-empty string");
        }

        if (isString(id)) {
            return this.concepts.findIndex(concept => concept.id === id) !== -1;
        }

        return this.concepts.includes(id);
    },

    build() {
        const compModelConcept = this.root.getComponentByName('model_concept');
        const attrConcepts = compModelConcept.getAttributeByName('concepts');
        const setConcepts = attrConcepts.target.getValue();

        var concepts = {};

        setConcepts.filter(concept => concept.hasValue()).forEach(proto => {
            const concept = proto.getValue();
            const structure = concept.getComponentByName('concept_structure');

            const name = getName(concept);

            var attributes = [];
            if (structure.isAttributeCreated('attributes')) {
                attributes = getAttr(structure, 'attributes').getValue();
            }

            var components = [];
            if (structure.isAttributeCreated('components')) {
                components = getAttr(structure, 'components').getValue();
            }

            if (concept.name === "concrete_concept") {
                let projections = [];
                if (concept.isAttributeCreated('projections')) {
                    projections = getAttr(concept, 'projections').getValue();
                }

                let schema = {
                    "nature": "concrete",
                    "attribute": buildAttribute(attributes),
                    "component": buildComponent(components),
                    "projection": buildProjection(projections),
                };

                if (concept.isAttributeCreated("prototype")) {
                    let prototype = getAttr(concept, 'prototype').getValue();
                    schema.prototype = getAttr(prototype, 'name').getValue().toLowerCase();
                }

                Object.assign(concepts, {
                    [name]: schema
                });
            } else if (concept.name === "prototype_concept") {
                let schema = {
                    "nature": "prototype",
                    "attribute": buildAttribute(attributes),
                    "component": buildComponent(components),
                };

                Object.assign(concepts, {
                    [name]: schema
                });
            }
        });

        let rootConcept = getAttr(this.root, 'root').getValue();
        return JSON.stringify(Object.assign(concepts, {
            "@root": getName(rootConcept),
            "@config": {
                "language": getName(this.root),
                "settings": {
                    "autosave": true
                }
            }
        }));
    },
    export() {
        return JSON.stringify(this.root.export());
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

const getAttr = (concept, name) => concept.getAttributeByName(name).target;
const getName = (concept) => getAttr(concept, 'name').getValue().toLowerCase();

const nameMap = {
    string_primitive: (concept) => "string",
    number_primitive: (concept) => "number",
    boolean_primitive: (concept) => "boolean",
    reference_primitive: (concept) => "reference",
    set_primitive: (concept) => "set",
    concept_primitive: (concept) => getName(getAttr(concept, 'concept').getValue()),
};

function buildConcept() {

}

function buildPrototype() {

}

function buildAttribute(attributes) {
    if (!Array.isArray(attributes)) {
        return {};
    }

    var attributeSchema = {};

    attributes.forEach(attribute => {
        var schema = {};

        const attr = (name) => attribute.getAttributeByName(name).target;

        const primitive = attr('target').value;

        schema.target = nameMap[primitive.name](primitive);

        if (primitive.isAttributeCreated("accept")) {
            schema.accept = primitive.getAttributeByName("accept").target.value;
        }

        if (attribute.isAttributeCreated("alias")) {
            schema.alias = attr('alias').value;
        }

        if (attribute.isAttributeCreated("min")) {
            schema.min = attr('min').value;
        }

        if (attribute.isAttributeCreated("max")) {
            schema.max = attr('max').value;
        }

        if (attribute.isAttributeCreated("required")) {
            schema.required = attr('required').value;
        }

        if (attribute.isAttributeCreated('projection')) {
            let projection = getAttr(attribute, 'projection').getValue();
            schema.projection = [buildField(projection)];
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

        const attr = (name) => component.getAttributeByName(name).target;

        if (component.isAttributeCreated("alias")) {
            schema.alias = attr('alias').value;
        }

        if (component.isAttributeCreated("required")) {
            schema.required = attr('required').value;
        }

        schema.attribute = buildAttribute(attr("attributes").getValue());

        Object.assign(componentSchema, {
            [attr('name').value.toLowerCase()]: schema,
        });
    });

    return componentSchema;
}

/**
 * Build projection schema
 * @param {*[]} projections 
 */
function buildProjection(projections) {
    if (!Array.isArray(projections)) {
        return [];
    }

    var projectionSchema = [];

    projections.filter(proto => proto.hasValue()).forEach(proto => {
        const projection = proto.getValue();

        /** @type {*[]} */
        const elements = getAttr(projection, "elements").getValue();
        /** @type {*[]} */
        const tags = getAttr(projection, "tags").getValue();

        var schema = {};

        if (projection.isAttributeCreated("readonly")) {
            schema.readonly = getAttr(projection, 'readonly').getValue();
        }
        if (projection.isAttributeCreated("visible")) {
            schema.visible = getAttr(projection, 'visible').getValue();
        }

        schema.layout = buildLayout(projection, elements);

        projectionSchema.push(schema);
    });

    return projectionSchema;
}

function buildLayout(layout, elements) {
    var schema = {};
    var disposition = [];

    if (layout.name === "stack_projection") {
        schema.type = "stack";
        schema.orientation = getAttr(layout, 'orientation').getValue();

        elements.filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    }
    else if (layout.name === "wrap_projection") {
        schema.type = "wrap";
        elements.filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    }
    else if (layout.name === "table_projection") {
        // TODO
    }

    schema.disposition = disposition;

    return schema;
}

function buildElement(element) {
    if (element.name === "text_element") {
        return getAttr(element, "value").getValue();
    }
    else if (element.name === "attribute_element") {
        let attr = getAttr(element, 'value').getValue();

        return `#${getName(attr)}:attribute`;
    }
    else if (element.name === "component_element") {
        let comp = getAttr(element, 'value').getValue();

        return `#${getName(comp)}:component`;
    }

    return null;
}

function buildField(field) {
    var schema = {
        type: "field"
    };

    if (field.isAttributeCreated("readonly")) {
        schema.readonly = getAttr(field, 'readonly').getValue();
    }

    if (field.isAttributeCreated("disabled")) {
        schema.disabled = getAttr(field, 'disabled').getValue();
    }

    if (field.isAttributeCreated("visible")) {
        schema.visible = getAttr(field, 'visible').getValue();
    }

    if (field.name === "text_field") {
        if (field.isAttributeCreated("placeholder")) {
            schema.placeholder = getAttr(field, 'placeholder').getValue();
        }
        schema.view = "text";
    }
    else if (field.name === "check_field") {
        if (field.isAttributeCreated("label")) {
            schema.label = getAttr(field, 'label').getValue();
        }
        schema.view = "check";
    }
    else if (field.name === "choice_field") {
        schema.view = "choice";
    }
    else if (field.name === "link_field") {
        if (field.isAttributeCreated("placeholder")) {
            schema.placeholder = getAttr(field, 'placeholder').getValue();
        }
        if (field.isAttributeCreated("value")) {
            schema.value = getAttr(field, 'value').getValue();
        }
        if (field.isAttributeCreated("choice")) {
            schema.choice = getAttr(field, 'choice').getValue();
        }
        schema.view = "link";
    }
    else if (field.name === "list_field") {
        if (field.isAttributeCreated("orientation")) {
            schema.orientation = getAttr(field, 'orientation').getValue();
        }
        schema.view = "list";
    }

    return schema;
}