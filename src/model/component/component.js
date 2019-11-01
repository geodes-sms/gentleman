import { isInt, isString, valOrDefault, hasOwn, isNullOrUndefined } from "zenkai";
import { AttributeFactory } from "@model/attribute/factory.js";
import { TextualProjection } from "@projection/text-projection";

const ATTRIBUTE_NOT_FOUND = -1;

const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

/**
 * @memberof Component
 */
export const Component = {
    create: function (concept, schema, args) {
        var instance = Object.create(this);

        instance.concept = concept;
        instance.model = concept.model;
        instance.schema = schema;
        instance.name = schema.name;
        instance.projection = TextualProjection.create(schema.projection[instance.projectionIndex], instance, concept.model.editor);
        instance.attributes = [];
        Object.assign(instance, args);

        return instance;
    },
    /** Cache of the schema describing the component */
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
    /** possible values for the concept */
    values: null,
    /** @type {TextualProjection} */
    projection: null,
    projectionIndex: 0,
    representation: null,
    container: null,
    object: "component",

    getStyle(){
        return this.model.metamodel.style['component'];
    },

    /**
     * Returns a value indicating whether the component has an attribute
     * @param {*} id 
     * @returns {boolean}
     */
    hasAttribute(id) { return this.schema.attribute && hasOwn(this.schema.attribute, id); },
    /** @returns {Attribute} */
    getAttribute(id) {
        // console.log(`Get attribute: ${id}`);
        var attribute = null;
        if (isInt(id)) {
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
    /**
     * Creates an attribute
     * @param {string} id 
     * @returns {Attribute}
     */
    createAttribute(id) {
        // console.log(`Create attribute: ${id}`);
        var attributeSchema = this.schema.attribute[id];
        var attribute = AttributeFactory.createAttribute(this, attributeSchema).init();
        this.attributes.push(attribute);

        return attribute;
    },
    render() {
        return this.projection.render();
    },
    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];
        return this.projection.render();
    }
};