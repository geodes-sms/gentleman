import { isObject, isIterable, isNullOrWhitespace, valOrDefault, isFunction } from "zenkai";


const PROJECTION_SCHEMA = [
    {
        "concept": { "name": "style" },
        "type": "layout",
        "tags": [],
        "content": {
            "type": "stack",
            "orientation": "vertical",
            "disposition": [
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": "Text style",
                        "style": {
                            "css": ["config-title", "font-ui"]
                        }
                    }
                },
                {
                    "type": "attribute",
                    "name": "text"
                },
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": "Box style",
                        "style": {
                            "css": ["config-title", "font-ui"]
                        }
                    }
                },
                {
                    "type": "attribute",
                    "name": "box"
                }
            ]
        }
    },
    {
        "concept": { "name": "text-style" },
        "tags": [],
        "type": "layout",
        "content":  {
            "type": "stack",
            "orientation": "horizontal",
            "disposition": [
                {
                    "type": "attribute",
                    "name": "bold",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "italic",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "underline",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "strikethrough",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "colour",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "size",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "alignment",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                }
            ],
            "style": {
                "css": ["text-style-container"]
            }
        }
    },    
    {
        "concept": { "name": "box-style" },
        "tags": [],
        "type": "layout",
        "content":  {
            "type": "stack",
            "orientation": "horizontal",
            "disposition": [
                {
                    "type": "attribute",
                    "name": "inner",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "outer",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "background",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "width",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                },
                {
                    "type": "attribute",
                    "name": "height",
                    "style": {
                        "css": ["text-style__attribute"]
                    }
                }
            ],
            "style": {
                "css": ["text-style-container"]
            }
        }
    },
    {
        "concept": { "name": "multi-size" },
        "tags": [],
        "type": "field",
        "content":  {
            "type": "choice",
            "choice": {
                "style": {
                    "css": ["bracket-choice__list"]
                },
                "option": {
                    "style": {
                        "css": ["bracket-choice__list-option"]
                    }
                }
            },
            "input": {
                "placeholder": "omni or direction specific",
                "style": {
                    "css": ["bracket-choice__input"]
                }
            },
            "selection": {
                "style": {
                    "css": ["bracket-choice__selection", "bracket-choice--component__selection"]
                }
            },
            "style": {
                "css": ["bracket-choice", "bracket-choice--component"]
            }
        }
    },
    {
        "concept": { "name": "omni-size" },
        "tags": ["choice-selection"],
        "type": "layout",
        "content": {
            "type": "stack",
            "orientation": "horizontal",
            "disposition": [
                {
                    "type": "attribute",
                    "name": "value"
                },
                {
                    "type": "attribute",
                    "name": "type"
                }
            ]
        }
    },
    {
        "concept": { "name": "omni-size" },
        "type": "layout",
        "tags": ["choice"],
        "projection": {
            "type": "wrap",
            "focusable": false,
            "disposition": [
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": "Omni size"
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "direction-size" },
        "tags": ["choice-selection"],
        "type": "layout",
        "content": {
            "type": "stack",
            "orientation": "vertical",
            "disposition": [
                {
                    "type": "static",
                    "static":  {
                        "type": "text",
                        "content": { "type": "property", "name": "refname" },
                        "style": {
                            "css": ["title--small"]
                        }
                    }
                },
                {
                    "type": "layout",
                    "layout": {
                        "type": "stack",
                        "orientation": "horizontal",
                        "disposition": [
                            {
                                "type": "attribute",
                                "name": "top",
                                "style": {
                                    "css": ["direction-size"]
                                }
                            },
                            {
                                "type": "attribute",
                                "name": "right",
                                "style": {
                                    "css": ["direction-size"]
                                }
                            },
                            {
                                "type": "attribute",
                                "name": "bottom",
                                "style": {
                                    "css": ["direction-size"]
                                }
                            },
                            {
                                "type": "attribute",
                                "name": "left",
                                "style": {
                                    "css": ["direction-size"]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "direction-size" },
        "type": "layout",
        "tags": ["choice"],
        "projection": {
            "type": "wrap",
            "focusable": false,
            "disposition": [
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": "Direction size"
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "colour" },
        "tags": [],
        "type": "layout",
        "projection": {
            "type": "stack",
            "orientation": "vertical",
            "disposition": [
                {
                    "type": "static",
                    "static":  {
                        "type": "text",
                        "content": { "type": "property", "name": "refname" },
                        "style": {
                            "css": ["title--small"]
                        }
                    }
                },
                {
                    "type": "field",
                    "field": {
                        "type": "choice",
                        "input": false,
                        "choice": {
                            "style": {
                                "css": ["constraint-choice--textual__choice-list"]
                            },
                            "option": {
                                "style": {
                                    "css": ["constraint-choice--textual__choice-option"]
                                }
                            }
                        },
                        "style": {
                            "css": ["constraint-choice--textual__choice"]
                        }
                    }
                },
                {
                    "type": "projection",
                    "bind": "value",
                    "placeholder": false,
                    "style": {
                        "css": ["number-constraint"]
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "name-colour" },
        "tags": ["choice-selection"],
        "type": "layout",
        "content": {
            "type": "stack",
            "orientation": "vertical",
            "style": {
                "css": ["text-element"]
            },
            "disposition": [
                {
                    "type": "attribute",
                    "name": "value"
                }
            ]
        }
    },
    {
        "concept": { "name": "name-colour" },
        "tags": ["choice"],
        "type": "layout",
        "content": {
            "type": "wrap",
            "focusable": false,
            "disposition": [
                {
                    "type": "static", 
                    "static": {
                        "type": "text",
                        "content": "name"
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "rgb-colour" },
        "tags": ["choice-selection"],
        "type": "layout",
        "content": {
            "type": "stack",
            "orientation": "vertical",
            "style": {
                "css": ["text-element"]
            },
            "disposition": [
                {
                    "type": "attribute",
                    "name": "red"
                },
                {
                    "type": "attribute",
                    "name": "green"
                },
                {
                    "type": "attribute",
                    "name": "blue"
                }
            ]
        }
    },
    {
        "concept": { "name": "rgb-colour" },
        "tags": ["choice"],
        "type": "layout",
        "content": {
            "type": "wrap",
            "focusable": false,
            "disposition": [
                {
                    "type": "static", 
                    "static": {
                        "type": "text",
                        "content": "RGB"
                    }
                }
            ]
        }
    },
    {
        "concept": { "name": "size" },
        "tags": [],
        "type": "layout",
        "content": {
            "type": "stack",
            "orientation": "vertical",
            "disposition": [
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": { "type": "property", "name": "refname" },
                        "style": {
                            "css": ["title--small", "primitive-constraint__title--small"]
                        }
                    }
                },
                {
                    "type": "layout",
                    "layout": {
                        "type": "stack",
                        "orientation": "horizontal",
                        "disposition": [
                            {
                                "type": "attribute",
                                "name": "value",
                            },
                            {
                                "type": "attribute",
                                "name": "unit"
                            }
                        ]
                    }
                }
            ],
            "style": {
                "css": ["size-config"]
            }
        }
    }
];

const CONCEPT_SCHEMA = [
    {
        "name": "style",
        "nature": "concrete",
        "attributes": [
            {
                "name": "text",
                "target": {
                    "name": "text-style"
                }
            },
            {
                "name": "box",
                "target": {
                    "name": "box-style"
                }
            }
        ]
    },
    {
        "name": "text-style",
        "nature": "concrete",
        "attributes": [
            {
                "name": "bold",
                "target": {
                    "name": "boolean",
                    "default": false
                }
            },
            {
                "name": "italic",
                "target": {
                    "name": "boolean",
                    "default": false
                }
            },
            {
                "name": "underline",
                "target": {
                    "name": "boolean",
                    "default": true
                }
            },
            {
                "name": "strikethrough",
                "target": {
                    "name": "boolean",
                    "default": true
                }
            },
            {
                "name": "colour",
                "target": {
                    "name": "colour"
                }
            },
            {
                "name": "size",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "alignment",
                "target": {
                    "name": "alignment"
                }
            }
        ]
    },
    {
        "name": "box-style",
        "nature": "concrete",
        "attributes": [
            {
                "name": "inner",
                "target": {
                    "name": "direction-size"
                }
            },
            {
                "name": "outer",
                "target": {
                    "name": "direction-size"
                }
            },
            {
                "name": "background",
                "target": {
                    "name": "colour"
                }
            },
            {
                "name": "width",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "height",
                "target": {
                    "name": "size"
                }
            }
        ]
    },

    {
        "name": "size",
        "nature": "concrete",
        "attributes": [
            {
                "name": "value",
                "target": {
                    "name": "number"
                }
            },
            {
                "name": "unit",
                "target": {
                    "name": "size-unit",
                    "default": "px"
                }
            }
        ]
    },


    {
        "name": "colour",
        "nature": "prototype",
        "attributes": []
    },
    {
        "name": "name-colour",
        "nature": "concrete",
        "prototype": "colour",
        "attributes": [
            {
                "name": "value",
                "target": {
                    "name": "colour-name"
                }
            }
        ]
    },
    {
        "name": "rgb-colour",
        "nature": "concrete",
        "prototype": "colour",
        "attributes": [
            {
                "name": "red",
                "target": {
                    "name": "rgb"
                }
            },
            {
                "name": "green",
                "target": {
                    "name": "rgb"
                }
            },
            {
                "name": "blue",
                "target": {
                    "name": "rgb"
                }
            }
        ]
    },


    {
        "name": "multi size",
        "nature": "prototype",
        "attributes": []
    },
    {
        "name": "omni-size",
        "nature": "concrete",
        "prototype": "multi size",
        "attributes": [
            {
                "name": "value",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "type",
                "target": {
                    "name": "direction"
                },
                "required": false
            }
        ]
    },
    {
        "name": "direction-size",
        "nature": "concrete",
        "prototype": "multi size",
        "attributes": [
            {
                "name": "top",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "right",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "bottom",
                "target": {
                    "name": "size"
                }
            },
            {
                "name": "left",
                "target": {
                    "name": "size"
                }
            }
        ]
    },

    {
        "name": "rgb",
        "nature": "derivative",
        "base": "number",
        "constraint": {
            "value": {
                "type": "range",
                "range": {
                    "min": { "value": 0 },
                    "max": { "value": 255 }
                }
            }
        }
    },
    {
        "name": "percentage",
        "nature": "derivative",
        "base": "number",
        "constraint": {
            "value": {
                "type": "range",
                "range": {
                    "min": { "value": 0 },
                    "max": { "value": 100 }
                }
            }
        }
    },
    {
        "name": "colour-name",
        "nature": "derivative",
        "base": "string",
        "constraint": {
            "values": [
                "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure",
                "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet",
                "brown", "burlywood", "cadetblue", "chartreuse", "chocolate",
                "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
                "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey",
                "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid",
                "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray",
                "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue",
                "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite",
                "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
                "gray", "green", "greenyellow", "grey", "honeydew", "hotpink",
                "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush",
                "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
                "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
                "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
                "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
                "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
                "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
                "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred",
                "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite",
                "navy", "oldlace", "olive", "olivedrab", "orange", "orangered",
                "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
                "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
                "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon",
                "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
                "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue",
                "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat",
                "white", "whitesmoke", "yellow", "yellowgreen"
            ]
        }
    },
    {
        "name": "size-unit",
        "nature": "derivative",
        "base": "string",
        "constraint": {
            "values": ["px", "em", "rem", "%", "vw", "vh"]
        }
    },
    {
        "name": "direction",
        "nature": "derivative",
        "base": "string",
        "constraint": {
            "values": ["top", "right", "bottom", "left"]
        }
    },
    {
        "name": "alignment",
        "nature": "derivative",
        "base": "string",
        "constraint": {
            "values": ["left", "right", "center", "justify"]
        }
    },
];

const StyleMap = {
    "css": CSSStyleHandler,
    "ref": ReferenceStyleHandler,
    "gss": GentlemanStyleHandler,
};

const GentlemanStyleMap = {
    "text": styleTextHandler,
    "box": styleBoxHandler,
    "size": styleSizeHandler,
};


/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
export function StyleHandler(element, style) {
    if (!isObject(style)) {
        return element;
    }

    for (const rule in style) {
        const value = style[rule];

        let handler = StyleMap[rule];

        if (isFunction(handler)) {
            handler.call(this, element, value);
        }
    }

    return element;
}

/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*[]} schema 
 */
export function ReferenceStyleHandler(element, schema) {
    if (!isIterable(schema)) {
        return element;
    }

    schema.forEach(ref => {
        const { style = {} } = valOrDefault(this.model.getStyleSchema(ref), {});

        StyleHandler.call(this, element, style);
    });

    return element;
}

/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
export function GentlemanStyleHandler(element, style) {
    if (!isObject(style)) {
        return element;
    }

    for (const rule in style) {
        const value = style[rule];

        let handler = GentlemanStyleMap[rule];

        if (isFunction(handler)) {
            handler.call(this, element, value);
        }
    }

    return element;
}

/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function styleTextHandler(element, schema) {
    for (const rule in schema) {
        const value = schema[rule];

        switch (rule) {
            case "bold":
                element.style.fontWeight = resolveBold(value);
                break;
            case "italic":
                element.style.fontStyle = "italic";
                break;
            case "underline":
                element.style.textDecoration = "underline";
                break;
            case "strikethrough":
                element.style.textDecoration = "line-through";
                break;
            case "colour":
            case "color":
                element.style.color = resolveColor(value);
                break;
            case "font":
                element.style.fontFamily = value.toString();
                break;
            case "size":
                element.style.fontSize = resolveSize(value);
                break;
            case "alignment":
            case "align":
                element.style.textAlign = value;
                break;
            default:
                break;
        }
    }

    return element;
}

const formatClass = (val) => val.replace(/\s+/g, ' ').trim();

/**
 * Add class selectors to an element
 * @param {HTMLElement} element 
 * @param {string|string[]} value 
 */
function addClass(element, value) {
    if (Array.isArray(value)) {
        element.classList.add(...value);
    } else {
        let formattedValue = formatClass(value);

        if (isNullOrWhitespace(element.className)) {
            element.className = formattedValue;
        } else {
            addClass(element, formattedValue.split(' '));
        }
    }

    return element;
}

/**
 * Applies CSS style to an element
 * @param {HTMLElement} element 
 * @param {*[]} schema 
 */
function CSSStyleHandler(element, schema) {
    if (!isIterable(schema)) {
        return element;
    }

    addClass(element, schema);

    return element;
}

function resolveColor(schema) {
    const { type, value } = schema;

    switch (type) {
        case "rgb":
            if (isObject(value)) {
                return `rgb(${value.red}, ${value.green}, ${value.blue})`;
            }

            return value;
        case "name":

            return value;
        default:
            return schema;
    }
}

function resolveBold(schema) {
    const { type, value } = schema;

    if (Number.isInteger(schema)) {
        return `${schema}`;
    }

    return "bold";
}

function resolveSize(schema) {
    const { value, unit } = schema;

    return `${value}${unit}`;
}

/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function styleBoxHandler(element, schema) {
    for (const rule in schema) {
        const value = schema[rule];
        switch (rule) {
            case "inner":
                resolveSpace.call(this, element, value, "padding");
                break;
            case "outer":
                resolveSpace.call(this, element, value, "margin");
                break;
            case "border":
                resolveBorder.call(this, element, value);
                break;
            case "background":
                resolveBackground.call(this, element, value);
                break;
            case "width":
                element.style.width = resolveSize.call(this, value);
                break;
            case "height":
                element.style.height = resolveSize.call(this, value);
                break;
            case "overflow":
                element.style.overflow = value;
                break;
            case "opacity":
                element.style.opacity = value / 100;
                break;
            default:
                break;
        }
    }

    return element;
}

/**
 * Resolves the spacing rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveSpace(element, schema, prop) {
    if (Number.isInteger(schema)) {
        element.style[prop] = resolveSize.call(this, schema);
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style[`${[prop]}Top`] = resolveSize.call(this, value);
                    break;
                case "right":
                    element.style[`${[prop]}Right`] = resolveSize.call(this, value);
                    break;
                case "bottom":
                    element.style[`${[prop]}Bottom`] = resolveSize.call(this, value);
                    break;
                case "left":
                    element.style[`${[prop]}Left`] = resolveSize.call(this, value);
                    break;
            }
        }
    }
}


/**
 * Resolves the background rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBackground(element, schema) {
    element.style.backgroundColor = resolveColor.call(this, schema);
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorder(element, schema) {
    if (schema.size) {
        element.style.borderStyle = "solid";
        element.style.borderWidth = resolveSize.call(this, schema.size);
        element.style.borderColor = resolveColor.call(this, schema.color);
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style.borderTopStyle = "solid";
                    element.style.borderTopWidth = resolveSize.call(this, value.size);
                    element.style.borderTopColor = resolveColor.call(this, value.color);
                    break;
                case "right":
                    element.style.borderRightStyle = "solid";
                    element.style.borderRightWidth = resolveSize.call(this, value.size);
                    element.style.borderRightColor = resolveColor.call(this, value.color);
                    break;
                case "bottom":
                    element.style.borderBottomStyle = "solid";
                    element.style.borderBottomWidth = resolveSize.call(this, value.size);
                    element.style.borderBottomColor = resolveColor.call(this, value.color);
                    break;
                case "left":
                    element.style.borderLeftStyle = "solid";
                    element.style.borderLeftWidth = resolveSize.call(this, value.size);
                    element.style.borderLeftColor = resolveColor.call(this, value.color);
                    break;
            }
        }
    }

    if (schema.radius) {
        resolveBorderRadius.call(this, element, schema.radius);
    }
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorderRadius(element, schema) {
    if (Number.isInteger(schema)) {
        element.style.borderRadius = resolveSize.call(this, schema);
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style.borderTopLeftRadius = resolveSize.call(this, value);
                    break;
                case "right":
                    element.style.borderTopRightRadius = resolveSize.call(this, value);
                    break;
                case "bottom":
                    element.style.borderBottomRightRadius = resolveSize.call(this, value);
                    break;
                case "left":
                    element.style.borderBottomLeftRadius = resolveSize.call(this, value);
                    break;
            }
        }
    }
}

/**
 * Applies style constraints to an element
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function styleSizeHandler(element, schema) {
    for (const rule in schema) {
        const value = schema[rule];
        switch (rule) {
            default:
                break;
        }
    }

    return element;
}
