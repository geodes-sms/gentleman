import { isObject, isNullOrUndefined, toBoolean, isString } from "zenkai";
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
        this.alias = this.schema.alias;
        this.description = this.schema.description;

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        if (isNullOrUndefined(args)) {
            this.value = true;
            return this;
        }

        if (isObject(args)) {
            this.id = args.id;
            this.setValue(args.value);
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
    setValue(value) {
        var result = this.validate(value);

        if (result !== ResponseCode.SUCCESS) {
            return {
                success: false,
                message: "Validation failed: The value could not be updated.",
                errors: [
                    responseHandler(result).message
                ]
            };
        }

        this.value = toBoolean(value);
        this.notify("value.changed", value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
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
    

    build() {
        return this.getValue();
    },
    export() {
        return {
            id: this.id,
            name: this.name,
            root: this.isRoot(),
            value: this.getValue()
        };
    },
};


export const BooleanConcept = Object.assign(
    Object.create(Concept),
    _BooleanConcept
);