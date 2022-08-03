import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, isNullOrUndefined, createSpan, camelCase } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";
import { buildStyle, buildGentlemanStyle } from "./build-style.js";
import { getAttr, getReferenceValue, getReferenceName, hasAttr, hasValue, getName, getValue, createProjectionLink } from './utils.js';


const PROP_HANDLER = "handler";

const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
const ATTR_NAME = "name";
const ATTR_STYLE = "style";
const ATTR_REQUIRED = "required";
const ATTR_PROTOTYPE = "prototype";
const ATTR_TAG = "tag";
const ATTR_TAGS = "tags";
const ATTR_VALUE = "value";
const PROP_FOCUSABLE = "focusable";
const PROP_HIDDEN = "hidden";
const PROP_READONLY = "readonly";
const PROP_DISABLED = "disabled";
const PROP_SOURCE = "source";


const ProjectionBuildHandler = {
    "projection": buildProjection,
    "template": buildTemplate,
    "style": buildStyleRule,
};

const ProjectionHandler = {
    "layout": buildLayout,
    "container": buildContainer,
    "svg-container": buildSVGContainer,
    "svg-pattern": buildSVGPattern,
    "field": buildField,
};

export function buildProjectionHandler(_options = {}) {
    const result = {
        type: "projection",
        "projection": [],
        "template": [],
        "style": [],
    };

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
        let type = valOrDefault(concept.getProperty(PROP_HANDLER), "");
        const handler = ProjectionBuildHandler[type];

        const { message } = handler.call(this, concept);

        result[type].push(message);
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
        this.download(result, options.name);
    }

    delete this.__errors;
 
    return result;
}


