import { createI, hasOwn, cloneObject, valOrDefault } from "zenkai";
import { ContentHandler } from "./content-handler.js";


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
            render = ContentHandler.call(this, optional);
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
        let { target, description, schema } = concept.getAttributeByName(name);

        var projection = this.model.createProjection(target, tag).init();

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
export function ComponentHandler(schema, concept, tag) {
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
            render = ContentHandler.call(this, optional);
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
        let projection = this.model.createProjection(component, tag).init();

        projection.parent = this;

        render = projection.render();
        comp.element = render;
    }

    return render;
}