import { isNullOrUndefined, isEmpty, valOrDefault, isNullOrWhitespace, isFunction } from "zenkai";
import { NotificationType } from "@utils/index.js";


const PROP_TYPE = "type";
const PROP_HANDLER = "handler";


const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
const ATTR_DESCRIPTION = "description";
const ATTR_NAME = "name";
const ATTR_STYLE = "style";
const ATTR_REQUIRED = "required";
const ATTR_PROTOTYPE = "prototype";
const ATTR_TAGS = "tags";
const ATTR_VALUE = "value";


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getReferenceName = (concept, attr) => getName(getReference(concept, attr));

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();

const getDescription = (concept) => getValue(concept, ATTR_DESCRIPTION);


const ProjectionBuildHandler = {
    "projection": buildProjection,
    "template": buildTemplate,
    "style": buildStyleRule,
};

const ProjectionHandler = {
    "layout": buildLayout,
    "field": buildField,
};

export function buildProjectionHandler(model) {
    const result = [];
    const buildErrors = [];

    const concepts = model.getConcepts(["projection", "template", "style rule"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: There was no projection found to be built.", NotificationType.WARNING);

        return false;
    }

    concepts.forEach(concept => {
        const handler = ProjectionBuildHandler[valOrDefault(concept.getBuildProperty(PROP_HANDLER), "")];

        if (!isFunction(handler)) {
            throw new Error("The projection's is missing a build handler.");
        }

        const { success, errors, message } = handler.call(model, concept);

        if (!success) {
            buildErrors.push(...errors);
        } else {
            result.push(message);
        }
    });


    if (!isEmpty(buildErrors)) {
        this.notify("<strong>Validation failed</strong>: The model could not be built.<br> <em>See Log for more details</em>.", NotificationType.ERROR);
        console.error(buildErrors);

        return false;
    }

    this.notify("<strong>Build succeeded</strong>: The projection model was successfully built", NotificationType.SUCCESS);
    console.log(result);

    return result;
}


function buildProjection(concept) {
    const buildErrors = [];

    const tags = hasAttr(concept, ATTR_TAGS) ? getAttr(concept, ATTR_TAGS).build() : [];


    if (!hasValue(concept, ATTR_CONTENT)) {
        buildErrors.push("The projection is missing a content.");
    }

    if (!isEmpty(buildErrors)) {
        return {
            success: false,
            message: "Validation failed: The projection could not be built.",
            errors: buildErrors,
        };
    }

    const content = getValue(concept, ATTR_CONTENT);

    const contentType = content.getBuildProperty("contentType");

    let schema = {
        "id": concept.id,
        "concept": buildConcept.call(this, getAttr(concept, ATTR_CONCEPT)),
        "type": contentType,
        "tags": tags,
        "content": ProjectionHandler[contentType].call(this, content),
        "metadata": JSON.stringify(concept.export()),
    };

    if (hasAttr(concept, ATTR_NAME) && hasValue(concept, ATTR_NAME)) {
        schema.name = getName(concept);
    }

    return {
        success: true,
        message: schema,
    };
}

function buildTemplate(concept) {
    const buildErrors = [];

    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        buildErrors.push("The template is missing a name.");
    }

    if (!hasValue(concept, ATTR_CONTENT)) {
        buildErrors.push("The template is missing a content.");
    }

    if (!isEmpty(buildErrors)) {
        return {
            success: false,
            message: "Validation failed: The template could not be built.",
            errors: buildErrors,
        };
    }

    const content = [];

    getValue(concept, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue();
        content.push(buildElement.call(this, element));
    });

    let schema = {
        "id": concept.id,
        "type": "template",
        "name": name,
        "content": content,
    };


    return {
        success: true,
        message: schema,
    };
}

function buildStyleRule(concept) {
    const buildErrors = [];

    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        buildErrors.push("The style rule is missing a name.");
    }

    if (!hasValue(concept, ATTR_STYLE)) {
        buildErrors.push("The style rule is missing a rule.");
    }

    if (!isEmpty(buildErrors)) {
        return {
            success: false,
            message: "Validation failed: The style rule could not be built.",
            errors: buildErrors,
        };
    }

    const style = buildGentlemanStyle.call(this, getAttr(concept, ATTR_STYLE));

    let schema = {
        "id": concept.id,
        "type": "style",
        "name": name,
        "style": style,
    };

    return {
        success: true,
        message: schema,
    };
}

