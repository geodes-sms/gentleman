import { createStrong, createLineBreak, createEmphasis } from 'zenkai';

export const TypeWriterType = {
    NORMAL: 0,
    BOLD: 1,
    ITALIC: 2,
    UNDERLINE: 3
};

/**
 * This function simulates the typing
 * @param {HTMLElement} container 
 * @param {string} content 
 * @param {Function} callback
 */
export function TypeWriter(container, content, callback) {
    var i = 0,
        index = 0,
        len = 0,
        count = content.length;
    content.forEach(function (T) { len += T.val.length; });
    var timeout = Math.ceil(20 + Math.log(len) * (200 / len));
    var current = container;

    var a = setInterval(function () {
        var part = content[index];
        var val = part.val;
        var char = val[i];

        if (char === '\n') {
            current.appendChild(createLineBreak());
        } else {
            switch (part.type) {
                case TypeWriterType.NORMAL:
                    break;
                case TypeWriterType.BOLD:
                    if (i === 0) {
                        current = createElement(createStrong(), part.tooltip);
                    }
                    break;
                case TypeWriterType.ITALIC:
                    if (i === 0) {
                        current = createElement(createEmphasis(), part.tooltip);
                    }
                    break;
                case TypeWriterType.UNDERLINE:
                    break;
                default:
                    break;
            }
            current.innerHTML += char;
        }
        i++;

        if (i === val.length) {
            current = container;
            i = 0;
            index++;
        }

        if (index === count) {
            clearInterval(a);
            if (callback) callback();
        }
    }, timeout);

    function createElement(el, tooltip) {
        if (tooltip) el.dataset.tooltip = tooltip;
        current.appendChild(el);

        return el;
    }
}