import {
    createDocFragment, createDiv, createI, createSpan, createUnorderedList, createListItem,
    removeChildren, isHTMLElement, valOrDefault, isNullOrUndefined, isEmpty
} from 'zenkai';
import { show, hide, toggle, collapse, expand, NotificationType } from '@utils/index.js';




/**
 * Createa a selector item
 * @param {string} type 
 * @param {Concept} concept 
 * @returns {HTMLElement}
 */
const createSelectorItem = (type, concept) => {
    const { name, object } = concept;

    /** @type {HTMLElement} */
    const item = createListItem({
        class: ["selector-concept", `selector-concept--${type}`],
        dataset: {
            object: object
        }
    });

    var nature = createI({
        class: ["selector-concept-nature", "fit-content"]
    }, name);

    /** @type {HTMLElement} */
    var content = createSpan({
        class: ["selector-concept-content"],
    }, concept.getName());

    item.append(content);

    if (type === "ancestor") {
        content.classList.add("fit-content");
    }

    return item;
};

export const EditorBreadcrumb = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,

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
    update() {

    },
    refresh() {
        const { activeInstance, activeConcept, hasActiveInstance, hasActiveConcept } = this.editor;

        if (!hasActiveInstance) {
            removeChildren(this.conceptList);
            return this;
        }

        const rootConcept = activeInstance.concept;
        
        const fragment = createDocFragment();
        
        fragment.append(createSelectorItem("root", rootConcept));
        
        if (!hasActiveConcept || rootConcept === activeConcept) {
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
            fragment.append(createSelectorItem("ancestor", concept));
        });

        fragment.append(createSelectorItem("active", activeConcept));

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