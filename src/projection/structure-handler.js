import { createI, hasOwn, cloneObject, valOrDefault } from "zenkai";
import { ProjectionManager } from "./projection.js";


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
function attributeHandler(name) {
    if (!this.concept.hasAttribute(name)) {
        throw new Error(`Attribute '${name}' does not exist in the concept '${this.concept.name}'`);
    }

    this.attributes.push(name);

    if (!(this.concept.isAttributeRequired(name) || this.concept.isAttributeCreated(name))) {
        const schema = this.concept.schema.attribute[name];

        /** @type {HTMLElement} */
        let option = createI({
            class: ["projection-element", "projection-element--optional"],
            dataset: {
                object: "attribute",
                id: name
            },
        }, `Add ${valOrDefault(schema.alias, name)}`);

        option.addEventListener('click', (event) => {
            const { id } = event.target.dataset;
            this.concept.createAttribute(id);
        });

        return option;
    }

    var { target, description } = this.concept.getAttributeByName(name);
    var { projection: schemaProjection } = cloneObject(target.schema);

    schemaProjection.forEach(schema => {
        if (!hasOwn(schema, 'readonly')) {
            schema['readonly'] = this.isReadOnly();
        }
    });

    var projection = ProjectionManager.createProjection(schemaProjection, target, this.editor).init();

    projection.parent = this;

    return projection.render();
}

/**
 * Resolve and render component projection
 * @param {string} name 
 */
function componentHandler(name) {
    if (!this.concept.hasComponent(name)) {
        throw new Error(`Component '${name}' does not exist in the concept '${this.concept.name}'`);
    }

    this.components.push(name);

    if (!(this.concept.isComponentCreated(name) || this.concept.isComponentRequired(name))) {
        /** @type {HTMLElement} */
        let option = createI({
            class: ["projection-element", "projection-element--optional"],
            dataset: {
                object: "component",
                id: name
            },
        }, `Add ${name}`);
        option.addEventListener('click', (event) => {
            const { id } = event.target.dataset;
            this.concept.createComponent(id);
        });
    }

    var component = this.concept.getComponentByName(name);
    var projection = ProjectionManager.createProjection(component.schema.projection, component, this.editor).init();
    projection.parent = this;

    return projection.render();
}

export const StructureHandler = {
    'attribute': attributeHandler,
    'component': componentHandler
};