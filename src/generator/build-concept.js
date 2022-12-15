import { createSpan, isEmpty, isNullOrUndefined, isNullOrWhitespace, isObject, capitalizeFirstLetter } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";
import { getAttr, getReference, hasAttr, hasValue, getName, getValue, createProjectionLink } from './utils.js';


const PROP_NATURE = "nature";
const PROP_TYPE = "type";

const ATTR_ATTRIBUTES = "attributes";
const ATTR_BASE = "base";
const ATTR_NAME = "name";
const ATTR_REQUIRED = "required";
const ATTR_PROPERTIES = "properties";
const ATTR_PROTOTYPE = "prototype";


export function buildConceptHandler(_options = {}) {
    const result = [];

    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "metamodel",
        download: true
    }, _options);

    const concepts = conceptModel.getConcepts(["prototype-concept", "concrete-concept", "derivative-concept"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: Please create at least one concept.", NotificationType.WARNING);

        return false;
    }

    this.__errors = [];

    concepts.forEach(concept => {
        const { message } = buildConcept.call(this, concept);

        if (result.find(c => c.name === message.name)) {
            this.__errors.push(`The model has two concepts with the same name: ${message.name}`);
        } else {
            result.push(message);
        }
    });

    if (!isEmpty(this.__errors)) {
        this.notify("<strong>Validation failed</strong>: The model could not be built.<br> <em>See Log for more details</em>.", NotificationType.ERROR);
        this.logs.add(this.__errors, "Validation error", LogType.ERROR);

        delete this.__errors;

        return false;
    }


    this.notify("The concept model was <strong>successfully</strong> built", NotificationType.SUCCESS, 2000);

    if (options.download) {
        this.download(JSON.stringify( {
            type: "concept",
            concept: result,
            definition: conceptModel.export()
        }), options.name, "JSON");
    }

    delete this.__errors;

    return result;
}

