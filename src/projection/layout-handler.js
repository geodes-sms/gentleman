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

/**
 * 
 * @param {string[]} classList 
 * @returns {HTMLElement}
 */
function createContainer(classList) {
    return createDiv({
        class: ["projection-wrapper", ...classList],
        tabindex: -1,
        dataset: {
            nature: "layout"
        }
    });
}

function stackHandler(layout) {
    const { disposition, orientation, style } = layout;

    var container = createDiv({
        class: ["projection-container"],
        tabindex: -1,
        dataset: {
            nature: "layout"
        }
    });
    
    /** @type {HTMLElement} */
    var btnHide = createButton({
        class: ["btn", "btn-hide", "hidden"],
        dataset: {
            "action": "collapse"
        }
    }, "Hide");

    var body = createDiv({
        class: ["projection-wrapper", `projection-wrapper--${orientation}`],
        dataset: {
            nature: "layout"
        }
    });

    btnHide.addEventListener('click', (event) => {
        body.classList.toggle("hidden");
    });


    container.appendChild(btnHide);
    container.appendChild(body);

    if (!Array.isArray(disposition) || isEmpty(disposition)) {
        throw new SyntaxError("Bad disposition");
    }

    if (disposition.length === 1) {
        let render = dispositionHandler.call(this, disposition[0]);
        body.appendChild(render);
    } else {
        for (let i = 0; i < disposition.length; i++) {
            const content = disposition[i];
            let render = dispositionHandler.call(this, content);
            let renderElement = createDiv({
                dataset: {
                    nature: "layout-part"
                }
            }, render);
            StyleHandler.call(this, renderElement, content.style);
            body.appendChild(renderElement);
        }
    }

    StyleHandler.call(this, body, style);

    return container;
}

function wrapHandler(layout) {
    const { disposition, style } = layout;

    var container = createDiv({
        class: ["projection-container"],
        tabindex: -1,
        dataset: {
            nature: "layout"
        }
    });
    
    /** @type {HTMLElement} */
    var btnHide = createButton({
        class: ["btn", "btn-hide", "hidden"],
        dataset: {
            "action": "collapse"
        }
    }, "Hide");

    var body = createDiv({
        class: ["projection-wrapper"],
        dataset: {
            nature: "layout"
        }
    });

    btnHide.addEventListener('click', (event) => {
        body.classList.toggle("hidden");
    });

    container.appendChild(btnHide);
    container.appendChild(body);

    if (!Array.isArray(disposition) || isEmpty(disposition)) {
        throw new SyntaxError("Bad disposition");
    }

    if (disposition.length === 1) {
        let render = dispositionHandler.call(this, disposition[0]);
        body.appendChild(render);
    } else {
        for (let i = 0; i < disposition.length; i++) {
            const content = disposition[i];
            let render = dispositionHandler.call(this, content);
            let renderElement = createDiv({
                dataset: {
                    nature: "layout-part"
                }
            }, render);
            StyleHandler.call(this, renderElement, content.style);
            body.appendChild(renderElement);
        }
    }

    StyleHandler.call(this, body, style);

    return container;
}

function textHandler(layout) {
    const { disposition, style } = layout;

    var fragment = createDocFragment();

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

const tableLayoutHandler = {
    'cross': crossTableHandler,
    'column': columnTableHandler,
    'row': rowTableHandler,
};

function tableHandler(layout) {
    const { disposition, orientation, row, column } = layout;

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

function fieldHandler(schema) {
    var field = FieldManager.createField(schema, this.concept).init();
    field.projection = this;

    this.editor.registerField(field);

    return field.render();
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

/**
 * 
 * @param {string} key 
 * @this {TextualProjection}
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

    const { action, behaviour, constraint, layout, view } = element;

    if (view) {
        return fieldHandler.call(this, element);
    } else if (layout) {
        const { type, disposition } = layout;
        return LayoutHandler[type].call(this, layout);
    }
    return LayoutHandler['text'].call(this, element);
}

function resolveScope() {

}

export const LayoutHandler = {
    'stack': stackHandler,
    'wrap': wrapHandler,
    'table': tableHandler,
    'grid': stackHandler,
    'relative': stackHandler,
    'field': fieldHandler,
    'template': fieldHandler,
    'text': textHandler,
};
