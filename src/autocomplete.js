import { Key, EventType, UI } from './enums.js';
import { UTILS, HELPER } from './utils/index.js';

export const Autocomplete = (function ($, _) {
    const AUTOCOMPLETE_HANDLER = 'autocompleteHandler';
    const DOC = typeof module !== 'undefined' && module.exports ? {} : document;
    
    /**
     * @class Autocomplete
     */
    var pub = {
        create: function (values) {
            var instance = Object.create(this);
            if (values) {
                Object.keys(values).forEach(function (key) {
                    instance[key] = values[key];
                });
            }
            // private members
            instance._input = $.createUl({
                class: "bare-list autocomplete"
            });
            instance._target = undefined;
            instance._id = "";
            instance._data = [];
            instance._items = [];
            instance._position = 0;
            instance._isOpen = false;
            instance._hasFocus = false;
            instance._onSelect = undefined;

            return instance;
        },
        init: function (target, data) {
            this._target = target;
            this._data = _.valOrDefault(data, []);
            this.position = 0;
            this._items = [];
            if (!target.dataset[AUTOCOMPLETE_HANDLER]) this.bindEvents();

            this.render();
        },
        // properties
        get id() { return this._id; },
        set id(val) { this._id = val; },
        get data() { return this._data; },
        set data(val) { this._data = val; },
        get position() { return this._position; },
        set position(val) { this._position = val; },
        get itemPosition() { return this._items[this._position]; },
        get hasFocus() { return this._hasFocus; },
        set hasFocus(val) { this._hasFocus = val; },
        get isOpen() { return this._isOpen; },
        set isOpen(val) { this._isOpen = val; },
        get onSelect() { return this._onSelect; },
        set onSelect(fn) { this._onSelect = fn; },
        // methods
        reset: function () {
            this.id = "";
            this.data = [];
            this.position = 0;
        },
        update: function () {
            if (this._items.length != this.data.length) this.position = 0;
            if (this._items.length > 0) $.highlight(this._input.children[this.itemPosition]);
        },
        show: function () {
            $.show(this._input);
            this.isOpen = true;
        },
        hide: function () {
            $.hide(this._input);
            this.hasFocus = false;
            this.isOpen = false;
        },
        filter: function (text) {
            this._items = [];
            for (let i = 0, len = this.data.length; i < len; i++) {
                if (this.data[i].val.toLowerCase().indexOf(text.toLowerCase()) === -1) {
                    $.addClass(this._input.children[i], UI.HIDDEN);
                } else {
                    this._items.push(i);
                    $.removeClass(this._input.children[i], UI.HIDDEN);
                }
                $.unhighlight(this._input.children[i]);
            }
            this.update();
        },
        select: function (callback) {
            this.hasFocus = false;
            callback(this.data[this.itemPosition]);
            this.hide();
            //this._target.focus();
        },
        up: function () {
            $.unhighlight(this._input.children[this.itemPosition]);
            this.position = (this.position == 0 ? this._items.length : this.position) - 1;
            $.highlight(this._input.children[this.itemPosition]);
        },
        down: function () {
            $.unhighlight(this._input.children[this.itemPosition]);
            this.position = (this.position + 1) % this._items.length;
            $.highlight(this._input.children[this.itemPosition]);
        },
        bindEvents: function () {
            var self = this;

            self._target.addEventListener(EventType.KEYDOWN, function (event) {
                if (self.isOpen) {
                    switch (event.key) {
                        case Key.down_arrow:
                        case Key.up_arrow:
                            event.preventDefault();
                            break;
                        case Key.enter:
                            self.select(self.onSelect);
                            break;
                        default:
                            break;
                    }
                }
            }, false);

            self._target.addEventListener(EventType.KEYUP, function (event) {
                switch (event.key) {
                    case Key.down_arrow:
                        self.down();
                        break;
                    case Key.up_arrow:
                        self.up();
                        break;
                    default:
                        if ([Key.tab, Key.ctrl].indexOf(event.key) === -1)
                            self.filter(self._target.textContent);
                        break;
                }
            });

            self._target.dataset[AUTOCOMPLETE_HANDLER] = true;
        },
        render: function () {
            var self = this;

            // initialize autocomplete data
            var fragment = DOC.createDocumentFragment();

            for (let i = 0, len = self.data.length; i < len; i++) {
                self._items.push(i);
                var item = $.createLi({
                    text: self.data[i].val,
                    class: "autocomplete-item"
                });
                item.addEventListener(EventType.CLICK, function (event) {
                    self.position = i;
                    self.select(self.onSelect);
                    event.stopPropagation();
                });
                fragment.appendChild(item);
            }

            // clear autocomplete (remove previous data)
            $.removeChildren(self._input);
            // add newly created data
            self._input.appendChild(fragment);
            self._input.addEventListener('mouseenter', function () {
                self.hasFocus = true;
            });
            self._input.addEventListener('mouseleave', function () {
                self.hasFocus = false;
            });

            self.update();

            // display autocomplete
            self._target.insertAdjacentElement("afterend", self._input);
            self._input.style.left = self._target.offsetLeft + 'px';
            self._input.style.minWidth = self._target.offsetWidth + 'px';

            self.show();
        }
    };

    return pub;
})(UTILS, HELPER);