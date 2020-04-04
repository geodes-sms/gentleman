import { hasOwn, isNullOrUndefined, insert, valOrDefault, isString, defProp } from "zenkai";
import { extend } from "@utils/index.js";
import { TextualProjection } from "@projection/text-projection.js";
import { Concept } from "./../concept.js";


export const SetConcept = extend(Concept, {
    create(model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.value = [];

        defProp(instance, 'count', { get() { return this.value.length; } });
        defProp(instance, 'canAddValue', { get() { return true; } });

        return instance;
    },
    projection: null,
    projectionIndex: 0,
    representation: null,
    name: 'set',
    accept: null,

    init(options) {
        let values = [];

        if (options) {
            values = valOrDefault(options.value, []);
            this.accept = options.accept;
            this.action = options.action;
            this.parent = options.parent;
            this.min = valOrDefault(options.min, 1);
        }

        for (let i = 0; i < values.length; i++) {
            let element = this.createElement(values[i]);
            this.addElement(element);
        }

        let remaining = this.min - values.length;
        for (let i = 0; i < remaining; i++) {
            this.addElement();
        }

        this.projection = TextualProjection.create(createProjection(), this, this.model.editor);

        return this;
    },
    hasManyProjection() { return true; },
    render() {
        console.log(this.value.length, this.count);
        var view = this.projection.render();

        return view;
    },
    getAddAction() {
        if (hasOwn(this.action, 'add')) {
            return this.action['add'];
        }

        return {
            projection: {
                type: "text",
                layout: `Add ${this.getAcceptedValues()}`
            }
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
        if (index < 0 || index >= this.value.length) {
            return undefined;
        }

        return this.value[index];
    },
    getFirstElement() { return this.getElementAt(0); },
    getLastElement() { return this.getElementAt(this.count - 1); },
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
    createElement(value) {
        if (isString(this.accept)) {
            return this.model.createConcept(this.accept, { value: value });
        }
        if (hasOwn(this.accept, "type")) {
            return this.model.createConcept(this.accept.type, {
                value: value,
                alias: this.alias
            });
        }
        if (Array.isArray(this.accept)) {
            return this.model.createConcept(this.accept[0].type, {
                value: value,
                alias: this.alias
            });
        }
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