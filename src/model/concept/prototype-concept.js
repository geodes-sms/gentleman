import {
    valOrDefault, isNullOrUndefined, createUnorderedList, createListItem,
    createInput, createDiv, appendChildren, isNullOrWhitespace, removeChildren, createDocFragment, insertBeforeElement
} from "zenkai";
import { Projection } from "@projection";

export const PrototypeConcept = {
    /**
     * Creates a concept
     * @returns {PrototypeConcept}
     */
    create(model, schema) {
        const instance = Object.create(this); 

        instance.model = model;
        instance.schema = schema;
        instance.concretes = schema.concretes;
        instance.references = [];
        instance.listeners = [];
        instance.protoSchema = [
            {
                type: "prototype"
            }
        ];

        return instance;
    },
    /** Reference to parent model */
    model: null,
    /** @type {int} */
    id: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    refname: null,
    /** @type {string} */
    alias: null,
    /** @type {string} */
    fullName: null,
    /** @type {Concept} */
    parent: null,
    /** @type {int[]} */
    references: null,
    /** @type {*[]} */
    listeners: null,
    /** @type {Projection[]} */
    projection: null,
    value: null,
    /** Object nature */
    object: "prototype",
    schema: null,
    protoSchema: null,
    init(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        return this;
    },

    getIdRef() { return this.schema['idref']; },
    getName() { return valOrDefault(this.refname, this.name); },
    getAlias() { return valOrDefault(this.alias, this.getName()); },

    getConceptParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.parent.concept;
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