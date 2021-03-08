import {
    createDocFragment, createSpan, removeChildren, isHTMLElement, valOrDefault, hasOwn, isNullOrWhitespace, isNullOrUndefined, createImage,
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

/**
 * Resolves the URL
 * @param {string} url 
 */
function resolveURL(url) {
    if (url.startsWith("http://")) {
        return new URL(url).href;
    } else if (url.startsWith("https://")) {
        return new URL(url).href;
    }

    return resolveURL(`https://${url}`);
}



const BaseImageStatic = {
    /** @type {string} */
    url: null,
    /** @type {string} */
    alt: null,
    /** @type {number} */
    width: null,
    /** @type {number} */
    height: null,

    init() {
        const { url, width, height, alt } = this.schema;

        this.url = resolveURL(url);
        this.width = width;
        this.height = height;
        this.alt = alt;

        return this;
    },

    render() {
        const { help, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createImage({
                class: ["image"],
                src: this.url,
                alt: this.alt,
                dataset: {
                    ignore: "all",
                }
            });
        }

        if (!(isNullOrUndefined(this.width) || isNaN(this.width))) {
            this.element.width = this.width;
        }

        if (!(isNullOrUndefined(this.height) || isNaN(this.height))) {
            this.element.height = this.height;
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

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
    }
};


export const ImageStatic = Object.assign(
    Object.create(Static),
    BaseImageStatic
);