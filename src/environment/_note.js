import {
    createParagraph, createSpan, createAside, createAnchor, createDocFragment,
    createH3, createH4, createListItem, createLineBreak, createUnorderedList,
    getElement, removeChildren, hasOwn, isString, isNullOrWhitespace
} from 'zenkai';
import { EventType, Events } from '@utils/index.js';


export const Note = {
    /** @type {Editor} */
    editor: undefined,
    /** @type {HTMLElement} */
    container: undefined,

    create() {
        var instance = Object.create(this);

        return instance;
    },
    init(editor, parentContainer) {
        this.editor = editor;

        if (parentContainer) {
            this.parentContainer = parentContainer;
            this.parentContainer.appendChild(this.render());
        } else {
            this.render();
        }

        this.bindEvents();

        return this;
    },
    render() {
        this.container = createAside({ class: 'note' });

        return this.container;
    },
    bindEvents() {
        Events.on('editor.change', (projection) => {
            this.update(projection);
        });
        Events.on('editor.clear', () => {
            this.clear();
        });
    },
    clear() {
        var self = this;

        removeChildren(self.container);
    },
    /**
     * Updates the note section content
     * @param {Projection} projection 
     */
    update(projection) {
        var self = this;

        self.clear();

        var fragment = createDocFragment();

        var noteTitle = createH3({ class: ['note-attr', 'font-code'] });
        noteTitle.textContent = projection.name;
        fragment.appendChild(noteTitle);

        if (projection.description) {
            fragment.appendChild(createParagraph({ class: ['note-attr'], text: projection.description }));
        }
        this.container.appendChild(printSchema(projection.model.schema.root));
    }
};

function printSchema(schema) {
    var container = createUnorderedList();
    for (const key in schema) {
        if (hasOwn(schema, key)) {
            const element = schema[key];
            if (key === 'attribute') {
                container.appendChild(createListItem({ class: 'schema-attribute' }, [printSchema(element)]));
            } else if (key === 'component') {
                element.forEach(el => {
                    container.appendChild(createListItem({ class: 'schema-attribute' }, [printSchema(el)]));
                });
            } else if (isString(element)) {
                container.appendChild(createListItem({ class: 'schema-item' }, element));
            } else {
                container.appendChild(createListItem({ class: 'schema-item' }, [
                    createSpan({ class: 'schema-item-key' }, key),
                    createSpan({ class: 'schema-item-value' }, element.n)
                ]));
            }
        }
    }

    return container;
}


function updateNote(projection) {
    var self = this;

    self.clear();

    var fragment = createDocFragment();
    const NOTE_SECTION = 'note-section';
    const NOTE_INFO_LABEL = 'note-info-label';
    const NOTE_INFO_VALUE = 'note-info-value';
    const BR = function () { return createLineBreak(); };

    var noteTitle = createH3({ class: ['note-attr', 'font-code'] });
    noteTitle.textContent = projection.name;
    fragment.appendChild(noteTitle);

    if (projection.description) {
        fragment.appendChild(createParagraph({ class: ['note-attr'], text: projection.description }));
    }

    // display error
    var error = createParagraph({ class: NOTE_SECTION });
    if (projection.hasError) {
        error.classList.add('note-error');
        error.append(
            createSpan({ html: "You seem to have an error on that attribute:" }), BR(),
            createSpan({ html: projection.error })
        );
        fragment.appendChild(error);
    } else {
        error.classList.add('note-error--valid');
        error.appendChild(createSpan({ html: "Everything is good here." }));
        fragment.appendChild(error);
    }

    var infoTitle = createH4({ class: 'note-section-title', text: "Properties" });
    var info = createUnorderedList({ class: ['bare-list', 'note-info'] });
    var iName = createInfoItem("Type", projection.type + " (" + (projection.isOptional ? 'optional' : 'required') + ")");
    var iValue = createInfoItem("Value", isNullOrWhitespace(projection.value) ? '&mdash;' : projection.value);
    var iPath = createInfoItem("Path", friendlyPath(projection.modelAttribute.path));

    info.append(iName, iValue, iPath);
    fragment.append(infoTitle, info);

    if (projection.type == 'ID') {
        var dependency = createParagraph({ class: [NOTE_SECTION, 'note-dependency'] });
        let idref = projection.refs;
        let idrefCount = idref.length;
        if (idrefCount === 0) {
            dependency.textContent = "This attribute has no dependency";
        } else {
            dependency.textContent = `This attribute has: ${idrefCount} ${idrefCount == 1 ? "dependency" : "dependencies"}`;
            let ul = createUnorderedList({ class: 'ref-list' });
            for (let i = 0; i < idrefCount; i++) {
                let id = idref[i];
                let li = createListItem({ class: 'ref-list-item' });
                let a = createAnchor(`#${id}`, { text: projection.name });
                a.addEventListener(EventType.CLICK, function () {
                    var el = getElement(`#${id}`, self.editor.body);
                    el.focus();
                });
                li.appendChild(a);
                ul.appendChild(li);
            }
            dependency.appendChild(ul);
        }

        fragment.appendChild(dependency);
    }

    self.container.appendChild(fragment);

    /**
     * Helper: Creates an info item
     * @param {string} lbl label
     * @param {string} val value
     * @returns {HTMLLIElement} Info item
     */
    function createInfoItem(lbl, val) {
        return createListItem(
            { class: 'note-info-item' },
            [
                createSpan({ class: [NOTE_INFO_LABEL], text: lbl }),
                createSpan({ class: [NOTE_INFO_VALUE, 'font-code'], html: val })
            ]
        );
    }

    /**
     * Creates a friendly readable path to the attribute
     * @param {string} path 
     */
    function friendlyPath(path) {
        return path.replace(/.val|.attr/g, '').replace(/.composition\[\d+\]./g, '>').replace(/\.+/g, '.');
    }
}