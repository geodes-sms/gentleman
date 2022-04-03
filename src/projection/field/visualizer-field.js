import { createDocFragment, isHTMLElement, isNullOrUndefined, createDiv, createSpan, createInput, createTextArea, valOrDefault} from "zenkai";
import { Field } from "./field.js";
import { resolveValue } from "./../content-handler.js";
import { StyleHandler } from "./../style-handler.js";



function resolveInput(schema) {
    const { placeholder = "", type } = schema;

    let placeholderValue = resolveValue.call(this, placeholder);

    if (this.readonly || this.resizable) {
        return createSpan({
            class: ["field--textbox__input", "field--textbox__input-pseudo"],
            editable: !this.readonly,
            title: placeholderValue,
            dataset: {
                placeholder: placeholderValue,
                nature: "field-component",
                view: this.type,
                id: this.id,
            }
        });
    } else if (this.multiline) {
        return createTextArea({
            class: ["field--textbox__input"],
            placeholder: placeholderValue,
            title: placeholderValue,
            dataset: {
                nature: "field-component",
                view: this.type,
                id: this.id,
            }
        });
    }
    return createInput({
        class: ["field--textbox__input"],
        type: valOrDefault(type, "text"),
        placeholder: placeholderValue,
        title: placeholderValue,
        dataset: {
            nature: "field-component",
            view: this.type,
            id: this.id,
        }
    });
}

const BaseVisualizer = {
    init(){
        return this;
    },

    render(){
        const fragment = createDocFragment();

        const { current = {}} = this.schema;

        var parser = new DOMParser();

        if (!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                dataset: {
                    nature: "field",
                    view: "text",
                    id: this.id,
                }
            });
        }

        if(!isHTMLElement(this.content)){
            this.svg = this.source.value;

            if(!isNullOrUndefined(this.svg)){
                this.content = parser.parseFromString(this.svg.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                fragment.appendChild(this.content);
            }
        }

        if(!isHTMLElement(this.input)){
            const { placeholder = "", type, style } = current;

            this.input = resolveInput.call(this, current);
            
            if (this.disabled) {
                this.input.disabled = true;
            }

            if (this.focusable) {
                this.input.tabIndex = 0;
            } else {
                this.input.dataset.ignore = "all";
            }

            StyleHandler.call(this, this.input, style);

            if (this.multiline) {
                this.input.classList.add("field--textbox__input--multiline");
            }

            fragment.append(this.input);
        }

        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }

        this.bindEvent();

        return this.element;
    },

    bindEvent(){
        this.content.addEventListener("click", (event) => {
            var s = new XMLSerializer();
            var current = s.serializeToString(event.target);
            this.input.value = current;
            this.current = event.target;
        });

        this.input.addEventListener("keydown", (event) => {
            if((!isNullOrUndefined(this.current)) && (event.key === "Enter")){
                var parser = new DOMParser();
                var current = parser.parseFromString(this.input.value.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                this.current.replaceWith(current);
                this.content.getElementById(this.current.getAttribute("id")).replaceWith(current);
                var s = new XMLSerializer();
                this.source.value = s.serializeToString(this.content);
            }
        });
    }
};

export const VisualizerField = Object.assign(
    Object.create(Field),
    BaseVisualizer
);