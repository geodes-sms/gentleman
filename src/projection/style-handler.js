import {
    isObject, isIterable, isNullOrWhitespace, valOrDefault, isFunction, isNullOrUndefined, capitalizeFirstLetter
} from "zenkai";

function resolveValue(content) {
    const { type } = content;

    let source = this.concept || this.source;

    if (type === "property") {
        return valOrDefault(source.getProperty(content.name), "");
    }

    if (type === "param") {
        return this.projection.getParam(content.name);
    }

    return content;
}

const StyleMap = {
    "css": CSSStyleHandler,
    "ref": ReferenceStyleHandler,
    "gss": GentlemanStyleHandler,
    "text": styleTextHandler,
    "box": styleBoxHandler,
    "html": HTMLStyleHandler,
};

const GentlemanStyleMap = {
    "text": styleTextHandler,
    "box": styleBoxHandler,
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

        if (style.gss) {
            StyleHandler.call(this, element, style);
        } else {
            GentlemanStyleHandler.call(this, element, style);
        }
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

        if (value === false) {
            continue;
        }

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
                element.style.fontFamily = value.toString();
                break;
            case "size":
                element.style.fontSize = resolveSize(value);
                break;
            case "transform":
                element.style.textTransform = value;
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

/**
 * Applies HTML style to an element
 * @param {HTMLElement} element 
 * @param {*[]} schema 
 */
function HTMLStyleHandler(element, schema) {
    if (!isIterable(schema)) {
        return element;
    }

    schema.forEach(prop => {
        let name = `style${capitalizeFirstLetter(prop.name)}`;
        element.dataset[name] = resolveValue.call(this, prop.value);

        if (prop.value.type === "property") {
            this.registerHandler("value.changed", (value) => {
                element.dataset[name] = resolveValue.call(this, prop.value);
            });
        }
    });

    return element;
}

function resolveColor(schema) {
    if (isNullOrUndefined(schema)) {
        return "";
    }


    const { type, value } = schema;

    switch (type) {
        case "rgb":
            if (isObject(value)) {
                return `rgb(${value.red}, ${value.green}, ${value.blue})`;
            }

            return value;
        case "name":

            return value;
        case "hexadecimal":

            return value;
        default:
            return value || schema;
    }
}

function resolveBold(schema) {
    if (isNullOrUndefined(schema)) {
        return "";
    }

    const { type, value } = schema;

    if (Number.isInteger(schema)) {
        return `${schema}`;
    }

    return "bold";
}

function resolveSize(schema) {
    if (isNullOrUndefined(schema)) {
        return "";
    }

    const { value = 0, unit } = schema;

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

        if (value === false) {
            continue;
        }
        
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
            case "corner":
                resolveCorner.call(this, element, value);
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
    if (isNullOrUndefined(schema)) {
        return;
    }
    for (const rule in schema) {
        const value = schema[rule];
        switch (rule) {
            case "all":
                element.style[`${[prop]}`] = resolveSize.call(this, value);
                break;
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


/**
 * Resolves the background rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBackground(element, schema) {
    if (isNullOrUndefined(schema)) {
        return;
    }

    const { color, image } = schema;

    if (color) {
        element.style.backgroundColor = resolveColor.call(this, color);
    }

    if (image) {
        element.style.backgroundImage = `url(${image})`;
    }
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorder(element, schema) {
    if (isNullOrUndefined(schema)) {
        return;
    }

    for (const rule in schema) {
        const value = schema[rule];
        switch (rule) {
            case "all":
                element.style.borderStyle = valOrDefault(value.type, "solid");
                element.style.borderWidth = resolveSize.call(this, value.width);
                element.style.borderColor = resolveColor.call(this, value.color);

                break;
            case "top":
                element.style.borderTopStyle = valOrDefault(value.type, "solid");
                element.style.borderTopWidth = resolveSize.call(this, value.width);
                element.style.borderTopColor = resolveColor.call(this, value.color);

                break;
            case "right":
                element.style.borderRightStyle = valOrDefault(value.type, "solid");
                element.style.borderRightWidth = resolveSize.call(this, value.width);
                element.style.borderRightColor = resolveColor.call(this, value.color);

                break;
            case "bottom":
                element.style.borderBottomStyle = valOrDefault(value.type, "solid");
                element.style.borderBottomWidth = resolveSize.call(this, value.width);
                element.style.borderBottomColor = resolveColor.call(this, value.color);

                break;
            case "left":
                element.style.borderLeftStyle = valOrDefault(value.type, "solid");
                element.style.borderLeftWidth = resolveSize.call(this, value.width);
                element.style.borderLeftColor = resolveColor.call(this, value.color);

                break;
        }
    }
}

/**
 * Resolves the background rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveCorner(element, schema) {
    if (isNullOrUndefined(schema)) {
        return;
    }

    const { radius } = schema;

    if (radius) {
        resolveBorderRadius.call(this, element, schema.radius);
    }
}

/**
 * Resolves the border rules
 * @param {HTMLElement} element 
 * @param {*} schema 
 */
function resolveBorderRadius(element, schema) {
    if (isNullOrUndefined(schema)) {
        return;
    }

    for (const rule in schema) {
        const value = schema[rule];

        switch (rule) {
            case "all":
                element.style.borderRadius = resolveSize.call(this, value);
                break;
            case "top-left":
                element.style.borderTopLeftRadius = resolveSize.call(this, value);
                break;
            case "top-right":
                element.style.borderTopRightRadius = resolveSize.call(this, value);
                break;
            case "bottom-right":
                element.style.borderBottomRightRadius = resolveSize.call(this, value);
                break;
            case "bottom-left":
                element.style.borderBottomLeftRadius = resolveSize.call(this, value);
                break;
        }
    }
}