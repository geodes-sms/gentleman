import { isEmpty, isNullOrUndefined,  } from "zenkai";

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

    if (hasAttr(style, "bold")) {
        schema.bold = getValue(style, 'bold');
    }

    if (hasAttr(style, "italic")) {
        schema.italic = getValue(style, 'italic');
    }

    if (hasAttr(style, "underline")) {
        schema.underline = getValue(style, 'underline');
    }

    if (hasAttr(style, "strikethrough")) {
        schema.strikethrough = getValue(style, 'strikethrough');
    }

    if (hasAttr(style, "nonbreakable")) {
        schema.nonbreakable = getValue(style, "nonbreakable");
    }

    if (hasAttr(style, "transform")) {
        schema.transform = getValue(style, "transform");
    }

    if (hasAttr(style, "color") && hasValue(style, "color")) {
        schema.color = buildcolor.call(this, getValue(style, "color", true));
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    if (hasAttr(style, "size")) {
        schema.size = buildSize.call(this, getAttr(style, 'size'));
    }

    if (hasAttr(style, "font") && hasValue(style, "font")) {
        schema.font = getValue(style, "font", true);
    }

    return schema;
}

function buildBoxStyle(style) {
    let schema = {};

    if (hasAttr(style, "inner")) {
        schema.inner = buildSpace.call(this, getAttr(style, "inner"));
    }

    if (hasAttr(style, "outer")) {
        schema.outer = buildSpace.call(this, getAttr(style, "outer"));
    }

    if (hasAttr(style, "background")) {
        schema.background = buildBackground.call(this, getAttr(style, "background"));
    }

    if (hasAttr(style, "width")) {
        schema.width = buildSize.call(this, getAttr(style, "width"));
    }

    if (hasAttr(style, "height")) {
        schema.height = buildSize.call(this, getAttr(style, "height"));
    }

    if (hasAttr(style, "border")) {
        schema.border = buildBorder.call(this, getAttr(style, "border"));
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    return schema;
}

function buildSpace(style) {
    let schema = {};

    ["all", "top", "right", "bottom", "left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            schema[dir] = buildSize.call(this, getAttr(style, dir));
        }
    });

    return schema;
}

function buildBorder(style) {
    let schema = {};

    ["all", "top", "right", "bottom", "left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            let value = getAttr(style, dir);

            schema[dir] = {
                width: buildSize.call(this, getAttr(value, "width")),
                color: buildcolor.call(this, getValue(value, "color", true)),
                type: getValue(value, "type")
            };
        }
    });

    return schema;
}

function buildBackground(style) {
    let schema = {};

    if (hasAttr(style, "color")) {
        let color = getAttr(style, "color");
        schema.color = buildcolor.call(this, getValue(color, "value", true));
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