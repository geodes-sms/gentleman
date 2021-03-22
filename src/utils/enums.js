export const Environment = {
    PROD: 'production',
    DEV: 'development',
    TEST: 'test'
};

/**
 * Enum for event type values.
 * @readonly
 * @enum {string}
 */
export const EventType = {
    CHANGE: 'change',
    CLICK: 'click',
    FOCUSIN: 'focusin',
    FOCUSOUT: 'focusout',
    INPUT: 'input',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    MOUSEENTER: 'mouseenter',
    MOUSEOVER: 'mouseover',
    MOUSELEAVE: 'mouseleave'
};

export const Key = {
    backspace: "Backspace",
    tab: "Tab",
    enter: "Enter",
    ctrl: "Control",
    alt: "Alt",
    escape: "Escape",
    spacebar: " ",
    page_up: "PageUp",
    page_down: "PageDown",
    insert: "Insert",
    end: "End",
    home: "Home",
    left_arrow: "ArrowLeft",
    up_arrow: "ArrowUp",
    right_arrow: "ArrowRight",
    down_arrow: "ArrowDown",
    delete: "Delete",
    period: ".",
};

export const NotificationType = {
    NORMAL: "normal",
    WARNING: "warning",
    SUCCESS: "success",
    ERROR: "error"
};

export const LogType = {
    NORMAL: "normal",
    WARNING: "warning",
    SUCCESS: "success",
    ERROR: "error"
};

export const EditorMode = {
    MODEL: "model",
    DESIGN: "design"
};

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export const DocumentType = {
    AAC: {
        type: "audio/aac",
        extension: "aac"
    },
    BIN: {
        type: "application/octet-stream",
        extension: "bin"
    },
    JPEG: {
        type: "image/jpeg",
        extension: "jpeg"
    },
    JSON: {
        type: "application/json",
        extension: "json"
    },
    MP3: {
        type: "audio/mpeg",
        extension: "mp3"
    },
    PDF: {
        type: "application/pdf",
        extension: "pdf"
    },
    SVG: {
        type: "image/svg+xml",
        extension: "svg"
    },
    TEXT: {
        type: "text/plain",
        extension: "txt"
    },
    XML: {
        type: "text/xml",
        extension: "xml"
    },
    ZIP: {
        type: "application/zip",
        extension: "zip"
    }
};

