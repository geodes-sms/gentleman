import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, isNullOrUndefined } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";


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

export function buildProjectionHandler(args = [], _options = {}) {
    const result = [];
    const buildErrors = [];
    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "projection",
        download: true,
        notify: "always"
    }, _options);

    const concepts = conceptModel.getConcepts(["projection", "template", "style rule"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: There was no projection found to be built.", NotificationType.WARNING, 2000);

        return false;
    }

    concepts.forEach(concept => {
        const handler = ProjectionBuildHandler[valOrDefault(concept.getProperty(PROP_HANDLER), "")];

        if (!isFunction(handler)) {
            throw new Error("The projection's is missing a build handler.");
        }

        const { success, errors, message } = handler.call(conceptModel, concept);

        if (!success) {
            buildErrors.push(...errors);
        } else {
            result.push(message);
        }
    });


    if (!isEmpty(buildErrors)) {
        this.notify("<strong>Validation failed</strong>: The model could not be built.<br> <em>See Log for more details</em>.", NotificationType.ERROR);
        this.logs.add(buildErrors, "Validation error", LogType.ERROR);

        return false;
    }

    if (options.notify === "always") {
        this.notify("The projection model was <strong>successfully</strong> built", NotificationType.SUCCESS, 2000);
    }

    if (options.download) {
        this.download({
            projection: result
        }, options.name);
    }

    return result;
}


function buildProjection(concept) {
    const buildErrors = [];

    const tags = hasAttr(concept, ATTR_TAGS) ? getValue(concept, ATTR_TAGS, true) : [];

    const target = buildConcept.call(this, getAttr(concept, ATTR_CONCEPT));

    if (isEmpty(Object.keys(target))) {
        buildErrors.push("The projection is missing a <<concept>>.");
    }

    if (!hasValue(concept, ATTR_CONTENT)) {
        buildErrors.push("The projection is missing a <<content>>.");
    }

    if (!isEmpty(buildErrors)) {
        return {
            success: false,
            message: "Validation failed: The projection could not be built.",
            errors: buildErrors,
        };
    }

    const content = getValue(concept, ATTR_CONTENT, true);

    const contentType = content.getProperty("contentType");

    let schema = {
        "id": concept.id,
        "concept": target,
        "type": contentType,
        "tags": tags,
        "content": ProjectionHandler[contentType].call(this, content),
        // "metadata": JSON.stringify(concept.export()),
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
        const element = proto.getValue(true);
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

    if (hasAttr(concept, ATTR_NAME) && hasValue(concept, ATTR_NAME)) {
        result[ATTR_NAME] = getValue(concept, ATTR_NAME).toLowerCase();
    }

    if (hasAttr(concept, ATTR_PROTOTYPE) && hasValue(concept, ATTR_PROTOTYPE)) {
        result[ATTR_PROTOTYPE] = getValue(concept, ATTR_PROTOTYPE).toLowerCase();
    }

    return result;
}

function buildLayout(layout) {
    const elementType = layout.getProperty("elementType");

    var schema = {
        type: elementType
    };
    var disposition = [];

    if (elementType === "stack") {
        schema.orientation = getValue(layout, 'orientation');

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            disposition.push(buildElement.call(this, element));
        });
    } else if (elementType === "flex") {
        schema.orientation = getValue(layout, 'orientation');
        schema.wrappable = getValue(layout, 'wrappable');
        schema.alignItems = getValue(layout, 'align-items');
        schema.justifyContent = getValue(layout, 'justify-content');

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            disposition.push(buildElement.call(this, element));
        });
    } else if (elementType === "wrap") {

        getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            disposition.push(buildElement.call(this, element));
        });
    } else if (elementType === "table") {
        schema.orientation = getValue(layout, 'orientation');

        getValue(layout, "rows").forEach(row => {
            const cells = [];
            getValue(row, "cells").forEach(cell => {
                let span = valOrDefault(getValue(cell, "span"), 1);
                if (hasValue(cell, "content")) {
                    let content = getValue(cell, "content", true);
                    cells.push({
                        "type": "cell",
                        "span": span,
                        "content": buildElement.call(this, content)
                    });
                }
            });
            disposition.push(cells);
        });
    }

    if (hasAttr(layout, "style")) {
        schema.style = buildStyle.call(this, getAttr(layout, 'style'));
    }

    schema.disposition = disposition;

    return schema;
}

function buildElement(element) {
    const contentType = element.getProperty("contentType");
    const elementType = element.getProperty("elementType");

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

        if (hasAttr(element, "tag")) {
            schema.tag = getValue(element, "tag");
        }

        if (hasAttr(element, "required")) {
            schema.required = getValue(element, "required");
        }

        if (hasAttr(element, "placeholder")) {
            const content = [];

            let placeholder = getAttr(element, "placeholder");
            getValue(placeholder, "content").filter(proto => proto.hasValue()).forEach(proto => {
                const element = proto.getValue(true);
                content.push(buildElement.call(this, element));
            });
            schema.placeholder = content;
        }

        return schema;
    }

    if (contentType === "projection") {
        let schema = {
            type: contentType,
            src: "value"
        };

        if (hasAttr(element, "tag")) {
            schema.tag = getValue(element, "tag");
        }

        if (hasAttr(element, "placeholder")) {
            const content = [];

            let placeholder = getAttr(element, "placeholder");
            getValue(placeholder, "content").filter(proto => proto.hasValue()).forEach(proto => {
                const element = proto.getValue(true);
                content.push(buildElement.call(this, element));
            });
            schema.placeholder = content;
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

    if (contentType === "template" && hasValue(element, ATTR_VALUE)) {
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
        schema.content = buildTextContent.call(this, getValue(element, "content", true));
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

        let linkContent = getAttr(element, "content");
        getValue(linkContent, "content").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            schema.content.push(buildElement.call(this, element));
        });
    } else if (type === "plink") {
        schema.tag = getValue(element, "tag");
        schema.content = [];

        let plinkContent = getAttr(element, "content");
        getValue(plinkContent, "content").filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            schema.content.push(buildElement.call(this, element));
        });
    }

    if (hasAttr(element, "style")) {
        schema.style = buildStyle.call(this, getAttr(element, 'style'));
    }

    return schema;
}

