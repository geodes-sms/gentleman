import { isInt, isString, valOrDefault, hasOwn, isNullOrUndefined } from "@zenkai/utils/datatype/index.js";
import { AttributeFactory } from "@model/attribute/factory.js";

const COMPONENT_NOT_FOUND = -1;
const ATTRIBUTE_NOT_FOUND = -1;

const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

export const Concept = {
    create: function (args) {
        var instance = Object.create(this);

        Object.assign(instance, args);
        instance.attributes = [];
        instance.components = [];

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
    path: null,
    /** @type {Concept} */
    parent: null,
    /** @type {Attribute[]} */
    attributes: null,
    /** @type {Concept[]} */
    components: null,
    /** possible values for the concept */
    values: null,

    hasAttribute(id) { return this.schema.attribute && hasOwn(this.schema.attribute, id); },

    /** @returns {Attribute} */
    getAttribute(id) {
        var attribute = null;
        if (isInt(id)) {
            attribute = this.attributes[id];
        } else if (isString(id)) {
            attribute = valOrDefault(this.attributes.find((c) => c.id === id), this.createAttribute(id));
        } else {
            return ATTRIBUTE_NOT_FOUND;
        }

        return attribute;
    },
    /** @returns {Concept} */
    getComponent(id) {
        var component = null;
        if (isInt(id)) {
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
        var attribute = AttributeFactory.createAttribute(this, attributeSchema).init();
        this.attributes.push(attribute);

        return attribute;
    },
    /**
     * Creates a component
     * @param {string} id 
     * @returns {Concept}
     */
    createComponent(id) {
        var component = this.model.createConcept(`${this.name}.component[${id}]`);
        component.parent = this;
        this.components.push(component);

        return component;
    },
    /** @returns {boolean} */
    isRoot() { return this.parent === null; }
};

function createConcept() {

}