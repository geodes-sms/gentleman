import {
    createDocFragment, createDiv, createButton, createSpan, removeChildren,
    isHTMLElement, isNullOrUndefined, hasOwn, findAncestor
} from 'zenkai';
import {  hide, show,  getEventTarget } from '@utils/index.js';


/**
 * @returns {HTMLElement}
 */
export const ProjectionWindow = {
    projection: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    content: null,
    /** @type {HTMLButtonElement} */
    btnChange: null,
    /** @type {HTMLButtonElement} */
    btnSearch: null,

    setProjection(projection) {
        if (this.projection !== projection) {
            this.projection = projection;
        }

        this.refresh();
    },
    refresh() {
        if (isNullOrUndefined(this.projection)) {
            this.content.textContent = "N/A";
            this.btnChange.disabled = true;
            this.btnSearch.disabled = true;

            return;
        }

        this.content.textContent = this.projection.id;

        this.btnChange.disabled = !this.projection.hasMultipleViews;

        return this;
    },
    clear() {
        removeChildren(this.content);

        return this;
    },
    show() {
        show(this.container);
        return this;
    },
    hide() {
        hide(this.container);
        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["projection-window"],
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

        fragment.appendChild(title);

        if (!isHTMLElement(this.content)) {
            this.content = createDiv({
                class: ["projection-window-content"]
            });

            fragment.appendChild(this.content);
        }

        this.btnChange = createButton({
            class: ["btn", "projection-window-button", "projection-window-button-change"],
            dataset: {
                "context": "projection",
                "action": "change",
            }
        }, "Change");

        fragment.appendChild(this.btnChange);

        this.btnSearch = createButton({
            class: ["btn", "projection-window-button", "projection-window-button-search"],
            dataset: {
                "context": "projection",
                "action": "search"
            }
        }, "Search");

        fragment.appendChild(this.btnSearch);


        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);

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