export function buildProjection(concept) {
    const tags = hasAttr(concept, ATTR_TAGS) ? getValue(concept, ATTR_TAGS, true) : [];
   

    let targetConcept = getAttr(concept, ATTR_CONCEPT);
    if (concept.hasParent()) {
        let parent = concept.getParent("collection");
        targetConcept = getAttr(parent, ATTR_CONCEPT);
    }

    const target = buildConcept.call(this, targetConcept);

    if (isEmpty(Object.keys(target))) {
        let link = createProjectionLink.call(this, "concept", getAttr(concept, ATTR_CONCEPT));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    const container = getAttr(concept, "container");

    // const content = getValue(container, ATTR_CONTENT, true);

    // if (isNullOrUndefined(content)) {
    //     let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_CONTENT));
    //     let error = createSpan({
    //         class: ["error-message"]
    //     }, [`Projection error: `, link, ` is missing a value`]);

    //     return {
    //         success: false,
    //         message: {
    //             "id": concept.id,
    //             "concept": target,
    //             "tags": tags,
    //             "type": null,
    //             "content": null
    //         }
    //     };
    // }

    // const contentType = content.getProperty("contentType");

    // TODO: AJOUTER les éléments graphiques
    // "sibling": buildSibling.call(this, getAttr(content, "sibling")),
    // "type": ((contentType === "container") || (contentType === "svg-pattern") || (contentType === "svg-container")) ? "layout" : contentType,

    let schema = {
        "concept": target,
        "tags": tags,
        "container": buildContainer.call(this, container),
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

export function buildTemplate(concept) {
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

export function buildStyleRule(concept) {
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

export function buildConcept(concept) {
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
    "container": buildContainer,
    "svg-container": buildSVGContainer
};

function buildElement(element) {
    console.log(element)
    const contentType = element.getProperty("contentType");

    const handler = ElementHanlders[contentType];

    if (!isFunction(handler)) {
        return null;
    }

    // TODO: Ajouter svg-container
    let type = contentType;

    return Object.assign({ kind: type }, handler.call(this, element));
}


export function buildContainer(container) {
    const schema = {
        type: "container"
    };

    let elements = [];

    getValue(container, "elements").filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        elements.push(buildElement.call(this, element));
    });

    schema.content = elements;

    schema.layout = buildLayout.call(this, getValue(container, "layout", true));

    schema[PROP_FOCUSABLE] = getValue(container, PROP_FOCUSABLE);

    if (hasAttr(container, "style")) {
        schema.style = buildStyle.call(this, getAttr(container, 'style'));
    }

    return schema;
}

function buildSVGPattern(container) {
    const schema = {};
    schema.type = "pattern";

    if (hasAttr(container, "base-pattern")) {
        schema.base = buildBasePattern.call(this, getAttr(container, "base-pattern"));
    }

    if (hasAttr(container, "width")) {
        schema.width = getValue(container, "width");
    }

    if (hasAttr(container, "height")) {
        schema.height = getValue(container, "height");
    }

    if (hasAttr(container, "baseX")) {
        schema.baseX = getValue(container, "baseX");
    }

    if (hasAttr(container, "baseY")) {
        schema.baseY = getValue(container, "baseY");
    }

    if (hasAttr(container, "baseRatio")) {
        schema.baseRatio = getValue(container, "baseRatio");
    }

    if (hasAttr(container, "anchor")) {
        schema.anchor = getValue(container, "anchor");
    }

    if (hasAttr(container, "add-set") && !isEmpty(getValue(container, "add-set"))) {
        let attributes = [];
        getValue(container, "add-set").forEach(a => {
            attributes.push(buildPattern.call(this, a));
        });
        schema.attributes = attributes;
    }

    return schema;
}

function buildBasePattern(pattern) {
    const schema = {};

    if (hasAttr(pattern, "pattern")) {
        schema.pattern = buildElement.call(this, getValue(pattern, "pattern", true));
    }

    return schema;
}

function buildPattern(pattern) {
    const schema = {};


    if (hasAttr(pattern, "template")) {
        schema.template = getValue(pattern, "template");
    }

    if (hasAttr(pattern, "repeat")) {
        schema.repeat = getValue(pattern, "repeat");
    }

    if (hasAttr(pattern, "attribute")) {
        schema.attribute = {
            type: "dynamic",
            dynamic: buildDynamic.call(this, getAttr(pattern, "attribute"))
        };
    }

    if (hasAttr(pattern, "properties")) {
        schema.props = buildSVGElement.call(this, getAttr(pattern, "properties"));
    }

    return schema;
}

function buildSVGElement(element) {
    const schema = {};

    if (hasAttr(element, "x")) {
        schema.x = getValue(element, "x");
    }

    if (hasAttr(element, "y")) {
        schema.y = getValue(element, "y");
    }

    if (hasAttr(element, "ratio")) {
        schema.ratio = getValue(element, "ratio");
    }

    if (hasAttr(element, "anchor")) {
        schema.anchor = getValue(element, "anchor");
    }

    return schema;
}

function buildSVGContainer(field) {
    const schema = {};

    schema.type = "svg";

    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "p-link")) {
        schema.link = buildSVGLink(getAttr(field, "p-link"));
    }

    if (hasAttr(field, "attributes") && (!isEmpty(getAttr(field, "attributes")))) {
        schema.attributes = [];

        getValue(field, "attributes").forEach(a => {
            schema.attributes.push(buildSVGAttr(a));
        });
    }

    return schema;
}

function buildSVGAttr(attribute) {
    const schema = {};

    if (hasAttr(attribute, "value")) {
        schema.value = getValue(attribute, "value");
    }

    if (hasAttr(attribute, "placement")) {
        schema.placement = buildPlacement(getValue(attribute, "placement", true));
    }

    if (hasAttr(attribute, "property")) {
        schema.property = getValue(attribute, "property");
    }

    return schema;
}

function buildPlacement(placement) {
    const schema = {};

    schema.type = placement.name;

    switch (schema.type) {
        case "in-place":
            if (hasAttr(placement, "marker")) {
                schema.marker = getValue(placement, "marker");
            }

            if (hasAttr(placement, "tag")) {
                schema.tag = getValue(placement, "tag");
            }

            return schema;

        case "link-place":
            if (hasAttr(placement, "static-dependents") && !isEmpty(getValue(placement, "static-dependents"))) {
                schema.sd = [];

                getValue(placement, "static-dependents").forEach(d => {
                    schema.sd.push(buildSVGExternal(d));
                });
            }

            if (hasAttr(placement, "dynamic-dependents") && !isEmpty(getValue(placement, "dynamic-dependents"))) {
                schema.dd = [];

                getValue(placement, "dynamic-dependents").forEach(d => {
                    schema.dd.push(buildSVGExternal(d));
                });
            }

            return schema;
    }
}

function buildSVGExternal(external) {
    const schema = {};

    if (hasAttr(external, "marker")) {
        schema.marker = getValue(external, "marker");
    }

    if (hasAttr(external, "template")) {
        schema.template = getValue(external, "template");
    }

    return schema;
}

function buildSVGLink(link) {
    const schema = {};

    if (hasAttr(link, "tag")) {
        schema.tag = getValue(link, "tag");
    }

    if (hasAttr(link, "marker")) {
        schema.marker = getValue(link, "marker");
    }

    if (hasAttr(link, "external")) {
        schema.external = getValue(link, "external");
    }

    return schema;
}


/**
 * LAYOUT GENERATOR
 ----------------------------------------------------------------------------*/

const LayoutHanlders = {
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

function FlexLayoutHandler(layout) {
    const schema = {};

    const PROP_ORIENTATION = "orientation";
    const PROP_WRAPPABLE = "wrappable";
    const PROP_ALIGNITEMS = "align-items";
    const PROP_JUSTIFYCONTENT = "justify-content";

    schema[PROP_ORIENTATION] = getValue(layout, PROP_ORIENTATION);
    schema[PROP_WRAPPABLE] = getValue(layout, PROP_WRAPPABLE);
    schema[camelCase(PROP_ALIGNITEMS)] = getValue(layout, PROP_ALIGNITEMS);
    schema[camelCase(PROP_JUSTIFYCONTENT)] = getValue(layout, PROP_JUSTIFYCONTENT);

    // let disposition = [];

    // getValue(layout, "elements").filter(proto => proto.hasValue()).forEach(proto => {
    //     const element = proto.getValue(true);
    //     disposition.push(buildElement.call(this, element));
    // });

    // schema.disposition = disposition;

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
    "projection": AttributeDynamicHandler,
    "template": TemplateDynamicHandler,
};

export function buildDynamic(dynamic) {
    console.log(dynamic);

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
        name: getValue(element, "src")
    };

    const PROP_TAG = "tag";
    const PROP_PLACEHOLDER = "placeholder";

    if (hasAttr(element, PROP_TAG) && hasValue(element, PROP_TAG)) {
        schema[PROP_TAG] = getValue(element, PROP_TAG);
    }

    if (hasAttr(element, ATTR_REQUIRED)) {
        schema.required = getValue(element, ATTR_REQUIRED);
    }

    if(hasAttr(element, "listen")){
        schema.listen = getValue(element, "listen");
    }

    if (hasAttr(element, PROP_PLACEHOLDER) && hasValue(element, PROP_PLACEHOLDER)) {
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

    if (hasAttr(element, PROP_TAG) && hasValue(element, PROP_TAG)) {
        schema.tag = getValue(element, PROP_TAG);
    }

    if (hasAttr(element, PROP_PLACEHOLDER) && hasValue(element, PROP_PLACEHOLDER)) {
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
    "link": LinkStaticHandler,
    "plink": PLinkStaticHandler,
    "button": ButtonStaticHandler,
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

    schema[PROP_FOCUSABLE] = getValue(element, PROP_FOCUSABLE);
    schema[PROP_HIDDEN] = getValue(element, PROP_HIDDEN);

    Object.assign(schema, handler.call(this, element));

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}

function TextStaticHandler(element) {
    const schema = {};

    const PROP_ASHTML = "asHTML";

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

    // schema[ATTR_CONTENT] = buildContent(getValue(element, ATTR_CONTENT, true));
    schema[PROP_ASHTML] = getValue(element, PROP_ASHTML);
    schema[ATTR_CONTENT] = getValue(element, ATTR_CONTENT, true);

    return schema;
}

function ImageStaticHandler(element) {
    const schema = {};

    const PROP_URL = "url";
    const PROP_ALT = "alt";

    schema[PROP_URL] = getValue(element, PROP_URL);
    schema[PROP_ALT] = getValue(element, PROP_ALT);

    return schema;
}

function LinkStaticHandler(element) {
    const schema = {};

    const PROP_URL = "url";
    const PROP_URLTYPE = "type";

    schema[PROP_URL] = getValue(element, PROP_URL);
    schema.urlType = getValue(element, PROP_URLTYPE);
    schema[ATTR_CONTENT] = getValue(element, ATTR_CONTENT).filter(proto => proto.hasValue()).map(proto => {
        const element = proto.getValue(true);
        return buildElement.call(this, element);
    });

    // let linkContent = getAttr(element, ATTR_CONTENT);
    // if (linkContent.name === "string") {
    //     schema.content.push({ "type": "raw", "raw": linkContent.getValue() });
    // } else {
    //     getValue(linkContent, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
    //         const element = proto.getValue(true);
    //         schema.content.push(buildElement.call(this, element));
    //     });
    // }

    return schema;
}

function PLinkStaticHandler(element) {
    const schema = {};

    const PROP_TAG = "tag";

    schema[PROP_TAG] = getValue(element, "tag");
    schema[ATTR_CONTENT] = getValue(element, ATTR_CONTENT).filter(proto => proto.hasValue()).map(proto => {
        const element = proto.getValue(true);
        return buildElement.call(this, element);
    });

    // if (plinkContent.name === "string") {
    //     schema.content.push({ "type": "raw", "raw": plinkContent.getValue() });
    // } else {
    //     getValue(plinkContent, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
    //         const element = proto.getValue(true);
    //         schema.content.push(buildElement.call(this, element));
    //     });
    // }

    return schema;
}

function ButtonStaticHandler(element) {
    const schema = {};

    const PROP_TRIGGER = "trigger";
    const PROP_DISABLED = "disabled";
    schema[PROP_TRIGGER] = getValue(element, PROP_TRIGGER);
    schema[PROP_DISABLED] = getValue(element, PROP_DISABLED);
    schema[ATTR_CONTENT] = getValue(element, ATTR_CONTENT).filter(proto => proto.hasValue()).map(proto => {
        const element = proto.getValue(true);
        return buildElement.call(this, element);
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
    "interactive": InteractiveHandler,
    "dynamic": DynamicSVGHandler,
    "static": StaticSVGHandler,
    "add": AddFieldHandler,
    "arrow": ArrowHandler,
    "svg": SvgTextHandler
};

function buildField(field) {
    const elementType = field.getProperty("elementType");

    var schema = {
        type: elementType
    };

    schema[PROP_FOCUSABLE] = getValue(field, PROP_FOCUSABLE);
    schema[PROP_READONLY] = getValue(field, PROP_READONLY);
    schema[PROP_DISABLED] = getValue(field, PROP_DISABLED);
    schema[PROP_HIDDEN] = getValue(field, PROP_HIDDEN);
    schema[PROP_SOURCE] = getValue(field, PROP_SOURCE);

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
            schema.action[PROP_ACTION_ADD] = {
                position: getValue(add, "position"),
            };
            const content = [
                {
                    "type": "static",
                    "static": {
                        "type": "text",
                        "content": getValue(add, ATTR_CONTENT)
                    }
                }
            ];

            // getValue(add, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
            //     const element = proto.getValue(true);
            //     content.push(buildElement.call(this, element));
            // });

            schema.action.add.content = content;
        }

        // if (hasAttr(action, PROP_ACTION_REMOVE)) {
        //     let remove = getAttr(action, PROP_ACTION_REMOVE);
        //     schema.action[PROP_ACTION_REMOVE] = {};
        //     const content = [];

        //     getValue(remove, ATTR_CONTENT).filter(proto => proto.hasValue()).forEach(proto => {
        //         const element = proto.getValue(true);
        //         content.push(buildElement.call(this, element));
        //     });
        //     schema.action.remove.content = content;
        // }
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

function SvgTextHandler(field) {
    const schema = {};

    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "x")) {
        schema.x = getValue(field, "x");
    }

    if (hasAttr(field, "x")) {
        schema.x = getValue(field, "x");
    }

    return schema;
}

function InteractiveHandler(field) {
    const schema = {};


    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "field")) {
        schema.source = buildSourceSVG(getAttr(field, "field"));
    }

    if (hasAttr(field, "static-dependents") && !isEmpty(getValue(field, "static-dependents"))) {
        schema.sd = [];

        getValue(field, "static-dependents").forEach(d => {
            schema.sd.push(buildSVGExternal(d));
        });
    }

    if (hasAttr(field, "dynamic-dependents") && !isEmpty(getValue(field, "dynamic-dependents"))) {
        schema.dd = [];

        getValue(field, "dynamic-dependents").forEach(d => {
            schema.dd.push(buildSVGExternal(d));
        });
    }

    if (hasAttr(field, "marker")) {
        schema.marker = getValue(field, "marker");
    }

    if (hasAttr(field, "markers")) {
        schema.markers = [];

        getValue(field, "markers").forEach(m => {
            schema.markers.push(buildMarker(m));
        });
    }

    if (hasAttr(field, "self")) {
        schema.self = [];

        getValue(field, "self").forEach(p => {
            schema.self.push(getValue(p, "property"));
        });
    }


    return schema;
}

function buildSourceSVG(source) {
    const schema = {};

    if (hasAttr(source, "marker")) {
        schema.marker = getValue(source, "marker");
    }

    if (hasAttr(source, "tag")) {
        schema.tag = getValue(source, "tag");
    }

    return schema;
}

function DynamicSVGHandler(field) {
    const schema = {};

    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "marker")) {
        schema.marker = getValue(field, "marker");
    }

    if (hasAttr(field, "markers")) {
        schema.markers = [];

        getValue(field, "markers").forEach(m => {
            schema.markers.push(buildMarker(m));
        });
    }

    if (hasAttr(field, "self")) {
        schema.self = [];

        getValue(field, "self").forEach(p => {
            schema.self.push(getValue(p, "property"));
        });
    }


    return schema;
}

