import { isNullOrUndefined, isEmpty, isHTMLElement, } from 'zenkai';

export const FnProjectionElement = {
    /**
  * Get a the related field object
  * @param {HTMLElement} element 
  * @returns {Field}
  */
    getField(element) {
        if (!isHTMLElement(element)) {
            console.warn("Field error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Field error: Missing id attribute on field");
            return null;
        }

        if (!["field", "field-component"].includes(nature)) {
            console.warn("Field error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getField(id);
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     * @returns {Static}
     */
    getStatic(element) {
        if (!isHTMLElement(element)) {
            console.warn("Static error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Static error: Missing id attribute on field");
            return null;
        }

        if (!["static", "static-component"].includes(nature)) {
            console.warn("Static error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getStatic(id);
    },
    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Layout}
     */
    getLayout(element) {
        if (!isHTMLElement(element)) {
            console.warn("Layout error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Layout error: Missing id attribute on field");
            return null;
        }

        if (!["layout", "layout-component"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getLayout(id);
    },
    /**
   * Get a the related layout object
   * @param {HTMLElement} element 
   * @returns {Algorithm}
   */
    getAlgo(element) {
        if (!isHTMLElement(element)) {
            console.warn("Algorithm error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Algorithm error: Missing id attribute on field");
            return null;
        }

        if (!["algorithm", "algorithm-component"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getAlgo(id);
    },
    resolveElement(element) {
        if (!isHTMLElement(element)) {
            return null;
        }

        const { nature } = element.dataset;

        if (isNullOrUndefined(nature)) {
            return null;
        }

        let projectionElement = null;

        switch (nature) {
            case "field":
            case "field-component":
                projectionElement = this.getField(element);
                break;
            case "layout":
            case "layout-component":
                projectionElement = this.getLayout(element);
                break;
            case "static":
            case "static-component":
                projectionElement = this.getStatic(element);
                break;
            case "algorithm":
                projectionElement = this.getAlgo(element);
        }

        if (projectionElement) {
            projectionElement.environment = this;
        }

        return projectionElement;
    },
};