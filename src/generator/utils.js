import { getElement, createEmphasis, valOrDefault } from "zenkai";


const ATTR_NAME = "name";

export const getAttr = (concept, name) => concept.getAttributeByName(name).target;

export const getReference = (concept, attr) => getAttr(concept, attr).getReference();

export const getReferenceValue = (concept, attr, deep = false) => getReference(concept, attr).getValue();

export const getReferenceName = (concept, attr) => getName(getReference(concept, attr));

export const getValue = (concept, attr, deep = false) => getAttr(concept, attr).getValue(deep);

export const hasValue = (concept, attr) => getAttr(concept, attr).hasValue();

export const hasAttr = (concept, name) => concept.isAttributeCreated(name);

export const getName = (concept) => valOrDefault(getValue(concept, ATTR_NAME), "").toLowerCase();


export function createProjectionLink(text, concept) {
    const { id, name } = concept;

    let link = createEmphasis({
        class: ["link", "error-message__link"],
        title: name,
    }, text);

    const targetSelector = `.projection[data-concept="${id}"]`;

    link.addEventListener("mouseenter", (event) => {
        let targetProjection = getElement(targetSelector, this.body);
        if (targetProjection) {
            this.highlight(targetProjection);
        }
    });

    link.addEventListener("mouseleave", (event) => {
        this.unhighlight();
    });

    link.addEventListener("click", (event) => {
        let target = this.resolveElement(getElement(targetSelector, this.body));

        if (target) {
            target.focus();
        }
    });

    return link;
}