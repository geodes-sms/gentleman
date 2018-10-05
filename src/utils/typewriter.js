import { UTIL as $ } from './utils.js';

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
        var char = part.val[i];

        if (char === '\n') {
            current.appendChild($.createLineBreak());
        } else {
            switch (+part.type) {
                case 0: // normal
                    break;
                case 1: // bold
                    if (i === 0) {
                        let strong = $.createStrong();
                        current.appendChild(strong);
                        current = strong;
                    }
                    break;
                case 2: // italic
                    if (i === 0) {
                        let em = $.createEm();
                        if (part.tooltip) em.dataset.tooltip = part.tooltip;
                        current.appendChild(em);
                        current = em;
                    }
                    break;
                case 3: // underline
                    break;
                default:
                    break;
            }
            current.innerHTML += char;
        }
        i++;

        if (i === part.val.length) {
            current = container;
            i = 0;
            index++;
        }

        if (index === count) {
            clearInterval(a);
            if (callback) callback();
        }
    }, timeout);
}