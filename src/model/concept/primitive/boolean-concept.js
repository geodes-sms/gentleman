import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const BooleanConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        return instance;
    },
    projection: null,
    representation: null,
    name: 'boolean',

    render() {
        return this.projection.render();
    },
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