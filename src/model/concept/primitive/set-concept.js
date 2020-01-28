import { hasOwn, isNullOrUndefined, isEmpty, last, insert } from "zenkai";
import { extend } from "@utils/index.js";
import { TextualProjection } from "@projection/text-projection.js";
import { Concept } from "./../concept.js";

/**
 * @memberof Concept
 */
export const SetConcept = extend(Concept, {
    create(model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        instance.value = [];

        return instance;
    },
    projection: null,
    projectionIndex: 0,
    representation: null,
    name: 'set',
    accept: null,
    get canAddValue() { return true; },
    init() {
        for (let i = 0; i < this.min; i++) {
            this.addElement();
        }
    },
    hasManyProjection() { return true; },
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
    getElement(id) {
        var element = this.value.find((el) => el.id === id);
        if (isNullOrUndefined(element)) {
            return undefined;
        }

        return element;
    },
    getElementAt(index) {
        if (index < this.value.length) {
            return this.value[index];
        }

        return undefined;
    },
    getFirstElement() {
        if (isEmpty(this.value)) {
            return undefined;
        }

        return this.value[0];
    },
    getLastElement() {
        if (isEmpty(this.value)) {
            return undefined;
        }

        return last(this.value);
    },
    addElement(element) {
        if (isNullOrUndefined(element)) {
            element = this.createElement();
        }

        this.value.push(element);

        return this;
    },
    addElementAt(element, index) {
        if (isNullOrUndefined(element)) {
            element = this.createElement();
        }

        insert(this.value, index, element);

        return this;
    },
    removeElement(element) {
        var index = null;

        if (this.value.includes(element)) {
            index = this.value.indexOf(element);
        } else {
            return false;
        }

        return this.removeElementAt(index);
    },
    removeElementAt(index) {
        if (!Number.isInteger(index) || index < 0) {
            return false;
        }
        this.value.splice(index, 1);
        return true;
    },
    createElement() {
        return this.model.createConcept(this.accept);
    },
    canDelete() {
        return this.value.length > this.min;
    },
    export() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.export());
        });
        return output;
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });
        return output;
    },
    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];
        return this.projection.render();
    },
});

function createProjection() {
    return {
        type: "text",
        flowgroup: { type: 'field', view: 'flowgroup' },
        layout: '$flowgroup'
    };
}