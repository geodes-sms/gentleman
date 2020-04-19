import { createSpan, addAttributes, valOrDefault, isEmpty, isNullOrWhitespace } from "zenkai";
import { extend } from "@utils/index.js";
import { Field } from "./field.js";

export const TextField = extend(Field, {
    init() {
        this.validators = [];
        
        var validator = function () {
            return true;
        };

        this.placeholder = this.resolvePlaceholder();
        this.validators.push(validator);

        return this;
    },
    resolvePlaceholder() {
        if (this.schema.placeholder) {
            return this.schema.placeholder;
        }
        if (this.concept) {
            return this.concept.getAlias();
        }

        return "Enter data";
    },
    placeholder: null,
    object: "STRING",

    createInput() {
        this.element = createSpan({
            id: this.id,
            class: "field field--textbox",
            html: "",
            data: {
                nature: "attribute",
                type: this.object,
                placeholder: this.placeholder
            }
        });
        this.element.contentEditable = true;
        this.element.tabIndex = 0;

        if (this.concept.value) {
            this.element.textContent = this.concept.value;
        } else {
            this.element.classList.add("empty");
        }

        this.bindEvents();

        return this.element;
    },
    focusOut() {
        this.element.contentEditable = true;

        if (!this.concept.update(this.element.textContent)) {
            this.editor.notify("String concept could not be updated");
        }
    },
    bindEvents() {
        this.element.addEventListener('input', function (event) {
            if (this.textContent.length > 0) {
                this.classList.remove("empty");
            } else {
                this.classList.add("empty");
            }
        });
    }
});