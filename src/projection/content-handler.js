import { createSpan, createTextNode, isString, hasOwn, valOrDefault, createButton } from "zenkai";
import { StyleHandler } from './style-handler.js';
import { AttributeHandler } from './structure-handler.js';
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";


export function ContentHandler(value, concept, args) {

    const contentConcept = valOrDefault(concept, this.projection.concept);
    if (value.type === "layout") {
        let layout = LayoutFactory.createLayout(this.model, value.layout, this.projection).init(args);
        layout.parent = this;

        return layout.render();
    } else if (value.type === "field") {
        let field = FieldFactory.createField(this.model, value, concept).init(args);
        field.model = this.model;

        return field.render();
    } else if (value.type === "static") {
        let field = FieldFactory.createField(this.model, value, concept).init(args);
        field.model = this.model;

        return field.render();
    } else if (value.type === "attribute") {
        return AttributeHandler.call(this, value, contentConcept);
    } else if (value.type === "property") {
        return PropertyHandler.call(this, value, contentConcept);
    } else if (value.type === "text") {
        return TextHandler(value, this.projection);
    } else if (value.type === "projection") {
        /** @type {HTMLElement} */
        const element = createButton({
            class: ["text"],
            dataset: {
                property: name,
                ignore: "all",
            }
        }, ContentHandler.call(this, value.content, concept, args));

        element.addEventListener('click', () => {
            this.projection.changeView();
        });

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