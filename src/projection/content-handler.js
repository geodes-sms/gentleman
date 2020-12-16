import { createSpan, createTextNode, isString, hasOwn, valOrDefault, createButton } from "zenkai";
import { StyleHandler } from './style-handler.js';
import { AttributeHandler } from './structure-handler.js';
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";
import { StaticFactory } from "./static/index.js";


export function ContentHandler(schema, concept, args) {

    const contentConcept = valOrDefault(concept, this.projection.concept);

    if (schema.type === "layout") {
        let layout = LayoutFactory.createLayout(this.model, schema.layout, this.projection).init(args);
        layout.parent = this;

        return layout.render();
    } else if (schema.type === "field") {
        let field = FieldFactory.createField(this.model, schema, concept).init(args);
        field.model = this.model;

        return field.render();
    } else if (schema.type === "static") {
        let staticContent = StaticFactory.createStatic(this.model, schema.static, this.projection).init(args);
        staticContent.parent = this;

        return staticContent.render();
    } else if (schema.type === "attribute") {
        return AttributeHandler.call(this, schema, contentConcept);
    } else if (schema.type === "property") {
        return PropertyHandler.call(this, schema, contentConcept);
    } else if (schema.type === "text") {
        return TextHandler(schema, this.projection);
    } else if (schema.type === "projection") {
        const { tag, style } = schema;

        /** @type {number} */
        const index = this.projection.schema.findIndex((x) => x.tags.includes(tag));

        /** @type {HTMLElement} */
        const element = createButton({
            class: ["btn"],
        }, ContentHandler.call(this, schema.content, concept, args));

        element.addEventListener('click', () => {
            this.projection.changeView(index);
        });

        StyleHandler(element, style);

        return element;
    }

    throw new TypeError("Bad argument: The type is not recognized");
}

/**
 * Renders a property value
 * @param {*} value 
 * @param {*} concept 
 * @returns {HTMLElement}
 */
function PropertyHandler(value, concept) {
    const { help, style, name } = value;

    const propValue = concept.getProperty(name);

    const element = createSpan({
        class: ["text"],
        dataset: {
            property: name,
            ignore: "all",
        }
    }, propValue);

    if (help) {
        element.title = help;
    }

    StyleHandler(element, style);

    return element;
}

/**
 * Renders a text
 * @param {*} value 
 * @param {*} projection 
 * @returns {HTMLElement}
 */
function TextHandler(value, projection) {
    const { help, style, content } = value;

    /** @type {HTMLElement} */
    const text = createSpan({
        class: ["text"],
        dataset: {
            ignore: "all",
        }
    });

    if (help) {
        text.title = help;
    }

    if (isString(content)) {
        text.appendChild(createTextNode(content));
    } else if (Array.isArray(content)) {
        for (let i = 0; i < content.length; i++) {
            const value = content[i];
            if (isString(value)) {
                text.appendChild(createTextNode(value));
            } else {
                text.appendChild(TextHandler(value, projection));
            }
        }
    } else if (hasOwn(content, "content")) {
        text.appendChild(TextHandler(content, projection));
    }

    StyleHandler(text, style);

    return text;
}