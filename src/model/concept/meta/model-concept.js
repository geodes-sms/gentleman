import { BaseConcept } from "../base-concept.js";
import { extend } from "@utils/index.js";
import { createDiv, createSpan, createH3 } from "zenkai";

export const ModelConcept = extend(BaseConcept, {
    project() {
        return createDiv({ class: "projection concept-projection" }, [
            createSpan({class:"field empty", editable: true},"Nom du concept"),
            createH3({ class: 'title' }, "Define structure"),
            createDiv({ class: "concept-attribute" }),
            createDiv({ class: "concept-component" }),
        ]);
    },
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