import { UTILS, HELPER } from './../utils/index.js';
import { __ENV, __VERSION } from './../global.js';
import { EventType, UI } from './../enums.js';
import { events } from './../pubsub.js';

export const Menu = (function ($, _) {

    const EL = UI.Element;
    const EditorMode = {
        READ: 'read',
        EDIT: 'edit'
    };

    var pub = {
        /** @type {Editor} */
        editor: undefined,
        /** @type {HTMLElement} */
        container: undefined,
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

        create() {
            var instance = Object.create(this);

            return instance;
        },
        init(editor, container) {
            var self = this;

            self.editor = editor;
            events.on('editor.initialized', function () {
                $.enable(self.btnPrint);
                $.enable(self.btnCopy);
                $.enable(self.btnRead);
                $.enable(self.btnEdit);
                $.enable(self.btnSave);
            });
            container.appendChild(this.render());
            this.bindEvents();
        },
        render() {
            var self = this;

            self.container = $.createUl({ id: 'menu', class: ['bare-list', 'menu'] });

            self.btnOpen = $.createLabel({ class: 'btn btn-menu', text: "Open" });
            var modelSelector = $.createFileInput({ id: 'fileInput', accept: '.json' });
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
            self.btnOpen.appendChild(modelSelector);

            self.btnNew = createButton('btnNew', "New");
            self.btnEdit = createButton("btnEdit", "Edit", true, true);
            self.btnRead = createButton('btnRead', "Read", true);
            self.btnUndo = createButton('btnUndo', "Undo", true);
            self.btnRedo = createButton('btnRedo', "Redo", true);
            self.btnSave = createButton('btnSave', "Save", true);
            self.btnCopy = createButton('btnCopy', "Copy", true);
            self.btnPrint = createButton('btnPrint', "Download", true, false, EL.ANCHOR.name);

            $.appendChildren(self.container, [
                createMenuItem(self.btnNew),
                createMenuItem(self.btnOpen),
                createMenuItem(self.btnSave),
                createMenuItem(self.btnCopy),
                createMenuItem(self.btnPrint),
                createMenuItem([self.btnUndo, self.btnRedo]),
                createMenuItem([self.btnEdit, self.btnRead])
            ]);

            return self.container;

            /**
             * Creates a menu item button
             * @param {string} name 
             * @param {string} text 
             * @param {boolean} disabled 
             * @param {boolean} selected 
             * @param {string} el 
             */
            function createButton(name, text, disabled, selected, el) {
                disabled = _.valOrDefault(disabled, false);
                var btnClass = _.valOrDefault(selected, false) ? [EL.BUTTON_MENU, UI.SELECTED] : [EL.BUTTON_MENU];
                switch (_.valOrDefault(el, EL.BUTTON.name)) {
                    case EL.ANCHOR.name:
                        return $.createAnchor(null, { id: name, class: btnClass, text: text, data: { disabled: disabled } });
                    case EL.BUTTON.name:
                        return $.createButton({ id: name, class: btnClass, disabled: disabled, text: text });
                }
            }

            /**
             * Creates a menu item
             * @param {HTMLElement} el 
             * @returns {HTMLLIElement} menu item
             */
            function createMenuItem(el, attr) {
                attr = _.valOrDefault(attr, { class: 'menu-item' });
                var item = $.createLi(attr);
                if (Array.isArray(el)) {
                    $.appendChildren(item, el);
                }
                else if (el) {
                    item.appendChild(el);
                }
                return item;
            }
        },
        bindEvents() {
            var self = this;

            const MIME_TYPE = 'application/json';
            var editor = self.editor;

            self.container.addEventListener(EventType.CLICK, function (event) {
                var target = event.target;
                switch (target) {
                    case self.btnNew:
                        editor.init();

                        break;
                    case self.btnRead:
                        editor.mode = EditorMode.READ;
                        $.unhighlight(self.btnEdit);
                        $.highlight(self.btnRead);

                        break;
                    case self.btnEdit:
                        editor.mode = EditorMode.EDIT;
                        $.unhighlight(self.btnRead);
                        $.highlight(self.btnEdit);

                        break;
                    case self.btnPrint:
                        if (_.toBoolean(self.btnPrint.dataset.disabled)) {
                            return false;
                        }
                        window.URL = window.webkitURL || window.URL;
                        if (!_.isNullOrWhiteSpace(self.btnPrint.href)) {
                            window.URL.revokeObjectURL(self.btnPrint.href);
                        }

                        var bb = new Blob([JSON.stringify(editor.model)], { type: MIME_TYPE });
                        Object.assign(self.btnPrint, {
                            download: 'model_' + editor.language + '_' + Date.now() + '.json',
                            href: window.URL.createObjectURL(bb),
                        });
                        self.btnPrint.dataset.downloadurl = [MIME_TYPE, self.btnPrint.download, self.btnPrint.href].join(':');

                        $.disable(self.btnPrint);
                        // Need a small delay for the revokeObjectURL to work properly.
                        setTimeout(function () {
                            window.URL.revokeObjectURL(self.btnPrint.href);
                            $.enable(self.btnPrint);
                        }, 1500);

                        break;
                    case self.btnCopy:
                        editor.copy();

                        break;
                    case self.btnSave:
                        editor.save();

                        break;
                    case self.btnUndo:
                        editor.undo();

                        break;
                    case self.btnRedo:
                        editor.redo();

                        break;
                    default:
                        break;
                }
            });
            events.on('editor.undo', function (hasUndo) {
                self.btnUndo.disabled = !hasUndo;
                self.btnRedo.disabled = false;
            });
            events.on('editor.redo', function (hasRedo) {
                self.btnRedo.disabled = !hasRedo;
                self.btnUndo.disabled = false;
            });
            events.on('editor.state.initialized', function () {
                self.btnUndo.disabled = true;
                self.btnRedo.disabled = true;
            });
            events.on('editor.save', function () {
                self.btnUndo.disabled = false;
            });
        }
    };

    return pub;
})(UTILS, HELPER);