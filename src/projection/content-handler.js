import { valOrDefault, createDocFragment, createI, isHTMLElement, removeChildren, } from "zenkai";
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";
import { StaticFactory } from "./static/index.js";
import { AttributeHandler } from './structure-handler.js';
import { StyleHandler } from "./style-handler.js";


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
    } else if (schema.type === "attribute") {
        return AttributeHandler.call(this, schema, contentConcept);
    } else if (schema.type === "template") {
        let template = this.model.getTemplateSchema(schema.name);

        if (template.param) {
            if (schema.param) {
                template.param.forEach(param => {
                    Object.assign(param, schema.param.find(p => p.name === param.name));
                });
            }
            this.projection.addParam(template.param);
        }

        const fragment = createDocFragment();
        template.content.forEach(element => {
            fragment.append(ContentHandler.call(this, element, concept, args));
        });

        return fragment;
    } else if (schema.type === "projection") {
        const { tag, style } = schema;

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
                projection.optional = true;
                projection.placeholder = bindElement.placeholder;
                projection.parent = this.projection;

                bindElement.element = projection.render();

                if (bindElement.placeholder) {
                    bindElement.placeholder.after(bindElement.element);
                }

                if (isHTMLElement(bindElement.element)) {
                    StyleHandler.call(this, bindElement.element, style);
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
    }

    console.error(schema);

    throw new TypeError("Bad argument: The type is not recognized");
}