function buildTextContent(textContent) {
    const contentType = textContent.getProperty("contentType");

    if (contentType === "raw") {
        return getValue(textContent, "content");
    }

    let schema = {
        type: contentType,
    };

    if (contentType === "html") {
        schema.html = getValue(textContent, "content");
    } else if (contentType === "property") {
        schema.name = getValue(textContent, "content");
    }

    return schema;
}

function buildField(field) {
    const elementType = field.getProperty("elementType");

    var schema = {
        type: elementType,
        readonly: getValue(field, "readonly"),
        disabled: getValue(field, "disabled"),
    };

    if (elementType === "text") {
        schema.multiline = getValue(field, "multiline");
        schema.resizable = getValue(field, "resizable");

        if (hasAttr(field, "input")) {
            schema.input = buildInput.call(this, getAttr(field, "input"));
        }
    } else if (elementType === "binary") {
        if (hasAttr(field, "checkbox")) {
            schema.checkbox = buildCheckbox.call(this, getAttr(field, "checkbox"));
        }

        schema.state = {};

        let trueState = getAttr(field, "true");
        if (hasValue(trueState, "content")) {
            schema.state.true = {
                content: getValue(trueState, "content").filter(proto => proto.hasValue())
                    .map(proto => buildElement.call(this, proto.getValue(true)))
            };
        }

        let falseState = getAttr(field, "false");
        if (hasValue(falseState, "content")) {
            schema.state.false = {
                content: getValue(falseState, "content").filter(proto => proto.hasValue())
                    .map(proto => buildElement.call(this, proto.getValue(true)))
            };
        }
    } else if (elementType === "choice") {
        schema.choice = {};

        if (hasAttr(field, "placeholder")) {
            schema.placeholder = getValue(field, "placeholder");
        }

        if (hasAttr(field, "expanded")) {
            schema.expanded = getValue(field, "expanded");
        }

        if (hasAttr(field, "input")) {
            schema.input = buildInput.call(this, getAttr(field, "input"));
        }

        if (hasAttr(field, "choice template")) {
            schema.choice.option = {
                "template": buildFieldTemplate.call(this, getAttr(field, "choice template"))
            };
        }
    } else if (elementType === "list") {
        schema.list = {};

        if (hasAttr(field, "item template")) {
            schema.list.item = {
                "template": buildFieldTemplate.call(this, getAttr(field, "item template"))
            };
        }

        if (hasAttr(field, "action")) {
            let action = getAttr(field, "action");
            schema.action = {};

            if (hasAttr(action, "add")) {
                let add = getAttr(action, "add");
                schema.action.add = {};
                const content = [];

                getValue(add, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
                    const element = proto.getValue(true);
                    content.push(buildElement.call(this, element));
                });
                schema.action.add.content = content;
            }

            if (hasAttr(action, "remove")) {
                let remove = getAttr(action, "remove");
                schema.action.remove = {};
                const content = [];

                getValue(remove, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
                    const element = proto.getValue(true);
                    content.push(buildElement.call(this, element));
                });
                schema.action.remove.content = content;
            }
        }
    } else if (elementType === "table") {
        schema.type = "table";
        schema.table = {};

        if (hasAttr(field, "row template")) {
            schema.table.row = {
                "template": buildFieldTemplate.call(this, getAttr(field, "row template"))
            };
        }

        if (hasAttr(field, "header")) {
            schema.header = buildStyle.call(this, getAttr(field, "header"));
        }

        if (hasAttr(field, "body")) {
            schema.body = buildStyle.call(this, getAttr(field, "body"));
        }

        if (hasAttr(field, "footer")) {
            schema.footer = buildStyle.call(this, getAttr(field, "footer"));
        }
    }

    if (hasAttr(field, "style")) {
        schema.style = buildStyle.call(this, getAttr(field, "style"));
    }


    return schema;
}

function buildInput(element) {
    let schema = {
        type: getValue(element, "type"),
        placeholder: getValue(element, "placeholder")
    };

    if (hasAttr(element, "style")) {
        schema.style = buildStyle.call(this, getAttr(element, 'style'));
    }

    return schema;
}

function buildCheckbox(element) {
    let schema = {
        position: getValue(element, "position"),
        label: getValue(element, "label")
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

    if (hasAttr(style, "css") && hasValue(style, "css")) {
        schema.css = getValue(style, "css", true);
    }

    if (hasAttr(style, "ref" && hasValue(style, "css"))) {
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

    if (hasAttr(style, "nonbreakable")) {
        schema.nonbreakable = getValue(style, "nonbreakable");
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

    if (color.name === "name-color") {
        schema.type = "name";
        schema.value = getValue(color, "value");
    } else if (color.name === "hex-color") {
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