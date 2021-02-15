
import {
    createDocFragment, createDiv, createButton, createSpan, removeChildren,
    isHTMLElement, isNullOrUndefined, valOrDefault, createUnorderedList, createListItem,
} from 'zenkai';
import { hide, show } from '@utils/index.js';



/**
 * @returns {HTMLElement}
 */
export const EditorMenu = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    actionList: null,
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    show() {
        show(this.container);
        this.isVisible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.isVisible = false;

        return this;
    },
    open() {
        this.container.classList.add("open");
        this.isOpen = true;

        return this;
    },
    close() {
        this.container.classList.remove("open");
        this.isOpen = false;

        return this;
    },

    clear() {
        removeChildren(this.container);

        return this;
    },
    update(schema) {
        if (isNullOrUndefined(schema)) {
            return this;
        }

        const { actions } = schema;

        const fragment = createDocFragment();

        actions.filter(action => valOrDefault(action.default, true))
            .forEach(action => {
                const { name, content, downloadable, handler } = action;

                let button = createButton({
                    class: ["btn", "menu-action__button"],
                    dataset: {
                        "action": name,
                        "downloadable": downloadable,
                        "handler": true
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
                title: "Click to access the editor actions"
            });
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

        this.refresh();

        return this.container;
    },
    refresh() {

        return this;
    },

    bindEvents() {
        this.container.addEventListener('click', (event) => {
            this.isOpen ? this.close() : this.open();
        });
    }
};
