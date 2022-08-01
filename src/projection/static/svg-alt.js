import {
    createDocFragment, createButton, createSpan, removeChildren, isHTMLElement,
    isNullOrUndefined, hasOwn, findAncestor, valOrDefault, isFunction,
} from "zenkai";
import { hide, show, getCaretIndex } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "../content-handler.js";
import { Static } from "./static.js";


// TODO: Change to projection window
const BaseSVGAlt = {
    /** @type {boolean} */
    editable: null,
    /** @type {boolean} */
    focusable: null,

    init(args = {}) {
        Object.assign(this.schema, args);

        const { focusable = true } = this.schema;

        this.focusable = focusable;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content, external = true, tag } = this.schema;

        const parser = new DOMParser();

        if (!isHTMLElement(this.element)) {
            this.element = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            
            this.element.classList.add(["btn", "static"]);
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-alt";
            this.element.dataset.id = this.id;
            this.element.dataset.ignore = "all" 

            if (this.focusable) {
                this.element.tabIndex = 0;
            }
        }


        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        this.refresh();

        this.bindEvents();

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
    },
    refresh() {
        return this;
    },

    bindEvents() {

        this.element.addEventListener("click", () => {

            let concept = this.source;
            let projection = this.environment.createProjection(concept, this.schema.tag);
    
            let window = this.environment.findWindow("side-instance");
            if (isNullOrUndefined(window)) {
                window = this.environment.createWindow("side-instance");
                window.container.classList.add("model-projection-sideview");
            }
    
            if (window.instances.size > 0) {
                let instance = Array.from(window.instances)[0];
                instance.delete();
            }
    
            let instance = this.environment.createInstance(concept, projection, {
                type: "projection",
                close: "DELETE-PROJECTION"
            });
    
            window.addInstance(instance);
        })
    },
};

export const SVGAlt = Object.assign(
    Object.create(Static),
    BaseSVGAlt
);