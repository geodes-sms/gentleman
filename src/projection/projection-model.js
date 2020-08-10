import {
    isNode, isHTMLElement, isNullOrUndefined, hasOwn, valOrDefault, isEmpty, createI, isIterable, isString,
} from "zenkai";
import { deepCopy } from "@utils/index.js";
import { ProjectionFactory } from "./projection.js";


const models = [];

/**
 * Creates a projection model
 * @param {*} schema 
 * @param {*} environment 
 * @returns {ProjectionModel}
 */
export function createProjectionModel(schema, environment) {
    var model = Object.create(ProjectionModel, {
        schema: { value: schema },
        environment: { value: environment },
    });

    models.push(model);

    return model;
}


export const ProjectionModel = {
    /** @type {Projection[]} */
    projections: null,

    init() {
        this.projections = [];

        return this;
    },

    createProjection(concept, tag) {
        const schema = this.getModelProjection(concept, tag);

        var projection = ProjectionFactory.createProjection(this, schema, concept, this.environment);

        this.addProjection(projection);

        return projection;
    },
    /**
     * 
     * @param {string|number} id 
     */
    getProjection(id) {
        if (Number.isInteger(id)) {
            return this.projections[id];
        }

        return this.projections.find(p => p.id === id);
    },
    /**
     * Adds a projection to the list of projections held by the model
     * @param {Projection} projection
     */
    addProjection(projection) {
        if (isNullOrUndefined(projection)) {
            throw new TypeError("Bad request: The 'projection' argument must be a Projection");
        }

        this.projections.push(projection);

        return this;
    },
    removeProjection(id) {
        var index = this.projections.findIndex(p => p.id === id);

        if (index === -1) {
            return false;
        }

        this.projections.splice(index, 1);

        return true;
    },

    /**
     * Gets a value indicating whether this projection is defined in the model
     * @param {string} name 
     * @returns {boolean}
     */
    hasProjection(name) {
        return this.schema.findIndex(p => p.name === name) !== -1;
    },
    /**
     * Gets a value indicating whether this projection is defined in the model
     * @param {string} name 
     * @returns {boolean}
     */
    hasConceptProjection(concept, tag) {
        if (isNullOrUndefined(tag)) {
            return this.schema.findIndex(p => p.concept.name === concept.name && p.concept.accept === concept.accept) !== -1;
        }

        return this.schema.findIndex(p => p.concept.name === concept.name && p.concept.accept === concept.accept && p.tags.includes(tag)) !== -1;
    },
    getModelProjection(concept, tag) {
        var projection = null;

        if (isString(concept)) {
            projection = this.schema.filter(p => p.concept.name === concept);
        } else if (concept.name) {
            projection = this.schema.filter(p => p.concept.name === concept.name && p.concept.accept === concept.accept);
        }

        if (isIterable(tag)) {
            projection = projection.filter(p => p.tags && p.tags.includes(tag));
        }

        return projection;
    },
    getModelProjectionTemplate(concept, name, type, tag) {
        var projection = this.getModelProjection(concept, tag);

        if (!Array.isArray(projection)) {
            return [];
        }

        projection = projection.filter(p => p.type === "template" && p.template === type).find(p => p.name === name);

        return projection;
    },
    getModelProjectionLayout(concept, name, tag) {
        var projection = this.getModelProjection(concept, tag);

        if (!Array.isArray(projection)) {
            return [];
        }

        projection = projection.filter(p => p.type === "layout").find(p => p.name === name);

        return projection;
    },
    getModelProjectionField(concept, name, tag) {
        var projection = this.schema.filter(p => p.concept === concept)
            .filter(p => p.type === "field")
            .find(p => p.name === name);

        return projection;
    },
};



const getAttr = (concept, name) => concept.getAttributeByName(name).target;

const getName = (concept) => getAttr(concept, 'name').getValue().toLowerCase();


/**
 * Build projection schema
 * @param {*[]} projections 
 */
function buildProjection(projections) {
    if (!Array.isArray(projections)) {
        return [];
    }

    var projectionSchema = [];

    projections.filter(proto => proto.hasValue()).forEach(proto => {
        const projection = proto.getValue();

        /** @type {*[]} */
        const elements = getAttr(projection, "elements").getValue();
        /** @type {*[]} */
        const tags = getAttr(projection, "tags").getValue();

        var schema = {};

        if (projection.isAttributeCreated("readonly")) {
            schema.readonly = getAttr(projection, 'readonly').getValue();
        }
        if (projection.isAttributeCreated("visible")) {
            schema.visible = getAttr(projection, 'visible').getValue();
        }

        schema.layout = buildLayout(projection, elements);

        projectionSchema.push(schema);
    });

    return projectionSchema;
}

function buildLayout(layout, elements) {
    var schema = {};
    var disposition = [];

    if (layout.name === "stack_projection") {
        schema.type = "stack";
        schema.orientation = getAttr(layout, 'orientation').getValue();

        elements.filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    }
    else if (layout.name === "wrap_projection") {
        schema.type = "wrap";
        elements.filter(proto => proto.hasValue()).forEach(proto => {
            const element = proto.getValue();
            disposition.push(buildElement(element));
        });
    }
    else if (layout.name === "table_projection") {
        // TODO
    }

    schema.disposition = disposition;

    return schema;
}

function buildElement(element) {
    if (element.name === "text_element") {
        return getAttr(element, "value").getValue();
    }
    else if (element.name === "attribute_element") {
        let attr = getAttr(element, 'value').getValue();

        return `#${getName(attr)}:attribute`;
    }
    else if (element.name === "component_element") {
        let comp = getAttr(element, 'value').getValue();

        return `#${getName(comp)}:component`;
    }

    return null;
}

function buildField(field) {
    var schema = {
        type: "field"
    };

    if (field.isAttributeCreated("readonly")) {
        schema.readonly = getAttr(field, 'readonly').getValue();
    }

    if (field.isAttributeCreated("disabled")) {
        schema.disabled = getAttr(field, 'disabled').getValue();
    }

    if (field.isAttributeCreated("visible")) {
        schema.visible = getAttr(field, 'visible').getValue();
    }

    if (field.name === "text_field") {
        if (field.isAttributeCreated("placeholder")) {
            schema.placeholder = getAttr(field, 'placeholder').getValue();
        }
        schema.type = "text";
    }
    else if (field.name === "check_field") {
        if (field.isAttributeCreated("label")) {
            schema.label = getAttr(field, 'label').getValue();
        }
        schema.type = "binary";
    }
    else if (field.name === "choice_field") {
        schema.type = "choice";
    }
    else if (field.name === "link_field") {
        if (field.isAttributeCreated("placeholder")) {
            schema.placeholder = getAttr(field, 'placeholder').getValue();
        }
        if (field.isAttributeCreated("value")) {
            schema.value = getAttr(field, 'value').getValue();
        }
        if (field.isAttributeCreated("choice")) {
            schema.choice = getAttr(field, 'choice').getValue();
        }
        schema.type = "link";
    }
    else if (field.name === "list_field") {
        if (field.isAttributeCreated("orientation")) {
            schema.orientation = getAttr(field, 'orientation').getValue();
        }
        schema.type = "list";
    }

    return schema;
}