function StaticSVGHandler(field) {
    const schema = {};

    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "model-value")) {
        schema.mv = getValue(field, "model-value");
    }


    return schema;
}

function buildMarker(marker) {
    const schema = {};

    if (hasAttr(marker, "model-value")) {
        schema.mv = getValue(marker, "model-value");
    }

    if (hasAttr(marker, "aliases")) {
        schema.aliases = [];

        getValue(marker, "aliases").forEach(a => {
            schema.aliases.push(buildAlias(a));
        });
    }

    return schema;
}

function buildAlias(alias) {
    const schema = {};

    if (hasAttr(alias, "marker-value")) {
        schema.mv = getValue(alias, "marker-value");
    }

    if (hasAttr(alias, "properties")) {
        schema.props = buildSVGProperties(getAttr(alias, "properties"));
    }

    return schema;
}

function buildSVGProperties(props) {
    let schema = {};

    schema.props = [];

    if (hasAttr(props, "bold") && getValue(props, "bold")) {
        const bold = {};
        bold.props = "font-weight";
        bold.value = "bold";

        schema.props.push(bold);
    }

    if (hasAttr(props, "italic") && getValue(props, "italic")) {
        const italic = {};
        italic.props = "font-style";
        italic.value = "italic";

        schema.props.push(italic);
    }

    if (hasAttr(props, "underline") && getValue(props, "underline")) {
        const underline = {};
        underline.props = "text-decoration";
        underline.value = "underline";

        schema.props.push(underline);
    }


    if (hasAttr(props, "color")) {
        let col = getAttr(props, "color");
        let c = getValue(col, "value");

        if (!isNullOrUndefined(c)) {
            const color = {};
            color.props = "fill";
            color.value = c;

            schema.props.push(color);
        }
    }

    if (hasAttr(props, "size")) {
        let s = getAttr(props, "size");

        if (!(isNullOrUndefined(s) || !hasValue(s, "value"))) {
            const size = {};
            size.props = "font-size";
            size.value = getValue(s, "value") + getValue(s, "unit");

            schema.props.push(size);
        }
    }

    if (hasAttr(props, "text-content")) {
        let t = getValue(props, "text-content");

        if ((!isNullOrUndefined(t)) && (t !== "")) {
            schema.props.push(
                {
                    props: "textContent",
                    value: t
                }
            );
        }
    }

    if (hasAttr(props, "others")) {
        getValue(props, "others").forEach(i => {
            schema.props.push(buildOther(i));
        });
    }

    return schema.props;
}

