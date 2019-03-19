import { State } from './state';
import { UTILS as $, HELPER as _ } from '@utils';
import { Autocomplete } from '@src/autocomplete';
import { Exception as ERR } from '@src/exception';
import { MetaModel as _MODEL } from '@src/model';
import * as Projection from '@src/projection/fn';
import { Key, EventType, UI } from '@src/enums';
import { events } from '@src/pubsub';

const container = $.getElement("[data-gentleman-editor]");
container.tabIndex = -1;

const METAMODEL_GENTLEMAN = {
    "grammar": {
        "name": "grammar",
        "attr": {
            "root": {
                "name": "root", "type": "IDREF", "ref": "element", "optional": true,
                "representation": { "type": "text", "val": "root: $val" }
            },
        },
        "composition": [
            {
                "name": "Elements",
                "position": 1,
                "multiple": true,
                "attr": {
                    "base": { "name": "base", "type": "string", "ref": "element" },
                    "rule": {
                        "name": "rule", "type": "element",
                        "multiple": { "type": "list", "min": 1, "separator": " " },
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Rules &NL #rule"
                }
            },
            {
                "name": "Data Type",
                "position": 2,
                "optional": true,
                "attr": {
                    "datatype": {
                        "name": "datatype", "type": "datatype",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Data types &NL #datatype"
                }
            },
            {
                "name": "Enumeration",
                "position": 3,
                "optional": true,
                "attr": {
                    "enum": {
                        "name": "enum", "type": "enum",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Enums &NL #enum"
                }
            },
            {
                "name": "Configuration",
                "position": 4,
                "attr": {
                    "config": { "name": "config", "type": "config" }
                },
                "representation": {
                    "type": "text",
                    "val": "Configuration &NL #config"
                }
            },
        ],
        "representation": {
            "type": "text",
            "k1": { "type": "keyword", "val": "GRAMMAR DEFINITION" },
            "val": "$k1 &NL Begin with #root $composition"
        }
    },
    "config": {
        "name": "config",
        "attr": {
            "language": {
                "name": "language", "type": "string",
                "description": "The name of the grammar",
                "representation": { "type": "text", "val": "language: $val" }
            }
        },
        "representation": {
            "type": "text",
            "val": "#language"
        }
    },
    "POS": {
        "name": "POS",
        "attr": {
            "id": { "name": "name", "type": "string" },
            "name": { "name": "name", "type": "ID" },
            "description": { "name": "description", "type": "string", "optional": true }
        },
        "abstract": true,
        "extensions": ["type", "attribute"]
    },
    "type": {
        "name": "type",
        "base": "POS",
        "abstract": true,
        "extensions": ["datatype", "baserule", "enum"]
    },
    "attribute": {
        "name": "attribute",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "type": { "name": "type", "type": "string", "val": "string" },
            "optional": { "name": "optional", "type": "presence", "val": "required" },
            "multiple": { "name": "multiple", "type": "multiplicity", "val": "single" },
            "min": { "name": "min", "type": "integer", "val": "-1" },
            "max": { "max": "min", "type": "integer", "val": "-1" }
        },
        "representation": {
            "type": "text",
            "val": "#name: #type #optional #multiple"
        }
    },
    "element": {
        "name": "element",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "output": { "name": "output", "type": "raw" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Attributes" },
                    "val": "#attributes"
                }
            },
            {
                "name": "Nested rule",
                "position": 2,
                "optional": true,
                "attr": {
                    "rules": {
                        "name": "rules", "type": "subelement",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Nested Rules" },
                    "val": "#rules"
                }
            },
        ],
        "representation": {
            "type": "text",
            "val": "#name := #output $composition"
        }
    },
    "subelement": {
        "name": "subelement",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "output": { "name": "output", "type": "raw" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Attributes" },
                    "val": "#attributes"
                }
            },
        ],
        "representation": {
            "type": "text",
            "val": "../ #output $composition"
        }
    },
    "datatype": {
        "name": "datatype",
        // "base": "type",
        "attr": {
            "format": { "name": "format", "type": "string" },
            "base": {
                "name": "type", "type": "primitive", "val": "string", "optional": true,
                "representation": { "type": "text", "val": "base: $val" }
            }
        },
        "representation": {
            "type": "text",
            "val": "#format #base"
        }
    },
    "baserule": {
        "name": "baserule",
        "base": "type",
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list" }
                    }
                }
            },
            {
                "name": "Nested rules",
                "position": 2,
                "attr": {
                    "rules": {
                        "name": "rules", "type": "nestedrule",
                        "multiple": { "type": "list", "min": 1 }
                    }
                }
            }
        ]
    },
    "enum": {
        "name": "enum",
        // "base": "type",
        "attr": {
            "format": { "name": "format", "type": "string" },
            "base": { "name": "type", "type": "primitive", "val": "string" }
        },
        "composition": [
            {
                "name": "Values",
                "position": 1,
                "multiple": true,
                "attr": {
                    "id": { "name": "id", "type": "string" },
                    "val": { "name": "val", "type": "string" }
                },
                "representation": {
                    "type": "text",
                    "val": "#id: #val"
                }
            }
        ],
        "representation": {
            "type": "text",
            "val": "#format:#base $composition"
        }
    },
    "nestedrule": {
        "name": "nestedrule",
        "base": "POS",
        "attr": {
            "position": { "name": "position", "type": "string" },
            "optional": { "name": "optional", "type": "integer" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list" }
                    }
                }
            }
        ]
    },
    "abstractrule": {
        "name": "abstractrule",
        "base": "baserule",
        "attr": {
            "extensions": {
                "name": "extensions", "type": "IDREF", "ref": "concreterule",
                "multiple": { "type": "list" }
            }
        }
    },
    "concreterule": {
        "name": "concreterule",
        "base": "baserule",
        "attr": {
            "base": { "name": "base", "type": "IDREF", "ref": "abstractrule", "optional": true }
        },
        "composition": ["representation"]
    },
    "representation": {
        "name": "representation",
        "attr": {
            "val": { "name": "val", "type": "string" },
            "inline": { "name": "inline", "type": "boolean", "val": "false" }
        },
        "abstract": true,
        "extensions": ["representationText"]
    },
    "representationText": {
        "name": "representationText",
        "base": "representation",
        "attr": {
            "name": { "name": "name", "type": "string" },
            "position": { "name": "position", "type": "integer" }
        },
        "abstract": true,
        "extensions": ["representationTextKeyword", "representationTextAttribute"]
    },
    "representationTextAttribute": {
        "name": "representationTextAttribute",
        "base": "representationText",
        "attr": {
            "attribute": { "name": "attribute", "type": "IDREF", "ref": "attribute" }
        }
    },
    "representationTextKeyword": {
        "name": "representationTextKeyword",
        "base": "representationText",
        "attr": {
            "value": { "name": "value", "type": "string" }
        }
    },
    "output": {
        "name": "output",
        "attr": {
            "name": { "name": "name", "type": "string" },
            "position": { "name": "position", "type": "integer" },
            "attribute": { "name": "attribute", "type": "IDREF", "ref": "attribute" }
        }
    },
    "primitive": {
        "name": "primitive",
        "type": "enum",
        "values": {
            "integer": "integer",
            "string": "string",
            "date": "date",
            "ID": "ID",
            "IDREF": "IDREF",
            "real": "real"
        }
    },
    "multiplicity": {
        "name": "multiplicity",
        "type": "enum",
        "values": {
            "single": "single",
            "multiple": "multiple"
        }
    },
    "presence": {
        "name": "presence",
        "type": "enum",
        "values": {
            "required": "required",
            "optional": "optional"
        }
    },
    "@root": "grammar",
    "@config": {
        "language": "Gentleman",
        "settings": {
            "autosave": true
        }
    }
};

