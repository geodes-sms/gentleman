import { createSpan, createTextNode, isString, hasOwn, valOrDefault } from "zenkai";
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
    } else if (value.type === "attribute") {
        return AttributeHandler.call(this, value, contentConcept);
    } else if (value.type === "property") {
        return createSpan({
            class: ["text"],
            dataset: {
                ignore: "all",
            }
        }, contentConcept.getProperty("name"));
    } else if (value.type === "text") {
        return TextHandler(value, this.projection);
    }

    throw new TypeError("Bad argument: The type is not recognized");
}

function TextHandler(value, projection) {
    const { style, content } = value;

    const text = createSpan({
        class: ["text"],
        dataset: {
            ignore: "all",
        }
    });

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