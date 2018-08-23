/**
 * Enum for datatype values.
 * @readonly
 * @enum {string}
 */
const DataType = {
    ID: "ID",
    IDREF: "IDREF",
    boolean: "boolean",
    integer: "integer",
    real: "real",
    string: "string"
};

/**
 * Enum for event type values.
 * @readonly
 * @enum {string}
 */
const EventType = {
    CLICK: 'click',
    FOCUSIN: 'focusin',
    FOCUSOUT: 'focusout',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup'
};

const HTMLAttribute = {
    Optional: 'optional',
    Type: 'type',
    Name: 'name',
    Path: 'path',
    Error: 'error',
    Prop: 'prop',
    Position: 'position'
};

const ModelType = {
    ABSTRACT: 'abstract',
    DATATYPE: 'data-type',
    ENUM: 'enum',
    ELEMENT: 'element',
    RULE: 'rule',
    PRIMITIVE: DataType
};

const Key = {
    backspace: "Backspace",
    tab: "Tab",
    enter: "Enter",
    ctrl: "Control",
    alt: "Alt",
    escape: "Esc",
    spacebar: " ",
    page_up: "PageUp",
    page_down: "PageDown",
    end: "End",
    home: "Home",
    left_arrow: "ArrowLeft",
    up_arrow: "ArrowUp",
    right_arrow: "ArrowRight",
    down_arrow: "ArrowDown",
    delete: "Delete",
    period: "."
};

const UI = (function () {
    const BUTTON = 'BUTTON';
    const ANCHOR = 'ANCHOR';

    var pub = {
        HIDDEN: 'hidden',
        EMPTY: 'empty',
        SELECTED: 'selected',
        DISABLED: 'disabled',
        Element: {
            ANCHOR: {
                name: ANCHOR
            },
            BUTTON: {
                name: BUTTON,
                class: 'btn',
                toString() { return 'BUTTON'; }
            },
            BUTTON_MENU: {
                name: BUTTON,
                class: 'btn btn-menu',
                toString() { return 'MENU BUTTON'; }
            }
        }
    };

    return pub;
})();