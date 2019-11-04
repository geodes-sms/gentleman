import { Field } from "./field.js";
import { createSpan, addAttributes, valOrDefault, isEmpty, isNullOrWhitespace, removeClass, addClass } from "zenkai";
import { Key } from "@global/enums.js";


export const StringField = Field.create({
    /**
     * Creates a string field
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
    object: "STRING",

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
            console.log('click');
        });

        this.element.addEventListener('input', function (event) {
            if (this.textContent.length > 0) {
                removeClass(this, 'empty');
            } else {
                addClass(this, 'empty');
            }
        });

        this.element.addEventListener('focusin', function (event) {
         
        });

        this.element.addEventListener('focusout', function (event) {
            if (!concept.update(this.textContent)){
                console.error("String concept could not be updated");
            }
        });
    }
});