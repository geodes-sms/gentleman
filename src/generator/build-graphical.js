import { buildProjection, createProjectionLink, buildConcept, buildDynamic } from "./build-projection";
import { isEmpty, valOrDefault, isNullOrWhitespace, isFunction, createEmphasis, getElement, isNullOrUndefined, createSpan, isString } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";

const ATTR_RTAGS = "rtags";
const ATTR_ALGO = "algorithm"
const ATTR_CONTENT = "content";
const ATTR_CONCEPT = "concept";
const ATTR_VALUE = "value";
const PROP_HANDLER = "handler";
const ATTR_NAME = "name";

const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getReferenceValue = (concept, attr, deep = false) => getReference(concept, attr).getValue();

const getReferenceName = (concept, attr) => getName(getReference(concept, attr));

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();

const GraphicalBuildHandler = {
    "general": buildAlgorithm,
    "projection": delegate,
    "template": buildFragment
}

const AlgorithmHandler = {
    "force": buildForceAlgo,
    "pattern": buildPatternAlgo
}


export function buildGraphicalHandler(_options = {}) {
    const result = [];

    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "projection",
        download: true,
        notify: "always"
    }, _options);

    const concepts = conceptModel.getConcepts(["general", "projection", "g-fragment"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: Please create at least one projection.", NotificationType.WARNING, 2000);

        return false;
    }

    this.__errors = [];


    concepts.forEach(concept => {

        const handler = GraphicalBuildHandler[valOrDefault(concept.getProperty(PROP_HANDLER), "")];

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
};

function delegate(concept){
    return buildProjection.call(this, concept);
}

const FragmentHandler = {
    "static": StaticSVGHandler,
    "dynamic": DynamicSVGHandler
}

function buildFragment(concept){
    const name = getName(concept);

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(concept, "name"));
        let error = createSpan({
            class: ["error-message"]
        }, [`Template error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    const svg = getValue(concept, "content", true);

    const handler = FragmentHandler[svg.getProperty("elementType")]; 

    const content = handler.call(this, svg);

    let schema = {
        id: concept.id,
        type: "g-fragment",
        name: name,
        content: content,

    }

    return {
        success: true,
        message: schema,
    };
}


function buildAlgorithm(concept){

    const rtags = hasAttr(concept, ATTR_RTAGS) ? getValue(concept, ATTR_RTAGS, true) : [];


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

    if (!hasValue(concept, ATTR_ALGO)) {
        let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_ALGO));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    const content = getValue(concept, ATTR_ALGO, true);

    if (isNullOrUndefined(content)) {
        let link = createProjectionLink.call(this, "content", getAttr(concept, ATTR_ALGO));
        let error = createSpan({
            class: ["error-message"]
        }, [`Projection error: `, link, ` is missing a value`]);

        return {
            success: false,
            message: {
                "id": concept.id,
                "concept": target,
                "rtags": rtags,
                "type": null,
                "content": null
            }
        };
    }
    const contentType = content.getProperty("contentType");

    let schema = {
        "id": concept.id,
        "concept": target,
        "rtags": rtags,
        "type": "algorithm",
        "content": AlgorithmHandler[contentType].call(this, content),
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

function buildForceAlgo(algo){
    const schema = {};

    schema.type = "force";

    if(hasAttr(algo, "dimensions")){
        schema.dimensions = buildDimensions.call(this, getAttr(algo, "dimensions"))
    }

    if(hasAttr(algo, "direction")){
        schema.direction = getValue(algo, "direction");
    }

    if(hasAttr(algo, "intensity")){
        schema.intensity = buildIntensity.call(this, getValue(algo, "intensity", true));
    }

    if(hasAttr(algo, "center")){
        schema.center = getValue(algo, "center");
    }

    if(hasAttr(algo, "edges")){
        schema.edges = getValue(algo, "edges");
    }

    if(hasAttr(algo, "attributes") && !isEmpty(getValue(algo, "attributes"))){
        let attributes = [];
        
        getValue(algo, "attributes").forEach(a => {
            attributes.push(
                {
                    type: "dynamic",
                    dynamic: buildDynamic.call(this, a)
                }
            )
        })

        schema.attributes = attributes;
    }

    if(hasAttr(algo, "fixed-elements") && !isEmpty(getValue(algo, "fixed-elements"))){
        let fixed = [];

        getValue(algo, "fixed-elements").forEach(f => {
            fixed.push(buildFixedElement.call(this, f));
        })

        schema.fixed = fixed;
    }

    if(hasAttr(algo, "arrow-management")){
        schema.arrowManagement = buildArrowManagement.call(this, getValue(algo, "arrow-management", true));
    }

    return schema;
}

function buildIntensity(intensity){
    return getValue(intensity, "intensity");
}

function buildDimensions(dimensions){
    const schema = {};

    schema.width = getValue(dimensions, "x");
    schema.height = getValue(dimensions, "y");

    return schema
}

function buildFixedElement(element){
    const schema = {};
    
    schema.attribute = {
        type : "dynamic",
        dynamic : buildDynamic.call(this, getAttr(element, "attribute"))
    }

    schema.coordinates = buildDimensions.call(this, getAttr(element, "coordinates"));

    schema.ratio = buildRatio.call(this, getAttr(element, "ratio"));

    return schema;
}

function buildRatio(ratio){
    return getValue(ratio, "value");
}

function buildPatternAlgo(algo){
    const schema = {};

    schema.type = "pattern";

    if(hasAttr(algo, "dimensions")){
        schema.dimensions = buildDimensions.call(this, getAttr(algo, "dimensions"));
    }

    let attributes = [];
    if(hasAttr(algo, "attributes")){
        getValue(algo, "attributes").forEach(a => {
            attributes.push({
                type: "dynamic",
                dynamic: buildDynamic.call(this, a)
            })
        })
    }
    schema.attributes = attributes;


    if(hasAttr(algo, "pattern")){
        schema.pattern = buildPattern.call(this, getAttr(algo, "pattern"));
    }

    let anchorAttr = []
    if(hasAttr(algo, "anchor-attributes")){
        getValue(algo, "anchor-attributes").forEach(a => {
            anchorAttr.push(buildAnchorAttr.call(this, a))
        })
    }

    schema.anchorAttr = anchorAttr;

    if(hasAttr(algo, "arrow-management")){
        schema.arrow = buildPatternArrow.call(this, getAttr(algo, "arrow-management"));
    }

    console.log(schema);
    return schema;
}

function buildPattern(pattern){
    const schema = {};

    if(hasAttr(pattern, "attribute")){
        schema.attribute = {
            type: "dynamic",
            dynamic: buildDynamic.call(this, getAttr(pattern, "attribute"))
        }
    }

    if(hasAttr(pattern, "placement")){
        schema.placement = buildAnchors.call(this, getAttr(pattern, "placement"));
    }

    if(hasAttr(pattern, "anchors")){
        schema.anchors = buildAnchors.call(this, getValue(pattern, "anchors", true));
    }

    if(hasAttr(pattern, "size")){
        schema.size = buildPatternSize.call(this, getValue(pattern, "size", true));
    }

    return schema;
}

function buildAnchorAttr(attribute){
    const schema = {};

    if(hasAttr(attribute, "attribute")){
        schema.attribute = {
            type: "dynamic",
            dynamic: buildDynamic.call(this, getAttr(attribute, "attribute"))
        }
    }

    if(hasAttr(attribute, "placement")){
        schema.placement = buildPatternPlacement.call(this, getValue(attribute, "placement", true));
    }

    return schema;
}

function buildPatternPlacement(placement){
    const schema = {};
    schema.type = placement.name;

    switch(schema.type){
        case "unique-placement":
            schema.base = getValue(placement, "base")
            return schema;
        case "anchor-based":
            schema.base = getValue(placement, "base");
            return schema;
    }
}

function buildPatternSize(size){
    const schema = {};
    schema.type = size.name;

    switch(schema.type){
        case "inherited-size":
            schema.marker = getValue(size, "marker");
            schema.property = getValue(size, "property");

            return schema;
        case "ratio-sized":
        case "absolute-sized":
            schema.ratio = getValue(size, "ratio");
            return schema;
    }
}

function buildAnchors(anchor){
    const schema = {};
    schema.type = anchor.name;

    switch(schema.type){
        case "evolutive-anchors":

            if(hasAttr(anchor, "first")){
                schema.first = buildCoordinates.call(this, getAttr(anchor, "first"));
            }
        
            if(hasAttr(anchor, "next")){
                schema.next = buildCoordinates.call(this, getAttr(anchor, "next"));
            }
        
            return schema;
        case "inherited-anchors":
            return schema;
    }

}



function buildCoordinates(coordinates){
    const schema = {};

    schema.x = getValue(coordinates, "x");
    schema.y = getValue(coordinates, "y");

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

function buildPatternArrow(arrow){
    const schema = {};

    schema.content = getValue(arrow, "content");

    let attributes = [];

    getValue(arrow, "attribute").forEach(a => {
        attributes.push(
            {
                type: "dynamic",
                dynamic: buildDynamic.call(this, a)
            }
        )
    })
    schema.attribute = attributes;

    let selfArrow = [];

    getValue(arrow, "self-behavior").forEach(c => {
        selfArrow.push(
            buildCoordinates.call(this, c)
        )
    })

    schema.selfArrow = selfArrow;
    

    if(hasAttr(arrow, "ranking")){
        schema.ranking = buildRanking.call(this, getAttr(arrow, "ranking"));
    }

    console.log("arrowSChema");
    console.log(schema);

    return schema;
}

function buildRanking(rank){
    const schema = {};

    if(hasAttr(rank, "target")){
        schema.target = getValue(rank, "target");
    }

    if(hasAttr(rank, "order")){
        schema.order = getValue(rank, "order");
    }

    return schema;

}

function buildArrowManagement(arrow){
    const schema = {};

    schema.type = arrow.name;

    switch(schema.type){
        case "interaction-management":
            schema.content = getValue(arrow, "content");

            let attributes = [];

            getValue(arrow, "attribute").forEach(a => {
                attributes.push(
                    {
                        type: "dynamic",
                        dynamic: buildDynamic.call(this, a)
                    }
                )
            })
            schema.attribute = attributes;

            let selfArrow = [];

            getValue(arrow, "self-behavior").forEach(c => {
                selfArrow.push(
                    buildCoordinates.call(this, c)
                )
            })

            schema.selfArrow = selfArrow;
            return schema;
        case "svg-management":
            schema.content = getValue(arrow, "content");

            schema.attribute = {
                type : "dynamic",
                dynamic : buildDynamic.call(this, getAttr(arrow, "attribute"))
            }

            schema.ratio = getValue(arrow, "ratio");
            schema.position = buildCoordinates.call(this, getAttr(arrow, "position"));

            return schema;
    }
}