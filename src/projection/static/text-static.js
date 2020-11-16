import {
    createDocFragment, createSpan, createDiv, createI, createInput, createLabel,
    removeChildren, isHTMLElement, valOrDefault, hasOwn,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
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

/**
 * Resolves the value of the placeholder
 * @returns {string}
 */
function resolveLabel() {
    if (hasOwn(this.schema, 'label')) {
        return this.schema.label;
    }

    if (this.source.object === "concept") {
        return this.source.getAlias();
    }

    return "";
}

const BaseTextStatic = {
    /** @type {string} */
    value: "",

    init() {
        this.source.register(this);
        this.label = resolveLabel.call(this);

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;


        if (!isHTMLElement(this.element)) {
            this.element = createSpan({
                class: ["text"],
                title: help,
                dataset: {
                    ignore: "all",
                }
            }, content);

            StyleHandler(this.element, style);
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
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }


        this.element.classList.remove("active");

        this.refresh();
        this.focused = false;

        return this;
    },
    refresh() {
        removeChildren(this.statusElement);
    },

    bindEvents() {
    },
};


export const TextStatic = Object.assign(
    Object.create(Field),
    BaseTextStatic
);