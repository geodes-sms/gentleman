import { hasOwn, isNullOrUndefined, isEmpty, last, insert } from "zenkai";
import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";

/**
 * @memberof Concept
 */
export const ReferenceConcept = Concept.create({
    create(model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        instance.value = [];

        return instance;
    },
    placeholder: null,
    projection: null,
    projectionIndex: 0,
    representation: null,
    name: 'reference',
    accept: null,
    init() {
        this.placeholder = this.parent.name;
    },
    hasManyProjection() { return false; },
    render() {
        var view = this.projection.render();

        return view;
    },
    canDelete() {
        return true;
    },
    update(value) {
        this.value = value;
        return true;
    },
    getRefCandidates() {
        var candidates = this.model.concepts.filter((concept) => concept.name === this.accept);
        var values = candidates.map((candidate) => candidate.getAttribute(candidate.getIdRef()).value.toString());
        return values;
    },
    export() {
        return this.value;
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });
        return output;
    }
});

function createProjection() {
    return {
        type: "text",
        textbox: { type: 'field', view: 'textbox' },
        layout: '$textbox'
    };
}