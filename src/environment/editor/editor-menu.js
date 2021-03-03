
import {
    createDocFragment, createDiv, createButton, createSpan, createParagraph, removeChildren,
    isHTMLElement, isNullOrUndefined, valOrDefault, createUnorderedList, createListItem,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';


export const EditorMenu = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    actionList: null,
    /** @type {HTMLElement} */
    notification: null,
    /** @type {*} */
    schema: null,
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
    open() {
        if (this.actionList.childElementCount === 0) {
            this.notify("The menu is empty", 1500);

            return this;
        }

        this.container.classList.add("open");
        this.show();
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
        if (schema) {
            this.schema = schema;
        }

        const { actions } = this.schema;

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
    /**
     * Diplays a notification message
     * @param {string} message 
     * @param {NotificationType} type 
     */
    notify(message, time = 4500) {
        let notify = createNotificationMessage(message);

        const CSS_OPEN = "open";

        if (this.notification.classList.contains(CSS_OPEN)) {
            return false;
        }

        this.notification.appendChild(notify);

        setTimeout(() => {
            this.notification.classList.add(CSS_OPEN);
            this.container.classList.add("menu--notifying");
        }, 50);

        setTimeout(() => {
            this.notification.classList.remove(CSS_OPEN);
            this.container.classList.remove("menu--notifying");
            setTimeout(() => { removeChildren(this.notification); }, 500);
        }, time);
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["menu"],
                draggable: true,
                title: "Click to access the editor actions",
                dataset: {
                    action: "menu.click",
                    handler: true,
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

    bindEvents() {
        this.editor.registerHandler("menu.click", () => this.isOpen ? this.close() : this.open());
    }
};


/**
 * Creates a notification message
 * @param {string} type 
 * @param {string} message 
 * @returns {HTMLElement}
 */
function createNotificationMessage(message, type = "normal") {
    var element = createSpan({
        class: ["notification-message", `notification-message--${type}`]
    }, message);

    if (Array.isArray(message)) {
        element.style.minWidth = `${Math.min(message[0].length * 0.6, 30)}em`;
    } else {
        element.style.minWidth = `${Math.min(message.length * 0.6, 30)}em`;
    }

    return element;
}