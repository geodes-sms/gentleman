import { removeChildren, isHTMLElement, findAncestor } from 'zenkai';

export const ActionHandler = {
    "delete:value": (target) => {
        const { id } = target.dataset;

        this.conceptModel.removeValue(id);
        this.header._valueSelector.update();
    },
    "delete:resource": (target) => {
        const { id } = target.dataset;

        this.removeResource(id);
    },
    "change-view": (target) => {
        const { value } = target.dataset;
        this.status.changeView(value);
    },
    "add-group": (target) => {
        this.status.addGroup();
    },

    "export--copy": (target) => { this.export(true); },

};