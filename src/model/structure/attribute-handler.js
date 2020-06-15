import { isNullOrUndefined, valOrDefault, hasOwn, isNullOrWhitespace } from "zenkai";
import { Attribute } from "./attribute";


export const AttributeHandler = {
    /** @type {Attribute[]} */
    attributes: null,
    /** @returns {Attribute[]} */
    initAttribute() {
        this.attributes = [];
        this.attributes._created = new Set();
        this.attributes._updated = new Set();
        this.attributes._deleted = new Set();

        return this;
    },
    getAttributes() {
        return this.attributes;
    },
    /** @returns {Attribute} */
    getAttribute(id) {
        if (isNullOrWhitespace(id) || !Number.isInteger(id)) {
            throw new TypeError("Bad argument");
        }

        if (Number.isInteger(id)) {
            return id < this.attributes.length ? this.attributes[id] : null;
        }

        return this.getAttributeByName(id);
    },
    /** @returns {Attribute} */
    getAttributeByName(name) {
        if (isNullOrWhitespace(name)) {
            throw new TypeError("Bad argument");
        }

        var attribute = this.attributes.find((c) => c.name === name);

        if (isNullOrUndefined(attribute)) {
            attribute = this.createAttribute(name);
        }

        return attribute;
    },
    /** @returns {Attribute} */
    getUniqueAttribute() {
        var attribute = this.attributes.find((c) => c.isUnique());

        return attribute;
    },
    /**
     * Creates an attribute
     * @param {string} name 
     * @returns {Attribute}
     */
    createAttribute(name, value) {
        if (!hasOwn(this.attributeSchema, name)) {
            throw new Error(`Attribute not found: The concept ${this.name} does not contain an attribute named ${name}`);
        }

        const schema = Object.assign(this.attributeSchema[name], { name: name });

        var attribute = Attribute.create(this, schema).init(value);
        this.addAttribute(attribute);

        return attribute;
    },

    addAttribute(attribute) {
        this.attributes.push(attribute);
        this.attributes._created.add(attribute.name);

        this.notify("attribute.added", attribute);
    },
    /**
     * Returns a value indicating whether the concept has an attribute
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    hasAttribute(id) { return hasOwn(this.attributeSchema, id); },
    /**
     * Returns a value indicating whether the attribute is required
     * @param {string} name Attribute's id
     * @returns {boolean}
     */
    isAttributeRequired(name) { return valOrDefault(this.attributeSchema[name].required, true); },
    /**
     * Returns a value indicating whether the attribute has been created
     * @param {string} name Attribute's id
     * @returns {boolean}
     */
    isAttributeCreated(name) { return this.attributes._created.has(name); },
    getOptionalAttributes() {
        if (isNullOrUndefined(this.attributeSchema)) {
            return [];
        }

        var optionalAttributes = [];

        for (const attrName in this.attributeSchema) {
            if (!this.isAttributeRequired(attrName) && !this.isAttributeCreated(attrName)) {
                optionalAttributes.push(attrName);
            }
        }

        return optionalAttributes;
    },
    listAttributes() {
        var attributes = [];

        for (const attrName in this.attributeSchema) {
            let attribute = this.attributeSchema[attrName];
            attributes.push({
                type: "attribute",
                name: attrName,
                alias: attribute['alias'],
                description: attribute['description'],
                target: attribute['target'],
                accept: attribute['accept'],
                required: this.isAttributeRequired(attrName),
                created: this.isAttributeCreated(attrName)
            });
        }

        return attributes;
    },
    removeAttribute(name) {
        var removedAttribute = this.attributes.splice(this.attributes.findIndex(attr => attr.name === name), 1);
        this.attributes._created.remove(name);

        this.notify("attribute.removed", removedAttribute);
        
        return removedAttribute.length === 1;
    },
};
