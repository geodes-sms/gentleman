import { BaseConcept } from "../base-concept.js";
import { extend, hide, show } from "@utils/index.js";
import { createDiv, createSpan, createH3, createButton, createUnorderedList, createListItem } from "zenkai";

export const ModelConcept = extend(BaseConcept, {
    project() {
        var tabBlock, tabTable, tabForms;
        var btnModel, btnQuery, btnDesign;

        var projectionsTab = createUnorderedList({ class: "projection-views" }, [
            tabBlock = createListItem({ class: "projection-tab-item" }, "BLOCK"),
            tabTable = createListItem({ class: "projection-tab-item" }, "TABLE"),
            tabForms = createListItem({ class: "projection-tab-item" }, "FORMS")
        ]);

        var actions = createDiv({ class: "projection-actions" }, [
            btnModel = createButton({ class: "btn-projection-model" }, "Model"),
            btnQuery = createButton({ class: "btn-projection-query" }, "Query"),
            btnDesign = createButton({ class: "btn-projection-design" }, "Design")
        ]);

        var projection = createDiv({ class: ["projection", "concept-projection"] }, [
            createSpan({ class: ["field", "empty"], editable: true }, "Nom du concept"),
            createH3({ class: 'title' }, "Define structure"),
            createDiv({ class: "concept-attribute" }),
            createDiv({ class: "concept-component" }),
            actions,
            projectionsTab
        ]);

        projectionsTab.addEventListener('click', (e) => {
            console.log("changeprojection");
            //tabHandler["type"]
        });
        tabBlock.addEventListener('click', (e) => {
            console.log("block item was clicked");
        })

        projection.tabIndex = 0;
        hide(actions);

        projection.addEventListener('focusin', (e) => {
            console.log('Model concept projection has gained focus');
            show(actions);
        });

        projection.addEventListener('focusout', (e) => {
            console.log('Model concept projection lost focus');
            hide(actions);
        });

        return projection;
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