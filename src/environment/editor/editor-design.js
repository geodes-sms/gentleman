import {
    createDocFragment, createDiv, createH3, createButton, createHeader,
    removeChildren, isHTMLElement, isNullOrUndefined,
} from 'zenkai';
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { show, hide, toggle, Events, Key, getEventTarget, NotificationType, EditorMode } from '@utils/index.js';




export const EditorDesign = {
    /** @type {ConceptModel} */
    conceptModel: null,
    /** @type {ProjectionModel} */
    projectionModel: null,
    concept: null,
    projection: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,

    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {*} */
    schema: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.schema = args;
        const { concept: conceptSchema, projection: projectionSchema, handlers } = this.element.design();

        this.conceptModel = ConceptModelManager.createModel(conceptSchema).init();
        this.projectionModel = createProjectionModel(projectionSchema, this).init();

        this.concept = this.conceptModel.createConcept(this.element.name);
        this.projection = this.projectionModel.createProjection(this.concept).init();

        this.concept.getAttributes().forEach(attr => {
            if (handlers[attr.name]) {
                let handler = {
                    update: handlers[attr.name]
                };
                attr.target.register(handler);
            }
        });

        return this;
    },


    show() {
        show(this.container);
        this.visible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.visible = false;

        return this;
    },
    toggle() {
        toggle(this.container);
        this.visible = !this.visible;

        return this;
    },
    refresh() {

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-element"],
                dataset: {
                    nature: "concept-container",
                    size: 1,
                }
            });
        }

        const { name } = this.element;

        if (!isHTMLElement(this.header)) {
            this.header = createHeader({
                class: ["editor-element-header"],
            });

            fragment.append(this.header);
        }

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                class: ["btn", "editor-element-toolbar__btn-delete"],
                title: `Delete ${name.toLowerCase()}`,
                dataset: {
                    action: `close`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        let title = createH3({
            class: ["title", "editor-concept-title", "fit-content"],
        }, name);

        let toolbar = createDiv({
            class: ["editor-concept-toolbar"],
        }, [this.btnClose]);

        removeChildren(this.header).append(title, toolbar);
        fragment.append(this.projection.render());

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },

    // Projection elements

    /**
     * Get a the related field object
     * @param {HTMLElement} element 
     * @returns {Field}
     */
    getField(element) {
        if (!isHTMLElement(element)) {
            console.warn("Field error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Field error: Missing id attribute on field");
            return null;
        }

        if (!["field", "field-component"].includes(nature)) {
            console.warn("Field error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getField(id);
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     * @returns {Static}
     */
    getStatic(element) {
        if (!isHTMLElement(element)) {
            console.warn("Static error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Static error: Missing id attribute on field");
            return null;
        }

        if (!["static"].includes(nature)) {
            console.warn("Static error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getStatic(id);
    },
    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Layout}
     */
    getLayout(element) {
        if (!isHTMLElement(element)) {
            console.warn("Layout error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Layout error: Missing id attribute on field");
            return null;
        }

        if (!["layout", "layout-component"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getLayout(id);
    },
    resolveElement(element) {
        if (!isHTMLElement(element)) {
            return null;
        }

        const { nature } = element.dataset;

        if (isNullOrUndefined(nature)) {
            return null;
        }

        let projectionElement = null;

        switch (nature) {
            case "field":
            case "field-component":
                projectionElement = this.getField(element);
                break;
            case "layout":
            case "layout-component":
                projectionElement = this.getLayout(element);
                break;
            case "static":
                projectionElement = this.getStatic(element);
                break;
        }

        if (projectionElement) {
            projectionElement.environment = this;
        }

        return projectionElement;
    },
    /**
     * Updates the active HTML Element
     * @param {HTMLElement} element 
     */
    updateActiveElement(element) {
        if (this.activeElement && this.activeElement === element) {
            return this;
        }

        this.activeElement = element;

        return this;
    },

    actionHandler(name) {

    },


    bindEvents() {
        var lastKey = null;

        this.container.addEventListener('click', (event) => {
            var target = getEventTarget(event.target);

            const { action, context, id, handler } = target.dataset;

            if (this.activeElement) {
                this.activeElement.clickHandler(target);
            }
        }, true);


        this.container.addEventListener('keydown', (event) => {
            const { target } = event;

            const { nature } = target.dataset;

            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.backspaceHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.ctrl:
                    event.preventDefault();

                    rememberKey = true;
                    break;
                case Key.shift:
                    event.preventDefault();

                    rememberKey = true;
                    break;
                case Key.delete:
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.deleteHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.spacebar:
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.spaceHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.alt:
                    event.preventDefault();

                    // if (this.activeProjection && this.activeProjection.hasMultipleViews) {
                    //     this.activeProjection.changeView();
                    // }

                    break;
                case Key.enter:
                    if (this.activeElement) {
                        const handled = this.activeElement.enterHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (target.tagName === "BUTTON") {
                        target.click();
                        event.preventDefault();
                    } else {
                        event.preventDefault();
                    }

                    break;
                case Key.escape:
                    if (this.activeElement) {
                        const handled = this.activeElement.escapeHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.insert:
                    if (this.activeElement) {
                        event.preventDefault();
                    }

                    break;
                case Key.up_arrow:
                    if (this.activeElement && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        const handled = this.activeElement.arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.down_arrow:
                    if (this.activeElement && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        const handled = this.activeElement.arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.right_arrow:
                    if (this.activeElement && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        const handled = this.activeElement.arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.left_arrow:
                    if (this.activeElement && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        const handled = this.activeElement.arrowHandler("left", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;

                case "s":
                    if (lastKey === Key.ctrl) {
                        this.activeConcept.copy();

                        event.preventDefault();
                    }

                    break;
                case "e":
                    if (lastKey === Key.ctrl && this.activeConcept) {
                        this.createInstance(this.activeConcept, this.activeProjection, {
                            type: "projection",
                            close: "DELETE-PROJECTION"
                        });

                        event.preventDefault();
                    }

                    break;
                default:
                    break;
            }

            if (rememberKey) {
                lastKey = event.key;
            }

        }, false);

        this.container.addEventListener('keyup', (event) => {
            var target = event.target;

            switch (event.key) {
                case Key.spacebar:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.activeElement._spaceHandler(target);
                    }

                    break;
                case Key.delete:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.activeElement.delete(target);
                    }

                    break;
                case Key.alt:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.design(this.activeElement);
                    }

                    break;
                case Key.up_arrow:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        const handled = this.activeElement._arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    if (this.activeElement && lastKey === Key.shift) {
                        const handled = this.activeElement.shiftHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.down_arrow:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        const handled = this.activeElement._arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.right_arrow:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        const handled = this.activeElement._arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.left_arrow:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        const handled = this.activeElement._arrowHandler("left", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                default:
                    break;
            }

            if (lastKey === event.key) {
                lastKey = -1;
            }
        }, false);

        this.container.addEventListener('focusin', (event) => {
            const { target } = event;

            const element = this.resolveElement(target);

            if (element && element.projection.focusable && element.focusable) {
                if (this.activeElement && this.activeElement !== element) {
                    this.activeElement.focusOut();
                    this.activeElement = null;
                }

                if (isNullOrUndefined(element) || element === this.activeElement) {
                    if (this.activeElement) {
                        this.activeElement._focusIn(target);
                    }

                    return;
                }

                this.updateActiveElement(element);
                this.activeElement.focusIn(target);
            } else if (element) {
                // TODO
            } else {
                if (this.activeElement) {
                    this.activeElement.focusOut(target);
                }

                this.activeElement = null;
            }
        });
    }
};