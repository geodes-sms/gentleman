import {
    createDocFragment, createDiv, createSpan, createButton, createTextNode,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, isString, hasOwn, appendChildren,
} from "zenkai";
import { StyleHandler } from './../style-handler.js';
import { contentHandler } from './../content-handler.js';


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

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["layout-container"],
                dataset: {
                    nature: "layout",
                    layout: "stack",
                }
            });
        }

        if (this.collapsible) {
            /** @type {HTMLElement} */
            var btnCollapse = createButton({
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

        if (!Array.isArray(disposition) || isEmpty(disposition)) {
            throw new SyntaxError("Bad disposition");
        }

        for (let i = 0; i < disposition.length; i++) {
            let render = contentHandler.call(this, disposition[i]);

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





// const SymbolResolver = {
//     '#': resolveStructure,
//     '$': resolveReference,
//     '@': resolveScope,
// };

// /**
//  * 
//  * @param {string} value 
//  */
// function parseDisposition(value) {
//     var parts = value.replace(/\s+/g, " ")
//         .replace(/(#\w+(:\w+)?(@\w+)?)/g, " $1 ")
//         .replace(/(\$\w+(:\w+)?(@\w+)?)/g, " $1 ")
//         .split(" ")
//         .filter((x) => !isNullOrWhitespace(x));

//     return parts;
// }

// /**
//  * Resolves a structure in the schema
//  * @param {string} key 
//  * @this {Projection}
//  */
// function resolveStructure(key) {
//     var [name, type = "attribute"] = key.split(":");

//     return StructureHandler[type].call(this.projection, name);
// }

// /**
//  * Resolves a reference in the schema
//  * @param {string} key 
//  * @this {Projection}
//  */
// function resolveReference(key) {
//     var [name, from] = key.split(":");

//     var element = this.getElement(name);

//     const { layout, view } = element;

//     // if (view) {
//     //     return fieldHandler.call(this, element);
//     // } else if (layout) {
//     //     const { type, disposition } = layout;

//     //     return LayoutHandler[type].call(this, layout);
//     // }

//     // return LayoutHandler['text'].call(this, element);
// }

// /**
//  * Resolves a scope in the schema
//  * @param {string} scope 
//  * @this {Projection}
//  */
// function resolveScope(scope) {

// }