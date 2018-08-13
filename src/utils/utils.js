const DOC = document;

var UTIL = (function (_) {
    var pub = {
        /**
         * Gets the window's width
         */
        getWindowWidth() { return window.innerWidth || DOC.documentElement.clientWidth || DOC.body.clientWidth; },

        /**
         * Returns the first element that matches the query selector.
         * @param {string} e query
         * @param {HTMLElement} p container
         * @returns {HTMLElement}
         */
        getElement(e, p) {
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
        getElements(e, p) {
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
        getElementSibling(el, dir) {
            var sibling = el[dir];

            while (sibling && this.hasClass(sibling, "autocomplete")) sibling = sibling[dir];

            return sibling;
        },
        /**
         * Gets the previous element of the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the first one in the list
         */
        getPreviousElementSibling(el) { return this.getElementSibling(el, "previousElementSibling"); },
        /**
         * Gets the element following the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the last one in the list
         */
        getNextElementSibling(el) { return this.getElementSibling(el, "nextElementSibling"); },
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
        hasClass(e, c) {
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
        removeClass(e, c) {
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
        addClass(e, c) {
            // If c is an Array => Format c as a space-separated string
            if (Array.isArray(c)) c = c.join(' ');

            if (_.isNullOrWhiteSpace(e.className))
                e.className = c;
            else if (!pub.hasClass(e, c))
                e.className += " " + c;
        },
        // Toggle a class for an element
        toggleClass(e, c) {
            if (this.hasClass(e, c))
                this.removeClass(e, c);
            else
                this.addClass(e, c);
        },
        // Replace a class with another for an element
        replaceClass(c1, c2, e) {
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
        removeChildren(node) {
            while (node.hasChildNodes())
                node.removeChild(node.lastChild);
        },

        /**
         * Creates the element for the specified tagName
         * @param {string} tagName element
         * @returns {HTMLElement}
         */
        createElement(tagName, eId, eClass) {
            var el = DOC.createElement(tagName);
            if (eId) el.id = eId;
            if (eClass) this.addClass(el, eClass);
            return el;
        },
        /**
         * Creates a document fragment
         */
        createDocFragment() {
            return DOC.createDocumentFragment();
        },
        createLineBreak() { return this.createElement('br'); },
        /**
         * Creates a <link> element with some attributes
         * @param {*} rel 
         * @param {*} href 
         * @param {*} attr 
         */
        createLink(rel, href, attr) {
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
            var a = this.createElement('a');
            if (href) {
                a.href = href;
            }
            if (attr) {
                this.addAttributes(a, attr);
            }

            return a;
        },
        /**
         * Creates a <div> element with some attributes
         * @param {Object} [attr] attributes
         */
        createDiv(attr) {
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
        createUl(attr) {
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
        createP(attr) {
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
        createCheckbox(attr) {
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
        createTextArea(attr) {
            /**
             * @type {HTMLTextAreaElement}
             */
            var textArea = this.createElement('textarea');

            if (attr) {
                this.addFormAttributes(textArea, attr);
                this.addAttributes(textArea, attr);
            }

            return textArea;
        },
        /**
         * Creates a <li> element with some attributes
         * @param {Object} [attr] attributes
         */
        createLi(attr) {
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
        createSpan(attr) {
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
        createStrong(attr) {
            var strong = this.createElement("strong");

            if (attr) {
                this.addAttributes(strong, attr);
            }

            return strong;
        },
        /**
         * Creates a <em> element with some attributes
         * @param {Object} [attr] attributes
         */
        createEm(attr) {
            var em = this.createElement("em");

            if (attr) {
                this.addAttributes(em, attr);
            }

            return em;
        },
        /**
         * Creates a <button> element with some attributes
         * @param {Object} [attr] attributes
         */
        createButton(attr) {
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
        createTableRow(attr) {
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
        createTableCell(attr) {
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
        addAttributes(el, attr) {
            // HTML attributes
            if (attr.id) el.id = attr.id;
            if (attr.class) this.addClass(el, attr.class);
            if (attr.text) el.textContent = attr.text;
            if (attr.html) el.innerHTML = attr.html;

            // Custom attributes
            if (attr.data) Object.assign(el.dataset, attr.data);
        },
        /**
         * Sets the attributes of a form element
         * @param {HTMLInputElement|HTMLTextAreaElement} el element
         * @param {Object} attr attribute
         */
        addFormAttributes(el, attr) {
            if (attr.value) el.value = attr.value;
            if (attr.readonly) el.readOnly = attr.readonly;
        },

        /**
         * Inserts an item in an array at the specified index
         * @param {Object[]} arr array
         * @param {number} index 
         * @param {object} item 
         */
        insert: function (arr, index, item) { arr.splice(index, 0, item); },
    };

    
    /**
     * Simulates typing
     * @param {HTMLElement} element 
     * @param {string} text 
     */
    function typeWrite(element, text, callback) {
        var i = 0;
        var len = text.length;
        var timeout = Math.ceil(20 + Math.log(len) * (200 / len));
        element.innerHTML += text[i++];
        if (i < len) {
            var a = setInterval(function () {
                element.innerHTML += text[i++];
                if (i == len) {
                    clearInterval(a);
                    if (callback) callback();
                }
            }, timeout);
        }
    }


    return pub;
}(HELPER));