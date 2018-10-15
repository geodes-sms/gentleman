export const Environment = {
    PROD: 'prod',
    TEST: 'test'
};

/**
 * Enum for datatype values.
 * @readonly
 * @enum {string}
 */
export const DataType = {
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
export const EventType = {
    CHANGE: 'change',
    CLICK: 'click',
    FOCUSIN: 'focusin',
    FOCUSOUT: 'focusout',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup'
};

export const HTMLAttribute = {
    Optional: 'optional',
    Type: 'type',
    Name: 'name',
    Path: 'path',
    Error: 'error',
    Prop: 'prop',
    Position: 'position'
};

export const ModelType = {
    ABSTRACT: 'abstract',
    DATATYPE: 'data-type',
    ENUM: 'enum',
    ELEMENT: 'element',
    RULE: 'rule',
    PRIMITIVE: DataType
};

export const ModelAttributeProperty = {
    NAME: 'name',    
    TYPE: 'type',
    VAL: 'val',
    OPTIONAL: 'optional',
    MULTIPLE: 'multiple',
    REPRESENTATION: 'representation'
};

export const Key = {
    backspace: "Backspace",
    tab: "Tab",
    enter: "Enter",
    ctrl: "Control",
    alt: "Alt",
    escape: "Escape",
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

export const UI = (function () {
    const BUTTON = 'BUTTON';
    const ANCHOR = 'ANCHOR';
    const ATTRIBUTE = 'ATTRIBUTE';
    const OPTION = 'OPTION';

    var pub = {
        ATTR_WRAPPER: 'attr-wrapper',
        COLLAPSE: 'collapse',
        CHECKED: 'checked',
        DISABLED: 'disabled',
        EMPTY: 'empty',
        HIDDEN: 'hidden',
        SELECTED: 'selected',

        Element: {
            ANCHOR: {
                name: ANCHOR
            },
            ATTRIBUTE: {
                name: ATTRIBUTE,
                class: 'attr',
                toClass() { return '.attr'; },
                toString() { return 'ATTRIBUTE'; }
            },
            ATTRIBUTE_ABSTRACT: {
                name: ATTRIBUTE,
                class: 'attr attr--extension',
                toString() { return 'ABSTRACT ATTRIBUTE'; }
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
            },
            OPTION: {
                name: OPTION,
                class: 'option',
                toString() { return 'OPTION'; }
            }
        }
    };

    return pub;
})();