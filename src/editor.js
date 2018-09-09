/// <reference path="enums.js" />
/// <reference path="helpers/helpers.js" />
/// <reference path="utils/utils.js" />
/// <reference path="utils/interactive.js" />
/// <reference path="autocomplete.js" />
/// <reference path="model/model.js" />
/// <reference path="model/modelElement.js" />
/// <reference path="projection.js" />

const __ENV = Environment.TEST;
const __VERSION = '0.10';

var Gentleman = (function ($, _, Autocomplete, _MODEL, PROJ, ERR) {
    "use strict";

    const container = $.getElement("[data-gentleman-editor]");
    container.tabIndex = -1;

    const EL = UI.Element;
    const EditorMode = {
        READ: 'read',
        EDIT: 'edit'
    };

    // Indicates whether the display is mobile mode
    var MOBILE = $.getWindowWidth() <= 700;

    /**
     * Gets the name of the object if available
     * @param {Object} obj 
     * @returns {string|null} name
     */
    function nameof(obj) { return _.valOrDefault(obj.name, null); }

    /**
     * Preprend a string with a dot
     * @param {string} str 
     * @returns {string}
     */
    function dot(str) { return '.' + str; }

    /**
     * Preprend a string with a hashtag
     * @param {string} str 
     * @returns {string}
     */
    function hash(str) { return '#' + str; }

    function f_class(el) { return dot(el.class); }

    // Allow responsive design
    var mql = window.matchMedia('(max-width: 800px)');

    // Pub-Sub pattern implementation
    const events = {
        events: {},
        on: function (eventName, fn) {
            this.events[eventName] = this.events[eventName] || [];
            this.events[eventName].push(fn);
        },
        off: function (eventName, fn) {
            if (this.events[eventName]) {
                for (var i = 0; i < this.events[eventName].length; i++) {
                    if (this.events[eventName][i] === fn) {
                        this.events[eventName].splice(i, 1);
                        break;
                    }
                }
            }
        },
        emit: function (eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].forEach(function (fn) {
                    fn(data);
                });
            }
        }
    };

    // State management
    const state = {
        create: function () {
            var instance = Object.create(this);

            var past = [];
            var future = [];

            var undo = function () {
                future = [instance.current, ...future];
                instance.current = past.pop();
            };

            var redo = function () {
                past = [...past, instance.current];
                instance.current = future[0];
                future = future.slice(1);
            };

            var set = function (val) {
                past = [...past, instance.current];
                instance.current = _.cloneObject(val);
                future = [];
            };

            _.defProp(instance, 'hasUndo', {
                get() { return past.length > 0; },
            });
            _.defProp(instance, 'hasRedo', {
                get() { return future.length > 0; },
            });

            Object.assign(instance, { undo, redo, set });

            return instance;
        },
        init(val) {
            this.current = _.cloneObject(val);
        },
        current: undefined
    };

    const Menu = {
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
                        // clearBody();
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
            events.on('editor.save', function () {
                self.btnUndo.disabled = false;
            });
        }
    };

    const Note = {
        /** @type {Editor} */
        editor: undefined,
        /** @type {HTMLElement} */
        container: undefined,

        create() {
            var instance = Object.create(this);

            return instance;
        },
        init(editor, container) {
            var self = this;

            self.editor = editor;
            container.appendChild(this.render());
            this.bindEvents();
        },
        render() {
            var self = this;

            self.container = $.createAside({ class: 'note' });

            return self.container;
        },
        bindEvents() {
            var self = this;

            var editor = self.editor;

            // events.on('editor.undo', function (hasUndo) {
            //     self.btnUndo.disabled = !hasUndo;
            //     self.btnRedo.disabled = false;
            // });
            // events.on('editor.redo', function (hasRedo) {
            //     self.btnRedo.disabled = !hasRedo;
            //     self.btnUndo.disabled = false;
            // });
            // events.on('editor.save', function () {
            //     self.btnUndo.disabled = false;
            // });

            events.on('editor.change', function (projection) {
                self.update(projection);
            });
        },
        clear() {
            var self = this;

            $.removeChildren(self.container);
        },
        update(projection) {
            var self = this;

            self.clear();

            var fragment = $.createDocFragment();
            const NOTE_SECTION = 'note-section';
            const BR = function () { return $.createLineBreak(); };

            var noteTitle = $.createHeading('h3', { class: ['note-attr', 'font-code'] });
            noteTitle.textContent = projection.name;
            fragment.appendChild(noteTitle);

            if (projection.hasError) {
                let error = $.createP({ class: [NOTE_SECTION, 'note-error'] });
                error.appendChild($.createSpan({ html: "You seem to have an error on that attribute:<br>" }));
                error.appendChild($.createSpan({ html: projection.error }));
                fragment.appendChild(error);
            } else {
                let error = $.createP({ class: [NOTE_SECTION, 'note-error--valid'] });
                error.appendChild($.createSpan({ html: "Everything is good here." }));
                fragment.appendChild(error);
            }

            var info = $.createP({ class: [NOTE_SECTION, 'note-info', 'font-code'] });
            var attrName = $.createSpan({
                html: "<strong>Type</strong>: " + projection.type + " (" + (projection.isOptional ? 'optional' : 'required') + ")"
            });
            var attrValue = $.createSpan({
                html: "<strong>Value</strong>: " + (_.isNullOrWhiteSpace(projection.value) ? '&mdash;' : projection.value)
            });

            $.appendChildren(info, [attrName, BR(), attrValue]);
            fragment.appendChild(info);

            if (projection.type == 'ID') {
                var dependency = $.createP({ class: [NOTE_SECTION, 'note-dependency'] });
                let idref = projection.refs;
                let idrefCount = idref.length;
                if (idrefCount === 0) {
                    dependency.textContent = "This attribute has no dependency";
                } else {
                    dependency.textContent = "This attribute has: " + idrefCount + " " + _.pluralize(idrefCount == 1, "dependency", "y|ies");
                    let ul = $.createUl({ class: 'ref-list' });
                    for (var i = 0; i < idrefCount; i++) {
                        let id = idref[i];
                        let li = $.createLi({ class: 'ref-list-item' });
                        let a = $.createAnchor(hash(id), { text: projection.name });
                        a.addEventListener(EventType.CLICK, function(){
                            var el = $.getElement(hash(id), container);
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
        }
    };

    const Editor = {
        /** @type {state} */
        state: state.create(),
        menu: null,
        note: null,
        MM: null,
        create(model) {
            const KEY_CONFIG = '@config';
            const KEY_RESOURCE = '@resources';

            var instance = Object.create(this);
            instance.MM = model;

            // display language
            if (model[KEY_CONFIG]) {
                let config = model[KEY_CONFIG];
                if (config.language) {
                    instance._language = config.language;
                }
            }

            // add stylesheets
            if (model[KEY_RESOURCE]) {
                let dir = '../assets/css/';
                model[KEY_RESOURCE].forEach(function (name) {
                    DOC.head.appendChild($.createLink('stylesheet', dir + name, { class: 'gentleman-css' }));
                });
            }

            instance._abstract = null;
            instance._concrete = null;
            instance._current = null;
            instance._isInitialized = false;

            instance._body = $.createDiv({ class: 'body' });
            instance._autocomplete = Autocomplete.create();
            instance._mode = false;

            // add currentLine and aside note to container

            return {
                init(model) { instance.init(model); },
                save: instance.save,
                get state() { return instance.state; },
                undo() {
                    instance.state.undo();
                    instance.setState(_.cloneObject(instance.state.current));
                    events.emit('editor.undo', instance.state.hasUndo);
                },
                redo() {
                    instance.state.redo();
                    instance.setState(_.cloneObject(instance.state.current));
                    events.emit('editor.redo', instance.state.hasRedo);
                },
                get mode() { return instance._mode; },
                set mode(val) {
                    instance._mode = val;
                    var list;
                    const READ_MODE = 'read-mode';
                    switch (val) {
                        case EditorMode.EDIT:
                            list = $.getElements(dot(READ_MODE), instance.body);
                            for (let i = list.length - 1; i >= 0; i--) {
                                let item = list.item(i);
                                $.show(item);
                                $.removeClass(item, READ_MODE);
                            }
                            break;
                        case EditorMode.READ:
                            // hide empty attributes
                            list = $.getElements(dot(UI.EMPTY), instance.body);
                            for (let i = 0, len = list.length; i < len; i++) {
                                let item = list.item(i);
                                $.hide(item);
                                $.addClass(item, READ_MODE);
                            }
                            // hide buttons
                            list = $.getElements(dot(EL.BUTTON.class), instance.body);
                            for (let i = 0, len = list.length; i < len; i++) {
                                let item = list.item(i);
                                $.hide(item);
                                $.addClass(item, READ_MODE);
                            }

                            break;
                    }
                },
                get language() { return instance.language; },
                get model() { return instance.concrete; },
                copy() {
                    var el = $.createTextArea({ value: instance.abstract.toString(), readonly: true });
                    fakeHide(el);
                    container.appendChild(el);
                    el.select();
                    DOC.execCommand('copy');
                    el.remove();
                }
            };
        },
        /** @type {MetaModel} */
        get abstract() { return this._abstract; }, // abstract (static) model
        set abstract(val) { this._abstract = val; },
        get concrete() { return this._concrete; }, // concrete (dynamic) mode
        set concrete(val) { this._concrete = val; },
        get current() { return this._current; }, // current position in model
        set current(val) { this._current = val; },
        get language() { return this._language; },

        get autocomplete() { return this._autocomplete; }, // autocomplete element
        get projections() { return this.abstract.projections; },
        get options() { return this.abstract.options; },

        /** @returns {HTMLElement} */
        get currentLine() { return this._currentLine; }, // current line in representation
        set currentLine(val) { this._currentLine = val; },
        /** @returns {HTMLElement} */
        get body() { return this._body; },

        get isInitialized() { return this._isInitialized; },
        get hasError() { return this._hasError; },

        getProjection(index) { return this.projections[index]; },

        resize() {
            var self = this;

            // TODO: adapt UI to smaller screen
        },
        setState(s) {
            var self = this;
            // set concrete to new state
            self._concrete = s;
            // reinitialize abstract
            self._abstract.init(self._concrete);
            // set current to newly create element
            self._current = self._abstract.createModelElement(self._concrete.root, true);

            // clear and render
            self.clear();
            self.currentLine = self.body;
            self.render();
        },
        save() {
            var self = this;
            // console.log(self.concrete);
            self.state.set(self.concrete);

            events.emit('editor.save');
        },
        clear() {
            var self = this;
            $.removeChildren(self.body);
            // self.note.clear();
        },
        init(model) {
            const KEY_ROOT = '@root';

            if (model) {
                this.concrete = model;
            } else {
                let root = this.MM[KEY_ROOT];
                if (root) {
                    this.concrete = { root: JSON.parse(JSON.stringify(this.MM[root])) };
                } else { // throw an error if the root was not found.
                    let error = ERR.InvalidModelError.create("Root not found: The model does not contain an element with the attribute root");
                    container.appendChild($.createP({ class: 'body', text: error.toString() }));
                    throw error;
                }
            }

            // initialize the model
            this.abstract = _MODEL.create(this.MM, this._concrete);
            this.current = this.abstract.createModelElement(this.concrete.root, true);

            // set the initial state
            this.state.init(this.concrete);

            // add the event handlers
            this.bindEvents();

            // clear the body
            this.clear();
            this.currentLine = this.body;
            $.hide($.getElement(hash('splashscreen')));

            // draw the editor
            this.render();

            // Get next element
            var next = $.getElement(f_class(EL.ATTRIBUTE), this.currentLine) || $.getElement(f_class(EL.OPTION), container);
            var parent = next.parentElement;
            if (parent !== this.currentLine) {
                this.currentLine = parent;
            }

            next.focus();

            if (!this.isInitialized) {
                events.emit('editor.initialized');
                this._isInitialized = true;
            }
        },
        render: function () {
            if (!this.isInitialized) {
                $.preprendChild(container, this.body);
            }

            this.currentLine.appendChild(this.current.render());
            this.currentLine = this.currentLine.firstChild;
            this.currentLine.contentEditable = false;
        },
        openConv() {
            var self = this;

            const CONVO = 'convo';
            const CONVO_USER = [CONVO, 'convo--user'];
            const CONVO_GENTLEMAN = [CONVO, 'convo--gentleman', 'font-gentleman'];

            var container = $.getElement(dot('convo-container'));
            var greeting = $.createP({ class: CONVO_GENTLEMAN });
            var qq, convo;
            if (container) {
                $.show(container);
                convo = $.getElement(dot('convo-wrapper'));
                convo.appendChild(greeting);
                qq = $.getElement(dot('question'));
            } else {
                container = $.createDiv({ class: 'convo-container' });
                convo = $.createDiv({ class: ['convo-wrapper'] });
                convo.appendChild(greeting);
                qq = $.createTextArea({ class: ['question'], placeholder: "Ask a question" });
                qq.addEventListener(EventType.KEYDOWN, function (event) {
                    switch (event.key) {
                        case Key.enter:
                            var val = qq.value;
                            var q = $.createP({ class: CONVO_USER, text: val });
                            convo.appendChild(q);
                            qq.value = "";

                            // delay answer => conv feeling (UX)
                            setTimeout(function () {
                                var a = $.createP({ class: CONVO_GENTLEMAN });
                                convo.appendChild(a);
                                var ask_response = ask(val);
                                SmartType(a, ask_response, function () {
                                    if (ask_response.close) {
                                        setTimeout(function () { $.hide(container); }, 200);
                                    }
                                });
                            }, 200);

                            event.preventDefault();
                            event.stopPropagation();

                            break;
                        case Key.backspace:
                            event.stopPropagation();

                            break;
                        case Key.escape:
                            $.hide(container);
                            event.stopPropagation();

                            break;
                        default:
                            break;
                    }

                });
                $.appendChildren(container, [convo, qq]);
                self.body.appendChild(container);
            }
            SmartType(greeting, [{ type: 0, val: "Hello, how may I help you?" }]);
            qq.focus();

            /**
             * Process question
             * @param {string} qq question
             * @returns {string} answer
             */
            function ask(qq) {
                const THANK_YOU = ['thx', 'ty', 'thanks', 'thank'];
                const POLITE = ["You're welcome", "I'm happy to help", "Glad I could help", "Anytime", "It was nothing", "No problem", "Don't mention it", "It was my pleasure"];
                const BYE = ['bye', 'close', 'exit', 'done'];

                // remove accents and keep words
                var words = removeAccents(qq).replace(/[^a-zA-Z0-9 _-]/gi, '').split(' ');
                if (words.findIndex(function (val) { return val.toLowerCase() === 'version'; }) !== -1) {
                    return [
                        { type: 0, val: "You are currently using Gentleman " },
                        { type: 1, val: "version " + __VERSION }
                    ];
                } else if (words.findIndex(function (val) { return THANK_YOU.indexOf(val.toLowerCase()) !== -1; }) !== -1) {
                    return [{ type: 0, val: POLITE[_.random(POLITE.length - 1)] }];
                } else if (words.findIndex(function (val) { return BYE.indexOf(val.toLowerCase()) !== -1; }) !== -1) {
                    let result = [{ type: 0, val: "Good bye, happy coding :)" }];
                    result.close = true;
                    return result;
                } else {
                    return [{ type: 0, val: "Sorry, I cannot answer this question at the moment. Ask me again later." }];
                }
            }
        },
        bindEvents: function () {
            var self = this;

            var currentContainer,
                lastKey,
                preval;
            var flag = false;

            self.body.addEventListener(EventType.CLICK, function (event) {
                var target = event.target;
                var action = target.dataset.action;
                if (action && target.tagName == EL.BUTTON.name) {
                    switch (action) {
                        case 'add':
                            self.save();
                            break;
                        case 'remove':
                            self.save();
                            break;
                        default:
                            break;
                    }
                }
            }, false);

            container.addEventListener(EventType.KEYUP, function (event) {
                var target = event.target;
                var projection = self.getProjection(target.id);

                if (projection && target.textContent === "") {
                    projection.update();
                }

                if (lastKey == event.key) lastKey = -1;

                switch (event.key) {
                    case Key.spacebar:
                        if (lastKey == Key.ctrl)
                            self.autocomplete.show();
                        break;
                    case Key.delete:
                        if (lastKey == Key.ctrl) {
                            flag = true;
                            projection.delete();
                            flag = false;
                        }
                        break;
                    case "z":
                        if (lastKey == Key.ctrl) {
                            flag = true;
                            self.state.undo();
                            flag = false;
                        }
                        break;
                    case 'g':
                        if (lastKey === Key.ctrl) {
                            self.openConv();
                            event.preventDefault();
                        }
                        break;
                    default:
                        break;
                }
            }, false);

            container.addEventListener(EventType.KEYDOWN, function (event) {
                var target = event.target;
                var parent = target.parentElement;
                var projection = self.getProjection(target.id);

                switch (event.key) {
                    case Key.backspace:
                        if (self.abstract.isEnum(projection.type)) {
                            projection.value = "";
                        }
                        break;
                    case Key.ctrl:
                        lastKey = Key.ctrl;
                        event.preventDefault();
                        break;
                    case Key.delete:
                        if (self.abstract.isEnum(projection.type)) {
                            projection.value = "";
                            // remove text content only
                            // target.firstChild.nodeValue = "";
                        }
                        break;
                    case Key.enter:
                        self.autocomplete.hasFocus = false;
                        target.blur(); // remove focus

                        event.preventDefault();

                        break;
                    case Key.tab:
                        self.autocomplete.hasFocus = false;

                        break;
                    case "z":
                    case 'g':
                        if (lastKey == Key.ctrl) {
                            event.preventDefault();
                        }

                        break;
                    default:
                        break;
                }

                if (event.key.length === 1) {
                    $.removeClass(target, UI.EMPTY);
                    $.removeClass(parent, UI.EMPTY);
                }
            }, false);

            self.body.addEventListener(EventType.FOCUSIN, function (event) {
                self.autocomplete.hide();

                var target = event.target;
                var projection = self.getProjection(target.id);

                currentContainer = findLine(target);
                if (currentContainer) {
                    $.addClass(currentContainer, 'current');
                }

                var data = [];

                if ($.hasClass(target, 'option')) {
                    let path = target.getAttribute('data-path');
                    let position = target.getAttribute('data-position');
                    position = position.split('..');
                    var min = position[0];
                    var max = position[1];

                    var index = target.dataset['index'];
                    var parentMElement = self.options[+index];

                    data = parentMElement.options.filter(function (x) {
                        return x.position >= min && x.position <= max;
                    });
                    data = data.map(function (el) { return { val: el.name, element: el }; });

                    self.autocomplete.init(target, data);
                    self.autocomplete.onSelect = function (val) {
                        autocomplete_option_handler(val, target, data);
                        self.save();
                    };
                } else if (projection) {
                    projection.focusIn();
                    events.emit('editor.change', projection);
                    preval = projection.value;

                    if (isExtension(projection)) {
                        data = projection.valuesKV();
                        self.autocomplete.onSelect = function (attr) {
                            let line = projection.implement(attr.key);
                            $.getElement(f_class(EL.ATTRIBUTE), line).focus();
                        };

                        self.autocomplete.init(target, data);
                    }
                    else if (isPointer(projection) || isEnum(projection)) {
                        data = projection.valuesKV();
                        self.autocomplete.onSelect = function (attr) {
                            projection.value = attr.key;
                            projection.focus();
                        };
                        self.autocomplete.init(target, data);
                    } else
                        return;
                }
            }, false);

            self.body.addEventListener(EventType.FOCUSOUT, function (event) {
                if (flag) {
                    flag = false;
                    return;
                }

                if (self.autocomplete.hasFocus && self.autocomplete.input == target) {
                    return;
                }

                var target = event.target;
                if (currentContainer) $.removeClass(currentContainer, 'current');

                if ($.hasClass(target, 'attr')) {
                    let projection = self.getProjection(target.id);

                    if (projection) {
                        projection.focusOut();
                        projection.update();
                        if (preval !== projection.value) {
                            self.save();
                        }
                    }

                    if (self.autocomplete.hasFocus) {
                        setTimeout(function () { validation_handler(target); }, 100);
                    } else {
                        validation_handler(target);
                    }
                }
            }, false);

            function validation_handler(target) {
                const ERROR = 'error';

                var parent = target.parentElement;
                var projection = self.getProjection(target.id);
                var lblError = $.getElement(hash(target.id + 'error'), parent);

                if (projection.validate()) {
                    if (lblError) {
                        lblError.parentElement.className = 'attr-validation-valid';
                        $.removeChildren(lblError);
                        $.hide(lblError);
                    }
                    $.removeClass(target, ERROR);
                } else {
                    if (!lblError) {
                        lblError = $.createSpan({ id: target.id + 'error', class: 'error-marker' });
                        let container = $.createSpan();
                        target.insertAdjacentElement('beforebegin', container);
                        container.appendChild(target);
                        container.appendChild(lblError);
                    }
                    lblError.innerHTML = projection.error;
                    lblError.parentElement.className = 'attr-validation-error';
                    $.addClass(target, ERROR);
                    $.show(lblError);
                }
            }

            function autocomplete_option_handler(val, eHTML, data) {
                const COMPOSITION = 'composition';

                var path = eHTML.dataset['path'];
                var index = eHTML.dataset['index'];
                var parentMElement = self.options[+index];
                var compo = parentMElement.composition;
                var element = _.cloneObject(val.element);
                element.flag = true;

                compo.push(element);
                compo.sort(function (a, b) { return a.position - b.position; });

                // render element
                var mElement = self.abstract.createModelElement(element);
                mElement.parent = parentMElement;
                parentMElement.elements.push(mElement);

                mElement.path = path + '[' + (compo.length - 1) + ']';
                var line = mElement.render(path + '[' + (compo.length - 1) + ']');
                Object.assign(line.dataset, { prop: COMPOSITION, position: element.position });

                $.insertBeforeElement(eHTML, line);

                // update options
                if (!element.multiple) {
                    eHTML.remove();
                    parentMElement.options = parentMElement.options.filter(function (x) {
                        return x.name !== element.name;
                    });
                    // add options
                    data = data.map(function (x) { return x.element; });
                    var left = data.filter(function (x) { return x.position < element.position; });
                    var right = data.filter(function (x) { return x.position > element.position; });

                    if (left.length > 0) {
                        left.sort(function (a, b) { return a.position - b.position; });
                        let input = $.createOptionSelect(left[0].position, left[left.length - 1].position, path);
                        input.dataset.index = index;
                        $.insertBeforeElement(line, input);
                    }
                    if (right.length > 0) {
                        right.sort(function (a, b) { return a.position - b.position; });
                        let input = $.createOptionSelect(right[0].position, right[right.length - 1].position, path);
                        input.dataset.index = index;
                        $.insertAfterElement(line, input);
                    }
                }

                var firstAttribute = $.getElement(f_class(EL.ATTRIBUTE), line);
                if (firstAttribute) firstAttribute.focus();
            }

            function getParent(eHTML, className) {
                var parent = eHTML.parentElement;
                return $.hasClass(parent, className) ? parent : parent.parentElement;
            }

            mql.addListener(handleWidthChange);

            function handleWidthChange(mql) {
                self.resize();
            }

            function findParent(keyword) {
                var parent = self.currentLine.parentElement;
                while (parent.parentElement.id != 'container') {
                    if ($.getElement(dot('keyword'), parent).innerHTML == keyword)
                        return parent;
                    parent = parent.parentElement;
                }
                return parent;
            }

            /**
             * Returns the
             * @param {HTMLElement} el 
             * @returns {null|HTMLElement}
             */
            function findLine(el) {
                var parent = el.parentElement;
                if ($.hasClass(parent, 'removable')) return parent;
                if (parent.isSameNode(container)) return null;
                return findLine(parent);
            }

            /**
             * Returns a value indicating whether the projection is an Enum
             * @param {Object} projection 
             */
            function isEnum(projection) { return PROJ.Enum.isPrototypeOf(projection); }

            /**
             * Returns a value indicating whether the projection is an Extension
             * @param {Object} projection 
             */
            function isExtension(projection) { return PROJ.Abstract.isPrototypeOf(projection); }

            /**
             * Returns a value indicating whether the projection is a Pointer
             * @param {Object} projection 
             */
            function isPointer(projection) { return PROJ.Pointer.isPrototypeOf(projection); }
        }
    };

    /**
     * This functions clears the container.
     * It removes all contents and stylesheets applied by previous models.
     */
    function clear() {
        clearBody();
        // clear aside section
        var aside = $.getElement(dot('note'), container);
        if (aside) {
            $.removeChildren(aside);
            aside.remove();
        }
        // remove stylesheets
        var links = $.getElements('.gentleman-css');
        for (let i = 0, len = links.length; i < len; i++) {
            links.item(i).remove();
        }
    }
    function clearBody() {
        // clear body section
        var body = $.getElement(dot('body'), container);
        if (body) {
            $.removeChildren(body);
            body.remove();
        }
    }

    function removeAccents(str) {
        if (String.prototype.normalize) {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        }
        return str.replace(/[àâäæ]/gi, 'a')
            .replace(/[ç]/gi, 'c')
            .replace(/[éèê]/gi, 'e')
            .replace(/[îï]/gi, 'i')
            .replace(/[ôœ]/gi, 'o')
            .replace(/[ùûü]/gi, 'u');
    }

    (function init() {
        var modelTest = {
            "project": {
                "name": "project",
                "attr": {
                    "short_name": { "name": "short_name", "type": "ID" },
                    "name": { "name": "name", "type": "string" }
                },
                "composition": [
                    {
                        "name": "Screening section",
                        "position": 1,
                        "optional": true,
                        "attr": {
                            "screen_action": { "name": "screen_action", "type": "ID", "optional": true },
                            "screening": {
                                "name": "screening", "type": "screening",
                                "multiple": { "type": "array", "min": 1 }
                            }
                        },
                        "representation": {
                            "type": "text",
                            "k1": { "type": "keyword", "val": "SCREENING" },
                            "val": "$k1 #screen_action #screening"
                        }
                    },
                    {
                        "name": "Question/Answer section",
                        "position": 2,
                        "optional": true,
                        "attr": {
                            "qa_action": { "name": "qa_action", "type": "ID", "optional": true },
                            "quality_assess": {
                                "name": "quality_assess", "type": "qa",
                                "multiple": { "type": "array", "min": 0 }
                            }
                        },
                        "representation": {
                            "type": "text",
                            "k1": { "type": "keyword", "val": "QA" },
                            "val": "$k1 #qa_action #quality_assess"
                        }
                    },
                    {
                        "name": "Data extraction section",
                        "position": 3,
                        "attr": {
                            "class_action": { "name": "class_action", "type": "ID", "optional": true },
                            "category": {
                                "name": "category", "type": "category",
                                "multiple": { "type": "array", "min": 1 }, "inline": false
                            }
                        },
                        "representation": {
                            "type": "text",
                            "k1": { "type": "keyword", "val": "DATA EXTRACTION" },
                            "val": "$k1 #class_action #category"
                        }
                    },
                    {
                        "name": "Report section",
                        "keyword": "",
                        "position": 4,
                        "optional": true,
                        "attr": {
                            "reporting": {
                                "name": "reporting", "type": "report",
                                "multiple": { "type": "list" }, "inline": false
                            }
                        },
                        "representation": {
                            "type": "text",
                            "k1": { "type": "keyword", "val": "SYNTHESIS" },
                            "val": "$k1 #reporting"
                        }
                    }
                ],
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "PROJECT" },
                    "val": "$k1 #short_name #name $composition"
                }
            },
            "screening": {
                "name": "screening",
                "composition": [{
                    "name": "reviews",
                    "keyword": "Reviews",
                    "position": 1,
                    "attr": { "review_per_paper": { "name": "review_per_paper", "type": "integer", "val": "2" } },
                    "representation": { "type": "text", "val": "$keyword #review_per_paper" }
                }, {
                    "name": "conflict",
                    "keyword": "Conflict",
                    "position": 2,
                    "attr": {
                        "conflict_type": { "name": "conflict_type", "type": "conflictType" },
                        "conflict_resolution": { "name": "conflict_resolution", "type": "conflictResolution", "val": "unanimity" }
                    },
                    "representation": { "type": "text", "val": "$keyword on #conflict_type resolved by #conflict_resolution" }
                }, {
                    "name": "criteria",
                    "keyword": "Criteria",
                    "position": 3,
                    "attr": {
                        "exclusion_criteria": {
                            "name": "exclusion_criteria", "type": "string",
                            "multiple": { "type": "array", "min": 1 }
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword = [#exclusion_criteria]" }
                }, {
                    "name": "sources",
                    "keyword": "Sources",
                    "position": 4,
                    "optional": true,
                    "attr": {
                        "source_papers": {
                            "name": "source_papers", "type": "string",
                            "multiple": { "type": "array" }
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword = [#source_papers]" }
                }, {
                    "name": "strategies",
                    "keyword": "Strategies",
                    "position": 5,
                    "optional": true,
                    "attr": {
                        "search_strategy": {
                            "name": "search_strategy", "type": "string",
                            "multiple": { "type": "array", "min": 0 }
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword = [#search_strategy]" }
                }, {
                    "name": "validation",
                    "keyword": "Validation",
                    "position": 6,
                    "optional": true,
                    "attr": {
                        "validation_percentage": { "name": "validation_percentage", "type": "integer", "val": "20", "min": 0, "max": 100 },
                        "validation_assignment_mode": { "name": "validation_assignment_mode", "type": "assignmentMode", "val": "normal", "optional": true }
                    },
                    "representation": { "type": "text", "val": "$keyword #validation_percentage% #validation_assignment_mode" }
                }, {
                    "name": "phases",
                    "keyword": "Phases",
                    "position": 7,
                    "optional": true,
                    "attr": {
                        "phases": {
                            "name": "phases", "type": "phase",
                            "multiple": { "type": "array", "min": 0 },
                            "inline": false
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword #phases" }
                }],
                "representation": { "type": "text", "val": "$composition" }
            },
            "phase": {
                "name": "phase",
                "attr": {
                    "title": { "name": "title", "type": "string" },
                    "description": { "name": "description", "type": "string", "optional": true },
                    "fields": {
                        "name": "fields", "type": "field",
                        "multiple": { "type": "array" }
                    }
                },
                "representation": { "type": "text", "val": "#title #description Fields (#fields)" }
            },
            "qa": {
                "name": "qa",
                "composition": [{
                    "name": "questions",
                    "keyword": "Questions",
                    "position": 1,
                    "attr": {
                        "question": {
                            "name": "question", "type": "string",
                            "multiple": { "type": "array", "min": 1 }
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword [#question]" }
                }, {
                    "name": "response",
                    "keyword": "Response",
                    "position": 2,
                    "attr": {
                        "response": {
                            "name": "response", "type": "response",
                            "multiple": { "type": "array", "min": 1 },
                            "inline": true
                        }
                    },
                    "representation": { "type": "text", "val": "$keyword [#response]" }
                }, {
                    "name": "min_score",
                    "keyword": "Min_score",
                    "position": 3,
                    "attr": { "min_score": { "name": "min_score", "type": "double" } },
                    "representation": { "type": "text", "val": "$keyword #min_score" }
                }],
                "representation": { "type": "text", "val": "$composition" }
            },
            "response": {
                "name": "response",
                "attr": {
                    "title": { "name": "title", "type": "string" },
                    "score": { "name": "score", "type": "double" }
                },
                "representation": { "type": "text", "val": "#title:#score" }
            },
            "double": {
                "name": "double",
                "type": "data-type",
                "format": "[0-9]+([.][0-9]+)?"
            },
            "report": {
                "name": "report",
                "attr": {
                    "name": { "name": "name", "type": "ID" },
                    "title": { "name": "title", "type": "string", "optional": true },
                    "value": { "name": "value", "type": "IDREF", "ref": "category" },
                    "chart": {
                        "name": "chart", "type": "graphType",
                        "multiple": { "type": "array" }
                    }
                },
                "abstract": true,
                "extensions": ["simple_graph", "compare_graph"]
            },
            "simple_graph": {
                "name": "simple_graph",
                "keyword": "Simple",
                "base": "report",
                "representation": { "type": "text", "val": "$keyword #name #title on #value charts(#chart)" }
            },
            "compare_graph": {
                "name": "compare_graph",
                "keyword": "Compare",
                "base": "report",
                "attr": { "reference": { "name": "reference", "type": "IDREF", "ref": "category" } },
                "representation": {
                    "type": "text",
                    "val": "$keyword #name #title on #value with #reference charts(#chart)"
                }
            },
            "category": {
                "name": "category",
                "attr": {
                    "name": { "name": "name", "type": "ID" },
                    "title": { "name": "title", "type": "string", "optional": true },
                    "mandatory": { "name": "mandatory", "type": "boolean", "representation": { "val": "*" }, "val": true },
                    "numberOfValues": {
                        "name": "numberOfValues", "type": "integer", "val": "1",
                        "rule": { "greaterThan": -1, "equalTo": -1 },
                        "ruleset": [{ "greaterThan": -1, "equalTo": -1 }],
                        "representation": { "type": "text", "val": "[$val]" }
                    },
                    "subCategory": {
                        "name": "subCategory", "type": "category",
                        "multiple": { "type": "array", "min": 1 },
                        "representation": { "type": "text", "val": "{$val}" }
                    }
                },
                "named_composition": [{ "name": "subCategory", "type": "category", "multiple": true }],
                "abstract": true,
                "extensions": ["freeCategory", "staticCategory", "independantDynamicCategory", "dependantDynamicCategory"]
            },
            "freeCategory": {
                "name": "freeCategory",
                "keyword": "Simple",
                "base": "category",
                "attr": {
                    "type": { "name": "type", "type": "simpleType", "val": "string" },
                    "max_char": {
                        "name": "max_char", "type": "integer", "optional": true,
                        "representation": { "type": "text", "val": "($val)" }
                    },
                    "pattern": {
                        "name": "pattern", "type": "string", "optional": true,
                        "representation": { "type": "text", "val": "style($val)" }
                    },
                    "initial_value": {
                        "name": "initial_value", "type": "string", "optional": true,
                        "representation": { "type": "text", "val": "= [$val]" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "$keyword #name #title #mandatory #numberOfValues : #type #max_char #pattern #initial_value #subCategory"
                }
            },
            "staticCategory": {
                "name": "staticCategory",
                "keyword": "List",
                "base": "category",
                "attr": {
                    "values": {
                        "name": "values", "type": "string",
                        "multiple": { "type": "array", "min": 1 }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "$keyword #name #title #mandatory #numberOfValues = [#values] #subCategory"
                }
            },
            "independantDynamicCategory": {
                "name": "independantDynamicCategory",
                "keyword": "DynamicList",
                "base": "category",
                "attr": {
                    "reference_name": { "name": "reference_name", "type": "string" },
                    "initial_values": {
                        "name": "initial_values", "type": "string",
                        "multiple": { "type": "array", "min": 1 },
                        "representation": { "type": "text", "val": "= [$val]" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "$keyword #name #title #mandatory #numberOfValues #reference_name #initial_values #subCategory"
                }
            },
            "dependantDynamicCategory": {
                "name": "dependantDynamicCategory",
                "keyword": "DynamicList",
                "base": "category",
                "attr": { "depends_on": { "name": "depends_on", "type": "IDREF", "ref": "category" } },
                "representation": {
                    "type": "text",
                    "val": "$keyword #name #title #mandatory #numberOfValues depends on #depends_on #subCategory"
                }
            },
            "simpleType": {
                "name": "simpleType",
                "type": "enum",
                "values": {
                    "bool": { "representation": { "type": "text", "val": "bool" } },
                    "date": { "representation": { "type": "text", "val": "date #max" } },
                    "int": { "representation": { "type": "text", "val": "int #max" } },
                    "real": { "representation": { "type": "text", "val": "real #max" } },
                    "string": { "representation": { "type": "text", "val": "string #max" } },
                    "text": { "representation": { "type": "text", "val": "text #max" } }
                }
            },
            "assignmentMode": {
                "name": "assignmentMode",
                "type": "enum",
                "values": {
                    "info": "Info",
                    "normal": "Normal",
                    "veto": "Veto"
                }
            },
            "conflictType": {
                "name": "conflictType",
                "type": "enum",
                "values": {
                    "exclusionCriteria": { "val": "Criteria" },
                    "includeExclude": { "val": "Decision" }
                }
            },
            "conflictResolution": {
                "name": "conflictResolution",
                "type": "enum",
                "values": {
                    "majority": { "val": "Majority", "representation": { "type": "text", "val": "$val" } },
                    "unanimity": { "val": "Unanimity", "representation": { "type": "text", "val": "$val" } }
                }
            },
            "graphType": {
                "name": "graphType",
                "type": "enum",
                "values": ["bar", "line", "pie"]
            },
            "field": {
                "name": "field",
                "type": "enum",
                "values": ["abstract", "bibtex", "link", "preview", "title"]
            },
            "@root": "project",
            "@config": {
                "language": "ReLiS",
                "settings": {
                    "autosave": true
                }
            },
            "@resources": ["relis.css"]
        };

        var header = $.createHeader({ id: 'header', class: 'editor-header' });
        var headerContent = $.createDiv({ class: "content-wrapper editor-header-content" });

        var splashscreen = $.createDiv({ id: 'splashscreen', class: 'splashscreen' });
        var instruction = $.createP({ class: 'instruction-container font-gentleman' });

        switch (__ENV) {
            case Environment.TEST:
                var editor = Editor.create(modelTest);
                headerContent.appendChild($.createSpan({ id: 'language', class: 'model-language', text: editor.language }));
                Menu.create().init(editor, headerContent);
                header.appendChild(headerContent);
                $.appendChildren(container, [header, splashscreen]);
                Note.create().init(editor, container);
                editor.init();

                break;
            case Environment.PROD:
                var lblSelector = $.createLabel({ class: [EL.BUTTON, 'btn-loader', UI.HIDDEN], text: "Load a Metamodel" });
                var inputSelector = $.createFileInput({ id: 'fileInput', accept: '.json' });
                inputSelector.addEventListener('change', function (e) {
                    var file = this.files[0];
                    var reader = new FileReader();
                    if (file.name.endsWith('.json')) {
                        reader.onload = function (e) {
                            // empty container
                            clear();
                            $.hide(lblSelector);
                            editor = Editor.create(JSON.parse(reader.result));
                            headerContent.appendChild($.createSpan({ id: 'language', class: 'model-language', text: editor.language }));
                            Menu.create().init(editor, headerContent);
                            header.appendChild(headerContent);
                            SmartType(instruction, [
                                { type: 0, val: "Good news! Your Metamodel is valid and has been successfully loaded." },
                                { type: 0, val: "\nTo continue, open a saved model or create a new one." }
                            ], function () { });
                        };
                        reader.readAsText(file);
                    } else {
                        alert("File not supported!");
                    }
                });
                lblSelector.appendChild(inputSelector);
                $.appendChildren(splashscreen, [instruction, lblSelector]);
                $.appendChildren(container, [header, splashscreen]);
                SmartType(instruction, [
                    { type: 0, val: "Hello friend, welcome to " },
                    { type: 1, val: "Gentleman" },
                    { type: 0, val: ".\nTo begin, please load a " },
                    { type: 2, val: "Metamodel.", tooltip: "A metamodel is ..." }
                ], function () { $.show(lblSelector); });

                break;
        }
    })();

    /**
     * Move element out of screen
     * @param {HTMLElement} el Element
     */
    function fakeHide(el) {
        Object.assign(el, { position: 'absolute', top: '-9999px', left: '-9999px' });
        return el;
    }

    /**
     * This function simulates the typing
     * @param {HTMLElement} container 
     * @param {string} content 
     * @param {Function} callback
     */
    function SmartType(container, content, callback) {
        var i = 0,
            index = 0,
            len = 0,
            count = content.length;
        content.forEach(function (T) { len += T.val.length; });
        var timeout = Math.ceil(20 + Math.log(len) * (200 / len));
        var current = container;

        var a = setInterval(function () {
            var part = content[index];
            var char = part.val[i];

            if (char === '\n') {
                current.appendChild($.createLineBreak());
            } else {
                switch (+part.type) {
                    case 0: // normal
                        break;
                    case 1: // bold
                        if (i === 0) {
                            let strong = $.createStrong();
                            current.appendChild(strong);
                            current = strong;
                        }
                        break;
                    case 2: // italic
                        if (i === 0) {
                            let em = $.createEm();
                            if (part.tooltip) em.dataset.tooltip = part.tooltip;
                            current.appendChild(em);
                            current = em;
                        }
                        break;
                    case 3: // underline
                        break;
                    default:
                        break;
                }
                current.innerHTML += char;
            }
            i++;

            if (i === part.val.length) {
                current = container;
                i = 0;
                index++;
            }

            if (index === count) {
                clearInterval(a);
                if (callback) callback();
            }
        }, timeout);
    }

    return Editor;
})(UTIL, HELPER, Autocomplete, MetaModel, Projection, Exception);