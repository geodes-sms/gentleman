import { createI, valOrDefault } from "zenkai";
import { ContentHandler } from "./content-handler.js";
import { StyleHandler } from "./style-handler.js";
import { StateHandler } from "./state-handler.js";


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
export function AttributeHandler(schema, concept) {
    const { name, tag, state, style } = schema;

    if (!concept.hasAttribute(name)) {
        throw new Error(`Attribute '${name}' does not exist in the concept '${concept.name}'`);
    }

    let attr = {
        name: name,
        schema: schema,
        required: concept.isAttributeRequired(name),
        created: concept.isAttributeCreated(name),
        placeholder: null,
        model: this.model,
        projection: this.projection,
        element: null,
    };

    this.projection.attributes.push(attr);

    let render = null;

    let stateResult = StateHandler.call(attr, schema, state);

    if (stateResult) {
        if (stateResult.content) {
            render = ContentHandler.call(this, stateResult.content, concept);
        } else {
            render = createI({
                class: ["projection-element", "projection-element--placeholder"],
                dataset: {
                    object: "attribute",
                    id: name
                },
            }, `Add ${name}`);
        }

        render.tabIndex = 0;

        render.addEventListener('click', (event) => {
            concept.createAttribute(name);
            let element = this.projection.resolveElement(attr.element);
            element.focus();
        });

        attr.placeholder = render;
    } else {
        const { target, description, schema } = concept.getAttributeByName(name);

        let projection = this.projection.model.createProjection(target, tag).init();

        projection.parent = this.projection;
        
        render = projection.render();
        
        StyleHandler.call(this, render, style);
        
        projection.element.parent = this;
        attr.element = render;
    }

    return render;
}
