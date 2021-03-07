import {
    createDocFragment, createSpan, removeChildren, isHTMLElement, isNullOrUndefined,
    htmlToElement, findAncestor, valOrDefault,
} from "zenkai";
import { hide, show, getCaretIndex } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { Static } from "./static.js";


function resolveValue(content) {
    const { type, name } = content;

    if (type === "property") {
        return this.projection.concept.getProperty(name);
    }

    if (type === "param") {
        return this.projection.getParam(name);
    }

    return content;
}

const BaseTextStatic = {
    /** @type {string} */
    contentType: null,
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { contentType = "text", editable = false, focusable = valOrDefault(this.parent.schema.focusable, true) } = this.schema;

        this.contentType = contentType;
        this.editable = editable;
        this.focusable = focusable;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createSpan({
                class: ["text"],
                editable: this.editable,
                dataset: {
                    nature: "static",
                    view: "text",
                    id: this.id,
                    ignore: "all",
                }
            });

            if (this.focusable) {
                this.element.tabIndex = 0;
            }

            let value = resolveValue.call(this, content);

            if (this.contentType === "html") {
                this.element.append(htmlToElement(value));
            } else {
                this.element.textContent = value.trim();
            }
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler(this.element, style);

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
    getLength() {
        return this.element.textContent.length;
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        return this.arrowHandler("left", target);
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

        if (dir === "right") {
            let isAtEnd = this.getLength() < getCaretIndex(this.element) + 1;

            if (isAtEnd && this.parent) {
                return this.parent.arrowHandler(dir, target);
            }
        } else if (dir === "left") {
            let isAtStart = 0 === getCaretIndex(this.element);

            if (isAtStart && this.parent) {
                return this.parent.arrowHandler(dir, target);
            }
        } else if (this.parent) {
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
        let element = this.projection.resolveElement(parent);

        element.focus(parent);
    },

    refresh() {
        return this;
    },

    bindEvents() {
    },
};

export const TextStatic = Object.assign(
    Object.create(Static),
    BaseTextStatic
);