import { createDiv, createButton, appendChildren, removeChildren } from "zenkai";
import { Concept } from "./concept.js";
import { TextualProjection } from "@projection/text-projection.js";

/**
 * @memberof Concept
 */
export const BaseConcept = Concept.create({
    create: function (model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.projection = TextualProjection.create(schema.projection[0], instance, model.editor);

        return instance;
    },
    /** @type {TextualProjection} */
    projection: null,
    representation: null,
    container: null,

    render() {
        // return this.projection.render();
        this.container = createDiv({ class: 'concept-container', data: { object: this.object, name: this.name } });
        this.container.appendChild(this.projection.render());

        return this.container;

    },
    rerender() {
        removeChildren(this.container);
        this.container.appendChild(this.projection.render());

        return this.container;

    }
});