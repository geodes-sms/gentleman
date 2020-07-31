import {
    createDocFragment, createDiv, createInput, createUnorderedList, createListItem,
    findAncestor, appendChildren, removeChildren, isHTMLElement, isNullOrUndefined, isFunction,
} from 'zenkai';
import { show, hide } from '@utils/index.js';
import { MetaModel } from '@model/index.js';


const loaders = [];


export const LoaderFactory = {
    /** @returns {Loader} */
    create(args) {
        var loader = Object.create(Loader);

        if (args) {
            Object.assign(loader, args);
        }

        loaders.push(loader);

        return loader;
    }
};

export const Loader = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    options: null,
    fileHandler: null,
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {Environment} */
    context: null,
    /** @type {boolean} */
    active: false,

    get index() { return loaders.indexOf(this); },

    init(context) {
        this.context = context;

        return this;
    },

    beforeLoadMetaModel: null,
    afterLoadMetaModel: null,
    loadMetaModel(metamodelSchema) {
        var halt = false;

        if (isFunction(this.beforeLoadMetaModel)) {
            halt = this.beforeLoadMetaModel(metamodelSchema) === false;
        }
        
        if (halt) {
            return;
        }

        try {
            const metamodel = MetaModel.create(metamodelSchema);

            if (isFunction(this.afterLoadMetaModel)) {
                this.afterLoadMetaModel(metamodel);
            }

            return metamodel;
        } catch (error) {
            this.context.display(error.toString());

            return;
        }
    },

    beforeLoadModel: null,
    afterLoadModel: null,
    loadModel(modelSchema) {
        var halt = false;

        if (isFunction(this.beforeLoadModel)) {
            halt = this.beforeLoadModel(modelSchema) === false;
        }

        if (halt) {
            return;
        }

        const { metamodel } = this.context;

        if (isNullOrUndefined(metamodel)) {
            this.context.display("The metamodel has not been created.");
            return;
        }

        try {
            const model = metamodel.createModel().init(modelSchema);

            if (isFunction(this.afterLoadModel)) {
                this.afterLoadModel(model);
            }

            return model;
        } catch (error) {
            this.context.display(error.toString());

            return;
        }
    },
    render() {
        var missing = false;

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["loader-container"],
                tabindex: -1
            });

            missing = true;
        }

        if (!isHTMLElement(this.options)) {
            this.options = createUnorderedList({
                class: ["bare-list", "loader-options"]
            });

            let modelOption = createListItem({
                class: ["loader-option"],
                dataset: {
                    text: "Open",
                    value: "model"
                },
            }, "Open a model");

            let metamodelOption = createListItem({
                class: ["loader-option"],
                dataset: {
                    text: "New",
                    value: "metamodel"
                }
            }, "Create a metamodel");

            appendChildren(this.options, [modelOption, metamodelOption]);

            fragment.appendChild(this.options);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "file",
                class: ["loader-option__input", "hidden"],
                accept: '.json'
            });

            fragment.appendChild(this.input);
        }

        if (fragment.hasChildNodes) {
            this.container.appendChild(fragment);
        }

        if (missing) {
            this.bindEvents();
        }

        return this.container;
    },
    destroy() {
        removeChildren(this.container);
        this.container.remove();
        loaders.splice(this.index, 1);

        return true;
    },
    bindEvents() {
        /**
         * Gets the paremt option element
         * @param {HTMLElement} element 
         * @returns {HTMLElement}
         */
        const getItem = (element) => element.parentElement === this.options ? element : findAncestor(element, (el) => el.parentElement === this.options, 3);

        const valueHander = {
            metamodel: metamodelOptionHandler,
            model: modelOptionHandler,
        };

        /**
         * @this {Loader}
         */
        function metamodelOptionHandler() {
            let event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            this.fileHandler = this.loadMetaModel;
            this.input.dispatchEvent(event);
        }

        /**
         * @this {Loader}
         */
        function modelOptionHandler() {
            let event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            this.fileHandler = this.loadModel;
            this.input.dispatchEvent(event);
        }

        this.container.addEventListener('click', (event) => {
            const { target } = event;
            const item = getItem(target);

            if (isHTMLElement(item)) {
                const { value } = item.dataset;
                let handler = valueHander[value];
                handler.call(this);
            }
        });

        this.input.addEventListener('change', (event) => {
            var file = this.input.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .gen file");
            }

            var reader = new FileReader();
            reader.onload = (e) => this.fileHandler.call(this, JSON.parse(reader.result));
            reader.readAsText(file);
        });
    },
    open() {
        show(this.container);
        this.active = true;
        this.container.classList.replace('close', 'open');

        return this;
    },
    close() {
        hide(this.container);
        this.active = false;
        this.container.classList.replace('open', 'close');

        return this;
    },
};