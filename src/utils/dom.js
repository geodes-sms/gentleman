import { hasOwn, findAncestor, isHTMLElement } from 'zenkai';


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


/**
 * Returns the closest element to the top of its parent container
 * @param {HTMLElement} container 
 * @returns {HTMLElement|null} The closest element to the top.
 */
export function getTopElement(container) {
    const items = container.children;

    const { top: top1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

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
export function getLeftElement(container) {
    const items = container.children;

    const { top: top1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

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
export function getRightElement(container) {
    const items = container.children;

    const { top: top1, right: right1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

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
export function getBottomElement(container) {
    const items = container.children;

    const { bottom: bottom1, left: left1 } = container.getBoundingClientRect();

    if (items.length === 0) {
        return null;
    }

    let closest = null;

    let vdist = 99999;
    let hdist = 99999;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

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
