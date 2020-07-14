import {
    createDiv, isHTMLElement, createDocFragment, createInput, createLabel,
} from 'zenkai';
import { TextField } from './text-field.js';

var inc = 0;

const nextFieldId = () => `StackLayout${inc++}`;
var dragElement = null;


export const WrapLayout = {
    /** @type {HTMLElement} */
    container: null,
    fields: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {HTMLElement} */
    placeholder: null,

    init(args = {}) {
        this.elements = [];
        this.fields = [];

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["projection-wrapper"],
                dataset: {
                    nature: "layout",
                    type: "wrap"
                }
            });
        }

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["layout-header", "layout-header--wrap"],
            });
            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["layout-body", "layout-body--wrap"],
            });
            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["layout-footer", "layout-footer--wrap"],
            });
            fragment.appendChild(this.footer);
        }


        this.placeholder = createDiv({
            class: ["projection-placeholder", "drop-area"],
            dataset: {
                nature: "layout-part",
            }
        }, "Add a field or layout");
        this.body.appendChild(this.placeholder);

        if (fragment.hasChildNodes) {
            this.container.appendChild(fragment);
        }

        this.bindEvents();

        return this.container;
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        this.container.appendChild(element);

        return this;
    },
    bindEvents() {

        this.placeholder.addEventListener('drop', (event) => {
            const { selector } = dragElement.dataset;
            var element = null;
            switch (selector) {
                case 'input':
                    element = Object.create(TextField, { id: { value: nextFieldId() } }).init(this);
                    break;
                default:
                    break;
            }

            if (element) {
                this.placeholder.before(element.render());
            }
        });

        this.container.addEventListener('dragenter', (event) => {
            this.placeholder.classList.add("highlight");
            this.placeholder.textContent = "Add a stack layout";
        });
        this.container.addEventListener('dragover', (event) => {
            const { clientY, clientX } = event;
            const { top, right, bottom, left } = this.container.getBoundingClientRect();

            const dragTop = Math.round(clientY - (window.scrollY + top));

            Array.from(this.container.children).forEach(element => {
                const { offsetTop, clientHeight } = element;

                if (offsetTop < dragTop && clientHeight + offsetTop > dragTop) {

                    if (offsetTop + clientHeight / 2 > dragTop) {
                        element.before(this.placeholder);
                    } else {
                        element.after(this.placeholder);
                    }
                }
            });

            event.preventDefault();
        });

        this.container.addEventListener('dragleave', (event) => {
            this.placeholder.classList.remove("highlight");
            this.placeholder.textContent = "Add a field or layout";
        });
    }
};
