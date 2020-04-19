import { valOrDefault } from "zenkai";
import { extend } from "@utils/index.js";
import { Concept } from "./../concept.js";


export const ReferenceConcept = extend(Concept, {
    name: 'reference',
    schema: {
        projection: [
            {
                type: "field",
                view: "link"
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
    getRefCandidates() {
        const { metamodel, concepts } = this.model;

        var candidates = [];

        if (metamodel.isPrototype(this.accept)) {
            candidates = concepts.filter((concept) => concept.prototype && concept.prototype.name === this.accept);
        } else {
            candidates = concepts.filter((concept) => concept.name === this.accept);
        }

        // var values = candidates.map((candidate) => candidate.getAttribute(candidate.getIdRef()).value.toString());
        var values = candidates.map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            uniqueAttribute: candidate.getAttribute(candidate.getIdRef()),
            // value: candidate.toString()
        }));

        return values;
    },
    export() {
        return this.value;
    },
    toString() {
        var output = [];
        this.value.forEach(val => {
            output.push(val.toString());
        });
        
        return output;
    }
});