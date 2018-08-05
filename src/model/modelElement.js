/// <reference path="../model/model.js" />

var ModelElement = (function ($, _, ATTR, ERR) {
    "use strict";

    const OPTION = 'option';
    const COMPOSITION = 'composition';
    const REPRESENTATION_TYPE = {
        TEXT: 'text',
        TABLE: 'table'
    };

    var pub = {
        create: function (parent, el) {
            var instance = Object.create(this);

            // private members
            instance._source = el;
            instance._path = '';
            instance._model = parent;
            instance._representation = el.representation;
            instance._position = _.valOrDefault(el.position, 0);
            instance._composition = el.composition;
            instance._attributes = [];
            instance._elements = [];

            return instance;
        },
        /**
         * @returns {MetaModel}
         */
        get model() { return this._model; },
        /**
         * @type {ModelAttribute[]}
         */
        get attributes() { return this._attributes; },
        set path(val) { this._path = val; },
        get path() { return this._path; },
        /**
         * @type {boolean}
         */
        get isOptional() { return _.toBoolean(this._source.optional); },
        /**
         * @type {boolean}
         */
        get isMultiple() { return _.toBoolean(this._source.multiple); },
        get composition() { return this._composition; },
        /**
         * @type {ModelElement[]}
         */
        get elements() { return this._elements; },
        get position() { return this._position; },
        get representation() { return this._representation; },
        /**
         * @type {HTMLElement}
         */
        eHTML: undefined,
        render: function (path, containerless) {
            var self = this;
            // set element's concrete path
            this.path = _.valOrDefault(path, 'root');

            // creates the element container
            var container = _.valOrDefault(containerless, false) ? $.createDocFragment() : $.createDiv({
                class: ['section', 'line'],
                index: "0"
            });

            // self.current.multiple ? $.createLi({ class: 'list-item', prop: 'val' }) : $.createDiv({ class: "group section" });

            // add the element's attributes to the container
            container.appendChild(this.getAttribute());
            if (this.isOptional) {
                container.appendChild($.createButtonDelete(container, function () {
                    self.remove();
                }));
            }

            self.eHTML = container;

            return container;
        },
        getAttribute: function () {
            var self = this;
            // Add attr property to the element if missing
            if (!this._source.hasOwnProperty('attr')) this._source.attr = {};

            // Get parent attributes
            if (self._source.base)
                Object.assign(self._source.attr, this.model.getModelElement(self._source.base).attr, self._source.attr);

            if (self._source.representation.type === REPRESENTATION_TYPE.TEXT) {
                return self.representation_handler();
            } else if (self._source.representation.type === REPRESENTATION_TYPE.TABLE) {
                var fragment = DOC.createDocumentFragment();

                var col = self._source.representation.col;
                var cell = self._source.representation.cell;
                var table = $.createElement('table');
                var tr = $.createTableRow();
                var th = $.createElement('th');

                th.appendChild(parser(col, self._source.attr, function (attr) { return self.createModelAttribute(attr, 'col'); }));
                tr.appendChild(th);
                table.appendChild(tr);

                tr = $.createTableRow();
                var td = $.createTableCell();
                td.appendChild(parser(cell, self._source.attr, function (attr) { return self.createModelAttribute(attr, 'cell'); }));

                tr.appendChild(td);
                table.appendChild(tr);

                var btnAddCol = $.createButton({ class: 'btn-add-col' });
                btnAddCol.addEventListener('click', function (e) {

                    for (let i = 0, rows = table.children; i < table.childElementCount; i++) {
                        let cell = $.createElement(i === 0 ? 'th' : 'td');
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
                return DOC.createTextNode("");
            }
        },
        composition_handler() {
            var self = this;
            var compo = this.composition;
            var container = DOC.createDocumentFragment();

            if (!compo.hasOwnProperty('options')) this._source.composition.options = [];
            var options = compo.options;
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
                    let mElement = pub.create(this.model, current);
                    self.elements.push(mElement);
                    let children = mElement.render(_.addPath(this.path, COMPOSITION + '[' + i + ']'));
                    Object.assign(children.dataset, { prop: COMPOSITION, position: compo[i].position });
                    if (current.optional) {
                        children.appendChild($.createButtonDelete(children, function () {
                            this.removeElement(this, current, container, _.addPath(this.path, COMPOSITION));
                        }));
                    }

                    if (pos + 1 <= current.position && options.length > 0) {
                        let input = $.createOptionSelect(pos, current.position - 1, _.addPath(this.path, COMPOSITION));
                        input.dataset.index = self.model.options.length;
                        self.model.options.push(self);
                        container.appendChild(input);
                        remain = current.position < getLastOption().position;
                    }

                    container.appendChild(children);
                    pos = current.position;
                    i++;
                }
            }

            if (remain) {
                let input = $.createOptionSelect(pos + 1, getLastOption().position, _.addPath(this.path, COMPOSITION));
                input.dataset.index = self.model.options.length;
                self.model.options.push(self);
                container.appendChild(input);
            }

            return container;

            function getLastOption() {
                return options[options.length - 1];
            }
        },
        representation_handler: function () {
            var fragment = $.createDocFragment();
            var arr = this.representation ? this.representation.val.replace(/ /g, " space ")
                .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
                .split(" ")
                .filter(function (x) { return !_.isNullOrWhiteSpace(x); }) : [];

            for (let i = 0, len = arr.length; i < len; i++) {
                var mode = arr[i].charAt(0);
                var key = arr[i].substring(1);

                switch (mode) {
                    case '$':
                        if (key === COMPOSITION) {
                            fragment.appendChild(this.composition_handler());
                        } else if (this.representation[key]) {
                            let block = this.representation[key];
                            if (block.type === "group") {
                                var group = $.createDiv({ class: "attr-group" });
                                if (block.align == "right") $.addClass(group, 'right');

                                // group.appendChild(render(block));
                                fragment.appendChild(group);
                            } else if (block.type === 'keyword') {
                                let keyword = $.createSpan({ class: 'keyword', text: block.val });
                                if (block.color) keyword.style.color = block.color;
                                fragment.appendChild(keyword);
                                fragment.appendChild(DOC.createTextNode(" "));
                            } else if (block.type === "text") {
                                let keyword = $.createSpan({ text: block.val });
                                fragment.appendChild(keyword);
                                fragment.appendChild(DOC.createTextNode(" "));
                            }
                        } else if (this._source[key]) {
                            let keyword = $.createSpan({ class: 'keyword', text: this._source[key] });
                            fragment.appendChild(keyword);
                            fragment.appendChild(DOC.createTextNode(" "));
                        }
                        break;
                    case '#':
                        if (this._source.attr[key]) {
                            let mAttr = this.createModelAttribute(this._source.attr[key]);
                            fragment.appendChild(mAttr.render_attr());
                        } else {
                            throw ERR.InvalidModelError.create("The attribute " + key + " was not found.");
                        }

                        break;
                    case '&':
                        if (key === 'NL')
                            fragment.appendChild($.createElement('br'));
                        if (key === 'CL') {
                            var clear = $.createElement('br');
                            $.addClass(clear, 'clear');
                            fragment.appendChild(clear);
                        }

                        break;
                    default:
                        fragment.appendChild(DOC.createTextNode(arr[i] == 'space' ? " " : arr[i]));
                        break;
                }
            }

            return fragment;
        },
        createModelAttribute(attr, type) {
            var self = this;
            let args = ATTR.prepare(self, attr, self.path);
            var mAttr;

            if (!attr.hasOwnProperty('multiple')) {
                mAttr = ATTR.SingleValueAttribute.create(args);
            }
            else {
                mAttr = ATTR.MultiValueAttribute.create(args);
                if (self.representation.type == "table") {
                    if (type == 'col') {
                        mAttr.represent = "column";
                        mAttr.fnMultiple = function () {
                            var container = $.createDocFragment();

                            if (mAttr.value.length === 0) {
                                // create add button to add more item
                                let btnCreate = $.createButton({ class: "btn btn-new" });
                                btnCreate.appendChild($.createSpan({ class: "btn-new-content", html: "<strong>New</strong> " + mAttr.name }));
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
            }

            self.attributes.push(mAttr);
            // delete mAttr._isOptional;
            return mAttr;
        },
        remove() {
            var self = this;
            var path = _.addPath(_.getDir(self.path), COMPOSITION);
            // remove element from parent in model

            self.attributes.splice(0).forEach(function (attr) {
                attr.remove();
            });
            var parent = self.model.findModelElement(_.getDir(path));
            if (parent.hasOwnProperty(COMPOSITION)) {
                let compo = parent[COMPOSITION];
                compo.splice(compo.indexOf(self._source), 1);
                if (self.isOptional && !self.isMultiple) compo.options.push(self._source);
            }

            // var projection = self.getProjection(self.eHTML.id);
            // var arr = self.abstract.removeElement(projection.prop);

            if (self.isOptional) optionHandler();
            // else if (projection.prop == 'val') {
            //     // TODO: FIX handler function
            //     // if (arr.length === 0) {
            //     //     let attrContainer = eHTML.parentElement;
            //     //     let btnCreate = UI.createButtonNew(parent.name, function () {
            //     //         var instance = self.abstract.addModelElement(parent);
            //     //         this.parentElement.appendChild(handler(parent, instance, _.getDir(path))); 
            //     //         this.remove();
            //     //     });
            //     //     attrContainer.appendChild(btnCreate);
            //     //     $.addClass(attrContainer, EMPTY);
            //     // }
            // } else listHandler();

            self.eHTML.remove();

            function optionHandler() {
                var prev = $.getPreviousElementSibling(self.eHTML);
                var next = $.getNextElementSibling(self.eHTML);
                var min = self.position;
                var max = min;
                var minmax;

                if (prev && $.hasClass(prev, OPTION)) {
                    let position = prev.getAttribute(HTMLAttribute.Position);
                    minmax = position.split("..");
                    if (minmax[0] < min) min = minmax[0];
                    prev.remove();
                }
                if (next && $.hasClass(next, OPTION)) {
                    let position = next.getAttribute(HTMLAttribute.Position);
                    minmax = position.split("..");
                    if (minmax[1] > max) max = minmax[1];
                    next.remove();
                }

                $.insertAfterElement(self.eHTML, $.createOptionSelect(min, max, path));
            }

            function listHandler() {
                // if (arr.length < 2)
                //     $.addClass(self.eHTML.parentElement, EMPTY);
            }
        },
        toString() {
            var self = this;
            var result = "";
            var arr = this.representation ? this.representation.val.replace(/ /g, " space ")
                .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
                .split(" ")
                .filter(function (x) { return !_.isNullOrWhiteSpace(x); }) : [];

            for (let i = 0, len = arr.length; i < len; i++) {
                var mode = arr[i].charAt(0);
                var key = arr[i].substring(1);

                switch (mode) {
                    case '$':
                        if (key === COMPOSITION) {
                            result += "\n";
                            let compos = self.elements.slice();
                            compos.sort(function (a, b) {
                                return a.position - b.position;
                            });
                            compos.forEach(el => {
                                result += "\n" + el.toString();
                            });
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

    function parser(representation, attr, fnCreateModelAttribute) {
        var arr = representation ? representation.val.replace(/ /g, " space ")
            .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !_.isNullOrWhiteSpace(x); }) : [];
        var fragment = $.createDocFragment();
        for (let i = 0, len = arr.length; i < len; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':
                    if (key === COMPOSITION) {
                        fragment.appendChild(this.composition_handler());
                    } else if (representation[key]) {
                        let block = representation[key];
                        if (block.type === "group") {
                            var group = $.createDiv({ class: "attr-group" });
                            if (block.align == "right") $.addClass(group, 'right');

                            // group.appendChild(render(block));
                            fragment.appendChild(group);
                        } else if (block.type === 'keyword') {
                            let keyword = $.createSpan({ class: 'keyword', text: block.val });
                            if (block.color) keyword.style.color = block.color;
                            fragment.appendChild(keyword);
                            fragment.appendChild(DOC.createTextNode(" "));
                        } else if (block.type === "text") {
                            let keyword = $.createSpan({ text: block.val });
                            fragment.appendChild(keyword);
                            fragment.appendChild(DOC.createTextNode(" "));
                        }
                    } else if (this._source[key]) {
                        let keyword = $.createSpan({ class: 'keyword', text: this._source[key] });
                        fragment.appendChild(keyword);
                        fragment.appendChild(DOC.createTextNode(" "));
                    }
                    break;
                case '#':
                    if (attr[key]) {
                        let mAttr = fnCreateModelAttribute(attr[key]);
                        fragment.appendChild(mAttr.render_attr());
                    } else {
                        throw ERR.InvalidModelError.create("The attribute " + key + " was not found.");
                    }

                    break;
                case '&':
                    if (key === 'NL')
                        fragment.appendChild($.createElement('br'));
                    if (key === 'CL') {
                        var clear = $.createElement('br');
                        $.addClass(clear, 'clear');
                        fragment.appendChild(clear);
                    }

                    break;
                default:
                    fragment.appendChild(DOC.createTextNode(arr[i] == 'space' ? " " : arr[i]));
                    break;
            }
        }

        return fragment;
    }

    return pub;

})(UTIL, HELPER, ModelAttribute, Exception);