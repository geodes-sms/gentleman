import { isEmpty, isFunction, isNullOrUndefined, valOrDefault } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";
import { createProjectionLink } from "./utils";


const PROP_HANDLER = "handler";

const ATTR_TAGS = "tags";
const ATTR_CONCEPT = "concept";
const ATTR_NAME = "name";
const ATTR_PROTOTYPE = "prototype";


const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getReferenceValue = (concept, attr, deep = false) => getReference(concept, attr).getValue();

const getReferenceName = (concept, attr) => getName(getReference(concept, attr));

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => valOrDefault(getValue(concept, ATTR_NAME), "").toLowerCase();


const GraphicalBuildHandler = {
    "projection": buildProjection,
};

export function buildGraphicalHandler(_options = {}) {
    const result = {
        type: "projection",
        "projection": [],
    };

    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "projection",
        download: true,
        notify: "always"
    }, _options);

    const concepts = conceptModel.getConcepts(["projection"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: Please create at least one projection.", NotificationType.WARNING, 2000);

        return false;
    }

    this.__errors = [];

    concepts.filter( (p) => valOrDefault(p.getProperty(PROP_HANDLER), "") !== "shape").forEach(concept => {

        let type = valOrDefault(concept.getProperty(PROP_HANDLER), "");

        const handler = GraphicalBuildHandler[type];

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
        this.download(result, options.name, "JSON");
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

    console.log(concept);

    const container = getAttr(concept, "container");

    let schema = {
        concept: target,
        tags: tags,
        type: "algorithm",
        content: buildContainer.call(this, container)
    }

    return {
        success: true,
        message: schema,
    }
}

function buildContainer(container) {
    const schema = {};

    console.log(container);

    const layout = getValue(container, "layout", true);

    Object.assign(schema, LayoutHandler[layout.name].call(this, layout));

    let content = [];

    getValue(container, "elements").filter( (proto) => proto.hasValue()).forEach( (proto) => {
        const element = proto.getValue(true);
        content.push(buildElement.call(this, element));
    })

    schema.content = content;

    return schema;
}

const LayoutHandler = {
    "wrap-layout": buildWrapLayout,
    "adaptive-layout": buildAdaptiveLayout,
}

function buildWrapLayout(layout) {
    const schema = {
        type: "wrap"
    };

    schema.focusable = getValue(layout, "focusable");
    schema.speed = getValue(layout, "speed");

    const meet = getValue(layout, "meet");

    if(meet !== "None" && !isNullOrUndefined(meet)) {
        schema.meet = meet.toLowerCase();
    }

    return schema;
}

function buildAdaptiveLayout(layout) {
    const schema = {
        type: "adaptive"
    };

    const background = {};

    background.focusable = getValue(layout, "focusable");
    background.speed = getValue(layout, "speed");
    background.wrap = getValue(layout, "wrap");
    background.content = "";

    const meet = getValue(layout, "meet");

    if(meet !== "None" && !isNullOrUndefined(meet)) {
        background.meet = meet.toLowerCase();
    }

    

    schema.background = background;

    return schema;
}

const ElementHandler = {
    "field": buildField,
}

function buildElement(element) {
    const contentType = element.getProperty("contentType");

    const handler = ElementHandler[contentType];

    if(!isFunction(handler)) {
        return null;
    }

    return handler.call(this, element)
}


const FieldHandler = {
    "text": buildTextField
}

function buildField(field) {
    const elementType = field.getProperty("elementType");

    const handler = FieldHandler[elementType];

    if(!isFunction(handler)) {
        return;
    }

    const schema = handler.call(this, field);

    return {
        type: "field",
        field: schema
    }
}

function buildTextField(field) {
    const schema = {
        type: "svg"
    };

    schema.anchor = getValue(field, "anchor");
    schema.baseline = getValue(field, "baseline");

    if(hasValue(field, "placeholder")) {
        schema.placeholder = getValue(field, "placeholder");
    }

    schema.style = buildTextStyle.call(this, getAttr(field, "style"));

    return schema;
}

function buildTextStyle(style) {
    const schema = {};

    schema.bold = getValue(style, "bold");
    schema.italic = getValue(style, "italic");
    schema.underline = getValue(style, "underline");
    schema.strikethrough = getValue(style, "strikethrough");

    const color = getAttr(style, "color");

    schema.color = getValue(color, "value");

    schema.font = buildTextFont.call(this, getValue(style, "font", true)) 

    return schema;
}

function buildTextFont(font) {
    const schema = {};

    switch(font.name) {
        case "default-font":
            schema.type = "embedded",
            schema.family = getValue(font, "family");
            break;
        case "imported-font":
            schema.type = "imported";
            schema.family = getValue(font, "family");
            schema.url = getValue(font, "url");
            break;
    }

    const size = getAttr(font, "size");

    if(!isNullOrUndefined(getValue(size, "value"))) {
        schema.size = getValue(size, "value");
        schema.unit = getValue(size, "unit");
    }
    
    return schema;
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


