import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn,
} from "zenkai";
import {
    hide, show, getCaretIndex, isHidden, NotificationType, getClosest,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { StateHandler } from "./../state-handler.js";
import { resolveValue } from "./../content-handler.js";
import { Field } from "./field.js";


const isInputOrTextarea = (element) => isHTMLElement(element, ["input", "textarea"]);

const CSS_ERROR = "error";

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

/**
 * Resolves the input
 * @param {*} schema 
 * @returns {HTMLElement}
 */
function resolveInput(schema) {
    const { placeholder = "", type } = schema;

    let placeholderValue = resolveValue.call(this, placeholder);

    if (this.readonly || this.resizable) {
        return createSpan({
            class: ["field--textbox__input", "field--textbox__input-pseudo"],
            editable: !this.readonly,
            title: placeholderValue,
            dataset: {
                placeholder: placeholderValue,
                nature: "field-component",
                view: this.type,
                id: this.id,
            }
        });
    } else if (this.multiline) {
        return createTextArea({
            class: ["field--textbox__input"],
            placeholder: placeholderValue,
            title: placeholderValue,
            dataset: {
                nature: "field-component",
                view: this.type,
                id: this.id,
            }
        });
    }
    return createInput({
        class: ["field--textbox__input"],
        type: valOrDefault(type, "text"),
        placeholder: placeholderValue,
        title: placeholderValue,
        dataset: {
            nature: "field-component",
            view: this.type,
            id: this.id,
        }
    });
}

const BaseTextField = {
    /** @type {HTMLInputElement|HTMLTextAreaElement} */
    input: null,
    /** @type {HTMLElement} */
    choice: null,

    /** @type {string} */
    value: "",
    /** @type {string} */
    placeholder: null,
    /** @type {boolean} */
    multiline: false,
    /** @type {boolean} */
    resizable: false,
    /** @type {*[]} */
    content: null,


    init() {
        const { multiline = false, resizable = false, focusable = true } = this.schema;

        this.multiline = multiline;
        this.focusable = focusable;
        this.resizable = resizable;
        this.children = [];

        if (!hasOwn(this.schema, "choice")) {
            this.schema.choice = {};
        }

        return this;
    },

    focus(target) {
        this.input.focus();

        return this;
    },
    focusIn() {
        this.focused = true;
        this.value = this.getValue();
        this.element.classList.add("active");
        this.element.classList.add("focus");

        return this;
    },
    focusOut() {
        if (this.hasChanges()) {
            this.setValue(this.getValue(), true);
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
        return this.value != this.getValue();
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return !isEmpty(this.getValue());
    },
    /**
     * Gets the input value
     * @returns {string}
     */
    getValue() {
        if (isInputOrTextarea(this.input)) {
            return this.input.value;
        }

        return this.input.textContent;
    },
    /**
     * Sets the field value
     * @param {string} value
     * @param {boolean} update 
     */
    setValue(value, update = false) {
        var response = null;

        if (update) {
            response = this.source.setValue(value);
        } else {
            response = {
                success: true
            };
        }

        if (!response.success) {
            this.environment.notify(response.message, "error");
        }
        
        // this.attached.filter(element => !element.active).forEach(element => element.hide());
        
        this.setInputValue(value);
        
        this.value = value;
        
        this.environment.refresh();
        this.refresh();
    },
    /**
     * Sets the input value
     * @param {string} value 
     */
    setInputValue(value) {
        if (isInputOrTextarea(this.input)) {
            this.input.value = value;
        } else {
            this.input.textContent = value;
        }
    },
    getCandidates() {
        let result = this.source.getCandidates();

        if (!Array.isArray(result)) {
            return [];
        }

        return result;
    },
    enable() {
        this.input.disabled = false;
        this.input.tabIndex = 0;
        this.disabled = false;
        this.element.classList.add("disabled");

        return this;
    },
    disable() {
        this.input.disabled = true;
        this.input.tabIndex = -1;
        this.disabled = true;
        this.element.classList.remove("disabled");

        return this;
    },

    refresh() {
        StateHandler.call(this, this.schema, this.schema.state);

        if (this.hasValue()) {
            this.element.classList.remove("empty");
        } else {
            this.element.classList.add("empty");
        }
        this.element.dataset.value = this.value;



        if (this.hasError) {
            this.element.classList.add(CSS_ERROR);
            this.input.classList.add(CSS_ERROR);
        } else {
            this.element.classList.remove(CSS_ERROR);
            this.input.classList.remove(CSS_ERROR);
        }

        if (this.choice) {
            this.filterChoice(this.getValue());
        }
    },
    render() {
        const fragment = createDocFragment();

        const { input = {}, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "text-field", "field--textbox"],
                dataset: {
                    nature: "field",
                    view: "text",
                    id: this.id,
                    disabled: this.disabled,
                    readonly: this.readonly,
                    value: "",
                }
            });

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            if (this.disabled) {
                this.element.classList.add("disabled");
            }

            StyleHandler.call(this.projection, this.element, this.schema.style);
        }

        if (!isHTMLElement(this.input)) {
            const { placeholder = "", type, style } = input;

            this.input = resolveInput.call(this, input);

            if (this.disabled) {
                this.input.disabled = true;
            }

            if (this.focusable) {
                this.input.tabIndex = 0;
            } else {
                this.input.dataset.ignore = "all";
            }

            StyleHandler.call(this, this.input, style);

            if (this.multiline) {
                this.input.classList.add("field--textbox__input--multiline");
            }

            fragment.append(this.input);
        }

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);

            this.bindEvents();
        }

        if (this.source.hasValue()) {
            this.setValue(this.source.getValue());
        }

        this.refresh();

        return this.element;
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
                item.hidden = false;
            }

            return true;
        }

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
    /**
     * Assigns the value of the selected item to the input
     * @param {HTMLElement} item 
     */
    selectChoice(item) {
        if (!isHTMLElement(item)) {
            return;
        }

        const value = getItemValue(item);

        this.setValue(value, true);
        this.input.focus();
        hide(this.choice);

        return this;
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    _spaceHandler(target) {
        const candidates = new Set(this.getCandidates());

        if (candidates.size === 0) {
            this.notify("Enter any text.", NotificationType.INFO);
        } else {
            createChoiceElement.call(this);

            const fragment = createDocFragment();

            candidates.forEach(value => fragment.append(createChoiceItemElement.call(this, value)));

            removeChildren(this.choice).append(fragment);
            this.filterChoice(this.getValue());
            show(this.choice);
        }
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        let exit = true;

        if (this.messageElement && !isHidden(this.messageElement)) {
            hide(this.messageElement);

            exit = false;
        }

        if (this.choice && !isHidden(this.choice)) {
            hide(this.choice);

            exit = false;
        }

        if (exit) {
            let parent = findAncestor(target, (el) => el.tabIndex === 0);
            let element = this.environment.resolveElement(parent);

            element.focus(parent);

            return false;
        }

        this.input.focus();

        return true;
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.selectChoice(item);
        } else if (this.multiline) {
            // TODO
        } else if (target === this.input) {
            this.setValue(this.getValue(), true);
        } else {
            this.focus();
        }

        return true;
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

        if (isHTMLElement(item)) {
            this.selectChoice(item);
        }
    },
    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        if (!isHTMLElement(target)) {
            return false;
        }

        const { parentElement } = target;

        const exit = () => {
            if (this.parent) {
                return this.parent.arrowHandler(dir, this.element);
            }

            return false;
        };

        // gets the parent list item if target is a children
        let item = getItem.call(this, target);

        if (isHTMLElement(item)) {
            let closestItem = getClosest(item, dir, this.choice);

            if (!isHTMLElement(closestItem)) {
                return this.arrowHandler(dir, this.choice);
            }

            closestItem.focus();

            return true;
        }

        if (parentElement !== this.element) {
            return exit();
        }

        let element = null;

        if (dir === "right") {
            if (target === this.input) {
                let isAtEnd = this.getValue().length < getCaretIndex(this.input) + 1;

                if (!isAtEnd) {
                    return false;
                }
            }

            element = getClosest(target, dir, this.element, false);
        } else if (dir === "left") {
            if (target === this.input) {
                let isAtStart = 0 === getCaretIndex(this.input);

                if (!isAtStart) {
                    return false;
                }
            }

            element = getClosest(target, dir, this.element, false);
        } else {
            element = getClosest(target, dir, this.element, false);
        }

        if (!isHTMLElement(element)) {
            return exit();
        }

        if (element === this.choice && this.choice.hasChildNodes()) {
            if (dir === "up") {
                element = getBottomElement(this.choice);
            } else if (dir === "down") {
                element = getTopElement(this.choice);
            } else if (dir === "left") {
                element = getRightElement(this.choice);
            } else if (dir === "right") {
                element = getLeftElement(this.choice);
            }
        }

        element.focus();

        return true;
    },

    bindEvents() {
        this.element.addEventListener('input', (event) => {
            this.refresh();
        });

        this.projection.registerHandler("value.changed", (value) => {
            this.setValue(value);
        });
    },
};


export const TextField = Object.assign(
    Object.create(Field),
    BaseTextField
);