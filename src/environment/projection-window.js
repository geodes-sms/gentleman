import {
    createDocFragment, createDiv, createButton, createSpan, removeChildren,
    isHTMLElement, isNullOrUndefined, hasOwn, findAncestor, createUnorderedList, createListItem
} from 'zenkai';
import { hide, show, toggle, getEventTarget } from '@utils/index.js';


/**
 * @returns {HTMLElement}
 */
export const ProjectionWindow = {
    projection: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    content: null,
    /** @type {HTMLElement} */
    views: null,
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
    update(schema) {
        if (schema) {
            this.schema = schema;
        }

        this.schema = schema;
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
        removeChildren(this.content);

        return this;
    },

    refresh() {
        const { activeProjection } = this.editor;

        if (isNullOrUndefined(activeProjection)) {
            this.content.textContent = "N/A";
            removeChildren(this.views);

            return;
        }

        removeChildren(this.views);
        activeProjection.schema.forEach(element => {
            this.views.append(createListItem({
                class: ["projection-window-view"],
            }, "VIEW"));
        });

        this.content.textContent =activeProjection.id;

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["projection-window", "hidden"],
                draggable: true,
                title: "Click to handle projection"
            });
        }

        const title = createSpan({
            class: ["projection-window-title"],
            dataset: {
                "ignore": "all",
            }
        }, "Projection");

        fragment.append(title);

        if (!isHTMLElement(this.content)) {
            this.content = createDiv({
                class: ["projection-window-content"]
            });

            fragment.append(this.content);
        }

        if (!isHTMLElement(this.views)) {
            this.views = createUnorderedList({
                class: ["bare-list", "projection-window-views"],
            });
    
            fragment.append(this.views);
        }

        fragment.append(this.btnChange);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    bindEvents() {
        this.container.addEventListener('click', (event) => {
            var target = getEventTarget(event.target);

            const { action } = target.dataset;

            if (action === "change") {
                this.projection.changeView();
            } else if (action === "search") {
                // this.projection.getView();
            } else if (action === "style") {
                this.openStyle();
            }
        });
    }
};
