import {
    createDocFragment, createTable, createTableRow, createTableCell, createDiv,
    isHTMLElement, isObject, isString, hasOwn,
} from "zenkai";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "../content-handler.js";
import { Layout } from "./layout.js";


export const BaseTableLayout = {
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {boolean} */
    edit: false,
    /** @type {HTMLElement} */
    btnEdit: false,
    /** @type {HTMLElement} */
    btnCollapse: false,
    /** @type {HTMLElement} */
    menu: false,
    /** @type {boolean} */
    collapsed: false,

    init(args = {}) {
        const { editable = true, collapsible = false, focusable = false } = this.schema;

        this.focusable = focusable;
        this.collapsible = collapsible;
        this.editable = editable;
        this.elements = [];
        this.children = [];

        Object.assign(this, args);

        return this;
    },

    collapse(row) {
        if (this.collapsed) {
            return;
        }

        this.collapseContainer = createDiv({
            class: "layout-container-collapse"
        }, this.elements);
        this.btnCollapse.after(this.collapseContainer);
        this.collapsed = true;

        this.refresh();

        return this;
    },
    expand(row) {
        if (!this.collapsed) {
            return;
        }
        let fragment = createDocFragment(Array.from(this.collapseContainer.children));
        this.btnCollapse.after(fragment);
        this.collapseContainer.remove();
        this.collapsed = true;

        this.refresh();

        return this;
    },

    refresh() {
        if (this.collapsed) {
            this.container.classList.add("collapsed");
        } else {
            this.container.classList.remove("collapsed");
        }

        return this;
    },

    render() {
        const { disposition, style, help } = this.schema;

        if (!Array.isArray(disposition)) {
            throw new SyntaxError("Bad disposition");
        }

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["layout-container"],
                dataset: {
                    nature: "layout",
                    layout: "table",
                }
            });
        }

        if (this.focusable) {
            this.container.tabIndex = -1;
        } else {
            this.container.dataset.ignore = "all";
        }


        for (let i = 0; i < disposition.length; i++) {
            let rowDisposition = disposition[i];

            let row = createDiv({
                class: ["table-row"],
            });
            row.style.display = "table-row";

            for (let j = 0; j < rowDisposition.length; j++) {
                const cellContent = rowDisposition[j];

                let cell = createDiv({
                    class: ["table-cell"],
                }, ContentHandler.call(this, cellContent.content));

                cell.style.display = "table-cell";

                StyleHandler.call(this.projection, cell, cellContent.style);

                row.append(cell);
            }


            fragment.append(row);
        }

        StyleHandler.call(this.projection, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
            this.bindEvents();
        }

        this.container.style.display = "table";

        this.refresh();

        return this.container;
    },

    bindEvents() {
        this.projection.registerHandler("view.changed", (value, from) => {
            if (from && from.parent === this.projection) {
                value.parent = this;
            }
        });

        if (this.btnCollapse) {
            this.btnCollapse.addEventListener('click', (event) => {
                if (this.collapsed) {
                    this.expand();
                }
                else {
                    this.collapse();
                }
            });
        }
    }
};


const tableLayoutHandler = {
    'cross': crossTableHandler,
    'column': columnTableHandler,
    'row': rowTableHandler,
};

function tableHandler(layout) {
    const { disposition, orientation, style, collapsible = false, row, column } = layout;

    var table = createTable({
        dataset: {
            nature: "layout"
        }
    });
    table.append(tableLayoutHandler[orientation].call(this, disposition));

    return table;
}

function crossTableHandler(layout, row, col) {
    var fragment = createDocFragment();

    const cellHandler = {
        "colspan": (cell, value) => cell.colSpan = value,
        "rowspan": (cell, value) => cell.rowSpan = value,
        "layout": (cell, value) => cell.append(ContentHandler.call(this, value)),
    };

    for (let i = 0; i < layout.length; i++) {
        let cols = layout[i];

        /** @type {HTMLTableRowElement} */
        let tableRow = createTableRow();
        for (let j = 0; j < cols.length; j++) {
            /** @type {HTMLTableCellElement} */
            let tableCell = createTableCell({
                class: ["table-cell"]
            });

            let content = layout[i][j];
            if (isObject(content)) {
                for (const prop in content) {
                    const value = content[prop];
                    if (hasOwn(cellHandler, prop)) {
                        cellHandler[prop](tableCell, value);
                    }
                }
            } else if (isString(content)) {
                tableCell.append(ContentHandler.call(this, content));
            }
            tableRow.append(tableCell);
        }
        fragment.append(tableRow);
    }

    return fragment;
}

function columnTableHandler(layout) {
    var fragment = createDocFragment();

    const cellHandler = {
        "span": (cell, value) => cell.colSpan = value,
        "layout": (cell, value) => cell.append(ContentHandler.call(this, value)),
    };

    for (let i = 0; i < layout.length; i++) {
        let cols = layout[i];

        /** @type {HTMLTableRowElement} */
        let tableRow = createTableRow();
        for (let j = 0; j < cols.length; j++) {
            /** @type {HTMLTableCellElement} */
            let tableCell = createTableCell({
                class: ["table-cell"]
            });

            let content = layout[i][j];
            if (isObject(content)) {
                for (const prop in content) {
                    const value = content[prop];
                    if (hasOwn(cellHandler, prop)) {
                        cellHandler[prop](tableCell, value);
                    }
                }
            } else if (isString(content)) {
                tableCell.append(ContentHandler.call(this, content));
            }
            tableRow.append(tableCell);
        }
        fragment.append(tableRow);
    }

    return fragment;
}

function rowHandler(value) {
    let cols = value[0];

    let tableRow = createTableRow();

}

function rowTableHandler(layout) {
    var fragment = createDocFragment();

    const cellHandler = {
        "span": (cell, value) => cell.rowSpan = value,
        "layout": (cell, value) => cell.append(ContentHandler(value)),
    };

    for (let i = 0; i < layout.length; i++) {
        let cols = layout[i];

        /** @type {HTMLTableRowElement} */
        let tableRow = createTableRow();
        for (let j = 0; j < cols.length; j++) {
            /** @type {HTMLTableCellElement} */
            let tableCell = createTableCell({ class: ["table-cell"] });

            let content = layout[i][j];
            if (isObject(content)) {
                for (const prop in content) {
                    const value = content[prop];
                    if (hasOwn(cellHandler, prop)) {
                        cellHandler[prop](tableCell, value);
                    }
                }
            } else if (isString(content)) {
                tableCell.append(ContentHandler(content));
            }
            tableRow.append(tableCell);
        }
        fragment.append(tableRow);
    }

    return fragment;
}


export const TableLayout = Object.assign({},
    Layout,
    BaseTableLayout
);