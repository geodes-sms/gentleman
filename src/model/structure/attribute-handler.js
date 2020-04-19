import { isNullOrUndefined, isString, valOrDefault, hasOwn, isNullOrWhitespace, defProp } from "zenkai";
import { Attribute } from "./attribute";


export const AttributeHandler = {
    /** @type {Attribute[]} */
    attributes: null,
    /** @type {number[]} */
    _attributes: null,
    /** @returns {Attribute[]} */
    initAttribute() {
        this.attributes = [];
        this._attributes = [];
    },
    getAttributes() {
        return this.attributes;
    },
    /** @returns {Attribute} */
    getAttribute(id) {
        if (isNullOrWhitespace(id) || !Number.isInteger(id)) {
            throw new Error("Bad parameter");
        }

        if (Number.isInteger(id)) {
            return id < this.attributes.length ? this.attributes[id] : null;
        }

        return this.getAttributeByName(id);
    },
    /** @returns {Attribute} */
    getAttributeByName(name) {
        if (isNullOrWhitespace(name)) {
            throw new Error("Bad parameter");
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
        const schema = this.attributeSchema[name];
        if (isNullOrUndefined(schema)) {
            throw new Error(`Attribute not found: The concept ${this.name} does not contain an attribute named ${name}`);
        }
        this.attributeSchema[name].name = name;
        var attribute = Attribute.create(this, schema).init(value);

        this.addAttribute(attribute);

        return attribute;
    },

    addAttribute(attribute) {
        this.attributes.push(attribute);
        this._attributes.push(attribute.name);
    },
    /**
     * Returns a value indicating whether the concept has an attribute
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    hasAttribute(id) { return hasOwn(this.attributeSchema, id); },
    /**
     * Returns a value indicating whether the attribute is required
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    isAttributeRequired(id) { return valOrDefault(this.attributeSchema[id].required, true); },
    /**
     * Returns a value indicating whether the attribute has been created
     * @param {string} id Attribute's id
     * @returns {boolean}
     */
    isAttributeCreated(id) { return this._attributes.includes(id); },
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
    removeAttribute(attribute) {
        var index = null;

        if (isString(attribute) && this._attributes.includes(attribute)) {
            index = this._attributes.indexOf(attribute);
        } else if (attribute.object === "attribute" && this.attributes.includes(attribute)) {
            index = this.attributes.indexOf(attribute);
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
};