function buildConcept(concept) {
    const result = {};

    if (hasAttr(concept, ATTR_NAME)) {
        result[ATTR_NAME] = hasValue(concept, ATTR_NAME) ? getValue(concept, ATTR_NAME).toLowerCase() : null;
    }

    if (hasAttr(concept, ATTR_PROTOTYPE)) {
        result[ATTR_PROTOTYPE] = hasValue(concept, ATTR_PROTOTYPE) ? getValue(concept, ATTR_PROTOTYPE).toLowerCase() : null;
    }

    return result;
}

function buildLayout(layout) {
    var schema = {};
    var disposition = [];

    if (layout.name === "stack layout") {
        schema.type = "stack";
        schema.orientation = getValue(layout, 'orientation');

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement.call(this, element));
        });
    } else if (layout.name === "wrap layout") {
        schema.type = "wrap";

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement.call(this, element));
        });
    } else if (layout.name === "cell layout") {
        schema.type = "table";
        schema.orientation = getValue(layout, 'orientation');
        getValue(layout, "rows").forEach(row => {
            const cells = [];
            getValue(row, "cells").forEach(cell => {
                let span = getValue(cell, "span");
                let content = getValue(cell, "content");
                cells.push({
                    "type": "cell",
                    "span": span,
                    "content": buildElement.call(this, content)
                });
            });
            disposition.push(cells);
        });
    }

    if (layout.isAttributeCreated("style")) {
        schema.style = buildStyle.call(this, getAttr(layout, 'style'));
    }

    schema.disposition = disposition;

    return schema;
}

function buildElement(element) {
    const contentType = element.getBuildProperty("contentType");
    const elementType = element.getBuildProperty("elementType");

    if (contentType === "static") {
        let schema = {
            type: contentType,
            static: buildStatic.call(this, element, elementType)
        };

        return schema;
    }

    if (contentType === "attribute") {
        let schema = {
            type: contentType,
            name: getValue(element, "value")
        };

        if (element.isAttributeCreated("tag")) {
            schema.tag = getValue(element, "tag");
        }

        return schema;
    }

    if (contentType === "layout") {
        return {
            type: contentType,
            layout: buildLayout.call(this, element)
        };
    }

    if (contentType === "field") {
        return {
            type: contentType,
            field: buildField.call(this, element)
        };
    }

    if (contentType === "template") {
        let schema = {
            type: contentType,
            name: getReferenceName(element, ATTR_VALUE),
        };

        return schema;
    }

    return null;
}

function buildStatic(element, type) {
    let schema = {
        type: type
    };

    if (type === "text") {
        schema.content = getValue(element, "content");
        schema.contentType = getValue(element, "content type");
    } else if (type === "image") {
        schema.url = getValue(element, "url");
        schema.alt = getValue(element, "alternative text");
        schema.width = getValue(element, "width");
        schema.height = getValue(element, "height");
    } else if (type === "html") {
        schema.selector = getValue(element, "selector");
    } else if (type === "link") {
        schema.url = getValue(element, "url");
        schema.urlType = getValue(element, "url type");
        schema.content = [];

        getValue(element, "content").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            schema.content.push(buildElement.call(this, element));
        });
    }

    if (hasAttr(element, "style")) {
        schema.style = buildStyle.call(this, getAttr(element, 'style'));
    }

    return schema;
}

