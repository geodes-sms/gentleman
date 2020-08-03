import { createI, hasOwn, cloneObject, valOrDefault } from "zenkai";
import { ProjectionManager } from "./projection.js";
import { contentHandler } from "./content-handler.js";


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
export function AttributeHandler(schema, concept) {
    const { name, optional, tag } = schema;

    if (!concept.hasAttribute(name)) {
        throw new Error(`Attribute '${name}' does not exist in the concept '${concept.name}'`);
    }

    let attr = {
        name: name,
        required: true,
        optional: null,
        element: null,
    };

    this.attributes.push(attr);

    var render = null;

    if (!(concept.isAttributeRequired(name) || concept.isAttributeCreated(name))) {
        const { alias, description } = concept.getAttributeSchema(name);

        if (optional) {
            render = contentHandler.call(this, optional);
        } else {
            render = createI({
                class: ["projection-element", "projection-element--optional"],
                dataset: {
                    object: "attribute",
                    id: name
                },
            }, `Add ${valOrDefault(alias, name)}`);
        }

        render.addEventListener('click', (event) => {
            concept.createAttribute(name);
        });

        attr.required = false;
        attr.optional = render;
    } else {
        let { target, description } = concept.getAttributeByName(name);
        let { projection: schemaProjection } = cloneObject(target.schema);

        if (tag) {
            schemaProjection = schemaProjection.filter(p => p.tags.includes(tag));
            console.log(schemaProjection);
        }

        schemaProjection.forEach(schema => {
            if (!hasOwn(schema, 'readonly')) {
                schema['readonly'] = this.isReadOnly();
            }
        });

        var projection = ProjectionManager.createProjection(schemaProjection, target, this.editor).init();
        projection.parent = this;

        render = projection.render();
        attr.element = render;
    }

    return render;
}

/**
 * Resolve and render component projection
 * @param {string} name 
 */
export function ComponentHandler(schema, concept) {
    const { name, optional } = schema;

    if (!concept.hasComponent(name)) {
        throw new Error(`Component '${name}' does not exist in the concept '${concept.name}'`);
    }

    let comp = {
        name: name,
        required: true,
        optional: null,
        element: null,
    };

    this.components.push(comp);

    var render = null;

    if (!(concept.isComponentCreated(name) || concept.isComponentRequired(name))) {
        const { alias, description } = concept.getComponentSchema(name);

        if (optional) {
            render = contentHandler.call(this, optional);
        } else {
            render = createI({
                class: ["projection-element", "projection-element--optional"],
                dataset: {
                    object: "component",
                    id: name
                },
            }, `Add ${valOrDefault(alias, name)}`);
        }

        render.addEventListener('click', (event) => {
            concept.createComponent(name);
        });

        comp.required = false;
        comp.optional = render;
    } else {
        let component = concept.getComponentByName(name);
        let projection = ProjectionManager.createProjection(component.schema.projection, component, this.editor).init();

        projection.parent = this;

        render = projection.render();
        comp.element = render;
    }

    return render;
}