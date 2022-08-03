import { isNullOrUndefined, isEmpty, isIterable, isString, valOrDefault } from "zenkai";
import { deepCopy, NotificationType } from "@utils/index.js";
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
export function createProjectionModel($schema, environment) {
    let schema = {
        projection: [],
        template: [],
        style: [],
    };

    const model = Object.create(ProjectionModel, {
        schema: { value: valOrDefault($schema, schema), writable: true },
        editor: { value: environment },
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
    /**  @type {Map}*/
    algos: null,

    init(views) {
        this.projections = [];

        this.fields = new Map();
        this.statics = new Map();
        this.layouts = new Map();
        this.algos = new Map();

        return this;
    },
    addSchema(schema) {
        if (Array.isArray(schema.projection)) {
            this.schema.projection.push(...schema.projection);
        }
        if (Array.isArray(schema.template)) {
            this.schema.template.push(...schema.template);
        }
        if (Array.isArray(schema.style)) {
            this.schema.style.push(...schema.style);
        }

        this.environment.update("projection-model.updated");

        return true;
    },
    setSchema(schema) {
        this.schema = [...schema, ...PREDEFINED_PROJECTIONS];

        this.environment.update("projection-model.updated");

        return this;
    },
    done() {
        // TODO check if has model changes

        while (!isEmpty(this.projections)) {
            this.projections[0].delete();
        }

        this.projections = [];
        this.fields.clear();
        this.layouts.clear();
        this.statics.clear();

        return this;
    },

    createProjection(concept, tag) {
        const schema = this.getProjectionSchema(concept, tag);

        if (isEmpty(schema)) {
            this.environment.notify(`Missing projection (#${tag}) for ${concept.name}`, NotificationType.WARNING);
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
        field.editor = this.environment;
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
        staticElement.editor = this.environment;
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
        layout.editor = this.environment;
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

    registerAlgorithm(algo) {
        algo.environment = this.environment;
        this.algos.set(algo.id, algo);

        return this;
    },

    unregisterAlgorithm(algo) {
        var _algo = this.algos.get(algo.id);

        if (_algo) {
            _algo.environment = null;
            this.algos.delete(_algo.id);
        }

        return this;
    },

    getAlgo(id) {
        return this.algos.get(id);
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
        const hasName = (name) => name && (name === concept.name || concept.schema && name === concept.schema.base); // TODO: change to look for base (include self)

        const hasTag = (p) => Array.isArray(p.tags) && p.tags.includes(tag);

        const hasPrototype = (prototype) => {
            if (isNullOrUndefined(prototype) || concept.nature === "prototype") {
                return false;
            }

            return concept.hasPrototype(prototype);
        };

        let candidates = null;

        if (isString(concept)) {
            candidates = this.schema.projection.filter(p => p.concept.name === concept);
        } else {
            candidates = this.schema.projection.filter(p => hasName(p.concept.name) || hasPrototype(p.concept.prototype));
        }

        if (isIterable(tag) && !isEmpty(tag)) {
            return candidates.findIndex(p => hasTag(p)) !== -1;
        }

        return !isEmpty(candidates);
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

        if (isString(concept)) {
            projection = this.schema.projection.filter(p => p.concept.name === concept);
        } else {
            projection = this.schema.projection.filter(p => hasName(p.concept.name) || hasPrototype(p.concept.prototype));
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
        let schema = this.schema.template.find(p => p.name === name);

        if (isNullOrUndefined(schema)) {
            return null;
        }

        return deepCopy(schema);
    },
    /**
     * Gets a template schema
     * @param {string} name 
     * @returns 
     */
    getGFragmentSchema(name) {
        let schema = this.schema.find(p => p.type === "g-fragment" && p.name === name);

        if (isNullOrUndefined(schema)) {
            return null;
        }

        return deepCopy(schema);
    },
    /**
     * Gets a rule schema
     * @param {string} name 
     * @returns 
     */
    getRuleSchema(name) {
        let schema = this.schema.find(p => p.type === "rule" && p.name === name);

        if (isNullOrUndefined(schema)) {
            return null;
        }

        return deepCopy(schema);
    },
    /**
     * Gets a style schema
     * @param {string} name 
     * @returns 
     */
    getStyleSchema(name) {
        let schema = this.schema.style.find(p => p.name === name);

        if (isNullOrUndefined(schema)) {
            return null;
        }

        return deepCopy(schema);
    },

    /**
     * Verifies the projection matching a concept and optionnally a tag
     * @param {*} concept 
     * @param {string} tag 
     * @returns {boolean}
     */
    hasProjectionSchema(concept, tag) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Bad parameter: concept");
        }

        let projection = [];

        const hasName = (name) => name && (name === concept.name || concept.schema && name === concept.schema.base); // TODO: change to look for base (include self)
        // const hasPrototype = (prototype) => !!(prototype && concept.hasPrototype(prototype));
        const hasPrototype = (prototype) => {
            if (isNullOrUndefined(prototype) || concept.nature === "prototype") {
                return false;
            }

            return concept.hasPrototype && concept.hasPrototype(prototype);
        };

        if (isString(concept)) {
            projection = this.schema.projection.filter(p => p.concept.name === concept);
        } else {
            projection = this.schema.projection.filter(p => hasName(p.concept.name) || hasPrototype(p.concept.prototype));
        }

        if (isIterable(tag) && !isEmpty(tag)) {
            return projection.some(p => p.tags && p.tags.includes(tag));
        }

        return !isEmpty(projection);
    },

    export() {
        const views = [];

        this.getProjections().forEach(projection => {
            views.push(projection.export());
        });

        return views;
    },
};