function buildField(field) {
    var schema = {
        readonly: getValue(field, "readonly"),
        disabled: getValue(field, "disabled"),
    };

    if (field.name === "text field") {
        schema.type = "text";
        schema.multiline = getValue(field, "multiline");
        schema.resizable = getValue(field, "resizable");

        if (field.isAttributeCreated("input")) {
            schema.input = buildInput.call(this, getAttr(field, "input"));
        }
    } else if (field.name === "binary field") {
        schema.type = "binary";

        schema.state = {
            "true": {
                "content": getValue(field, "true-state").filter(proto => proto.hasValue())
                    .map(proto => buildElement.call(this, proto.getValue()))
            },
            "false": {
                "content": getValue(field, "false-state").filter(proto => proto.hasValue())
                    .map(proto => buildElement.call(this, proto.getValue()))
            }
        };
    } else if (field.name === "choice field") {
        schema.type = "choice";
        schema.choice = {};

        if (field.isAttributeCreated("choice template")) {
            schema.choice.option = {
                "template": buildFieldTemplate.call(this, getAttr(field, "choice template"))
            };
        }
        if (field.isAttributeCreated("choice template")) {
            schema.selection = {
                "template": buildFieldTemplate.call(this, getAttr(field, "selection template"))
            };
        }
    } else if (field.name === "list field") {
        schema.type = "list";
        schema.list = {};

        if (field.isAttributeCreated("item template")) {
            schema.list.item = {
                "template": buildFieldTemplate.call(this, getAttr(field, "item template"))
            };
        }
    } else if (field.name === "table field") {
        schema.type = "table";
        schema.table = {};

        if (field.isAttributeCreated("item template")) {
            schema.table.row = {
                "template": buildFieldTemplate.call(this, getAttr(field, "item template"))
            };
        }

        if (field.isAttributeCreated("header")) {
            schema.header = buildStyle.call(this, getAttr(field, "header"));
        }

        if (field.isAttributeCreated("body")) {
            schema.header = buildStyle.call(this, getAttr(field, "body"));
        }

        if (field.isAttributeCreated("footer")) {
            schema.header = buildStyle.call(this, getAttr(field, "footer"));
        }
    }

    if (field.isAttributeCreated("style")) {
        schema.style = buildStyle.call(this, getAttr(field, "style"));
    }


    return schema;
}

function buildInput(element) {
    let schema = {
        placeholder: getValue(element, "placeholder")
    };

    if (hasAttr(element, "style")) {
        schema.style = buildStyle.call(this, getAttr(element, 'style'));
    }

    return schema;
}

function buildFieldTemplate(element) {
    let schema = {
        "tag": getValue(element, "tag"),
        "name": getValue(element, "name"),
    };

    if (hasAttr(element, "style")) {
        schema.style = buildStyle.call(this, getAttr(element, 'style'));
    }

    return schema;
}

function buildStyle(style) {
    let schema = {};

    if (hasAttr(style, "css")) {
        schema.css = getAttr(style, "css").build();
    }

    if (hasAttr(style, "ref")) {
        schema.ref = getValue(style, "ref", true).map(ref => getName(this.getConcept(ref)));
    }

    if (hasAttr(style, "gss")) {
        schema.gss = buildGentlemanStyle.call(this, getAttr(style, "gss"));
    }

    return schema;
}

function buildGentlemanStyle(style) {
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

    if (hasAttr(style, "colour") && hasValue(style, "colour")) {
        schema.color = buildColour.call(this, getValue(style, 'colour'));
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    if (hasAttr(style, "size")) {
        schema.size = buildSize.call(this, getAttr(style, 'size'));
    }

    if (hasAttr(style, "font") && hasValue(style, "font")) {
        schema.font = getAttr(style, "font").build();
    }

    if (hasAttr(style, "alignment") && hasValue(style, "alignment")) {
        schema.alignment = getValue(style, "alignment");
    }

    return schema;
}

function buildBoxStyle(style) {
    let schema = {};

    if (hasAttr(style, "inner space")) {
        schema.inner = buildSpace.call(this, getAttr(style, "inner space"));
    }

    if (hasAttr(style, "outer space")) {
        schema.outer = buildSpace.call(this, getAttr(style, "outer space"));
    }

    if (hasAttr(style, "background") && hasValue(style, "background")) {
        schema.background = buildColour.call(this, getValue(style, "background"));
    }

    if (hasAttr(style, "width")) {
        schema.width = buildSize.call(this, getAttr(style, "width"));
    }

    if (hasAttr(style, "height")) {
        schema.height = buildSize.call(this, getAttr(style, "height"));
    }

    if (hasAttr(style, "opacity") && hasValue(style, "opacity")) {
        schema.opacity = getValue(style, 'opacity');
    }

    return schema;
}

function buildSpace(style) {
    let schema = {};

    ["top", "right", "bottom", "left"].forEach(dir => {
        if (hasAttr(style, dir)) {
            schema[dir] = buildSize.call(this, getAttr(style, dir));
        }
    });

    return schema;
}

function buildColour(colour) {
    let schema = {};

    if (colour.name === "name colour") {
        schema.type = "name";
        schema.value = getValue(colour, "value");
    } else if (colour.name === "rgb colour") {
        schema.type = "rgb";
        schema.value = {
            red: getValue(colour, "red"),
            green: getValue(colour, "green"),
            blue: getValue(colour, "blue"),
        };
    }

    return schema;
}

function buildSize(size) {
    let schema = {
        value: getValue(size, "value"),
        unit: getValue(size, "unit")
    };

    return schema;
}