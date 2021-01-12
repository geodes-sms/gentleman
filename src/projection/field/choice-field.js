import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, findAncestor, isHTMLElement, removeChildren,
    getPreviousElementSibling, getNextElementSibling,
    isNullOrUndefined, isNullOrWhitespace, isObject, valOrDefault, createInput, hasOwn, capitalizeFirstLetter
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";


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
 * Get the choice element
 * @param {HTMLElement} element 
 * @this {BaseChoiceField}
 * @returns {HTMLElement}
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


const BaseChoiceField = {
    /** @type {string} */
    value: null,
    /** @type {HTMLElement} */
    choices: null,
    /** @type {HTMLElement} */
    input: null,
    /** @type {Map} */
    items: null,
    /** @type {HTMLElement} */
    selection: null,
    /** @type {HTMLElement} */
    selectionElement: null,

    init() {
        this.source.register(this);
        this.items = new Map();

        // TODO: Add group support

        if (!hasOwn(this.schema, "choice")) {
            this.schema.choice = {};
        }

        return this;
    },

    update(message, value) {
        switch (message) {
            case "value.changed":
                if (value.object === "concept") {
                    let projection = this.model.createProjection(value, "choice-selection").init();
                    projection.parent = this.projection;

                    this.setChoice(value.name);

                    this.setSelection(projection.render());
                } else {
                    this.setChoice(value);
                }
                break;
            default:
                console.warn(`The message '${message}' was not handled for choice field`);
                break;
        }
    },
    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return this.value !== this.selected;
    },
    reset() {
        // TODO: Get initial value
        this.setValue(null);
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return !isNullOrUndefined(this.selection);
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

    render() {
        const fragment = createDocFragment();

        const { before = {}, choice, selection = {}, after = {}, input = {}, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--choice"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "choice",
                    input: "",
                    id: this.id,
                }
            });

            StyleHandler(this.element, style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification", "hidden"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
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
                    view: "choice",
                    id: this.id,
                }
            });

            this.notification.appendChild(this.statusElement);
        }

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

        if (before.projection) {
            let content = ContentHandler.call(this, before.projection);
            content.classList.add("field--choice__before");

            fragment.appendChild(content);
        }

        if (!isHTMLElement(this.input)) {
            const { before = {}, after = {}, style } = input;

            // let wrapper = createDiv({
            //     class: ["field--choice__input-wrapper"],
            //     tabindex: -1,
            //     dataset: {
            //         nature: "field-component",
            //         view: "choice",
            //         id: this.id,
            //     }
            // });

            // if (before.projection) {
            //     let content = ContentHandler.call(this, before.projection);
            //     content.classList.add("field--choice__input--before");

            //     wrapper.append(content);
            // }


            // wrapper.append(this.input);

            // if (after.projection) {
            //     let content = ContentHandler.call(this, after.projection);
            //     content.classList.add("field--choice__input--after");

            //     wrapper.append(content);
            // }


            this.input = createInput({
                type: "text",
                class: ["field--choice__input"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id,
                }
            });

            StyleHandler(this.input, style);

            fragment.append(this.input);
        }

        if (!isHTMLElement(this.choices)) {
            const { style } = choice;

            this.choices = createUnorderedList({
                class: ["bare-list", "field--choice__choices"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            StyleHandler(this.choices, style);

            fragment.appendChild(this.choices);
        }

        if (!isHTMLElement(this.selectionElement)) {
            const { style } = selection;

            this.selectionElement = createDiv({
                class: ["field--choice__selection"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            StyleHandler(this.selectionElement, style);

            fragment.appendChild(this.selectionElement);
        }

        if (after.projection) {
            let content = ContentHandler.call(this, after.projection);
            content.classList.add("field--choice__after");

            fragment.appendChild(content);
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

        removeChildren(this.choices);

        this.source.getCandidates().forEach(value => {
            this.choices.appendChild(this.createChoiceOption(value));
        });

        if (this.source.hasValue()) {
            let value = this.source.getValue();

            if (value.object === "concept") {
                let projection = this.model.createProjection(value, "choice-selection").init();
                projection.parent = this.projection;

                this.setChoice(value.name);
                removeChildren(this.selectionElement).appendChild(projection.render());
            } else {
                this.setChoice(value);
            }
        }

        this.refresh();

        return this.element;
    },
    focusIn() {
        this.focused = true;
        this.element.classList.add("active");

        return this;
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

        this.input.blur();
        this.element.classList.remove("active");
        this.element.classList.remove("querying");

        if (isHTMLElement(this.selection)) {
            show(this.selection);
            this.input.value = "";
        }

        this.focused = false;

        return this;
    },
    enable() {
        this.input.disabled = false;
        this.input.tabIndex = 0;
        this.disabled = false;

        return this;
    },
    disable() {
        this.input.disabled = true;
        this.input.tabIndex = -1;
        this.disabled = true;

        return this;
    },
    refresh() {
        if (this.hasValue()) {
            this.element.classList.remove("empty");
        } else {
            this.element.classList.add("empty");
        }

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        this.element.classList.remove("querying");

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

        return this;
    },
    /**
     * Filters the list of choice using a query
     * @param {string} query 
     */
    filterChoice(query) {
        const { children } = this.choices;

        this.element.dataset.input = query.trim();

        if (isNullOrWhitespace(query)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                
                show(item);
                item.hidden = false;
            }

            return;
        }

        this.element.classList.add("querying");

        let parts = query.trim().toLowerCase().replace(/\s+/g, " ").split(' ');

        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const { value } = item.dataset;

            let match = parts.some(q => value.toLowerCase().includes(q));

            
            if (match) {
                show(item);
                item.hidden = false;
            } else {
                hide(item);
                item.hidden = true;
            }
        }

        return true;
    },
    createChoiceOption(value) {
        const container = createListItem({
            class: ["field--choice__choice"],
            tabindex: 0,
            dataset: {
                nature: "field-component",
                view: "choice",
                id: this.id,
                value: value.name || value
            }
        });

        const { before = {}, style, template, after = {} } = valOrDefault(this.schema.choice.option, {});

        if (before.projection) {
            let content = ContentHandler.call(this, before.projection);
            content.classList.add("field--choice__option__before");

            container.appendChild(content);
        }

        if (isObject(value)) {
            let choiceProjection = this.model.createProjection(value, valOrDefault(template, "choice")).init(this.source);
            choiceProjection.parent = this.projection;

            const { context } = choiceProjection.getSchema();

            if (context) {
                for (const key in context) {
                    const value = context[key];
                    container.dataset[`choice${capitalizeFirstLetter(key)}`] = value;
                }
            }

            container.append(choiceProjection.render());
        } else {
            container.append(value.toString());
        }

        StyleHandler(container, style);

        if (after.projection) {
            let content = ContentHandler.call(this, after.projection);
            content.classList.add("field--choice__option__after");

            container.appendChild(content);
        }


        this.items.set(value.name, container);

        return container;
    },
    setChoice(value) {
        const { children } = this.choices;

        for (let i = 0; i < children.length; i++) {
            /** @type {HTMLElement} */
            const item = children[i];

            if (getItemValue(item) === value) {
                item.classList.add("selected");
                item.dataset.selected = "selected";
                this.selection = item;
                show(item);
            } else {
                item.classList.remove("selected");
                delete item.dataset.selected;
                hide(item);
            }
        }

        return this;
    },
    setSelection(element) {
        removeChildren(this.selectionElement).appendChild(element);
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        const fragment = createDocFragment();

        this.source.getCandidates().forEach(value => {
            fragment.appendChild(this.createChoiceOption(value));
        });

        removeChildren(this.choices).appendChild(fragment);
        this.filterChoice(this.input.value);
        show(this.choices);
        this.element.classList.add("querying");

        this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Select an element from the list."));
        show(this.messageElement);
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
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            const value = getItemValue(item);
            this.setValue(value);
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
        const item = getItem.call(this, target);

        if (isHTMLElement(item) && this.selection !== item) {
            let value = getItemValue(item);
            this.setValue(value);
            this.focusOut();
        }
    },
    
    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        /** @type {HTMLElement} */
        const item = getItem.call(this, target);

        if (isHTMLElement(item)) {
            let $item = null;
            if (dir === "up") {
                $item = getPreviousElementSibling(item, (el) => !el.hidden);

            } else if (dir === "down") {
                $item = getNextElementSibling(item, (el) => !el.hidden);
            }

            if (isHTMLElement($item)) {
                $item.focus();
            }
        }
    },

    bindEvents() {
        this.element.addEventListener('input', (event) => {
            this.filterChoice(this.input.value);
        });
    },
};


export const ChoiceField = Object.assign(
    Object.create(Field),
    BaseChoiceField
);