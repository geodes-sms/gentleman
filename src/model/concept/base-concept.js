import { isNullOrUndefined } from "zenkai";
import { Concept } from "./concept.js";


const ResponseCode = {
    SUCCESS: 200,
    INVALID_VALUE: 401
};

function responseHandler(code) {
    switch (code) {
        case ResponseCode.INVALID_VALUE:
            return {
                success: false,
                message: "The value is not included in the list of valid values."
            };
    }
}

const _BaseConcept  = {
    initValue(args) {
        if (isNullOrUndefined(args)) {
            return false;
        }

        this.id = args.id;

        for (const key in args) {
            const element = args[key];
            const [name, type] = key.split(":");
            
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
};

export const BaseConcept = Object.assign(
    Object.create(Concept),
    _BaseConcept
);