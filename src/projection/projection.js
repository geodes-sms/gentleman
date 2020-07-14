import {
    createButton, appendChildren, removeChildren, createI, getElement,
    insertAfterElement, insertBeforeElement, isNode, isHTMLElement,
    isNullOrUndefined, hasOwn, valOrDefault,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { LayoutHandler } from "./layout-handler";
import { FieldManager } from "./field-manager.js";


var inc = 0;
const nextId = () => `projection${inc++}`;

/** @type {Projection[]} */
const projections = [];

export const ProjectionManager = {
    createProjection(schema, concept, context) {
        var projection = Object.create(Projection, {
            id: { value: nextId() }
        });

        projection.schema = schema;
        projection.concept = concept;
        projection.context = context;
        projection.editor = context;

        projections.push(projection);

        return projection;
    },
    /**
     * 
     * @param {string|number} id 
     */
    getProjection(id) {
        return projections[id];
    },
    changeProjection() {

    }
};

export const Projection = {
    init() {
        this.containers = [];
        this.attributes = [];
        this.components = [];

        return this;
    },
    schema: null,
    /** @type {Concept} */
    concept: null,
    /** @type {Editor} */
    editor: null,
    /** @type {Projection} */
    parent: null,
    /** @type {HTMLElement[]} */
    containers: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {string[]} */
    attributes: null,
    /** @type {string[]} */
    components: null,
    /** @type {number} */
    index: 0,
    isReadOnly() {
        return valOrDefault(this.getSchema().readonly, false);
    },
    getSchema() {
        return this.schema[this.index];
    },
    getStyle() {
        const { style } = this.getSchema();

        return style;
    },
    getElement(name, schema) {
        const { element } = valOrDefault(schema, this.getSchema());

        if (isNullOrUndefined(element)) {
            throw new Error(`Projection error: schema has no elements`);
        }

        if (!hasOwn(element, name)) {
            throw new Error(`Projection error: element '${name}' not found`);
        }

        return element[name];
    },
    remove() {
        var parent = this.container.parentElement;

        removeChildren(this.container);
        if (isHTMLElement(this.container)) {
            let handler = LayoutHandler[this.concept.reftype];
            var renderContent = handler.call(this.concept.getParent().projection, this.concept.refname);
            parent.replaceChild(renderContent, this.container);
            this.container = renderContent;
        }

        this.concept.unregister(this);

        return true;
    },
    /**
     * Updates the projection
     * @param {string} message 
     * @param {*} value 
     */
    update(message, value) {
        if (message === "delete") {
            this.concept.unregister(this);
            removeChildren(this.container);

            const {reftype, refname, parent} = this.concept;

            /** @type {HTMLElement} */
            let option = createI({
                class: ["projection-element", "projection-element--optional"],
                dataset: {
                    object: reftype,
                    id: refname
                },
            }, `Add ${refname}`);

            option.addEventListener('click', (event) => {
                const { id } = event.target.dataset;

                parent.createAttribute(id);
            });

            this.container.replaceWith(option);

            return;
        }

        if (!(/(attribute|component).(added|removed)/gi).test(message)) {
            console.warn(`Projection does not support message ${message}`);
            return;
        }

        const [type, action] = message.split('.');

        if (type === "attribute" && !this.attributes.includes(value.name)) {
            // console.warn("Attribute not found in projection");
            return;
        }
        if (type === "component" && !this.components.includes(value.name)) {
            // console.warn("Component not found in projection", this.components);
            return;
        }

        const target = type === "attribute" ? value.target : value;

        var temp = getElement(`[data-id=${value.name}]`, this.container);

        if (!isHTMLElement(temp)) {
            this.editor.notify(`This ${type} cannot be rendered`);

            return;
        }

        switch (action) {
            case "added":
                var projection = ProjectionManager.createProjection(target.schema.projection, target, this.editor).init();
                projection.parent = this;
                temp.replaceWith(projection.render());
                projection.container.classList.add("optional");
                temp.remove();
                break;
            case "removed":

                break;
            default:
                break;
        }
    },
    delete() {

    },
    render() {
        const schema = this.getSchema();

        const { action, behaviour, constraint, element, layout, view } = schema;

        // if (isHTMLElement(this.containers[this.index])) {
        //     this.container = this.containers[this.index];
        //     show(this.container);
        //     appendChildren(this.container, [this.btnNext, this.btnPrev]);

        //     return this.container;
        // }

        var container = null;

        if (view) {
            let field = FieldManager.createField(schema, this.concept).init();
            field.projection = this;

            this.editor.registerField(field);

            container = field.render();
        } else {
            const { type, disposition } = layout;

            container = LayoutHandler[type].call(this, layout);

            if (this.schema.length > 1) {
                if (!isHTMLElement(this.btnPrev)) {
                    this.btnPrev = createButton({
                        type: "button",
                        class: ["btn", "btn-projection", "btn-projection--previous", "hidden"],
                        disabled: this.index <= 0,
                        dataset: {
                            context: "projection",
                            action: "previous"
                        }
                    }, "Previous Projection");
                }

                if (!isHTMLElement(this.btnNext)) {
                    this.btnNext = createButton({
                        type: "button",
                        class: ["btn", "btn-projection", "btn-projection--next", "hidden"],
                        disabled: this.index >= this.schema.length - 1,
                        dataset: {
                            context: "projection",
                            action: "next"
                        }
                    }, "Next Projection");
                }

                container.addEventListener('click', (event) => {
                    var target = event.target;
                    var previousContainer = this.container;
                    var container = null;

                    hide(previousContainer);
                    if (target === this.btnPrev) {
                        this.index -= 1;
                        container = this.render();
                        insertBeforeElement(previousContainer, container);

                    } else if (target === this.btnNext) {
                        this.index += 1;
                        container = this.render();
                        insertAfterElement(previousContainer, container);
                    }
                    show(this.container);

                    this.btnPrev.disabled = this.index <= 0;
                    this.btnNext.disabled = this.index >= this.schema.length - 1;
                });

                appendChildren(container, [this.btnNext, this.btnPrev]);
            }

            if (this.concept) {
                const { id, object, name } = this.concept;
                if (!["string", "set", "number", "reference"].includes(name)) {
                    Object.assign(container.dataset, {
                        object: object,
                        id: id,
                        name: name,
                    });
                }
            }
        }

        if (!isNode(container)) {
            throw new Error("Projection element container could not be created");
        }

        this.containers.push(container);
        this.container = container;

        if (this.concept) {
            this.concept.register(this);
        }

        return this.container;
    }
};