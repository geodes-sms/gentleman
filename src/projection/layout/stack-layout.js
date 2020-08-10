import {
    createDocFragment, createDiv, createButton, createTextNode,
    isHTMLElement, isEmpty, valOrDefault, isString, hasOwn
} from "zenkai";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';


export const StackLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {string} */
    orientation: null,

    init() {
        this.orientation = valOrDefault(this.schema.orientation, "horizontal");
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
                tabindex: -1,
                dataset: {
                    nature: "layout",
                    layout: "stack",
                }
            });
        }

        if (this.collapsible) {
            /** @type {HTMLElement} */
            const btnCollapse = createButton({
                class: ["btn", "btn-collapse"],
                dataset: {
                    "action": "collapse",
                    "status": "off",
                }
            });

            btnCollapse.addEventListener('click', (event) => {
                if (btnCollapse.dataset.status === "off") {
                    let children = Array.from(this.container.children).filter(element => element !== btnCollapse);
                    this.collapseContainer = createDiv({
                        class: "layout-container-collapse"
                    }, children);
                    btnCollapse.after(this.collapseContainer);
                    this.container.classList.add("collapsed");
                    btnCollapse.classList.add("on");
                    btnCollapse.dataset.status = "on";
                }
                else {
                    let fragment = createDocFragment(Array.from(this.collapseContainer.children));
                    btnCollapse.after(fragment);
                    this.collapseContainer.remove();
                    this.container.classList.remove("collapsed");
                    btnCollapse.classList.remove("on");
                    btnCollapse.dataset.status = "off";  
                }
            });

            fragment.appendChild(btnCollapse);
        }

        for (let i = 0; i < disposition.length; i++) {
            let render = ContentHandler.call(this, disposition[i]);

            fragment.appendChild(render);
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        this.container.style.display = "flex";
        this.container.style.alignItems = "flex-start";

        this.refresh();

        return this.container;
    },
    refresh() {
        if (this.orientation === "vertical") {
            this.container.style.flexDirection = "column";
        }
        if (this.orientation === "horizontal") {
            this.container.style.flexDirection = "row";
        }

        return this;
    },
    bindEvents() {

    }
};

