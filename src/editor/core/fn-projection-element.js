import { isNullOrUndefined, isEmpty, isHTMLElement, } from 'zenkai';

export const FnProjectionElement = {
    /**
  * Get a the related field object
  * @param {HTMLElement} element 
  * @returns {Field}
  */
    getField(element) {

        if (!isHTMLElement(element) && element.tagName !== "path" && element.tagName !== "text" && element.tagName !== "svg") {
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
        if (!isHTMLElement(element) && element.tagName !== "svg") {
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
        if (!isHTMLElement(element) && element.tagName !== "svg") {
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

    getAlgo(element) {
        if (!isHTMLElement(element) && element.tagName !== "svg" && element.tagName !== "text") {
            console.warn("Algo error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Algo error: Missing id attribute on field");
            return null;
        }

        if (!["algorithm"].includes(nature)) {
            console.warn("algo error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getAlgo(id);
    },

    getSimulation(element) {
        if (!isHTMLElement(element) && element.tagName !== "svg" && element.tagName !== "text") {
            console.warn("Simulation error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Simulation error: Missing id attribute on Simulation");
            return null;
        }

        if (!["simulation"].includes(nature)) {
            console.warn("Simulation error: Unknown nature attribute on Simulation");
            return null;
        }

        return this.projectionModel.getSimulation(id);
    },

    /**
     * Get a the related arrow object
     * @param {HTMLElement} element 
     * @returns {Algorithm}
     */
     getArrow(element) {

        if (element.tagName !== "path") {
            console.warn("Arrow error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Arrow error: Missing id attribute on field");
            return null;
        }

        if (!["arrow", "arrow-path"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getArrow(id);
    },

    resolveElement(element) {

        console.log("This resolve?");
        console.log(element);

        if(element instanceof SVGElement){
            console.log("SVG");
            let copy = element;

            while(!isNullOrUndefined(copy.parentNode) && isNullOrUndefined(copy.dataset)){
                copy = copy.parentNode;
            }

            if(!isNullOrUndefined(copy.dataset.nature)){
                element = copy;
            }
        }

        if (!isHTMLElement(element) &&  element.tagName !== "path" && element.tagName !== "svg" && element.tagName !== "text") {
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
                break;
            case "simulation":
                projectionElement = this.getSimulation(element);
                break;
            case "arrow":
                projectionElement = this.getArrow(element);
                break;
        }

        if (projectionElement) {
            projectionElement.environment = this;
        }

        return projectionElement;
    },
};