import {
    createDocFragment, createTable, createTableHeader, createTableBody, createTableRow,
    createTableCell, createTableHeaderCell, removeChildren, createDiv, isHTMLElement
} from "zenkai";
import { ProjectionManager } from "@projection/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "./../style-handler.js";
import { shake } from "@utils/index.js";


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


const _TableField = {
    init() {
        this.source.register(this);
        return this;
    },

    /** @type {HTMLTableElement} */
    table: null,
    /** @type {HTMLTableSectionElement} */
    header: null,
    /** @type {HTMLTableSectionElement} */
    body: null,
    /** @type {HTMLTableSectionElement} */
    footer: null,
    /** @type {*[]} */
    errors: null,
    update(message, value) {
        switch (message) {
            case "value.added":
                var row = createTableRow({
                    class: ["field--table-row"],
                    tabindex: -1,
                });
                this.schema.body.forEach(cell => {
                    var schema = [
                        {
                            "layout": {
                                "type": "wrap",
                                "disposition": [cell]
                            }
                        }
                    ];

                    var projection = ProjectionManager.createProjection(schema, value, this.editor).init();
                    row.appendChild(createTableCell({
                        class: ["field--table-cell"],
                        tabindex: -1,
                    }, [projection.render()]));
                });

                var projection = ProjectionManager.createProjection(addSchema, value, this.editor).init();

                var addContainer = createTableCell({
                    class: ["field--table-cell"],
                    tabindex: -1,
                }, [projection.render()]);

                addContainer.addEventListener('click', () => {
                    var element = this.createElement();
                    if (!element) {
                        this.editor("Element could not be created");
                    }
                });

                row.appendChild(addContainer);

                projection = ProjectionManager.createProjection(removeSchema, value, this.editor).init();

                var removeContainer = createTableCell({
                    class: ["field--table-cell"],
                    tabindex: -1,
                }, [projection.render()]);

                removeContainer.addEventListener('click', () => {
                    removeChildren(row);
                    row.remove();
                });

                row.appendChild(removeContainer);

                this.body.appendChild(row);

                break;
            default:
                console.warn(`List Field not updated for operation '${message}'`);
                break;
        }
    },

    render() {
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

        if (!isHTMLElement(this.table)) {
            this.table = createTable({
                class: ["field--table__table"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id,
                    placeholder: this.placeholder
                }
            });

            fragment.appendChild(this.table);
        }

        this.table.appendChild(valueHandler.call(this, this.source.getElements()));

        if (fragment.hasChildNodes) {
            this.element.appendChild(this.table);
        }

        this.bindEvents();

        return this.element;
    },
    focusIn() {
        this.hasFocus = true;
    },
    focusOut() {
        this.hasFocus = false;
    },
    createElement() {
        return this.source.createElement();
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

function valueHandler(values) {
    const { editor } = this;
    const { header, body, orientation } = this.schema;

    var fragment = createDocFragment();

    if (!Array.isArray(values)) {
        return null;
    }

    if (header) {
        this.header = createTableHeader({
            class: ["field--table-header"],
        });
        let row = createTableRow({
            class: ["field--table-header-row"],
            tabindex: -1,
        });
        header.forEach(value => {
            row.appendChild(createTableHeaderCell({
                class: ["field--table-header-cell"],
                tabindex: -1
            }, value));
        });

        this.header.appendChild(row);
        fragment.appendChild(this.header);
    }

    this.body = createTableBody({
        class: ["field--table-body"],
    });

    values.forEach(concept => {
        var row = createTableRow({
            class: ["field--table-row"],
            tabindex: -1,
        });
        body.forEach(cell => {
            var schema = [
                {
                    "layout": {
                        "type": "wrap",
                        "disposition": [cell]
                    }
                }
            ];

            var projection = ProjectionManager.createProjection(schema, concept, editor).init();
            row.appendChild(createTableCell({
                class: ["field--table-cell"],
                tabindex: -1,
            }, [projection.render()]));
        });



        var projection = ProjectionManager.createProjection(addSchema, concept, editor).init();

        var addContainer = createTableCell({
            class: ["field--table-cell"],
            tabindex: -1,
        }, [projection.render()]);

        addContainer.addEventListener('click', () => {
            var element = this.createElement();
            if (!element) {
                this.editor("Element could not be created");
            }
        });

        row.appendChild(addContainer);

        projection = ProjectionManager.createProjection(removeSchema, concept, editor).init();

        var removeContainer = createTableCell({
            class: ["field--table-cell"],
            tabindex: -1,
        }, [projection.render()]);

        removeContainer.addEventListener('click', () => {
            removeChildren(row);
            row.remove();
        });

        row.appendChild(removeContainer);

        this.body.appendChild(row);
    });

    fragment.appendChild(this.body);

    return fragment;
}


export const TableField = Object.assign(
    Object.create(Field),
    _TableField
);