import {
    createButton, removeChildren, insertAfterElement, insertBeforeElement,
    isNode, isHTMLElement, isNullOrUndefined, hasOwn, valOrDefault, isEmpty, createI,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";
import { StyleHandler } from "./style-handler.js";


var inc = 0;
const nextId = () => `projection${inc++}`;

export const ProjectionFactory = {
    createProjection(model, schema, concept, env) {
        var projection = Object.create(Projection, {
            id: { value: valOrDefault(schema.id, nextId()) },
            model: { value: model },
            schema: { value: schema, writable: true },
            environment: { value: env },
        });

        projection.concept = concept;

        return projection;
    }
};

const Projection = {
    init(concept) {
        this.containers = [];
        this.attributes = [];
        this.components = [];

        if (concept) {
            this.concept = concept;
        }

        this.concept.register(this);

        return this;
    },
    schema: null,
    /** @type {Concept} */
    concept: null,
    /** @type {Editor} */
    environment: null,
    /** @type {Projection} */
    parent: null,
    /** @type {HTMLElement[]} */
    containers: null,
    /** @type {HTMLElement[]} */
    element: null,
    /** @type {string[]} */
    attributes: null,
    /** @type {string[]} */
    components: null,
    /** @type {number} */
    index: 0,
    get hasMultipleViews() { return this.schema.length > 1; },
    get isReadOnly() { return valOrDefault(this.getSchema().readonly, false); },
    getSchema() {
        return this.schema[this.index];
    },
    getStyle() {
        const { style } = this.getSchema();

        return style;
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

            this.model.removeProjection(this.id);

            return;
        }

        if (!(/attribute.(added|removed)/gi).test(message)) {
            console.warn(`Projection does not support message ${message}`);
            return;
        }

        const [type, action] = message.split('.');

        var structure = null;

        if (type === "attribute") {
            structure = this.attributes.filter((attr) => attr.name === value.name);
        }

        if (isEmpty(structure)) {
            console.warn(`${type} not found in projection`);
            return;
        }

        const target = type === "attribute" ? value.target : value;

        switch (action) {
            case "added":
                structure.forEach(struct => {
                    const { schema, name } = struct;

                    const projection = this.model.createProjection(target, schema.tag).init();
                    projection.parent = this;
                    projection.optional = true;

                    /** @type {HTMLElement} */
                    const render = projection.render();
                    StyleHandler(render, schema.style);

                    struct.element = render;
                    struct.optional.after(render);

                    hide(struct.optional);
                });


                break;
            case "removed":
                structure.forEach(struct => {
                    struct.element = null;

                    show(struct.optional);
                });

                break;
            default:
                break;
        }
    },

    render() {
        const schema = this.getSchema();

        const { type, projection } = schema;

        /** @type {HTMLElement} */
        var container = null;

        if (type === "layout") {
            this.element = LayoutFactory.createLayout(this.model, projection, this).init();
        } else if (type === "field") {
            this.element = FieldFactory.createField(this.model, projection, this).init();

            this.environment.registerField(this.element);
        }

        container = this.element.render();

        if (!isNode(container)) {
            throw new Error("Projection element container could not be created");
        }

        Object.assign(container.dataset, {
            "projection": this.id,
            "object": this.concept.object,
            "alt": this.schema.length
        });

        if (this.optional) {
            /** @type {HTMLElement} */
            let btnDelete = createButton({
                class: ["btn", "structure__btn-delete"],
                title: `Delete ${this.concept.ref.name.toLowerCase()}`
            });

            btnDelete.addEventListener('click', (event) => {
                this.concept.delete();
            });

            container.classList.add("has-toolbar");
            container.prepend(btnDelete);
        }

        if (this.hasMultipleViews) {
            let altBadge = createI({
                class: ["badge", "badge--alt"]
            });

            container.prepend(altBadge);
        }

        this.containers.push(container);

        return container;
    },
    changeView(index) {
        if (this.schema.length < 2) {
            this.environment.notify("There is no alternative projection for this concept");
            return;
        }

        var currentContainer = this.containers[this.index];

        this.index = valOrDefault(index, (this.index + 1) % this.schema.length);
        var container = this.containers[this.index];

        if (!container) {
            container = this.render();
        }

        currentContainer.replaceWith(container);
        container.focus();

        // Animated transition

        // currentContainer.classList.remove("fade-in");
        // currentContainer.classList.add("swap-left");

        // setTimeout(() => {
        //     currentContainer.replaceWith(container);
        //     currentContainer.classList.remove("swap-left");
        //     container.classList.add("fade-in");
        //     container.focus();
        // }, 600);

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

            this.container.append(this.btnNext, this.btnPrev);
        }
    }
};