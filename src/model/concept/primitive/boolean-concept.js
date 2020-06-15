import { Concept } from "./../concept.js";
import { Projection } from "@projection/projection.js";

export const BooleanConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;

        return instance;
    },
    projection: null,
    representation: null,
    name: 'boolean',

    export() {
        return this.value;
    },
});

function createProjection() {
    return {
        type: "text",
        textbox: { type: 'field', view: 'textbox' },
        layout: '$textbox'
    };
}