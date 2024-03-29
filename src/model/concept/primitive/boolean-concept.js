import { isObject, isNullOrUndefined, toBoolean, isString, valOrDefault } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_BOOLEAN: 400,
    INVALID_VALUE: 401
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_BOOLEAN:
            return {
                success: false,
                message: "The value is not a boolean."
            };
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
    }
}

const _BooleanConcept = {
    nature: 'primitive',

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.default = valOrDefault(this.schema.default, true);
        this.constraint = this.schema.constraint;
        this.errors = [];

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        if (isNullOrUndefined(args)) {
            this.value = this.default;

            return this;
        }

        if (isObject(args)) {
            const { id = "", value } = args;

            if (id.length > 10) {
                this.id = id;
            }

            this.setValue(value);
        } else {
            this.setValue(args);
        }

        return this;
    },
    hasValue() {
        return !isNullOrUndefined(this.value);
    },
    getValue() {
        return this.value;
    },
    setValue(arg) {
        let value = isObject(arg) ? arg.value : arg;

        var result = this.validate(value);

        if (result !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated."
            };
        }

        this.value = toBoolean(value);
        this.notify("value.changed", value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    restore(state) {
        const { value } = state;

        this.setValue(value);
    },
    update(message, value) {
        return true;
    },
    getCandidates() {
        return [true, false];
    },
    getChildren(name) {
        return [];
    },

    validate(value) {
        this.errors = [];

        // string to bool
        if (isString(value) && ["true", "false"].includes(value.toLowerCase())) {
            return ResponseCode.SUCCESS;
        }

        // number to bool
        if (Number.isInteger(value) && [1, 0].includes(value)) {
            return ResponseCode.SUCCESS;
        }

        // bool strict
        if (![true, false].includes(value)) {
            return ResponseCode.INVALID_BOOLEAN;
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
            value: this.getValue()
        };
    },
    toString() {
        return this.value;
    },
    toXML() {
        let name = this.getName();

        let start = `<${name} id="${this.id}">`;
        let body = this.getValue();
        let end = `</${name}>`;

        return start + body + end;
    }
};


export const BooleanConcept = Object.assign(
    Object.create(Concept),
    _BooleanConcept
);