import { isNullOrUndefined, isEmpty, valOrDefault, toBoolean } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401,
    MIN_CARDINALITY_ERROR: 402,
    MAX_CARDINALITY_ERROR: 403,
    FIX_CARDINALITY_ERROR: 404,
};

function responseHandler(code, ctx) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: `Valid values: ${ctx}`
            };
        case ResponseCode.MAX_CARDINALITY_ERROR:
            return {
                success: false,
                message: `Maximum cardinality: ${this.value.length}/${ctx.value}.`
            };
        case ResponseCode.MIN_CARDINALITY_ERROR:
            return {
                success: false,
                message: `Minimum cardinality: ${this.value.length}/${ctx.value}.`
            };
        case ResponseCode.FIX_CARDINALITY_ERROR:
            return {
                success: false,
                message: `Fixed cardinality: ${ctx.value}.`
            };
        case ResponseCode.PATTERN_ERROR:
            return {
                success: false,
                message: `The value is not valid.`
            };
    }
}

const _SetConcept = {
    nature: 'primitive',

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.accept = this.schema.accept;
        this.ordered = valOrDefault(this.schema.ordered, true);
        this.constraint = this.schema.constraint;
        this.watchers = new Map();
        
        this.value = [];

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        this.removeAllElement();

        let min = getMin.call(this);

        if (isNullOrUndefined(args)) {

            let remaining = min;

            for (let i = 0; i < remaining; i++) {
                this.createElement();
            }

            return this;
        }

        const { id = "", name, value } = args;

        if (id.length > 10) {
            this.id = id;
        }

        for (let i = 0; i < value.length; i++) {
            this.createElement(value[i]);
        }

        let remaining = min - value.length;
        for (let i = 0; i < remaining; i++) {
            this.createElement();
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
    removeValue(concept) {
        if (!this.hasValue()) {
            return {
                success: true,
                message: "The value has been successfully updated."
            };
        }

        this.removeElement(concept);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    isValidElement(value) {
        const { name, accept } = this.accept;

        if (this.model.isPrototype(name)) {
            if (isNullOrUndefined(accept)) {
                return this.model.hasPrototype(value.name, name);
            } else if (Array.isArray(accept)) {
                return accept.some(c => c.name === value.name);
            }

            return accept.name === value.name;
        }

        return this.accept.name === value.name;
    },
    setValue(arg) {
        let value = arg.value || arg;

        if (!Array.isArray(value)) {
            if (this.isValidElement(value)) {
                this.createElement(value);
            }

            return;
        }

        this.removeAllElement();

        for (let i = 0; i < value.length; i++) {
            this.createElement(value[i]);
        }
    },
    restore(state) {
        const { value } = state;

        value.forEach((element, index) => {
            if (!this.value.includes(element.id)) {
                this.createElement(element);
            }
        });
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

        this.value.push(element.id);

        element.index = this.value.length - 1;
        element.parent = this,
        element.ref = this;

        this.validate();
        this.notify("value.added", element);
        this.propagate("value.changed", element, this);

        return true;
    },
    /**
     * Adds element to set
     * @param {*} element 
     * @param {number} index 
     * @returns 
     */
    addElementAt(element, index = 0) {
        if (isNullOrUndefined(element)) {
            element = this.createElement();
        }

        this.value.splice(index, 0, element.id);

        this.validate();
        this.notify("value.added", element);
        this.propagate("value.changed", element, this);

        return this;
    },
    /**
     * Swaps element of the set
     * @param {number} index1 
     * @param {number} index2 
     * @returns 
     */
    swapElement(index1, index2) {
        if (!this.ordered) {
            return this;
        }

        let temp = this.value[index1];
        this.value[index1] = this.value[index2];
        this.value[index2] = temp;

        let element1 = this.getElementAt(index1);
        element1.index = +index1;

        let element2 = this.getElementAt(index2);
        element2.index = +index2;

        this.notify("value.swapped", [element1, element2]);

        return this;
    },
    removeElement(element) {
        let index = valOrDefault(element.index, this.value.indexOf(element.id));

        if (index === -1) {
            return false;
        }

        return this.removeElementAt(index);
    },
    removeElementAt(index) {
        let concept = this.getElementAt(index);

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

        this.validate();
        this.notify("value.removed", concept);
        this.propagate("value.changed", concept, this);

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
        this.propagate("value.changed", this.value, this);

        return this;
    },
    createElement(_value) {
        let value = this.model.getValue(_value);

        const options = {
            value: value,
            parent: this,
            ref: this,
        };

        const element = this.model.createConcept(this.accept, options);

        this.addElement(element);

        return element;
    },

    /**
     * Gets the value of a property
     * @param {string} name 
     */
    getProperty(name, meta) {
        if (name === "refname") {
            return this.ref.name;
        }

        if (name === "name") {
            return this.name;
        }

        if (name === "value") {
            return this.value;
        }

        if (name === "length" || name === "cardinality") {
            return this.value.length;
        }

        let property = this.properties.find(prop => prop.name === name);

        if (isNullOrUndefined(property)) {
            return undefined;
        }

        const { type, value } = property;

        if (type === "string") {
            return value;
        }

        if (type === "number") {
            return +value;
        }

        if (type === "boolean") {
            return toBoolean(value);
        }

        return value;
    },
    /**
     * Returns a value indicating whether the concept has a property
     * @param {string} name Property's name
     * @returns {boolean}
     */
    hasProperty(name) {
        if (["refname", "name", "value", "length", "cardinality"].includes(name)) {
            return true;
        }

        return this.properties.findIndex(prop => prop.name === name) !== -1;
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


    validate() {
        this.errors = [];

        if (!this.hasConstraint()) {
            return {
                code: ResponseCode.SUCCESS
            };
        }

        if (this.hasConstraint("cardinality")) {
            let lengthConstraint = this.getConstraint("cardinality");

            const { type } = lengthConstraint;

            if (type === "range") {
                const { min, max } = lengthConstraint[type];

                if (min && this.value.length < min.value) {
                    let code = ResponseCode.MIN_CARDINALITY_ERROR;

                    this.errors.push(responseHandler.call(this, code, min).message);

                    return {
                        code: code,
                        ctx: min
                    };
                }

                if (max && this.value.length > max.value) {
                    let code = ResponseCode.MAX_CARDINALITY_ERROR;

                    this.errors.push(responseHandler.call(this, code, max).message);

                    return {
                        code: code,
                        ctx: max
                    };
                }
            } else if (type === "fixed") {
                const { value: fixedValue } = lengthConstraint[type];

                if (this.value.length !== fixedValue) {
                    let code = ResponseCode.FIX_CARDINALITY_ERROR;

                    this.errors.push(responseHandler.call(this, code, lengthConstraint[type]).message);

                    return {
                        code: code,
                        ctx: lengthConstraint[type]
                    };
                }
            }
        }

        return {
            code: ResponseCode.SUCCESS
        };
    },


    copy(save = true) {
        if (!this.hasValue()) {
            return null;
        }

        const copy = {
            name: this.name,
            nature: this.nature,
            value: this.getValue().map(c => c.copy(false))
        };

        if (save) {
            this.model.addValue(copy);
        }

        return copy;
    },
    clone() {
        return {
            id: this.id,
            name: this.name,
            value: this.getValue().map(c => c.clone())
        };
    },
    export() {
        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: this.value,
        };
    },
    toString() {
        return this.getValue().map(val => val.toString());
    },
    toXML() {
        let name = this.getName();

        let start = `<${name} id="${this.id}">`;
        let body = this.getValue().map(val => val.toXML()).join("");
        let end = `</${name}>`;

        return start + body + end;
    }
};


function getMin() {
    if (!this.hasConstraint("cardinality")) {
        return 0;
    }

    const cardinality = this.getConstraint("cardinality");

    const { type } = cardinality;

    if (type === "range") {
        const { min } = cardinality[type];

        return min.value;
    } else if (type === "fixed") {
        const { value } = cardinality[type];

        return value;
    }

    return 0;
}



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