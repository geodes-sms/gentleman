import {
    createSpan, createParagraph, createDiv, createButton, appendChildren,
    removeChildren, isHTMLElement, isNullOrWhitespace, isDerivedOf, isEmpty, isNullOrUndefined, createInput,
} from "zenkai";
import { hide, Key, isPrototypeOf } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "./../style-handler.js";


/**
 * Creates the field main element
 * @returns {HTMLElement}
 */
function createFieldElement() {
    var element = createDiv({
        class: ["field", "field--checkbox"],
        id: this.id,
        tabindex: -1,
        dataset: {
            nature: "field",
            view: "check",
            id: this.id,
        }
    });

    if (this.readonly) {
        element.classList.add("readonly");
    }

    StyleHandler(element, this.schema.style);

    return element;
}

/**
 * Creates the field input
 * @returns {HTMLElement}
 */
function createFieldInput() {
    /** @type {HTMLElement} */
    var input = createInput({
        type: "checkbox",
        class: ["field--checkbox__input"],
        tabindex: 0,
        disabled: this.readonly,
        dataset: {
            nature: "field-component",
            id: this.id,
        }
    });

    resolveValue.call(this, input);

    return input;
}

/**
 * Resolves the value of the input
 * @param {HTMLInputElement} input 
 */
function resolveValue(input) {
    if (isDerivedOf(this.source, Concept)) {
        if (this.source.hasValue()) {
            input.checked = this.source.getValue();
        }
    } else {
        input.checked = false;
    }

    return input;
}


/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolveLabel() {
    if (this.schema.label) {
        return this.schema.label;
    }

    if (isDerivedOf(this.source, Concept)) {
        return this.source.getAlias();
    }

    return "";
}

const _CheckField = {
    /** @type {boolean} */
    checked: false,
    /** @type {string} */
    label: null,
    /** @type {HTMLInputElement} */
    input: null,

    init() {
        this.source.register(this);
        this.label = resolveLabel.call(this);

        return this;
    },

    render() {
        if (!isHTMLElement(this.element)) {
            this.element = createFieldElement.call(this);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createFieldInput.call(this);
            this.element.appendChild(this.input);
        }

        this.bindEvents();

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
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        this.setValue(this.input.checked);

        this.input.blur();

        this.refresh();
    },
    hasValue() {
        return this.input.checked;
    },
    getValue() {
        return this.input.checked;
    },
    setValue(value) {
        this.source.setValue(value);

        this.attached.filter(element => !element.active).forEach(element => element.hide());

        this.input.textContent = value;
        this.refresh();
    },
    refresh() {
        if (this.hasError) {
            this.element.classList.add('error');
            this.input.classList.add('error');
        } else {
            this.element.classList.remove('error');
            this.input.classList.remove('error');
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

        return this;
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
        var lastKey = -1;

        this.element.addEventListener('change', (event) => {
            this.setValue(this.input.checked);
        });
    },
};



export const CheckField = Object.assign(
    Object.create(Field),
    _CheckField
);