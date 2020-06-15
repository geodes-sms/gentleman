import { hasOwn, isNullOrUndefined, valOrDefault, isString } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";


export const SetConcept = extend(Concept, {
    name: 'set',

    initValue(value) {
        this.value = [];

        var values = valOrDefault(value, []);
        for (let i = 0; i < values.length; i++) {
            this.createElement(values[i]);
        }

        let remaining = this.min - values.length;
        for (let i = 0; i < remaining; i++) {
            this.createElement();
        }

        return this;
    },
    getElements() {
        return this.value.map(id => this.model.getConcept(id));
    },
    getElement(id) {
        var elementID = this.value.find(val => val === id);

        if (isNullOrUndefined(elementID)) {
            return undefined;
        }

        return this.model.getConcept(elementID);
    },
    getElementAt(index) {
        if (index < 0 || index >= this.value.length) {
            return undefined;
        }

        return this.model.getConcept(this.value[index]);
    },
    getFirstElement() {
        return this.getElementAt(0);
    },
    getLastElement() {
        return this.getElementAt(this.count - 1);
    },
    addElement(element) {
        if (isNullOrUndefined(element)) {
            return false;
        }

        this.value.push(element.id);
        this.notify("value.added", element);

        return true;
    },
    addElementAt(element, index = 0) {
        if (isNullOrUndefined(element)) {
            element = this.createElement();
        }

        this.value.splice(index, 0, element.id);

        return this;
    },
    removeElement(element) {
        var index = this.value.indexOf(element.id);

        if (index === -1) {
            return false;
        }

        return this.removeElementAt(index);
    },
    removeElementAt(index) {
        if (!Number.isInteger(index) || index < 0) {
            return false;
        }

        if (!this.model.removeConcept(this.value[index])) {
            return false;
        }

        this.value.splice(index, 1);

        return true;
    },
    createElement(value) {
        var concept = null;
        var options = {
            value: value,
            parent: this.id,
            refname: this.name,
            reftype: "element",
        };

        if (isString(this.accept)) {
            concept = this.model.createConcept(this.accept, options);
        }

        if (hasOwn(this.accept, "type")) {
            let { type, accept, alias, action } = this.accept;

            concept = this.model.createConcept(type, Object.assign(options, {
                accept: accept,
                action: action,
                alias: alias
            }));
        }

        if (Array.isArray(this.accept)) {
            // TODO: Add support for multiple concept
        }

        this.addElement(concept);

        return concept;
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
    }
});

Object.defineProperty(SetConcept, 'count', { get() { return this.value.length; } });
Object.defineProperty(SetConcept, 'canAddValue', { get() { return true; } });