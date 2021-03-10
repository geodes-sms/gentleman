import {
    createButton, createI, removeChildren, insertAfterElement, insertBeforeElement,
    isNode, isHTMLElement, hasOwn, isNullOrUndefined, valOrDefault, isEmpty, toBoolean,
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
    handlers: null,

    init(args) {
        this.containers = [];
        this.attributes = [];
        this.params = [];
        this.handlers = {};

        this.args = valOrDefault(args, {});

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
    /** @type {Layout|Field} */
    element: null,
    /** @type {string[]} */
    attributes: null,
    /** @type {*[]} */
    params: null,
    /** @type {number} */
    index: 0,
    /** @type {boolean} */
    editing: false,
    /** @type {boolean} */
    optional: false,
    /** @type {boolean} */
    searchable: false,
    /** @type {boolean} */
    focusable: true,

    get hasMultipleViews() { return this.schema.length > 1; },
    get isReadOnly() { return valOrDefault(this.getSchema().readonly, false); },

    /** @returns {boolean} */
    isRoot() { return isNullOrUndefined(this.parent); },

    getSchema(index) {
        return this.schema[valOrDefault(index, this.index)];
    },
    getContainer(index) {
        return this.containers[valOrDefault(index, this.index)];
    },
    getStyle() {
        const { style } = this.getSchema();

        return style;
    },
    addParam(param) {
        this.params.push(...(Array.isArray(param) ? param : [param]));
    },
    getParam(name) {
        let param = this.params.find(p => p.name === name);

        if (isNullOrUndefined(param)) {
            return undefined;
        }

        const { type = "string", value } = param;

        if (type === "string") {
            return value.toString();
        }

        if (type === "number") {
            return +value;
        }

        if (type === "boolean") {
            return toBoolean(value);
        }
    },
    /**
     * Get the defined attributes
     * @param {string} name 
     * @returns {*[]}
     */
    getAttributes(name) {
        return this.attributes.filter((attr) => attr.name === name);
    },
    /**
     * Get a the related field object
     * @param {HTMLElement} element 
     * @returns {Field}
     */
    getField(element) {
        return this.environment.getField(element);
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     * @returns {Static}
     */
    getStatic(element) {
        return this.environment.getStatic(element);
    },
    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Layout}
     */
    getLayout(element) {
        return this.environment.getLayout(element);
    },
    /**
     * Resolves the element to a projection element
     * @param {HTMLElement} element 
     * @returns 
     */
    resolveElement(element) {
        return this.environment.resolveElement(element);
    },

    /**
     * Get Handlers registered to this name
     * @param {string} name 
     * @returns {*[]} List of registered handlers
     */
    getHandlers(name) {
        return valOrDefault(this.handlers[name], []);
    },
    /**
     * Updates the projection
     * @param {string} message 
     * @param {*} value 
     */
    update(message, value, from) {
        if (isEmpty(this.containers)) {
            return;
        }

        if (message === "delete") {
            this.concept = null;
            
            this.containers.forEach(container => {
                removeChildren(container).remove();
            });

            this.model.removeProjection(this.id);

            return;
        }

        const handlers = this.getHandlers(message);

        if (!isEmpty(handlers)) {
            handlers.forEach((handler) => {
                let result = handler(value, from);

                if (result === false) {
                    return;
                }
            });
        } else {
            switch (message) {
                case "attribute.added":
                    this.getAttributes(value.name).forEach(attr => {
                        const { schema } = attr;

                        const projection = this.model.createProjection(value.target, schema.tag).init();
                        projection.parent = this;
                        projection.optional = true;

                        /** @type {HTMLElement} */
                        const render = projection.render();
                        StyleHandler.call(this, render, schema.style);

                        projection.element.parent = this.element;
                        attr.element = render;

                        if (attr.placeholder) {
                            attr.placeholder.after(render);
                            hide(attr.placeholder);
                        }
                    });
                    return;
                case "attribute.removed":
                    this.getAttributes(value.name).forEach(attr => {

                        if (attr.element) {
                            removeChildren(attr.element).remove();
                            attr.element = null;
                        }

                        if (attr.placeholder) {
                            show(attr.placeholder);
                        }
                    });
                    return;
                default:
                    console.warn(`The message '${message}' is not handled by the element`);
                    break;
            }
        }
    },

    /**
     * Sets up a function that will be called whenever the specified event is triggered
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    registerHandler(name, handler) {
        if (!Array.isArray(this.handlers[name])) {
            this.handlers[name] = [];
        }

        this.handlers[name].push(handler);

        return true;
    },
    /**
     * Removes an event handler previously registered with `registerHandler()`
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    unregisterHandler(name, handler) {
        if (!hasOwn(this.handlers, name)) {
            return false;
        }

        for (let i = 0; i < this.handlers[name].length; i++) {
            if (this.handlers[name][i] === handler) {
                this.handlers[name].splice(i, 1);

                return true;
            }
        }

        return false;
    },
    focus() {
        this.element.focus();
    },

    render() {
        const schema = this.getSchema();

        const { type, projection, content } = schema;

        /** @type {HTMLElement} */
        var container = null;

        if (type === "layout") {
            this.element = LayoutFactory.createLayout(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerLayout(this.element);
        } else if (type === "field") {
            this.element = FieldFactory.createField(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerField(this.element);
        }

        if (this.isRoot() || this.optional) {
            this.element.focusable = true;
        }

        if(!this.focusable) {
            this.element.focusable = false;
        }

        if(this.readonly) {
            this.element.readonly = true;
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
                title: `Delete`
            });

            btnDelete.addEventListener('click', (event) => {
                this.concept.delete();
            });

            container.classList.add("has-toolbar");
            container.prepend(btnDelete);
        }


        // if (this.hasMultipleViews) {
        //     let altBadge = createI({
        //         class: ["badge", "badge--alt"],
        //         title: "This projection has multiple views"
        //     });

        //     container.prepend(altBadge);
        // }


        this.addContainer(container);

        return container;
    },
    addContainer(container) {
        if (!isHTMLElement(container)) {
            throw new TypeError("Bad request: Missing container");
        }

        this.containers.push(container);
    },
    refresh() {
        if (this.editing) {
            this.containers.forEach(container => {
                container.tabIndex = 0;
            });
        } else {
            this.containers.forEach(container => {
                container.tabIndex = null;
            });
        }
    },
    changeView(index) {
        if (!this.hasMultipleViews) {
            this.environment.notify("There is no alternative projection for this concept");

            return;
        }

        var currentContainer = this.getContainer();

        this.index = valOrDefault(index, (this.index + 1) % this.schema.length);
        var container = this.getContainer();

        if (!isHTMLElement(container)) {
            container = this.render();
        }

        currentContainer.replaceWith(container);

        this.element = this.resolveElement(this.getContainer());

        if (this.parent) {
            this.parent.update("view.changed", container, this);
        }

        this.focus();

        return this;
    },

    export() {
        var output = {
            id: this.id,
            root: this.isRoot(),
            concept: { id: this.concept.id, name: this.concept.name }
        };

        return output;
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