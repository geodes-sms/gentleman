import {
    createDocFragment, createSpan, createDiv, createI, createInput,
    isHTMLElement, removeChildren, isDerivedOf, isEmpty, valOrDefault, createLabel, hasOwn,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "../style-handler.js";
import { ProjectionManager } from "../projection.js";


/**
 * Creates the field element
 * @returns {HTMLElement}
 */
function createFieldElement(id) {
    var element = createDiv({
        id: id,
        class: ["field", "field--checkbox"],
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
        type: "checkbox",
        class: ["field--checkbox__input"],
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
    if (isDerivedOf(object, Concept)) {
        if (object.hasValue()) {
            return object.getValue();
        }
    }

    return false;
}

/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolveLabel() {
    if (hasOwn(this.schema, 'label')) {
        return this.schema.label;
    }

    if (isDerivedOf(this.source, Concept)) {
        return this.source.getAlias();
    }

    return "";
}

const BaseBinaryField = {
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {boolean} */
    checked: false,
    /** @type {string} */
    value: "",
    /** @type {string} */
    label: "",

    init() {
        this.source.register(this);
        this.label = resolveLabel.call(this);

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { before, input, after } = this.schema;

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

        if (before) {
            let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (!isHTMLElement(this.input)) {
            this.input = createFieldInput(this.id);
            this.input.checked = resolveValue(this.source);
            this.checked = this.input.checked;
            this.value = this.input.checked;

            if (this.readonly) {
                this.input.classList.add("readonly");
                this.input.disabled = true;
            }

            const { before, projection, after, style } = valOrDefault(input, {});

            if (this.label) {
                const { style, projection, value } = this.label;

                let labelText = null;
                
                if (projection) {
                    labelText = ProjectionManager.createProjection(this.label.projection, this.source, this.editor).init().render();
                } else {
                    labelText = createSpan({
                        class: ["field--checkbox__label-text"],
                        dataset: {
                            nature: "field-component",
                            view: "binary",
                            id: this.id,
                        }
                    }, value || this.label);
                }

                let labelElement = createLabel({
                    class: ["field--checkbox__label"],
                    dataset: {
                        nature: "field-component",
                        view: "binary",
                        id: this.id,
                    }
                }, [this.input, labelText]);

                StyleHandler(labelElement, style);
                fragment.appendChild(labelElement);
            } else {
                StyleHandler(this.input, style);
                fragment.appendChild(this.input);
            }
        }

        if (after) {
            let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
        }

        this.bindEvents();
        this.refresh();

        return this.element;
    },
    /**
     * Updates the check field on source change
     * @param {string} message
     * @param {*} value 
     */
    update(message, value) {
        switch (message) {
            case "value.changed":
                this.input.checked = value;
                break;
            default:
                console.warn(`The message '${message}' was not handled for check field`);
                break;
        }
        this.refresh();
    },

    focusIn() {
        this.focused = true;
        this.value = this.input.checked;
        this.checked = this.input.checked;
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
    setValue(value) {
        var response = this.source.setValue(value);

        if (!response.success) {
            this.editor.notify(response.message);
            this.errors.push(...response.errors);
        } else {
            this.errors = [];
        }

        this.attached.filter(element => !element.active).forEach(element => element.hide());

        this.input.checked = value;
        this.value = value;
        this.checked = value;

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
        this.setValue(!this.input.checked);
    },
    bindEvents() {
        this.element.addEventListener('change', (event) => {
            this.setValue(this.input.checked);
        });
    },
};


export const BinaryField = Object.assign(
    Object.create(Field),
    BaseBinaryField
);