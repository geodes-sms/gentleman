export const SvgHelper = {
    /**
     * Makes an element focusable.
     *
     * @param element : SVGElement. The element that should be focusable.
     */
    allowFocus(element) {
        element.tabIndex = 0;
    },

    /**
     * Makes an element impossible to focus.
     *
     * @param element : SVGElement. The element that should not be focusable.
     */
    preventFocus(element) {
        element.tabIndex = -1;
    },

    /**
     * Makes an element impossible to interact with.
     *
     * @param element : SVGElement. The element that should not be interacted with.
     */
    preventInteraction(element) {
        element.dataset.ignore = "all";
    },

    /**
     * Sets an attribute on an SVGElement.
     *
     * @param element : SVGElement. The SVGElement.
     * @param attribute : string. The attribute's name.
     * @param value : Object. The attribute's value.
     */
    set(element, attribute, value) {
        element.setAttribute(attribute, value);
    },

    /**
     * Gets an SVGElement's attribute value.
     *
     * @param element : SVGElement. The SVGElement.
     * @param attribute : string. The attribute.
     *
     * @return { Object } : The attribute's value.
     */
    get(element, attribute) {
        return element.getAttribute(attribute);
    },

    /**
     * Removes an attribute on an SVGElement.
     *
     * @param element : SVGElement. The SVGElement.
     * @param attribute : string. The attribute's name.
     */
    remove(element, attribute) {
        element.removeAttribute(attribute);
    },

    /**
     * Gets the element relative size and position.
     *
     * @param element : SVGElement. The SVGElement.
     *
     * @return { DOMRect } : The element's relative box.
     */
    getBox(element) {
        return element.getBBox();
    },

    /**
     * Sets the viewBox of an SVGElement.
     *
     * @param element : SVGElement. The SVGElement.
     * @param box : DOMRect. The element's viewBox information.
     */
    setViewBox(element, box){
        const value = box.x + " " + box.y + " " + box.width + " " + box.height;
        this.set(element, "viewBox", value)
    },

    /**
     * Gets the element absolute size and position.
     *
     * @param element : SVGElement. The SVGElement.
     *
     * @return { DOMRect } : The element's absolute box.
     */
    getAbsBox(element) {
        return element.getBoundingClientRect();
    },

    /**
     * Computes the distance on a single axis between two points.
     *
     * @param a : number. The first point position on the axis.
     * @param b : number. The second point position on the axis.
     *
     * @return {number}
     */
    getDistanceOnAxe(a, b) {
        return Math.pow(a - b, 2);
    },

    /**
     * Gets the starting position of a char in a SVGTSpanElement on the x-axis.
     *
     * @param element : SVGTSpanElement. The SVGTspanElement.
     * @param index : number. The character index.
     *
     * @return {number} : The starting position of the character on the x-axis.
     */
    getStartPosCharX(element, index) {
        return element.getStartPositionOfChar(index).x;
    },

    /**
     * Gets the ending position of a char in a SVGTSpanElement on the x-axis.
     *
     * @param element : SVGTSpanElement. The SVGTspanElement.
     * @param index : number. The character index.
     *
     * @return {number} : The ending position of the character on the x-axis.
     */
    getEndPosCharX(element, index) {
        return element.getEndPositionOfChar(index).x;
    },

    /**
     * Gets the childNode of an element based on its index.
     *
     * @param element : SVGElement. The element.
     * @param index : number. The index.
     *
     * @return { HTMLElement | null } : The child element at the specified index or null if it does not exist.
     */
    getChild(element, index = 0) {
        if(element.childNodes.length <= index) {
            return null;
        }

        return element.childNodes[index];
    }
}