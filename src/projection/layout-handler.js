import {
    createSpan, createDiv, createDocFragment, createTable, createTableRow, createTableCell,
    isNode, isNullOrWhitespace, isObject, isString, hasOwn, isEmpty, createButton
} from "zenkai";
import { StructureHandler } from './structure-handler.js';
import { StyleHandler } from './style-handler.js';
import { FieldManager } from "./field-manager.js";


const SymbolResolver = {
    '#': resolveStructure,
    '$': resolveReference,
    '@': resolveScope,
};


function stackHandler(layout) {
    const { disposition, orientation, collapsible = false, style } = layout;

    /** @type {HTMLElement} */
    const container = createDiv({
        class: ["projection-container"],
        dataset: {
            nature: "layout"
        }
    });

    /** @type {HTMLElement} */
    const body = createDiv({
        class: ["projection-body", "projection-wrapper", `projection-wrapper--${orientation}`],
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
            let render = dispositionHandler.call(this, content);
            bodyContent.appendChild(createDiv({
                dataset: {
                    nature: "layout-part"
                }
            }, render));
        }
    }

    body.appendChild(bodyContent);

    StyleHandler.call(this, body, style);

    container.appendChild(body);

    return container;
}

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

function textHandler(layout) {
    const { disposition, style } = layout;

    const fragment = createDocFragment();

    if (Array.isArray(disposition)) {
        for (let i = 0; i < disposition.length; i++) {
            const content = disposition[i];
            fragment.appendChild(dispositionHandler.call(this, content));
        }
    } else {
        fragment.appendChild(dispositionHandler.call(this, disposition));
    }

    StyleHandler.call(this, fragment.firstElementChild, style);

    return fragment;
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

function dispositionHandler(value) {
    var fragment = createDocFragment();

    if (hasOwn(LayoutHandler, value.type)) {
        return LayoutHandler[value.type].call(this, value);
    }

    var parts = parseDisposition(value);

    var textBuffer = "";

    const addText = () => {
        if (!isNullOrWhitespace(textBuffer)) {
            var tag = createSpan({
                class: ["field", "field--label"],
            }, textBuffer.trim());
            fragment.appendChild(tag);
            textBuffer = "";
        }
    };

    const addContent = (content) => {
        if (isNode(content)) {
            fragment.appendChild(content);
        }
    };

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        let handler = SymbolResolver[part.charAt(0)];
        if (handler) {
            addText();
            addContent(handler.call(this, part.substring(1)));
        } else {
            textBuffer += " " + parts[i];
        }
    }

    addText();

    return fragment;
}

/**
 * 
 * @param {string} value 
 */
function parseDisposition(value) {
    var parts = value.replace(/\s+/g, " ")
        .replace(/(#\w+(:\w+)?(@\w+)?)/g, " $1 ")
        .replace(/(\$\w+(:\w+)?(@\w+)?)/g, " $1 ")
        .split(" ")
        .filter((x) => !isNullOrWhitespace(x));

    return parts;
}

function fieldHandler(schema) {
    const field = FieldManager.createField(schema, this.concept).init();
    field.projection = this;

    this.editor.registerField(field);

    return field.render();
}

/**
 * Resolves a structure in the schema
 * @param {string} key 
 * @this {Projection}
 */
function resolveStructure(key) {
    var [name, type = "attribute"] = key.split(":");

    return StructureHandler[type].call(this, name);
}

/**
 * Resolves a reference in the schema
 * @param {string} key 
 * @this {Projection}
 */
function resolveReference(key) {
    var [name, from] = key.split(":");

    var element = this.getElement(name);

    const { layout, view } = element;

    if (view) {
        return fieldHandler.call(this, element);
    } else if (layout) {
        const { type, disposition } = layout;

        return LayoutHandler[type].call(this, layout);
    }

    return LayoutHandler['text'].call(this, element);
}

/**
 * Resolves a scope in the schema
 * @param {string} scope 
 * @this {Projection}
 */
function resolveScope(scope) {

}


export const LayoutHandler = {
    'stack': stackHandler,
    'wrap': wrapHandler,
    'table': tableHandler,
    'grid': tableHandler,
    'relative': stackHandler,
    'field': fieldHandler,
    'text': textHandler,
    'template': fieldHandler,
};