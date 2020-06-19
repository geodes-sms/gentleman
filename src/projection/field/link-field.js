import {
    createSpan, createUnorderedList, createListItem, createDiv, createDocFragment,
    addAttributes, appendChildren, removeChildren, isHTMLElement,
    valOrDefault, isEmpty, isNullOrWhitespace, createAnchor, createInput, findAncestor,
} from "zenkai";
import { Field } from "./field.js";
import { extend, show, hide } from "@utils/index.js";
import { Projection } from "@projection/index.js";


function createElement() {
    var container = createAnchor({
        class: ["field", "field--link", "empty"],
        tabindex: 0,
        editable: true,
        dataset: {
            nature: "field",
            view: "link",
            id: this.id,
        }
    });

    if (this.concept.hasValue()) {
        container.classList.remove("empty");
    }

    return container;
}


function createChoice(value) {
    var choice = createListItem({
        class: "field--link__choice",
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
            value: value.id
        }
    });

    const schema = this.choice.projection;
    schema.forEach(config => {
        config.element = {};
        for (const key in value) {
            Object.assign(config.element, {
                [key]: {
                    "type": "text",
                    "disposition": value[key]
                }
            });
        }
    });

    var projection = Projection.create(schema, null, this.editor);
    choice.appendChild(projection.render());

    return choice;
}

export const LinkField = extend(Field, {
    init() {
        this.value = this.schema.value;
        this.choice = this.schema.choice;

        return this;
    },
    value: null,
    source: null,
    choice: null,
    input: null,
    choices: null,

    render() {
        if (!isHTMLElement(this.element)) {
            this.element = createElement.call(this);
            this.element.id = this.id;

            this.input = createInput({
                class: "field--link__input",
                placeholder: `Select ${this.concept.name}`,
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            });
            this.choices = createUnorderedList({
                class: ["bare-list", "field--link__choices", "hidden"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            });

            appendChildren(this.element, [this.input, this.choices]);
        }

        if (this.concept.hasValue()) {
            let concept = this.getValue();

            var projectionSchema = valOrDefault(this.value.projection, concept.schema.projection);
            var projection = Projection.create(projectionSchema, concept, this.editor);
            this.element.appendChild(projection.render());
        }

        this.bindEvents();

        return this.element;
    },
    focusIn() {
        this.source = this.concept.getCandidates();
    },
    focusOut() {
        return true;
    },
    spaceHandler() {
        removeChildren(this.choices);
        this.source.forEach(value => {
            var choice = createChoice.call(this, value);
            this.choices.appendChild(choice);
        });

        show(this.choices);
        this.choices.focus();
    },
    bindEvents() {
        var lastKey = -1;

        const concept = this.concept;

        const getInputValue = () => this.input.value.trim();
        const filterDATA = (query) => this.source.filter(val => query.some(q => val.name.toLowerCase().includes(q.toLowerCase())));

        this.element.addEventListener('click', (event) => {
            let target = event.target;
            var parent = findAncestor(target, (el) => el.classList.contains('field--link__choice'));
            
            if (parent.parentElement === this.choices) {
                let { value } = parent.dataset;
                this.concept.setValue(value);
                let concept = this.concept.getValue();
                var projectionSchema = concept.schema.projection;
                var projection = Projection.create(this.value.projection, concept, this.editor);
                this.element.parentElement.insertBefore(projection.render(), this.element);
                this.value = concept;

                hide(this.input);
                hide(this.choices);
            }
        });

        this.element.addEventListener('input', (event) => {
            var fragment = createDocFragment();

            if (isNullOrWhitespace(getInputValue())) {
                this.source.forEach(concept => { fragment.appendChild(createChoice.call(this, concept)); });

                hide(this.choices);
            } else {
                let query = getInputValue().split(' ');
                filterDATA(query).forEach(concept => { fragment.appendChild(createChoice.call(this, concept)); });

                show(this.choices);
            }

            removeChildren(this.choices).appendChild(fragment);
        });
    }
});