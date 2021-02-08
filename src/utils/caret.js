/**
 * Gets the caret index in element
 * @param {HTMLElement} element 
 * @returns {number}
 */
export function getCaretIndex(element) {
    let position = 0;

    const selection = window.getSelection();
    if (selection.rangeCount !== 0) {
        const range = window.getSelection().getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        position = preCaretRange.toString().length;
    }

    return position;
}