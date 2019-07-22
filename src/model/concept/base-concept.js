import { createDiv, createButton, appendChildren } from "@zenkai/utils/dom/index.js";
import { Concept } from "./concept.js";
import { TextualProjection } from "@projection/text-projection.js";

export const BaseConcept = Concept.create({
    create: function (model, schema) {
        var instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.name = schema.name;
        instance.projection = TextualProjection.create(schema.projection[0], instance, model.editor);

        return instance;
    },
    projection: null,
    representation: null,
    container: null,

    render() {
        this.container = createDiv({ class: 'container' });
        this.container.appendChild(this.projection.render());

        var actionContainer = createDiv({ class: 'container-action' });
        var btnProjection = createButton({ text: 'P', class: 'btn', data: { action: 'projection' } });
        var btnSuggestion = createButton({ text: 'S', class: 'btn', data: { action: 'suggestion' } });
        var btnRefactor = createButton({ text: 'R', class: 'btn', data: { action: 'refactor' } });
        appendChildren(actionContainer, [btnProjection, btnSuggestion, btnRefactor]);
        this.container.appendChild(actionContainer);

        return this.container;
    }
});