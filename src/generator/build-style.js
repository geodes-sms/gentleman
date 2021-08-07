import { isEmpty, isNullOrUndefined, } from "zenkai";

const ATTR_NAME = "name";


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();


export function buildStyle(style) {
    let schema = {};

    if (hasAttr(style, "css") && hasValue(style, "css")) {
        schema.css = getValue(style, "css", true);
    }

    if (hasAttr(style, "ref") && hasValue(style, "ref")) {
        schema.ref = getValue(style, "ref", true).map(ref => getName(this.conceptModel.getConcept(ref)));
    }

    if (hasAttr(style, "gss")) {
        schema.gss = buildGentlemanStyle.call(this, getAttr(style, "gss"));
    }

    if (hasAttr(style, "text")) {
        schema.text = buildTextStyle.call(this, getAttr(style, "text"));
    }

    if (hasAttr(style, "box")) {
        schema.box = buildBoxStyle.call(this, getAttr(style, "box"));
    }

    return schema;
}


export function buildGentlemanStyle(style) {
    let schema = {};

    if (hasAttr(style, "text")) {
        schema.text = buildTextStyle.call(this, getAttr(style, "text"));
    }

    if (hasAttr(style, "box")) {
        schema.box = buildBoxStyle.call(this, getAttr(style, "box"));
    }

    return schema;
}

function buildTextStyle(style) {
    let schema = {};

    if (hasAttr(style, "bold") && getValue(style, 'bold')) {
        schema.bold = true;
    }

    if (hasAttr(style, "italic") && getValue(style, 'italic')) {
        schema.italic = true;
    }

    if (hasAttr(style, "underline") && getValue(style, 'underline')) {
        schema.underline = true;
    }

    if (hasAttr(style, "strikethrough") && getValue(style, 'strikethrough')) {
        schema.strikethrough = true;
    }

    if (hasAttr(style, "nonbreakable") && getValue(style, "nonbreakable")) {
        schema.nonbreakable = true;
    }

    if (hasAttr(style, "transform") && hasValue(style, "transform")) {
        schema.transform = getValue(style, "transform");
    }

    if (hasAttr(style, "color") && hasValue(style, "color")) {
        let value = buildcolor.call(this, getAttr(style, "color"));
        if (value) {
            schema.color = value;
        }
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    if (hasAttr(style, "size")) {
        let value = buildSize.call(this, getAttr(style, 'size'));
        if (value) {
            schema.size = value;
        }
    }

    // if (hasAttr(style, "font") && hasValue(style, "font")) {
    //     schema.font = getValue(style, "font", true);
    // }

    return schema;
}

function buildBoxStyle(style) {
    let schema = {};

    if (hasAttr(style, "inner")) {
        let value = buildSpace.call(this, getAttr(style, "inner"));
        if (value) {
            schema.inner = value;
        }
    }

    if (hasAttr(style, "outer")) {
        let value = buildSpace.call(this, getAttr(style, "outer"));
        if (value) {
            schema.outer = value;
        }
    }

    if (hasAttr(style, "background")) {
        schema.background = buildBackground.call(this, getAttr(style, "background"));
    }

    if (hasAttr(style, "width")) {
        let value = buildSize.call(this, getAttr(style, "width"));
        if (value) {
            schema.width = value;
        }
    }

    if (hasAttr(style, "height")) {
        let value = buildSize.call(this, getAttr(style, "height"));
        if (value) {
            schema.height = value;
        }
    }

    if (hasAttr(style, "border")) {
        schema.border = buildBorder.call(this, getAttr(style, "border"));
    }

    if (hasAttr(style, "corner")) {
        schema.corner = buildCorner.call(this, getAttr(style, "corner"));
    }

    if (hasAttr(style, "shadow")) {
        let value = buildShadow.call(this, getAttr(style, "shadow"));
        if (value) {
            schema.shadow = value;
        }
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    return schema;
}

function buildSpace(style) {
    let schema = {};

    let hasValue = false;

    ["all", "top", "right", "bottom", "left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            let value = buildSize.call(this, getAttr(style, dir));
            if (!isNullOrUndefined(value)) {
                schema[dir] = value;
                hasValue = true;
            }
        }
    });

    if (!hasValue) {
        return null;
    }

    return schema;
}

