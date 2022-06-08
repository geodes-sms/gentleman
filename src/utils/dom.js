import {
    hasOwn, findAncestor, isHTMLElement, getElement, createDiv, valOrDefault,
    isFunction, isString, isNullOrWhitespace
} from 'zenkai';


/**
 * Gets an event real target
 * @param {HTMLElement} element 
 * @returns {HTMLElement}
 */
export function getEventTarget(element) {
    const isValid = (el) => !hasOwn(el.dataset, "ignore");

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}

/**
 * Verifies is the element is displayed
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
export function isHidden(element) {
    if (!isHTMLElement) {
        throw new TypeError("Bad parameter");
    }

    return element.hidden || window.getComputedStyle(element).display === "none";
}


/**
 * Verifies whether an element can receive textual input
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
export const isInput = (element) => isHTMLElement(element, ["input", "textarea"]);

/**
 * Verifies whether an element can receive textual input
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
export const isInputCapable = (element) => isInput(element) || element.contentEditable === "true";

/**
 * Converts a pixel value to a number
 * @param {string} px 
 */
export const pixelToNumber = (px) => +px.substring(0, px.indexOf("px"));

/**
 * Computes the delta
 * @param {number} x 
 * @param {number} y 
 */
const delta = (x, y) => Math.abs(x - y);

const margin = {
    "top": (style) => style.marginTop,
    "right": (style) => style.marginRight,
    "bottom": (style) => style.marginBottom,
    "left": (style) => style.marginLeft,
};

const padding = {
    "top": (style) => style.paddingTop,
    "right": (style) => style.paddingRight,
    "bottom": (style) => style.paddingBottom,
    "left": (style) => style.paddingLeft,
};

const border = {
    "top": (style) => style.borderTopWidth,
    "right": (style) => style.borderRightWidth,
    "bottom": (style) => style.borderBottomWidth,
    "left": (style) => style.borderLeftWidth,
};

/**
 * Verifies if an element is the closest to a direction of a container
 * @param {HTMLElement} source 
 * @param {HTMLElement} container 
 * @param {string} dir 
 */
function isClosestTo(source, container, dir) {
    const sourceStyle = window.getComputedStyle(source);
    const containerStyle = window.getComputedStyle(container);

    const sourceMargin = margin[dir](sourceStyle);
    const containerPadding = padding[dir](containerStyle);
    const containerBorder = border[dir](containerStyle);

    let sourceDistance = source.getBoundingClientRect()[dir] + pixelToNumber(sourceMargin);
    let containerDistance = container.getBoundingClientRect()[dir] - pixelToNumber(containerPadding) - pixelToNumber(containerBorder);

    return delta(sourceDistance, containerDistance) < 2;
}

/**
 * Gets the first visible element
 * @param {HTMLElement} parent 
 */
export function getVisibleElement(parent) {
    for (let i = 0; i < parent.children.length; i++) {
        const element = parent.children[i];

        if (!isHidden(element)) {
            return element;
        }
    }

    return null;
}

/**
 * Get closest element from a direction inside an optional container
 * @param {HTMLElement} source 
 * @param {string} dir 
 * @param {HTMLElement} container 
 * @param {boolean} relative 
 */
export function getClosest(source, dir, container, relative) {
    if (dir === "up") {
        return getElementTop(source, container, relative);
    } else if (dir === "down") {
        return getElementBottom(source, container, relative);
    } else if (dir === "left") {
        return getElementLeft(source, container, relative);
    } else if (dir === "right") {
        return getElementRight(source, container, relative);
    }

    console.error("unknown direction", dir);

    return null;
}

export function getClosestSVG(source, dir, container, relative){
    if (dir === "up") {
        return getElementTopSVG(source, container, relative);
    } else if (dir === "down") {
        return getElementBottomSVG(source, container, relative);
    } else if (dir === "left") {
        return getElementLeftSVG(source, container, relative);
    } else if (dir === "right") {
        return getElementRightSVG(source, container, relative);
    }

    console.error("unknown direction", dir);

    return null;
}


