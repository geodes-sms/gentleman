import { 
    createAside, createAnchor, getElement, createDocFragment, createHeading, createLineBreak, removeChildren, createP, createSpan, addClass, appendChildren, createLi, createUl } from '@zenkai';
import { 
    isNullOrWhitespace } from '@zenkai';
import { EventType } from '@src/global/enums.js';
import { events } from '@utils/pubsub.js';

/**
 * Preprend a string with a hashtag
 * @param {string} str 
 * @returns {string}
 */
function hash(str) { return '#' + str; }

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
        var self = this;

        var editor = self.editor;

        events.on('editor.change', function (projection) {
            self.update(projection);
        });
        events.on('editor.clear', function () {
            self.clear();
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
        const NOTE_SECTION = 'note-section';
        const NOTE_INFO_LABEL = 'note-info-label';
        const NOTE_INFO_VALUE = 'note-info-value';
        const BR = function () { return createLineBreak(); };

        var noteTitle = createHeading('h3', { class: ['note-attr', 'font-code'] });
        noteTitle.textContent = projection.name;
        fragment.appendChild(noteTitle);

        if (projection.description) {
            fragment.appendChild(createP({ class: ['note-attr'], text: projection.description }));
        }

        // display error
        var error = createP({ class: NOTE_SECTION });
        if (projection.hasError) {
            addClass(error, 'note-error');
            appendChildren(error, [
                createSpan({ html: "You seem to have an error on that attribute:" }), BR(),
                createSpan({ html: projection.error })
            ]);
            fragment.appendChild(error);
        } else {
            addClass(error, 'note-error--valid');
            error.appendChild(createSpan({ html: "Everything is good here." }));
            fragment.appendChild(error);
        }

        var infoTitle = createHeading('h4', { class: 'note-section-title', text: "Properties" });
        var info = createUl({ class: ['bare-list', 'note-info'] });
        var iName = createInfoItem("Type", projection.type + " (" + (projection.isOptional ? 'optional' : 'required') + ")");
        var iValue = createInfoItem("Value", isNullOrWhitespace(projection.value) ? '&mdash;' : projection.value);
        var iPath = createInfoItem("Path", friendlyPath(projection.modelAttribute.path));

        appendChildren(info, [iName, iValue, iPath]);
        appendChildren(fragment, [infoTitle, info]);

        if (projection.type == 'ID') {
            var dependency = createP({ class: [NOTE_SECTION, 'note-dependency'] });
            let idref = projection.refs;
            let idrefCount = idref.length;
            if (idrefCount === 0) {
                dependency.textContent = "This attribute has no dependency";
            } else {
                dependency.textContent = `This attribute has: ${idrefCount} ${idrefCount == 1 ? "dependency": "dependencies"}`;
                let ul = createUl({ class: 'ref-list' });
                for (let i = 0; i < idrefCount; i++) {
                    let id = idref[i];
                    let li = createLi({ class: 'ref-list-item' });
                    let a = createAnchor(hash(id), { text: projection.name });
                    a.addEventListener(EventType.CLICK, function () {
                        var el = getElement(hash(id), self.editor.body);
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
            return createLi(
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
};