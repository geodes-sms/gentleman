export const SvgBuilder = {
    /**
     * Creates a simple SVGElement.
     *
     * @returns { SVGElement } : A freshly created SVGElement.
     */
    createSvg() {
       return document.createElementNS("http://www.w3.org/2000/svg", "svg");
    },

    /**
     * Creates a simple SVGRectElement element.
     *
     * @return { SVGRectElement } : A freshly created SVGRectElement.
     */
    createRect() {
        return document.createElementNS("http://www.w3.org/2000/svg", "rect");
    },

    /**
     * Creates a simple SVGTextElement.
     *
     * @return { SVGTextElement } : A freshly created SVGRectElement.
     */
    createText() {
        return document.createElementNS("http://www.w3.org/2000/svg", "text");
    },

    /**
     * Creates a simple SVGTspanElement.
     *
     * @return { SVGTSpanElement } : A freshly created SVGTspanElement.
     */
    createTSpan() {
        return document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    },

    /**
     * Creates a simple SVGForeignObjectElement.
     *
     * @return { SVGForeignObjectElement } : A freshly created SVGForeignObjectElement.
     */
    createForeignObject() {
        return document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    }
}