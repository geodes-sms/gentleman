import {
    createTable, createTableRow, createTableCell, createDocFragment, createDiv,
    isHTMLElement,
} from 'zenkai';
import { TextField } from './text-field.js';

var inc = 0;

const nextFieldId = () => `StackLayout${inc++}`;
var dragElement = null;


export const TableLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    table: null,
    /** @type {HTMLElement} */
    tableHeader: null,
    /** @type {HTMLElement} */
    tableBody: null,
    /** @type {HTMLElement} */
    tableFooter: null,
    /** @type {Field[]} */
    fields: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {HTMLElement} */
    placeholder: null,
    /** @type {Builder} */
    builder: null,

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
                    type: "table"
                }
            });
        }

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["layout-header", "layout-header--table"],
            });
            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["layout-body", "layout-body--table"],
            });
            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["layout-footer", "layout-footer--table"],
            });
            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.table)) {
            this.table = createTable({
                id: this.id,
                class: ["field", "field--table"],
                dataset: {
                    type: "set",
                    nature: "field",
                }
            });

            this.placeholder = createDiv({
                class: ["projection-placeholder", "drop-area"],
                dataset: {
                    nature: "layout-part",
                }
            }, "Add a field or layout");

            this.table.appendChild(createTableRow({}, [
                createTableCell({}, this.placeholder)
            ]));
            this.table.appendChild(createTableRow({}, [
                createTableCell({}, "lorem ipsum"),
                createTableCell({}, "lorem ipsum")
            ]));
            this.table.appendChild(createTableRow({}, [
                createTableCell({}, "lorem ipsum")
            ]));

            fragment.appendChild(this.table);
        }

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }


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
