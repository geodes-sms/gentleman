import { createButton, createSpan, addClass, removeClass } from '@zenkai/utils/dom/index.js';
import { UI } from '@src/global/enums.js';

const EL = UI.Element;

export const createOptionSelect = function (min, max, path) {
    var input = createSpan({
        class: ['option', UI.EMPTY],
        data: {
            placeholder: "What next?",
            path: path,
            position: min + ".." + max
        }
    });
    input.contentEditable = true;

    return input;
};

export const createButtonNew = function (caption, clickHandler) {
    var btnNew = createButton({ class: ['btn', 'btn-new'], data: { action: 'add' } });
    btnNew.appendChild(createSpan({ class: "btn-new-content", html: "<strong>New</strong> " + caption }));
    btnNew.tabIndex = -1;

    btnNew.addEventListener('click', clickHandler, false);

    return btnNew;
};

export const createButtonAdd = function (clickHandler) {
    var btnAdd = createButton({
        class: EL.BUTTON_ADD,
        text: "Add",
        data: { action: 'add' }
    });
    btnAdd.tabIndex = -1;

    btnAdd.addEventListener('click', clickHandler, false);

    return btnAdd;
};

/**
 * Creates a delete button
 * @param {HTMLElement} container 
 * @param {Object} clickHandler 
 */
export const createButtonDelete = function (container, clickHandler) {
    var btnDelete = createButton({
        class: EL.BUTTON_DELETE,
        text: "✖",
        data: { action: 'remove' }
    });

    btnDelete.addEventListener('click', clickHandler);
    btnDelete.addEventListener('mouseenter', function (event) {
        if (!btnDelete.disabled)
            addClass(container, "delete");
        // var emptyList = me.getElements('.empty', container);
        // for (let i = 0, len = emptyList.length; i < len; i++) {
        //     let item = emptyList.item(i);
        //     me.hide(item);
        //     me.addClass(item, "ignore");
        // }
        // // hide buttons
        // emptyList = me.getElements('.btn', container);
        // for (let i = 0, len = emptyList.length; i < len; i++) {
        //     let item = emptyList.item(i);
        //     me.hide(item);
        //     me.addClass(item, "ignore");
        // }
    });
    btnDelete.addEventListener('mouseleave', function (event) {
        if (!btnDelete.disabled)
            removeClass(container, "delete");
        // var readList = me.getElements('.ignore', container);
        // for (let i = readList.length - 1; i >= 0; i--) {
        //     let item = readList.item(i);
        //     me.show(item);
        //     me.removeClass(item, "ignore");
        // }
    });
    addClass(container, "removable");

    return btnDelete;
};