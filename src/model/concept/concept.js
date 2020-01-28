import { isString, valOrDefault, hasOwn, isNullOrUndefined } from "zenkai";
import { AttributeFactory } from "@model/attribute/factory.js";
import { ComponentFactory } from "@model/component/factory";

const COMPONENT_NOT_FOUND = -1;
const ATTRIBUTE_NOT_FOUND = -1;

export const Concept = {
    create: function (args) {
        var instance = Object.create(this);

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
    value: null,
    /** possible values for the concept */
    values: null,
    /** concept actions configuration */
    action: null,
    /** concept shadow list */
    shadows: null,
    object: "concept",


    /**
     * Returns a value indicating whether the concept has an attribute
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    hasAttribute(id) { return this.schema.attribute && hasOwn(this.schema.attribute, id); },
    /**
     * Returns a value indicating whether the attribute is required
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    isAttributeRequired(id) { return valOrDefault(this.schema.attribute[id].required, true); },
    /**
     * Returns a value indicating whether the attribute has been created
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    isAttributeCreated(id) { return this._attributes.includes(id); },
 
    getStyle(){
        return this.model.metamodel.style['concept'];
    },
    getIdRef(){
        return this.schema['idref'];
    },

    getOptionalAttributes() {
        var attributes = [];

        for (const attr in this.schema['attribute']) {
            if (!this.isAttributeRequired(attr) && !this._attributes.includes(attr)) {
                attributes.push(attr);
            }
        }

        return attributes;
    },

    /** @returns {Attribute} */
    getAttribute(id) {
        // console.log(`Get attribute: ${id}`);
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

    /** @returns {Component} */
    getComponent(id) {
        // console.log(`Get component: ${id}`);
        var component = null;
        if (Number.isInteger(id)) {
            component = valOrDefault(this.components[id], this.createComponent(id));
        } else if (isString(id)) {
            component = valOrDefault(this.components.find((c) => c.id === id), this.createComponent(id));
        } else {
            return COMPONENT_NOT_FOUND;
        }

        return component;
    },
    /**
     * Creates an attribute
     * @param {string} id 
     * @returns {Attribute}
     */
    createAttribute(id) {
        var attributeSchema = this.schema.attribute[id];
        var attribute = AttributeFactory.createAttribute(this, id, attributeSchema).init();
        this.attributes.push(attribute);
        this._attributes.push(id);

        return attribute;
    },
    /**
     * Creates a component
     * @param {string} id 
     * @returns {Concept}
     */
    createComponent(id) {
        // console.log(`Create component: ${id}`);
        
        var componentSchema = this.schema.component.find((c) => c.name === id);
        var component = ComponentFactory.createComponent(this, componentSchema);
        component.parent = this;
        this.components.push(component);
        this._components.push(id);

        return component;
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
        var output = { };

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
                [`[${comp.name}]`]: comp.toString()
            });
        });

        return output;
    },
};