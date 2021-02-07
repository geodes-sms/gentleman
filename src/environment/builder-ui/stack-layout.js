import {
    createDiv, isHTMLElement, valOrDefault, createInput, createLabel, createDocFragment, getElement,
} from 'zenkai';
import { TextField } from './text-field.js';

var inc = 0;

const nextFieldId = () => `StackLayout${inc++}`;


export const StackLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {Field[]} */
    fields: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {Builder} */
    builder: null,
    /** @type {HTMLElement} */
    placeholder: null,
    /** @type {string} */
    orientation: null,
    /** @type {HTMLElement} */
    orientationElement: null,

    init(args = {}) {
        this.elements = [];
        this.fields = [];
        this.orientation = valOrDefault(args.orientation, "vertical");

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["projection-wrapper", `projection-wrapper--${this.orientation}`],
                dataset: {
                    nature: "layout",
                    type: "stack"
                }
            });
        }

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["layout-header", "layout-header--stack"],
            });
            fragment.append(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["layout-body", "layout-body--stack"],
            });
            fragment.append(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["layout-footer", "layout-footer--stack"],
            });
            fragment.append(this.footer);
        }

        if (!isHTMLElement(this.orientationElement)) {
            let radioVertical = createInput({
                type: "radio",
                name: `${this.id}orientation`,
                value: "vertical",
                dataset: {
                    prop: "orientation"
                }
            });
            let radioHorizontal = createInput({
                type: "radio",
                name: `${this.id}orientation`,
                value: "horizontal",
                dataset: {
                    prop: "orientation"
                }
            });
            this.orientationElement = createDiv({
                class: ["radio-group"]
            }, [
                createLabel({
                    class: ["stack-orientation"]
                }, [radioVertical, "Vertical"]),
                createLabel({
                    class: ["stack-orientation"]
                }, [radioHorizontal, "Horizontal"]),
            ]);

            this.header.append(this.orientationElement);
        }

        this.placeholder = createDiv({
            class: ["projection-placeholder", "drop-area"],
            dataset: {
                nature: "layout-part",
            }
        }, "Add a field or layout");
        this.body.append(this.placeholder);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
            this.bindEvents();
        }


        return this.container;
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        this.body.append(element);

        return this;
    },
    bindEvents() {

        this.placeholder.addEventListener('drop', (event) => {
            const { selector } = this.builder.dragElement.dataset;
            var element = null;
            switch (selector) {
                case 'input':
                    element = Object.create(TextField, { id: { value: nextFieldId() } }).init(this);
                    break;
                case 'stack':
                case 'wrap':
                case 'table':
                    element = this.builder.createLayout(selector);
                    break;
                default:
                    break;
            }

            if (element) {
                this.placeholder.before(element.render());
            }
        });

        this.body.addEventListener('dragenter', (event) => {
            this.placeholder.classList.add("highlight");
            this.placeholder.textContent = "Add a stack layout";
        });
        this.body.addEventListener('dragover', (event) => {
            const { clientY, clientX } = event;
            const { top, right, bottom, left } = this.body.getBoundingClientRect();

            const dragTop = Math.round(clientY - (window.scrollY + top));

            Array.from(this.body.children).forEach(element => {
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

        this.body.addEventListener('dragleave', (event) => {
            this.placeholder.classList.remove("highlight");
            this.placeholder.textContent = "Add a field or layout";
        });

        this.header.addEventListener('change', (event) => {
            const { target } = event;
            const { prop } = target.dataset;

            if (prop === "orientation") {
                this.orientation = target.value;
                this.body.dataset.orientation = this.orientation;
            }
        });
    }
};
