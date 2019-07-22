import { Concept } from "./concept.js";

export const AbstractConcept = Concept.create({
    create: function (model, schema) {
        var instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.name = schema.name;

        return instance;
    },
    implementations: null
});