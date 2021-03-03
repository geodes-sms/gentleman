import {
    createDocFragment, createSpan, createDiv, createI, createInput, createLabel,
    removeChildren, isHTMLElement, valOrDefault,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";


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
        class: ["field-notification"],
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
        class: ["field-status"],
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
        
        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { before = {}, label = {}, input = {}, after = {} } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createFieldElement(this.id);

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler(this.element, this.schema.style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createFieldNotificationElement(this.id);

            fragment.appendChild(this.notification);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createFieldStatusElement(this.id);

            this.notification.appendChild(this.statusElement);
        }


        if (!isHTMLElement(this.input)) {
            const { before, projection, after, style } = input;

            this.input = createFieldInput(this.id);
            this.input.checked = resolveValue(this.source);
            this.value = this.input.checked;

            if (this.readonly) {
                this.input.classList.add("readonly");
                this.input.disabled = true;
            }

            StyleHandler(this.input, style);

            fragment.appendChild(this.input);
        }

        if (!isHTMLElement(this.label)) {
            const { style, projection, value } = label;

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

            if (Array.isArray(projection)) {
                projection.forEach(element => {
                    this.label.append(ContentHandler.call(this, element));
                });
            } else if (projection) {
                this.label.append(ContentHandler.call(this, projection));
            }

            StyleHandler(this.label, style);

            fragment.appendChild(this.label);
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
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
    refresh() {
        const state = valOrDefault(StateHandler.call(this, this.schema, this.schema.state), this.schema);

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        if (state) {
            const { label } = state;

            removeChildren(this.label);

            if (label) {
                const { style, projection, value } = label;

                if (Array.isArray(projection)) {
                    projection.forEach(element => {
                        this.label.append(ContentHandler.call(this, element));
                    });
                } else if (projection) {
                    this.label.append(ContentHandler.call(this, projection));
                }

                StyleHandler(this.label, style);
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
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
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
    },
};


export const BinaryField = Object.assign(
    Object.create(Field),
    BaseBinaryField
);