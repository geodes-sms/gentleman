import { BaseConcept } from "./base-concept.js";

export const ConcreteConcept = BaseConcept.create({
    create: function (schema) {
        var instance = Object.create(this);

        instance.abstract = [];

        return instance;
    },
    abstract: null;
    representation: null
});