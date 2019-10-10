import { Field } from "./field.js";
import { createUnorderedList, valOrDefault, addAttributes } from "zenkai";

export const SetField = Field.create({
    init() {
        var self = this;

        var validator = function () {
            return true;
        };

        this.validators.push(validator);
    },
    object: "SET",
    struct: undefined,

    createInput(editable) {
        var input = createUnorderedList({
            id: this.id,
            class: ['attr', 'empty', 'attr--set'],
            data: {
                nature: "attribute",
            }
        });
        input.contentEditable = false;
        input.tabIndex = 0;

        return input;
    }
});