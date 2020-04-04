import { isString, valOrDefault, hasOwn, isNullOrUndefined, isIterable } from "zenkai";
import { AttributeFactory } from "@model/attribute/factory.js";
import { ComponentFactory } from "@model/component/factory.js";

const COMPONENT_NOT_FOUND = -1;
const ATTRIBUTE_NOT_FOUND = -1;

export const Concept = {
    /**
     * Creates a concept
     * @param {*} args 
     * @returns {Concept}
     */
    create: function (args) {
        const instance = Object.create(this);

        Object.assign(instance, args);

        return instance;
    },
    /** Reference to parent model */
    model: null,
    /** Cache of the schema describing the concept */
    schema: null,
    /** Link to the concept data source */
    source: null,
    /** @type {int} */
    id: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    alias: null,
    /** @type {string} */
    fullName: null,
    /** @type {string[]} */
    operations: null,
    /** @type {string} */
    path: null,
    /** @type {Concept} */
    parent: null,
    /** @type {Attribute[]} */
    attributes: null,
    /** @type {Component[]} */
    components: null,
    /** @type {Projection[]} */
    projection: null,
    value: null,
    /** possible values for the concept */
    values: null,
    /** concept actions configuration */
    action: null,
    /** concept shadow list */
    shadows: null,
    /** Object nature */
    object: "concept",
    init(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }
        var { value } = args;

        if (isNullOrUndefined(value)) {
            return this;
        }
        for (const key in value) {
            const element = value[key];
            const [type, name] = key.split(".");
            switch (type) {
                case "attribute":
                    this.createAttribute(name, element);
                    break;
                case "component":
                    this.createComponent(name, element);
                    break;
                default:
                    break;
            }
        }

        return this;
    },

    /**
     * Returns a value indicating whether the concept has an attribute
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    hasAttribute(id) { return this.schema.attribute && hasOwn(this.schema.attribute, id); },
    /**
     * Returns a value indicating whether the attribute is required
     * @param {string} name Attribute's name
     * @returns {boolean}
     */
    isAttributeRequired(name) { return valOrDefault(this.schema.attribute[name].required, true); },
    /**
     * Returns a value indicating whether the attribute has been created
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    isAttributeCreated(id) { return this._attributes.includes(id); },
    /**
     * Returns a value indicating whether the component has been created
     * @param {string} id Component's id
     * @returns {boolean}
     */
    isComponentCreated(id) { return this._components.includes(id); },
    /**
     * Returns a value indicating whether the attribute is required
     * @param {string} name Attribute's name
     * @returns {boolean}
     */
    isComponentRequired(name) { return valOrDefault(this.schema.component.find((c) => c.name === name).required, true); },

    /**
     * Returns a value indicating whether the concept has more than one projection
     * @returns {boolean}
     */
    hasManyProjection() { return this.schema.projection && this.schema.projection.length > 1; },

    getStyle() { return this.model.metamodel.style['concept']; },
    getIdRef() { return this.schema['idref']; },
    getName() { return valOrDefault(this.parent.alias, this.name); },

    getAcceptedValues() {
        if (!isIterable(this.accept) && isNullOrUndefined(this.accept.type)) {
            return "";
        }

        if (isString(this.accept)) {
            return this.accept;
        }

        if (hasOwn(this.accept, "type")) {
            return this.accept.type;
        }
        
        if (Array.isArray(this.accept)) {
            return this.accept.map(accept => this.getAcceptedValues.call({ accept: accept })).join(" or ");
        }
    },
    getOptionalAttributes() {
        if (isNullOrUndefined(this.schema['attribute'])) {
            return [];
        }

        var optionalAttributes = [];

        for (const attrName in this.schema['attribute']) {
            if (!this.isAttributeRequired(attrName) && !this.isAttributeCreated(attrName)) {
                optionalAttributes.push(attrName);
            }
        }

        return optionalAttributes;
    },
    getOptionalComponents() {
        if (isNullOrUndefined(this.schema['component'])) {
            return [];
        }

        var optionalComponents = [];

        this.schema['component'].forEach((component) => {
            let { name } = component;
            if (!this.isComponentRequired(name) && !this.isComponentCreated(name)) {
                optionalComponents.push(component);
            }
        });

        return optionalComponents;
    },

    /** @returns {Attribute} */
    getAttribute(id) {
        var attribute = null;

        if (Number.isInteger(id)) {
            attribute = this.attributes[id];
        } else if (isString(id)) {
            attribute = this.attributes.find((c) => c.name === id);
            if (isNullOrUndefined(attribute)) {
                attribute = this.createAttribute(id);
            }
        } else {
            return ATTRIBUTE_NOT_FOUND;
        }

        return attribute;
    },
    /** @returns {Component} */
    getComponent(id) {
        var component = null;

        if (Number.isInteger(id)) {
            component = valOrDefault(this.components[id], this.createComponent(id));
        } else if (isString(id)) {
            component = this.components.find((c) => c.name === id);
            if (isNullOrUndefined(component)) {
                component = this.createComponent(id);
            }
        } else {
            return COMPONENT_NOT_FOUND;
        }

        return component;
    },

    removeAttribute(attr) {
        var index = null;

        if (isString(attr) && this._attributes.includes(attr)) {
            index = this._attributes.indexOf(attr);
        } else if (attr.object === "attribute" && this.attributes.includes(attr)) {
            index = this.attributes.indexOf(attr);
        } else {
            return false;
        }

        return this.removeAttributeAt(index);
    },
    removeAttributeAt(index) {
        if (!Number.isInteger(index) || index < 0) {
            return false;
        }

        this.attributes.splice(index, 1);
        this._attributes.splice(index, 1);

        return true;
    },

    /**
     * Creates an attribute
     * @param {string} id 
     * @returns {Attribute}
     */
    createAttribute(id, value) {
        var attributeSchema = this.schema.attribute[id];
        var attribute = AttributeFactory.createAttribute(this, id, attributeSchema).init(value);
        this.attributes.push(attribute);
        this._attributes.push(id);

        return attribute;
    },
    /**
     * Creates a component
     * @param {string} id 
     * @returns {Concept}
     */
    createComponent(id, value) {
        var componentSchema = this.schema.component.find((c) => c.name === id);
        var component = ComponentFactory.createComponent(this, componentSchema).init(value);
        component.parent = this;
        component.parentId = this.id;
        this.components.push(component);
        this._components.push(id);

        return component;
    },

    getConceptParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.parent.concept;
    },

    delete() {
        if (this.projection) {
            this.projection.remove();
        }

        return true;
    },

    /** @returns {boolean} */
    isRoot() {
        return this.parent === null;
    },

    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];

        return this.projection.render();
    },

    export() {
        var output = {};

        var attributes = {};
        this.attributes.forEach(attr => {
            Object.assign(attributes, attr.export());
        });

        var components = [];
        this.components.forEach(comp => {
            components.push(comp.export());
        });

        Object.assign(output, attributes);

        return output;
    },
    toString() {
        var output = {};

        this.attributes.forEach(attr => {
            Object.assign(output, attr.toString());
        });
        this.components.forEach(comp => {
            Object.assign(output, {
                // [`${comp.name}@component`]: comp.toString()
                [`component.${comp.name}`]: comp.toString()
            });
        });

        return output;
    },
};