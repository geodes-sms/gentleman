import {
    createDocFragment, createInput, createSpan, createDiv, createParagraph, createButton,
    getElement, isHTMLElement, isNullOrWhitespace, isNullOrUndefined,
    isString, isEmpty,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { Explorer, Editor } from './index.js';


const editors = [];
const explorers = [];

var inc = 0;
const nextId = () => `GE${inc++}`;

export const Manager = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    homeContainer: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    homePage: null,
    /** @type {HTMLButtonElement} */
    btnBuild: null,

    init(container) {
        var result = resolveContainer(container);

        if (!isHTMLElement(result)) {
            throw new TypeError("Bad argument: The container argument could not be resolved to an HTML Element.");
        }

        this.container = result;
        this.container.tabIndex = -1;

        this.bindDOM();
        this.bindEvents();

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (isNullOrUndefined(this.menu.parentElement)) {
            fragment.appendChild(this.menu);
        }

        if (isNullOrUndefined(this.btnBuild.parentElement)) {
            fragment.appendChild(this.btnBuild);
        }

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
        }

        this.refresh();

        return this.container;
    },
    home() {
        /** @type {HTMLButtonElement} */
        const btnCreateMetaModel = createButton({
            type: "button",
            class: ["btn", "btn-home", "btn-create-metamodel"]
        }, "DESIGN");
        /** @type {HTMLButtonElement} */
        const btnCreateModel = createButton({
            type: "button",
            class: ["btn", "btn-home", "btn-create-model"]
        }, "MODEL");
        /** @type {HTMLButtonElement} */
        const homeContent = createParagraph({
            class: ["home-content"]
        }, [
            createSpan({
                class: ["home-content-title", "font-gentleman"]
            }, "Gentleman")
        ]);


        var input = createInput({
            type: "file",
            class: ["loader-option__input", "hidden"],
            accept: '.json'
        });

        /** @type {HTMLElement} */
        this.homeContainer = createDiv({
            class: ["home-container"]
        }, [
            homeContent,
            btnCreateMetaModel,
            createSpan({
                class: ["btn-home__help"]
            }, "Create a new Gentleman Model"),
            btnCreateModel,
            createSpan({
                class: ["btn-home__help"]
            }, "Create a new Model instance"),
            input,
        ]);

        this.homeContainer.addEventListener('click', (event) => {
            const target = event.target;

            // if (target === btnCreateMetaModel) {
            //     const metamodel = Loader.loadMetaModel(METAMODEL_GENTLEMAN);
            //     const model = metamodel.createModel().init();

            //     const Editor = this.getEditor().init(metamodel, model).open();
            //     removeChildren(homeContainer);
            //     homeContainer.remove();
            // }
            // if (target === btnCreateModel) {
            //     let event = new MouseEvent('click', {
            //         view: window,
            //         bubbles: true,
            //         cancelable: true,
            //     });

            //     input.dispatchEvent(event);
            // }
        });

        this.container.appendChild(this.homeContainer);
    },
    refresh() {
        if ([editors, explorers].every((env) => isEmpty(env))) {
            this.home();
        } else {
            hide(this.homeContainer);
        }

        let conceptEditor = false;
        let projectionEditor = false;

        for (let i = 0; i < editors.length; i++) {
            const editor = editors[i];
            if (editor.buildTarget === "gentleman_concept") {
                conceptEditor = true;
            }
            if (editor.buildTarget === "gentleman_projection") {
                projectionEditor = true;
            }
        }

        if (conceptEditor && projectionEditor) {
            show(this.btnBuild);
        } else {
            hide(this.btnBuild);
        }

        return this;
    },
    /** @returns {Editor} */
    getEditor(id) {
        var editor = getEnvironment.call({ environments: editors }, id);

        return editor;
    },
    /**
     * Creates a new `Editor`
     * @returns {Editor}
     */
    createEditor(model) {
        var editor = Object.create(Editor, {
            object: { value: "environment" },
            name: { value: "editor" },
            type: { value: "editor" },
            id: { value: nextId() },
            manager: { value: this },
            model: { value: model },
            container: { value: createContainer("editor") },
        });
        this.container.appendChild(editor.container);

        editors.push(editor);

        this.refresh();

        return editor;
    },
    deleteEditor(id) {
        var index = -1;

        if (isString(id)) {
            index = editors.findIndex(p => p.id === id);
        } else {
            index = editors.indexOf(id);
        }

        if (index === -1) {
            return false;
        }

        editors.splice(index, 1);

        this.refresh();

        return true;
    },
    /** @returns {Explorer} */
    getExplorer(id) {
        var explorer = getEnvironment.call({ environments: explorers }, id);

        return explorer;
    },
    /**
     * Creates a new `Explorer`
     * @returns {Explorer}
     */
    createExplorer() {
        var explorer = Object.create(Explorer, {
            object: { value: "environment" },
            name: { value: "explorer" },
            type: { value: "explorer" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("explorer") },
        });
        this.container.appendChild(explorer.container);

        explorers.push(explorer);

        this.refresh();

        return explorer;
    },
    bindDOM() {
        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["manager-menu", "hidden"]
            }, "MENU");
        }

        if (!isHTMLElement(this.btnBuild)) {
            this.btnBuild = createButton({
                id: "btnBuildModel",
                class: ["btn", "manager__btn-build", "hidden"],
                draggable: true,
            }, "Build");
        }
    },
    bindEvents() {
        this.menu.addEventListener("click", (event) => {
            console.log("SHOW MENU");
        });

        this.btnBuild.addEventListener('click', (event) => {
            var json = [];

            for (let i = 0; i < editors.length; i++) {
                const editor = editors[i];

                if (editor.buildTarget === "gentleman_concept") {
                    json.push(editor.build());
                }

                if (editor.buildTarget === "gentleman_projection") {
                    json.push(editor.build());
                }
            }

            const [concept, projection] = json;
            console.log(concept, projection);
            this.createEditor("gentleman_concept").init(concept, projection).open();
        });
    }
};

/**
 * Gets or creates an environment if not found
 * @param {*[]} lkpList Lookup List
 * @param {Function} createEnvCb Create Environment callback
 * @returns {Environment}
 */
function getEnvironment(id) {
    if (id) {
        return this.environments.find((env) => env.id === id);
    }

    var environment = this.environments.find((env) => !env.active);

    return environment;
}

/**
 * Resolves the container
 * @param {HTMLElement|string} container 
 * @returns {HTMLElement}
 */
function resolveContainer(container) {
    if (isHTMLElement(container)) {
        return container;
    } else if (!isNullOrWhitespace(container)) {
        return getElement(container);
    }

    return getElement("[data-gentleman]");
}

/** Creates a container
 * @returns {HTMLElement}
 */
function createContainer(type) {
    return createDiv({
        class: ["env", `${type}-container`, "close"],
        tabindex: -1
    });
}