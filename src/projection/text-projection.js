import {
    createDocFragment, createSpan, createDiv, createListItem, createTextNode, createLineBreak,
    addClass, isNullOrWhitespace, isNullOrUndefined, valOrDefault, insertBeforeElement, createButton, removeChildren, createI
} from "zenkai";
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
    container: null,

    render() {
        var concept = this.concept;
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

        if (["component"].includes(concept.object) && concept.hasManyProjection()) {
            let btnProjection = createButton({ class: "btn btn-projection", title: "Projection" }, "P");
            btnProjection.tabIndex = -1;
            let container = createDiv({ class: 'component', data: { object: "component" } }, [
                btnProjection,
                fragment
            ]);

            let style = this.concept.getStyle();
            if(style) {
                if (style.spacing) {
                    let spacing = style.spacing;
                    for (const key in spacing) {
                        container.style[styleMapper[key]] = spacing[key];
                    }
                }
            }

            btnProjection.addEventListener('click', function () {
                var view = concept.changeProjection();
                removeChildrenX(container, (node) => node !== this);
                container.appendChild(view);
            });

            this.container = container;

            return this.container;
        }

        return fragment;
    }
});

const styleMapper = {
    "before": 'marginTop',
    "after": 'marginBottom',
};

/**
 * 
 * @param {string} key 
 * @this {TextualProjection}
 */
function attributeHandler(key) {
    if (this.concept.hasAttribute(key)) {
        if (this.concept.isAttributeCreated(key) || this.concept.isAttributeRequired(key)) {
            let attribute = this.concept.getAttribute(key);
            return attribute.render();
        }
        return createI({ class: "attribute--optional", data: { id: key } });
    } else if (key.startsWith('[')) {
        let componentId = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
        let component = this.concept.getComponent(componentId);
        return component.render();
    } else {
        throw InvalidModelError.create(`The attribute "${key}" was not found.`);
    }
}

/**
 * 
 * @param {string} key 
 * @this {TextualProjection}
 */
function referenceHandler(key) {
    let element = this.schema[key];

    if (element.type === 'keyword') {
        let keyword = createSpan({ class: 'keyword', text: element.val });
        if (element.color) keyword.style.color = element.color;
        return keyword;
    } else if (element.type === "text") {
        let keyword = createSpan({ class: valOrDefault(element.class, `${this.concept.name}-${key}`) }, element.val);
        return keyword;
    } else if (element.type === 'field') {
        let field = FieldFactory.createField(this.concept.name, this.concept, element);
        this.editor.registerField(field);
        return field.createInput();
    } else if (element.type === 'group') {
        var field = Field.create({ _mAttribute: this.concept.parent.schema });
        this.editor.registerField(field);
        return field.createInput();
    }
}

/**
 * 
 * @param {string} char 
 * @this {TextualProjection}
 */
function specialCharacterHandler(char) {
    if (char === 'NL')
        return createLineBreak();
    if (char === 'CL') {
        var clear = createLineBreak();
        addClass(clear, 'clear');
        return clear;
    }
}

// TODO: DELETE AFTER ZENKAI UPDATE
function removeChildrenX(node, cb) {
    if (isNullOrUndefined(cb)) {
        removeChildren(node);
    } else {
        Array.from(node.childNodes).forEach(n => {
            if (cb(n)) {
                node.removeChild(n);
            }
        });
    }

    return node;
}