import {
    createDocFragment, createDiv, createH3, createButton, createHeader,
    removeChildren, isHTMLElement, valOrDefault, isNullOrUndefined, isEmpty,
} from 'zenkai';
import { show, hide, toggle, NotificationType, makeResizable } from '@utils/index.js';


var inc = 0;
const nextId = () => `window${inc++}`;

export const EditorWindowManager = {
    /**
     * Creates a window
     * @param {string} name 
     * @returns {EditorWindow}
     */
    createWindow(name) {
        let window = Object.create(EditorWindow, {
            id: { value: nextId() },
            object: { value: "environment" },
            name: { value: "editor-window" },
            type: { value: "window" },
            editor: { value: this }
        });

        window.refname = name;
        window.init();

        this.addWindow(window);

        return window;
    },
    /**
     * Gets a window in the editor with the given ID
     * @param {string} id 
     * @returns {EditorWindow}
     */
    getWindow(id) {
        return this.windows.get(id);
    },
    /**
     * Finds a window in the editor with the given name
     * @param {string} name 
     * @returns {EditorWindow}
     */
    findWindow(name) {
        let windows = Array.from(this.windows.values());

        return windows.find(window => window.refname === name);
    },
    /**
     * Adds window to editor
     * @param {EditorWindow} window 
     * @returns {HTMLElement}
     */
    addWindow(window) {
        if (!window.isRendered) {
            this.body.append(window.render());
        }

        this.windows.set(window.id, window);

        if (this.status.view === "tab") {
            this.status.addView(window);
        }

        this.refresh();

        return this;
    },
    /**
     * Removes a window from the editor
     * @param {string} id 
     * @returns {boolean}
     */
    removeWindow(id) {
        let window = this.getWindow(id);

        if (isNullOrUndefined(window)) {
            return false;
        }

        if (window === this.activeWindow) {
            this.activeWindow = null;
        }

        if (window.view) {
            removeChildren(window.view).remove();
        }

        this.windows.delete(id);

        this.refresh();

        return true;
    },
    moveWindow(item, index) {
        this.body.children[index].before(item);

        return this;
    },
    swapWindow(item1, item2) {
        let windows = Array.from(this.body.children);
        const index1 = windows.indexOf(item1);
        const index2 = windows.indexOf(item2);

        this.moveWindow(item2, index1);
        this.moveWindow(item1, index2);

        return this;
    }
};

export const EditorWindow = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,
    /** @type {Set} */
    instances: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {number} */
    maxInstance: 1,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.ctype = valOrDefault(args.type, "concept");
        this.schema = args;
        this.instances = new Set();

        return this;
    },

    isEmpty() {
        return this.instances.size === 0;
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
    close() {
        removeChildren(this.container).remove();

        this.editor.removeWindow(this.id);
    },
    refresh() {
        if (this.isEmpty()) {
            this.hide();
        } else {
            this.show();
        }

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-window"],
                tabindex: -1
            });
        }

        if (!isHTMLElement(this.header)) {
            this.header = createHeader({
                class: ["editor-window-header"],
            });

            fragment.append(this.header);
        }

        if (!isHTMLElement(this.title)) {
            this.title = createH3({
                class: ["title", "editor-window-title", "fit-content"],
            });
        }

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                class: ["btn", "editor-window-header__btn-delete"],
                title: `Close the window`,
                dataset: {
                    action: `close`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        let toolbar = createDiv({
            class: ["editor-window-toolbar"],
        }, [this.btnClose]);

        removeChildren(this.header).append(this.title, toolbar);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },


    getInstance(id) {
        if (isNullOrUndefined(id)) {
            return null;
        }
        return Array.from(this.instances).find(instance => instance.id === id);
    },
    addInstance(instance) {
        if (isNullOrUndefined(instance)) {
            return;
        }
        if (this.instances.has(instance)) {
            return;
        }

        this.instances.add(instance);
        instance.window = this;
        this.container.append(instance.container);

        this.refresh();

        return true;
    },

    removeInstance(instance) {
        if (isNullOrUndefined(instance)) {
            return;
        }

        if (!this.instances.has(instance)) {
            return;
        }

        this.instances.delete(instance);

        this.refresh();

        return true;
    },

    actionHandler(name) {
        switch (name) {
            case "close":
                this.close();
                break;

            default:
                break;
        }
    },

    bindEvents() {
    }
};