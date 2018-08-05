const DOC = document;

const KEY = {
    backspace: "Backspace",
    tab: "Tab",
    enter: "Enter",
    ctrl: "Control",
    alt: "Alt",
    escape: "Esc",
    spacebar: " ",
    page_up: "PageUp",
    page_down: "PageDown",
    end: "End",
    home: "Home",
    left_arrow: "ArrowLeft",
    up_arrow: "ArrowUp",
    right_arrow: "ArrowRight",
    down_arrow: "ArrowDown",
    delete: "Delete",
    period: "."
};

var UTIL = (function (_) {
    var pub = {
        /**
         * Gets the window's width
         */
        getWindowWidth: function () { return window.innerWidth || DOC.documentElement.clientWidth || DOC.body.clientWidth; },

        /**
         * Returns the first element that matches the query selector.
         * @param {string} e query
         * @param {HTMLElement} p container
         * @returns {HTMLElement}
         */
        getElement: function (e, p) {
            p = _.valOrDefault(p, DOC);

            switch (e.charAt(0)) {
                case "#":
                    return DOC.getElementById(e.substring(1));
                case ".":
                    return p.getElementsByClassName(e.substring(1))[0];
                case "[":
                    return p.querySelector(e);
                default:
                    return p.getElementsByTagName(e)[0];
            }
        },
        /**
         * Returns all elements that match the selector query.
         * @param {string} e query
         * @param {HTMLElement} p containter
         * @returns {HTMLElement[]}
         */
        getElements: function (e, p) {
            p = _.valOrDefault(p, DOC);

            switch (e.charAt(0)) {
                case ".":
                    return p.getElementsByClassName(e.substring(1));
                case "[":
                    return p.querySelectorAll(e);
                default:
                    return p.getElementsByTagName(e);
            }
        },
        /**
         * Gets the previous or next element of the specified element
         * @param {HTMLElement} el element
         * @param {string} dir sibling direction
         * @returns {(Element|null)} Element or null
         */
        getElementSibling: function (el, dir) {
            var sibling = el[dir];

            while (sibling && this.hasClass(sibling, "autocomplete")) sibling = sibling[dir];

            return sibling;
        },
        /**
         * Gets the previous element of the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the first one in the list
         */
        getPreviousElementSibling: function (el) { return this.getElementSibling(el, "previousElementSibling"); },
        /**
         * Gets the element following the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the last one in the list
         */
        getNextElementSibling: function (el) { return this.getElementSibling(el, "nextElementSibling"); },
        /**
         * Inserts a given element before the targetted element
         * @param {HTMLElement} target 
         * @param {HTMLElement} el 
         */
        insertBeforeElement(target, el) { target.insertAdjacentElement('beforebegin', el); },
        /**
         * Inserts a given element after the targetted element
         * @param {HTMLElement} target 
         * @param {HTMLElement} el 
         */
        insertAfterElement(target, el) { target.insertAdjacentElement('afterend', el); },
        /**
         * Verifies that an element has a class
         * @param {HTMLElement} e element
         * @param {string} c class
         */
        hasClass: function (e, c) {
            var classes = e.className.split(" ");
            for (let i = 0, len = classes.length; i < len; i++) {
                if (c == classes[i])
                    return true;
            }
            return false;
        },
        /**
         * Removes a class from an element if it exists
         * @param {HTMLElement} e element
         * @param {string} c class
         */
        removeClass: function (e, c) {
            if (this.hasClass(e, c)) {
                var classes = e.className.split(" ");
                var classes2 = "";
                for (let i = 0, len = classes.length; i < len; i++) {
                    if (c != classes[i])
                        classes2 += " " + classes[i];
                }
                e.className = classes2.trim();
            }
        },
        /**
         * Adds one or many classes to an element if it doesn't exist
         * @param {HTMLElement} e element
         * @param {string} c classes
         */
        addClass: function (e, c) {
            // If c is an Array => Format c as a space-separated string
            if (Array.isArray(c)) c = c.join(' ');

            if (_.isNullOrWhiteSpace(e.className))
                e.className = c;
            else if (!pub.hasClass(e, c))
                e.className += " " + c;
        },
        // Toggle a class for an element
        toggleClass: function (e, c) {
            if (this.hasClass(e, c))
                this.removeClass(e, c);
            else
                this.addClass(e, c);
        },
        // Replace a class with another for an element
        replaceClass: function (c1, c2, e) {
            if (this.hasClass(e, c1))
                e.className = e.className.replace(c1, c2);
            else if (pub.hasClass(e, c2))
                e.className = e.className.replace(c2, c1);
            else
                this.addClass(c2, e);
        },

        /**
         * Removes all children of a node from the DOM
         * @param {Node} node 
         */
        removeChildren: function (node) {
            while (node.hasChildNodes())
                node.removeChild(node.lastChild);
        },

        /**
         * Creates the element for the specified tagName
         * @param {string} tagName element
         * @returns {HTMLElement}
         */
        createElement: function (tagName, eId, eClass) {
            var el = DOC.createElement(tagName);
            if (eId) el.id = eId;
            if (eClass) this.addClass(el, eClass);
            return el;
        },
        /**
         * Creates a document fragment
         */
        createDocFragment: function () {
            return DOC.createDocumentFragment();
        },
        /**
         * Creates a <link> element with some attributes
         * @param {*} rel 
         * @param {*} href 
         * @param {*} attr 
         */
        createLink: function (rel, href, attr) {
            var link = this.createElement("link");
            link.rel = rel;
            link.href = href;

            if (attr) {
                this.addAttributes(link, attr);
            }

            return link;
        },
        /**
         * Creates a <a> element with some attributes
         * @param {string} href 
         * @param {Object} [attr] attributes
         * @returns {HTMLAnchorElement}
         */
        createAnchor(href, attr) {
            var a  = this.createElement('a');
            if(href) {
                a.href = href;
            }
            if(attr) {
                this.addAttributes(a, attr);
            }

            return a;
        },
        /**
         * Creates a <div> element with some attributes
         * @param {Object} [attr] attributes
         */
        createDiv: function (attr) {
            var div = this.createElement("div");

            if (attr) {
                this.addAttributes(div, attr);
            }

            return div;
        },
        /**
         * Creates a <ul> element with some attributes
         * @param {Object} [attr] attributes
         */
        createUl: function (attr) {
            var ul = this.createElement("ul");

            if (attr) {
                this.addAttributes(ul, attr);
            }

            return ul;
        },
        /**
         * Creates a <p> element with some attributes
         * @param {Object} [attr] attributes
         */
        createP: function (attr) {
            var p = this.createElement("p");

            if (attr) {
                this.addAttributes(p, attr);
            }

            return p;
        },
        /**
         * Create a <input.checkbox> element with some attributes
         * @param {Object} [attr] attributes
         */
        createCheckbox: function (attr) {
            var chk = this.createElement("input");
            chk.type = "checkbox";
            var lbl = this.createElement("label");
            lbl.appendChild(chk);
            if (attr) {
                this.addAttributes(lbl, attr);
            }

            return lbl;
        },
        /**
         * Create a <input.file> element with some attributes
         * @param {Object} [attr] attributes
         */
        createFileInput(attr) {
            var fileInput = this.createElement('input');
            fileInput.type = "file";

            if (attr) {
                if (attr.accept) fileInput.accept = attr.accept;
                this.addAttributes(fileInput, attr);
            }

            return fileInput;
        },
        /**
         * Create a <label> element with some attributes
         * @param {Object} [attr] attributes
         */
        createLabel(attr) {
            var label = this.createElement('label');

            if (attr) {
                this.addAttributes(label, attr);
            }
            return label;
        },
        /**
         * Creates a <li> element with some attributes
         * @param {Object} [attr] attributes
         */
        createLi: function (attr) {
            var li = this.createElement("li");

            if (attr) {
                this.addAttributes(li, attr);
            }

            return li;
        },
        /**
         * Creates a <span> element with some attributes
         * @param {Object} [attr] attributes
         */
        createSpan: function (attr) {
            var span = this.createElement("span");

            if (attr) {
                this.addAttributes(span, attr);
            }

            return span;
        },
        /**
         * Creates a <strong> element with some attributes
         * @param {Object} [attr] attributes
         */
        createStrong: function (attr) {
            var strong = this.createElement("strong");

            if (attr) {
                this.addAttributes(strong, attr);
            }

            return strong;
        },
        /**
         * Creates a <button> element with some attributes
         * @param {Object} [attr] attributes
         */
        createButton: function (attr) {
            var btn = this.createElement("button");
            btn.type = "button";

            if (attr) {
                this.addAttributes(btn, attr);
            }

            return btn;
        },
        /**
         * Creates a <tr> element with some attributes
         * @param {Object} [attr] attributes
         */
        createTableRow: function (attr) {
            var tr = this.createElement("tr");

            if (attr) {
                this.addAttributes(tr, attr);
            }

            return tr;
        },
        /**
         * Creates a <td> element with some attributes
         * @param {Object} [attr] attributes
         */
        createTableCell: function (attr) {
            var td = this.createElement("td");

            if (attr) {
                this.addAttributes(td, attr);
            }

            return td;
        },
        /**
         * Sets the attributes of an element
         * @param {HTMLElement} el element
         * @param {Object} attr attribute
         */
        addAttributes: function (el, attr) {
            // HTML attributes
            if (attr.id) el.id = attr.id;
            if (attr.class) this.addClass(el, attr.class);
            if (attr.text) el.textContent = attr.text;
            if (attr.html) el.innerHTML = attr.html;

            // Custom attributes
            if(attr.data) Object.assign(el.dataset, attr.data);
        }
    };

    return pub;
}(HELPER));