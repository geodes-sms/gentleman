import { Attribute } from "./attribute.js";
import { isNullOrUndefined } from "zenkai";

export const AttributeFactory = {
    createAttribute(concept, name, schema) {
        var attribute = Attribute.create(concept, schema);
        if (isNullOrUndefined(attribute)) {
            // error handler
            console.error(`The '${concept.name}' concept's '${name}' attribute could not be created`);
            
            return null;
        }
        attribute.name = name;

        return attribute;
    }
};