const DOC = typeof module !== 'undefined' && module.exports ? {} : document;
const EL = UI.Element;
const EditorMode = {
    READ: 'read',
    EDIT: 'edit'
};

// Indicates whether the display is mobile mode
var MOBILE = $.windowWidth <= 700;

/**
 * Preprend a string with a dot symbol
 * @param {string} str 
 * @returns {string}
 */
function dot(str) { return '.' + str; }

/**
 * Preprend a string with a hash symbol
 * @param {string} str 
 * @returns {string}
 */
function hash(str) { return '#' + str; }

function f_class(el) { return dot(el.class); }

// Allow responsive design
var mql = window.matchMedia('(max-width: 800px)');

/**
   * @lends Editor
   */
export const Editor = {
    /** @type {state} */
    state: State.create(),
    menu: null,
    note: null,
    MM: null,
    create(metamodel) {
        const KEY_CONFIG = '@config';
        const KEY_RESOURCE = '@resources';

        var instance = Object.create(this);
        instance.MM = metamodel;

        // display language
        if (metamodel[KEY_CONFIG]) {
            let config = metamodel[KEY_CONFIG];
            if (config.language) {
                instance._language = config.language;
            }
        }

        // add stylesheets
        if (metamodel[KEY_RESOURCE]) {
            let dir = '../assets/css/';

            // remove stylesheets applied by previous meta-models
            var links = $.getElements(dot('gentleman-css'));
            for (let i = 0, len = links.length; i < len; i++) {
                links.item(i).remove();
            }
            metamodel[KEY_RESOURCE].forEach(function (name) {
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

        return {
            init(model) { instance.init(model); },
            code() { instance.code(); },
            get language() { return instance.language; },
            get model() { return instance.concrete; },
            get state() { return instance.state; },
            get mode() { return instance._mode; },
            set mode(val) {
                instance._mode = val;
                const READ_MODE = 'read-mode';
                switch (val) {
                    case EditorMode.EDIT:
                        // remove read mode styles from the body
                        $.removeClass(instance.body, READ_MODE);

                        // restore attributes editable state
                        instance.projections.forEach(function (p) { p.enable(); });

                        break;
                    case EditorMode.READ:
                        // apply read mode styles to the body 
                        $.addClass(instance.body, READ_MODE);

                        // disable all attributes => readonly
                        instance.projections.forEach(function (p) { p.disable(); });

                        break;
                }
            },
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
            save() { instance.save(); },
            copy() {
                var el = $.createTextArea({ value: instance.abstract.toString(), readonly: true });
                $.fakeHide(el);
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
    /** @type {string} */
    get language() { return this._language; },

    /** @type {Autocomplete} */
    get autocomplete() { return this._autocomplete; }, // autocomplete element
    /** @type {Projection[]} */
    get projections() { return this.abstract.projections; },
    get options() { return this.abstract.options; },

    /** @returns {HTMLElement} */
    get currentLine() { return this._currentLine; }, // current line in representation
    set currentLine(val) { this._currentLine = val; },
    /** @returns {HTMLElement} */
    get body() { return this._body; },

    /** @type {boolean} */
    get isInitialized() { return this._isInitialized; },
    /** @type {boolean} */
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
        self.state.set(self.concrete);
        events.emit('editor.save');
    },
    clear() {
        var self = this;
        $.removeChildren(self.body);
        events.emit('editor.clear');
    },
    init(model) {
        this.abstract = _MODEL.create(this.MM);
        try {
            this.concrete = model ? model : this.abstract.createModel();
        } catch (error) {
            container.appendChild($.createP({ class: 'body', text: error.toString() }));
            return;
        }
        this.abstract.init(this._concrete);
        this.current = this.abstract.createModelElement(this.concrete.root, true);

        // set the initial state
        this.state.init(this.concrete);
        events.emit('editor.state.initialized');

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
            // add the event handlers
            this.bindEvents();
            this._isInitialized = true;
        }
    },
    code() {
        this.abstract = _MODEL.create(METAMODEL_GENTLEMAN);
        this.concrete = this.abstract.createModel();
        this.abstract.init(this._concrete);
        this.current = this.abstract.createModelElement(this.concrete.root, true);

        // set the initial state
        this.state.init(this.concrete);

        // clear the body
        this.clear();
        this.currentLine = this.body;
        $.hide($.getElement(hash('splashscreen')));

        // draw the editor
        this.render();
    },
    render() {
        if (!this.isInitialized) {
            $.preprendChild(container, this.body);
        }

        this.currentLine.appendChild(this.current.render());
        this.currentLine = this.currentLine.firstChild;
        this.currentLine.contentEditable = false;
    },
    bindEvents() {
        var self = this;

        var currentContainer,
            lastKey;
        var flag = false;
        var handled = false;

        self.body.addEventListener(EventType.CLICK, function (event) {
            if (!handled) {
                self.autocomplete.hide();
            } else {
                handled = false;
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
                    if (lastKey == Key.ctrl) {
                        if (projection && !projection.isDisabled) showAutoComplete(projection);
                    }
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
                    // chat terminal
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
                case Key.escape:
                    self.autocomplete.hide();

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
            handled = true;

            var target = event.target;
            var projection = self.getProjection(target.id);

            currentContainer = findLine(target);
            if (currentContainer) {
                $.addClass(currentContainer, 'current');
            }

            var data = [];

            if ($.hasClass(target, 'option')) {
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
                    optionHandler(val, target, data);
                };
            } else if (projection) {
                if (projection.isDisabled) return;
                projection.focusIn();
                events.emit('editor.change', projection);

                if (Projection.isExtension(projection)) {
                    data = projection.valuesKV();
                    self.autocomplete.onSelect = function (attr) {
                        let line = projection.implement(attr.key);
                        $.getElement(f_class(EL.ATTRIBUTE), line).focus();
                    };

                    self.autocomplete.init(target, data);
                } else if (Projection.isPointer(projection) || Projection.isEnum(projection)) {
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

            if ($.hasClass(target, EL.ATTRIBUTE.class)) {
                let projection = self.getProjection(target.id);
                if (projection.isDisabled) return;

                if (projection) {
                    projection.focusOut();
                    projection.update();
                }

                if (self.autocomplete.hasFocus) {
                    setTimeout(function () { validation_handler(target); }, 100);
                } else {
                    validation_handler(target);
                }
            }
        }, false);

        events.on('model.change', function (from) {
            self.save();
        });

        function validation_handler(target) {
            const ERROR = 'error';

            var parent = target.parentElement;
            var projection = self.getProjection(target.id);
            var lblError = $.getElement(hash(target.id + ERROR), parent);

            if (projection.validate()) {
                if (lblError) {
                    lblError.parentElement.className = 'attr-validation-valid';
                    $.removeChildren(lblError);
                    $.hide(lblError);
                }
                $.removeClass(target, ERROR);
            } else {
                if (!lblError) {
                    lblError = $.createSpan({ id: target.id + ERROR, class: 'error-marker' });
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

        function showAutoComplete(projection) {
            var data = [];

            // ignore if autocomplete is open
            if (self.autocomplete.isOpen) return;

            if (Projection.isExtension(projection)) {
                data = projection.valuesKV();
                self.autocomplete.onSelect = function (attr) {
                    let line = projection.implement(attr.key);
                    $.getElement(f_class(EL.ATTRIBUTE), line).focus();
                };

                self.autocomplete.init(projection._input, data);
            } else if (Projection.isPointer(projection) || Projection.isEnum(projection)) {
                data = projection.valuesKV();
                self.autocomplete.onSelect = function (attr) {
                    projection.value = attr.key;
                    projection.focus();
                };
                self.autocomplete.init(projection._input, data);
            }
        }

        function optionHandler(val, eHTML, data) {
            const COMPOSITION = 'composition';

            var path = eHTML.dataset['path'];
            var index = eHTML.dataset['index'];
            var parentMElement = self.options[+index];
            var compo = parentMElement.composition;
            var element = _.cloneObject(val.element);
            element.flag = true;

            compo.push(element);
            compo.sort(function (a, b) { return a.position - b.position; });
            events.emit('model.change', 'Editor[l.1008]:option');

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
         * @param {HTMLElement} el 
         * @returns {null|HTMLElement}
         */
        function findLine(el) {
            var parent = el.parentElement;
            if ($.hasClass(parent, 'removable')) return parent;
            if (parent.isSameNode(container)) return null;
            return findLine(parent);
        }
    }
};