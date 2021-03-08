import { isObject, isIterable, isNullOrWhitespace } from "zenkai";

const StyleMap = {
    "text": styleTextHandler,
    "box": styleBoxHandler,
    "css": styleCSSHandler,
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
        StyleMap[rule](element, value);
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
            case "color":
                element.style.color = resolveColor(value);
                break;
            case "font":
                element.style.fontFamily = value;
                break;
            case "highlight":
                element.style.backgroundColor = resolveColor(value);
                break;
            case "size":
                element.style.fontSize = resolveSize(value);
                break;
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
 * @param {*} schema 
 */
function styleCSSHandler(element, schema) {
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

function resolveSize(schema, unit = "px") {
    const { type, value } = schema;

    if (Number.isInteger(schema)) {
        return `${schema}${unit}`;
    }

    return 0;

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
                resolveSpace(element, value, "padding");
                break;
            case "outer":
                resolveSpace(element, value, "margin");
                break;
            case "border":
                resolveBorder(element, value);
                break;
            case "background":
                resolveBackground(element, value);
                break;
            case "width":
                element.style.width = resolveSize(value, "%");
                break;
            case "height":
                element.style.height = resolveSize(value, "%");
                break;
            case "overflow":
                element.style.overflow = value;
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
        element.style[prop] = `${schema}px`;
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style[`${[prop]}Top`] = `${value}px`;
                    break;
                case "right":
                    element.style[`${[prop]}Right`] = `${value}px`;
                    break;
                case "bottom":
                    element.style[`${[prop]}Bottom`] = `${value}px`;
                    break;
                case "left":
                    element.style[`${[prop]}Left`] = `${value}px`;
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
    element.style.backgroundColor = resolveColor(schema);
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorder(element, schema) {
    if (schema.size) {
        element.style.borderStyle = "solid";
        element.style.borderWidth = resolveSize(schema.size);
        element.style.borderColor = resolveColor(schema.color);
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style.borderTopStyle = "solid";
                    element.style.borderTopWidth = resolveSize(value.size);
                    element.style.borderTopColor = resolveColor(value.color);
                    break;
                case "right":
                    element.style.borderRightStyle = "solid";
                    element.style.borderRightWidth = resolveSize(value.size);
                    element.style.borderRightColor = resolveColor(value.color);
                    break;
                case "bottom":
                    element.style.borderBottomStyle = "solid";
                    element.style.borderBottomWidth = resolveSize(value.size);
                    element.style.borderBottomColor = resolveColor(value.color);
                    break;
                case "left":
                    element.style.borderLeftStyle = "solid";
                    element.style.borderLeftWidth = resolveSize(value.size);
                    element.style.borderLeftColor = resolveColor(value.color);
                    break;
            }
        }
    }

    if (schema.radius) {
        resolveBorderRadius(element, schema.radius);
    }
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorderRadius(element, schema) {
    if (Number.isInteger(schema)) {
        element.style.borderRadius = resolveSize(schema);
    } else {
        for (const rule in schema) {
            const value = schema[rule];
            switch (rule) {
                case "top":
                    element.style.borderTopLeftRadius = resolveSize(value);
                    break;
                case "right":
                    element.style.borderTopRightRadius = resolveSize(value);
                    break;
                case "bottom":
                    element.style.borderBottomRightRadius = resolveSize(value);
                    break;
                case "left":
                    element.style.borderBottomLeftRadius = resolveSize(value);
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
            case "bold":

                break;
            default:
                break;
        }
    }

    return element;
}
