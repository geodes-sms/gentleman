import { createAnchor, isNullOrWhitespace } from "zenkai";

/**
 * Duplicate the current tab
 */
export function duplicateTab() {
    window.URL = window.webkitURL || window.URL;

    /** @type {HTMLAnchorElement} */
    var link = createAnchor({
        href: "",
        target: "_blank",
        rel: "noopener noreferrer"
    }, "");

    if (!isNullOrWhitespace(link.href)) {
        window.URL.revokeObjectURL(link.href);
    }

    link.click();

    // Need a small delay for the revokeObjectURL to work properly.
    setTimeout(() => {
        window.URL.revokeObjectURL(link.href);
        link.remove();
    }, 1500);
}