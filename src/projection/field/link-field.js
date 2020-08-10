import {
    createDocFragment, createUnorderedList, createListItem, createInput, createI,
    createSpan, createDiv, removeChildren, isHTMLElement, findAncestor,
    isNullOrWhitespace, isNullOrUndefined, isEmpty
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";


function createMessageElement() {
    if (!isHTMLElement(this.messageElement)) {
        this.messageElement = createI({
            class: ["field-message", "hidden"],
            dataset: {
                nature: "field-component",
                view: "choice",
                id: this.id,
            }
        });
        this.notification.appendChild(this.messageElement);
    }

    return this.messageElement;
}

function createElement() {
    var container = createDiv({
        class: ["field", "field--link", "empty"],
        tabindex: -1,
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

/**
 * Get the choice element
 * @param {HTMLElement} element 
 * @this {BaseLinkField}
 */
function getItem(element) {
    return element.parentElement === this.choices ? element : findAncestor(element, (el) => el.parentElement === this.choices, 3);
}

/**
 * Get the choice element value
 * @param {HTMLElement} element
 * @returns {string} 
 */
function getItemValue(item) {
    return item.dataset.value;
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

    var concept = null;
    if (object.type === "concept") {
        concept = object.value;
    }

    var projection = this.model.createProjection(concept, "reference-choice");

    item.appendChild(projection.init().render());

    return item;
}

const NotificationType = {
    INFO: "info",
    ERROR: "error"
};

/**
 * Creates a notification message
 * @param {string} type 
 * @param {string} message 
 * @returns {HTMLElement}
 */
function createNotificationMessage(type, message) {
    var element = createSpan({ class: ["notification-message", `notification-message--${type}`] }, message);

    if (Array.isArray(message)) {
        element.style.minWidth = `${Math.min(message[0].length * 0.5, 30)}em`;
    } else {
        element.style.minWidth = `${Math.min(message.length * 0.5, 30)}em`;
    }

    return element;
}

function resolveChoiceValue(choice) {
    if (choice.type === "concept") {
        return choice.value.id;
    } else if (choice.type === "value") {
        return choice.value;
    }

    return choice;
}

/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolvePlaceholder() {
    if (this.schema.placeholder) {
        return this.schema.placeholder;
    }

    if (this.source.object === "concept") {
        return `Search for ${this.source.accept}`;
    }

    return "Search for an element";
}


const BaseLinkField = {
    /** @type {string} */
    placeholder: null,
    /** @type {HTMLElement} */
    input: null,
    /** @type {HTMLElement} */
    choices: null,
    value: null,
    scope: null,

    init() {
        this.source.register(this);
        this.placeholder = resolvePlaceholder.call(this);

        return this;
    },

    render() {
        const { before = {}, input, after = {} } = this.schema;

        const fragment = createDocFragment();

        if (!isHTMLElement(this.element)) {
            this.element = createElement.call(this);
            this.element.id = this.id;

            StyleHandler(this.element, this.schema.style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification"],
                dataset: {
                    nature: "field-component",
                    view: "link",
                    id: this.id,
                }
            });
            fragment.appendChild(this.notification);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createI({
                class: ["field-status"],
                dataset: {
                    nature: "field-component",
                    view: "link",
                    id: this.id,
                }
            });
            this.notification.appendChild(this.statusElement);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "text",
                placeholder: this.placeholder,
                class: ["field--link__input"],
                dataset: {
                    nature: "field-component",
                    view: "link",
                    id: this.id,
                }
            });
            fragment.appendChild(this.input);
        }

        if (!isHTMLElement(this.choices)) {
            this.choices = createUnorderedList({
                class: ["bare-list", "field--link__choices"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "link",
                    id: this.id
                }
            });

            fragment.appendChild(this.choices);
        }


        if (before.projection) {
            let content = ContentHandler.call(this, before.projection);
            content.classList.add("field--link__before");

            fragment.appendChild(content);
        }

        if (this.source.hasValue()) {
            let concept = this.getValue();

            var projection = this.model.createProjection(concept);

            this.element.appendChild(projection.init().render());
        }

        if (after.projection) {
            let content = ContentHandler.call(this, after.projection);
            content.classList.add("field--link__after");

            fragment.appendChild(content);
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
    },

    update(message, value) {
        var projection = null;

        switch (message) {
            case "value.changed":
                if (isNullOrUndefined(value)) {
                    this.value = null;
                    this.clear();
                } else {

                    projection = this.model.createProjection(value, "reference-value").init();

                    this.element.appendChild(projection.render());
                    this.value = value.id;
                }
                break;
            default:
                console.warn(`The message '${message}' was not handled for link field`);
                break;
        }

        this.refresh();
    },

    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return false;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return !isNullOrWhitespace(this.value);
    },
    /**
     * Gets the input value
     * @returns {boolean}
     */
    getValue() {
        return this.selection;
    },
    setValue(value) {
        var response = this.source.setValue(value);

        if (!response.success) {
            this.environment.notify(response.message);
            this.errors.push(...response.errors);
        } else {
            this.errors = [];
        }

        this.value = value;

        this.refresh();
    },
    enable() {
        this.input.disabled = false;
        this.input.tabIndex = 0;
        this.disabled = false;
    },
    disable() {
        this.input.disabled = true;
        this.input.tabIndex = -1;
        this.disabled = true;
    },
    clear() {
        removeChildren(this.choices);
        this.input.textContent = "";
    },
    refresh() {
        if (this.hasValue()) {
            hide(this.input);
            hide(this.choices);
        } else {
            show(this.input);
            show(this.choices);
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
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },

    focusIn() {
        this.focused = true;
        this.element.classList.add("active");

        // const fragment = createDocFragment();

        // this.source.getCandidates().forEach(concept => fragment.appendChild(createChoice.call(this, concept)));

        // removeChildren(this.choices).appendChild(fragment);
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (isNullOrWhitespace(this.input.value)) {
            this.input.value = "";
        }

        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }

        this.element.classList.remove("active");

        this.refresh();
        this.focused = false;
    },
    filterChoice(query) {
        const { children } = this.choices;

        if (isNullOrWhitespace(query)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                show(item);
            }

            return;
        }

        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const { value } = item.dataset;

            let parts = query.trim().replace(/\s+/g, " ").split(' ');
            let match = parts.some(q => value.includes(q));

            match ? show(item) : hide(item);
        }

        return true;
    },
    /**
     * Assigns the value of the selected item to the input
     * @param {HTMLElement} item 
     */
    selectChoice(item) {
        if (!isHTMLElement(item)) {
            return;
        }

        const value = getItemValue(item);

        this.setValue(value);

        return this;
    },

    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        this.input.focus();

        if (this.messageElement) {
            hide(this.messageElement);
        }

        if (this.choices) {
            hide(this.choice);
        }
    },
    spaceHandler() {
        removeChildren(this.choices);

        createMessageElement.call(this);

        removeChildren(this.messageElement);

        const values = this.source.getCandidates();

        if (isEmpty(values)) {
            this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "There are currently no valid references."));
            show(this.messageElement);
            return;
        }

        values.forEach(value => {
            var choice = createChoice.call(this, value);
            this.choices.appendChild(choice);
        });


        show(this.choices);
        this.choices.focus();
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.selectChoice(item);
        }
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.input.focus();
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

            if (isHTMLElement(item)) {
                this.selectChoice(item);
            }
        });

        this.element.addEventListener('input', (event) => {
            this.filterChoice(this.input.value);
        });
    }
};

export const LinkField = Object.assign(
    Object.create(Field),
    BaseLinkField
);