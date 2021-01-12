import { isNullOrWhitespace, valOrDefault, isNullOrUndefined, isObject, isEmpty } from "zenkai";
import { Concept } from "./../concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401,
    MINLENGTH_ERROR: 402,
    MAXLENGTH_ERROR: 403,
    PATTERN_ERROR: 404,
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
        case ResponseCode.MAXLENGTH_ERROR:
            return {
                success: false,
                message: `The length of the value exceeds the maximum allowed: ${this.max}.`
            };
        case ResponseCode.MINLENGTH_ERROR:
            return {
                success: false,
                message: `The length of the value is beneath the minimum allowed: ${this.min}.`
            };
        case ResponseCode.PATTERN_ERROR:
            return {
                success: false,
                message: `The value does not match the valid pattern.`
            };
    }
}

const _StringConcept = {
    nature: 'primitive',
    /** @type {string} */
    pattern: null,

    init(args = {}) {
        this.parent = args.parent;
        this.ref = args.ref;
        this.values = valOrDefault(this.schema.values, []);
        this.alias = this.schema.alias;
        this.description = this.schema.description;
        this.min = valOrDefault(this.schema.min, 0);
        this.max = this.schema.max;
        this.pattern = this.schema.pattern;
        this.history = [];

        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue(args) {
        if (isNullOrUndefined(args)) {
            this.value = "";
            
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
        return !isNullOrWhitespace(this.value);
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
                    responseHandler.call(this, result).message
                ]
            };
        }

        this.history.push(value);
        this.value = value;

        this.notify("value.changed", value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },

    getCandidates() {
        this.values.forEach(value => {
            if (isObject(value)) {
                value.type = "value";
            }
        });

        return this.values;
    },
    getChildren(name) {
        return [];
    },

    update(message, value) {
        return true;
    },

    validate(value) {
        if (isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

        if(this.min && value.length < this.min) {
            return ResponseCode.MINLENGTH_ERROR;
        }

        if(this.max && value.length > this.max) {
            return ResponseCode.MAXLENGTH_ERROR;
        }

        if(this.pattern && !(new RegExp(this.pattern, "gi")).test(value)) {
            return ResponseCode.PATTERN_ERROR;
        }

        if (isEmpty(this.values)) {
            return ResponseCode.SUCCESS;
        }

        var found = false;
        for (let i = 0; !found && i < this.values.length; i++) {
            const val = this.values[i];
            if (isObject(val)) {
                found = val.value === value;
            } else {
                found = val === value;
            }
        }

        if (!found) {
            return ResponseCode.INVALID_VALUE;
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
    toString() {
        return this.value;
    }
};

export const StringConcept = Object.assign(
    Object.create(Concept),
    _StringConcept
);