import { createI, valOrDefault } from "zenkai";
import { ContentHandler } from "./content-handler.js";
import { StyleHandler } from "./style-handler.js";
import { StateHandler } from "./state-handler.js";


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
export function AttributeHandler(schema, concept) {
    const { name, optional, tag, state } = schema;

    if (!concept.hasAttribute(name)) {
        throw new Error(`Attribute '${name}' does not exist in the concept '${concept.name}'`);
    }

    let attr = {
        name: name,
        schema: schema,
        required: concept.isAttributeRequired(name),
        created: concept.isAttributeCreated(name),
        optional: null,
        element: null,
    };

    this.projection.attributes.push(attr);

    var render = null;

    let stateResult = StateHandler.call(attr, state);

    if (stateResult) {
        if (stateResult.content) {
            render = ContentHandler.call(this, stateResult.content, concept);
        } else {
            render = createI({
                class: ["projection-element", "projection-element--optional"],
                dataset: {
                    object: "attribute",
                    id: name
                },
            }, `Add ${name}`);
        }

        render.tabIndex = 0;

        render.addEventListener('click', (event) => {
            concept.createAttribute(name);
        });

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
