import { Concept } from "./../concept.js";
import { TextualProjection } from "@projection/text-projection.js";
import { hasOwn } from "zenkai";

/**
 * @memberof Concept
 */
export const SetConcept = Concept.create({
    create: function (model) {
        var instance = Object.create(this);

        instance.model = model;
        instance.projection = TextualProjection.create(createProjection(), instance, model.editor);
        instance.value = [];

        return instance;
    },
    projection: null,
    representation: null,
    name: 'set',
    accept: null,
    get canAddValue() { return true; },
    init() {
        for (let i = 0; i < this.min; i++) {
            this.addElement(this.createElement());
        }
    },
    render() {
        var view = this.projection.render();
        return view;
    },
    getAddAction() {
        if (hasOwn(this.action, 'add')) {
            return this.action['add'];
        }

        return {
            text: `Add ${this.accept}`
        };
    },
    addElement(element){
        this.value.push(element);
        return true;
    },
    createElement(){
        return this.model.createConcept(this.accept);
    }
});

function createProjection() {
    return {
        type: "text",
        flowgroup: { type: 'field', view: 'flowgroup' },
        layout: '$flowgroup'
    };
}