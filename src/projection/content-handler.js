import {
    createSpan, createTextNode, isString, hasOwn, valOrDefault,
} from "zenkai";
import { StyleHandler } from './style-handler.js';
import { AttributeHandler, ComponentHandler } from './structure-handler.js';
import { LayoutFactory } from "./layout/index.js";

export function contentHandler(value, concept) {
    if (value.type === "layout") {
        let layout = LayoutFactory.createLayout(value.layout, this.projection).init();
        layout.parent = this;

        return layout.render();
    } else if (value.type === "field") {
        return;
    } else if (value.type === "attribute") {
        return AttributeHandler.call(this.projection, value, valOrDefault(concept, this.projection.concept));
    } else if (value.type === "component") {
        return ComponentHandler.call(this.projection, value, valOrDefault(concept, this.projection.concept));
    } else if (value.type === "text") {
        return TextHandler(value, this.projection);
    }

    throw new TypeError("Bad argument: The type is not recognized");
}

function TextHandler(value, projection) {
    const { style, content } = value;

    const text = createSpan({
        class: ["text"]
    });

    if (isString(content)) {
        text.appendChild(createTextNode(content));
    }
    else if (Array.isArray(content)) {
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