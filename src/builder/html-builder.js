export const HtmlBuilder = {
    /**
     * Creates a simple HTMLInputElement.
     *
     * @return { HTMLInputElement } : A freshly created HtmlInputElement.
     */
    createInput() {
        return document.createElementNS("http://www.w3.org/1999/xhtml", "input");
    }
}