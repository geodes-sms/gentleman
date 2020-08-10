import {
    createDocFragment, createTable, createTableHeader, createTableBody, createTableRow,
    createTableCell, createTableHeaderCell, createSpan, createDiv, createI, createButton,
    removeChildren, isHTMLElement, isDerivedOf, isEmpty, valOrDefault, hasOwn, isString, appendChildren, findAncestor,
} from "zenkai";
import { hide, show, shake } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";


const addSchema = {
    "type": "layout",
    "layout": {
        "type": "wrap",
        "style": {
            "css": "field--table__btn-add-row"
        },
        "disposition": [
            { "type": "text", "content": "Add row" }
        ]
    }
};

const addRowSchema = {
    "type": "layout",
    "layout": {
        "type": "wrap",
        "style": {
            "css": "field--table__btn-add"
        },
        "disposition": [
            { "type": "text", "content": "+" }
        ]
    }
};

const removeRowSchema = {
    "type": "layout",
    "layout": {
        "type": "wrap",
        "style": {
            "css": "table-remove"
        },
        "disposition": [
            { "type": "text", "content": "Remove" }
        ]
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

    init() {
        this.source.register(this);
        this.caption = this.schema.caption;

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

                var render = ContentHandler.call(this, content);

                var cell = createTableHeaderCell({
                    class: ["field--table-header-cell"],
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
            if (this.btnAdd) {
                hide(this.btnAdd);
            }
        } else {
            if (!isHTMLElement(this.btnAdd)) {
                let render = ContentHandler.call(this, addSchema);
                this.btnAdd = createButton({
                    class: ["btn", "field--table__button"],
                    dataset: {
                        "nature": "field-component",
                        "id": this.id,
                        "action": "add"
                    }
                }, render);
                this.element.appendChild(this.btnAdd);
            }

            show(this.btnAdd);
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
        const { body } = this.template;

        var row = createTableRow({
            class: ["field--table-row"],
            tabindex: -1,
            dataset: {
                nature: "field-component",
                view: "table",
                id: this.id,
                index: valOrDefault(concept.index, this.table.rows.length)
            }
        });

        body.forEach(schema => {
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
            class: ["field--table__cell-action"],
            tabindex: -1,
        });

        var addRender = ContentHandler.call(this, addRowSchema);
        addRender.dataset.action = "add";

        var removeRender = ContentHandler.call(this, removeRowSchema);
        removeRender.dataset.action = "remove";

        appendChildren(actionCell, [addRender, removeRender]);

        actionCell.addEventListener('click', (event) => {
            const { target } = event;

            const actionTarget = findAncestor(target, (element) => element.parentElement === actionCell);

            if (actionTarget.dataset.action) {
                const { action } = actionTarget.dataset;

                if (action === "add") {
                    this.createElement();
                }
                if (action === "remove") {
                    this.delete(actionCell.parentElement);
                }
            }
        }, true);

        row.appendChild(actionCell);

        this.body.appendChild(row);
    },
    removeRow(value) {
        let row = this.body.rows.item(value.index);
        if (!isHTMLElement(row)) {
            throw new Error("Table error: Row not found");
        }

        removeChildren(row);
        row.remove();
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

            if (fieldComponent.dataset.id !== this.id) {
                return;
            }

            if (fieldComponent.dataset.action) {
                const { action } = fieldComponent.dataset;

                if (action === "add") {
                    this.createElement();
                }
            }
        }, true);

    }
};


export const TableField = Object.assign(
    Object.create(Field),
    BaseTableField
);