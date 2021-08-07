import {
    createSpan, removeChildren, isHTMLElement, isNullOrUndefined, findAncestor,
    valOrDefault, htmlToElement
} from "zenkai";
import { hide, show, getCaretIndex } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { Static } from "./static.js";


function resolveValue(content) {
    const { type } = content;

    if (type === "property") {
        this.hasProperty = true;
        return valOrDefault(this.source.getProperty(content.name), "");
    }

    if (type === "param") {
        return this.projection.getParam(content.name);
    }

    if (type === "html") {
        return htmlToElement(content.html);
    }

    if (type === "raw") {
        return htmlToElement(content.raw);
    }

    return content;
}

const BaseTextStatic = {
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,
    /** @type {boolean} */
    hasProperty: false,
    /** @type {boolean} */
    asHTML: false,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { content, editable = false, focusable = false } = this.schema;

        this.children = [];
        this._content = content;
        this.editable = editable;
        this.focusable = focusable;

        return this;
    },

    render() {
        let bind = false;
        const { content, help, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createSpan({
                class: ["text", "static", "text-static"],
                editable: this.editable,
                dataset: {
                    nature: "static",
                    view: "text",
                    static: "text",
                    id: this.id,
                    ignore: "all",
                }
            });

            if (this.focusable) {
                this.element.tabIndex = 0;
            }

            if (Array.isArray(content)) {
                content.forEach(c => {
                    let value = resolveValue.call(this, c);
                    let cElement = createSpan({
                        class: ["text", "static", "text-static"],
                        dataset: {
                            nature: "static-component",
                            view: "text",
                            static: "text",
                            content: value,
                            id: this.id,
                            ignore: "all",
                        }
                    }, value);

                    StyleHandler.call(this.projection, cElement, c.style);

                    this.element.append(cElement);
                });
            } else {
                let value = resolveValue.call(this, content);
                this.element.append(value);
                this.element.content = value;
            }

            bind = true;
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

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
        const { content } = this.schema;

        removeChildren(this.element);

        if (Array.isArray(content)) {
            content.forEach(c => {
                this.element.append(
                    createSpan({
                        class: ["text", "static", "text-static"],
                        dataset: {
                            nature: "static-component",
                            view: "text",
                            static: "text",
                            id: this.id,
                            ignore: "all",
                        }
                    }, resolveValue.call(this, c)));
            });
        } else {
            this.element.append(resolveValue.call(this, content));
        }

        return this;
    },
    refresh() {
        return this;
    },

    bindEvents() {
        if (this.hasProperty) {
            this.projection.registerHandler("value.changed", (value) => {
                this.update();
            });
            this.projection.registerHandler("value.added", (value) => {
                this.update();
            });
            this.projection.registerHandler("value.removed", (value) => {
                this.update();
            });
        }
    },
};

export const TextStatic = Object.assign(
    Object.create(Static),
    BaseTextStatic
);
