import {
    createButton, removeChildren, isNode, isHTMLElement, hasOwn, isNullOrUndefined,
    valOrDefault, isEmpty, toBoolean, findAncestor, isNull,
} from "zenkai";
import { hide, show, makeResizable } from "@utils/index.js";
import { LayoutFactory } from "./layout/index.js";
import { FieldFactory } from "./field/index.js";
import { StaticFactory } from "./static/index.js";
import { StyleHandler } from "./style-handler.js";
import { AlgorithmFactory } from "./algorithm/factory.js";
import { ArrowFactory } from "./arrow/factory.js";
import { ShapeFactory } from "./shapes/factory.js";
import { createContainer } from "./container.js";
import { SimulationFactory } from "./simulations/factory.js";


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

    init(args = {}) {
        this.containers = new Map();
        this.attributes = [];
        this.params = [];
        this.templates = [];
        this.handlers = {};

        this.args = args;

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
    /** @type {Map} */
    containers: null,
    /** @type {HTMLElement} */
    placeholder: null,
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
    collapsible: false,
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
    hasSchema(tag) {
        return this.schema.findIndex((x) => x.tags.includes(tag)) !== -1;
    },
    getContainer(index) {
        return this.containers.get(valOrDefault(index, this.index));
    },
    getStyle() {
        const { style } = this.getSchema();

        return style;
    },
    addTemplate(tpl) {
        this.templates.push(tpl);
    },
    addParam(param) {
        this.params.push(...(Array.isArray(param) ? param : [param]));
    },
    getParam(name, forElement) {
        let param = this.params.find(p => p.name === name);

        if (isNullOrUndefined(param)) {
            return undefined;
        }

        const { type = "string", value } = param;

        let pValue = valOrDefault(value, param.default);

        if (isNullOrUndefined(pValue)) {
            return null;
        }

        if (type === "string") {
            return pValue.toString();
        }

        if (type === "number") {
            return +pValue;
        }

        if (type === "boolean") {
            return toBoolean(pValue);
        }
    },
    /**
     * Gets the projection parent if exist
     * @param {string} [name]
     * @returns {Concept}
     */
    getParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.parent;
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

        if (message === "delete" && from === this.concept) {        
            this.delete();
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
        }

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

                    projection.element.parent = attr.parent;
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
                break;
        }
    },
    delete() {
        if (this.concept) {
            setTimeout(() => {
                this.concept.unregister(this);
            }, 50);
        }

        if (this.placeholder) {
            this.getContainer().after(this.placeholder);
        }

        this.containers.forEach(container => {
            removeChildren(container);
            if (isHTMLElement(container)) {
                container.remove();
            }

            if (container.tagName === "path") {
                if (container.dataset.algorithm === "force") {
                    let arrow = this.environment.resolveElement(container);
                    arrow.projection.parent.removeArrow(arrow);
                }

                if (container.dataset.algorithm === "anchor") {
                    let anchor = this.environment.resolveElement(container);
                    anchor.deleteFromView();
                }
                if (container.dataset.algorithm === "multi") {
                    let multi = this.environment.resolveElement(container);
                    multi.deletePaths();
                }

            }

            if (["svg", "text"].includes(container.tagName)) {
                container.remove();
            }

            if (this.sibling) {
                this.sibling.delete();
            }
        });

        this.model.removeProjection(this.id);

        return true;
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

    render(){

        const schema = this.getSchema();

        if (isNullOrUndefined(schema)) {
            return null;
        }

        const { type, projection, content, kind, sibling, rtag, ratio } = schema;

        /** @type {HTMLElement} */
        var container = null;

        if (type === "layout" || kind === "layout") {
            this.element = LayoutFactory.createLayout(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerLayout(this.element);
        } else if (type === "field" || kind === "field") {
            let _schema = hasOwn(schema, "field") ? schema.field : valOrDefault(projection, content);

            this.element = FieldFactory.createField(this.model, _schema, this).init(this.args);

            this.model.registerField(this.element);
        } else if (type === "static" || kind === "static") {
            this.element = StaticFactory.createStatic(this.model, valOrDefault(projection, content), this).init(this.args);
            this.element.source = this.concept;

            this.model.registerStatic(this.element);
        } else if (type === "dynamic" || kind === "dynamic") {
            this.element = StaticFactory.createStatic(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerStatic(this.element);
        } else if (type === "algorithm") {
            this.element = AlgorithmFactory.createAlgo(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerAlgorithm(this.element);
        } else if (type === "arrow") {
            this.element = ArrowFactory.createArrow(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerArrow(this.element);
        } else if (type === "shape") {
            this.element = ShapeFactory.createShape(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerShape(this.element);
        } else if (type === "simulation") {
            this.element = SimulationFactory.createSimulation(this.model, valOrDefault(projection, content), this).init(this.args);

            this.model.registerSimulation(this.element);
        } else {
            this.element = createContainer(this.model, schema.container, this).init(this.args);

            this.model.registerLayout(this.element);
        }

        if (this.isRoot()) {
            this.element.focusable = true;
        }

        if (!this.focusable) {
            this.element.focusable = false;
        }

        if (this.readonly) {
            this.element.readonly = true;
        }

        container = this.element.render();

        // if (type === "layout" || type === "container") {
        //     makeResizable(container);
        // }

        if (!this.element.focusable && isHTMLElement(this.element)) {
            container.tabIndex = -1;
        }

        if (!isNode(container)) {
            throw new Error("Projection element container could not be created");
        }

        container.classList.add("projection");

        Object.assign(container.dataset, {
            "projection": this.id,
            "concept": this.concept.id,
            "object": this.concept.object,
        });

        if (this.optional) {          
            let btnDelete = createButton({
                class: ["btn", "structure__btn-delete", "projection__btn-delete"],
                title: `Delete ${this.concept.name}`,
                tabindex: -1,
                dataset: {
                    "action": "delete",
                    "projection": this.id
                }
            });

            btnDelete.addEventListener('click', (event) => {
                let container = this.getContainer();
                let parent = findAncestor(container, (el) => el.tabIndex === 0);
                this.environment.save(this.concept.getParent(), container.cloneNode(true));
                this.concept.delete();

                let element = this.environment.resolveElement(parent);

                if (!isNullOrUndefined(element)) {
                    element.focus();
                }
            });

            container.dataset.deletable = true;

            container.prepend(btnDelete);
        }
        if (this.collapsible) {
            /** @type {HTMLElement} */
            let btnCollapsible = createButton({
                class: ["btn", "projection__btn-collapse"],
                title: `Collapse ${this.concept.name}`,
                tabindex: -1,
                dataset: {
                    "action": "collapse",
                    "projection": this.id
                }
            });

            btnCollapsible.addEventListener('click', (event) => {
                /** @type {HTMLElement} */
                let container = this.getContainer();
                container.classList.toggle("collapsed");
            });

            container.dataset.collapsible = true;
            container.prepend(btnCollapsible);
        }

        if (this._style) {
            StyleHandler.call(this, container, this._style);
        }

        this.containers.set(this.index, container);

        if (sibling) {
            this.createSibling(this.concept, sibling, this.element);
        }

        if (rtag) {
            this.rtag = rtag;
            this.environment.registerReceiver(this.element, rtag);
        }

        return container;
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

    updateContent(id, projection) {
        let proj = this.element;
        this.element.updateContent(id, projection);
    },

    createSibling(concept, sibling) {
        const { render, params = false, bind } = sibling;
        const { tag, rtag } = render;

        if (this.checkForAliveSibling(concept.id, tag, rtag)) {
            return;
        }

        let projection = this.model.createProjection(concept, tag).init();

        if (bind) {
            projection.bind = this.element;
        }

        let rendered = projection.render();

        if (params) {
            const { coordinates, dimension } = params;

            rendered.setAttribute("x", coordinates.x);
            rendered.setAttribute("y", coordinates.y);
        }

        let target = this.environment.getActiveReceiver(rtag);

        projection.parent = target;

        if (isNullOrUndefined(projection.element.path)) {
            target.container.append(projection.element.element || projection.element.container);
        }

        this.sibling = projection;
    },

    checkForAliveSibling(id, tag, rtag) {

        if (isNullOrUndefined(this.environment.siblingModel)) {
            this.environment.siblingModel = new Map();
        }

        if (isNullOrUndefined(this.environment.siblingModel.get(id))) {
            this.environment.siblingModel.set(id, [{ tag: tag, rtag: rtag }]);
            return false;
        }

        let sibs = this.environment.siblingModel.get(id);

        for (let i = 0; i < sibs.length; i++) {
            if (sibs[i].rtag === rtag && sibs[i].tag === tag) {
                return true;
            }
        }

        sibs.push([{ tag: tag, rtag: rtag }]);

        this.environment.siblingModel.set(id, sibs);

        return false;
    },

    changeView(index) {

        if (!this.hasMultipleViews) {
            this.environment.notify("There is no alternative projection for this concept");

            return;
        }

        let currentContainer = this.getContainer();

        this.index = valOrDefault(index, (this.index + 1) % this.schema.length);
        let container = this.getContainer();

        if (!isHTMLElement(container)) {
            this.params = [];
            container = this.render();
        }

        currentContainer.replaceWith(container);

        let currentProjection = this.resolveElement(currentContainer)
        let projection = this.resolveElement(container);

        if(!isNullOrUndefined(currentProjection.parent)) {
            projection.parent = currentProjection.parent;
            projection.parent.updateContent(this.concept.id, projection);
        };

        projection.display();
        

        // if (this.parent) {
        //     this.parent.update("view.changed", container, this);
        // }
        const handlers = this.getHandlers("view.changed");

        if (!isEmpty(handlers)) {
            handlers.forEach((handler) => handler(container));
        }

        this.focus();

        return this;
    },
    findView(tag) {
        if (!this.hasSchema(tag)) {
            if (!this.model.hasProjectionSchema(this.concept, tag)) {
                return -1;
            }

            let schema = this.model.getProjectionSchema(this.concept, tag);
            this.schema.push(...schema);
        }

        return this.schema.findIndex((x) => x.tags.includes(tag));
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
    }
};