import {
    createDocFragment, createButton, createSpan, removeChildren, isHTMLElement,
    isNullOrUndefined, hasOwn, findAncestor, valOrDefault, isFunction,
} from "zenkai";
import { hide, show, getCaretIndex } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "../content-handler.js";
import { Static } from "./static.js";


const BaseButtonStatic = {
    /** @type {string} */
    contentType: null,
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,
    /** @type {boolean} */
    disabled: null,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { focusable = true, disabled = false } = this.schema;

        this.children = [];
        this.focusable = focusable;
        this.disabled = disabled;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createButton({
                class: ["btn", "static"],
                dataset: {
                    nature: "static",
                    view: "button",
                    static: "button",
                    id: this.id,
                    ignore: "all",
                }
            });

            if (this.focusable) {
                this.element.tabIndex = 0;
            }
        }

        content.forEach(element => {
            let content = ContentHandler.call(this, element, this.projection.concept, { focusable: false });

            fragment.append(content);
        });

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
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
        const index = this.projection.schema.findIndex((x) => x.tags.includes(this.schema.tag));

        this.projection.changeView(index);

        return false;
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        let concept = this.source;

        if (this.schema.bind) {
            concept = this.source.getValue(true);
        }

        if (this.schema.action) {
            const { type, value } = this.schema.action;

            concept.createElement();

            return false;
        }

        if(!isNullOrUndefined(this.visualizer)){
            this.environment.triggerEvent({ name: this.schema.trigger, args: [this.visualizer]});
            return false;
        }

        this.environment.triggerEvent({ name: this.schema.trigger, args: [concept] });


        return false;
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