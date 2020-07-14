import {
    createDiv, createUnorderedList, createListItem, removeChildren, appendChildren,
    findAncestor, isHTMLElement, isNullOrUndefined,
} from "zenkai";
import { show } from "@utils/index.js";
import { Field } from "./field.js";
import { ProjectionManager } from "@projection/projection.js";
import { StyleHandler } from "./../style-handler.js";


function createChoice(choice) {
    var content = choice;

    if (choice.projection) {
        choice.projection = choice.projection.filter(p => p.tags && p.tags.includes("choice"));
        let projection = ProjectionManager.createProjection(choice.projection, null, this.editor).init();
        content = projection.render();
    }

    var container = createListItem({
        class: ["field--choice__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
            value: resolveChoiceValue(choice)
        }
    }, content);

    this.items.set(choice.name, container);

    return container;
}

function resolveChoiceValue(choice) {
    if (choice.type === "concept") {
        return choice.name;
    } else if (choice.type === "value") {
        return choice.value;
    }

    return choice;
}

const BaseChoiceField = {
    /** @type {string} */
    value: null,
    /** @type {Map} */
    items: null,
    /** @type {string} */
    type: "choice",

    init() {
        this.source.register(this);
        this.items = new Map();

        return this;
    },

    update(type, value) {
        switch (type) {
            case "value.changed":
                break;
            default:
                console.warn(`Field not updated for operation '${type}'`);
                break;
        }
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
            this.choices = createUnorderedList({
                class: ["bare-list", "field--choice__choices"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            });
            StyleHandler(this.element, this.schema.style);

            appendChildren(this.element, [this.input, this.choices]);
        }

        removeChildren(this.choices);

        if (this.source.hasValue()) {
            let concept = this.source.getValue();
            concept.schema.projection = concept.schema.projection.filter(p => p.layout.view === "editor");
            let projection = ProjectionManager.createProjection(concept.schema.projection, concept, this.editor).init();

            this.element.appendChild(projection.render());
        } else {
            this.source.getCandidates().forEach(value => {
                this.choices.appendChild(createChoice.call(this, value));
            });         
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
        show(this.choices);
        this.choices.focus();
    },
    select(value) {
        if (isNullOrUndefined(value)) {
            return;
        }

        let result = this.source.setValue(value);
        if (this.sourceType === "concept") {
            let concept = this.source.getValue();
            // concept.schema.projection = concept.schema.projection.filter(p => p.tags.includes["editor"]);
            let projection = ProjectionManager.createProjection(concept.schema.projection, concept, this.editor).init();
            this.element.before(projection.render());
        } else if (this.sourceType === "field") {
            this.source.setValue(value);
        } else {
            // TODO: Select without callback from source
        }
    },

    bindEvents() {
        /**
         * Get the choice element
         * @param {HTMLElement} element 
         */
        const getItem = (element) => element.parentElement === this.choices ? element : findAncestor(element, (el) => el.parentElement === this.choices);

        this.choices.addEventListener('click', (event) => {
            const item = getItem(event.target);
            const { value } = item.dataset;
            this.select(value);
            this.hide();
        });

    },
};

export const ChoiceField = Object.assign({},
    Field,
    BaseChoiceField
);