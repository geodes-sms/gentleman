import { valOrDefault, createDocFragment, createI, isHTMLElement, htmlToElement, createButton, isNullOrUndefined, } from "zenkai";
import { NotificationType } from "@utils/index.js";
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";
import { StaticFactory } from "./static/index.js";
import { StyleHandler } from "./style-handler.js";
import { StateHandler } from "./state-handler.js";


/**
 * Resolves the value
 * @returns {string}
 */
export function resolveValue(object) {
    if (object.type === "property") {
        return this.projection.concept.getProperty(object.name);
    }

    return object;
}


/**
 * Resolve and render attribute projection
 * @param {string} name 
 */
function AttributeHandler(schema, concept) {

    const { name, tag, placeholder = {}, style } = schema;

    if (!concept.hasAttribute(name)) {
        let message = `Attribute '${name}' does not exist in the concept '${concept.name}'`;
        this.environment.notify(message, NotificationType.ERROR);
        this.environment.addError({
            source: "projection",
            code: "attribute_not_found",
            message: message
        });

        return createI({
            hidden: true,
        }, name);
    }

    const required = valOrDefault(schema.required, concept.isAttributeRequired(name));

    if (required && !concept.isAttributeCreated(name)) {
        concept.createAttribute(name);
    }

    const attr = {
        name: name,
        get created() { return concept.isAttributeCreated(name); },
        schema: schema,
        placeholder: createI({
            class: ["projection-element"],
            hidden: true,
        }, name),
        parent: this,
        projection: this.projection,
        element: null,
    };

    this.projection.attributes.push(attr);

    if (!attr.created) {
        const { content } = placeholder;
        if (content) {
            attr.placeholder = ContentHandler.call(this, content, concept, { focusable: true });
        } else {
            attr.placeholder = createI({
                class: ["projection-element", "projection-element--placeholder"],
                tabindex: 0,
                dataset: {
                    object: "attribute",
                    id: name
                },
            }, `Add ${name}`);
        }

        attr.placeholder.addEventListener('click', (event) => {
            concept.createAttribute(name);
            let element = this.projection.resolveElement(attr.element);
            element.focus();
        });

        return attr.placeholder;
    } else {
        const { target, schema } = concept.getAttributeByName(name);

        let projection = this.projection.model.createProjection(target, tag).init();

        projection.parent = this.projection;
        projection._style = style;

        attr.element = projection.render();

        if (isNullOrUndefined(attr.element)) {
            return createI({ hidden: true }, name);
        }

        projection.element.parent = this;
    }

    return attr.element;
}

function SVGAttributeHandler(schema, concept){
    const { value, placement } = schema;

    const { target, description } = concept.getAttributeByName(value);

    let projection = this.projection.model.createProjection(target, placement.tag).init();

    projection.parent = this.projection;

    projection.render();

    if(!isNullOrUndefined(target.value)){
        projection.element.initValue(target.value);
    }

    projection.element.parent = this;

    let attributeName = value[0].toUpperCase() + value.substring(1);

    projection.element.attributeName = attributeName;

    return projection.element;
}

function ExternalHandler(schema, target){

    let projection = this.projection.model.createProjection(target, schema.tag).init();

    projection.parent = this.projection;

    projection.render();

    projection.element.parent = this;

    return projection.element;
}


export function ContentHandler(schema, concept, args = {}) {

    const contentConcept = valOrDefault(concept, this.projection.concept);

    if (schema.type === "layout") {
        let layout = LayoutFactory.createLayout(this.model, schema.layout, this.projection);

        layout.source = contentConcept;
        layout.parent = this;
        layout.init(args);

        this.model.registerLayout(layout);

        return layout.render();
    } else if (schema.type === "field") {
        let field = FieldFactory.createField(this.model, schema.field, this.projection);
        field.parent = this;
        field.init(args);

        this.model.registerField(field);

        return field.render();
    } else if (schema.type === "static") {
        let staticContent = StaticFactory.createStatic(this.model, schema.static, this.projection);

        staticContent.source = contentConcept;
        staticContent.parent = this;
        staticContent.init(args);

        this.model.registerStatic(staticContent);

        return staticContent.render();
    } else if (schema.type === "dynamic") {
        return ContentHandler.call(this, schema.dynamic, concept, args);
    } else if (schema.type === "attribute") {
        return AttributeHandler.call(this, schema, contentConcept);
    } else if (schema.type === "svg-attribute"){
        return SVGAttributeHandler.call(this, schema, contentConcept)
    } else if(schema.type === "external"){
        return ExternalHandler.call(this, schema, contentConcept);
    } else if (schema.type === "template") {
        let name = schema.name;

        if (name.type === "param") {
            name = this.projection.getParam(name.name);
        }

        let template = this.model.getTemplateSchema(name);

        if (template.param) {
            if (schema.param) {
                template.param.forEach(param => {
                    Object.assign(param, schema.param.find(p => p.name === param.name));
                });
            }
            this.projection.addParam(template.param);
        }

        const fragment = createDocFragment();
        let svg = false;
        let improvement;
        template.content.forEach(element => {
            let content = ContentHandler.call(this, element, concept, args);
            console.log(content);
            if(!isHTMLElement(content)){
                svg = true;
                improvement = content;
                return;
            }
            fragment.append(ContentHandler.call(this, element, concept, args));
        });

        if(svg){
            return improvement;
        }

        return fragment;
    } else if (schema.type === "projection") {
        const { tag, style, required = false } = schema;

        const bindElement = {
            schema: schema,
            placeholder: createI({
                class: ["projection-element"],
                hidden: true,
            }),
            parent: this,
            projection: this.projection,
            element: null,
        };

        bindElement.update = function (message, value, from) {
            const clear = () => {
                if (bindElement.element) {
                    bindElement.element.remove();
                    bindElement.element = null;
                }
            };

            clear();

            if (contentConcept.hasValue()) {
                let concept = contentConcept.getValue(true);

                let projection = this.projection.model.createProjection(concept, tag).init();
                // projection.optional = !required;
                projection.placeholder = bindElement.placeholder;
                projection.parent = this.projection;

                bindElement.element = projection.render();

                if (bindElement.placeholder) {
                    bindElement.placeholder.after(bindElement.element);
                }

                if (isHTMLElement(bindElement.element)) {
                    StyleHandler.call(this.projection, bindElement.element, style);
                }

                projection.element.parent = this.projection.element;
            }
        };

        contentConcept.register(bindElement);
        bindElement.update();

        return bindElement.element || bindElement.placeholder;
    } else if (schema.type === "property") {
        const { name } = schema;

        return this.projection.concept.getProperty(name);
    } else if (schema.type === "html") {
        const { html } = schema;

        return htmlToElement(html);
    } else if (schema.type === "state") {
        let _schema = {};

        let result = StateHandler.call(this, _schema, schema.state);

        return ContentHandler.call(this, result.content, concept, args);
    }

    console.error(schema);

    throw new TypeError("Bad argument: The type is not recognized");
}