function buildOther(other) {
    const schema = {};

    schema.property = getValue(other, "property");
    schema.value = getValue(other, "value");

    return schema;
}

function AddFieldHandler(field) {
    const schema = {};

    schema.type = "add";

    if (hasAttr(field, "content")) {
        schema.content = getValue(field, "content");
    }

    if (hasAttr(field, "items")) {
        schema.items = buildFieldTemplate.call(this, getAttr(field, "items"));
    }

    if (hasAttr(field, "ratio")) {
        schema.ratio = getValue(field, "ratio");
    }


    return schema;
}

function ArrowHandler(arrow) {
    const schema = {};

    schema.type = "arrow";

    if (hasAttr(arrow, "source")) {
        schema.source = getValue(arrow, "source");
    }

    if (hasAttr(arrow, "target")) {
        schema.target = getValue(arrow, "target");
    }

    if (hasAttr(arrow, "decorator")) {
        schema.decorator = buildDecorator.call(this, getAttr(arrow, "decorator"));
    }

    if (hasAttr(arrow, "arrow-style")) {
        schema.arrowStyle = buildArrowStyle.call(this, getAttr(arrow, "arrow-style"));
    }

    return schema;
}

function buildDecorator(decorator) {
    const schema = {};

    if (hasAttr(decorator, "attribute")) {
        schema.attribute = {
            type: "dynamic",
            dynamic: buildDynamic.call(this, getAttr(decorator, "attribute"))
        };
    }

    if (hasAttr(decorator, "base")) {
        schema.base = getValue(decorator, "base");
    }

    return schema;
}

