import {
    createTextNode, createDocFragment, createDiv, createElement, createSpan, createButton, createTableCell,
    createTableRow, addClass, getPreviousElementSibling, getNextElementSibling, hasClass, insertAfterElement,
    valOrDefault, toBoolean, cloneObject, hasOwn, isNullOrWhitespace, addPath, getDir
} from "zenkai";
import { createButtonDelete, createOptionSelect } from "@utils/interactive.js";
import { MultiValueAttribute, SingleValueAttribute, PrepareModelAttribute } from './../attribute';
import { AbstractProjection } from '@projection/field';
import { InvalidModelError } from '@src/exception/index.js';
import { HTMLAttribute, RepresentationType } from '@src/global/enums.js';
import { events } from '@utils/pubsub.js';

const OPTION = 'option';
const COMPOSITION = 'composition';

export const ModelElement = {
    /**
     * @returns {pub}
     */
    create: function (model, el) {
        var instance = Object.create(this);

        // private members
        instance._source = el;
        instance._path = '';
        instance._model = model;
        instance._position = valOrDefault(el.position, 0);
        instance._attributes = [];
        instance._elements = [];

        return instance;
    },
    /** @returns {MetaModel} */
    get model() { return this._model; },
    /** @type {ModelAttribute[]} */
    get attributes() { return this._attributes; },
    /** @type {string} */
    get path() { return this._path; },
    set path(val) { this._path = val; },
    /** @type {boolean} */
    get isOptional() { return toBoolean(this._source.optional); },
    /** @type {boolean} */
    get isAbstract() { return toBoolean(this._source.abstract); },
    /** @type {boolean} */
    get isMultiple() { return toBoolean(this._source.multiple); },
    get composition() { return this._source.composition; },
    /** @type {ModelElement[]} */
    get elements() { return this._elements; },
    get position() { return this._position; },
    get name() { return this._source.name; },
    get representation() { return this._source.representation; },
    /** @type {HTMLElement} */
    eHTML: undefined,
    options: [],
    parent: null,
    render: function (path, containerless) {
        var self = this;
        // set element's concrete path
        self.path = valOrDefault(path, 'root');

        // creates the element container
        var container;
        if (containerless) {
            container = createDocFragment();
        } else {
            container = createDiv({ class: ['section', 'line'], index: "0" });
            self.eHTML = container;
        }

        // self.current.multiple ? $.createLi({ class: 'list-item', prop: 'val' }) : $.createDiv({ class: "group section" });
        if (self._source.abstract) {
            let packet = AbstractProjection.prepare(self.model.generateID(), self.parent, self.parent.type);
            let projection = AbstractProjection.create(packet);
            projection.extensions = self._source.extensions;
            projection.modelElement = self;
            self.model.projections.push(projection);
            return projection.createInput();
        }

        // add the element's attributes to the container
        container.appendChild(self.getAttribute());
        if (self.isOptional) {
            container.appendChild(createButtonDelete(container, function () {
                self.remove();
                compositionRestore.call(self);
                events.emit('model.change', 'ModelElement[l.79]:delete');
            }));
        }

        return container;
    },
    getAttribute: function () {
        var self = this;
        // Add attr property to the element if missing
        if (!hasOwn(self._source, 'attr')) self._source.attr = {};

        // Get parent attributes
        if (self._source.base) {
            let temp = {};
            Object.assign(temp, self.model.getModelElement(self._source.base).attr, self._source.attr);
            self._source.attr = cloneObject(temp);
        }

        if (self._source.representation.type === RepresentationType.TEXT) {
            return self.representationHandler();
        } else if (self._source.representation.type === RepresentationType.TABLE) {
            var fragment = createDocFragment();

            var col = self._source.representation.col;
            var cell = self._source.representation.cell;
            var table = createElement('table');
            var tr = createTableRow();
            var th = createElement('th');

            th.appendChild(parser(col, self._source.attr, function (attr) { return self.createModelAttribute(attr, 'col'); }));
            tr.appendChild(th);
            table.appendChild(tr);

            tr = createTableRow();
            var td = createTableCell();
            td.appendChild(parser(cell, self._source.attr, function (attr) { return self.createModelAttribute(attr, 'cell'); }));

            tr.appendChild(td);
            table.appendChild(tr);

            var btnAddCol = createButton({ class: 'btn-add-col' });
            btnAddCol.addEventListener('click', function (e) {

                for (let i = 0, rows = table.children; i < table.childElementCount; i++) {
                    let cell = createElement(i === 0 ? 'th' : 'td');
                    let mAttr = self.attributes[i];
                    mAttr.add(self.model.createInstance(mAttr.type));
                    let children = mAttr.handler(mAttr._source, mAttr.value[mAttr.count - 1], mAttr.path);
                    cell.appendChild(children);

                    rows[i].appendChild(cell);
                }
            });

            fragment.appendChild(table);
            fragment.appendChild(btnAddCol);

            return fragment;
        } else {
            return createTextNode("");
        }
    },
    compositionHandler() {
        var self = this;
        var compo = this.composition;
        var container = createDocFragment();

        // get options (unused composition elements)
        var modelComposition = self.model.getModelElement(self.name)[COMPOSITION];
        var options = modelComposition.filter(function (c) {
            return self.composition.findIndex(function (val) {
                return val.position == c.position;
            }) === -1;
        });
        self.options = options;

        var remain = options.length > 0;

        var pos = 1;
        var i = 0;

        while (i < compo.length) {
            let current = compo[i];
            if (current.optional && !current.flag) {
                options.push(current); // add element to options
                compo.splice(i, 1); // remove element from composition
                remain = true;
            } else {
                let mElement = ModelElement.create(self.model, current);
                mElement.parent = self;
                self.elements.push(mElement);

                let children = mElement.render(addPath(this.path, COMPOSITION + '[' + i + ']'));
                Object.assign(children.dataset, { prop: COMPOSITION, position: compo[i].position });

                if (current.optional) {
                    children.appendChild(createButtonDelete(children, function () {
                        mElement.remove();
                        compositionRestore.call(mElement);
                        events.emit('model.change', 'ModelElement[l.177]:delete');
                    }));
                }

                if (pos + 1 < current.position) {
                    let input = createOptionSelect(pos, current.position - 1, addPath(this.path, COMPOSITION));
                    input.dataset.index = self.model.options.length;
                    self.model.options.push(self);
                    container.appendChild(input);

                    // verify the presence of remaining options
                    let last = getLastOption();
                    remain = last && current.position < last.position;
                }

                container.appendChild(children);
                pos = current.position;
                i++;
            }
        }

        if (remain) {
            let input = createOptionSelect(pos + 1, getLastOption().position, addPath(this.path, COMPOSITION));
            input.dataset.index = self.model.options.length;
            self.model.options.push(self);
            container.appendChild(input);
        }

        return container;

        function getLastOption() {
            return options[options.length - 1];
        }
    },
    representationHandler: function () {
        var self = this;

        var fragment = createDocFragment();
        var arr = self.representation ? self.representation.val.replace(/ /g, " space ")
            .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !isNullOrWhitespace(x); }) : [];

        for (let i = 0, len = arr.length; i < len; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':
                    if (key === COMPOSITION) {
                        fragment.appendChild(self.compositionHandler());
                    } else if (self.representation[key]) {
                        let block = self.representation[key];
                        if (block.type === "group") {
                            var group = createDiv({ class: "attr-group" });
                            if (block.align == "right") addClass(group, 'right');

                            // group.appendChild(render(block));
                            fragment.appendChild(group);
                        } else if (block.type === 'keyword') {
                            let keyword = createSpan({ class: 'keyword', text: block.val });
                            if (block.color) keyword.style.color = block.color;
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        } else if (block.type === "text") {
                            let keyword = createSpan({ text: block.val });
                            fragment.appendChild(keyword);
                            fragment.appendChild(createTextNode(" "));
                        }
                    } else if (self._source[key]) {
                        let keyword = createSpan({ class: 'keyword', text: self._source[key] });
                        fragment.appendChild(keyword);
                        fragment.appendChild(createTextNode(" "));
                    }
                    break;
                case '#':
                    if (self._source.attr[key]) {
                        let mAttr = self.createModelAttribute(self._source.attr[key]);
                        fragment.appendChild(mAttr.render_attr());
                    } else {
                        throw InvalidModelError.create("The attribute " + key + " was not found.");
                    }

                    break;
                case '&':
                    if (key === 'NL')
                        fragment.appendChild(createElement('br'));
                    if (key === 'CL') {
                        var clear = createElement('br');
                        addClass(clear, 'clear');
                        fragment.appendChild(clear);
                    }

                    break;
                default:
                    fragment.appendChild(createTextNode(arr[i] == 'space' ? " " : arr[i]));
                    break;
            }
        }

        return fragment;
    },
    createModelAttribute(attr, type) {
        var self = this;
        let args = PrepareModelAttribute(self, attr, self.path);
        var mAttr;

        if (!hasOwn(attr, 'multiple')) {
            mAttr = SingleValueAttribute.create(args);
        }
        else {
            mAttr = MultiValueAttribute.create(args);
            if (self.representation.type == "table") {
                tableHandler(mAttr, type);
            }
        }

        self.attributes.push(mAttr);
        // delete mAttr._isOptional;
        return mAttr;
    },
    remove() {
        var self = this;

        self.attributes.splice(0).forEach(function (attr) { attr.remove(); });
        self.elements.splice(0).forEach(function (el) { el.remove(); });

        if (self.isOptional) optionHandler.call(self);
        else listHandler();

        self.eHTML.remove();


        function listHandler() {
            // if (arr.length < 2)
            //     $.addClass(self.eHTML.parentElement, EMPTY);
        }
    },
    implement(type) {
        var self = this;

        var instance = self.model.createInstance(type);
        self._source = instance;
        self.parent.set(instance, self.index);

        return self.render(self.path, true);
    },
    toString() {
        var self = this;
        var result = "";
        var arr = this.representation ? this.representation.val.replace(/ /g, " space ")
            .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !isNullOrWhitespace(x); }) : [];

        for (let i = 0, len = arr.length; i < len; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':
                    if (key === COMPOSITION) {
                        let compos = self.elements.slice();
                        compos.sort(function (a, b) { return a.position - b.position; });
                        compos.forEach(function (el) { result += "\n" + el.toString(); });
                    } else if (this.representation[key]) {
                        let block = this.representation[key];
                        if (block.type === 'keyword') {
                            result += block.val + " ";
                        } else if (block.type === "text") {
                            result += block.val + " ";
                        }
                    } else if (self._source[key]) {
                        result += self._source[key] + " ";
                    }

                    break;
                case '#':
                    if (this._source.attr[key]) {
                        let attr = self.attributes.find(function (a) { return a.name == self._source.attr[key].name; });
                        result += attr.toString();
                    }

                    break;
                case '&':
                    if (key === 'NL') {
                        result += "\n";
                    }

                    break;
                default:
                    result += (arr[i] == 'space' ? " " : arr[i]);
                    break;
            }
        }

        return result;
    }
};

