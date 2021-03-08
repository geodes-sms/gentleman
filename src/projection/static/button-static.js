import {
    createDocFragment, createButton, createSpan, removeChildren, isHTMLElement,
    isNullOrUndefined, hasOwn, findAncestor, valOrDefault, isFunction,
} from "zenkai";
import { hide, show, getCaretIndex } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Static } from "./static.js";


// TODO: Change to projection window
const BaseButtonStatic = {
    /** @type {string} */
    contentType: null,
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { focusable = true } = this.schema;

        this.focusable = focusable;

        if (!hasOwn(this.schema, "action")) {
            this.schema.action = {};
        }

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createButton({
                class: ["btn"],
                dataset: {
                    nature: "static",
                    view: "button",
                    id: this.id
                }
            }, ContentHandler.call(this, content, this.projection.concept, { focusable: false }));

            if (this.focusable) {
                this.element.tabIndex = 0;
            }
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

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

    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        if (!this.editable) {
            if (this.parent) {
                return this.parent.arrowHandler(dir, target);
            }
        }
        
        if (this.parent) {
            return this.parent.arrowHandler(dir, target);
        }

        return false;
    },

    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.environment.resolveElement(parent);

        element.focus(parent);
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const { name, arg } = this.schema.action;

        const handler = this.projection[name];

        if (isFunction(handler)) {
            handler.call(this.projection, ...arg);

            return false;
        }
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        const { name, arg } = this.schema.action;

        const handler = this.projection[name];

        if (isFunction(handler)) {
            handler.call(this.projection, ...arg);

            return false;
        }
    },
    refresh() {
        return this;
    },

    bindEvents() {
    },
};

export const ButtonStatic = Object.assign(
    Object.create(Static),
    BaseButtonStatic
);