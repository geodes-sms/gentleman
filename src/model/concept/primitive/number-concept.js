import { valOrDefault } from "zenkai";
import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const NumberConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;

        return instance;
    },
    projection: null,
    representation: null,
    name: 'number',

    init(options) {
        if (options) {
            this.value = valOrDefault(options.value, "");
            this.accept = options.accept;
            this.action = options.action;
            this.parent = options.parent;
            this.min = valOrDefault(options.min, 1);
        }

        this.projection = TextualProjection.create(valOrDefault(options.customProjection, createProjection.call(this)), this, this.model.editor);

        return this;
    },

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
        textbox: {
            type: 'field',
            placeholder: this.parent.name,
            view: 'textbox'
        },
        layout: '$textbox'
    };
}