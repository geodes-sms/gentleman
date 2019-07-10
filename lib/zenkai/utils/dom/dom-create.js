import { disable } from './dom-effects.js';
import { isString } from './../datatype/type-manip.js';

const create = (tagName) => document.createElement(tagName);

const addClass = (el, c) => {
    // If c is an Array => Format c as a space-separated string
    if (Array.isArray(c)) {
        c = c.join(' ');
    }
    if (isString(c)) {
        el.className = c;
    }
};

/**
 * Creates the element for the specified tagName
 * @param {string} tagName element
 * @returns {HTMLElement}
 * @memberof DOM
 */
export function createElement(tagName, eId, eClass) {
    var el = document.createElement(tagName);
    if (eId) {
        el.id = eId;
    }
    if (eClass) {
        addClass(el, eClass);
    }

    return el;
}

/**
 * Creates a document fragment
 * @returns {DocumentFragment}
 * @memberof DOM
 */
export function createDocFragment() { return document.createDocumentFragment(); }

export function createTextNode(str) { return document.createTextNode(str); }

/**
 * Creates a `<link>` element with some attributes
 * @param {string} rel 
 * @param {string} href 
 * @param {object} attr 
 * @memberof DOM
 */
export function createLink(rel, href, attr) {
    var link = create("link");
    link.rel = rel;
    link.href = href;

    if (attr) {
        addAttributes(link, attr);
    }

    return link;
}

["stylesheet"].forEach(function (rel) {
    createLink[rel] = function (href, attr) {
        return createLink(rel, href, attr);
    };
});


export function createHeader(attr) {
    var header = create('header');

    if (attr) {
        addAttributes(header, attr);
    }

    return header;
}

/**
 * Creates a `<div>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLDivElement}
 * @memberof DOM
 */
export function createDiv(attr, children) {
    var div = create("div");

    if (attr) {
        addAttributes(div, attr);
    }
    if (children) {
        addChildren(div, children);
    }

    return div;
}

/**
 * Creates an `<aside>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLElement}
 * @memberof DOM
 */
export function createAside(attr) {
    var aside = create('aside');

    if (attr) {
        addAttributes(aside, attr);
    }

    return aside;
}

export function createLineBreak() { return create('br'); }

/**
 * Creates a `<h[1..6]>` (heading) element with some attributes
 * @param {string} lvl Level
 * @param {Object} [attr] attributes
 * @returns {HTMLHeadingElement}
 * @memberof DOM
 */
export function createHeading(lvl, attr) {
    var h = create(lvl);

    if (attr) {
        addAttributes(h, attr);
    }

    return h;
}

/**
 * Creates a `<p>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLParagraphElement}
 * @memberof DOM
 */
export function createP(attr) {
    var p = create("p");

    if (attr) {
        addAttributes(p, attr);
    }

    return p;
}

/**
 * Creates a `<ul>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLUListElement}
 * @memberof DOM
 */
export function createUl(attr) {
    var ul = create("ul");

    if (attr) {
        addAttributes(ul, attr);
    }

    return ul;
}

/**
 * Creates a `<li>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createLi(attr, el) {
    var li = create('li');

    if (attr) {
        addAttributes(li, attr);
    }

    if (el) {
        addChildren(li, el);
    }

    return li;
}

// Inline Element

/**
 * Creates an `<a>` element with some attributes
 * @param {string} href URL or a URL fragment that the hyperlink points to
 * @param {Object} [attr] attributes
 * @returns {HTMLAnchorElement}
 * @memberof DOM
 */
export function createAnchor(href, attr) {
    var a = create('a');
    if (href) {
        a.href = href;
    }
    if (attr) {
        addAttributes(a, attr);
    }

    return a;
}

/**
  * Creates a `<img>` element with some attributes
  * @param {string} src
  * @param {string} alt
  * @param {Object} [attr] attributes
  * @returns {HTMLImageElement}
  * @memberof DOM
  */
export function createImage(src, alt, attr) {
    var img = create('img');

    if (src) {
        img.src = src;
    }
    if (alt) {
        img.alt = alt;
    }
    if (attr) {
        addAttributes(img, attr);
    }

    return img;
}

