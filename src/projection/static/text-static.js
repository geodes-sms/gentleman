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
        return this.source.getProperty(name);
    }

    if (type === "param") {
        return this.projection.getParam(name);
    }

    return content;
}

const BaseTextStatic = {
    /** @type {string} */
    contentType: null,
    /** @type {string} */
    contentValue: null,
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { contentType = "raw", content, editable = false, focusable = valOrDefault(this.parent.schema.focusable, true) } = this.schema;

        this.contentType = contentType;
        this.contentValue = resolveValue.call(this, content);
        this.editable = editable;
        this.focusable = focusable;

        return this;
    },

    render() {
        let bind = false;
        const { help, style } = this.schema;

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

            if (this.contentType === "html") {
                this.element.append(htmlToElement(this.contentValue));
            } else if (this.contentType === "property" && this.source.hasProperty(this.contentValue)) {
                this.element.textContent = this.source.getProperty(this.contentValue);
            } else if (this.contentType === "attribute" && this.source.hasAttribute(this.contentValue)) {
                this.element.textContent = this.source.getAttribute(this.contentValue).getValue().toString();
            } else {
                this.element.textContent = this.contentValue.trim();
            }

            bind = true;
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this, this.element, style);

        if (bind) {
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

    update() {
        if (this.contentType === "property") {
            this.element.textContent = this.source.getProperty(this.contentValue);
        } else if (this.contentType === "attribute") {
            this.element.textContent = this.source.getAttribute(this.contentValue).getValue().toString();
        }

        return this;
    },
    refresh() {
        return this;
    },

    bindEvents() {
        this.projection.registerHandler("value.changed", (value) => {
            this.update();
        });

        if (this.contentType === "attribute") {
            if (this.source.hasAttribute(this.contentValue)) {
                this.source.getAttribute(this.contentValue).target.register(this);
                this.update();
            }
            this.projection.registerHandler("attribute.added", (attr) => {
                if (attr === this.contentValue) {
                    attr.target.register(this);
                }
            });

            this.projection.registerHandler("attribute.removed", (attr) => {
                if (attr === this.contentValue) {
                    this.element.textContent = "";
                }
            });
        }
    },
};

export const TextStatic = Object.assign(
    Object.create(Static),
    BaseTextStatic
);
