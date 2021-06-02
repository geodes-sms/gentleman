import {
    createDocFragment, createDiv, createI, createInput, createLabel,
    removeChildren, findAncestor, isHTMLElement, valOrDefault,
} from "zenkai";
import { hide, isHidden, NotificationType } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";
import { createNotificationMessage } from "./notification.js";


/**
 * Creates the field element
 * @returns {HTMLElement}
 */
function createFieldElement(id) {
    var element = createDiv({
        id: id,
        class: ["field", "field--binary"],
        tabindex: -1,
        dataset: {
            nature: "field",
            view: "binary",
            id: id,
        }
    });

    return element;
}

/**
 * Creates the field notification element
 * @returns {HTMLElement}
 */
function createFieldNotificationElement(id) {
    var element = createDiv({
        class: ["field-notification", "hidden"],
        dataset: {
            nature: "field-component",
            view: "binary",
            id: id,
        }
    });

    return element;
}

/**
 * Creates the field status element
 * @returns {HTMLElement}
 */
function createFieldStatusElement(id) {
    var element = createI({
        class: ["field-status", "hidden"],
        dataset: {
            nature: "field-component",
            view: "binary",
            id: id,
        }
    });

    return element;
}

/**
 * Creates the field input
 * @returns {HTMLElement}
 */
function createFieldInput(id) {
    /** @type {HTMLElement} */
    var input = createInput({
        id: `checkbox${id}`,
        type: "checkbox",
        class: ["field--binary__input"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            view: "binary",
            id: id,
        }
    });

    return input;
}


/**
 * Resolves the value of the input
 * @param {*} object 
 */
function resolveValue(object) {
    if (object.object === "concept") {
        if (object.hasValue()) {
            return object.getValue();
        }
    }

    return false;
}


const BaseBinaryField = {
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {HTMLLabelElement} */
    label: null,
    /** @type {string} */
    value: "",
    /** @type {*} */
    state: null,

    init() {
        const { focusable = true } = this.schema;

        this.focusable = focusable;
        this.children = [];

        return this;
    },


    refresh() {
        const state = valOrDefault(StateHandler.call(this, this.schema, this.schema.state), this.schema);

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        if (this.schema.state) {
            let state = this.schema.state[this.getValue().toString()];

            if (state && state.content) {
                const { style, content, value } = state;

                let fragment = createDocFragment();
                content.forEach(element => {
                    fragment.append(ContentHandler.call(this, element));
                });

                removeChildren(this.label).append(fragment);

                StyleHandler.call(this.projection, this.label, style);
            }
        }

        if (this.input.checked) {
            this.element.dataset.state = "on";
        } else {
            this.element.dataset.state = "off";
        }

        removeChildren(this.statusElement);
        if (this.hasError) {
            this.element.classList.add("error");
            this.input.classList.add("error");
            this.statusElement.classList.add("error");
            this.statusElement.append(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },
    render() {
        const fragment = createDocFragment();

        const { checkbox } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createFieldElement(this.id);

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler.call(this.projection, this.element, this.schema.style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createFieldNotificationElement(this.id);

            fragment.append(this.notification);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createFieldStatusElement(this.id);

            this.notification.append(this.statusElement);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createFieldInput(this.id);
            this.input.checked = resolveValue(this.source);
            this.value = this.input.checked;

            if (this.readonly) {
                this.input.classList.add("readonly");
                this.input.disabled = true;
            }

            if (checkbox) {
                const { style } = checkbox;
                StyleHandler.call(this.projection, this.input, style);
            } else {
                hide(this.input);
            }

            fragment.append(this.input);
        }

        if (!isHTMLElement(this.label)) {
            this.label = createLabel({
                class: ["field--checkbox__label"],
                for: this.input.id,
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    view: "binary",
                    id: this.id,
                }
            });
            this.label.htmlFor = this.input.id;

            if (checkbox && checkbox.label) {
                this.label.textContent = checkbox.label;
            }

            fragment.append(this.label);
        }

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
    },


    focusIn() {
        this.focused = true;
        this.value = this.input.checked;
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.hasChanges()) {
            this.setValue(this.input.checked);
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

        this.refresh();
        this.focused = false;

        return this;
    },
    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return this.value !== this.input.checked;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return this.input.checked;
    },
    /**
     * Gets the input value
     * @returns {boolean}
     */
    getValue() {
        return this.input.checked;
    },
    setValue(value, update = false) {
        var response = null;

        if (update) {
            response = this.source.setValue(value);
        } else {
            response = {
                success: true
            };
        }

        this.errors = [];
        if (!response.success) {
            this.environment.notify(response.message, "error");
            this.errors.push(...response.errors);
        }

        this.input.checked = value;
        this.value = value;

        this.refresh();
    },
    getCandidates() {
        return this.source.getCandidates();
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

        if (exit) {
            let parent = findAncestor(target, (el) => el.tabIndex === 0);
            let element = this.environment.resolveElement(parent);

            element.focus(parent);

            return true;
        }
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        return this.arrowHandler("left", target);
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        this.setValue(!this.input.checked, true);
    },
    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        if (this.parent) {
            return this.parent.arrowHandler(dir, this.element);
        }

        return false;
    },

    bindEvents() {
        this.element.addEventListener('change', (event) => {
            this.setValue(this.getValue(), true);
        });

        this.projection.registerHandler("value.changed", (value) => {
            this.setValue(value);
        });
    },
};


export const BinaryField = Object.assign(
    Object.create(Field),
    BaseBinaryField
);