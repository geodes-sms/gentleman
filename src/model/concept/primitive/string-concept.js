import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";
import { valOrDefault } from "zenkai";


export const StringConcept = Concept.create({
    create: function (model) {
        const instance = Object.create(this);

        instance.model = model;

        return instance;
    },
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
    next() {
        this.parent.next();
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
        textbox: {
            type: 'field',
            placeholder: `Enter ${this.name}`,
            view: 'textbox'
        },
        layout: '$textbox'
    };
}