import {
    createButton, appendChildren, removeChildren, insertAfterElement, insertBeforeElement,
    isNode, isHTMLElement, isNullOrUndefined, hasOwn, valOrDefault, isEmpty,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { FieldManager } from "./field-manager.js";
import { LayoutFactory } from "./layout/index.js";


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
        if (Number.isInteger(id)) {
            return projections[id];
        }

        return projections.find(p => p.id === id);
    },
    changeProjection() {

    },
    removeProjection(id) {
        var index = projections.findIndex(p => p.id === id);

        if (index === -1) {
            return false;
        }

        projections.splice(index, 1);

        return true;
    }
};

const Projection = {
    init() {
        this.containers = [];
        this.attributes = [];
        this.components = [];

        this.concept.register(this);

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
            // let handler = LayoutHandler[this.concept.reftype];
            // var renderContent = handler.call(this.concept.getParent().projection, this.concept.refname);
            // parent.replaceChild(renderContent, this.container);
            // this.container = renderContent;
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
        console.log(message);
        if (isEmpty(this.containers)) {
            return;
        }

        if (message === "delete") {
            this.concept.unregister(this);
            this.concept = null;
            
            this.containers.forEach(container => {
                removeChildren(container);
                container.remove();
            });
            
            ProjectionManager.removeProjection(this.id);

            return;
        }

        if (!(/(attribute|component).(added|removed)/gi).test(message)) {
            console.warn(`Projection does not support message ${message}`);
            return;
        }

        const [type, action] = message.split('.');
        var structure = null;

        if (type === "attribute") {
            structure = this.attributes.find((attr) => attr.name === value.name);
        }
        if (type === "component") {
            console.log(value);
            structure = this.components.find((comp) => comp.name === value.name);
        }
        if (isNullOrUndefined(structure)) {
            console.warn(`${type} not found in projection`);
            return;
        }

        const target = type === "attribute" ? value.target : value;

        switch (action) {
            case "added":
                var projection = ProjectionManager.createProjection(target.schema.projection, target, this.editor).init();
                projection.parent = this;

                var render = projection.render();
                var btnDelete = createButton({
                    class: ["btn", "btn-delete"],
                }, "Delete");
                btnDelete.addEventListener('click', (e) => {
                    target.delete();
                });
                render.prepend(btnDelete);
                structure.element = render;
                structure.optional.after(render);

                hide(structure.optional);

                break;
            case "removed":
                structure.element = null;

                show(structure.optional);

                break;
            default:
                break;
        }
    },
    delete() {

    },
    render() {
        const schema = this.getSchema();

        const { type, element, style, constraint } = schema;

        /** @type {HTMLElement} */
        var container = null;

        if (type === "layout") {
            let layout = LayoutFactory.createLayout(schema.layout, this).init();

            container = layout.render();
        } else if (type === "field") {
            let field = FieldManager.createField(schema, this.concept).init();
            field.projection = this;

            this.editor.registerField(field);

            container = field.render();
        }

        if (!isNode(container)) {
            throw new Error("Projection element container could not be created");
        }

        container.tabIndex = -1;
        Object.assign(container.dataset, {
            "projection": this.id,
            "object": this.concept.object
        });

        this.containers.push(container);

        return container;
    },
    changeView(index) {
        if (this.schema.length < 2) {
            this.editor.notify("There is no alternative projection for this concept");
            return;
        }

        var currentContainer = this.containers[this.index];

        this.index = valOrDefault(index, (this.index + 1) % this.schema.length);
        var container = this.containers[this.index];

        if (!container) {
            container = this.render();
        }

        currentContainer.classList.remove("fade-in");
        currentContainer.classList.add("swap-left");

        setTimeout(() => {
            currentContainer.replaceWith(container);
            currentContainer.classList.remove("swap-left");
            container.classList.add("fade-in");
            container.focus();
        }, 800);

        return this;
    },
    bindEvents() {
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

            this.container.addEventListener('click', (event) => {
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

            appendChildren(this.container, [this.btnNext, this.btnPrev]);
        }
    }
};