function buildConcept(concept) {
    const name = getName(concept);
    const nature = concept.getProperty(PROP_NATURE);
    const isRoot = getValue(concept, "root");
    const attributes = [];
    const properties = [];

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(concept, ATTR_NAME));
        let error = createSpan({
            class: ["error-message"]
        }, [`${capitalizeFirstLetter(nature)} concept: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    if (concept.isAttributeCreated(ATTR_ATTRIBUTES)) {
        getValue(concept, ATTR_ATTRIBUTES).forEach(attribute => {
            const { message } = buildAttribute.call(this, attribute);

            if (attributes.find(attr => attr.name === message.name)) {
                this.__errors.push(`The concept has two attributes with the same name: ${message.name}`);
            } else {
                attributes.push(message);
            }
        });
    }

    if (concept.isAttributeCreated(ATTR_PROPERTIES)) {
        getValue(concept, ATTR_PROPERTIES).forEach(property => {
            const { message } = buildProperty.call(this, property);

            if (properties.find(prop => prop.name === message.name)) {
                this.__errors.push(`The concept has two properties with the same name: ${message.name}`);
            } else {
                properties.push(message);
            }
        });
    }

    let schema = {
        "id": concept.id,
        "name": name,
        "nature": nature,
        "root": isRoot,
        "attributes": attributes,
        "properties": properties,
        // "metadata": JSON.stringify(concept.export())
    };

    if (concept.isAttributeCreated(ATTR_PROTOTYPE) && hasValue(concept, ATTR_PROTOTYPE)) {
        schema.prototype = getName(getReference(concept, ATTR_PROTOTYPE));
    }

    if (concept.isAttributeCreated(ATTR_BASE) && hasValue(concept, ATTR_BASE)) {
        Object.assign(schema, buildTarget.call(this, getValue(concept, ATTR_BASE, true), "base"));
    }

    return {
        message: schema,
    };
}

/**
 * Build a concept attribute
 * @param {*} attribute
 */
function buildAttribute(attribute) {
    const name = getName(attribute);

    const required = hasAttr(attribute, ATTR_REQUIRED) && hasValue(attribute, ATTR_REQUIRED) ? getValue(attribute, ATTR_REQUIRED) : true;

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(attribute, ATTR_NAME));
        let error = createSpan({
            class: ["error-message"]
        }, [`Attribute: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    if (!hasValue(attribute, "target")) {
        let link = createProjectionLink.call(this, "target", getAttr(attribute, "target"));
        let error = createSpan({
            class: ["error-message"]
        }, [`Attribute: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    const schema = {
        "name": name,
        "target": buildTarget.call(this, getValue(attribute, "target", true)),
        "required": required
    };

    return {
        message: schema,
    };
}

/**
 * Build a target concept
 * @param {*} attribute
 */
function buildTarget(target, propname = "name") {
    if (isNullOrUndefined(target)) {
        return null;
    }

    let name = target.getProperty("cname");

    if (name === "concept") {
        if (!hasValue(target, "concept")) {
            let link = createProjectionLink.call(this, "concept", getAttr(target, "concept"));
            let error = createSpan({
                class: ["error-message"]
            }, [`${capitalizeFirstLetter(target.getName())}: `, link, ` is missing a value`]);

            this.__errors.push(error);
        } else {
            name = getAttr(target,"concept").value;
        }
    }

    const result = {
        [propname]: name
    };

    if (hasAttr(target, "accept")) {
        let accept = getValue(target, "accept", true);

        if (isObject(accept)) {
            result["accept"] = buildTarget.call(this, accept);
        } else {
            result["accept"] = { "name": accept.toLowerCase() };
        }
    }

    ["default", "ordered", "rel"].filter(prop => hasAttr(target, prop) && hasValue(target, prop))
        .forEach(prop => {
            result[prop] = getValue(target, prop);
        });


    if (hasAttr(target, "constraints")) {
        let constraints = [];
        getValue(target, "constraints").forEach(ctr => {
            const result = buildConstraint.call(this, ctr);

            constraints.push(result);
        });

        result["constraint"] = constraints;
    }

    return result;
}

function buildConstraint(constraint) {
    const result = {};

    if (!hasValue(constraint, "type")) {
        return result;
    }

    result.property = getValue(constraint, "property");
    let type = getValue(constraint, "type", true);

    if (type.name === "constraint-number-value") {
        result.type = "value";
        result.value = getValue(type, "value");
    } else if (type.name === "constraint-number-range") {
        result.type = "range";
        result.range = {
            min: getValue(type, "min"),
            max: getValue(type, "max")
        };
    } else if (type.name === "constraint-string-pattern") {
        result.type = "pattern";
        result.pattern = {
            insensitive: getValue(type, "insensitive"),
            global: getValue(type, "global"),
            value: getValue(type, "value")
        };
    } else if (type.name === "constraint-string-values") {
        result.type = "values";
        result.values = getValue(type, "values", true);
    }
    if (hasAttr(constraint, "scope") && hasValue(constraint, "scope")) {
        result["scope"] = getName(getReference(constraint, 'scope'));
    }


    return result;
}

/**
 * Build a concept property
 * @param {*} property 
 */
function buildProperty(property) {
    const name = getName(property);

    if (isNullOrWhitespace(name)) {
        let link = createProjectionLink.call(this, "name", getAttr(property, ATTR_NAME));
        let error = createSpan({
            class: ["error-message"]
        }, [`Property: `, link, ` is missing a value`]);

        this.__errors.push(error);
    }

    if (!(hasAttr(property, "target") && hasValue(property, "target"))) {
        this.__errors.push(`Property ${isNullOrWhitespace(name) ? "N/A" : `'${name}'`}: <<target>> is missing a value.`);
    }

    const target = getValue(property, "target", true);

    const type = target.getProperty(PROP_TYPE);

    if (isNullOrUndefined(type)) {
        this.__errors.push(`The property '${name}' target's type is missing a value.`);
    }

    var schema = {
        "name": getName(property),
        "type": type,
        "value": getValue(target, "value")
    };

    return {
        message: schema,
    };
}