import { createDocFragment, createSpan, createTextNode, createLineBreak, addClass, isNullOrWhitespace, isNullOrUndefined, createDiv } from "zenkai";
import { InvalidModelError } from '@src/exception/index.js';
import { Field } from "@projection/field/field.js";
import { Projection } from "./projection.js";
import { FieldFactory } from "./field/factory.js";

const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

const Handlers = {
    '#': attributeHandler,
    '$': referenceHandler,
    '&': specialCharacterHandler,
};

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
            .replace(/(#((\[\w+\])?|[A-Za-z0-9_])+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !isNullOrWhitespace(x); });

        for (let i = 0; i < arr.length; i++) {
            let mode = arr[i].charAt(0);
            let key = arr[i].substring(1);

            let handler = Handlers[mode];
            if (handler) {
                fragment.appendChild(handler.call(this, key));
            } else {
                fragment.appendChild(createTextNode(arr[i] == 'space' ? " " : arr[i]));
            }
        }

        return fragment;
    }
});

const styleMapper = {
    "before": 'marginTop',
    "after": 'marginBottom',
};

function attributeHandler(key) {
    var style = this.concept.model.metamodel.style;
    if (this.concept.hasAttribute(key)) {
        let attribute = this.concept.getAttribute(key);
        return attribute.render();
    } else if (key.startsWith('[')) {
        let defaultStyle = style['component'];
        let componentId = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
        let component = this.concept.getComponent(componentId);
        let container = createDiv({ class: 'component' }, [component.render()]);
        
        if (defaultStyle.spacing) {
            let spacing = defaultStyle.spacing;
            for (const key in spacing) {
                container.style[styleMapper[key]] = spacing[key];
            }
        }

        return container;
    } else {
        throw InvalidModelError.create("The attribute " + key + " was not found.");
    }
}

function referenceHandler(key) {
    let element = this.schema[key];

    if (element.type === 'keyword') {
        let keyword = createSpan({ class: 'keyword', text: element.val });
        if (element.color) keyword.style.color = element.color;
        return keyword;
    } else if (element.type === "text") {
        let keyword = createSpan({ text: element.val });
        return keyword;
    } else if (element.type === 'field') {
        let field = FieldFactory.createField(this.concept, this.concept.name, element);
        this.editor.registerField(field);
        return field.createInput(this.concept.parent.name);
    } else if (element.type === 'group') {
        var field = Field.create({ _mAttribute: this.concept.parent.schema });
        this.editor.registerField(field);
        return field.createInput();
    }
}

function specialCharacterHandler(char) {
    if (char === 'NL')
        return createLineBreak();
    if (char === 'CL') {
        var clear = createLineBreak();
        addClass(clear, 'clear');
        return clear;
    }
}