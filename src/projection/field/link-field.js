import {
    createDocFragment, createUnorderedList, createListItem, createInput, createI,
    createSpan, createDiv, removeChildren, isHTMLElement, findAncestor,
    isNullOrWhitespace, isNullOrUndefined, isEmpty, valOrDefault, hasOwn
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
 * @returns {HTMLElement}
 * @this {BaseLinkField}
 */
function getItem(element) {
    const isValid = (el) => el.parentElement === this.choices;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 5);
}

/**
 * Get the choice element value
 * @param {HTMLElement} element
 * @returns {string} 
 */
function getItemValue(item) {
    return item.dataset.value;
}

/**
 * Creates a choice item
 * @param {*} object 
 * @returns {HTMLElement}
 */
function createChoice(object) {
    const { before = {}, style, after = {} } = valOrDefault(this.schema.choice.option, {});

    const item = createListItem({
        class: ["field--link__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            component: "choice",
            id: this.id,
            value: resolveChoiceValue(object)
        }
    });

    var concept = null;
    if (object.type === "concept") {
        concept = object.value;
    }

    const projection = this.model.createProjection(concept, "reference-choice");

    item.appendChild(projection.init().render());

    StyleHandler(item, style);

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
        return `Link to a '${this.source.accept}' concept`;
    }

    return "Link to an element";
}


const BaseLinkField = {
    /** @type {HTMLElement} */
    input: null,
    /** @type {HTMLElement} */
    selector: null,
    /** @type {string} */
    placeholder: null,
    /** @type {HTMLElement} */
    choices: null,
    /** @type {HTMLElement} */
    selectionElement: null,

    value: null,

    init() {
        this.source.register(this);
        this.placeholder = resolvePlaceholder.call(this);

        if (!hasOwn(this.schema, "choice")) {
            this.schema.choice = {};
        }

        return this;
    },

    render() {
        const { before = {}, input, choice, after = {} } = this.schema;

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

            fragment.append(this.notification);
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
            this.notification.append(this.statusElement);
        }

        if (!isHTMLElement(this.selector)) {
            this.selector = createDiv({
                class: ["field--link__placeholder"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    component: "selector",
                    view: "link",
                    id: this.id,
                }
            }, this.placeholder);

            fragment.append(this.selector);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "text",
                placeholder: this.placeholder,
                class: ["field--link__input"],
                dataset: {
                    nature: "field-component",
                    component: "input",
                    view: "link",
                    id: this.id,
                }
            });

            fragment.appendChild(this.input);
        }

        if (!isHTMLElement(this.choices)) {
            const { style } = choice;

            this.choices = createUnorderedList({
                class: ["bare-list", "field--link__choices"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    component: "choices",
                    view: "link",
                    id: this.id
                }
            });

            StyleHandler(this.choices, style);

            fragment.appendChild(this.choices);
        }

        if (!isHTMLElement(this.selectionElement)) {
            this.selectionElement = createDiv({
                class: ["field--link__selection"],
                dataset: {
                    nature: "field-component",
                    view: "link",
                    id: this.id
                }
            });

            fragment.appendChild(this.selectionElement);
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

                    removeChildren(this.selectionElement).appendChild(projection.render());
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
            show(this.selector);
            hide(this.input);
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
    openChoice() {
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
            hide(this.choices);
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
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        const { component } = target.dataset;

        if (component === "selector") {
            this.openChoice();
        } else {
            const item = getItem.call(this, target);

            if (isHTMLElement(item)) {
                this.selectChoice(item);
            }
        }
    },

    bindEvents() {
        this.element.addEventListener('input', (event) => {
            this.filterChoice(this.input.value);
        });
    }
};

export const LinkField = Object.assign(
    Object.create(Field),
    BaseLinkField
);