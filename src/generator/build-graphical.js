import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, isNullOrUndefined, createSpan, camelCase, isNull } from "zenkai";
import { NotificationType, LogType, shake } from "@utils/index.js";
import { buildStyle, buildGentlemanStyle } from "./build-style.js";
import { getAttr, getReferenceValue, getReferenceName, hasAttr, hasValue, getName, getValue, createProjectionLink } from './utils.js';
import { buildProjection, buildStyleRule, buildTemplate, buildConcept } from "./build-projection.js";


const PROP_HANDLER = "handler";
const PROP_HANDLERTYPE = "handlerType";
const PROP_ELEMTYPE = "elementType";

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

const GraphicalBuildHandler = {
    "graphical": buildGraphical,
    "projection": buildProjection,
    "template": buildTemplate,
    "style": buildStyleRule
};

const GraphicalHandler = {
    "algorithm": buildLayout,
    "field": buildField
}

export function buildGraphicalHandler(_options = {}) {
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

    const concepts = conceptModel.getConcepts(["graphical", "projection", "template", "style rule"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: Please create at least one projection.", NotificationType.WARNING, 2000);

        return false;
    }

    this.__errors = [];

    concepts.forEach(concept => {

        let type = valOrDefault(concept.getProperty(PROP_HANDLER), "");

        const handler = GraphicalBuildHandler[type];

        const { message } = handler.call(this, concept);

        if (type === "graphical") {
            result["projection"].push(message);
        } else {
            result[type].push(message);
        }
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

function buildGraphical(concept) {
    const tags = hasAttr(concept, ATTR_TAGS) ? getValue(concept, ATTR_TAGS, true) : [];
    let rtag;

    let test = getValue(concept, "element", true);

    if(hasAttr(test, "treeId")){
        rtag = getValue(test, "treeId");
    }

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

    const container = getValue(concept, "element", true);

    let schema = {
        "concept": target,
        "tags": tags
    };

    if(!isNullOrUndefined(rtag)){
        schema.rtag = rtag;
    }

    const handler = container.getProperty(PROP_HANDLERTYPE);

    schema.type = handler;

    schema["content"] = GraphicalHandler[handler].call(this, container);

    if (hasAttr(concept, ATTR_NAME) && hasValue(concept, ATTR_NAME)) {
        schema.name = getName(concept);
    }

    return {
        success: true,
        message: schema,
    };
}


const LayoutHandler = {
    "decoration": buildDecorationLayout,
    "force": buildForceLayout,
    "tree": buildTreeLayout,
}

function buildLayout(layout) {
    const elementType = layout.getProperty(PROP_ELEMTYPE);

    var schema = {
        type: elementType
    };

    const handler = LayoutHandler[elementType];

    if (!isFunction(handler)) {
        return null;
    }

    Object.assign(schema, handler.call(this, layout));

    return schema;
}

function buildDecorationLayout(layout) {
    const schema = {};

    if (hasAttr(layout, "dimensions")) {
        schema.dimensions = buildAbsolute.call(this, getAttr(layout, "dimensions"));
    }

    if (hasAttr(layout, "coordinates")) {
        schema.coordinates = buildCoordinates.call(this, getAttr(layout, "coordinates"));
    }

    const shape = getAttr(layout, "shape");

    if(!isEmpty(getValue(shape, "elements"))){
        schema.background = buildShape.call(this, shape)
    }

    if(isNullOrUndefined(schema.background) && getValue(layout, "background")){
        schema.background = getValue(layout, "background");
    }

    if (!isEmpty(getValue(layout, "content"))) {
        let content = [];

        getValue(layout, "content").forEach(elem => {
            let item = getValue(elem, "render", true);

            const itemSchema = {};

            itemSchema.dimension = buildDimension.call(this, getValue(item, "dimension", true));
            itemSchema.coordinates = buildCoordinates.call(this, getAttr(item, "coordinates"));
            
            itemSchema.render = buildElement.call(this, item);

            content.push(itemSchema);
        });

        schema.content = content;
    }

    if(hasAttr(layout, "rmv")){
        schema.rmv = buildRmv.call(this, getValue(layout, "rmv", true));
    }

    return schema;
}

function buildRmv(rmv){
    const schema = {};
    
    switch(rmv.name){
        case "rmv-single":
            schema.render ={
                kind: "static",
                type: "svg",
                content: getValue(rmv, "background")
            }
            schema.dimensions = buildDimension.call(this, getValue(rmv, "dimensions", true));
            schema.coordinates = buildCoordinates.call(this, getAttr(rmv, "coordinates"));
            break;
    }

    return schema;
}

function buildTreeLayout(layout){
    const schema = {};

    schema.depth = getValue(layout, "depth");

    schema.dimensions = {
        width: getValue(layout, "width"),
        height: getValue(layout, "height")
    }

    schema.tag = getValue(layout, "tag");

    schema.treeId = getValue(layout, "treeId");

    schema.duration = 500;
    
    return schema;
}

function buildForceLayout(layout) {
    const schema = {};

    schema.dimensions = buildDimension.call(this, getAttr(getAttr(layout, "force"), "dimension"));

    schema.force = buildForce.call(this, getAttr(layout, "force"));

    schema.tag = getValue(layout, "tag");

    return schema;
}

function buildForce(force) {
    const schema = {};

    schema.intensity = Math.min(getValue(force, "intensity"), -1 * getValue(force, "intensity"));

    schema.linkVal = getValue(force, "linkVal");

    return schema;
}

const ElementHandler = {
    "layout": buildLayout,
    "dynamic": buildDynamic,
    "field": buildField,
    "static": buildStatic,
};

function buildElement(element) {

    const contentType = element.getProperty("contentType");

    const handler = ElementHandler[contentType];

    if (!isFunction(handler)) {
        return null;
    }

    let type = contentType;

    return Object.assign({ kind: type }, handler.call(this, element));
}

const DynamicHanlders = {
    "projection": AttributeDynamicHandler,
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

    if (hasAttr(element, "listen")) {
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



const StaticHandler = {
    "svg-text": buildSVGTextStatic,
    "svg-button": buildSVGButton,
    "svg": buildSVGStatic
};

function buildStatic(elem) {
    const elemType = elem.getProperty(PROP_ELEMTYPE);

    const handler = StaticHandler[elemType];

    if (isNullOrUndefined(handler)) {
        return null;
    }

    return Object.assign({ type: elemType }, handler.call(this, elem));
}

function buildSVGTextStatic(text) {
    const schema = {};

    schema.content = getValue(text, "content");

    schema.style = buildTextStyle.call(this, getAttr(text, "style"));

    return schema;
}

function buildSVGButton(button) {
    const schema = {};

    const shape = getAttr(button, "shape");

    /*if(!isEmpty(getAttr(shape, "elements"))){
        schema.content = buildShape.call(this, shape)
    }*/

    if(isNullOrUndefined(schema.content) && getValue(button, "content")){
        schema.content = getValue(button, "content");
    }

    schema.action = buildBtnAction.call(this, getValue(button, "action", true));

    if (schema.action.type === "SIDE") {
        schema.action.target = getValue(button, "tag");
    }

    return schema;
}

function buildBtnAction(action){
    const schema = {};

    switch(action.name){
        case "tree-action":
            schema.type = "CREATE-TREE";
            schema.target = getValue(action, "treeId");
            schema.value = getValue(action, "item");

            break;
    }

    return schema;
}

function buildSVGStatic(image){
    const schema = {};

    schema.content = getValue(image, "content");

    return schema;
}

const FieldHandler = {
    "svg": buildSVGText,
    "svg-choice": buildSVGChoice,
    "svg-switch": buildSVGSwitch
}

function buildField(field) {
    const schema = {};

    const elemType = field.getProperty(PROP_ELEMTYPE);

    const handler = FieldHandler[elemType];

    if (isNullOrUndefined(handler)) {
        return null;
    }

    return Object.assign({ type: elemType }, handler.call(this, field));
}

function buildSVGText(field) {
    const schema = {};

    schema.placeholder = getValue(field, "placeholder");

    schema.readonly = valOrDefault(getValue(field, "readonly"), false);

    schema.break = getValue(field, "break");

    schema.style = buildTextStyle.call(this, getAttr(field, "style"));

    return schema;
}

function buildSVGChoice(field) {

    console.log("BuildingChoice");
    const schema = {};

    schema.tag = getValue(field, "tag");

    schema.selection = buildSelection.call(this, getAttr(field, "selection"));

    return schema;
}

function buildSVGSwitch(field){
    const schema = {};

    if(hasAttr(field, "order") && !isEmpty(getValue(field, "order"))){
        let order = [];

        getValue(field, "order").forEach( (value) => {
            order.push(value.value);
        })

        schema.order = order;
    } 

    if(hasAttr(field, "dimensions")){
        schema.dimensions = buildDimension.call(this, getAttr(field, "dimension"));
    }

    return schema;
}

function buildSelection(selection){
    const schema = {};

    schema.orientation = getValue(selection, "orientation");

    schema.breakDown = getValue(selection, "break");

    schema.dimensions = buildDefaultDimension.call(this, getAttr(selection, "dimensions"));

    return schema;
}

function buildTextStyle(text) {
    const schema = {};

    schema.font = getValue(text, "font");

    schema.baseline = getValue(text, "baseline");

    schema.size = getValue(text, "size");

    schema.anchor = getValue(text, "anchor");

    if (hasAttr(text, "weight") && hasValue(text, "weight")) {
        schema.weight = getValue(text, "weight");
    }

    return schema;
}

function buildAbsolute(dimension) {
    const schema = {};

    schema.width = getValue(dimension, "width");
    schema.height = getValue(dimension, "height");

    return schema;
}

function buildDimension(dimension) {
    const schema = {};
    schema.type = dimension.name;

    switch (dimension.name) {
        case "absolute":
            schema.width = getValue(dimension, "width");
            schema.height = getValue(dimension, "height");

            break;
        case "fixed":
            schema.value = getValue(dimension, "width");

            break;
        default:
            break;
    }

    return schema;
}

function buildDefaultDimension(dimensions) {
    const schema = {};

    schema.width = getValue(dimensions, "width");
    schema.height = getValue(dimensions, "height");

    return schema;
}

function buildCoordinates(coordinates) {
    const schema = {};

    schema.x = getValue(coordinates, "x");
    schema.y = getValue(coordinates, "y");

    return schema;
}

const ShapeHandler = {
    "circle": buildCircle,
    "rectangle": buildRectangle,
    "ellipse": buildEllipse,
    "polygon": buildPolygon,
    "path": buildPath,
};

function buildShape(shape) {
    let content = '<svg xmlns=\"http://www.w3.org/2000/svg\" ';

    const width = getValue(shape, "width");
    content += 'width=\"' + width + '\" ';

    const height = getValue(shape, "height");
    content += 'height=\"' + height + '\" ';

    const minX = getValue(shape, "minX");
    const minY = getValue(shape, "minY");
    const windowW = getValue(shape, "windowW");
    const windowH = getValue(shape, "windowH");

    content += 'viewBox=\"' + minX + ' ' + minY + ' ' + valOrDefault(windowW, width) + ' ' + valOrDefault(windowH, height) + '\">';

    getValue(shape, "elements").forEach(elem => {
        let item = elem.getValue(true);

        content += ShapeHandler[item.name].call(this, item);
    });

    content += "</svg>";

    return content;
}

function buildCircle(circle) {
    let content = "<circle ";

    const cx = getValue(circle, "cx");
    content += "cx=\"" + cx + "\" ";

    const cy = getValue(circle, "cy");
    content += "cy=\"" + cy + "\" ";

    const r = getValue(circle, "r");
    content += "r=\"" + r + "\" ";

    content += applyStyleCircle.call(this, getAttr(circle, "style"));

    content += "></circle>";

    return content;
}

function buildRectangle(rectangle) {
    let content = "<rect ";

    const x = getValue(rectangle, "x");
    content += "x=\"" + x + "\" ";

    const y = getValue(rectangle, "y");
    content += "y=\"" + y + "\" ";

    const width = getValue(rectangle, "width");
    content += "width=\"" + width + "\" ";

    const height = getValue(rectangle, "height");
    content += "height=\"" + height + "\" ";

    content += applyStyleRect(getAttr(rectangle, "style"));

    content += "></rect>";

    return content;
}

function buildEllipse(ellipse) {
    let content = "<ellipse ";

    const x = getValue(ellipse, "cx");
    content += "cx=\"" + x + "\" ";

    const y = getValue(ellipse, "cy");
    content += "cy=\"" + y + "\" ";

    const width = getValue(ellipse, "rx");
    content += "rx=\"" + width + "\" ";

    const height = getValue(ellipse, "ry");
    content += "ry=\"" + height + "\" ";

    content += applyStyleCircle(getAttr(ellipse, "style"));

    content += "></ellipse>";

    return content;

}

function buildPolygon(polygon) {
    let content = "<polygon ";

    const points = getValue(polygon, "points");
    content += "points=\"" + points + "\" ";

    content += applyStyleCircle(getAttr(polygon, "style"));

    return content;
}

function buildPath(path) {
    let content = "<path ";

    const d = getValue(path, "d");
    content += "d=\"" + d + "\" ";

    content += applyStyleCircle(getAttr(path, "style"));

    content += "></path>";

    return content;
}

function applyStyleCircle(style) {
    let content = "";

    const fill = valOrDefault(getValue(style, "fill"), "black");
    content += "fill=\"" + fill + "\" ";

    const stroke = valOrDefault(getValue(style, "stroke"), "black");
    content += "stroke=\"" + stroke + "\" ";

    const width = valOrDefault(getValue(style, "s-width"), 0);
    content += "stroke-width=\"" + width + "\" ";

    const dasharray = getValue(style, "s-dash");
    if (!isNullOrUndefined(dasharray)) {
        content += "stroke-dasharray=\"" + dasharray + "\"";
    }

    return content;

}

function applyStyleRect(style) {
    let content = "";

    const fill = valOrDefault(getValue(style, "fill"), "black");
    content += "fill=\"" + fill + "\" ";

    const stroke = valOrDefault(getValue(style, "stroke"), "black");
    content += "stroke=\"" + stroke + "\" ";

    const width = valOrDefault(getValue(style, "s-width"), 0);
    content += "stroke-width=\"" + width + "\" ";

    const dasharray = getValue(style, "s-dash");
    if (!isNullOrUndefined(dasharray)) {
        content += "stroke-dasharray=\"" + dasharray + "\" ";
    }

    const rx = getValue(style, "rx");
    if (!isNullOrUndefined(rx)) {
        content += "rx=\"" + rx + "\" ";
    }

    const ry = getValue(style, "ry");
    if (!isNullOrUndefined(ry)) {
        content += "ry=\"" + ry + "\" ";
    }

    return content;
}
