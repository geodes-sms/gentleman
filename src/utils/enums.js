export const Environment = {
    PROD: 'production',
    DEV: 'development',
    TEST: 'test'
};

export const Primitive = {
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    REFERENCE: "reference",
    SET: "set",
    list() { return [this.STRING, this.NUMBER, this.BOOLEAN, this.REFERENCE, this.SET]; }
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
    shift: "Shift",
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
    JSONCP: {
        type: "application/json",
        extension: "jsoncp"
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

export const DocTypeMap = {
    "audio/aac": "aac",
    "application/octet-stream": "bin",
    "image/jpeg": "jpeg",
    "application/json": "json",
    "audio/mpeg": "mp3",
    "application/pdf": "pdf",
    "image/svg+xml": "svg",
    "text/plain": "txt",
    "text/xml": "xml",
    "application/zip": "zip"
};
