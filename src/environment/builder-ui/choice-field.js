import {
    createDocFragment, createUnorderedList, createListItem, createDiv,
    isHTMLElement, isNullOrWhitespace,
} from 'zenkai';
import { show, hide, Key, Events } from '@utils/index.js';


const ChoiceField = {
    id: null,
    element: null,
    choices: null,
    init(value) {
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

        if (!isHTMLElement(this.choices)) {
            this.choices = createFieldChoice.call(this);
            ["LAYOUT", "FIELD"].forEach(choice => this.choices.append(createFieldChoiceItem.call(this, choice)));
            fragment.append(this.choices);
        }

        this.element.append(fragment);

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
function createFieldChoice() {
    var choices = createUnorderedList({
        class: ["bare-list", "field--choice__choices"],
        tabindex: 0,
        editable: true,
        dataset: {
            nature: "field-component",
            id: this.id,
        }
    });

    return choices;
}

function createFieldChoiceItem(choice) {
    var container = createListItem({
        class: ["field--choice__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
        }
    }, choice);

    return container;
}