function buildBorder(style) {
    let schema = {};

    ["all", "top", "right", "bottom", "left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            let value = getAttr(style, dir);

            let width = buildSize.call(this, getAttr(value, "width"));

            if (width) {
                let color = getAttr(value, "color");

                schema[dir] = {
                    width: width,
                    // color: buildcolor.call(this, getValue(value, "color", true)),
                    color: buildcolor.call(this, color),
                    type: getValue(value, "type")
                };
            }
        }
    });

    return schema;
}

function buildCorner(style) {
    let schema = {};

    let hasValue = false;

    ["all", "top-left", "top-right", "bottom-right", "bottom-left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            let value = buildSize.call(this, getAttr(style, dir));
            if (!isNullOrUndefined(value)) {
                schema[dir] = value;
                hasValue = true;
            }
        }
    });

    if (!hasValue) {
        return null;
    }

    return schema;
}

function buildBackground(style) {
    let schema = {};

    if (hasAttr(style, "color")) {
        let color = getAttr(style, "color");
        // schema.color = buildcolor.call(this, getValue(color, "value", true));
        schema.color = buildcolor.call(this, color);
    }

    if (hasAttr(style, "image")) {
        let image = getAttr(style, "image");
        schema.image = getValue(image, "url");
    }

    return schema;
}

function buildcolor(color) {
    let schema = {};

    if (isNullOrUndefined(color)) {
        return schema;
    }

    if (color.name === "hex-color") {
        if (!hasValue(color, "value")) {
            return null;
        }

        schema.type = "hex";
        let value = getValue(color, "value") || "";
        schema.value = value.startsWith("#") ? value : `#${value}`;
    } else if (color.name === "rgb-color") {
        schema.type = "rgb";
        schema.value = {
            red: getValue(color, "red"),
            green: getValue(color, "green"),
            blue: getValue(color, "blue"),
        };
    }

    return schema;
}

function buildSize(size) {
    if (isNullOrUndefined(size) || !hasValue(size, "value")) {
        return null;
    }

    let schema = {
        value: getValue(size, "value"),
        unit: getValue(size, "unit")
    };

    return schema;
}

function buildShadow(shadow) {
    if (isNullOrUndefined(shadow)) {
        return null;
    }

    const PROP_OFFSET_X = "offsetX";
    const PROP_OFFSET_Y = "offsetY";
    const PROP_BLUR = "blur";
    const PROP_SPREAD = "spread";
    const PROP_INSET = "inset";

    let remain = 3;
    let schema = {};

    if (hasAttr(shadow, PROP_OFFSET_X)) {
        let value = buildSize.call(this, getAttr(shadow, PROP_OFFSET_X));
        if (!isNullOrUndefined(value)) {
            schema[PROP_OFFSET_X] = value;
            remain--;
        }
    }

    if (hasAttr(shadow, PROP_OFFSET_Y)) {
        let value = buildSize.call(this, getAttr(shadow, PROP_OFFSET_Y));
        if (!isNullOrUndefined(value)) {
            schema[PROP_OFFSET_Y] = value;
            remain--;
        }
    }

    if (hasAttr(shadow, PROP_BLUR)) {
        let value = buildSize.call(this, getAttr(shadow, PROP_BLUR));
        if (!isNullOrUndefined(value)) {
            schema[PROP_BLUR] = value;
            remain--;
        }
    }

    if (hasAttr(shadow, PROP_SPREAD)) {
        let value = buildSize.call(this, getAttr(shadow, PROP_SPREAD));
        if (!isNullOrUndefined(value)) {
            schema[PROP_SPREAD] = value;
            remain--;
        }
    }

    if (remain > 0) {
        return null;
    }

    if (hasAttr(shadow, PROP_INSET) && getValue(shadow, PROP_INSET)) {
        schema[PROP_INSET] = true;
    }

    if (hasAttr(shadow, "color")) {
        let color = getAttr(shadow, "color");
        // schema.color = buildcolor.call(this, getValue(color, "value", true));
        schema.color = buildcolor.call(this, color);
    }

    return schema;
}