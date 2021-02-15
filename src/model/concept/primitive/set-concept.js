import { hasOwn, isNullOrUndefined, isString, isEmpty, valOrDefault } from "zenkai";
import { Concept } from "./../concept.js";


const _SetConcept = {
    nature: 'primitive',

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.accept = this.schema.accept;
        this.path = this.schema.path;
        this.values = valOrDefault(this.schema.values, []);
        this.alias = this.schema.alias;
        this.description = this.schema.description;
        this.cardinality = this.schema.cardinality;
        this.value = [];

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        this.removeAllElement();

        if (isNullOrUndefined(args)) {
            if (this.cardinality) {
                const { min = 0 } = this.cardinality;

                for (let i = 0; i < min; i++) {
                    this.createElement();
                }
            }

            return this;
        }

        const { id, value } = args;

        for (let i = 0; i < value.length; i++) {
            this.createElement(value[i]);
        }

        if (this.cardinality) {
            const { min = 0 } = this.cardinality;

            let remaining = min - value.length;
            for (let i = 0; i < remaining; i++) {
                this.createElement();
            }
        }
    

        return this;
    },
    hasValue() {
        return !isEmpty(this.value);
    },
    getValue(deep = false) {
        const concepts = this.value.map(val => this.model.getConcept(val));

        if (deep) {
            return concepts.map(concept => concept.getValue());
        }

        return concepts;
    },
    exportValue() {
        const concepts = this.value.map(id => this.model.getConcept(id));

        return concepts.map(concept => {

            if (concept.nature === "primitive") {
                return {
                    name: concept.name,
                    value: concept.exportValue()
                };
            }

            if (concept.nature === "prototype") {
                let value = concept.exportValue();
                return {
                    name: concept.name,
                    value: {
                        name: concept.value.name,
                        attributes: value
                    }
                };
            }

            return {
                name: concept.name,
                attributes: concept.exportValue()
            };
        });
    },
    setValue(value) {
        if (!Array.isArray(value)) {
            return;
        }

        this.removeAllElement();

        for (let i = 0; i < value.length; i++) {
            this.createElement(value[i]);
        }

        this.notify("value.changed", value);
    },
    /**
     * @returns {*[]}
     */
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

        // if (element.type === "prototype") {
        //     this.value.push(element);
        // } else {
        //     this.value.push(element.id);
        // }

        this.value.push(element.id);

        element.index = this.value.length - 1;

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
        // if (this.value.length === this.min) {
        //     return {
        //         message: `The element could not be removed. The set needs at least ${this.min} element.`,
        //         success: false,
        //     };
        // }

        if (!Number.isInteger(index) || index < 0) {
            return {
                message: `The element was not removed. The given 'index' is not valid.`,
                success: false,
            };
        }

        var concept = this.getElementAt(index);

        if (isNullOrUndefined(concept)) {
            return {
                message: `The element at index '${index}' was not found.`,
                success: false,
            };
        }

        concept.delete(true);

        this.value.splice(index, 1);

        const values = this.getValue();
        for (let i = index; i < values.length; i++) {
            const concept = values[i];
            concept.index = i;
        }

        this.notify("value.removed", concept);

        return {
            message: `The element '${concept.name}' was successfully removed.`,
            success: true,
        };
    },
    removeAllElement() {
        this.value.forEach(element => {
            this.model.removeConcept(element);
        });

        this.value = [];

        this.notify("value.changed", this.value);

        return this;
    },
    createElement(_value) {
        let value = this.model.getValue(_value);

        const options = {
            value: value,
            parent: this,
            ref: this,
        };

        // var element = null;

        // if (this.model.isPrototype(this.accept.name)) {
        //     element = { type: "prototype", name: this.accept.name };
        // } else {
        //     element = this.model.createConcept(this.accept, options);
        // }

        const element = this.model.createConcept(this.accept, options);

        this.addElement(element);

        return element;
    },

    getCandidates() {
        var candidates = resolveAccept.call(this, this.accept);

        return candidates;
    },

    /**
     * Gets the concept parent if exist
     * @returns {Concept}
     */
    getChildren(name) {
        if (!this.hasValue()) {
            return [];
        }

        const concepts = this.getElements();

        if (isNullOrUndefined(name)) {
            return concepts;
        }

        return concepts.filter(concept => concept.name === name);
    },

    build() {
        return this.getValue().map(concept => concept.build());
    },
    copy(save = true) {
        var copy = {
            name: this.name,
            value: this.exportValue()
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    export() {
        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: this.getValue().map(concept => concept.export())
        };
    },
    toString() {
        var output = [];

        this.value.forEach(val => {
            output.push(val.toString());
        });

        return output;
    }
};


function resolveAccept(accept) {
    var candidates = this.model.getConceptSchema(accept);

    return candidates;
}



export const SetConcept = Object.assign(
    Object.create(Concept),
    _SetConcept
);

Object.defineProperty(SetConcept, 'count', { get() { return this.value.length; } });
Object.defineProperty(SetConcept, 'canAddValue', { get() { return true; } });