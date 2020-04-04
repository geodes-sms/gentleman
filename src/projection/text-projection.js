import {
    createDocFragment, createSpan, createDiv, createTextNode, createLineBreak,
    isNullOrWhitespace, isNullOrUndefined, valOrDefault, createButton,
    removeChildren, createI, isHTMLElement, isNode, hasOwn
} from "zenkai";
import { InvalidModelError } from '@src/exception/index.js';
import { Projection } from "./projection.js";
import { FieldFactory } from "./field/factory.js";
import { extend } from "@utils/index.js";

const Handlers = {
    '#': attributeHandler,
    '$': referenceHandler,
    '&': specialCharacterHandler,
    '@': scopeHandler,
};

export const TextualProjection = extend(Projection, {
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
    remove() {
        removeChildren(this.container);
        if (isHTMLElement(this.container)) {
            this.container.remove();
        }

        return true;
    },
    render() {
        const { layout, flow } = this.schema;
        const { object, name } = this.concept;

        if (Array.isArray(layout) || !isNullOrWhitespace(flow)) {
            this.container = createDiv({
                class: `projection-wrapper projection-wrapper--${flow}`,
                data: {
                    object: object,
                    name: name,
                }
            });
        } else {
            this.container = createDocFragment();
        }

        if (Array.isArray(layout)) {
            for (let i = 0; i < layout.length; i++) {
                const content = layout[i];
                this.container.appendChild(layoutHandler.call(this, content));
            }
        } else {
            this.container.appendChild(layoutHandler.call(this, layout));
        }


        // var concept = this.concept;

        // if (["component"].includes(concept.object) && concept.hasManyProjection()) {
        //     let btnProjection = createButton({ class: "btn btn-projection", title: "Projection" }, "P");
        //     btnProjection.tabIndex = -1;
        //     let container = createDiv({ class: 'component', data: { object: "component" } }, [
        //         btnProjection,
        //         fragment
        //     ]);

        //     let style = this.concept.getStyle();
        //     if (style) {
        //         if (style.spacing) {
        //             let spacing = style.spacing;
        //             for (const key in spacing) {
        //                 container.style[styleMapper[key]] = spacing[key];
        //             }
        //         }
        //     }

        //     btnProjection.addEventListener('click', function () {
        //         var view = concept.changeProjection();
        //         removeChildrenX(container, (node) => node !== this);
        //         container.appendChild(view);
        //     });

        //     this.container = container;

        //     return this.container;
        // }



        return this.container;
    }
});


function layoutHandler(layout) {
    var fragment = createDocFragment();

    var arr = layout.replace(/\s+/g, " ")
        .replace(/(#((\[\w+\])|\w+))/g, " $1 ")
        .replace(/(\$\w+(:\w+)?)/g, " $1 ")
        .split(" ")
        .filter(function (x) { return !isNullOrWhitespace(x); });

    var text = "";

    for (let i = 0; i < arr.length; i++) {
        let mode = arr[i].charAt(0);
        let key = arr[i].substring(1);

        let handler = Handlers[mode];
        if (handler) {
            if (!isNullOrWhitespace(text)) {
                var tag = createSpan({
                    class: "field field--label",
                }, text.trim());
                fragment.appendChild(tag);
                text = "";
            }
            let renderContent = handler.call(this, key);
            if (isNode(renderContent)) {
                fragment.appendChild(renderContent);
            }
        } else {
            text += " " + arr[i];
        }
    }

    if (!isNullOrWhitespace(text)) {
        fragment.appendChild(createSpan({
            class: "field field--label",
        }, text.trim()));
        text = "";
    }

    return fragment;
}

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

        return createI({ class: "attribute--optional", data: { object: "attribute", id: key } });
    } else if (key.startsWith('[')) {
        let componentId = key.substring(key.indexOf('[') + 1, key.indexOf(']'));

        if (this.concept.isComponentCreated(componentId) || this.concept.isComponentRequired(componentId)) {
            let component = this.concept.getComponent(componentId);

            return component.render();
        }

        return createI({ class: "attribute--optional", data: { object: "component", id: componentId } });
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
    var [name, flow] = key.split(":");
    var element = this.schema[name];

    if (element.type === 'keyword') {
        let keyword = createSpan({ class: 'keyword', text: element.val });
        if (element.color) keyword.style.color = element.color;
        return keyword;
    } else if (element.type === "text") {
        let keyword = createSpan({ class: valOrDefault(element.class, `${this.concept.name}-${key}`) }, element.val);
        return keyword;
    } else if (element.type === 'field') {
        let field = FieldFactory.createField(this.concept.name, this.concept, element).init();
        field.parentProjection = this;
        this.editor.registerField(field);
        return field.createInput();
    } else if (element.type === 'group') {
        // TODO: Implement group projection
        return;
    } else if (Array.isArray(element)) {
        let container = flow ? createDiv({ class: `projection-wrapper projection-wrapper--${flow}` }) : createDocFragment();

        for (let i = 0; i < element.length; i++) {
            let layout = element[i];
            container.appendChild(layoutHandler.call(this, layout));
        }

        return container;
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
        clear.classList.add('clear');
        return clear;
    }
}

function scopeHandler() {

}