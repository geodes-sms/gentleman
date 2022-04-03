import {
    createDocFragment, createAnchor, removeChildren, isHTMLElement, htmlToElement,
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
    "url": (url) => `${url}`,
};


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


const BaseLinkStatic = {
    /** @type {string} */
    url: null,
    /** @type {string} */
    urlType: null,
    /** @type {string} */
    href: null,
    /** @type {Function} */
    hrefHandler: null,
    /** @type {*[]} */
    content: null,

    init() {
        const { content = [], urlType = "link" } = this.schema;

        this.content = content;
        this.urlType = urlType;
        this.children = [];
        this.hrefHandler = URLHandler[this.urlType];

        if (!isFunction(this.hrefHandler)) {
            throw new TypeError("type not handled");
        }

        return this;
    },

    render() {
        let bind = false;

        const fragment = createDocFragment();

        const { help, style, url } = this.schema;

        this.href = this.hrefHandler(resolveValue.call(this, url));

        if (!isHTMLElement(this.element)) {
            this.element = createAnchor({
                class: ["static", "link"],
                href: this.href,
                dataset: {
                    nature: "static",
                    static: "link",
                    id: this.id,
                    ignore: "all",
                }
            });

            if(this.urlType === "link") {
                this.element.target = "_blank";
            }

            bind = true;
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
        return this;
    },

    update() {
        const { url } = this.schema;
        this.element.href = this.hrefHandler(resolveValue.call(this, url));

        removeChildren(this.element);

        this.content.forEach(element => {
            this.element.append(ContentHandler.call(this, element, this.projection.concept, { focusable: false }));
        });

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


export const LinkStatic = Object.assign(
    Object.create(Static),
    BaseLinkStatic
);