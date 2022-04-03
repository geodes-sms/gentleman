import { 
    createDocFragment, isHTMLElement, isNullOrUndefined, createDiv, createInput, valOrDefault,
    createTextArea, createSpan 
} from "zenkai";
import { Layout } from "./layout.js";
import { ContentHandler, resolveValue } from "./../content-handler.js";
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
    init() {
        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { current = {}, root } = this.schema;

        this.isRoot = root;

        var parser = new DOMParser();

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                dataset: {
                    nature: "layout",
                    view: "visualizer",
                    id: this.id,
                }
            });
        }

        if (!isHTMLElement(this.content)) {
            this.svg = this.source.value;

            if (!isNullOrUndefined(this.svg)) {
                this.content = parser.parseFromString(this.svg.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                if (this.content.tagName !== "svg") {
                    let root = parser.parseFromString('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"/>', "image/svg+xml").documentElement
                    root.appendChild(this.content);
                    this.content = root;
                }
                fragment.appendChild(this.content);
            }
        }

        if (!isHTMLElement(this.input)) {
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

        if (root && isNullOrUndefined(this.buttons)) {

            this.buttons = [];

            const inte = {
                type: "static",
                static: {
                    type: "button",
                    trigger: "make interactive",
                    content: [
                        {
                            type: "static",
                            static:
                            {
                                type: "text",
                                content: "Interactive",
                                focusable: true
                            }
                        }
                    ]
                }
            }

            this.mkeInteractive = ContentHandler.call(this, inte, null, this.args);

            let element = this.environment.resolveElement(this.mkeInteractive);


            element.parent = this;
            element.visualizer = this;
            this.buttons.push(element);
            fragment.append(this.mkeInteractive);

            const dyna = {
                type: "static",
                static: {
                    type: "button",
                    trigger: "make dynamic",
                    content: [
                        {
                            type: "static",
                            static:
                            {
                                type: "text",
                                content: "Dynamic",
                                focusable: true
                            }
                        }
                    ]
                }
            };

            this.mkeDynamic = ContentHandler.call(this, dyna, null, this.args);

            element = this.environment.resolveElement(this.mkeDynamic);

            element.visualizer = this;
            element.parent = this;
            this.buttons.push(element);

            fragment.append(this.mkeDynamic);

            const stat = {
                type: "static",
                static: {
                    type: "button",
                    trigger: "make static",
                    content: [
                        {
                            type: "static",
                            static:
                            {
                                type: "text",
                                content: "Static",
                                focusable: true
                            }
                        }
                    ]
                }
            }

            this.mkeStatic = ContentHandler.call(this, stat, null, this.args);

            element = this.environment.resolveElement(this.mkeStatic)

            element.visualizer = this;
            element.parent = this;
            this.buttons.push(element)

            fragment.append(this.mkeStatic);

        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
        }

        this.bindEvent();

        return this.element;
    },

    focusIn(target) {
        return this.input.focus();
    },

    focusOut() {

    },

    createProj() {
        let res = this.current;

        if (res.tagName.toLowerCase() === "tspan") {
            res = res.parentNode;
        }

        let s = new XMLSerializer();
        /*let isntRoot = this.current.tagName !== "svg";
    
        if(isntRoot){
            return '<svg xmlns="http://www.w3.org/2000/svg">' + s.serializeToString(this.current) + "</svg>";
        }*/

        this.cleanInput();
        this.updateInput(s.serializeToString(this.content));

        return '<g xmlns="http://www.w3.org/2000/svg">' + s.serializeToString(res) + "</g>";
    },

    cleanInput() {
        this.input.value = "";
        this.current.parentNode.removeChild(this.current);
    },

    updateInput(value) {
        this.source.setValue(value)
    },

    bindEvent() {
        this.content.addEventListener("click", (event) => {
            var s = new XMLSerializer();
            let c = event.target;
            if (c.tagName.toLowerCase() === "tspan") {
                c = c.parentNode;
            }
            var current = s.serializeToString(c);
            this.input.value = current;
            this.current = c;
        });

        this.input.addEventListener("keydown", (event) => {
            if ((this.input.value !== "") && (!isNullOrUndefined(this.current)) && (event.key === "Enter")) {
                var parser = new DOMParser();
                var current = parser.parseFromString(this.input.value.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
                if (this.current !== this.content) {
                    this.current.replaceWith(current);
                } else {
                    this.content = current;
                }
                this.current = current;
                var s = new XMLSerializer();
                if (!this.isRoot) {
                    this.updateInput(s.serializeToString(this.content.childNodes[0]));
                } else {
                    this.updateInput(s.serializeToString(this.content));

                }
            }
        });
    }
};

export const Visualizer = Object.assign(
    Object.create(Layout),
    BaseVisualizer
);