import {
    createUnorderedList, createListItem, removeChildren, appendChildren, 
    createSpan, createInput, createDiv, createButton, createParagraph,
    isNullOrUndefined
} from "zenkai";
import { show, hide } from "@utils/index.js";
import { Key } from "@global/enums.js";

export const Convo = {
    editor: null,
    /** @type {HTMLElement} */
    container: null,
    init(editor, items) {
        if (isNullOrUndefined(editor)) {
            throw new Error("Missing editor parameter: Convo requires an editor");
        }
        this.editor = editor;
        this.container = createUnorderedList({ class: "convo bare-list" });
        this.container.tabIndex = 0;
        if (items) {
            appendChildren(this.container, items.map(item => createListItem({ class: "convo-item" }, item)));
        }
        
        this.bindEvents();
        
        return this;
    },
    show() { show(this.container); },
    hide() { hide(this.container); },
    clear() { removeChildren(this.container); },
    focus() { this.container.focus(); },
    render() {
        return this.container;
    },
    start(context) {
        this.clear();

        /** @type {HTMLParagraphElement} */
        let question = createParagraph({ class: "convo__text" }, "What can I help you with?");

        // context.getActions();
        /** @type {HTMLButtonElement} */
        let btnAction1 = createButton({ class: "btn convo__btn-action" }, "Create a box");
        /** @type {HTMLButtonElement} */
        let btnAction2 = createButton({ class: "btn convo__btn-action" }, "Get data");

        /** @type {HTMLInputElement} */
        let input = createInput({ class: "convo-input" });
        /** @type {HTMLDivElement} */
        let result = createDiv({ class: "input-result" });

        btnAction1.addEventListener('click', (e) => {
            console.log("btnAction1 clicked");
        });
        btnAction2.addEventListener('click', (e) => {
            console.log("btnAction2 clicked");
        });

        input.addEventListener('focus', (e) => {
            self.context = input;
        });
        input.addEventListener('input', (e) => {
            let value = input.value;

            if ((/^(create|build|construct|generate|make|produce)(.)*/gi).test(value)) {
                result.appendChild(createSpan({ class: "input-result__keyword" }, "create"));
            } else {
                removeChildren(result);
            }
        });

        appendChildren(this.container, [question, [btnAction1, btnAction2], [input, result]].map(item => createListItem({ class: "convo-item" }, item)));
        this.show();
        this.focus();
    },
    bindEvents() {
        this.container.addEventListener('keydown', (e) => {
            var activeElement = document.activeElement;
            switch (e.key) {
                case Key.escape:
                    this.hide();
                    this.clear();
                    break;
            }
        }, false);
    }
};