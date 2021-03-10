import { isNullOrUndefined, isEmpty, isIterable, isString } from "zenkai";
import { ProjectionFactory } from "./projection.js";


const PREDEFINED_PROJECTIONS = [
    {
        "concept": { "name": "set" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "list"
        }
    },
    {
        "concept": { "name": "boolean" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "binary"
        }
    },
    {
        "concept": { "name": "string" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "text"
        }
    },
    {
        "concept": { "name": "number" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "text",
            "input": {
                "type": "number"
            }
        }
    },
    {
        "concept": { "name": "reference" },
        "type": "field",
        "tags": [],
        "content": {
            "type": "choice"
        }
    }
];

/**
 * Creates a projection model
 * @param {*} schema 
 * @param {*} environment 
 * @returns {ProjectionModel}
 */
export function createProjectionModel(schema, environment) {
    const model = Object.create(ProjectionModel, {
        schema: { value: [...schema, ...PREDEFINED_PROJECTIONS] },
        environment: { value: environment },
    });

    return model;
}

export const ProjectionModel = {
    /** @type {Projection[]} */
    projections: null,
    /** @type {Map} */
    fields: null,
    /** @type {Map} */
    statics: null,
    /** @type {Map} */
    layouts: null,

    init(views) {
        this.projections = [];

        this.fields = new Map();
        this.statics = new Map();
        this.layouts = new Map();

        return this;
    },
    done() {
        // TODO check if has model changes

        this.projections.forEach(projection => {
        });

        this.projections = [];
        this.fields.clear();
        this.layouts.clear();
        this.statics.clear();

        return this;
    },

    createProjection(concept, tag) {
        const schema = this.getProjectionSchema(concept, tag);

        if (isEmpty(schema)) {
            console.warn(concept, schema, tag);
        }

        const projection = ProjectionFactory.createProjection(this, schema, concept, this.environment);
        projection.tag = tag;

        this.addProjection(projection);

        return projection;
    },
    getProjections() {
        return this.projections.slice();
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
     * Get a the related field object
     * @param {HTMLElement} element 
     * @returns {Field}
     */
    registerField(field) {
        field.environment = this.environment;
        this.fields.set(field.id, field);

        return this;
    },
    unregisterField(field) {
        var _field = this.fields.get(field.id);

        if (_field) {
            _field.environment = null;
            this.fields.delete(_field.id);
        }

        return this;
    },
    /**
     * Get a the related field object
     * @param {string|number} id 
     * @returns {Field}
     */
    getField(id) {
        return this.fields.get(id);
    },

    registerStatic(staticElement) {
        staticElement.environment = this.environment;
        this.statics.set(staticElement.id, staticElement);

        return this;
    },
    unregisterStatic(staticElement) {
        var _static = this.statics.get(staticElement.id);

        if (_static) {
            _static.environment = null;
            this.statics.delete(_static.id);
        }

        return this;
    },
    /**
     * Get a the related static object
     * @param {string|number} id 
     * @returns {Static}
     */
    getStatic(id) {
        return this.statics.get(id);
    },

    registerLayout(layout) {
        layout.environment = this.environment;
        this.layouts.set(layout.id, layout);

        return this;
    },
    /**
     * Removes a layout the cache
     * @param {Layout} layout 
     * @returns {Static}
     */
    unregisterLayout(layout) {
        var _layout = this.layouts.get(layout.id);

        if (_layout) {
            _layout.environment = null;
            this.layouts.delete(_layout.id);
        }

        return this;
    },
    /**
     * Get a the related layout object
     * @param {string|number} id 
     * @returns {Layout}
     */
    getLayout(id) {
        return this.layouts.get(id);
    },

    /**
     * Get the metadata of a projection
     * @param {string} projectionId 
     * @returns {string} Metadata
     */
    getMetadata(projectionId) {
        let target = this.schema.find(p => p.id === projectionId);

        if (target) {
            return target.metadata;
        }

        return null;
    },

    /**
     * Gets a value indicating whether this projection is defined in the model
     * @param {string|*} concept 
     * @param {string} tag 
     * @returns {boolean}
     */
    hasConceptProjection(concept, tag) {
        const hasConcept = (projection) => projection.concept.name === concept.name;

        const hasTag = (p) => Array.isArray(p.tags) && p.tags.includes(tag);

        if (isNullOrUndefined(tag)) {
            return this.schema.findIndex(p => hasConcept(p)) !== -1;
        }

        return this.schema.findIndex(p => hasConcept(p) && hasTag(p)) !== -1;
    },

    getSchema() {
        return this.schema;
    },
    /**
     * Gets the projection matching a concept and optionnally a tag
     * @param {*} concept 
     * @param {string} tag 
     */
    getProjectionSchema(concept, tag) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Bad parameter: concept");
        }

        var projection = null;

        const hasName = (name) => name && (name === concept.name || concept.schema && name === concept.schema.base); // TODO: change to look for base (include self)
        // const hasPrototype = (prototype) => !!(prototype && concept.hasPrototype(prototype));
        const hasPrototype = (prototype) => {
            if (isNullOrUndefined(prototype) || concept.nature === "prototype") {
                return false;
            }

            return concept.hasPrototype(prototype);
        };
        const isValid = (type) => !["template", "rule", "style"].includes(type);

        if (isString(concept)) {
            projection = this.schema.filter(p => isValid(p.type) && p.concept.name === concept);
        } else {
            projection = this.schema.filter(p => isValid(p.type) && (hasName(p.concept.name) || hasPrototype(p.concept.prototype)));
        }

        if (isIterable(tag) && !isEmpty(tag)) {
            return projection.filter(p => p.tags && p.tags.includes(tag));
        }

        return projection;
    },
    /**
     * Gets a template schema
     * @param {string} name 
     * @returns 
     */
    getTemplateSchema(name) {
        return this.schema.find(p => p.type === "template" && p.name === name);
    },
    /**
     * Gets a rule schema
     * @param {string} name 
     * @returns 
     */
    getRuleSchema(name) {
        return this.schema.find(p => p.type === "rule" && p.name === name);
    },
    /**
     * Gets a style schema
     * @param {string} name 
     * @returns 
     */
    getStyleSchema(name) {
        return this.schema.find(p => p.type === "style" && p.name === name);
    },

    export() {
        const views = [];

        this.getProjections().forEach(projection => {
            views.push(projection.export());
        });

        return views;
    },
};
