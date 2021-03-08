import { isEmpty, isNullOrUndefined, isNullOrWhitespace, valOrDefault } from "zenkai";
import { NotificationType } from "@utils/index.js";


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


export function buildConceptHandler(model) {
    const result = [];
    const buildErrors = [];

    const concepts = model.getConcepts(["prototype concept", "concrete concept", "derivative concept"]);

    if (isEmpty(concepts)) {
        this.notify("<strong>Empty model</strong>: There was no concept found to be built.", NotificationType.WARNING);

        return false;
    }

    concepts.forEach(concept => {
        const { success, errors, message } = buildConcept.call(model, concept);

        if (!success) {
            buildErrors.push(...errors);
        } else {
            if (result.find(c => c.name === message.name)) {
                buildErrors.push(`The model has two concepts with the same name: ${message.name}`);
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

    this.notify("<strong>Build succeeded</strong>: The concept model was successfully built", NotificationType.SUCCESS);
    console.log(result);

    return result;
}

function buildConcept(concept) {
    const buildErrors = [];

    const name = getName(concept);
    const description = getDescription(concept);
    const nature = concept.getBuildProperty(PROP_NATURE);
    const attributes = [];
    const properties = [];

    if (isNullOrWhitespace(name)) {
        buildErrors.push(`The ${nature} concept's <<name>> is missing a value.`);
    }

    if (concept.isAttributeCreated(ATTR_ATTRIBUTES)) {
        getValue(concept, ATTR_ATTRIBUTES).forEach(attribute => {
            const { success, errors, message } = buildAttribute.call(this, attribute);

            if (!success) {
                buildErrors.push(...errors);
            } else {
                if (attributes.find(attr => attr.name === message.name)) {
                    buildErrors.push(`The concept has two attributes with the same name: ${message.name}`);
                } else {
                    attributes.push(message);
                }
            }
        });
    }

    if (concept.isAttributeCreated(ATTR_PROPERTIES)) {
        getValue(concept, ATTR_PROPERTIES).forEach(property => {
            const { success, errors, message } = buildProperty.call(this, property);

            if (!success) {
                buildErrors.push(...errors);
            } else {
                if (properties.find(prop => prop.name === message.name)) {
                    buildErrors.push(`The concept has two properties with the same name: ${message.name}`);
                } else {
                    properties.push(message);
                }
            }
        });
    }

    if (!isEmpty(buildErrors)) {
        return {
            success: false,
            message: "Validation failed: The concept could not be built.",
            errors: buildErrors,
        };
    }

    let schema = {
        "id": concept.id,
        "name": name,
        "description": description,
        "nature": nature,
        "attributes": attributes,
        "properties": properties,
        "metadata": JSON.stringify(concept.export())
    };

    if (concept.isAttributeCreated(ATTR_PROTOTYPE) && hasValue(concept, ATTR_PROTOTYPE)) {
        schema.prototype = getName(getReference(concept, ATTR_PROTOTYPE));
    }

    if (concept.isAttributeCreated(ATTR_BASE) && hasValue(concept, ATTR_BASE)) {
        schema.base = buildTarget.call(this, getValue(concept, ATTR_BASE));
    }

    return {
        success: true,
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

    const errors = [];

    if (isNullOrWhitespace(name)) {
        errors.push("The attribute's <<name>> is missing a value.");
    }

    if (!(hasAttr(attribute, "target") && hasValue(attribute, "target"))) {
        errors.push(`Attribute ${isNullOrWhitespace(name) ? "N/A" : `'${name}'`}: <<target>> is missing a value.`);
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The attribute could not be built.",
            errors: errors,
        };
    }

    const schema = {
        "name": name,
        "target": buildTarget.call(this, getValue(attribute, "target")),
        "required": required,
        "description": description,
    };

    return {
        success: true,
        message: schema,
    };
}

/**
 * Build a target concept
 * @param {*} attribute
 */
function buildTarget(target) {
    let name = target.getBuildProperty("name");

    if (name === "concept") {
        name = getName(getReference(target, 'concept'));
    }

    const result = {
        "name": name
    };

    if (target.isAttributeCreated("accept")) {
        let accept = getValue(target, "accept");

        result["accept"] = buildTarget.call(this, accept);
    }

    ["default", "ordered", "pattern"].filter(prop => hasAttr(target, prop) && hasValue(target, prop))
        .forEach(prop => {
            result[prop] = getValue(target, prop);
        });

    ["length", "value", "cardinality"].filter(prop => hasAttr(target, prop) && hasValue(target, prop))
        .forEach(prop => {
            let constraint = getValue(target, prop);

            let rules = {};

            if (constraint.name === "number constraint value") {
                if (hasValue(constraint, "value")) {
                    rules["value"] = getValue(constraint, "value");
                }
            } else if (constraint.name === "number constraint range") {
                let min = getAttr(constraint, "min");
                if (hasValue(min, "value")) {
                    rules["min"] = {
                        "value": getValue(min, "value"),
                        "included": getValue(min, "included"),
                    };
                }

                let max = getAttr(constraint, "max");
                if (hasValue(max, "value")) {
                    rules["max"] = {
                        "value": getValue(max, "value"),
                        "included": getValue(max, "included"),
                    };
                }
            }

            result[prop] = rules;

        });

    if (hasAttr(target, "values") && hasValue(target, "values")) {
        result["values"] = getValue(target, "values", true);
    }

    return result;
}

/**
 * Build a concept property
 * @param {*} property 
 */
function buildProperty(property) {
    const errors = [];

    const name = getName(property);
    const description = getDescription(property);

    if (isNullOrWhitespace(name)) {
        errors.push("The property's 'name' is missing a value.");
    }

    if (!(hasAttr(property, "target") && hasValue(property, "target"))) {
        errors.push(`Property ${isNullOrWhitespace(name) ? "N/A" : `'${name}'`}: <<target>> is missing a value.`);
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The property could not be built.",
            errors: errors,
        };
    }

    const target = getValue(property, "target");

    const type = target.getProperty(PROP_TYPE);

    if (isNullOrUndefined(type)) {
        errors.push(`The property '${name}' target's type is missing a value.`);
    }

    if (!isEmpty(errors)) {
        return {
            success: false,
            message: "Validation failed: The property could not be built.",
            errors: errors,
        };
    }

    var schema = {
        "name": getName(property),
        "type": type,
        "value": getValue(target, "value"),
        "description": description,
    };

    return {
        success: true,
        message: schema,
    };
}