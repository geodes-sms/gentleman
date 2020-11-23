import {
    createDocFragment, createTable, createTableHeader, createTableBody, createTableRow,
    createTableCell, createTableHeaderCell, createSpan, createDiv, createI, createButton,
    removeChildren, isHTMLElement, valOrDefault, findAncestor,
} from "zenkai";
import { hide, show, shake } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";


var inc = 0;
const nextRowId = () => `row${inc++}`;
const nextCellId = () => `cell${inc++}`;

const actionDefaultSchema = {
    add: {
        projection: {
            "type": "text",
            "content": "Add"
        }
    },
    remove: {
        projection: {
            "type": "text",
            "content": "Remove"
        }
    }
};


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

function resolveFieldComponent(element) {
    const FIELD_COMPONENT = "field-component";

    if (element.dataset.nature === FIELD_COMPONENT) {
        return element;
    }

    return findAncestor(element, (el) => el.dataset.nature === FIELD_COMPONENT);
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
    /** @type {Map} */
    elements: null,

    init() {
        this.source.register(this);
        this.caption = this.schema.caption;
        this.elements = new Map();

        const { concept, name } = this.schema.template;
        this.template = this.model.getModelProjectionTemplate(concept, name, "table").projection;

        return this;
    },

    update(message, value) {
        switch (message) {
            case "value.added":
                this.addRow(value);

                break;
            case "value.removed":
                this.removeRow(value);

                break;
            default:
                console.warn(`The message '${message}' was not handled for table field`);
                break;
        }

        this.refresh();
    },

    render() {
        const { action = {}, before = {}, after = {} } = this.schema;
        const { table = {}, header = {}, body = {}, footer = {} } = this.template;

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
            let content = ContentHandler.call(this, before.projection);
            content.classList.add("field--table__before");

            fragment.appendChild(content);
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

            StyleHandler(this.table, table.style);

            fragment.appendChild(this.table);
        }

        if (Array.isArray(header.cell)) {
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

            header.cell.forEach(value => {
                var { style, content } = value;

                var render = ContentHandler.call(this, content);

                var cell = createTableHeaderCell({
                    class: ["field--table-header-cell"],
                    dataset: {
                        nature: "field-component",
                        view: "table",
                        id: this.id,
                    }
                }, render);

                StyleHandler(cell, style);

                row.appendChild(cell);
            });

            let actionCell = createTableCell({
                class: ["field--table-header-cell", "field--table-header-cell--action"]
            }, "Action");

            row.appendChild(actionCell);

            this.header.appendChild(row);

            StyleHandler(this.header, header.style);

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

            StyleHandler(this.body, body.style);

            this.table.appendChild(this.body);
        }

        if (!isHTMLElement(this.btnAdd)) {
            let { projection: addLayout, style: addStyle } = valOrDefault(action.add, actionDefaultSchema.add);

            let render = ContentHandler.call(this, addLayout, null, { focusable: false });
            this.btnAdd = createButton({
                class: ["btn", "field--table__button"],
                dataset: {
                    "nature": "field-component",
                    "id": this.id,
                    "action": "add"
                }
            }, render);

            StyleHandler(this.btnAdd, addStyle);

            fragment.appendChild(this.btnAdd);
        }

        if (this.source.hasValue()) {
            this.source.getValue().forEach(concept => {
                this.addRow(concept);
            });
        }

        if (after.projection) {
            let content = ContentHandler.call(this, after.projection);
            content.classList.add("field--table__after");

            fragment.appendChild(content);
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

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
        return this.body.rows.length > 0;
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
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        if (this.readonly) {
            return;
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
        if (this.hasValue()) {
            this.table.classList.remove("empty");
        } else {
            this.table.classList.add("empty");
        }

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
        const { action = {}, before = {}, after = {} } = this.schema;
        const { body = {} } = this.template;

        const index = valOrDefault(concept.index, this.table.rows.length);
        const elementId = nextRowId();

        const row = createTableRow({
            class: ["field--table-row"],
            tabindex: -1,
            dataset: {
                nature: "field-component",
                view: "table",
                id: this.id,
                index: index,
                elementId: elementId
            }
        });
        this.elements.set(elementId, row);

        body.cell.forEach(schema => {
            const { style, content } = schema;

            var render = ContentHandler.call(this, content, concept);

            var cell = createTableCell({
                class: ["field--table-cell"],
                dataset: {
                    nature: "field-component",
                    view: "table",
                    id: this.id,
                }
            }, render);

            StyleHandler(cell, style);

            row.appendChild(cell);
        });

        var actionCell = createTableCell({
            class: ["field--table__cell-action"]
        });

        var { projection: removeLayout, style: removeStyle } = valOrDefault(action.remove, actionDefaultSchema.remove);

        var removeRender = ContentHandler.call(this, removeLayout);

        var btnRemove = createButton({
            class: ["btn", "field--table__button"],
            dataset: {
                "nature": "field-component",
                "id": this.id,
                "action": "remove",
                "rowId": elementId
            }
        }, removeRender);

        StyleHandler(btnRemove, removeStyle);        

        actionCell.append(btnRemove);

        row.appendChild(actionCell);

        this.body.appendChild(row);
    },
    removeRow(value) {
        console.log(value);
        var row = this.body.rows.item(value.index);
        if (!isHTMLElement(row)) {
            throw new Error("Table error: Row not found");
        }

        removeChildren(row);
        row.remove();

        for (let i = value.index; i < this.body.rows.length; i++) {
            const row = this.body.rows.item(i);
            const { index } = row.dataset;
            row.dataset.index = +index - 1;
        }
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
            this.environment.notify("The element was successfully deleted");
        } else {
            this.environment.notify("This element cannot be deleted");
            shake(target);
        }
    },

    bindEvents() {
        this.element.addEventListener('click', (event) => {
            const { target } = event;

            const fieldComponent = resolveFieldComponent(target);

            if (!isHTMLElement(fieldComponent)) {
                return;
            }

            const { id, action } = fieldComponent.dataset;

            if (id !== this.id) {
                return;
            }

            if (action === "add") {
                this.createElement();
            } else if (action === "remove") {
                const { rowId } = fieldComponent.dataset;
                let row = this.elements.get(rowId);
                this.delete(row);
            }
        }, true);
    }
};


export const TableField = Object.assign(
    Object.create(Field),
    BaseTableField
);