import { BaseConcept } from "./base-concept.js";

export const ConcreteConcept = BaseConcept.create({
    create: function (schema) {
        var instance = Object.create(this);

        return instance;
    },
    type: "ConcreteConcept",
    representation: null
});