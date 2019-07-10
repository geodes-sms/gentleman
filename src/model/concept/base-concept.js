import { createDocFragment, createSpan, createTextNode, createLineBreak, addClass, addAttributes, createDiv } from "@zenkai/utils/dom/index.js";
import { isNullOrWhitespace, valOrDefault } from "@zenkai/utils/datatype/index.js";
import { InvalidModelError } from '@src/exception/index.js';
import { Concept } from "./concept.js";
import { Field } from "@src/field/field.js";

export const BaseConcept = Concept.create({
    create: function (model, schema) {
        var instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.projection = TextualProjection.create(schema.projection[0], schema.attribute, model.editor);

        return instance;
    },
    projection: null,
    representation: null,
    render() {
        var container = createDiv({ class: 'container' });
        container.appendChild(this.projection.render());
        return container;
    }
});

const Projection = {
    create(args) {
        var instance = Object.create(this);
        Object.assign(instance, args);
        return instance;
    },
    schema: null,
    attributes: null,
};

const TextualProjection = Projection.create({
    create: function (schema, attributes, editor) {
        var instance = Object.create(this);

        instance.schema = schema;
        instance.attributes = attributes;
        instance.editor = editor;

        return instance;
    },
    schema: null,
    attributes: null,
    editor: null,

    render() {
        var fragment = createDocFragment();
        var arr = this.schema.layout.replace(/ /g, " space ")
            .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !isNullOrWhitespace(x); });

        for (let i = 0; i < arr.length; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':
                    if (this.representation[key]) {
                        let block = this.representation[key];
                        if (block.type === 'keyword') {
                            let keyword = createSpan({ class: 'keyword', text: block.val });
                            if (block.color) keyword.style.color = block.color;
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        } else if (block.type === "text") {
                            let keyword = createSpan({ text: block.val });
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        }
                    } else if (this._source[key]) {
                        let keyword = createSpan({ class: 'keyword', text: this._source[key] });
                        fragment.appendChild(keyword);
                        fragment.appendChild(createTextNode(" "));
                    }
                    break;
                case '#':
                    if (this.attributes[key]) {
                        let field = Field.create({_mAttribute: this.attributes[key]});
                        this.editor.registerField(field);
                        fragment.appendChild(field.createInput());
                        // let mAttr = this.createModelAttribute(this._source.attr[key]);
                        // fragment.appendChild(mAttr.render_attr());
                    } else {
                        throw InvalidModelError.create("The attribute " + key + " was not found.");
                    }

                    break;
                case '&':
                    if (key === 'NL')
                        fragment.appendChild(createLineBreak());
                    if (key === 'CL') {
                        var clear = createLineBreak();
                        addClass(clear, 'clear');
                        fragment.appendChild(clear);
                    }

                    break;
                default:
                    fragment.appendChild(createTextNode(arr[i] == 'space' ? " " : arr[i]));
                    break;
            }
        }

        return fragment;
    }
});

function createProjectionInput(attribute, editable, options) {
    var input = createSpan({
        class: ['attr', 'empty'],
        html: "",
        data: {
            name: attribute.name,
            type: attribute.type,
            placeholder: attribute.name
        }
    });
    input.contentEditable = valOrDefault(editable, true);
    input.tabIndex = 0;
    if (options) {
        addAttributes(input, options);
    }
    if (attribute.optional) {
        Object.assign(input.dataset, { optional: true });
    }

    return input;
}

var TabularProjection = {
    create: function (schema) {
        var instance = Object.create(this);

        instance.schema = schema;
        return instance;
    },
    schema: null,
    type: "Projection",
    render() {

    }
};