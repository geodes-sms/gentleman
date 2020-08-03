import {
    createDocFragment, createSpan, createDiv, isHTMLElement, isNullOrWhitespace,
} from 'zenkai';
import { show, hide, Key, Events } from '@utils/index.js';


export const TextField = {
    id: null,
    /** @type {HTMLElement} */
    element: null,
    /** @type {HTMLElement} */
    input: null,
    init(builder) {
        return this;
    },
    hasValue() {
        return !isNullOrWhitespace(this.input.textContent);
    },
    getValue() {
        return this.input.textContent;
    },
    render() {
        var fragment = createDocFragment();
        var unbound = false;
        if (!isHTMLElement(this.element)) {
            this.element = createTextFieldElement.call(this);
            unbound = true;
        }

        if (!isHTMLElement(this.input)) {
            this.input = createFieldInput.call(this);
            fragment.appendChild(this.input);
        }

        this.element.appendChild(fragment);

        if (unbound) {
            this.bindEvents();
        }

        return this.element;
    },
    refresh() {
        if (this.hasValue()) {
            this.input.classList.remove("empty");
        } else {
            this.input.classList.add("empty");
        }
    },
    bindEvents() {
        var lastKey = -1;

        this.element.addEventListener('input', (event) => {
            this.refresh();
        });
        this.element.addEventListener('click', (event) => {

        });
    },
};


/**
 * Creates the field main element
 * @returns {HTMLElement}
 */
function createTextFieldElement() {
    var element = createDiv({
        class: ["field", "field--textbox", "empty"],
        id: this.id,
        tabindex: -1,
        dataset: {
            nature: "field",
            view: "text",
            id: this.id,
        }
    });

    return element;
}

/**
 * Creates the field input
 * @returns {HTMLElement}
 */
function createFieldInput() {
    var input = createSpan({
        class: ["field--textbox__input", "empty"],
        tabindex: 0,
        editable: true,
        dataset: {
            nature: "field-component",
            id: this.id,
            placeholder: "Enter some text"
        }
    });

    return input;
}