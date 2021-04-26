import {
    createDocFragment, createAnchor, removeChildren, isHTMLElement,
    valOrDefault, isNullOrUndefined, isFunction, isEmpty, isNullOrWhitespace,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Static } from "./static.js";


const URLHandler = {
    "email": (url) => `mailto:${url}`,
    "phone": (url) => `tel:${url}`,
    "link": (url) => `${url}`,
};

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


const BaseLinkStatic = {
    /** @type {string} */
    url: null,
    /** @type {string} */
    urlType: null,
    /** @type {string} */
    href: null,
    /** @type {*[]} */
    content: null,

    init() {
        const { url, content = [], urlType = "link" } = this.schema;

        this.url = resolveURL(url);
        this.content = content;
        this.urlType = urlType;

        const hrefHandler = URLHandler[this.urlType];
        if (!isFunction(hrefHandler)) {
            throw new TypeError("type not handled");
        }

        this.href = hrefHandler(this.url);

        return this;
    },

    render() {
        if (isNullOrWhitespace(this.url)) {
            throw new Error("There is no URL defined for this link");
        }

        if (isEmpty(this.content)) {
            throw new Error("There is no content defined for this link");
        }

        const fragment = createDocFragment();

        const { help, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createAnchor({
                class: ["static", "link"],
                href: this.href,
                target: "_blank",
                dataset: {
                    nature: "static",
                    static: "link",
                    id: this.id,
                    ignore: "all",
                }
            });
        }

        this.content.forEach(element => {
            let content = ContentHandler.call(this, element, this.projection.concept, { focusable: false });

            fragment.append(content);
        });

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
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
};


export const LinkStatic = Object.assign(
    Object.create(Static),
    BaseLinkStatic
);