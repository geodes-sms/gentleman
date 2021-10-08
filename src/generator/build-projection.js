import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, createEmphasis, getElement, isNullOrUndefined, createSpan, isString } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";
import { buildStyle, buildGentlemanStyle } from "./build-style.js";


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


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getReferenceValue = (concept, attr, deep = false) => getReference(concept, attr).getValue();

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
    "container": buildContainer,
    "svg-container": buildSVGContainer,
    "field": buildField,
};

export function buildProjectionHandler(_options = {}) {
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
        "type": ((contentType === "container") || (contentType === "svg-container")) ? "layout" : contentType,
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
    "container": buildContainer,
    "svg-container": buildSVGContainer
};

function buildElement(element) {
    const contentType = element.getProperty("contentType");

    const handler = ElementHanlders[contentType];

    if (!isFunction(handler)) {
        return null;
    }

    let type = ((contentType === "container") || (contentType === "svg-container")) ? "layout" : contentType;

    return {
        type: type,
        [type]: handler.call(this, element)
    };
}


function buildContainer(container) {
    const schema = {};
    var disposition = [];

    getValue(container, "elements").filter(proto => proto.hasValue()).forEach(proto => {
        const element = proto.getValue(true);
        disposition.push(buildElement.call(this, element));
    });

    const PROP_ORIENTATION = "orientation";
    const PROP_WRAPPABLE = "wrappable";
    const PROP_ALIGNITEMS = "align-items";
    const PROP_JUSTIFYCONTENT = "justify-content";

    let layout = getAttr(container, "layout");

    schema.type = "flex";
    schema[PROP_ORIENTATION] = getValue(layout, PROP_ORIENTATION);
    schema[PROP_WRAPPABLE] = getValue(container, PROP_WRAPPABLE);
    schema[PROP_FOCUSABLE] = getValue(container, PROP_FOCUSABLE);
    schema[PROP_HIDDEN] = getValue(container, PROP_HIDDEN);
    schema.alignItems = getValue(layout, PROP_ALIGNITEMS);
    schema.justifyContent = getValue(layout, PROP_JUSTIFYCONTENT);

    schema.disposition = disposition;

    if (hasAttr(container, "style")) {
        schema.style = buildStyle.call(this, getAttr(container, 'style'));
    }

    return schema;
}

function buildSVGContainer (field) {
    const schema = {};

    schema.type = "svg";

    console.log(schema);
    
    if(hasAttr(field, "content")){
        schema.content = getValue(field, "content");
    }

    if(hasAttr(field, "p-link")){
        schema.link = buildSVGLink(getAttr(field, "p-link"));
    }

    if(hasAttr(field, "attributes") && (!isEmpty(getAttr(field, "attributes")))){
        schema.attributes = [];

        getValue(field, "attributes").forEach(a => {
            schema.attributes.push(buildSVGAttr(a))
        })
    }

    return schema;
}

function buildSVGAttr(attribute){
    const schema = {};

    if(hasAttr(attribute, "value")){
        schema.value = getValue(attribute, "value");
    }

    if(hasAttr(attribute, "placement")){
        schema.placement = buildPlacement(getValue(attribute, "placement", true));
    }

    if(hasAttr(attribute, "property")){
        schema.property = getValue(attribute, "property");
    }

    return schema;
}

function buildPlacement(placement){
    const schema = {};

    schema.type = placement.name;

    switch(schema.type){
        case "in-place":
            if(hasAttr(placement, "marker")){
                schema.marker = getValue(placement, "marker");
            }

            if(hasAttr(placement, "tag")){
                schema.tag = getValue(placement, "tag");
            }
            
            return schema;

        case "link-place":
            if(hasAttr(placement, "static-dependents") && !isEmpty(getValue(placement, "static-dependents"))){
                schema.sd = [];

                getValue(placement, "static-dependents").forEach(d => {
                    schema.sd.push(buildSVGExternal(d));
                })
            }

            if(hasAttr(placement, "dynamic-dependents") && !isEmpty(getValue(placement, "dynamic-dependents"))){
                schema.dd = [];

                getValue(placement, "dynamic-dependents").forEach(d => {
                    schema.dd.push(buildSVGExternal(d));
                })
            }
            
            return schema;
    }
}

function buildSVGExternal(external){
    const schema = {};

    if(hasAttr(external, "marker")){
        schema.marker = getValue(external, "marker");
    }

    if(hasAttr(external, "template")){
        schema.template = getValue(external, "template");
    }

    return schema;
}