/**
 * Get closest element above a source element inside an optional container
 * @param {HTMLElement} source 
 * @param {HTMLElement} container 
 * @param {boolean} relative 
 */
export function getElementTop(source, container, relative = true) {
    const items = container.children;

    const { top: top1, left: left1 } = source.getBoundingClientRect();

    if (relative && isClosestTo(source, container, "top")) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isHidden(item) || item.classList.contains("badge") || item === source) {
            continue;
        }

        const { bottom: bottom2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - bottom2);
        let $hdist = Math.abs(left1 - left2);

        if (top1 >= (bottom2 - 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

export function getElementTopSVG(source, container, relative = true) {
    const items = container.deciders;

    const top = source.getAttribute("y");
    const left1 = source.getAttribute("x");

    if (relative && isClosestTo(source, container, "top")) {
        return null;
    }

    let closest = null;

    let dist = 99999;
    let hdist = 99999;
    const penalty = 1.2;

    for (let i = 0; i < items.length; i++) {
        const item = items[i].foreign;

        if (item === source) {
            continue;
        }

        const bottom = Number(item.getAttribute("y")) + Number(item.getAttribute("height"));
        const left2 = item.getAttribute("x");

        let $vdist = Math.abs(top - bottom);
        let $hdist = Math.abs(left1 - left2);

        let $dist = $vdist + $hdist * penalty;

        if (Number(top) >= (Number(bottom) - 1) && ($dist < dist || ($dist === dist && $hdist < hdist))) {
            closest = items[i];
            dist = $dist;
            hdist = $hdist;
        }
    }

    return closest;
}

/**
 * Get closest element on the left of a source element inside an optional container
 * @param {HTMLElement} source 
 * @param {HTMLElement} container 
 */
export function getElementLeft(source, container, relative = true) {
    const items = container.children;

    const { top: top1, left: left1 } = source.getBoundingClientRect();

    if (relative && isClosestTo(source, container, "left")) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isHidden(item) || item.classList.contains("badge") || item === source) {
            continue;
        }

        const { top: top2, right: right2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(left1 - right2);

        if (left1 >= (right2 - 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

export function getElementLeftSVG(source, container, relative = true) {
    const items = container.deciders;

    let penalty = 1.2;

    const top = source.getAttribute("y");
    const left = source.getAttribute("x");

    if (relative && isClosestTo(source, container, "left")) {
        return null;
    }

    let closest = null;

    let dist = 99999;
    let vdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i].foreign;

        if (item === source) {
            continue;
        }

        const top1 = item.getAttribute("y");
        const right = Number(item.getAttribute("x")) + Number(item.getAttribute("width"));

        let $vdist = Math.abs(top - top1);
        let $hdist = Math.abs(left - right);

        let $dist = penalty * $vdist + $hdist;

        if (left >= (right - 1) && ($dist < dist || (($dist === dist) && ( $vdist < vdist)))) {
            closest = items[i];
            vdist = $vdist;
            dist = $dist;
        }
    }

    return closest;
}
/**
 * Get closest element on the right of a source element inside an optional container
 * @param {HTMLElement} source 
 * @param {HTMLElement} container 
 */
export function getElementRight(source, container, relative = true) {
    const items = container.children;

    const { top: top1, right: right1 } = source.getBoundingClientRect();

    if (relative && isClosestTo(source, container, "right")) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isHidden(item) || item.classList.contains("badge") || item === source) {
            continue;
        }

        const { top: top2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(right1 - left2);

        if (right1 <= (left2 + 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

export function getElementRightSVG(source, container, relative = true) {
    const items = container.deciders;

    const top = source.getAttribute("y");
    const right = Number(source.getAttribute("x")) + Number(source.getAttribute("width"));

    if (relative && isClosestTo(source, container, "bottom")) {
        return null;
    }


    let closest = null;

    let dist = 99999;
    let vdist = 99999;
    const penalty = 1.2;

    for (let i = 0; i < items.length; i++) {
        const item = items[i].foreign;

        if (item === source) {
            continue;
        }

        const top2 =  item.getAttribute("y");
        const left =  item.getAttribute("x");
        
        let $vdist = Math.abs(top - top2);
        let $hdist = Math.abs(right - left);

        let $dist = penalty * $vdist + $hdist;

        if (Number(right) <= (Number(left) + 1) && ($dist < dist || ($dist === dist && $vdist < vdist))) {
            closest = items[i];
            vdist = $vdist;
            dist = $dist;
        }
    }

    return closest;
}

/**
 * Get closest element below a source element inside an optional container
 * @param {HTMLElement} source 
 * @param {HTMLElement} container 
 */
export function getElementBottom(source, container, relative = true) {
    const items = container.children;

    const { bottom: bottom1, left: left1 } = source.getBoundingClientRect();

    if (relative && isClosestTo(source, container, "bottom")) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isHidden(item) || item.classList.contains("badge") || item === source) {
            continue;
        }

        const { top: top2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(bottom1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if (bottom1 <= (top2 + 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

export function getElementBottomSVG(source, container, relative = true) {
    const items = container.deciders;

    const bottom = Number(source.getAttribute("y")) + Number(source.getAttribute("height"));
    const left1 = source.getAttribute("x");

    if (relative && isClosestTo(source, container, "bottom")) {
        return null;
    }


    let closest = null;

    let dist = 99999;
    let hdist = 99999;
    const penalty = 1.2;

    for (let i = 0; i < items.length; i++) {
        const item = items[i].foreign;

        if (item === source) {
            continue;
        }

        const top =  item.getAttribute("y");
        const left =  item.getAttribute("x");
        

        let $vdist = Math.abs(bottom - top);
        let $hdist = Math.abs(left1 - left);
         
        let $dist = $vdist + penalty * $hdist;

        if (Number(bottom) <= (Number(top) + 1) && ($dist < dist || ($dist === dist && $hdist < hdist))) {
            closest = items[i];
            dist = $dist;
            hdist = $hdist;
        }
    }

    return closest;
}

/**
 * Returns the closest element to the top of its parent container
 * @param {HTMLElement} container 
 * @returns {HTMLElement|null} The closest element to the top.
 */
export function getTopElement(container, pred) {
    const items = container.children;

    const { top: top1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    const usePred = isFunction(pred);
    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (usePred && !pred(item)) {
            continue;
        }

        if (isHidden(item) || item.classList.contains("badge")) {
            continue;
        }

        const { top: top2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if (top1 <= (top2 + 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

/**
 * Returns the closest element to the left side of its parent container
 * @param {HTMLElement} container 
 * @returns {HTMLElement|null} The closest element to the left side.
 */
export function getLeftElement(container, pred) {
    const items = container.children;

    const { top: top1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    const usePred = isFunction(pred);
    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (usePred && !pred(item)) {
            continue;
        }

        if (isHidden(item) || item.classList.contains("badge")) {
            continue;
        }

        const { top: top2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(left1 - left2);

        if (left1 <= (left2 + 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

/**
 * Returns the closest element to the right side of its parent container
 * @param {HTMLElement} container 
 * @returns {HTMLElement|null} The closest element to the right side.
 */
export function getRightElement(container, pred) {
    const items = container.children;

    const { top: top1, right: right1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    const usePred = isFunction(pred);
    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (usePred && !pred(item)) {
            continue;
        }

        if (isHidden(item) || item.classList.contains("badge")) {
            continue;
        }

        const { top: top2, right: right2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(top1 - top2);
        let $hdist = Math.abs(right1 - right2);

        if (right1 >= (right2 - 1) && ($hdist < hdist || ($hdist === hdist && $vdist < vdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

/**
 * Returns the closest element to the bottom of its parent container
 * @param {HTMLElement} container 
 * @returns {HTMLElement|null} The closest element to the bottom.
 */
export function getBottomElement(container, pred) {
    const items = container.children;

    const { bottom: bottom1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    const usePred = isFunction(pred);
    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (usePred && !pred(item)) {
            continue;
        }

        if (isHidden(item) || item.classList.contains("badge")) {
            continue;
        }

        const { bottom: bottom2, left: left2 } = item.getBoundingClientRect();

        let $vdist = Math.abs(bottom1 - bottom2);
        let $hdist = Math.abs(left1 - left2);

        if (bottom1 >= (bottom2 - 1) && ($vdist < vdist || ($vdist === vdist && $hdist < hdist))) {
            closest = item;
            vdist = $vdist;
            hdist = $hdist;
        }
    }

    return closest;
}

/** Creates a container
 * @param {string|HTMLElement} container
 * @returns {HTMLElement}
 */
export function resolveContainer(container) {
    if (isHTMLElement(container)) {
        return container;
    } else if (isString(container) && !isNullOrWhitespace(container)) {
        return getElement(container);
    }

    return null;
}

/**
 * Create the resizer elements
 * @returns {HTMLElement}
 */
function createCornerResizer() {
    let container = createDiv({
        class: ["resizers"]
    });

    ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(dir => {
        container.append(createDiv({
            class: ["resizer", `${dir}`],
            dataset: {
                dir: dir
            }
        }));
    });

    return container;
}


/**
 * Create the resizer elements
 * @returns {HTMLElement}
 */
function createResizer() {
    let container = createDiv({
        class: ["resizers"]
    });

    ["horizontal", "vertical"].forEach(dir => {
        container.append(createDiv({
            class: ["resizer", `${dir}`],
            dataset: {
                dir: dir
            }
        }));
    });

    return container;
}

/**
 * Adds resizable handlers to a container
 * @param {string|HTMLElement} _container 
 * @param {*} _options 
 * @returns {HTMLElement}
 */
export function makeResizable(_container, _options = {}) {
    /** @type {HTMLElement} */
    const container = resolveContainer(_container);

    if (!isHTMLElement(container)) {
        return null;
    }

    const options = Object.assign({
        horizontal: true,
        vertical: true,
        minWidth: 60,
        minHeight: 60
    }, _options);

    const resizers = createResizer();
    container.prepend(resizers);

    if (options.horizontal && options.vertical) {
        container.dataset.resizable = "both";
    } else if (options.horizontal) {
        container.dataset.resizable = "horizontal";
    } else if (options.vertical) {
        container.dataset.resizable = "vertical";
    }

    const { minWidth, minHeight } = getComputedStyle(container);

    const MIN_WIDTH = valOrDefault(pixelToNumber(minWidth), options.minWidth);
    const MIN_HEIGHT = valOrDefault(pixelToNumber(minHeight), options.minHeight);

    let start = 0;
    let activeResizer = null;

    function resize(event) {
        const { dir } = activeResizer.dataset;

        const { width, height } = getComputedStyle(container);
        let end = dir === "horizontal" ? event.pageX : event.pageY;

        if (dir === "horizontal") {
            const resize_width = pixelToNumber(width) + (end - start);

            if (resize_width > MIN_WIDTH) {
                container.style.width = `${resize_width}px`;
            }
        } else if (dir === "vertical") {
            const resize_height = pixelToNumber(height) + (end - start);

            if (resize_height > MIN_HEIGHT) {
                container.style.height = `${resize_height}px`;
            }
        }

        start = end;
    }

    for (let i = 0; i < resizers.childElementCount; i++) {
        const currentResizer = resizers.children[i];

        currentResizer.addEventListener('mousedown', function (event) {
            event.preventDefault();
            activeResizer = currentResizer;

            const { dir } = activeResizer.dataset;
            start = dir === "horizontal" ? event.pageX : event.pageY;

            document.body.addEventListener('mousemove', resize);
            document.body.addEventListener('mouseup', () => {
                document.body.removeEventListener("mousemove", resize);
            });
        });
    }

    return container;
}