/**
 * Creates a `<span>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createSpan(attr) {
    var span = create("span");

    if (attr) {
        addAttributes(span, attr);
    }

    return span;
}

/**
 * Creates a `<strong>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createStrong(attr) {
    var strong = create("strong");

    if (attr) {
        addAttributes(strong, attr);
    }

    return strong;
}

/**
 * Creates a `<em>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createEm(attr) {
    var em = create("em");

    if (attr) {
        addAttributes(em, attr);
    }

    return em;
}

// Form Element

/**
 * Creates a `<input>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLInputElement}
 * @memberof DOM
 */
export function createInput(attr) {
    var input = create('input');

    if (attr) {
        addAttributes(input, attr);
    }

    return input;
}

["checkbox", "hidden", "file"].forEach(function (type) {
    createInput[type] = function (attr) {
        var input = createInput(attr);
        input.type = type;
        return input;
    };
});

/**
 * Creates a `<label>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLLabelElement}
 * @memberof DOM
 */
export function createLabel(attr) {
    var label = create('label');

    if (attr) {
        addAttributes(label, attr);
    }

    return label;
}

/**
 * Creates a `<textarea>` element with some attributes
 * @param {Object} [attr] attributes
 * @returns {HTMLTextAreaElement}
 * @memberof DOM
 */
export function createTextArea(attr) {
    var textArea = create('textarea');

    if (attr) {
        addAttributes(textArea, attr);
    }

    return textArea;
}

/**
 * Creates a `<button>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createButton(attr) {
    var btn = create("button");
    btn.type = "button";

    if (attr) {
        addAttributes(btn, attr);
    }

    return btn;
}

/**
 * Creates a `<table>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTable(attr) {
    var table = create("table");

    if (attr) {
        addAttributes(table, attr);
    }

    return table;
}

/**
 * Creates a `<thead>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableHeader(attr) {
    var thead = create("thead");

    if (attr) {
        addAttributes(thead, attr);
    }

    return thead;
}

/**
 * Creates a `<tbody>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableBody(attr) {
    var tbody = create("tbody");

    if (attr) {
        addAttributes(tbody, attr);
    }

    return tbody;
}

/**
 * Creates a `<tfoot>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableFooter(attr) {
    var tfoot = create("tfoot");

    if (attr) {
        addAttributes(tfoot, attr);
    }

    return tfoot;
}

/**
 * Creates a `<tr>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableRow(attr) {
    var tr = create("tr");

    if (attr) {
        addAttributes(tr, attr);
    }

    return tr;
}

/**
 * Creates a `<th>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableHeaderCell(attr) {
    var th = create("th");

    if (attr) {
        addAttributes(th, attr);
    }

    return th;
}

/**
 * Creates a `<td>` element with some attributes
 * @param {Object} [attr] attributes
 * @memberof DOM
 */
export function createTableCell(attr) {
    var td = create("td");

    if (attr) {
        addAttributes(td, attr);
    }

    return td;
}

/**
 * Sets the attributes of an element
 * @param {HTMLElement} el element
 * @param {Object} attr attribute
 * @memberof DOM
 */
export function addAttributes(el, attr) {
    const ATTR_MAP = {
        id: [assign],
        text: [assign, 'textContent'],
        html: [assign, 'innerHTML'],
        accept: [assign],
        disabled: [disable, el],
        class: [addClass, el],
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

/**
 * Appends the children to the element
 * @param {HTMLElement} el element
 * @param {HTMLCollection} children children elements
 * @memberof DOM
 */
function addChildren(el, children) {
    if (Array.isArray(children)) {
        appendChildren(el, children);
    } else if (children instanceof Element) {
        el.appendChild(children);
    }

    return el;
}

/**
 * Append a list of elements to a node.
 * @param {HTMLElement} parent
 * @param {HTMLElement[]} children
 * @memberof DOM
 */
export function appendChildren(parent, children) {
    var fragment = createDocFragment();
    children.forEach(element => {
        fragment.appendChild(element);
    });
    parent.appendChild(fragment);
    fragment = null;

    return parent;
}

function echo(o) { o; }