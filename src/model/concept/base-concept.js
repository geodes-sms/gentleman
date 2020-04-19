import { isNullOrUndefined } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./concept.js";


export const BaseConcept = extend(Concept, {
    initValue(value) {
        if (isNullOrUndefined(value)) {
            return false;
        }

        for (const key in value) {
            const element = value[key];
            const [type, name] = key.split(".");
            switch (type) {
                case "attribute":
                    this.createAttribute(name, element);
                    break;
                case "component":
                    this.createComponent(name, element);
                    break;
                default:
                    break;
            }
        }

        return true;
    }
});