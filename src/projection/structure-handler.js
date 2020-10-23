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
        schema: schema,
        required: true,
        optional: null,
        element: null,
    };

    this.projection.attributes.push(attr);

    var render = null;

    if (!(concept.isAttributeRequired(name) || concept.isAttributeCreated(name))) {
        const { alias, description } = concept.getAttributeSchema(name);

        if (optional) {
            render = ContentHandler.call(this, optional, concept);
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

        var projection = this.projection.model.createProjection(target, tag).init();

        projection.parent = this.projection;

        render = projection.render();
        attr.element = render;
    }

    return render;
}
