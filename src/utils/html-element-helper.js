import { UTIL } from './utils.js';
import { HELPER } from './helpers.js';

export const HTMLElementHelper = (function (me, _) {
    /** @type {document} */
    const DOC = typeof module !== 'undefined' && module.exports ? {} : document;

    return Object.assign(me, {
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
        createDocFragment() { return DOC.createDocumentFragment(); },
        createLineBreak() { return this.createElement('br'); },
        createTextNode(str) { return DOC.createTextNode(str); },
        /**
         * Creates a <link> element with some attributes
         * @param {string} rel 
         * @param {string} href 
         * @param {object} attr 
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
         * Creates an <a> (hyperlink) element with some attributes
         * @param {string} href URL or a URL fragment that the hyperlink points to
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
         * @returns {HTMLDivElement}
         */
        createDiv(attr) {
            var div = this.createElement("div");

            if (attr) {
                this.addAttributes(div, attr);
            }

            return div;
        },
        /**
         * Creates a <h[1..6]> (heading) element with some attributes
         * @param {string} lvl Level
         * @param {Object} [attr] attributes
         * @returns {HTMLHeadingElement}
         */
        createHeading(lvl, attr) {
            var h = this.createElement(lvl);

            if (attr) {
                this.addAttributes(h, attr);
            }

            return h;
        },
        /**
         * Creates an `<aside>` element with some attributes
         * @param {Object} [attr] attributes
         * @returns {HTMLElement}
         */
        createAside(attr) {
            var aside = this.createElement('aside');

            if (attr) {
                this.addAttributes(aside, attr);
            }

            return aside;
        },
        /**
         * Creates a <ul> element with some attributes
         * @param {Object} [attr] attributes
         * @returns {HTMLUListElement}
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
         * @returns {HTMLParagraphElement}
         */
        createP(attr) {
            var p = this.createElement("p");

            if (attr) {
                this.addAttributes(p, attr);
            }

            return p;
        },
        createHeader(attr) {
            var header = this.createElement('header');

            if (attr) {
                this.addAttributes(header, attr);
            }

            return header;
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
         * @returns {HTMLLabelElement}
         */
        createLabel(attr) {
            var label = this.createElement('label');

            if (attr) {
                this.addAttributes(label, attr);
            }

            return label;
        },
        /**
         * Create a <textarea> element with some attributes
         * @param {Object} [attr] attributes
         * @returns {HTMLTextAreaElement}
         */
        createTextArea(attr) {
            var textArea = this.createElement('textarea');

            if (attr) {
                this.addAttributes(textArea, attr);
            }

            return textArea;
        },
        /**
         * Creates a <li> element with some attributes
         * @param {Object} [attr] attributes
         */
        createLi(attr, el) {
            var li = this.createElement('li');

            if (attr) {
                this.addAttributes(li, attr);
            }

            if (Array.isArray(el)) {
                this.appendChildren(li, el);
            } else if (el) {
                li.appendChild(el);
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
            const ATTR_MAP = {
                id: [assign, 'id'],
                text: [assign, 'textContent'],
                html: [assign, 'innerHTML'],
                accept: [assign],
                disabled: [this.disable, el],
                class: [this.addClass, el],
                value: [assign],
                placeholder: [assign],
                readonly: [assign, 'readOnly'],
                data: [Object.assign, el.dataset]
            };
            const DEFAULT_MAP = [echo, ''];
            // HTML attributes
            for (const key of Object.keys(attr)) {
                var val = ATTR_MAP[key] || DEFAULT_MAP;
                val[0](val[1] || key, attr[key]);
            }

            function assign(key, val) {
                el[key] = val;
            }
        }
    });
    
    function echo(o) { o; }
})(UTIL, HELPER);