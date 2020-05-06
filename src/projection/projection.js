import {
    createDocFragment, createSpan, createDiv, createI, removeChildren, isNode,
    isNullOrWhitespace, isNullOrUndefined, valOrDefault, isHTMLElement
} from "zenkai";
import { FieldFactory } from "./field/factory.js";


const SymbolResolver = {
    '#': resolveStructure,
    '$': resolveReference,
};

const ProjectionHandler = {
    'stack': stackHandler,
    'wrap': wrapHandler,
    'table': stackHandler,
    'grid': stackHandler,
    'relative': stackHandler,
    'field': fieldHandler,
    'attribute': attributeHandler,
    'component': componentHandler,
};

export const Projection = {
    create: function (schema, concept, editor) {
        const instance = Object.create(this);

        instance.schema = schema[0];
        instance.concept = concept;
        instance.editor = editor;

        return instance;
    },
    schema: null,
    concept: null,
    editor: null,
    container: null,
    index: 0,
    remove() {
        var parent = this.container.parentElement;

        removeChildren(this.container);
        if (isHTMLElement(this.container)) {
            let handler = ProjectionHandler[this.concept.reftype];
            var renderContent = handler.call(this.concept.getConceptParent().projection, this.concept.refname);
            parent.replaceChild(renderContent, this.container);
            this.container = renderContent;
        }

        return true;
    },
    delete() {

    },
    render() {
        const { type } = this.schema;
        const { id, object, name } = this.concept;

        this.container = ProjectionHandler[type].call(this, this.schema);
        if (!["string", "set", "number", "reference"].includes(name)) {
            Object.assign(this.container.dataset, {
                object: object,
                id: id,
                name: name,
            });
        }
        // this.container.tabIndex = -1;

        return this.container;
    }
};

function stackHandler(schema) {
    const { layout, orientation } = schema;

    var container = createDiv({ class: `projection-wrapper projection-wrapper--${orientation}` });

    if (Array.isArray(layout)) {
        for (let i = 0; i < layout.length; i++) {
            const content = layout[i];
            container.appendChild(layoutHandler.call(this, content));
        }
    } else {
        container.appendChild(layoutHandler.call(this, layout));
    }

    return container;
}

function wrapHandler(schema) {
    const { layout } = schema;

    var container = createDiv({ class: `projection-wrapper`, });

    if (Array.isArray(layout)) {
        for (let i = 0; i < layout.length; i++) {
            const content = layout[i];
            container.appendChild(layoutHandler.call(this, content));
        }
    } else {
        container.appendChild(layoutHandler.call(this, layout));
    }

    return container;
}

function fieldHandler(schema) {
    var field = FieldFactory.createField(schema, this.concept, this.editor).init();
    field.parentProjection = this;

    this.editor.registerField(field);

    return field.createInput();
}

function layoutHandler(layout) {
    var fragment = createDocFragment();

    var parts = parseLayout(layout);

    var textBuffer = "";

    const addText = () => {
        if (!isNullOrWhitespace(textBuffer)) {
            var tag = createSpan({ class: "field field--label", }, textBuffer.trim());
            fragment.appendChild(tag);
            textBuffer = "";
        }
    };

    const addContent = (content) => {
        if (isNode(content)) {
            fragment.appendChild(content);
        }
    };

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        let handler = SymbolResolver[part.charAt(0)];
        if (handler) {
            addText();
            addContent(handler.call(this, part.substring(1)));
        } else {
            textBuffer += " " + parts[i];
        }
    }

    addText();

    return fragment;
}

function parseLayout(layout) {
    var parts = layout.replace(/\s+/g, " ")
        .replace(/(#\w+(:\w+)?)/g, " $1 ")
        .replace(/(\$\w+(:\w+)?)/g, " $1 ")
        .split(" ")
        .filter(function (x) { return !isNullOrWhitespace(x); });

    return parts;
}

/**
 * 
 * @param {string} key 
 * @this {TextualProjection}
 */
function resolveStructure(key) {
    var [name, type = "attribute"] = key.split(":");

    return ProjectionHandler[type].call(this, name);
}

function attributeHandler(name) {
    if (!this.concept.hasAttribute(name)) {
        throw new Error(`PROJECTION: Attribute ${name} does not exist`);
    }

    if (!(this.concept.isAttributeRequired(name) || this.concept.isAttributeCreated(name))) {
        return createI({ class: "attribute--optional", data: { object: "attribute", id: name } });
    }

    var { target } = this.concept.getAttributeByName(name);
    var projection = Projection.create(target.schema.projection, target, this.editor);

    return projection.render();
}

function componentHandler(name) {
    if (!this.concept.hasComponent(name)) {
        throw new Error(`PROJECTION: Component ${name} does not exist`);
    }
    if (!(this.concept.isComponentCreated(name) || this.concept.isComponentRequired(name))) {
        return createI({ class: "component--optional", data: { object: "component", id: name } });
    }

    var component = this.concept.getComponentByName(name);
    var projection = Projection.create(component.schema.projection, component, this.editor);

    return projection.render();
}

/**
 * 
 * @param {string} key 
 * @this {TextualProjection}
 */
function resolveReference(key) {
    var [name, from] = key.split(":");

    var element = this.schema.element[name];
    var { type } = element;

    return ProjectionHandler[type].call(this, element);
}

function resolveScope() {

}