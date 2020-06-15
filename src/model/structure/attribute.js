import { valOrDefault, isEmpty } from "zenkai";
import { BaseStructure } from "./structure.js";


export const BaseAttribute = {
    /** @type {string} */
    target: null,
    /** @type {string} */
    accept: null,
    /** @type {string} */
    object: "attribute",

    init(value) {
        this.target = this.model.createConcept(this.schema.target, Object.assign({}, this.schema, {
            value: value,
            parent: this.concept.id,
            min: this.min,
            refname: this.name,
            reftype: "attribute",
        }));

        return this;
    },
    getValue() { return this.target.value; },

    delete() {
        if (Array.isArray(this.value)) {
            this.value.forEach((item) => item.delete());
        } else {
            this.value.delete();
        }

        return this.concept.removeAttribute(this.name);
    },

    export() {
        var output = {
            [`${this.name}`]: this.value.export()
        };

        return output;
    },
    toString() {
        return {
            [`attribute.${this.name}`]: this.value.toString()
        };
    }
};

export const Attribute = Object.assign(
    Object.create(BaseStructure),
    BaseAttribute
);