import { extend } from "@utils/index.js";
import { Concept } from "./concept.js";
import { isString } from "zenkai";


export const PrototypeConcept = extend(Concept, {
    name: 'set',
    concretes: null,

    initValue(value) {
        this.value = [];
        this.concretes = [];

        return this;
    },

    getCandidates() {
        return this.metamodel.getConcreteConcepts(this.name);
    },
    getConceptParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.parent.concept;
    },
    createElement(value) {
        var concept = null;
        var options = {
            parent: this.id,
            refname: this.name,
            reftype: "element",
        };

        if (isString(value)) {
            concept = this.model.createConcept(value, options);
        }

        this.value = concept;
        concept.prototype = this;

        return concept;
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
});