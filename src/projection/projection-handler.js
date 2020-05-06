import { isNullOrUndefined, valOrDefault } from "zenkai";
import { Projection } from "./projection.js";


export const ProjectionHandler = {
    /** @type {Projection[]} */
    projections: null,
    /** @type {Projection[]} */
    _projections: null,
    /** @type {TextualProjection} */
    projection: null,
    projectionIndex: 0,
    projectionSchema: null,
    initProjection(schema) {
        this.projections = [];
        this._projections = [];
        this.projectionSchema = Array.isArray(schema) ? schema[0] : schema;
    },
    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];

        return this.projection.render();
    },
    render() {
        if (isNullOrUndefined(this.projection)) {
            this.projection = Projection.create(this.projectionSchema, this, this.model.editor);
        }

        return this.projection.render();
    },
};