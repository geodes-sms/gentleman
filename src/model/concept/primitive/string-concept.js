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
    projectionIndex: 0,
    representation: null,
    name: 'string',

    hasManyProjection() { return false; },

    render() {
        var view = this.projection.render();

        return view;
    },
    update(value) {
        this.value = value;
        
        return true;
    },
    export() {
        return this.value;
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