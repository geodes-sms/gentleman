import { createDiv, createSpan } from "@zenkai";
import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";
import { Field } from "@projection/field/field.js";

export const SetConcept = Concept.create({
    create: function (model, type) {
        var instance = Object.create(this);

        console.log(type);
        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);

        return instance;
    },
    projection: null,
    representation: null,

    render() {
        return this.projection.render();
    }
});

function createProjection() {
    return {
        type: "text",
        textbox: { type: 'field', view: 'textbox' },
        layout: '$textbox'
    };
}