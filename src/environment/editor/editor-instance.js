import {
    createDocFragment, createDiv, createH3, createButton, createHeader,
    removeChildren, isHTMLElement, valOrDefault,
} from 'zenkai';
import { show, hide, toggle, collapse, expand, NotificationType, makeResizable } from '@utils/index.js';


const MAX_SIZE = 2;

export const EditorInstance = {
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
    btnCollapse: null,
    /** @type {HTMLButtonElement} */
    btnMaximize: null,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {number} */
    size: 1,
    /** @type {boolean} */
    fullscreen: false,
    /** @type {boolean} */
    collapsed: false,
    /** @type {*} */
    schema: null,
    /** @type {string} */
    ctype: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.ctype = valOrDefault(args.type, "concept");
        this.schema = args;

        return this;
    },
    collapse() {
        this.collapsed = !this.collapsed;

        if (this.collapsed) {
            this.fullscreen = false;
        }

        this.refresh();

        return this;
    },
    maximize() {
        this.fullscreen = !this.fullscreen;

        if (this.fullscreen) {
            this.editor.instances.forEach(instance => {
                if (instance !== this) {
                    instance.hide();
                }
            });
        } else {
            this.editor.instances.forEach(instance => {
                instance.show();
            });
        }

        this.refresh();

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
        this.container.dataset.size = `${this.size}`;

        if (this.fullscreen) {
            this.container.classList.add('focus');
        } else {
            this.container.classList.remove('focus');
        }

        if (this.collapsed) {
            collapse(this.container);
        } else {
            expand(this.container);
        }

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-concept", `editor-concept--${this.ctype}`],
                tabindex: -1,
                dataset: {
                    nature: "concept-container",
                    type: this.ctype,
                    size: 1,
                }
            });
        }

        const { name } = this.concept;

        if (!isHTMLElement(this.header)) {
            this.header = createHeader({
                class: ["editor-concept-header"],
            });

            fragment.append(this.header);
        }

        fragment.append(this.projection.render());

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                class: ["btn", "editor-concept-toolbar__btn-delete"],
                title: `Delete ${name.toLowerCase()}`,
                dataset: {
                    action: `close`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        if (!isHTMLElement(this.btnCollapse)) {
            this.btnCollapse = createButton({
                class: ["btn", "editor-concept-toolbar__btn-collapse"],
                title: `Collapse ${name.toLowerCase()}`,
                dataset: {
                    action: `collapse`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        if (!isHTMLElement(this.btnMaximize)) {
            this.btnMaximize = createButton({
                class: ["btn", "editor-concept-toolbar__btn-maximize"],
                title: `Maximize ${name.toLowerCase()}`,
                dataset: {
                    action: `maximize`,
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
        }, [this.btnCollapse, this.btnMaximize, this.btnClose]);

        removeChildren(this.header).append(title, toolbar);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        makeResizable(this.container);

        this.refresh();

        return this.container;
    },



    actionHandler(name) {
        switch (name) {
            case "collapse":
                this.collapse();
                break;
            case "maximize":
                this.maximize();
                break;
            case "close":
                this.delete();
                break;

            default:
                break;
        }
    },

    delete() {
        switch (this.schema.close) {
            case "DELETE-CONCEPT":
                if (!this.concept.delete(true)) {
                    this.editor.notify("The concept could not be deleted", NotificationType.ERROR);
                    return this;
                }
                break;
            case "DELETE-PROJECTION":
                if (!this.projection.delete()) {
                    this.notify("The projection could not be deleted", NotificationType.ERROR);
                    return this;
                }
                break;

            default:
                break;
        }

        removeChildren(this.container).remove();

        this.editor.removeInstance(this.id);
    },

    bindEvents() {
        this.container.addEventListener('focusin', (event) => {
            this.editor.updateActiveInstance(this);
        });
    }
};