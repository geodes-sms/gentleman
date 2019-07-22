import { createDiv } from "@zenkai/utils/dom/index.js";
import { Concept } from "./concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const BaseAttribute = Concept.create({
    create: function (model, schema) {
        var instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.projection = TextualProjection.create(schema.projection[0], instance, model.editor);

        return instance;
    },
    projection: null,
    representation: null,
    container: null,

    render() {
        this.container = createDiv({ class: 'container' });
        this.container.appendChild(this.projection.render());

        return this.container;
    }
});