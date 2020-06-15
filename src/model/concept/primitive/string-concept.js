import { valOrDefault, isNullOrWhitespace, isNullOrUndefined } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";

const ResponseCode = {
    SUCCESS: 200,
    INVALID_NUMBER: 400,
    INVALID_VALUE: 401
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_NUMBER:
            return {
                success: false,
                message: "The value is not a number."
            };
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
    }
}

export const StringConcept = extend(Concept, {
    name: 'string',
    schema: {
        projection: [
            {
                view: "textbox"
            }
        ]
    },
    initValue(value) {
        this.value = valOrDefault(value, "");

        return this;
    },
    update(value) {
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

        this.setValue(value);

        return {
            success: true,
            message: "The value has been successfully updated."
        };
    },
    getValue() {
        return this.value;
    },
    setValue(value) {
        if (isNullOrUndefined(value) || this.value == value) {
            return;
        }

        this.value = value;
        this.notify("value.changed", value);
    },
    validate(value) {
        if (!Array.isArray(this.values) || isNullOrWhitespace(value)) {
            return ResponseCode.SUCCESS;
        }

        if (!this.values.includes(value)) {
            return ResponseCode.INVALID_VALUE;
        }

        return ResponseCode.SUCCESS;
    },
    export() {
        return this.value;
    },
    toString() {
        return this.value;
    }
});