import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const StringConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        return instance;
    },
    init() {
        this.placeholder = this.parent.name;
    },
    placeholder: null,
    projection: null,
    representation: null,
    name: 'string',

    render() {
        return this.projection.render();
    },
    update(value) {
        this.value = value;
        return true;
    },
    toString() {
        return this.value;
    }
});

function createProjection() {
    return {
        type: "text",
        textbox: { type: 'field', view: 'textbox' },
        layout: '$textbox'
    };
}