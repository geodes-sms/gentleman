import { valOrDefault } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";


export const StringConcept = extend(Concept, {
    name: 'string',
    schema: {
        projection: [
            {
                type: "field",
                view: "textbox"
            }
        ]
    },
    initValue(value) {
        this.value = valOrDefault(value, "");
    
        return this;
    },
    update(value) {
        this.value = value;

        return true;
    },
    export() {
        return this.value;
    },
    toString() {
        return this.value;
    }
});