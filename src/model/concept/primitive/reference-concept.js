import { isNullOrWhitespace, valOrDefault, isNullOrUndefined, isObject, isEmpty, isString } from "zenkai";
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
    nature: 'primitive',

    reference: null,
    path: null,

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.accept = this.schema.accept;
        this.path = this.schema.path;
        this.values = valOrDefault(this.schema.values, []);
        this.constraint = this.schema.constraint;
        this.errors = [];

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        this.setValue(args.value);

        return this;
    },
    restore(state) {
        const { value } = state;

        this.setValue(value);
    },
    hasValue() {
        return !isNullOrWhitespace(this.value);
    },
    getValue(deep = false) {
        if (isNullOrUndefined(this.value)) {
            return null;
        }

        if (deep) {
            return this.reference;
        }

        return this.value;
    },
    removeValue() {
        if (this.reference) {
            this.reference.unregister(this);
        }

        this.reference = null;
        this.value = null;

        this.notify("value.changed", this.value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    getReference() {
        if (isNullOrUndefined(this.reference)) {
            return null;
        }

        return this.reference;
    },
    setValue(_value, retry = true) {
        let value = isObject(_value) ? _value.id : _value;

        var result = this.validate(value);
   
        if (result !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated."
            };
        }

        if (isNullOrUndefined(value) || this.value === value) {
            return {
                success: true,
                message: "The value has been ignored."
            };
        }

        if (this.reference) {
            this.reference.unregister(this);
        }
        this.value = value;
        this.reference = this.model.getConcept(value);

        if (isNullOrUndefined(this.reference) && retry) { // retry on failure
            setTimeout(() => this.setValue(_value, false), 20);
        } else {
            this.reference.register(this);
            this.notify("value.changed", this.reference);
        }

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },

    getCandidates() {
        if (isNullOrUndefined(this.accept)) {
            throw new Error("Bad reference: 'accept' property is not defined");
        }

        var candidates = resolveAccept.call(this, this.accept);

        if (this.path) {
            resolvePath(this, this.path).map((candidate) => ({
                type: this.accept.type,
                value: candidate
            }));
        }

        // var values = candidates.map((candidate) => ({
        //     type: "concept",
        //     value: candidate
        // }));

        return candidates;
    },
    getChildren(name) {
        if (isNullOrUndefined(this.reference)) {
            return [];
        }

        if (name && this.reference.name !== name) {
            return [];
        }

        return [this.reference];
    },
    delete(force = false) {
        if (!force) {
            const { object } = this.ref;

            let result = { success: true };

            if (object === "concept") {
                result = this.getParent().removeValue(this);
            } else if (object === "attribute") {
                result = this.getParent().removeAttribute(this.ref.name);
            }


            if (!result.success) {
                return result;
            }
        }

        if (this.reference) {
            this.reference.unregister(this);
        }

        this.model.removeConcept(this.id);

        this.notify("delete");

        return {
            message: `The concept '${name}' was successfully deleted.`,
            success: true,
        };
    },

    update(message, value) {
        switch (message) {
            case "delete":
                this.reference.unregister(this);
                this.value = null;
                this.reference = null;

                this.notify("value.changed", this.reference);
                break;
            case "value.changed":
                this.setValue(this.value);
                break;
            default:
                break;
        }
        
        return true;
    },
    validate(value) {
        this.errors = [];

        if (isNullOrUndefined(value)) {
            return ResponseCode.SUCCESS;
        }

        if (!this.model.hasConcept(value)) {
            this.errors.push("This element is not valid");
            return ResponseCode.INVALID_VALUE;
        }

        return ResponseCode.SUCCESS;
    },


    copy(save = true) {
        if (!this.hasValue()) {
            return null;
        }

        const copy = {
            name: this.name,
            nature: this.nature,
            value: this.getValue()
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
            value: this.getValue()
        };
    },
    export() {
        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: this.getValue(),
        };
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });

        return output;
    },
    toXML() {
        let name = this.getName();

        let start = `<${name} id="${this.id}">`;
        let body = this.getValue();
        let end = `</${name}>`;

        return start + body + end;
    }
};


function resolveAccept(accept) {
    const { name, scope, rel } = accept;

    if (rel === "parent") {
        let parent = this.getParent(scope);

        return parent.getChildren(name);
    }

    if (rel === "children") {
        let children = this.getChildren(name);

        return children;
    }

    if (this.model.isPrototype(name)) {
        return this.model.getConceptsByPrototype(name);
    }

    return this.model.getConcepts(name);
}

function resolvePath(source, path) {
    if (isNullOrUndefined(path)) {
        return source;
    }

    const { target, value, rel } = path;

    var result = [];

    if (rel === "parent") {
        result.push(source.getParentWith(target));
    } else if (rel === "children") {
        result.push(...source.getChildren(target));
    } else if (rel === "property") {
        result.push(source.getProperty(target));
    }

    return result.map((e) => resolvePath(e, value)).flat();
}


export const ReferenceConcept = Object.assign({},
    Concept,
    _ReferenceConcept
);