function buildSVGLink(link){
    const schema = {};

    if(hasAttr(link, "tag")){
        schema.tag = getValue(link, "tag");
    }

    if(hasAttr(link, "marker")){
        schema.marker = getValue(link, "marker");
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

    if (hasAttr(element, PROP_TAG) && hasValue(element, PROP_TAG)) {
        schema[PROP_TAG] = getReferenceValue(element, PROP_TAG);
    }

    if (hasAttr(element, ATTR_REQUIRED)) {
        schema.required = getValue(element, ATTR_REQUIRED);
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
        schema.tag = getReferenceValue(element, PROP_TAG);
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
    schema[PROP_ASHTML] =  getValue(element, PROP_ASHTML);
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

    schema.content = getValue(element, "tag");
    schema.tag = getValue(element, "tag");

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

function InteractiveHandler(field){
    const schema = {};


    if(hasAttr(field, "content")){
        schema.content = getValue(field, "content");
    }

    if(hasAttr(field, "field")){
        schema.source = buildSourceSVG(getAttr(field, "field"))
    }

    if(hasAttr(field, "static-dependents") && !isEmpty(getValue(field, "static-dependents"))){
        schema.sd = [];

        getValue(field, "static-dependents").forEach(d =>{
            schema.sd.push(buildSVGExternal(d));
        })
    }

    if(hasAttr(field, "dynamic-dependents") && !isEmpty(getValue(field, "dynamic-dependents"))){
        schema.dd = [];

        getValue(field, "dynamic-dependents").forEach(d =>{
            schema.dd.push(buildSVGExternal(d));
        })
    }

    if(hasAttr(field, "marker")){
        schema.marker = getValue(field, "marker");
    }

    if(hasAttr(field, "markers")){
        schema.markers = [];

        getValue(field, "markers").forEach(m => {
            schema.markers.push(buildMarker(m));
        })
    }

    if(hasAttr(field, "self")){
        schema.self = [];

        getValue(field, "self").forEach(p =>{
            schema.self.push(getValue(p, "property"));
        })
    }


    return schema;
}

function buildSourceSVG(source){
    const schema = {};

    if(hasAttr(source, "marker")){
        schema.marker = getValue(source, "marker");
    }

    if(hasAttr(source, "tag")){
        schema.tag = getValue(source, "tag");
    }
    
    return schema;
}

function DynamicSVGHandler(field){
    const schema = {};

    if(hasAttr(field, "content")){
        schema.content = getValue(field, "content");
    }

    if(hasAttr(field, "marker")){
        schema.marker = getValue(field, "marker");
    }

    if(hasAttr(field, "markers")){
        schema.markers = [];

        getValue(field, "markers").forEach(m =>{
            schema.markers.push(buildMarker(m));
        })
    }

    if(hasAttr(field, "self")){
        schema.self = [];

        getValue(field, "self").forEach(p => {
            schema.self.push(getValue(p, "property"));
        })
    }


    return schema;
}

function StaticSVGHandler(field){
    const schema = {};

    if(hasAttr(field, "content")){
        schema.content = getValue(field, "content");
    }

    if(hasAttr(field, "model-value")){
        schema.mv = getValue(field, "model-value");
    }


    return schema;
}

function buildMarker(marker){
    const schema = {};

    if(hasAttr(marker, "model-value")){
        schema.mv = getValue(marker, "model-value");
    }

    if(hasAttr(marker, "aliases")){
        schema.aliases = [];

        getValue(marker, "aliases").forEach(a => {
            schema.aliases.push(buildAlias(a));
        })
    }

    return schema;
}

function buildAlias(alias){
    const schema = {};

    if(hasAttr(alias, "marker-value")){
        schema.mv = getValue(alias, "marker-value");
    }

    if(hasAttr(alias, "properties")){
        schema.props = buildSVGProperties(getAttr(alias, "properties"));
    }

    return schema;
}

function buildSVGProperties(props){
    let schema = {};

    schema.props = [];

    if(hasAttr(props, "bold") && getValue(props, "bold")){
        const bold = {};
        bold.props = "font-weight";
        bold.value = "bold"

        schema.props.push(bold);
    }

    if(hasAttr(props, "italic") && getValue(props, "italic")){
        const italic = {};
        italic.props = "font-style";
        italic.value = "italic";
        
        schema.props.push(italic);
    }

    if(hasAttr(props, "underline") && getValue(props, "underline")){
        const underline = {};
        underline.props = "text-decoration";
        underline.value = "underline";

        schema.props.push(underline);
    }


    if(hasAttr(props, "color")){
        let col = getAttr(props, "color");
        let c = getValue(col, "value");

        if(!isNullOrUndefined(c)){
            const color = {};
            color.props = "fill";
            color. value = c;

            schema.props.push(color);
        }
    }

    if(hasAttr(props, "size")){
        let s = getAttr(props, "size");

        if(!(isNullOrUndefined(s) || !hasValue(s, "value"))){
            const size = {};
            size.props = "font-size";
            size.value = getValue(s, "value") + getValue(s, "unit");

            schema.props.push(size);
        }
    }

    if(hasAttr(props, "text-content")){
        let t = getValue(props, "text-content");

        if((!isNullOrUndefined(t)) && (t !== "")){
            schema.props.push(
                {   
                    props : "textContent",
                    value : t
                }
            );
        }
    }
    
    if(hasAttr(props, "others")){
        getValue(props, "others").forEach(i => {
            schema.props.push(buildOther(i));
        })
    }

    return schema.props;
}

function buildOther(other){
    const schema = {};

    schema.property = getValue(other, "property");
    schema.value = getValue(other, "value");

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
        schema[ATTR_TAG] = getReferenceValue(element, ATTR_TAG);
    }

    if (hasAttr(element, ATTR_NAME) && hasValue(element, ATTR_NAME)) {
        schema[ATTR_NAME] = getValue(element, ATTR_NAME);
    }

    if (hasAttr(element, ATTR_STYLE)) {
        schema[ATTR_STYLE] = buildStyle.call(this, getAttr(element, ATTR_STYLE));
    }

    return schema;
}