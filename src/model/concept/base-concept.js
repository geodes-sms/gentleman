import { createDiv, createButton, appendChildren } from "zenkai";
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
        instance.name = schema.name;
        instance.projection = TextualProjection.create(schema.projection[0], instance, model.editor);

        return instance;
    },
    /** @type {TextualProjection} */
    projection: null,
    representation: null,
    container: null,

    render() {
        return this.projection.render();
        this.container = createDiv({ class: 'container' });
        this.container.appendChild(this.projection.render());

        var actionContainer = createDiv({ class: 'container-action' });
        this.container.appendChild(actionContainer);

        return this.container;

    }
});