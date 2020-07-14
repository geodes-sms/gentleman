import { isNullOrWhitespace, isNullOrUndefined, isObject, isEmpty, isString } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
    }
}

const _ReferenceConcept = {
    name: 'reference',
    reference: null,

    initValue(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        this.id = args.id;
        this.setValue(args.value);

        return this;
    },
    hasValue() {
        return !isNullOrWhitespace(this.value);
    },
    getValue() {
        if (isNullOrUndefined(this.value)) {
            return null;
        }

        return this.model.concepts.find((concept) => concept.id === this.value);
    },
    setValue(value) {
        if (isNullOrUndefined(value) || this.value === value) {
            return;
        }

        if (this.reference) {
            this.reference.unregister(this);
        }
        this.reference = this.model.getConcept(value);
        console.log(this.model.concepts);
        this.reference.register(this);

        this.value = value;

        this.notify("value.changed", value);
    },

    update(message, value) {
        return true;
    },
    getCandidates() {
        if (isNullOrUndefined(this.accept)) {
            throw new Error("Bad reference: 'accept' property is not defined");
        }

        var candidates = resolveAccept.call(this, this.accept);

        console.warn(candidates);

        var values = candidates.map((candidate) => ({
            type: "concept",
            value: candidate
        }));

        return values;
    },
    getChildren(name) {
        if (!this.hasValue()) {
            return [];
        }

        const children = [];
        const concept = this.getValue();

        if (isNullOrUndefined(name)) {
            children.push(concept);
        } else if (concept.name === name) {
            children.push(concept);
        }

        return children;
    },
    getDescendant(name) {
        return [];
    },

    validate(value) {
        if (isNullOrWhitespace(value) || isEmpty(this.values)) {
            return ResponseCode.SUCCESS;
        }

        var found = false;
        for (let i = 0; !found && i < this.values.length; i++) {
            const val = this.values[i];
            if (isObject(val)) {
                found = val.value == value;
            } else {
                found = val == value;
            }
        }

        if (!found) {
            return ResponseCode.INVALID_VALUE;
        }

        return ResponseCode.SUCCESS;
    },

    export() {
        return {
            id: this.id,
            name: this.name,
            value: this.value
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
    if (isString(accept)) {
        const { concepts } = this.model;
        const parent = this.getParent();

        if (this.metamodel.isPrototype(accept)) {
            return concepts.filter((concept) => concept !== parent && concept.prototype && concept.prototype.name === accept);
        }

        return concepts.filter((concept) => concept !== parent && concept.name === accept);
    }
    if (isObject(accept)) {
        const { name, scope, rel } = accept;

        if (rel === "parent") {
            let parent = this.getParent(scope);
            return parent.getChildren(name);
        }

        return resolveAccept.call(this, name);
    }

    return [];
}


export const ReferenceConcept = Object.assign({},
    Concept,
    _ReferenceConcept
);