import { createDocFragment, getTemplate, cloneTemplate, isNode } from "zenkai";
import { StyleHandler } from "../style-handler.js";
import { Static } from "./static.js";


const BaseHTMLStatic = {
    template: null,
    selector: null,
    content: null,

    init() {
        this.selector = this.schema.selector;

        this.template = getTemplate(this.selector);

        return this;
    },

    render() {
        const { style, content } = this.schema;

        if (!isNode(this.element)) {
            this.element = cloneTemplate(this.template);
        }

        // StyleHandler.call(this.projection, this.element, style);

        this.refresh();

        return this.element;
    },

    focusIn() {
        this.focused = true;
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        this.element.classList.remove("active");

        this.refresh();
        this.focused = false;

        return this;
    },
    refresh() {
        return this;
    },
};


export const HTMLStatic = Object.assign(
    Object.create(Static),
    BaseHTMLStatic
);