function tableHandler(mAttr, type) {
    if (type === 'col') {
        mAttr.represent = "column";
        mAttr.fnMultiple = function () {
            var container = createDocFragment();

            if (mAttr.value.length === 0) {
                // create add button to add more item
                let btnCreate = createButton({ class: "btn btn-new" });
                btnCreate.appendChild(createSpan({ class: "btn-new-content", html: "<strong>New</strong> " + mAttr.name }));
                // btnCreate.addEventListener('click', btnCreate_Click, false);
                container.appendChild(btnCreate);
            }

            for (var j = 0; j < mAttr.value.length; j++) {
                container.appendChild(mAttr.handler(mAttr._source, mAttr.value[j], mAttr.path));
            }

            return container;
        };
    } else if (type == 'cell') {
        mAttr.represent = "cell";
    }
}

function optionHandler() {
    var self = this;

    var path = addPath(getDir(self.path), COMPOSITION);
    var prev = getPreviousElementSibling(self.eHTML);
    var next = getNextElementSibling(self.eHTML);
    var min = self.position;
    var max = min;
    var minmax;

    if (prev && hasClass(prev, OPTION)) {
        let position = prev.dataset[HTMLAttribute.Position];
        minmax = position.split('..');
        if (minmax[0] < min) min = minmax[0];
        prev.remove();
    }
    if (next && hasClass(next, OPTION)) {
        let position = next.dataset[HTMLAttribute.Position];
        minmax = position.split('..');
        if (minmax[1] > max) max = minmax[1];
        next.remove();
    }

    var input = createOptionSelect(min, max, path);
    input.dataset.index = self.model.options.length;
    self.model.options.push(self.parent);
    insertAfterElement(self.eHTML, input);
}

