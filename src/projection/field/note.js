import {
    createParagraph, createDiv, removeChildren, isHTMLElement,
} from 'zenkai';
import { show, hide, Key } from '@utils/index.js';


const notes = [];

var inc = 0;
const nextId = () => `note${inc++}`;

export const NoteManager = {
    /** @returns {Note} */
    getNote(field) {
        var note = null;
        var found = false;

        // look for an inactive modal
        for (let i = 0; !found && i < notes.length; i++) {
            if (!notes[i].active) {
                note = notes[i];
                found = true;
            }
        }

        if (!found) {
            note = createNote();
            note.bindDOM()
                .bindEvents();

            notes.push(note);
        }

        if (field) {
            note.field = field;
            field.append(note.render());
        } else {
            document.body.appendChild(note.render());
        }

        note.active = true;

        return note;
    }
};

/**
 * Creates a new Note
 * @returns {Note}
 */
function createNote() {
    var note = Object.create(Note, {
        id: { value: nextId() }
    });

    return note;
}

export const Note = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {Field} */
    field: null,
    /** @type {boolean} */
    active: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    focused: false,
    /** Object nature */
    object: "note",
    init() {
        return this;
    },
    bindDOM() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["note-container"],
                draggable: true
            });
        }

        return this;
    },
    clear() {
        removeChildren(this.container);

        return this;
    },
    reset() {
        this.data = [];
        this.active = false;

        return this;
    },
    render(container) {
        this.clear();

        if (isHTMLElement(container)) {
            container.appendChild(this.container);
        }

        return this.container;
    },
    show() {
        show(this.container);
        this.visible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.visible = false;

        return this;
    },
    append(element) {
        this.container.appendChild(element);
    },
    display(message, limit) {
        const { element } = this.field;

        var content = createParagraph({
            class: ["note-content"],
        }, message);

        this.clear()
            .append(content);

        Object.assign(this.container.style, {
            top: `${element.offsetTop + element.offsetHeight}px`
        });

        if (limit) {
            setTimeout(() => {
                this.clear()
                    .hide();
            }, limit);
        }

        this.show();
    },
    bindEvents() {

    }
};