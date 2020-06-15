import { Field } from "./field.js";
import { createSpan, addAttributes, valOrDefault, isEmpty, createUnorderedList, createListItem, removeChildren, isNullOrWhitespace, createDocFragment, createDiv, appendChildren } from "zenkai";
import { extend } from "@utils/index.js";


export const LinkField = extend(Field, {
    init() {
        this.validators = [];

        var validator = function () {
            return true;
        };

        this.placeholder = this.resolvePlaceholder();
        this.validators.push(validator);

        return this;
    },
    resolvePlaceholder() {
        if (this.schema.placeholder) {
            return this.schema.placeholder;
        }
        if (this.concept) {
            return this.concept.getName();
        }

        return "Select reference";
    },
    placeholder: null,
    object: "REFERENCE",
    results: null,

    createInput() {
        var container = createDiv({ class: "field-wrapper" });
        this.element = createSpan({
            id: this.id,
            class: ["field", "field--textbox"],
            html: "",
            dataset: {
                nature: "attribute",
                type: this.object,
                placeholder: this.placeholder
            }
        });
        this.element.contentEditable = true;
        this.element.tabIndex = 0;

        if (this.concept.value) {
            this.element.textContent = this.concept.value;
        } else {
            this.element.classList.add("empty");
        }
        this.results = createUnorderedList({ class: ["bare-list", "choice-results", "hidden"] });
        this.results.tabIndex = 0;

        appendChildren(container, [this.element, this.results]);

        this.bindEvents();

        return container;
    },
    bindEvents() {
        var lastKey = -1;

        const concept = this.concept;

        // Create fields
        var DATA = [];

        const createChoice = (value, text) => createListItem({ class: "choice-result-item", dataset: { value: value } }, text);
        const getInputValue = () => this.element.textContent.trim();
        const filterDATA = (query) => DATA.filter(val => query.some(q => val.name.toLowerCase().includes(q.toLowerCase())));


        // Fill in results
        DATA.forEach(x => { this.results.appendChild(createChoice(x.id, x.uniqueAttribute.getValue() || x.name)); });

        // Bind events
        this.results.addEventListener('click', (e) => {
            let target = e.target;
            let { value } = target.dataset;

            if (value) {
                concept.update(value);
                this.element.textContent = target.textContent;
                this.results.classList.add('hidden');
            }
        });
        this.element.addEventListener('focusin', (e) =>  DATA = concept.getRefCandidates());
        this.element.addEventListener('input', (e) => {
            removeChildren(this.results);
            if (this.element.textContent.length > 0) {
                this.element.classList.remove('empty');
            } else {
                this.element.classList.add('empty');
            }
            var fragment = createDocFragment();
            if (isNullOrWhitespace(getInputValue())) {
                DATA.forEach(x => { fragment.appendChild(createChoice(x.id, x.uniqueAttribute.getValue() || x.name)); });
                this.results.classList.add('hidden');
            } else {
                let query = getInputValue().split(' ');
                filterDATA(query).forEach(x => { fragment.appendChild(createChoice(x.id, x.uniqueAttribute.getValue() || x.name)); });
                this.results.classList.remove('hidden');
            }
            this.results.appendChild(fragment);
        });
    }
});