import {
    createUnorderedList, createListItem, createAnchor, createInput, createDocFragment,
    appendChildren, removeChildren, isHTMLElement, findAncestor,
    valOrDefault, isNullOrWhitespace,
} from "zenkai";
import { show, hide } from "@utils/index.js";
import { Field } from "./field.js";
import { ProjectionManager } from "@projection/index.js";
import { StyleHandler } from "./../style-handler.js";


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

    if (this.source.hasValue()) {
        container.classList.remove("empty");
    }

    StyleHandler(container, this.schema.style);

    return container;
}


function createChoice(object) {
    const { choice } = this.schema;

    var item = createListItem({
        class: ["field--link__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
            value: resolveChoiceValue(object)
        }
    });

    var projection = null;
    var concept = null;
    if (object.type === "concept") {
        concept = object.value;
    }

    if (choice) {
        projection = ProjectionManager.createProjection(choice.projection, concept, this.editor).init();
    } else {
        let schema = concept.schema.projection.filter(projection => projection.tags && projection.tags.includes("choice"));
        projection = ProjectionManager.createProjection(schema, concept, this.editor).init();
    }
    
    item.appendChild(projection.render());

    return item;
}

function resolveChoiceValue(choice) {
    if (choice.type === "concept") {
        return choice.value.id;
    } else if (choice.type === "value") {
        return choice.value;
    }

    return choice;
}


const _LinkField = {
    init() {
        this.value = this.schema.value;
        this.choice = this.schema.choice;
        this.scope = this.schema.scope;
        this.placeholder = this.schema.placeholder;

        return this;
    },
    value: null,
    choice: null,
    placeholder: null,
    input: null,
    choices: null,

    render() {
        if (!isHTMLElement(this.element)) {
            this.element = createElement.call(this);
            this.element.id = this.id;

            this.input = createInput({
                class: ["field--link__input"],
                placeholder: this.placeholder ? this.placeholder : `Select ${this.source.name}`,
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

        if (this.source.hasValue()) {
            let concept = this.getValue();

            var projectionSchema = valOrDefault(this.value.projection, concept.schema.projection);
            var projection = ProjectionManager.createProjection(projectionSchema, concept, this.editor).init();
            this.element.appendChild(projection.render());
        }

        this.bindEvents();

        return this.element;
    },
    focusIn() {
        this.focused = true;
    },
    focusOut() {
        this.focused = false;
    },
    spaceHandler() {
        removeChildren(this.choices);
        this.source.getCandidates().forEach(value => {
            var choice = createChoice.call(this, value);
            this.choices.appendChild(choice);
        });

        if (this.source.accept === "concept") {
            ["string", "number", "set", "reference"].forEach(value => {
                this.choices.appendChild(createListItem({
                    class: ["field--link__choice"],
                    tabindex: 0,
                    dataset: {
                        nature: "field-component",
                        id: this.id,
                        value: value
                    }
                }, value));
            });
        }

        show(this.choices);
        this.choices.focus();
    },
    bindEvents() {
        var lastKey = -1;

        const getInputValue = () => this.input.value.trim();
        const filterDATA = (query) => this.source.getCandidates().filter(val => query.some(q => val.name.toLowerCase().includes(q.toLowerCase())));

        /**
         * Get the choice element
         * @param {HTMLElement} element 
         */
        const getItem = (element) => element.parentElement === this.choices ? element : findAncestor(element, (el) => el.parentElement === this.choices);

        this.element.addEventListener('click', (event) => {
            const item = getItem(event.target);

            if (isHTMLElement(item)) {
                let { value } = item.dataset;
                this.source.setValue(value);
                let concept = this.source.getValue();

                var projection = null;
                if (this.schema.value) {
                    projection = ProjectionManager.createProjection(this.schema.value.projection, concept, this.editor).init();
                } else {
                    let schema = concept.schema.projection.filter(projection => projection.tags && projection.tags.includes("choice"));
                    projection = ProjectionManager.createProjection(schema, concept, this.editor).init();
                }

                this.element.parentElement.insertBefore(projection.render(), this.element);
                this.value = concept;

                hide(this.input);
                hide(this.choices);
            }
        });

        this.element.addEventListener('input', (event) => {
            var fragment = createDocFragment();

            if (isNullOrWhitespace(getInputValue())) {
                this.source.getCandidates().forEach(concept => fragment.appendChild(createChoice.call(this, concept)));

                hide(this.choices);
            } else {
                let query = getInputValue().split(' ');
                filterDATA(query).forEach(concept => fragment.appendChild(createChoice.call(this, concept)));

                show(this.choices);
            }

            removeChildren(this.choices).appendChild(fragment);
        });
    }
};

export const LinkField = Object.assign({},
    Field,
    _LinkField
);