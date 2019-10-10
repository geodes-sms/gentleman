import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const SetConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);

        return instance;
    },
    projection: null,
    representation: null,
    name: 'set',

    render() {
        return this.projection.render();
    }
});

function createProjection() {
    return {
        type: "text",
        flowgroup: { type: 'field', view: 'flowgroup' },
        layout: '$flowgroup'
    };
}