import {
    createDocFragment, createDiv, createI, createSpan, createUnorderedList, createListItem,
    removeChildren, isHTMLElement, valOrDefault, isNullOrUndefined, isEmpty, getElement
} from 'zenkai';
import { show, hide, toggle, collapse, expand, NotificationType } from '@utils/index.js';




/**
 * Createa a selector item
 * @param {string} type 
 * @param {Concept} concept 
 * @returns {HTMLElement}
 */
function createSelectorItem(type, concept) {
    const { name, object, id } = concept;

    /** @type {HTMLElement} */
    const item = createListItem({
        class: ["selector-concept", `selector-concept--${type}`],
        title: concept.getName(),
        dataset: {
            concept: id,
            object: object
        }
    });


    /** @type {HTMLElement} */
    var content = createSpan({
        class: ["selector-concept-content"],
    }, concept.getName());

    item.append(content);

    if (type === "ancestor") {
        content.classList.add("fit-content");
    }

    const status = createI({
        class: ["selector-concept-status"]
    });

    if (concept.hasError) {
        status.classList.add("error");
        let errorList = createUnorderedList({
            class: ["bare-list", "selector-concept-status__errors"]
        });
        concept.errors.forEach(error => {
            let element = createListItem({ class: ["selector-concept-status__error"] }, error);
            element.style.minWidth = `${Math.min(error.length * 0.5, 30)}em`;

            errorList.append(element);
        });
        status.append(errorList);

        item.classList.add("error");
    } else {
        status.classList.add("valid");
        item.classList.add("valid");
    }

    item.append(status);

    item.addEventListener("mouseenter", (event) => {
        let targetProjection = getElement(`.projection[data-concept="${id}"]`, this.editor.body);
        if (targetProjection) {
            this.editor.highlight(targetProjection);
        }
    });

    item.addEventListener("mouseleave", (event) => {
        this.editor.unhighlight();
    });

    item.addEventListener("click", (event) => {
        let targetProjection = getElement(`.projection[data-concept="${id}"]`, this.editor.body);
        if (targetProjection) {
            targetProjection.focus();
        }
    });

    return item;
}

export const EditorBreadcrumb = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,

    /** @type {HTMLElement} */
    conceptList: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.schema = args;

        return this;
    },

    update() {

    },
    refresh() {
        const { activeInstance, activeConcept, hasActiveInstance, hasActiveConcept } = this.editor;
        
        if (!hasActiveInstance || !hasActiveConcept) {
            removeChildren(this.conceptList);
            return this;
        }

        const rootConcept = activeInstance.concept;

        const fragment = createDocFragment();

        let item = createSelectorItem.call(this, "root", rootConcept);
        fragment.append(item);

        if (rootConcept === activeConcept) {
            item.classList.add(`selector-concept--active`);
        }

        if (rootConcept === activeConcept) {
            removeChildren(this.conceptList).append(fragment);
            return this;
        }

        if (!activeConcept.hasParent()) {
            removeChildren(this.conceptList).append(fragment);
            return this;
        }

        let parent = activeConcept.getParent();

        let ancestors = [];

        while (parent && parent !== rootConcept) {
            ancestors.unshift(parent);
            parent = parent.getParent();
        }

        ancestors.forEach(concept => {
            fragment.append(createSelectorItem.call(this, "ancestor", concept));
        });

        item = createSelectorItem.call(this, "active", activeConcept);
        fragment.append(item);

        removeChildren(this.conceptList).append(fragment);

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-breadcrumb"]
            });
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["notification", "breadcrumb-notification"]
            });

            fragment.append(this.notification);
        }

        const title = createSpan({
            class: ["breadcrumb-title", "hidden"],
            dataset: {
                "ignore": "all",
            }
        }, "Breadcrumb");

        fragment.append(title);

        if (!isHTMLElement(this.conceptList)) {
            this.conceptList = createUnorderedList({
                class: ["bare-list", "selector-concepts"]
            });

            fragment.append(this.conceptList);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.update();
        this.refresh();

        return this.container;
    },


    bindEvents() {

    }
};