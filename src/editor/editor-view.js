
import {
    createDocFragment, createDiv, createButton, createSpan, createParagraph, removeChildren,
    isHTMLElement, isNullOrUndefined, valOrDefault, createUnorderedList, createListItem,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';


export const EditorView = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {Editor} */
    editor: null,
    /** @type {Map} */
    tabs: null,
    /** @type {HTMLElement} */
    activeTab: null,

    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,

    get isRendered() { return isHTMLElement(this.container); },

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

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
    clear() {
        removeChildren(this.container);

        return this;
    },

    /**
     * Gets the declared actions
     * @returns {*[]}
     */
    getActions() {
        return valOrDefault(this.schema.actions, []);
    },

    update(schema) {
        if (schema) {
            this.schema = schema;
        }

        const { actions = [] } = this.schema;

        const fragment = createDocFragment();

        actions.filter(action => valOrDefault(action.default, true))
            .forEach(action => {
                const { name, content, help } = action;

                let button = createButton({
                    class: ["btn", "menu-action__button"],
                    title: help,
                    dataset: {
                        "action": name,
                        context: this.type,
                    }
                }, valOrDefault(content, name));

                let item = createListItem({
                    class: ["menu-action-list-item"]
                }, button);

                fragment.append(item);
            });

        removeChildren(this.actionList).append(fragment);

        this.schema = schema;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["menu"],
                draggable: true,
                title: "Click to access the editor actions",
                dataset: {
                    action: "menu.click"
                }
            });
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["notification", "menu-notification"]
            });

            fragment.appendChild(this.notification);
        }

        const title = createSpan({
            class: ["menu-title"],
            dataset: {
                "ignore": "all",
            }
        }, "Menu");

        fragment.append(title);

        if (!isHTMLElement(this.actionList)) {
            this.actionList = createUnorderedList({
                class: ["bare-list", "menu-action-list"]
            });

            fragment.append(this.actionList);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.update();
        this.refresh();

        return this.container;
    },
    refresh() {
        if (!this.editor.isReady) {
            this.hide();
        } else {
            this.show();
        }

        return this;
    },


    actionHandler(name) {
        let action = this.getActions().find(action => action.name === name);

        if (isNullOrUndefined(action)) {
            return false;
        }

        this.editor.triggerEvent(action);

        return true;
    },

    bindEvents() {
        this.editor.registerHandler("menu.click", () => this.isOpen ? this.close() : this.open());
    }
};

