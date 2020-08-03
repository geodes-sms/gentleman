import {
    createSpan, createDiv, createDocFragment, createTable, createTableRow, createTableCell,
    isNode, isNullOrWhitespace, isObject, isString, hasOwn, isEmpty, createButton, isIterable
} from "zenkai";

import { StyleHandler } from './style-handler.js';
import { FieldManager } from "./field-manager.js";


function wrapHandler(layout) {
    const { disposition, style, collapsible = false } = layout;

    /** @type {HTMLElement} */
    const container = createDiv({
        class: ["projection-container"],
        dataset: {
            nature: "layout"
        }
    });

    /** @type {HTMLElement} */
    const body = createDiv({
        class: ["projection-body", "projection-layout", "projection-layout--wrap"],
        dataset: {
            nature: "layout-section"
        }
    });

    if (collapsible) {
        /** @type {HTMLElement} */
        var header = createDiv({
            class: ["projection-header", "collapsed"],
            dataset: {
                nature: "layout-section"
            }
        });

        /** @type {HTMLElement} */
        var btnCollapse = createButton({
            class: ["btn", "btn-collapse"],
            dataset: {
                "action": "collapse"
            }
        });

        btnCollapse.addEventListener('click', (event) => {
            if (body.classList.contains("collapsed")) {
                body.classList.remove("collapsed");
                btnCollapse.classList.remove("on");
                header.classList.add("collapsed");
                setTimeout(() => {
                    body.style.removeProperty("height");
                }, 200);
            } else {
                body.style.height = `${body.offsetHeight}px`;
                btnCollapse.classList.add("on");
                header.classList.remove("collapsed");
                setTimeout(() => {
                    body.classList.add("collapsed");
                }, 20);
            }
        });

        header.appendChild(btnCollapse);

        container.appendChild(header);
    }

    if (!Array.isArray(disposition) || isEmpty(disposition)) {
        throw new SyntaxError("Bad disposition");
    }

    var bodyContent = createDocFragment();

    if (disposition.length === 1) {
        bodyContent.appendChild(dispositionHandler.call(this, disposition[0]));
    } else {
        for (let i = 0; i < disposition.length; i++) {
            const content = disposition[i];
            bodyContent.appendChild(dispositionHandler.call(this, content));
        }
    }

    body.appendChild(bodyContent);

    StyleHandler.call(this, body, style);

    container.appendChild(body);

    return container;
}

//#region TABLE LAYOUT HANDLER

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
    table.appendChild(tableLayoutHandler[orientation].call(this, disposition));

    return table;
}

function crossTableHandler(layout, row, col) {
    var fragment = createDocFragment();

    const cellHandler = {
        "colspan": (cell, value) => cell.colSpan = value,
        "rowspan": (cell, value) => cell.rowSpan = value,
        "layout": (cell, value) => cell.appendChild(dispositionHandler.call(this, value)),
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
                tableCell.appendChild(dispositionHandler.call(this, content));
            }
            tableRow.appendChild(tableCell);
        }
        fragment.appendChild(tableRow);
    }

    return fragment;
}

function columnTableHandler(layout) {
    var fragment = createDocFragment();

    const cellHandler = {
        "span": (cell, value) => cell.colSpan = value,
        "layout": (cell, value) => cell.appendChild(dispositionHandler.call(this, value)),
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
                tableCell.appendChild(dispositionHandler.call(this, content));
            }
            tableRow.appendChild(tableCell);
        }
        fragment.appendChild(tableRow);
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
        "layout": (cell, value) => cell.appendChild(dispositionHandler(value)),
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
                tableCell.appendChild(dispositionHandler(content));
            }
            tableRow.appendChild(tableCell);
        }
        fragment.appendChild(tableRow);
    }

    return fragment;
}

//#endregion

function fieldHandler(schema) {
    const field = FieldManager.createField(schema, this.concept).init();
    field.projection = this;

    this.editor.registerField(field);

    return field.render();
}


export const LayoutHandler = {
    'wrap': wrapHandler,
    'table': tableHandler,
    'grid': tableHandler,
    'field': fieldHandler,
    'template': fieldHandler,
};