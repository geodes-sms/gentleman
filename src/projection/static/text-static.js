import {
    createDocFragment, createSpan, removeChildren, isHTMLElement,
    valOrDefault, hasOwn, isNullOrWhitespace, isNullOrUndefined, htmlToElement,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Static } from "./static.js";



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


const BaseTextStatic = {
    contentType: null,
    init() {
        const { contentType = "text" } = this.schema;

        this.contentType = contentType;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createSpan({
                class: ["text"],
                dataset: {
                    ignore: "all",
                }
            });

            if (this.contentType === "html") {
                this.element.append(htmlToElement(content));
            } else {
                this.element.textContent = content;
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