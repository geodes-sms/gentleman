import { EventType, UI } from '@global/enums.js';
import { events } from '@utils/pubsub.js';
import { isNullOrWhitespace, valOrDefault, toBoolean, createListItem, createLabel, createUnorderedList, createAnchor, appendChildren, createInput, createButton, EL } from 'zenkai';
import { unhighlight, highlight, disable, enable } from '@utils/effects.js';

const EditorMode = {
    READ: 'read',
    EDIT: 'edit'
};

/**
 * Creates a menu item
 * @param {HTMLElement} el 
 * @returns {HTMLLIElement} menu item
*/
function createMenuItem(el, attr) {
    attr = valOrDefault(attr, { class: 'menu-item' });
    var item = createListItem(attr);
    if (Array.isArray(el)) {
        appendChildren(item, el);
    }
    else if (el) {
        item.appendChild(el);
    }
    return item;
}

export const Menu = {
    /** @type {Editor} */
    editor: undefined,
    /** @type {HTMLElement} */
    parentContainer: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {string} */
    language: null,
    /** @type {HTMLButtonElement} */
    btnUndo: undefined,
    /** @type {HTMLButtonElement} */
    btnRedo: undefined,
    /** @type {HTMLButtonElement} */
    btnEdit: undefined,
    /** @type {HTMLButtonElement} */
    btnRead: undefined,
    /** @type {HTMLButtonElement} */
    btnPrint: undefined,
    /** @type {HTMLButtonElement} */
    btnCopy: undefined,
    /** @type {HTMLButtonElement} */
    btnNew: undefined,
    /** @type {HTMLButtonElement} */
    btnCreate: undefined,

    create() {
        var instance = Object.create(this);

        return instance;
    },
    init(editor, parentContainer) {
        this.editor = editor;

        events.on('editor.initialized', () => {
            enable(this.btnPrint);
            enable(this.btnCopy);
            enable(this.btnRead);
            enable(this.btnEdit);
            enable(this.btnSave);
        });

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
        var self = this;

        this.container = createUnorderedList({ id: 'menu', class: ['bare-list', 'menu'] });

        var modelSelector = createInput.file({ id: 'fileInput', accept: '.json' });
        modelSelector.addEventListener('change', function (e) {
            var file = this.files[0];
            var reader = new FileReader();
            if (file.name.endsWith('.json')) {
                reader.onload = function (e) {
                    self.editor.init(JSON.parse(reader.result));
                };
                reader.readAsText(file);
            } else {
                alert("File not supported!");
            }
        });
        this.btnCreate = createButton({ id: 'btnCreate', class: 'btn btn-menu' }, "Create");
        this.btnNew = createButton({ id: 'btnNew', class: 'btn btn-menu' }, "New");
        this.btnOpen = createLabel({ class: 'btn btn-menu' }, ["Open", modelSelector]);
        this.btnSave = createButton({ id: 'btnSave', class: 'btn btn-menu', disabled: true }, "Save");
        this.btnCopy = createButton({ id: 'btnCopy', class: 'btn btn-menu', disabled: true }, "Copy");
        this.btnEdit = createButton({ id: 'btnEdit', class: 'btn btn-menu selected' }, "Edit");
        this.btnRead = createButton({ id: 'btnRead', class: 'btn btn-menu', disabled: true }, "Read");
        this.btnPrint = createAnchor(null, { id: 'btnPrint', class: 'btn btn-menu', disabled: true }, "Download");
        // this.btnUndo = createMenuButton('btnUndo', "Undo", true);
        // this.btnRedo = createMenuButton('btnRedo', "Redo", true);

        appendChildren(this.container, [
            createMenuItem(this.btnCreate),
            createMenuItem(this.btnNew),
            createMenuItem(this.btnOpen),
            createMenuItem(this.btnSave),
            createMenuItem(this.btnCopy),
            createMenuItem([this.btnEdit, this.btnRead]),
            createMenuItem(this.btnPrint),
            // createMenuItem([this.btnUndo, this.btnRedo]),
        ]);

        return this.container;
    },
    bindEvents() {
        var self = this;

        const MIME_TYPE = 'application/json';
        var editor = self.editor;

        this.container.addEventListener(EventType.CLICK, function (event) {
            var target = event.target;
            switch (target) {
                case self.btnCreate:
                    editor.code();

                    break;
                case self.btnNew:
                    editor.init();

                    break;
                case self.btnRead:
                    editor.mode = EditorMode.READ;
                    unhighlight(self.btnEdit);
                    highlight(self.btnRead);

                    break;
                case self.btnEdit:
                    editor.mode = EditorMode.EDIT;
                    unhighlight(self.btnRead);
                    highlight(self.btnEdit);

                    break;
                case self.btnPrint:
                    if (toBoolean(self.btnPrint.dataset.disabled)) {
                        return false;
                    }
                    window.URL = window.webkitURL || window.URL;
                    if (!isNullOrWhitespace(self.btnPrint.href)) {
                        window.URL.revokeObjectURL(self.btnPrint.href);
                    }

                    var bb = new Blob([JSON.stringify(editor.model)], { type: MIME_TYPE });
                    Object.assign(self.btnPrint, {
                        download: 'model_' + editor.language + '_' + Date.now() + '.json',
                        href: window.URL.createObjectURL(bb),
                    });
                    self.btnPrint.dataset.downloadurl = [MIME_TYPE, self.btnPrint.download, self.btnPrint.href].join(':');

                    disable(self.btnPrint);
                    // Need a small delay for the revokeObjectURL to work properly.
                    setTimeout(function () {
                        window.URL.revokeObjectURL(self.btnPrint.href);
                        enable(self.btnPrint);
                    }, 1500);

                    break;
                case self.btnCopy:
                    editor.copy();

                    break;
                case self.btnSave:
                    editor.save();

                    break;
                // case self.btnUndo:
                //     editor.undo();

                //     break;
                // case self.btnRedo:
                //     editor.redo();

                //     break;
                default:
                    break;
            }
        });
        // events.on('editor.undo', function (hasUndo) {
        //     disable(self.btnUndo, !hasUndo);
        //     enable(self.btnRedo);
        // });
        // events.on('editor.redo', function (hasRedo) {
        //     disable(self.btnRedo, !hasRedo);
        //     self.btnUndo.disabled = false;
        // });
        // events.on('editor.state.initialized', function () {
        //     disable(self.btnUndo);
        //     disable(self.btnRedo);
        // });
        // events.on('editor.save', function () {
        //     enable(self.btnUndo);
        // });
    }
};