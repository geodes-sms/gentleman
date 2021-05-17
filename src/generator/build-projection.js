import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, createEmphasis, getElement, isNullOrUndefined, createSpan, capitalizeFirstLetter } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";
import { buildStyle, buildGentlemanStyle } from "./build-style.js";


const PROP_HANDLER = "handler";

const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
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


function createProjectionLink(text, concept) {
    const { id, name } = concept;

    let link = createEmphasis({
        class: ["link", "error-message__link"],
        title: name,
    }, text);

    const targetSelector = `.projection[data-concept="${id}"]`;

    link.addEventListener("mouseenter", (event) => {
        let targetProjection = getElement(targetSelector, this.body);
        if (targetProjection) {
            this.highlight(targetProjection);
        }
    });

    link.addEventListener("mouseleave", (event) => {
        this.unhighlight();
    });

    link.addEventListener("click", (event) => {
        let target = this.resolveElement(getElement(targetSelector, this.body));

        if (target) {
            target.focus();
        }
    });

    return link;
}

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

    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "projection",
        download: true,
        notify: "always"
    }, _options);

    const concepts = conceptModel.getConcepts(["projection", "template", "style rule"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: Please create at least one projection.", NotificationType.WARNING, 2000);

        return false;
    }

    this.__errors = [];

    concepts.forEach(concept => {
        const handler = ProjectionBuildHandler[valOrDefault(concept.getProperty(PROP_HANDLER), "")];

        const { message } = handler.call(this, concept);

        result.push(message);
    });


    if (!isEmpty(this.__errors)) {
        this.notify("<strong>Validation failed</strong>: The model could not be built.<br> <em>See Log for more details</em>.", NotificationType.ERROR);
        this.logs.add(this.__errors, "Validation error", LogType.ERROR);

        delete this.__errors;

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

    delete this.__errors;

    return result;
}


function buildProjection(concept) {
    const tags = hasAttr(concept, ATTR_TAGS) ? getValue(concept, ATTR_TAGS, true) : [];

    const target = buildConcept.call(this, getAttr(concept, ATTR_CONCEPT));

    if (isEmpty(Object.keys(target))) {
        let link = createProjectionLink.call(this, "concept", getAttr(concept, ATTR_CONCEPT));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    if (!hasValue(concept, ATTR_CONTENT)) {
        let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_CONTENT));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    const content = getValue(concept, ATTR_CONTENT, true);

    if (isNullOrUndefined(content)) {
        let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_CONTENT));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        return {
            success: false,
            message: {
                "id": concept.id,
                "concept": target,
                "tags": tags,
                "type": null,
                "content": null
            }
        };
    }

    const contentType = content.getProperty("contentType");

    let schema = {
        "id": concept.id,
        "concept": target,
        "tags": tags,
        "type": contentType,
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
    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(concept, ATTR_NAME));
        let error = createSpan({
            class: ["error-message"]
        }, [`Template error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    if (!hasValue(concept, ATTR_CONTENT)) {
        let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_CONTENT));
        let error = createSpan({
            class: ["error-message"]
        }, [`Template error: `, link, ` is missing a value`]);

        this.__errors.push(error);
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
    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(concept, ATTR_NAME));
        let error = createSpan({
            class: ["error-message"]
        }, [`StyleRule error: `, link, ` is missing a value`]);

        this.__errors.push(error);
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


/**
 * ELEMENT GENERATOR
 ----------------------------------------------------------------------------*/

const ElementHanlders = {
    "static": buildStatic,
    "layout": buildLayout,
    "dynamic": buildDynamic,
    "field": buildField,
};

function buildElement(element) {
    const contentType = element.getProperty("contentType");

    const handler = ElementHanlders[contentType];

    if (!isFunction(handler)) {
        return null;
    }

    return {
        type: contentType,
        [contentType]: handler.call(this, element)
    };
}

/**
 * LAYOUT GENERATOR
 ----------------------------------------------------------------------------*/

const LayoutHanlders = {
    "wrap": WrapLayoutHandler,
    "stack": StackLayoutHandler,
    "flex": FlexLayoutHandler,
    "table": TableLayoutHandler,
};

function buildLayout(layout) {
    const elementType = layout.getProperty("elementType");

    var schema = {
        type: elementType
    };

    const handler = LayoutHanlders[elementType];

    if (!isFunction(handler)) {
        return null;
    }

    Object.assign(schema, handler.call(this, layout));

    if (hasAttr(layout, "style")) {
        schema.style = buildStyle.call(this, getAttr(layout, 'style'));
    }

    return schema;
}

function WrapLayoutHandler(layout) {
    const schema = {};
    var disposition = [];

    getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        disposition.push(buildElement.call(this, element));
    });

    schema.disposition = disposition;

    return schema;
}

function StackLayoutHandler(layout) {
    const schema = {};

    const PROP_ORIENTATION = "orientation";

    schema[PROP_ORIENTATION] = getValue(layout, PROP_ORIENTATION);
    var disposition = [];

    getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        disposition.push(buildElement.call(this, element));
    });

    schema.disposition = disposition;

    return schema;
}

function FlexLayoutHandler(layout) {
    const schema = {};

    var disposition = [];

    const PROP_ORIENTATION = "orientation";
    const PROP_WRAPPABLE = "wrappable";
    const PROP_ALIGNITEMS = "align-items";
    const PROP_JUSTIFYCONTENT = "justify-content";

    schema[PROP_ORIENTATION] = getValue(layout, PROP_ORIENTATION);
    schema[PROP_WRAPPABLE] = getValue(layout, PROP_WRAPPABLE);
    schema.alignItems = getValue(layout, PROP_ALIGNITEMS);
    schema.justifyContent = getValue(layout, PROP_JUSTIFYCONTENT);

    getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        disposition.push(buildElement.call(this, element));
    });

    schema.disposition = disposition;

    return schema;
}

function TableLayoutHandler(layout) {
    const schema = {};

    var disposition = [];

    const PROP_ORIENTATION = "orientation";
    schema[PROP_ORIENTATION] = getValue(layout, PROP_ORIENTATION);

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

    schema.disposition = disposition;

    return schema;
}

/**
 * DYNAMIC GENERATOR
 ----------------------------------------------------------------------------*/

const DynamicHanlders = {
    "attribute": AttributeDynamicHandler,
    "projection": ProjectionDynamicHandler,
    "template": TemplateDynamicHandler,
};

function buildDynamic(dynamic) {
    const elementType = dynamic.getProperty("elementType");

    var schema = {
        type: elementType
    };

    const handler = DynamicHanlders[elementType];

    if (!isFunction(handler)) {
        return null;
    }

    Object.assign(schema, handler.call(this, dynamic));

    return schema;
}

function AttributeDynamicHandler(element) {
    const schema = {
        type: "attribute",
        name: getValue(element, "value")
    };

    const PROP_TAG = "tag";
    const PROP_PLACEHOLDER = "placeholder";

    if (hasAttr(element, PROP_TAG)) {
        schema[PROP_TAG] = getValue(element, PROP_TAG);
    }

    if (hasAttr(element, ATTR_REQUIRED)) {
        schema.required = getValue(element, ATTR_REQUIRED);
    }

    if (hasAttr(element, PROP_PLACEHOLDER)) {
        const content = [];

        let placeholder = getAttr(element, PROP_PLACEHOLDER);
        getValue(placeholder, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            content.push(buildElement.call(this, element));
        });
        schema.placeholder = content;
    }

    return schema;
}

function ProjectionDynamicHandler(element) {
    const schema = {
        type: "projection",
        src: "value"
    };
    
    const PROP_TAG = "tag";
    const PROP_PLACEHOLDER = "placeholder";

    if (hasAttr(element, PROP_TAG)) {
        schema.tag = getValue(element, PROP_TAG);
    }

    if (hasAttr(element, PROP_PLACEHOLDER)) {
        const content = [];

        let placeholder = getAttr(element, PROP_PLACEHOLDER);
        getValue(placeholder, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue(true);
            content.push(buildElement.call(this, element));
        });
        schema.placeholder = content;
    }

    return schema;
}

function TemplateDynamicHandler(element) {
    if (!hasValue(element, ATTR_VALUE)) {
        return null;
    }

    const schema = {
        type: "template",
        name: getReferenceName(element, ATTR_VALUE),
    };

    return schema;
}

/**
 * STATIC GENERATOR
 ----------------------------------------------------------------------------*/

const StaticHanlders = {
    "text": TextStaticHandler,
    "image": ImageStaticHandler,
    "html": HtmlStaticHandler,
    "link": LinkStaticHandler,
    "plink": PLinkStaticHandler,
};

function buildStatic(element) {
    const elementType = element.getProperty("elementType");

    let schema = {
        type: elementType
    };

    const handler = StaticHanlders[elementType];

    if (!isFunction(handler)) {
        return null;
    }

    Object.assign(schema, handler.call(this, element));

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}

function TextStaticHandler(element) {
    const schema = {};

    const buildContent = (textContent) => {
        const type = textContent.getProperty("contentType");

        let schema = {
            type: type,
        };

        if (type === "html") {
            schema.html = getValue(textContent, "content");
        } else if (type === "property") {
            schema.name = getValue(textContent, "content");
        } else {
            schema.raw = getValue(textContent, "content");
        }

        return schema;
    };

    schema[ATTR_CONTENT] = buildContent(getValue(element, ATTR_CONTENT, true));

    return schema;
}

function ImageStaticHandler(element) {
    const schema = {};

    const PROP_URL = "url";
    const PROP_ALT = "alternative text";
    const PROP_WIDTH = "width";
    const PROP_HEIGHT = "height";

    schema[PROP_URL] = getValue(element, PROP_URL);
    schema.alt = getValue(element, PROP_ALT);
    schema[PROP_WIDTH] = getValue(element, PROP_WIDTH);
    schema[PROP_HEIGHT] = getValue(element, PROP_HEIGHT);

    return schema;
}

function HtmlStaticHandler(element) {
    const schema = {};

    const PROP_SELECTOR = "selector";
    schema[PROP_SELECTOR] = getValue(element, PROP_SELECTOR);

    return schema;
}

function LinkStaticHandler(element) {
    const schema = {};

    const PROP_URL = "url";
    const PROP_URLTYPE = "url type";

    schema[PROP_URL] = getValue(element, PROP_URL);
    schema.urlType = getValue(element, PROP_URLTYPE);
    schema[ATTR_CONTENT] = [];

    let linkContent = getAttr(element, ATTR_CONTENT);
    getValue(linkContent, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        schema.content.push(buildElement.call(this, element));
    });

    return schema;
}

function PLinkStaticHandler(element) {
    const schema = {};

    const PROP_TAG = "tag";

    schema[PROP_TAG] = getValue(element, "tag");
    schema[ATTR_CONTENT] = [];

    let plinkContent = getAttr(element, ATTR_CONTENT);
    getValue(plinkContent, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        schema.content.push(buildElement.call(this, element));
    });

    return schema;
}

/**
 * FIELD GENERATOR
 ----------------------------------------------------------------------------*/

const FieldHanlders = {
    "text": TextFieldHandler,
    "binary": BinaryFieldHandler,
    "choice": ChoiceFieldHandler,
    "list": ListFieldHandler,
    "table": TableFieldHandler,
};

function buildField(field) {
    const elementType = field.getProperty("elementType");

    var schema = {
        type: elementType,
        readonly: getValue(field, "readonly"),
        disabled: getValue(field, "disabled"),
    };

    const handler = FieldHanlders[elementType];

    if (!isFunction(handler)) {
        return null;
    }

    Object.assign(schema, handler.call(this, field));

    if (hasAttr(field, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(field, ATTR_STYLE));
    }


    return schema;
}

function TextFieldHandler(field) {
    const schema = {};

    const PROP_MULTILINE = "multiline";
    const PROP_RESIZABLE = "resizable";
    const PROP_INPUT = "input";

    schema[PROP_MULTILINE] = getValue(field, PROP_MULTILINE);
    schema[PROP_RESIZABLE] = getValue(field, PROP_RESIZABLE);

    if (hasAttr(field, PROP_INPUT)) {
        schema[PROP_INPUT] = buildInput.call(this, getAttr(field, PROP_INPUT));
    }

    return schema;
}

function BinaryFieldHandler(field) {
    const schema = {};

    const PROP_CHECKBOX = "checkbox";

    schema.state = {};

    let trueState = getAttr(field, "true");
    if (hasValue(trueState, ATTR_CONTENT)) {
        schema.state.true = {
            content: getValue(trueState, ATTR_CONTENT).filter(proto => proto.hasValue())
                .map(proto => buildElement.call(this, proto.getValue(true)))
        };
    }

    let falseState = getAttr(field, "false");
    if (hasValue(falseState, ATTR_CONTENT)) {
        schema.state.false = {
            content: getValue(falseState, ATTR_CONTENT).filter(proto => proto.hasValue())
                .map(proto => buildElement.call(this, proto.getValue(true)))
        };
    }

    if (hasAttr(field, PROP_CHECKBOX)) {
        schema[PROP_CHECKBOX] = buildCheckbox.call(this, getAttr(field, PROP_CHECKBOX));
    }

    return schema;
}

function ChoiceFieldHandler(field) {
    const schema = {};

    const PROP_PLACEHOLDER = "placeholder";
    const PROP_EXPANDED = "expanded";
    const PROP_INPUT = "input";
    const PROP_TEMPLATE = "choice template";

    schema.choice = {};

    if (hasAttr(field, PROP_PLACEHOLDER)) {
        schema.placeholder = getValue(field, PROP_PLACEHOLDER);
    }

    if (hasAttr(field, PROP_EXPANDED)) {
        schema.expanded = getValue(field, PROP_EXPANDED);
    }

    if (hasAttr(field, PROP_INPUT)) {
        schema.input = buildInput.call(this, getAttr(field, PROP_INPUT));
    }

    if (hasAttr(field, PROP_TEMPLATE)) {
        schema.choice.option = {
            "template": buildFieldTemplate.call(this, getAttr(field, PROP_TEMPLATE))
        };
    }

    return schema;
}

function ListFieldHandler(field) {
    const schema = {};

    const PROP_ACTION = "action";
    const PROP_TEMPLATE = "item template";

    schema.list = {};

    if (hasAttr(field, PROP_TEMPLATE)) {
        schema.list.item = {
            "template": buildFieldTemplate.call(this, getAttr(field, PROP_TEMPLATE))
        };
    }

    if (hasAttr(field, PROP_ACTION)) {
        let action = getAttr(field, PROP_ACTION);
        schema.action = {};

        const PROP_ACTION_ADD = "add";
        const PROP_ACTION_REMOVE = "remove";

        if (hasAttr(action, PROP_ACTION_ADD)) {
            let add = getAttr(action, PROP_ACTION_ADD);
            schema.action[PROP_ACTION_ADD] = {};
            const content = [];

            getValue(add, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
                const element = proto.getValue(true);
                content.push(buildElement.call(this, element));
            });
            schema.action.add.content = content;
        }

        if (hasAttr(action, PROP_ACTION_REMOVE)) {
            let remove = getAttr(action, PROP_ACTION_REMOVE);
            schema.action[PROP_ACTION_REMOVE] = {};
            const content = [];

            getValue(remove, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
                const element = proto.getValue(true);
                content.push(buildElement.call(this, element));
            });
            schema.action.remove.content = content;
        }
    }
    return schema;
}

function TableFieldHandler(field) {
    const schema = {};

    const PROP_TEMPLATE = "row template";
    const PROP_HEADER = "header";
    const PROP_BODY = "body";
    const PROP_FOOTER = "footer";

    schema.table = {};

    if (hasAttr(field, PROP_TEMPLATE)) {
        schema.table.row = {
            "template": buildFieldTemplate.call(this, getAttr(field, PROP_TEMPLATE))
        };
    }

    if (hasAttr(field, PROP_HEADER)) {
        schema.header = buildStyle.call(this, getAttr(field, PROP_HEADER));
    }

    if (hasAttr(field, PROP_BODY)) {
        schema.body = buildStyle.call(this, getAttr(field, PROP_BODY));
    }

    if (hasAttr(field, PROP_FOOTER)) {
        schema.footer = buildStyle.call(this, getAttr(field, PROP_FOOTER));
    }

    return schema;
}

function buildInput(element) {
    let schema = {
        type: getValue(element, "type"),
        placeholder: getValue(element, "placeholder")
    };

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}

function buildCheckbox(element) {
    let schema = {
        position: getValue(element, "position"),
        label: getValue(element, "label")
    };

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}

function buildFieldTemplate(element) {
    let schema = {
        "tag": getValue(element, "tag")
    };

    if (hasValue(element, ATTR_NAME)) {
        schema[ATTR_NAME] = getValue(element, ATTR_NAME);
    }

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}