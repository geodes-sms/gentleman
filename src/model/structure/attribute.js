import { valOrDefault } from "zenkai";
import { BaseStructure } from "./structure.js";


export const BaseAttribute = {
    /** @type {string} */
    object: "attribute",
    /** @type {*} */
    target: null,

    init(value) {
        this.target = this.model.createConcept(this.schema.target, Object.assign({}, this.schema, {
            value: valOrDefault(value, this.schema.value),
            parent: this.concept,
            min: this.min,
            refname: this.name,
            reftype: "attribute",
        }));

        return this;
    },
    getValue() {
        return this.target.value;
    },

    canDelete() {
        return !this.required;
    },
    delete() {
        if (!this.canDelete()) {
            return false;
        }

        this.target.delete();

        return this.concept.removeAttribute(this.name);
    },

    export() {
        var output = {
            [`${this.name}:attribute`]: this.target.export()
        };

        return output;
    },
    toString() {
        return {
            [`attribute.${this.name}`]: this.target.toString()
        };
    }
};

export const Attribute = Object.assign(
    Object.create(BaseStructure),
    BaseAttribute
);