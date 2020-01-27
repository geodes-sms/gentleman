import { BaseConcept } from "../base-concept.js";
import { extend } from "@utils/index.js";

export const ModelConcept = extend(BaseConcept, {
    export() {
        var output = {};

        var specs = this.components.map(component => component.export());
        var defintion = specs.find(spec => spec.name === 'model_concept');
        defintion.concepts.forEach(concept => {
            var name = concept.name;
            delete concept.name;
            Object.assign(output, { [name]: concept });
        });

        return output;
    }
});