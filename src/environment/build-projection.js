import { isNullOrUndefined, isEmpty, valOrDefault, isNullOrWhitespace, isFunction } from "zenkai";
import { NotificationType } from "@utils/index.js";


const projections = [
    {
        "concept": { "name": "set" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "list"
        }
    },
    {
        "concept": { "name": "string" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "text"
        }
    },
    {
        "concept": { "name": "boolean" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "binary"
        }
    },
    {
        "concept": { "name": "number" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "text"
        }
    },
    {
        "concept": { "name": "reference" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "choice"
        }
    },
    {
        "concept": { "name": "prototype" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "choice"
        }
    }
];

const PROP_TYPE = "type";
const PROP_HANDLER = "handler";


const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
const ATTR_DESCRIPTION = "description";
const ATTR_NAME = "name";
const ATTR_REQUIRED = "required";
const ATTR_PROTOTYPE = "prototype";
const ATTR_TAGS = "tags";
const ATTR_VALUE = "value";


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();

const getDescription = (concept) => getValue(concept, ATTR_DESCRIPTION);


const ProjectionBuildHandler = {
    "projection": (concept) => buildProjection(concept),
    "template": (concept) => buildTemplate(concept),
};

const ProjectionHandler = {
    "layout": (concept) => buildLayout(concept),
    "field": (concept) => buildField(concept),
    "element": (concept) => buildElement(concept, "element"),
};

export function buildProjectionHandler(model) {
    const result = [...projections];
    const buildErrors = [];

    const concepts = model.getConcepts(["projection", "template"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: There was no projection found to be built.", NotificationType.WARNING);

        return false;
    }

    concepts.forEach(concept => {
        const handler = ProjectionBuildHandler[valOrDefault(concept.getBuildProperty(PROP_HANDLER), "")];

        if (!isFunction(handler)) {
            throw new Error("The projection's is missing a build handler.");
        }

        const { success, errors, message } = handler(concept);

        if (!success) {
            buildErrors.push(...errors);
        } else {
            if (result.find(p => p.name && p.name === message.name)) {
                buildErrors.push(`The model has two projections with the same name: ${message.name}`);
            } else {
                result.push(message);
            }
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
        "concept": buildConcept(getAttr(concept, ATTR_CONCEPT)),
        "type": contentType,
        "tags": tags,
        "content": ProjectionHandler[contentType](content),
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
        content.push(buildElement(element));
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
            disposition.push(buildElement(element));
        });
    } else if (layout.name === "wrap layout") {
        schema.type = "wrap";

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
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
                    "content": buildElement(content)
                });
            });
            disposition.push(cells);
        });
    } else if (layout.name === "relative layout") {
        schema.type = "relative";
    }

    if (layout.isAttributeCreated("style")) {
        schema.style = buildStyle(getAttr(layout, 'style'));
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
            static: buildStatic(element, elementType)
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
            layout: buildLayout(element)
        };
    }

    if (contentType === "field") {
        return {
            type: contentType,
            field: buildField(element)
        };
    }

    if (contentType === "template") {
        let schema = {
            type: contentType,
            name: getName(getReference(element, ATTR_VALUE))
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
            schema.content.push(buildElement(element));
        });
    }

    if (hasAttr(element, "style")) {
        schema.style = buildStyle(getAttr(element, 'style'));
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
            schema.input = buildInput(getAttr(field, "input"));
        }
    } else if (field.name === "binary field") {
        schema.type = "binary";

        schema.state = {
            "true": {
                "content": getValue(field, "true-state").filter(proto => proto.hasValue())
                    .map(proto => buildElement(proto.getValue()))
            },
            "false": {
                "content": getValue(field, "false-state").filter(proto => proto.hasValue())
                    .map(proto => buildElement(proto.getValue()))
            }
        };
    } else if (field.name === "choice field") {
        schema.type = "choice";
        schema.choice = {};

        if (field.isAttributeCreated("choice template")) {
            schema.choice.option = {
                "template": buildFieldTemplate(getAttr(field, "choice template"))
            };
        }
        if (field.isAttributeCreated("choice template")) {
            schema.selection = {
                "template": buildFieldTemplate(getAttr(field, "selection template"))
            };
        }
    } else if (field.name === "list field") {
        schema.type = "list";
        schema.list = {};

        if (field.isAttributeCreated("item template")) {
            schema.list.item = {
                "template": buildFieldTemplate(getAttr(field, "item template"))
            };
        }
    } else if (field.name === "table field") {
        schema.type = "table";
        schema.table = {};

        if (field.isAttributeCreated("item template")) {
            schema.table.row = {
                "template": buildFieldTemplate(getAttr(field, "item template"))
            };
        }

        if (field.isAttributeCreated("header")) {
            schema.header = buildStyle(getAttr(field, "header"));
        }

        if (field.isAttributeCreated("body")) {
            schema.header = buildStyle(getAttr(field, "body"));
        }

        if (field.isAttributeCreated("footer")) {
            schema.header = buildStyle(getAttr(field, "footer"));
        }
    }

    if (field.isAttributeCreated("style")) {
        schema.style = buildStyle(getAttr(field, "style"));
    }


    return schema;
}

function buildInput(element) {
    let schema = {
        placeholder: getValue(element, "placeholder")
    };

    if (hasAttr(element, "style")) {
        schema.style = buildStyle(getAttr(element, 'style'));
    }

    return schema;
}

function buildFieldTemplate(element) {
    let schema = {
        "tag": getValue(element, "tag"),
        "name": getValue(element, "name"),
    };

    if (hasAttr(element, "style")) {
        schema.style = buildStyle(getAttr(element, 'style'));
    }

    return schema;
}

function buildStyle(style) {
    let schema = {};

    if (style.isAttributeCreated("css")) {
        schema.css = getAttr(style, 'css').build();
    }

    let textStyle = getAttr(style, 'text');
    schema.text = {};

    if (hasAttr(textStyle, "bold")) {
        schema.text.bold = getValue(textStyle, 'bold');
    }
    if (hasAttr(textStyle, "italic")) {
        schema.text.italic = getValue(textStyle, 'italic');
    }
    if (hasAttr(textStyle, "underline")) {
        schema.text.underline = getValue(textStyle, 'underline');
    }
    if (hasAttr(textStyle, "strikethrough")) {
        schema.text.strikethrough = getValue(textStyle, 'strikethrough');
    }
    if (hasAttr(textStyle, "colour") && hasValue(textStyle, "colour")) {
        schema.text.color = buildColour(getValue(textStyle, 'colour'));
    }
    if (hasAttr(textStyle, "size") && hasValue(textStyle, "size")) {
        schema.text.size = buildSize(getValue(textStyle, 'size'));
    }

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
    let schema = {};

    if (size.name === "pixel") {
        schema.type = "pixel";
        schema.value = getValue(size, "value");
    } else if (size.name === "percentage") {
        schema.type = "percentage";
        schema.ref = getValue(size, "type");
        schema.value = getValue(size, "value");
    } else if (size.name === "multiplier") {
        schema.type = "multiplier";
        schema.ref = getValue(size, "type");
        schema.value = getValue(size, "value");
    }

    return schema;
}