import { isNullOrUndefined, valOrDefault } from "zenkai";
import { Projection } from "./projection.js";


export const ProjectionHandler = {
    /** @type {Projection[]} */
    projections: null,
    /** @type {TextualProjection} */
    projection: null,
    projectionIndex: 0,
    projectionSchema: null,
    initProjection(schema) {
        this.projections = [];
        this.projectionSchema = Array.isArray(schema) ? schema[0] : schema;
    },
    updateProjection() {
        console.log(this.name, this.projections);
        // let temp = getElement(`[data-id=${structure.name}]`, this.concept.projection.container);
        // if (!isHTMLElement(temp)) {
        //     this.editor.notify("This attribute cannot be rendered");
        // }

        // temp.replaceWith(structure.render());
        // temp.remove();  
    },
    changeProjection() {
        this.projectionIndex++;
        var nextIndex = this.projectionIndex % this.schema.projection.length;
        this.projection.schema = this.schema.projection[nextIndex];

        return this.projection.render();
    }
};