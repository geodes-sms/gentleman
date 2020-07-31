import {
    createDocFragment, createTable, createTableHeader, createTableBody, createTableRow,
    createTableCell, createTableHeaderCell, createSpan, createDiv, createI, createButton,
    removeChildren, isHTMLElement, isDerivedOf, isEmpty, valOrDefault, hasOwn, isString,
} from "zenkai";
import { hide, show, shake } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "./../style-handler.js";
import { ProjectionManager } from "./../projection.js";
import { contentHandler } from "./../content-handler.js";


const addSchema = [{
    "layout": {
        "type": "wrap",
        "style": {
            "box": {
                "space": {
                    "inner": 5
                }
            }
        },
        "disposition": ["ADD"]
    }
}];

const removeSchema = [{
    "layout": {
        "type": "wrap",
        "style": {
            "box": {
                "space": {
                    "inner": 5
                }
            }
        },
        "disposition": ["REMOVE"]
    }
}];


const NotificationType = {
    INFO: "info",
    ERROR: "error"
};

/**
 * Creates a notification message
 * @param {string} type 
 * @param {string} message 
 * @returns {HTMLElement}
 */
function createNotificationMessage(type, message) {
    var element = createSpan({ class: ["notification-message", `notification-message--${type}`] }, message);

    if (Array.isArray(message)) {
        element.style.minWidth = `${Math.min(message[0].length * 0.5, 30)}em`;
    } else {
        element.style.minWidth = `${Math.min(message.length * 0.5, 30)}em`;
    }

    return element;
}


const BaseTableField = {
    /** @type {HTMLTableElement} */
    table: null,
    /** @type {HTMLTableSectionElement} */
    header: null,
    /** @type {HTMLTableSectionElement} */
    body: null,
    /** @type {HTMLTableSectionElement} */
    footer: null,
    /** @type {string}  */
    caption: null,

    init() {
        this.source.register(this);
        this.caption = this.schema.caption;
        this.template = this.source.getCandidates().projection
            .filter(p => p.type === "template" && p.template === "table")[0];

        return this;
    },

    update(message, value) {
        switch (message) {
            case "value.added":
                this.addRow(value);

                break;
            default:
                console.warn(`The message '${message}' was not handled for table field`);
                break;
        }
    },

    render() {
        const { before = {}, table = {}, header, footer, after = {} } = this.template;

        const fragment = createDocFragment();

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                class: ["field", "field--table"],
                id: this.id,
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "table",
                    id: this.id,
                }
            });

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler(this.element, this.schema.style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification"],
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            });
            fragment.appendChild(this.notification);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createI({
                class: ["field-status"],
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            });
            this.notification.appendChild(this.statusElement);
        }

        if (before.projection) {
            let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (!isHTMLElement(this.table)) {
            this.table = createTable({
                class: ["field--table__table"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                    caption: this.caption
                }
            });

            fragment.appendChild(this.table);
        }

        if (Array.isArray(header)) {
            this.header = createTableHeader({
                class: ["field--table-header"],
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            });

            let row = createTableRow({
                class: ["field--table-header-row"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            });

            header.forEach(value => {
                var { style, content } = value;

                var render = contentHandler.call(this, content);

                var cell = createTableHeaderCell({
                    class: ["field--table-header-cell"],
                    tabindex: -1,
                    dataset: {
                        nature: "field-component",
                        view: "table",
                        id: this.id,
                    }
                }, render);

                row.appendChild(cell);
            });

            this.header.appendChild(row);
            this.table.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createTableBody({
                class: ["field--table-body"],
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            });

            this.table.appendChild(this.body);
        }

        if (this.source.hasValue()) {
            this.source.getValue().forEach(concept => {
                this.addRow(concept);
            });
        }

        if (after.projection) {
            let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
        }

        this.bindEvents();
        this.refresh();

        return this.element;
    },
    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return false;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return this.table.rows.length > 0;
    },
    /**
     * Gets the input value
     * @returns {*[]}
     */
    getValue() {
        return this.table.rows;
    },

    focusIn() {
        this.focused = true;
        this.value = this.input.textContent;
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.hasChanges()) {
            this.setValue(this.input.textContent);
        }

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
        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        removeChildren(this.statusElement);
        if (this.hasError) {
            this.element.classList.add("error");
            this.statusElement.classList.add("error");
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },
    createElement() {
        return this.source.createElement();
    },
    addRow(concept) {
        const { body } = this.template;

        var row = createTableRow({
            class: ["field--table-row"],
            tabindex: -1,
            dataset: {
                nature: "field-component",
                view: "table",
                id: this.id,
            }
        });

        body.forEach(schema => {
            const { style, content } = schema;

            var render = contentHandler.call(this, content, concept);

            var cell = createTableHeaderCell({
                class: ["field--table-cell"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            }, render);

            StyleHandler(cell, style);

            row.appendChild(cell);
        });

        // var projection = ProjectionManager.createProjection(addSchema, concept, this.editor).init();

        // var addContainer = createTableCell({
        //     class: ["field--table-cell"],
        //     tabindex: -1,
        // }, [projection.render()]);

        // addContainer.addEventListener('click', () => {
        //     var element = this.createElement();
        //     if (!element) {
        //         this.editor("Element could not be created");
        //     }
        // });

        // row.appendChild(addContainer);

        // projection = ProjectionManager.createProjection(removeSchema, concept, this.editor).init();

        // var removeContainer = createTableCell({
        //     class: ["field--table-cell"],
        //     tabindex: -1,
        // }, [projection.render()]);

        // removeContainer.addEventListener('click', () => {
        //     removeChildren(row);
        //     row.remove();
        // });

        // row.appendChild(removeContainer);

        this.body.appendChild(row);
    },
    removeElement(element) {
        return this.source.removeElement(element);
    },
    delete(target) {
        if (target === this.element || target === this.table) {
            this.source.delete();

            return;
        }

        const { index } = target.dataset;

        var result = this.source.removeElementAt(+index);

        if (result) {
            this.editor.notify("The element was successfully deleted");
        } else {
            this.editor.notify("This element cannot be deleted");
            shake(target);
        }
    },
    bindEvents() {
        var lastKey = -1;

    }
};


export const TableField = Object.assign(
    Object.create(Field),
    BaseTableField
);