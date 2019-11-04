import {
    cloneObject, isEmpty, getElement, getElements, createLink, createDiv, createSpan,
    appendChildren, EL, createTextArea, createParagraph, insertAfterElement, insertBeforeElement,
    preprendChild, removeChildren, conceal, addClass, removeClass, hasClass, findAncestor, isHTMLElement
} from 'zenkai';
import { Key, EventType, UI } from '@global/enums.js';
import { MetaModel, Model } from '@model/index.js';
import { hide, show } from '@utils/effects.js';
import { createOptionSelect } from '@utils/interactive.js';
import { Autocomplete } from './autocomplete';
import { State } from './state.js';
import * as Projection from '@projection/field/fn';
import { events } from '@utils/pubsub.js';


const container = getElement("[data-gentleman-editor]");
container.tabIndex = -1;

const DOC = typeof module !== 'undefined' && module.exports ? {} : document;
const ELEMENT = UI.Element;
const EditorMode = {
    READ: 'read',
    EDIT: 'edit'
};

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
    fields: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Model} */
    model: null,
    currentContext: null,
    create() {
        var instance = Object.create(this);

        instance._abstract = null;
        instance._concrete = null;
        instance._current = null;
        instance.fields = [];
        instance._isInitialized = false;

        instance._body = createDiv({ class: 'body' });
        instance._autocomplete = Autocomplete.create();
        instance._mode = false;

        return {
            init(model, metamodel) { instance.init(model, metamodel); },
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
                        removeClass(instance.body, READ_MODE);

                        // restore attributes editable state
                        instance.projections.forEach(function (p) { p.enable(); });

                        break;
                    case EditorMode.READ:
                        // apply read mode styles to the body 
                        addClass(instance.body, READ_MODE);

                        // disable all attributes => readonly
                        instance.projections.forEach(function (p) { p.disable(); });

                        break;
                }
            },
            undo() {
                instance.state.undo();
                instance.setState(cloneObject(instance.state.current));
                events.emit('editor.undo', instance.state.hasUndo);
            },
            redo() {
                instance.state.redo();
                instance.setState(cloneObject(instance.state.current));
                events.emit('editor.redo', instance.state.hasRedo);
            },
            save() { instance.save(); },
            copy() {
                var el = createTextArea({ value: instance.abstract.toString(), readonly: true });
                conceal(el);
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
    get projections() { return this.model.projections; },
    registerField(field) {
        field.id = this.fields.length + 1;
        field.editor = this;
        this.fields.push(field);
    },
    get options() { return this.model.options; },

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
        removeChildren(self.body);
        events.emit('editor.clear');
    },
    init(model, metamodel) {
        if (metamodel) {
            this.initializeMetamodel(metamodel);
        } else {
            // TODO - Add the following functionnality:
            // Get Metamodel from Model
            //   else Prompt the user to give the corresponding metamodel
        }

        try {
            this.model = this.metamodel.createModel();// model ? model : this.abstract.createModel();
        } catch (error) {
            container.appendChild(createParagraph({ class: 'body', text: error.toString() }));
            return;
        }
        this.current = this.model.init(model, this).root;

        // set the initial state
        this.state.init(this.model.schema);
        events.emit('editor.state.initialized');

        // clear the body
        this.clear();
        this.currentLine = this.body;

        // draw the editor
        this.render();

        if (!this.isInitialized) {
            events.emit('editor.initialized');
            // add the event handlers
            this.bindEvents();
            this._isInitialized = true;
        }
    },
    initializeMetamodel(metamodel) {
        this.metamodel = MetaModel.create(metamodel);
        this._language = this.metamodel.language;

        var resources = this.metamodel.resources;
        // add stylesheets
        if (!isEmpty(resources)) {
            let dir = '../assets/css/';

            // remove stylesheets applied by previous meta-models
            var links = getElements('.gentleman-css');
            for (let i = 0, len = links.length; i < len; i++) {
                links.item(i).remove();
            }
            resources.forEach(function (name) {
                DOC.head.appendChild(createLink.stylesheet(dir + name, { class: 'gentleman-css' }));
            });
        }

    },
    render() {
        if (!this.isInitialized) {
            preprendChild(container, this.body);
        }

        this.currentLine.appendChild(this.current.render());
        this.currentLine = this.currentLine.firstChild;
        this.currentLine.contentEditable = false;

        this.infoContainer = createDiv({ class: 'info-container font-ui hidden' });
        this.actionContainer = createDiv({ class: 'action-container hidden' });
        appendChildren(container, [this.infoContainer, this.actionContainer]);
    },
    bindEvents() {
        var self = this;

        var currentContainer,
            lastKey;
        var flag = false;
        var handled = false;

        this.body.addEventListener('click', (event) => {
            var target = event.target;
            var nature = target.dataset['nature'];

            if (nature === 'attribute') {
                console.log("clicked on attribute");
                this.context = target;
            } else {
                console.log(this.model.toString());
                if (this.context === this.body) {
                    // Object.assign(this.actionContainer.style, {
                    //     top: `${event.clientY - self.body.offsetTop}px`,
                    //     left: `${event.clientX - self.body.offsetLeft}px`
                    // });

                    // show(this.actionContainer);
                    // this.context = this.actionContainer;
                } else {
                    hide(this.actionContainer);
                    this.context = target;
                }
            }

        }, false);

        container.addEventListener('keydown', function (event) {
            var target = event.target;
            var parent = target.parentElement;
            var field = self.fields[target.id - 1];
            var rememberKey = true;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    break;
                case Key.delete:
                    rememberKey = false;
                    break;
                case Key.enter:
                    // self.autocomplete.hasFocus = false;
                    // target.blur(); // remove focus
                    event.preventDefault();

                    break;
                case Key.escape:
                    self.autocomplete.hide();

                    break;
                case Key.tab:
                    self.autocomplete.hasFocus = false;

                    break;
                case 'g':
                case "y":
                case "q":
                case "z":
                    if (lastKey == Key.ctrl) {
                        event.preventDefault();
                    }
                    rememberKey = false;
                    break;
                default:
                    break;
            }
            if (rememberKey) {
                lastKey = event.key;
            }

        }, false);

        container.addEventListener('keyup', function (event) {
            var target = event.target;
            var parent = target.parentElement;
            var field = self.fields[target.id - 1];

            // if (field && target.textContent === "") {
            //     field.update();
            // }
            if (lastKey == event.key) lastKey = -1;

            switch (event.key) {
                case Key.spacebar:
                    // if (lastKey == Key.ctrl) {
                    //     if (field && !field.isDisabled) {
                    //         showAutoComplete(field);
                    //     }
                    // }
                    break;
                case Key.delete: // delete the field->attribute
                    if (lastKey == Key.ctrl) {
                        if (field) {
                            field.delete();
                        }
                    }
                    break;
                case 'q': // query the parent concept/component
                    if (lastKey == Key.ctrl) {
                        if (field) {
                            let parentConcept = field.getParentConcept();
                            let optionalAttributes = parentConcept.getOptionalAttributes();
                            let parentContainer = null;
                            if (parentConcept.object === 'component') {
                                parentContainer = findAncestor(target, (el) => hasClass(el, 'component'), 5);
                            }
                            else {
                                parentContainer = findAncestor(target, (el) => hasClass(el, 'concept-container'), 5);
                            }
                            addClass(parentContainer, 'query');

                            // create query container
                            let queryContainer = getElement('.query-container', parentContainer);
                            if (!isHTMLElement(queryContainer)) {
                                queryContainer = EL.div({ class: 'query-container' });
                            }
                            // create query content
                            let queryContent = null;
                            if (isEmpty(optionalAttributes)) {
                                queryContent = EL.p({ class: 'query-content' }, `No suggestion for this ${parentConcept.object}`);
                            } else {
                                queryContent = EL.ul({ class: 'bare-list suggestion-list' }, optionalAttributes.map(item => EL.li({ class: "suggestion", data: { attr: item } }, item)));
                            }
                            queryContainer.appendChild(queryContent);
                            // bind events
                            queryContainer.addEventListener('click', function (event) {
                                target = event.target;
                                if (hasClass(target, 'suggestion')) {
                                    parentConcept.createAttribute(target.dataset['attr']);
                                    parentConcept.rerender();
                                }
                                hide(this);
                                removeClass(parentContainer, 'query');
                                field.focus();
                            });
                            queryContainer.addEventListener('keydown', function (event) {
                                target = event.target;
                                switch (event.key) {
                                    case Key.escape:
                                        hide(this);
                                        removeClass(parentContainer, 'query');
                                        field.focus();
                                        break;
                                    default:
                                        break;
                                }
                            });
                            parentContainer.appendChild(queryContainer);
                            queryContainer.tabIndex = 0;
                            queryContainer.focus();
                        }
                    }

                    break;
                case 'g':
                    // show actions
                    break;
                case "z":
                    // if (lastKey == Key.ctrl) {
                    //     flag = true;
                    //     self.state.undo();
                    //     flag = false;
                    // }
                    break;
                default:
                    break;
            }
        }, false);

        this.body.addEventListener('mouseover', (e) => {
            var target = e.target;
            var nature = target.dataset['nature'];
            if (nature === 'attribute') {
                var field = this.fields[target.id - 1];
                // infoHandler.call(this, field, target);
            }
            if (hasClass(target, 'component')) {
                addClass(target, 'component--on_mouseover');
            }
        });

        this.body.addEventListener('mouseout', (e) => {
            var target = e.target;

            if (hasClass(target, 'component')) {
                removeClass(target, 'component--on_mouseover');
            }
        });

        // this.body.addEventListener(EventType.FOCUSIN, function (event) {
        //     self.autocomplete.hide();
        //     handled = true;

        //     var target = event.target;
        //     var field = self.fields[target.id - 1];
        //     field.focus();

        //     var data = [];

        //     if (hasClass(target, 'option')) {
        //         let position = target.getAttribute('data-position');
        //         position = position.split('..');
        //         var min = position[0];
        //         var max = position[1];

        //         var index = target.dataset['index'];
        //         var parentMElement = self.options[+index];

        //         data = parentMElement.options.filter(function (x) {
        //             return x.position >= min && x.position <= max;
        //         });
        //         data = data.map(function (el) { return { val: el.name, element: el }; });

        //         self.autocomplete.init(target, data);
        //         self.autocomplete.onSelect = function (val) {
        //             optionHandler(val, target, data);
        //         };
        //     } else if (field) {
        //         //if (projection.isDisabled) return;
        //         field.focusIn();
        //         events.emit('editor.change', field);

        //         if (Projection.isExtension(field)) {
        //             data = field.valuesKV();
        //             self.autocomplete.onSelect = function (attr) {
        //                 let line = field.implement(attr.key);
        //                 getElement(f_class(ELEMENT.ATTRIBUTE), line).focus();
        //             };

        //             self.autocomplete.init(target, data);
        //         } else if (Projection.isPointer(field) || Projection.isEnum(field)) {
        //             data = field.valuesKV();
        //             self.autocomplete.onSelect = function (attr) {
        //                 field.value = attr.key;
        //                 field.focus();
        //             };
        //             self.autocomplete.init(target, data);
        //         } else
        //             return;
        //     }
        // }, false);

        // this.body.addEventListener(EventType.FOCUSOUT, function (event) {
        //     if (flag) {
        //         flag = false;
        //         return;
        //     }

        //     if (self.autocomplete.hasFocus && self.autocomplete.input == target) {
        //         return;
        //     }

        //     var target = event.target;
        //     if (currentContainer) removeClass(currentContainer, 'current');

        //     // if (hasClass(target, EL.ATTRIBUTE.class)) {
        //     //     let projection = self.getProjection(target.id);
        //     //     if (projection.isDisabled) return;

        //     //     if (projection) {
        //     //         projection.focusOut();
        //     //         projection.update();
        //     //     }

        //     //     if (self.autocomplete.hasFocus) {
        //     //         setTimeout(function () { validation_handler(target); }, 100);
        //     //     } else {
        //     //         validation_handler(target);
        //     //     }
        //     // }
        // }, false);

        events.on('model.change', function (from) {
            self.save();
        });

        function validation_handler(target) {
            const ERROR = 'error';

            var parent = target.parentElement;
            var projection = self.getProjection(target.id);
            var lblError = getElement(hash(target.id + ERROR), parent);

            if (projection.validate()) {
                if (lblError) {
                    lblError.parentElement.className = 'attr-validation-valid';
                    removeChildren(lblError);
                    hide(lblError);
                }
                removeClass(target, ERROR);
            } else {
                if (!lblError) {
                    lblError = createSpan({ id: target.id + ERROR, class: 'error-marker' });
                    let container = createSpan();
                    target.insertAdjacentElement('beforebegin', container);
                    container.appendChild(target);
                    container.appendChild(lblError);
                }
                lblError.innerHTML = projection.error;
                lblError.parentElement.className = 'attr-validation-error';
                addClass(target, ERROR);
                show(lblError);
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
                    getElement(f_class(ELEMENT.ATTRIBUTE), line).focus();
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

        function infoHandler(field, target) {
            var info = field.getInfo();
            removeChildren(this.infoContainer);
            this.infoContainer.appendChild(
                EL.ul({ class: 'bare-list' }, [
                    EL.li({ class: 'info-type' }, [
                        EL.strong(null, "type"), `: ${info.type}`]),
                    EL.li({ class: 'info-value' }, [
                        EL.strong(null, "length"), `: ${info.value}`])
                ]));
            insertAfterElement(target, this.infoContainer);
            Object.assign(this.infoContainer.style, {
                left: `${target.offsetLeft}px`
            });
            show(this.infoContainer);
        }

        function optionHandler(val, eHTML, data) {
            const COMPOSITION = 'composition';

            var path = eHTML.dataset['path'];
            var index = eHTML.dataset['index'];
            var parentMElement = self.options[+index];
            var compo = parentMElement.composition;
            var element = cloneObject(val.element);
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

            insertBeforeElement(eHTML, line);

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
                    let input = createOptionSelect(left[0].position, left[left.length - 1].position, path);
                    input.dataset.index = index;
                    insertBeforeElement(line, input);
                }
                if (right.length > 0) {
                    right.sort(function (a, b) { return a.position - b.position; });
                    let input = createOptionSelect(right[0].position, right[right.length - 1].position, path);
                    input.dataset.index = index;
                    insertAfterElement(line, input);
                }
            }

            var firstAttribute = getElement(f_class(ELEMENT.ATTRIBUTE), line);
            if (firstAttribute) firstAttribute.focus();
        }

        mql.addListener(handleWidthChange);

        function handleWidthChange(mql) {
            self.resize();
        }

        /**
         * @param {HTMLElement} el 
         * @returns {null|HTMLElement}
         */
        function findLine(el) {
            var parent = el.parentElement;
            if (hasClass(parent, 'removable')) return parent;
            if (parent.isSameNode(container)) return null;
            return findLine(parent);
        }
    }
};