import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, findAncestor, isHTMLElement, removeChildren, isNullOrWhitespace,
    isEmpty, valOrDefault,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";


function resolveValue(object) {
    if (object.object === "concept") {
        if (object.hasValue()) {
            return object.getValue();
        }

        return "";
    }

    return object;
}

function createMessageElement() {
    if (!isHTMLElement(this.messageElement)) {
        this.messageElement = createI({
            class: ["field-message", "hidden"],
            dataset: {
                nature: "field-component",
                view: "text",
                id: this.id,
            }
        });
        this.notification.appendChild(this.messageElement);
    }

    return this.messageElement;
}

/**
 * Creates a choice element
 * @param {string} value 
 * @returns {HTMLElement}
 */
function createChoiceElement() {
    if (!isHTMLElement(this.choice)) {
        this.choice = createUnorderedList({
            class: ["bare-list", "field--textbox__choices"],
            dataset: {
                nature: "field-component",
                view: "text",
                component: "choice",
                id: this.id,
            }
        });
        this.append(this.choice);
    }

    return this.choice;
}

/**
 * Creates a choice item element
 * @param {string} value 
 * @returns {HTMLElement}
 */
function createChoiceItemElement(value) {
    return createListItem({
        class: ["field--textbox__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            view: "text",
            component: "choice-item",
            value: value,
            id: this.id,
        }
    }, value);
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

/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolvePlaceholder() {
    if (this.schema.placeholder) {
        return this.schema.placeholder;
    }

    if (this.source.object === "concept") {
        return this.source.getAlias();
    }

    return "Enter a value";
}

/**
 * Get the choice element
 * @param {HTMLElement} element 
 */
function getItem(element) {
    return element.parentElement === this.choice ? element : findAncestor(element, (el) => el.parentElement === this.choice, 3);
}

/**
 * Get the choice element value
 * @param {HTMLElement} element
 * @returns {string} 
 */
function getItemValue(item) {
    return item.dataset.value;
}

const BaseTextField = {
    /** @type {HTMLElement} */
    input: null,
    /** @type {HTMLElement} */
    choice: null,
    /** @type {string} */
    value: "",
    /** @type {string} */
    placeholder: "Enter a value",

    init() {
        this.source.register(this);
        this.placeholder = resolvePlaceholder.call(this);

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { before = {}, input, after = {} } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--textbox"],
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

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification"],
                dataset: {
                    nature: "field-component",
                    view: "text",
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
                    view: "text",
                    id: this.id,
                }
            });

            this.notification.appendChild(this.statusElement);
        }

        if (before.projection) {
            let content = ContentHandler.call(this, before.projection);
            content.classList.add("field--textbox__before");

            fragment.appendChild(content);
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
                this.input.textContent = value;
                this.value = value;
            }

            const { projection, style } = valOrDefault(input, {});

            StyleHandler(this.input, style);

            fragment.appendChild(this.input);
        }

        if (after.projection) {
            let content = ContentHandler.call(this, after.projection);
            content.classList.add("field--textbox__after");

            fragment.appendChild(content);
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
    },

    /**
     * Updates the text field on source change
     * @param {string} message
     * @param {*} value 
     */
    update(message, value) {
        switch (message) {
            case "value.changed":
                this.input.textContent = value;
                break;
            default:
                console.warn(`The message '${message}' was not handled for text field`);
                break;
        }
        this.refresh();
    },

    focusIn() {
        this.focused = true;
        this.value = this.input.textContent;
        this.element.classList.add("active");
        this.element.classList.add("focus");

        return this;
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.hasChanges()) {
            this.setValue(this.getValue());
        }

        if (isNullOrWhitespace(this.getValue())) {
            this.input.textContent = "";
        }

        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }

        if (this.choice) {
            hide(this.choice);
        }

        this.input.blur();
        this.element.classList.remove("active");
        this.element.classList.remove("focus");

        this.refresh();
        this.focused = false;

        return this;
    },
    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return this.value !== this.input.textContent;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return !isEmpty(this.input.textContent);
    },
    /**
     * Gets the input value
     * @returns {string}
     */
    getValue() {
        return this.input.textContent;
    },
    setValue(value) {
        var response = this.source.setValue(value);

        if (!response.success) {
            this.environment.notify(response.message);
            this.errors.push(...response.errors);
        } else {
            this.errors = [];
        }

        // this.attached.filter(element => !element.active).forEach(element => element.hide());

        this.input.textContent = value;
        this.value = value;

        this.refresh();
    },
    getCandidates() {
        return this.source.getCandidates();
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
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }

        if (this.choice) {
            this.filterChoice(this.getValue());
        }
    },
    /**
     * Filters the list of choice using a query
     * @param {string} query 
     */
    filterChoice(query) {
        const { children } = this.choice;

        if (isNullOrWhitespace(query)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                show(item);
            }

            return true;
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
        this.input.focus();
        hide(this.choice);

        return this;
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

        return this;
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        const candidates = this.getCandidates();

        if (!Array.isArray(candidates)) {
            throw new TypeError("Bad values");
        }

        createMessageElement.call(this);

        removeChildren(this.messageElement);
        if (isEmpty(candidates)) {
            this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Enter any text."));
            show(this.messageElement);
        } else {
            createChoiceElement.call(this);

            const fragment = createDocFragment();

            candidates.forEach(value => fragment.appendChild(createChoiceItemElement.call(this, value)));

            removeChildren(this.choice).appendChild(fragment);
            this.filterChoice(this.getValue());
            show(this.choice);

            this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Select an element from the list."));
            show(this.messageElement);
        }
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

        if (this.choice) {
            hide(this.choice);
        }
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.selectChoice(item);
        } else if (target === this.input) {
            this.setValue(this.getValue());
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
        this.element.addEventListener('click', (event) => {
            const target = event.target;

            const item = getItem.call(this, target);

            if (isHTMLElement(item)) {
                this.selectChoice(item);
            }
        });

        this.element.addEventListener('input', (event) => {
            this.refresh();
        });
    },
};


export const TextField = Object.assign(
    Object.create(Field),
    BaseTextField
);