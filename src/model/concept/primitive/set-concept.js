import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";
import { hasOwn, valOrDefault } from "zenkai";

/**
 * @memberof Concept
 */
export const SetConcept = Concept.create({
    create(model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        instance.value = [];

        return instance;
    },
    projection: null,
    representation: null,
    name: 'set',
    accept: null,
    get canAddValue() { return true; },
    init() {
        for (let i = 0; i < this.min; i++) {
            this.addElement();
        }
    },
    render() {
        var view = this.projection.render();
        return view;
    },
    getAddAction() {
        if (hasOwn(this.action, 'add')) {
            return this.action['add'];
        }

        return {
            text: `Add ${this.accept}`
        };
    },
    addElement(element) {
        this.value.push(valOrDefault(element, this.createElement()));
        return true;
    },
    removeElement(element) {
        if (this.value.includes(element)) {
            this.value = this.value.splice(this.value.indexOf(element), 1);
            return true;
        }
        return false;
    },
    removeElementAt(index) {
        this.value = this.value.splice(index, 1);
        return true;
    },
    createElement() {
        return this.model.createConcept(this.accept);
    },
    canDelete() {
        return this.value.length > this.min;
    }
});

function createProjection() {
    return {
        type: "text",
        flowgroup: { type: 'field', view: 'flowgroup' },
        layout: '$flowgroup'
    };
}