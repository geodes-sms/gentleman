import { isString, valOrDefault, hasOwn, isNullOrUndefined } from "zenkai";
import { AttributeFactory } from "@model/attribute/factory.js";
import { TextualProjection } from "@projection/text-projection.js";


const ATTRIBUTE_NOT_FOUND = -1;

export const Component = {
    create: function (concept, schema, args) {
        const instance = Object.create(this);

        instance.concept = concept;
        instance.model = concept.model;
        instance.schema = schema;
        instance.name = schema.name;
        instance.fullName = `${concept.name}:${schema.name}`;
        instance.projection = TextualProjection.create(schema.projection[instance.projectionIndex], instance, concept.model.editor);
        instance.required = valOrDefault(instance.schema.required, true);
        instance.attributes = [];
        instance._attributes = [];

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
    fullName: null,
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
    init(data) {
        if(isNullOrUndefined(data)) {
            return this;
        }
        
        for (const key in data) {
            const element = data[key];
            const [type, name] = key.split(".");
            // console.log(type, name, element);
            switch (type) {
                case "attribute":
                    this.createAttribute(name, element);
                    break;
                default:
                    break;
            }
        }

        return this;
    },

    getStyle() { return this.model.metamodel.style['component']; },
    hasManyProjection() { return this.schema.projection.length > 1; },

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
    canDelete() {
        return !this.required;
    },
    render() {
        return this.projection.render();
    },
    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];
        return this.projection.render();
    },
    export() {
        var output = {
            name: valOrDefault(this.name, this.id)
        };

        var attributes = {};
        this.attributes.forEach(attr => {
            Object.assign(attributes, attr.export());
        });
        Object.assign(output, attributes);

        return output;
    },
    toString() {
        var output = {};

        this.attributes.forEach(attr => {
            Object.assign(output, attr.toString());
        });

        return output;
    }
};