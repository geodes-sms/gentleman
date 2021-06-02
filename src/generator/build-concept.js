import { createSpan, isEmpty, isNullOrUndefined, isNullOrWhitespace, isObject, getElement, capitalizeFirstLetter, createEmphasis } from "zenkai";
import { NotificationType, LogType } from "@utils/index.js";


const PROP_NATURE = "nature";
const PROP_TYPE = "type";

const ATTR_ATTRIBUTES = "attributes";
const ATTR_ALIAS = "alias";
const ATTR_BASE = "base";
const ATTR_DESCRIPTION = "description";
const ATTR_NAME = "name";
const ATTR_REQUIRED = "required";
const ATTR_PROPERTIES = "properties";
const ATTR_PROTOTYPE = "prototype";

const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getReference = (concept, attr) => getAttr(concept, attr).getReference();

const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

const hasAttr = (concept, name) => concept.isAttributeCreated(name);

const getName = (concept) => getValue(concept, ATTR_NAME).toLowerCase();

const getDescription = (concept) => getValue(concept, ATTR_DESCRIPTION);

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


export function buildConceptHandler(_options = {}) {
    const result = [];

    const { conceptModel } = this;

    this.logs.clear();

    const options = Object.assign({
        name: "metamodel",
        download: true
    }, _options);

    const concepts = conceptModel.getConcepts(["prototype concept", "concrete concept", "derivative concept"]);

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
        this.download({
            concept: result
        }, options.name);
    }

    delete this.__errors;

    return result;
}

function buildConcept(concept) {
    const name = getName(concept);
    const description = getDescription(concept);
    const nature = concept.getProperty(PROP_NATURE);
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
        "description": description,
        "nature": nature,
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
    const description = getDescription(attribute);
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
        "required": required,
        "description": description,
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
    let name = target.getProperty("cname");

    if (name === "concept") {
        if (!hasValue(target, "concept")) {
            let link = createProjectionLink.call(this, "concept", getAttr(target, "concept"));
            let error = createSpan({
                class: ["error-message"]
            }, [`${capitalizeFirstLetter(target.getName())}: `, link, ` is missing a value`]);

            this.__errors.push(error);
        } else {
            let ref = getReference(target, "concept");
            name = getName(ref);
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


    if (hasAttr(target, "constraint")) {
        result["constraint"] = buildConstraint.call(this, getAttr(target, "constraint"));
    }

    return result;
}

function buildConstraint(constraint) {
    const result = {};

    if (hasAttr(constraint, "scope") && hasValue(constraint, "scope")) {
        result["scope"] = getName(getReference(constraint, 'scope'));
    }

    ["ordered", "pattern"].filter(prop => hasAttr(constraint, prop) && hasValue(constraint, prop))
        .forEach(prop => {
            result[prop] = getValue(constraint, prop);
        });

    ["length", "value", "cardinality"].filter(prop => hasAttr(constraint, prop) && hasValue(constraint, prop))
        .forEach(prop => {
            let numberConstraint = getValue(constraint, prop, true);

            let rules = {};

            if (numberConstraint.name === "number constraint value") {
                let fixed = {};

                if (hasValue(numberConstraint, "value")) {
                    fixed["value"] = getValue(numberConstraint, "value");
                }

                rules["type"] = "fixed";
                rules["fixed"] = fixed;
            } else if (numberConstraint.name === "number constraint range") {
                let range = {};

                let min = getAttr(numberConstraint, "min");
                if (hasValue(min, "value")) {
                    range["min"] = {
                        "value": getValue(min, "value")
                    };
                }

                let max = getAttr(numberConstraint, "max");
                if (hasValue(max, "value")) {
                    range["max"] = {
                        "value": getValue(max, "value")
                    };
                }

                rules["type"] = "range";
                rules["range"] = range;
            } else if (numberConstraint.name === "string pattern constraint") {
                let fixed = {};

                if (hasValue(numberConstraint, "value")) {
                    fixed["value"] = getValue(numberConstraint, "value");
                }

                if (hasValue(numberConstraint, "insensitive")) {
                    fixed["insensitive"] = getValue(numberConstraint, "insensitive");
                }

                if (hasValue(numberConstraint, "global")) {
                    fixed["global"] = getValue(numberConstraint, "global");
                }

                rules["type"] = "pattern";
                rules["pattern"] = fixed;
            } else if (numberConstraint.name === "string match constraint") {
                let range = {};

                let start = getAttr(numberConstraint, "start");
                if (hasValue(start, "value")) {
                    range["start"] = {
                        "value": getValue(start, "value")
                    };
                }

                let end = getAttr(numberConstraint, "end");
                if (hasValue(end, "value")) {
                    range["end"] = {
                        "value": getValue(end, "value")
                    };
                }

                rules["type"] = "match";
                rules["match"] = range;
            }

            result[prop] = rules;

        });

    if (hasAttr(constraint, "values") && hasValue(constraint, "values")) {
        result["values"] = getValue(constraint, "values", true);
    }

    return result;
}

/**
 * Build a concept property
 * @param {*} property 
 */
function buildProperty(property) {
    const name = getName(property);
    const description = getDescription(property);

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
        "value": getValue(target, "value"),
        "description": description,
    };

    return {
        message: schema,
    };
}