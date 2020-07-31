import {
    createDocFragment, createDiv, createSpan, createButton, isHTMLElement,
    isEmpty, valOrDefault, isString, hasOwn, createTextNode,
} from "zenkai";
import { StyleHandler } from './../style-handler.js';
import { contentHandler } from './../content-handler.js';


export const WrapLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,

    init() {
        this.collapsible = valOrDefault(this.schema.collapsible, false);

        return this;
    },

    render() {
        const { disposition, style } = this.schema;

        if (!Array.isArray(disposition) || isEmpty(disposition)) {
            throw new SyntaxError("Bad disposition");
        }

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["layout-container"],
                dataset: {
                    nature: "layout",
                    layout: "wrap",
                }
            });
        }

        if (this.collapsible) {
            /** @type {HTMLElement} */
            var btnCollapse = createButton({
                class: ["btn", "btn-collapse"],
                dataset: {
                    "action": "collapse"
                }
            });

            btnCollapse.addEventListener('click', (event) => {
                if (this.container.classList.contains("collapsed")) {
                    this.container.classList.remove("collapsed");
                    btnCollapse.classList.remove("on");
                    setTimeout(() => {
                        this.body.style.removeProperty("height");
                    }, 200);
                } else {
                    this.container.style.height = `${this.body.offsetHeight}px`;
                    btnCollapse.classList.add("on");
                    setTimeout(() => {
                        this.container.classList.add("collapsed");
                    }, 20);
                }
            });

            fragment.appendChild(btnCollapse);
        }

        for (let i = 0; i < disposition.length; i++) {
            let render = contentHandler.call(this, disposition[i]);

            fragment.appendChild(render);
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
        }

        this.container.style.display = "inline-block";

        this.bindEvents();
        this.refresh();

        return this.container;
    },
    refresh() {

        return this;
    },
    bindEvents() {

    }
};