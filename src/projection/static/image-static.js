import {
    removeChildren, isHTMLElement, valOrDefault, htmlToElement, isNullOrWhitespace,
    isNullOrUndefined, createImage,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { Static } from "./static.js";


function resolveParam(tpl, name) {
    let param = tpl.param.find(p => p.name === name);
    
    if (isNullOrUndefined(param)) {
        return undefined;
    }

    const { type = "string", value } = param;

    let pValue = valOrDefault(value, param.default);

    if (isNullOrUndefined(pValue)) {
        return null;
    }

    if (type === "string") {
        return pValue.toString();
    }

    if (type === "number") {
        return +pValue;
    }
}

function resolveValue(content) {
    if (isNullOrUndefined(content)) {
        return "";
    }

    const { type } = content;

    if (type === "property") {
        this.hasProperty = true;
        return valOrDefault(this.source.getProperty(content.name), "");
    }

    if (type === "param") {
        return resolveParam.call(this, this.schema.template, content.name);
    }

    if (type === "raw") {
        return htmlToElement(content.raw);
    }

    return content;
}

/**
 * Resolves the URL
 * @param {string} url 
 */
function resolveURL(url) {
    if (isNullOrWhitespace(url)) {
        return "";
    }

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

        this.width = width;
        this.height = height;
        this.alt = alt;

        return this;
    },

    render() {
        let bind = false;
        const { help, style, url } = this.schema;
        this.url = resolveURL(resolveValue.call(this, url));

        if (!isHTMLElement(this.element)) {
            this.element = createImage({
                class: ["static", "image-static"],
                src: this.url,
                alt: this.alt,
                dataset: {
                    nature: "static",
                    static: "image",
                    id: this.id,
                    ignore: "all",
                }
            });

            bind = true;
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
    refresh() {
        if (isNullOrWhitespace(this.url)) {
            this.element.classList.add("empty");
        } else {
            this.element.classList.remove("empty");
        }

        return this;
    },
    update() {
        const { url } = this.schema;
        this.url = resolveURL(resolveValue.call(this, url));
        this.element.src = this.url;

        this.refresh();

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


export const ImageStatic = Object.assign(
    Object.create(Static),
    BaseImageStatic
);