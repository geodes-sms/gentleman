import {
    createUnorderedList, createListItem, createSpan, createDocFragment,
    isHTMLElement, isNullOrUndefined, createDiv, createI, removeChildren,
} from "zenkai";
import { shake } from "@utils/index.js";


const Nature = {
    PRIMITIVE: "E",
    CONCRETE: "C",
    PROTOTYPE: "P",
    DERIVATIVE: "D",
};

export const ModelConcept = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    schema: null,
    /** @type {HTMLElement} */
    name: null,
    /** @type {HTMLElement} */
    nature: null,
    /** @type {HTMLButtonElement} */
    prototype: null,
    /** @type {HTMLButtonElement} */
    btnCreate: null,
    /** @type {EditorInstance[]} */
    instances: null,
    /** @type {Map<string, HTMLElement>} */
    attributes: null,
    /** @type {string} */
    selectedAttribute: null,
    /** @type {HTMLElement[]} */
    extras: null,
    tag: "",

    init(schema) {
        this.schema = schema;
        this.instances = [];
        this.extras = [];
        this.attributes = new Map();

        if (schema.nature === "primitive") {
            this.tag = schema.name;
        }

        return this;
    },
    getName() { return this.schema.name; },
    addInstance(instance) {
        this.instances.push(instance);
    },

    render() {
        const { name, nature, attributes } = this.schema;

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-model-concept"]
            });
        }

        this.header = createDiv({
            class: ["app-model-concept-header"]
        });

        let natureElement = createI({
            class: ["app-model-concept-nature"],
            dataset: {
                name: nature
            }
        }, Nature[nature.toUpperCase()]);

        let nameElement = createSpan({
            class: ["app-model-concept-name"]
        }, name);

        this.header.append(natureElement, nameElement);

        let attributesElement = createUnorderedList({
            class: ["bare-list", "app-model-concept-attributes"]
        });

        if (Array.isArray(attributes)) {
            attributes.forEach(attr => {
                let element = createListItem({
                    class: ["app-model-concept-attribute"],
                    dataset: {
                        name: attr.name,
                        type: "attribute"
                    }
                }, attr.name);

                this.attributes.set(attr.name, element);

                attributesElement.append(element);
            });
        }

        this.body = createDiv({
            class: ["app-model-concept-body"]
        });

        // let projectionElement = createDiv({
        //     class: ["app-model-concept-projection"]
        // });
        // let title = createSpan({
        //     class: ["app-model-projection-title"]
        // }, "Projections: ");


        // projectionElement.append(title);
        this.body.append(attributesElement);

        this.container.append(this.header, this.body);

        this.bindEvents();

        return this.container;
    },
    select() {
        this.container.classList.add("selected");
        this.instances.forEach(instance => {
            instance.show();
        });
        this.refresh();
    },
    unselect() {
        this.container.classList.remove("selected");
        this.instances.forEach(instance => {
            instance.hide();
        });
        this.refresh();
    },
    selectAttribute(name) {
        if (isNullOrUndefined(name)) {
            return false;
        }

        if (this.selectedAttribute === name) {
            return false;
        }

        if (this.selectedAttribute) {
            let element = this.attributes.get(this.selectedAttribute);
            element.classList.remove("selected");
        }

        if (!this.attributes.has(name)) {
            return false;
        }

        this.selectedAttribute = name;
        let element = this.attributes.get(name);
        element.classList.add("selected");

        this.displayAttribute(name);

        this.refresh();

        return true;
    },
    displayAttribute(attrName) {
        const { name, target, required = true } = this.schema.attributes.find((attr) => attr.name === attrName);

        let nameElement = createSpan({
            class: ["app-model__attribute-name"]
        }, name);

        let header = createDiv({
            class: ["app-model__attribute-header"]
        }, [nameElement]);

        if (required) {
            let requiredElement = createI({
                class: ["app-model__attribute-required"]
            }, createSpan({ class: ["help"] }, "required"));

            header.append(requiredElement);
        }

        let targetElement = createDiv({
            class: ["app-model__attribute-target"]
        }, targetHandler(target));

        let infoElement = createDiv({
            class: ["app-model__attribute-info"]
        }, [header, targetElement]);

        this.body.append(infoElement);

        this.extras.forEach(element => removeChildren(element).remove());
        this.extras = [];
        this.extras.push(infoElement);

        this.refresh();
    },
    clear() {
        if (this.selectedAttribute) {
            let element = this.attributes.get(this.selectedAttribute);
            element.classList.remove("selected");
            this.selectedAttribute = null;
        }

        this.extras.forEach(element => removeChildren(element).remove());
        this.extras = [];

        this.refresh();
    },
    destroy() {
        removeChildren(this.container);
        this.container.remove();
    },
    refresh() {

    },
    bindEvents() {
        this.container.addEventListener("click", (event) => {
            this.parent.selectConcept(this);

            const { target } = event;
            const { type, name } = target.dataset;

            if (type === "attribute") {
                this.selectAttribute(name);
            } else if (type === "concept") {
                let result = this.parent.selectConcept(name);
                if (!result) { shake(target); }
            } else {
                this.clear();
            }
        });
    }
};

function targetHandler(target) {
    const fragment = createDocFragment();

    if (isNullOrUndefined(target)) {
        return fragment;
    }

    const { name, accept } = target;

    let nameElement = createSpan({
        class: ["target-name"],
        dataset: {
            type: "concept",
            name: name
        }
    }, name);

    fragment.append(nameElement);

    if (accept) {
        let acceptElement = createDiv({
            class: ["target-accept"]
        });

        if (Array.isArray(accept)) {
            acceptElement.append(...accept.map(schema => targetHandler(schema)));
            acceptElement.classList.add("array");
        } else {
            acceptElement.append(targetHandler(accept));
        }

        fragment.append(acceptElement);
    }

    return fragment;
}