import { Attribute } from "./attribute.js";

export const AttributeFactory = {
    createAttribute(concept, schema) {
        return Attribute.create(concept, schema);
    }
};