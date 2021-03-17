import { createI } from "zenkai";
import { ContentHandler } from "./content-handler.js";
import { StyleHandler } from "./style-handler.js";
import { hide, show } from "@utils/index.js";


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
export function AttributeHandler(schema, concept) {
    const { name, merge = false, required = concept.isAttributeRequired(name), tag, placeholder = {}, style } = schema;

    if (!concept.hasAttribute(name)) {
        throw new Error(`Attribute '${name}' does not exist in the concept '${concept.name}'`);
    }

    if (required) {
        concept.createAttribute(name);
    }

    const attr = {
        name: name,
        get created() { return concept.isAttributeCreated(name); },
        schema: schema,
        placeholder: createI({
            class: ["projection-element"],
            hidden: true,
        }, name),
        parent: this,
        projection: this.projection,
        element: null,
    };

    this.projection.attributes.push(attr);

    if (!attr.created) {
        const { content } = placeholder;
        if (content) {
            attr.placeholder = ContentHandler.call(this, content, concept);
        } else {
            attr.placeholder = createI({
                class: ["projection-element", "projection-element--placeholder"],
                tabindex: 0,
                dataset: {
                    object: "attribute",
                    id: name
                },
            }, `Add ${name}`);
        }

        attr.placeholder.addEventListener('click', (event) => {
            concept.createAttribute(name);
            let element = this.projection.resolveElement(attr.element);
            element.focus();
        });

        return attr.placeholder;
    } else {
        const { target, description, schema } = concept.getAttributeByName(name);

        let projection = this.projection.model.createProjection(target, tag).init();

        projection.parent = this.projection;

        attr.element = projection.render();

        StyleHandler.call(this, attr.element, style);

        projection.element.parent = this;
    }

    return attr.element;
}
