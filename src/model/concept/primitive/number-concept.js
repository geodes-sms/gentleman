import { valOrDefault } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";


export const NumberConcept = extend(Concept, {
    name: 'number',
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
    render() {
        return this.projection.render();
    },
    export() {
        return this.value;
    },
});