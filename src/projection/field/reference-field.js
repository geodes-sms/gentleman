import { Field } from "./field.js";
import { createSpan, addAttributes, valOrDefault, isEmpty, isNullOrWhitespace } from "zenkai";
import { Key } from "@global/enums.js";
import { extend } from "@utils/index.js";


export const ReferenceField = extend(Field, {
    /**
     * Creates a reference field
     * @param {Concept} concept
     * @returns {StringField} 
     */
    create(concept) {
        var instance = Object.create(this);

        instance.concept = concept;
        instance.placeholder = valOrDefault(concept.placeholder, "Enter data");

        return instance;
    },
    init() {
        var validator = function () {
            return true;
        };

        this.validators.push(validator);
    },
    placeholder: null,
    object: "REFERENCE",

    createInput() {
        this.element = createSpan({
            id: this.id,
            class: ['attr', 'empty'],
            html: "",
            data: {
                nature: "attribute",
                type: this.object,
                placeholder: this.placeholder
            }
        });
        this.element.contentEditable = true;
        this.element.tabIndex = 0;

        this.bindEvents();

        return this.element;
    },
    bindEvents() {
        var lastKey = -1;

        const concept = this.concept;

        this.element.addEventListener('click', function (event) {
        });

        this.element.addEventListener('input', function (event) {
            if (this.textContent.length > 0) {
                this.classList.remove('empty');
            } else {
                this.classList.add('empty');
            }
        });

        this.element.addEventListener('focusin', function (event) {
            var candidates = concept.getRefCandidates();

            console.log(`Select the concept that will begin your model: ${candidates}`);
        });

        this.element.addEventListener('focusout', function (event) {
            if (!concept.update(this.textContent)){
                console.error("String concept could not be updated");
            }
        });
    }
});