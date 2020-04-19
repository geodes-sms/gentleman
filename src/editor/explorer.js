import {
    createParagraph, createUnorderedList, createListItem, createStrong, createSpan,
    createDiv, createButton, createInput, createInputAs, createLabel, getElement,
    removeChildren, isHTMLElement, isNullOrWhitespace, capitalize, valOrDefault,
    appendChildren, isNullOrUndefined, createDocFragment,
} from 'zenkai';
import { show, hide, Key } from '@utils/index.js';


const explorers = [];

var lastId = 0;
const nextId = () => lastId++;

export const ExplorerManager = {
    /** @returns {Explorer} */
    getExplorer() {
        var explorer = null;
        var found = false;

        // look for an inactive modal
        for (let i = 0; !found && i < explorers.length; i++) {
            if (!explorers[i].active) {
                explorer = explorers[i];
                found = true;
            }
        }

        if (!found) {
            explorer = createExplorer();
            explorer.bindDom();
            explorer.bindEvents();
            document.body.appendChild(explorer.render());

            explorers.push(explorer);
        }

        return explorer;
    }
};

/**
 * Creates a new Explorer
 * @returns {Explorer}
 */
function createExplorer() {
    var explorer = Object.create(Explorer, {
        id: { value: nextId() }
    });

    return explorer;
}

export const Explorer = {
    /** @type {Editor} */
    editor: null,
    /** @type {Concept} */
    concept: null,
    /** @type {*[]} */
    data: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {HTMLUListElement} */
    results: null,
    /** @type {boolean} */
    active: false,

    // TODO: Add support for Model
    init(concept, editor) {
        if (isNullOrUndefined(concept)) {
            throw new Error("Explorer initialized without a concept");
        }
        this.concept = concept;
        this.data = this.concept.getStructure();

        const { id, parentId, object, name } = this.concept;
        Object.assign(this.container.dataset, {
            id: id || parentId,
            object: object,
            name: name,
        });

        this.clear();
        this.update(this.data);

        if (editor) {
            this.bind(editor);
        }

        return this;
    },
    open() {
        this.active = true;
        show(this.container);
        this.container.classList.replace('close', 'open');

        return this;
    },
    close() {
        this.container.classList.replace('open', 'close');
        hide(this.container);
        this.active = false;

        return this;
    },
    clear() {
        removeChildren(this.results);
        this.input.value = "";
        this.header.textContent = "";

        return this;
    },
    reset() {
        this.data = [];
        this.active = false;

        return this;
    },
    bind(editor) {
        if (this.editor !== editor) {
            this.editor = editor;
            this.render(editor.container);
            this.update(this.data);
        }

        return this;
    },
    bindDom() {
        var missing = false;

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({ class: "explorer-container close" }, [
                createDiv({ class: "explorer-action" }, [
                    createButton({ class: "btn btn-close", data: { action: "close" } })
                ])
            ]);
            this.container.tabIndex = -1;
            missing = true;
        }

        if (!isHTMLElement(this.header)) {
            this.header = createParagraph({ class: "explorer-header" });
            missing = true;
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({ class: "explorer-input", placeholder: "Rechercher..." });
            missing = true;
        }

        if (!isHTMLElement(this.results)) {
            this.results = createUnorderedList({ class: "bare-list explorer-results" });
            missing = true;
        }

        if (missing) {
            appendChildren(this.container, [this.header, this.input, this.results]);
        }

        return this;
    },
    render(container) {
        this.clear();

        if (isHTMLElement(container)) {
            container.appendChild(this.container);
        }

        return this.container;
    },
    update(data) {
        this.header.textContent = this.concept.fullName;

        var fragment = createDocFragment();

        fragment.appendChild(createListItem({ class: "explorer-result-title" }, "Attribute"));
        data.filter(val => val.type === "attribute").forEach(attr => {
            var title = "Target concept";
            var content = `${attr.target}${attr.accept ? `:${attr.accept}:` : ""}`;
            fragment.appendChild(createResultItem(attr, title, content));
        });

        fragment.appendChild(createListItem({ class: "explorer-result-title" }, "Component"));
        data.filter(val => val.type === "component").forEach(comp => {
            var title = "Attributes";
            var content = comp.attributes.join(", ");
            fragment.appendChild(createResultItem(comp, title, content));
        });

        removeChildren(this.results);
        this.results.appendChild(fragment);

        return this;
    },
    query(value) {
        var data = this.data.slice(0);

        if (!isNullOrWhitespace(value)) {
            var values = value.trim().replace(/\s+/g, " ").split(' ');
            data = data.filter(val => values.some(q => val.name.includes(q)));
        }


        this.update(data);

        return this;
    },
    bindEvents() {
        var lastKey = null;

        this.container.addEventListener('keydown', (event) => {
            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    rememberKey = true;
                    break;
                case Key.delete:
                    break;
                case Key.alt:
                    rememberKey = true;
                    break;
                case Key.enter:
                    break;
                case Key.right_arrow:
                    break;
                case Key.escape:
                    rememberKey = false;
                    this.close();
                    break;
                default:
                    break;
            }

            if (rememberKey) {
                lastKey = event.key;
            }

        }, false);

        this.results.addEventListener('change', (event) => {
            let target = event.target;
            let [name, type] = target.value.split(':');
            var structure = null;

            if (type === "attribute") {
                structure = this.concept.createAttribute(name);
            } else if (type === "component") {
                structure = this.concept.createComponent(name);
            }

            let temp = getElement(`[data-id=${structure.name}]`, this.concept.projection.container);
            if (!isHTMLElement(temp)) {
                this.editor.notify("This attribute cannot be rendered");
            }

            temp.replaceWith(structure.render());
            temp.remove();
            target.disabled = true;
        });

        this.input.addEventListener('input', (event) => {
            this.query(this.input.value.trim());
        });

        this.input.addEventListener('blur', (event) => {
            if (isNullOrWhitespace(this.input.value)) {
                this.input.value = "";
            }
        });
    }
};

function createResultItem(struct, title, content) {
    const { name, alias, type, created, required } = struct;

    const checkbox = createInputAs('checkbox', { class: "explorer-result-item__checkbox", value: `${name}:${type}` });
    checkbox.id = `${capitalize(name)}${capitalize(type)}`;
    checkbox.checked = created;
    checkbox.required = required;
    checkbox.disabled = required;

    const lblName = createSpan({ class: "explorer-result-item__label-name" }, valOrDefault(alias, name));

    const lblInfo = createSpan({ class: "explorer-result-item__label-info" }, [
        `${title}: `, createStrong({}, `${content}`)
    ]);

    const label = createLabel({ class: "explorer-result-item__label" }, [lblName, lblInfo]);
    label.htmlFor = checkbox.id;

    return createListItem({
        class: "explorer-result-item",
        data: {
            value: name,
            required: required
        }
    }, [checkbox, label]);
}