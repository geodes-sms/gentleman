import { createDiv, removeChildren } from "zenkai";
import { TextualProjection } from "@projection/text-projection.js";
import { Concept } from "./concept.js";

/**
 * @type {Concept}
 */
export const BaseConcept = Concept.create({
    create: function (model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.projection = TextualProjection.create(schema.projection[instance.projectionIndex], instance, model.editor);

        return instance;
    },
    projectionIndex: 0,

    render() {
        return this.projection.render();
    },
    rerender() {
        removeChildren(this.container);
        this.container.appendChild(this.projection.render());

        return this.container;
    }
});