function buildArrowStyle(style) {
    const schema = {};

    if (hasAttr(style, "stroke")) {
        let color = getAttr(style, "stroke");
        let value = getValue(color, "value");
        if (isNullOrUndefined(value)) {
            schema.stroke = "#000000";
        } else {
            schema.stroke = value.startsWith("#") ? value : `#${value}`;
        }
    }

    if (hasAttr(style, "stroke-width")) {
        schema.width = getValue(style, "stroke-width");
    }

    if (hasAttr(style, "stroke-dasharray")) {
        schema.dasharray = getValue(style, "stroke-dasharray");
    }

    if (hasAttr(style, "stroke-linecap")) {
        schema.linecap = getValue(style, "stroke-linecap");
    }

    if (hasAttr(style, "marker-end")) {
        schema.end = getValue(style, "marker-end");
    }

    if (hasAttr(style, "marker-start")) {
        schema.start = getValue(style, "marker-start");
    }

    return schema;
}

function buildTarget(target) {
    if (hasAttr(target, "attribute")) {
        return getValue(target, "attribute");
    } else {
        return "self";
    }
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
        label: buildLabel.call(this, getAttr(element, "label"))
    };

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}


function buildLabel(element) {
    let schema = {
        content: getValue(element, "content")
    };

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}



function buildFieldTemplate(element) {
    const schema = {};

    if (hasAttr(element, ATTR_TAG) && hasValue(element, ATTR_TAG)) {
        schema[ATTR_TAG] = getValue(element, ATTR_TAG);
    }

    if (hasAttr(element, ATTR_NAME) && hasValue(element, ATTR_NAME)) {
        schema[ATTR_NAME] = getValue(element, ATTR_NAME);
    }

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}

function buildSibling(sibling) {
    const schema = {};

    if (hasAttr(sibling, "tag")) {
        schema.tag = getValue(sibling, "tag");
    }

    if (hasAttr(sibling, "receiver")) {
        schema.receiver = getValue(sibling, "receiver");
    }

    return schema;
}