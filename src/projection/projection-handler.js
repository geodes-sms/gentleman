import { isNullOrUndefined, valOrDefault } from "zenkai";
import { Projection } from "./projection.js";

export const ProjectionHandler = {
    /** @type {TextualProjection} */
    projection: null,
    projectionIndex: 0,
    projectionSchema: null,
    initProjection(schema) {
        this.projectionSchema = Array.isArray(schema) ? schema[0] : schema;
    },
    /**
     * Returns a value indicating whether the concept has more than one projection
     * @returns {boolean}
     */
    hasManyProjection() { return Array.isArray(this.schema.projection) && this.schema.projection.length > 1; },
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