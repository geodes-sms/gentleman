import {
    createDocFragment, createDiv, createParagraph, createAnchor, createInput,
    isHTMLElement, createUnorderedList, createListItem, createI, removeChildren, createEmphasis, getElement, createSpan,
} from 'zenkai';
import { hide, show, toggle, LogType } from '@utils/index.js';


/**
 * 
 * @param {string} word 
 * @param {number} pred 
 * @returns 
 */
function pluralize(word, suffix, pred) {
    if (pred === 1) {
        return word;
    }

    let parts = suffix.split("|");

    if (parts.length === 1) {
        return word + parts[0];
    }

    return word.substring(0, word.lastIndexOf(parts[0])) + parts[1];
}

export const EditorStatus = {
    /** @type {HTMLElement} */
    modelstatus: null,
    /** @type {HTMLElement} */
    notification: null,
    view: "grid",
    /** @type {HTMLElement} */
    viewItem: null,
    /** @type {HTMLElement} */
    viewList: null,
    /** @type {HTMLElement} */
    activeViewItem: null,
    /** @type {Map} */
    views: null,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLElement} */
    container: null,

    get isRendered() { return isHTMLElement(this.container); },

    init() {
        this.views = new Map();

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
    refresh() {
        const { conceptModel } = this.editor;

        if (!this.editor.isReady) {
            return;
        }

        if (conceptModel.hasError) {
            this.modelstatusBadge.classList.add("error");
            this.modelstatusBadge.classList.remove("valid");
            let errorCount = conceptModel.concepts.filter(c => c.hasError).length;
            this.modelstatusInfo.textContent = `${errorCount} ${pluralize("error", "s", errorCount)}`;

            // let errorList = createUnorderedList({
            //     class: ["bare-list", "selector-concept-status__errors"]
            // });
            // concept.errors.forEach(error => {
            //     let element = createListItem({ class: ["selector-concept-status__error"] }, error);
            //     errorList.append(element);
            // });
            // status.append(errorList);
        } else {
            this.modelstatusBadge.classList.add("valid");
            this.modelstatusBadge.classList.remove("error");
            removeChildren(this.modelstatusInfo);
        }

    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-statusbar"]
            });
        }

        // if (!isHTMLElement(this.notification)) {
        //     this.notification = createDiv({
        //         class: ["notification", "editor-statusbar-notification"]
        //     });

        //     fragment.appendChild(this.notification);
        // }

        if (!isHTMLElement(this.modelstatus)) {
            this.modelstatus = createDiv({
                class: ["editor-statusbar-model"]
            });

            this.modelstatusBadge = createI({
                class: ["editor-statusbar-model-badge"]
            });

            this.modelstatusInfo = createDiv({
                class: ["editor-statusbar-model-info"],
            });

            this.modelstatus.append(this.modelstatusBadge, this.modelstatusInfo);

            fragment.appendChild(this.modelstatus);
        }

        if (!isHTMLElement(this.viewList)) {
            this.viewList = createDiv({
                class: ["bare-list", "editor-statusbar-viewers"]
            });

            fragment.appendChild(this.viewList);
        }

        ["tab", "grid", "row"].forEach(name => {
            let view = createListItem({
                class: ["editor-statusbar-viewer"],
                dataset: {
                    type: "viewer",
                    action: "change-view",
                    value: name
                }
            }, name);

            this.views.set(name, view);
            this.viewList.append(view);
        });

        this.viewItem = this.views.get(this.view);
        this.viewItem.classList.add("selected");

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    bindEvents() {
        function createProjectionLink(text, conceptId) {
            let link = createEmphasis({
                class: ["link", "error-message__link"]
            }, text);

            const targetSelector = `.projection[data-concept="${conceptId}"]`;

            link.addEventListener("mouseenter", (event) => {
                let targetProjection = getElement(targetSelector, this.editor.body);
                if (targetProjection) {
                    this.editor.highlight(targetProjection);
                }
            });

            link.addEventListener("mouseleave", (event) => {
                this.editor.unhighlight();
            });

            link.addEventListener("click", (event) => {
                let target = this.editor.resolveElement(getElement(targetSelector, this.editor.body));

                if (target) {
                    target.focus();
                }
            });

            return link;
        }


        this.modelstatus.addEventListener('click', (event) => {
            if (!this.editor.conceptModel.hasError) {
                return;
            }

            let errors = [];
            this.editor.conceptModel.concepts.forEach(concept => {
                if (concept.hasError) {
                    errors.push(...concept.errors.map(error => {
                        let link = createProjectionLink.call(this, concept.getName(), concept.id);
                        let message = createSpan({
                            class: ["error-message"]
                        }, [link, `: ${error}`]);
                        return message;
                    }));
                }
            });
            this.editor.logs.clear();
            this.editor.logs.add(errors, "Validation error", LogType.ERROR);
        });
    }
};

function createNotificationMessage(message) {
    return message;
}