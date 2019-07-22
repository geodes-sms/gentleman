import { createDocFragment, createSpan, createTextNode, createLineBreak, addClass } from "@zenkai/utils/dom/index.js";
import { isNullOrWhitespace, isNullOrUndefined } from "@zenkai/utils/datatype/index.js";
import { InvalidModelError } from '@src/exception/index.js';
import { Field } from "@projection/field/field.js";
import { Projection } from "./projection.js";


const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

export const TextualProjection = Projection.create({
    create: function (schema, concept, editor) {
        var instance = Object.create(this);

        instance.schema = schema;
        instance.concept = concept;
        instance.editor = editor;

        return instance;
    },
    schema: null,
    concept: null,
    editor: null,

    render() {
        var fragment = createDocFragment();
        var arr = this.schema.layout.replace(/ /g, " space ")
            .replace(/(#(_component(\[\w+\])?|[A-Za-z0-9_])+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !isNullOrWhitespace(x); });

        for (let i = 0; i < arr.length; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':
                    if (this.schema[key]) {
                        let element = this.schema[key];
                        if (element.type === 'keyword') {
                            let keyword = createSpan({ class: 'keyword', text: element.val });
                            if (element.color) keyword.style.color = element.color;
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        } else if (element.type === "text") {
                            let keyword = createSpan({ text: element.val });
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        } else if (element.type === 'field') {
                            var field = Field.create({ _mAttribute: this.concept.parent.schema });
                            this.editor.registerField(field);
                            return field.createInput();
                        }
                    } else if (this._source[key]) {
                        let keyword = createSpan({ class: 'keyword', text: this._source[key] });
                        fragment.appendChild(keyword);
                        fragment.appendChild(createTextNode(" "));
                    }

                    break;
                case '#':
                    if (this.concept.hasAttribute(key)) {
                        let attribute = this.concept.getAttribute(key);
                        fragment.appendChild(attribute.render());
                    } else if (key.startsWith('_component')) {
                        let componentId = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
                        let component = this.concept.getComponent(componentId);
                        fragment.appendChild(component.render());
                    } else {
                        throw InvalidModelError.create("The attribute " + key + " was not found.");
                    }

                    break;
                case '&':
                    fragment.appendChild(specialCharacterHandler(key));

                    break;
                default:
                    fragment.appendChild(createTextNode(arr[i] == 'space' ? " " : arr[i]));

                    break;
            }
        }

        return fragment;
    }
});

function specialCharacterHandler(char) {
    if (char === 'NL')
        return createLineBreak();
    if (char === 'CL') {
        var clear = createLineBreak();
        addClass(clear, 'clear');
        return clear;
    }
}