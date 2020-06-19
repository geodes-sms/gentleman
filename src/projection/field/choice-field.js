import {
    createSpan, createParagraph, createDiv, createUnorderedList, createListItem,
    insertAfterElement, removeChildren, isEmpty, isNullOrUndefined, isNullOrWhitespace,
    capitalizeFirstLetter, createButton, appendChildren, isHTMLElement, createInput, createDocFragment
} from "zenkai";
import { extend, hide, Key, show } from "@utils/index.js";
import { Field } from "./field.js";
import { Projection } from "@projection/projection.js";

function createChoice (value) {
    return createListItem({
        class: "field--choice__choice",
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
            value: value
        }
    }, value);
}


export const ChoiceField = extend(Field, {
    /** @type {HTMLElement} */
    input: null,
    value: null,
    source: null,

    init(source) {
        if (!Array.isArray(source)) {
            this.source = this.concept.getCandidates();
        }

        return this;
    },

    update(type, value) {
        switch (type) {
            case "value.changed":
                this.input.textContent = value;
                break;
            default:
                console.warn(`Field not updated for operation '${type}'`);
                break;
        }
        this.updateUI();
    },

    render() {
        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--choice"],
                tabindex: 0,
                dataset: {
                    nature: "field",
                    view: "choice",
                    id: this.id,
                }
            });
            this.input = createInput({
                class: "field--choice__input",
                tabindex: 0,
                placeholder: `Select ${this.concept.name}`,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            });
            this.choices = createUnorderedList({
                class: ["bare-list", "field--choice__choices", "hidden"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            });

            appendChildren(this.element, [this.input, this.choices]);
        }

        removeChildren(this.choices);

        this.source.forEach(value => {
            this.choices.appendChild(createChoice.call(this, value.name));
        });

        this.bindEvents();

        return this.element;
    },
    focusIn() {
        if (this.input.value) {
            show(this.choices);
        }
        this.hasFocus = true;
    },
    focusOut() {
        hide(this.choices);
    },
    setValue(value) {
        if (!this.concept.update(value)) {
            this.editor.notify(`${capitalizeFirstLetter(this.concept.getAlias())} could not be updated`);
        }
        this.input.textContent = value;
        this.updateUI();
    },
    spaceHandler() {
        show(this.choices);
        this.choices.focus();
    },

    bindEvents() {
        var lastKey = -1;

        const getInputValue = () => this.input.value.trim();
        const filterDATA = (query) => this.source.filter(val => query.some(q => val.name.toLowerCase().includes(q.toLowerCase())));

        this.element.addEventListener('click', (event) => {
            // console.warn("CHOICE CLICKED!");
            let target = event.target;
            let { value } = target.dataset;

            if (value) {
                let concept = this.concept.createElement(value);

                var projectionSchema = concept.schema.projection;
                var projection = Projection.create(concept.schema.projection, concept, this.editor);
                this.element.parentElement.insertBefore(projection.render(), this.element);
                this.value = concept;

                hide(this.input);
                hide(this.choices);
            }
        });

        this.element.addEventListener('input', (event) => {
            var fragment = createDocFragment();

            if (isNullOrWhitespace(getInputValue())) {
                this.source.forEach(concept => { fragment.appendChild(createChoice.call(this, concept.name)); });

                hide(this.choices);
            } else {
                let query = getInputValue().split(' ');
                filterDATA(query).forEach(concept => { fragment.appendChild(createChoice.call(this, concept.name)); });

                show(this.choices);
            }

            removeChildren(this.choices).appendChild(fragment);
        });
    },
});