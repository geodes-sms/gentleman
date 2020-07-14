import {
    createDocFragment, createSpan, createDiv, createI, isHTMLElement, isNullOrWhitespace,
    isDerivedOf, isEmpty, isNullOrUndefined, valOrDefault, removeChildren,
} from "zenkai";
import { hide, show, isPrototypeOf } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { NoteManager } from "./note.js";
import { ChoiceField } from "./choice-field.js";
import { FieldManager } from "@projection/field-manager.js";
import { StyleHandler } from "./../style-handler.js";
import { ProjectionManager } from "./../projection.js";


function resolveValue(object) {
    if (isDerivedOf(object, Concept)) {
        if (object.hasValue()) {
            return object.getValue();
        }

        return "";
    }

    return object;
}

/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolvePlaceholder() {
    if (this.schema.placeholder) {
        return this.schema.placeholder;
    }

    if (isDerivedOf(this.source, Concept)) {
        return this.source.getAlias();
    }

    return "Enter data";
}

const _TextField = {
    /** @type {string} */
    placeholder: null,
    /** @type {HTMLElement} */
    input: null,
    /** @type {string} */
    value: "",

    init() {
        this.source.register(this);
        this.placeholder = resolvePlaceholder.call(this);

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { before, input, after } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                class: ["field", "field--textbox"],
                id: this.id,
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "text",
                    id: this.id,
                }
            });

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler(this.element, this.schema.style);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createI({
                class: ["field-status"],
                dataset: {
                    nature: "field-component",
                    view: "text",
                    id: this.id,
                }
            });
            fragment.appendChild(this.statusElement);
        }

        if (before) {
            let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (!isHTMLElement(this.input)) {
            this.input = createSpan({
                class: ["field--textbox__input", "empty"],
                tabindex: 0,
                editable: !this.readonly,
                dataset: {
                    nature: "field-component",
                    view: "text",
                    id: this.id,
                    placeholder: this.placeholder
                }
            });

            if (this.readonly) {
                this.input.classList.add("readonly");
                this.input.contentEditable = false;
            }

            let value = resolveValue(this.source);

            if (!isNullOrWhitespace(value)) {
                console.log(value);
                this.input.textContent = value;
            }

            const { before, projection, after, style } = valOrDefault(input, {});

            StyleHandler(this.input, style);

            fragment.appendChild(this.input);
        }

        if (after) {
            let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
        }

        this.bindEvents();
        this.refresh();

        return this.element;
    },

    update(type, value) {
        switch (type) {
            case "value.changed":
                this.input.textContent = value;
                break;
            default:
                console.warn(`The operation '${type}' was not handled`);
                break;
        }
        this.refresh();
    },

    focusIn() {
        this.hasFocus = true;
        this.value = this.input.textContent;
        this.element.classList.add("active");
        // show(this.statusElement);
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.hasChanges()) {
            this.setValue(this.input.textContent);
        }

        if (isNullOrWhitespace(this.input.textContent)) {
            this.input.textContent = "";
        }

        // hide(this.statusElement);

        this.input.blur();
        this.element.classList.remove("active");

        this.refresh();
    },
    hasChanges() {
        return this.value !== this.input.textContent;
    },
    hasValue() {
        return !isEmpty(this.input.textContent);
    },
    getValue() {
        return this.input.textContent;
    },
    setValue(value) {
        var response = this.source.setValue(value);

        if (!response.success) {
            this.editor.notify(response.message);
            this.errors.push(...response.errors);
        } else {
            this.errors = [];
        }

        this.attached.filter(element => !element.active).forEach(element => element.hide());

        this.input.textContent = value;
        this.value = value;

        this.refresh();
    },
    enable() {
        this.input.contentEditable = true;
        this.input.tabIndex = 0;
        this.disabled = false;
    },
    disable() {
        this.input.contentEditable = false;
        this.input.tabIndex = -1;
        this.disabled = true;
    },
    refresh() {
        if (this.hasValue()) {
            this.input.classList.remove("empty");
        } else {
            this.input.classList.add("empty");
        }

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        removeChildren(this.statusElement);
        if (this.hasError) {
            this.element.classList.add("error");
            this.input.classList.add("error");
            this.statusElement.classList.add("error");
            this.statusElement.appendChild(createSpan({ class: "error-message" }, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        if (!isHTMLElement(element)) {
            throw new TypeError("Bad argument: The 'element' argument must be an HTML Element");
        }

        this.element.appendChild(element);
        Object.assign(element.style, {
            position: "absolute",
            top: `${this.element.offsetTop + this.input.offsetHeight}px`,
            left: `0px`,
            minWidth: `100%`,
        });

        return this;
    },
    spaceHandler() {
        const candidates = this.getCandidates();

        if (!Array.isArray(candidates)) {
            throw new TypeError("Bad values");
        }

        var note = null;

        if (isEmpty(candidates)) {
            this.editor.notify("Enter any text");
        } else {
            console.log("show candidates", candidates);
        }
    },
    getCandidates() {
        return this.source.getCandidates();
    },
    escapeHandler() {
        this.attached.forEach(element => {
            element.hide();
        });
    },
    bindEvents() {
        this.element.addEventListener('input', (event) => {
            this.refresh();
        });
    },
};


export const TextField = Object.assign(
    Object.create(Field),
    _TextField
);