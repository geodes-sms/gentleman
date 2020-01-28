import { BaseConcept } from "../base-concept.js";
import { extend } from "@utils/index.js";

export const ConcreteConcept = extend(BaseConcept, {
    export() {
        var output = { };

        this.attributes.forEach(attr => {
            Object.assign(output, attr.export());
        });

        var specs = this.components.map(component =>component.export());
        var structure = createStructure(specs);
        var projection = specs.find(spec=>spec.name === 'concept_projection');
       
        Object.assign(output, structure);

        return output;
    }
});

function createStructure(specs) {
    var structure = specs.find(spec=>spec.name === 'concept_structure');

    var attributes = formatAttribute(structure.attributes);
    
    var components = [];
    structure.components.forEach(component => {
        components.push({
            "name": component.name,
            "attribute": formatAttribute(component.attributes),
        });
    });

    function formatAttribute(attrs) {
        var result = {};

        attrs.forEach(attr => {
            Object.assign(result, { [attr.name]: attr });
        });

        return result;
    }

    return {
        "attribute": attributes,
        "component": components
    };
}