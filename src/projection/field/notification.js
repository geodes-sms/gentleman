import { createDocFragment, createSpan, createI, } from "zenkai";
import { NotificationType } from "@utils/index.js";


/**
 * Creates a notification message
 * @param {string} type 
 * @param {string} message 
 * @returns {HTMLElement}
 */
export function createNotificationMessage(type, message) {
    var element = createSpan({ class: ["notification-message", `notification-message--${type}`] }, message);

    if (Array.isArray(message)) {
        element.style.minWidth = `${Math.min(message[0].length * 0.5, 30)}em`;
    } else {
        element.style.minWidth = `${Math.min(message.length * 0.5, 30)}em`;
    }

    return element;
}
