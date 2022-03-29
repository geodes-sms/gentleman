import {
    createDocFragment, createDiv, createUnorderedList, createListItem, createI,
    createEmphasis, createButton, createSpan, removeChildren, getElement, isHTMLElement,
    findAncestor, isNullOrUndefined
} from 'zenkai';
import { hide, show, toggle, LogType, select, unselect, shake } from '@utils/index.js';


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
    editorstatus: null,
    /** @type {HTMLElement} */
    notification: null,
    /** @type {Map} */
    views: null,
    /** @type {string} */
    view: "grid",
    /** @type {HTMLElement} */
    viewContainer: null,
    /** @type {HTMLElement} */
    viewList: null,
    /** @type {HTMLElement} */
    viewItem: null,
    /** @type {HTMLElement} */
    activeViewItem: null,
    /** @type {HTMLElement} */
    groupList: null,
    /** @type {HTMLElement} */
    groupItem: null,
    /** @type {HTMLElement} */
    activeGroupItem: null,


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


    updateActiveView() {
        if (this.view === "tab") {
            this.editor.instances.forEach(instance => {
                if (instance !== this.editor.activeInstance) {
                    instance.view.classList.remove("active");
                    instance.hide();
                }
            });

            this.editor.activeInstance.view.classList.add("active");
            this.editor.activeInstance.show();
        }

        this.editor.refresh();
    },
    addView(instance) {
        if (isNullOrUndefined(instance)) {
            return false;
        }

        let content = instance.title.textContent;

        let icoDelete = createI({
            class: ["ico", "ico-delete"]
        }, "✖");

        let btnDelete = createButton({
            class: ["btn", "btn-close"]
        }, icoDelete);

        let container = createDiv({
            class: [`editor-view-${this.view}list-item__content`, "fit-content"]
        }, content);

        let item = createListItem({
            class: [`editor-view-${this.view}list-item`],
            title: instance.title.textContent
        }, [container, btnDelete]);

        instance.view = item;

        /**
         * Resolves the target
         * @param {HTMLElement} element 
         * @returns {HTMLElement}
         */
        function resolveTarget(element) {
            const isValid = (el) => el === item || el === btnDelete;
            if (isValid(element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid(el), 5);
        }

        item.addEventListener("click", (event) => {
            let target = resolveTarget(event.target);

            if (target === btnDelete) {
                let next = item.previousSibling || item.nextSibling;
                instance.delete();
                if (this.editor.activeInstance === null && next) {
                    next.click();
                }
            } else {
                this.editor.updateActiveInstance(instance);
            }
        });

        this.tabView.append(item);
    },
    changeView(value) {
        if (value === this.view) {
            return this;
        }

        this.view = value;
        unselect(this.viewItem);
        this.viewItem = this.views.get(this.view);
        select(this.viewItem);

        removeChildren(this.editor.viewSection);

        if (value === "tab") {
            this.tabView = createUnorderedList({
                class: ["bare-list", "editor-view-tablist"]
            });

            removeChildren(this.tabView);

            this.editor.instances.forEach(instance => {
                instance.expand();
                this.addView(instance);
            });

            this.editor.viewSection.append(this.tabView);
        } else if (value === "grid") {
            this.editor.instances.forEach(instance => {
                instance.show();
            });
        }

        this.updateActiveView();
    },
    addGroup() {
        let item = createListItem({
            class:["editor-footer-group"]
        });
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
            this.container.classList.add("error");
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
            this.container.classList.remove("error");
            removeChildren(this.modelstatusInfo);
            this.editor.logs.clear();
        }

        if (this.editor.hasError) {
            this.editorstatusBadge.classList.add("error");
            this.editorstatusBadge.classList.remove("valid");
            this.container.classList.add("error");
            let errorCount = this.editor.errors.length;
            this.editorstatusInfo.textContent = `${errorCount}`;
        } else {
            this.editorstatusBadge.classList.add("valid");
            this.editorstatusBadge.classList.remove("error");
            this.container.classList.remove("error");
            removeChildren(this.editorstatusInfo);
            this.editor.logs.clear();
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

        if (!isHTMLElement(this.badgeContainer)) {
            this.badgeContainer = createDiv({
                class: ["editor-statusbar-badge-container"]
            });

            fragment.appendChild(this.badgeContainer);
        }

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

            this.badgeContainer.appendChild(this.modelstatus);
        }

        if (!isHTMLElement(this.editorstatus)) {
            this.editorstatus = createDiv({
                class: ["editor-statusbar-global"]
            });

            this.editorstatusBadge = createI({
                class: ["editor-statusbar-global-badge"]
            });

            this.editorstatusInfo = createDiv({
                class: ["editor-statusbar-global-info"],
            });

            this.editorstatus.append(this.editorstatusBadge, this.editorstatusInfo);

            this.badgeContainer.appendChild(this.editorstatus);
        }

        if (!isHTMLElement(this.viewContainer)) {
            this.viewContainer = createDiv({
                class: ["editor-statusbar-viewer-container"]
            });

            fragment.appendChild(this.viewContainer);
        }

        // if (!isHTMLElement(this.groupList)) {
        //     this.groupList = createUnorderedList({
        //         class: ["bare-list", "editor-statusbar-groups"]
        //     });

        //     fragment.appendChild(this.groupList);
        // }

        if (!isHTMLElement(this.btnGroup)) {
            let ico = createI({
                class: ["ico", "ico-plus", "btn-content"],
                title: `Add a group`,
                dataset: {
                    ignore: "all",
                }
            }, "+");
            this.btnGroup = createButton({
                class: ["editor-statusbar-viewer__button-add"],
                dataset: {
                    action: "add-group"
                }
            }, ico);

            // this.viewContainer.appendChild(this.btnGroup);
        }

        if (!isHTMLElement(this.groupContainer)) {
            this.groupContainer = createDiv({
                class: ["editor-footer-group"],
            });
        }

        if (!isHTMLElement(this.viewList)) {
            this.viewList = createUnorderedList({
                class: ["bare-list", "editor-statusbar-viewers"]
            });

            this.viewContainer.appendChild(this.viewList);
        }

        ["grid", "tab"].forEach(name => {
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

        this.editorstatus.addEventListener('click', (event) => {
            if (!this.editor.hasError) {
                return;
            }

            let errors = [];
            errors.push(...this.editor.errors.map(error => {
                let message = createSpan({
                    class: ["error-message"]
                }, [`${error.message}`]);

                return message;
            }));
            this.editor.logs.clear();
            this.editor.logs.add(errors, "Validation error", LogType.ERROR);
        });

        this.editor.registerHandler("editor.instance@active:updated", () => {
            this.updateActiveView();
        });
    }
};

function createNotificationMessage(message) {
    return message;
}