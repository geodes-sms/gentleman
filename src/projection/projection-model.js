import {
    isNullOrUndefined, hasOwn, valOrDefault, isEmpty,  isIterable, isString
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
    const model = Object.create(ProjectionModel, {
        schema: { value: schema },
        environment: { value: environment },
    });

    models.push(model);

    return model;
}

export const ProjectionModel = {
    /** @type {Projection[]} */
    projections: null,

    init(views) {
        this.projections = [];

        return this;
    },

    createProjection(concept, tag) {
        const schema = this.getModelProjection(concept, tag);
        if (isEmpty(schema)) {
            console.warn(concept, schema, tag);
        }

        // console.warn(concept.name, tag);
        // console.log(schema);

        const projection = ProjectionFactory.createProjection(this, schema, concept, this.environment);

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
     * @param {string} name 
     * @returns {boolean}
     */
    hasProjection(name) {
        return this.schema.findIndex(p => p.name === name) !== -1;
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
    /**
     * Gets a value indicating whether this projection is defined in the model
     * @param {string|*} concept 
     * @param {string} tag 
     * @returns {boolean}
     */
    hasGlobalProjection(concept) {
        const hasConcept = (projection) => projection.concept.name === concept.name;

        return this.schema.findIndex(p => p.type !== "template" && hasConcept(p) && p.global) !== -1;
    },
    /**
     * Gets the projection matching a concept and optionnally a tag
     * @param {*} concept 
     * @param {string} tag 
     */
    getModelProjection(concept, tag) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Bad parameter: concept");
        }

        var projection = null;

        const hasName = (name) => name && (name === concept.name || name === concept.schema.base); // TODO: change to look for base (include self)
        // const hasPrototype = (prototype) => !!(prototype && concept.hasPrototype(prototype));
        const hasPrototype = (prototype) => {
            if (isNullOrUndefined(prototype) || concept.nature === "prototype") {
                return false;
            }

            return concept.hasPrototype(prototype);
        };

        if (isString(concept)) {
            projection = this.schema.filter(p => p.type !== "template" && p.concept.name === concept);
        } else {
            projection = this.schema.filter(p => p.type !== "template" && (hasName(p.concept.name) || hasPrototype(p.concept.prototype)));
        }

        if (isIterable(tag) && !isEmpty(tag)) {
            return projection.filter(p => p.tags && p.tags.includes(tag));
        }

        return projection;
    },
    getModelTemplate(name, tag) {
        return this.schema.find(p => p.type === "template" && p.name === name);
    },
    getGlobalModelProjection(concept) {
        var projection = null;

        if (isString(concept)) {
            projection = this.schema.filter(p => p.type !== "template" && p.concept.name === concept);
        } else if (concept.name) {
            projection = this.schema.filter(p => p.type !== "template" && p.concept.name === concept.name);
        }

        return projection.filter(p => p.global);
    },
    getModelProjectionTemplate(concept, type, tag) {
        var projection = this.getModelProjection(concept, tag);

        if (!Array.isArray(projection)) {
            return [];
        }

        projection = projection.filter(p => p.type === "template" && p.template === type);

        return projection[0];
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

    export() {
        const views = [];

        this.getProjections().forEach(projection => {
            views.push(projection.export());
        });

        return views;
    },
};