function compositionRestore() {
    var self = this;

    var parent = self.parent;
    var compo = parent.composition;
    var el = parent.model.getModelElement(parent.name);
    var instance = el.composition.find(function (c) { return c.position == self.position; });
    compo.splice(compo.indexOf(self._source), 1);

    if (!self.isMultiple) {
        parent.options.push(cloneObject(instance));
    }

    return self;
}

function parser(representation, attr, fnCreateModelAttribute) {
    var arr = representation ? representation.val.replace(/ /g, " space ")
        .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
        .split(" ")
        .filter(function (x) { return !isNullOrWhitespace(x); }) : [];
    var fragment = createDocFragment();
    for (let i = 0, len = arr.length; i < len; i++) {
        var mode = arr[i].charAt(0);
        var key = arr[i].substring(1);

        switch (mode) {
            case '$':
                if (key === COMPOSITION) {
                    fragment.appendChild(this.compositionHandler());
                } else if (representation[key]) {
                    let block = representation[key];
                    if (block.type === "group") {
                        var group = createDiv({ class: "attr-group" });
                        if (block.align == "right") addClass(group, 'right');

                        // group.appendChild(render(block));
                        fragment.appendChild(group);
                    } else if (block.type === 'keyword') {
                        let keyword = createSpan({ class: 'keyword', text: block.val });
                        if (block.color) keyword.style.color = block.color;
                        fragment.appendChild(keyword);
                        fragment.appendChild(createTextNode(" "));
                    } else if (block.type === "text") {
                        let keyword = createSpan({ text: block.val });
                        fragment.appendChild(keyword);
                        fragment.appendChild(createTextNode(" "));
                    }
                } else if (this._source[key]) {
                    let keyword = createSpan({ class: 'keyword', text: this._source[key] });
                    fragment.appendChild(keyword);
                    fragment.appendChild(createTextNode(" "));
                }
                break;
            case '#':
                if (attr[key]) {
                    let mAttr = fnCreateModelAttribute(attr[key]);
                    fragment.appendChild(mAttr.render_attr());
                } else {
                    throw InvalidModelError.create("The attribute " + key + " was not found.");
                }

                break;
            case '&':
                if (key === 'NL')
                    fragment.appendChild(createElement('br'));
                if (key === 'CL') {
                    var clear = createElement('br');
                    addClass(clear, 'clear');
                    fragment.appendChild(clear);
                }

                break;
            default:
                fragment.appendChild(createTextNode(arr[i] == 'space' ? " " : arr[i]));
                break;
        }
    }

    return fragment;
}