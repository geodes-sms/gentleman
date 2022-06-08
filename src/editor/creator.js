import { hide, show, toggle } from '@utils/index.js';
import { EditorHome } from './home/editor-home.js';
import { EditorBreadcrumb } from './status/editor-breadcrumb.js';
import { EditorStyle } from './editor-style.js';
import { EditorLog } from './status/editor-log.js';
import { EditorSection } from './editor-section.js';
import { EditorStatus } from './status/editor-status.js';
import { EditorExport } from './editor-export.js';

const BaseWindow = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,

    show() {
        show(this.container);
        this.visible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.visible = false;

        return this;
    },
    toggle() {
        toggle(this.container);
        this.visible = !this.visible;

        return this;
    },
    open() {
        this.container.classList.add("open");
        this.show();
        this.isOpen = true;

        this.editor.refresh();

        return this;
    },
    close() {
        this.container.classList.remove("open");
        this.hide();
        this.isOpen = false;

        this.editor.refresh();

        return this;
    },
};

/**
 * Creates an editor's header
 * @returns {EditorSection}
 */
export function createEditorHeader() {
    return Object.create(EditorSection, {
        object: { value: "environment" },
        name: { value: "editor-header" },
        editor: { value: this }
    });
}

/**
 * Creates an editor breadcrumb
 * @returns {EditorBreadcrumb}
 */
export function createEditorBreadcrumb() {
    return Object.create(EditorBreadcrumb, {
        object: { value: "environment" },
        name: { value: "editor-breadcrumb" },
        type: { value: "breadcrumb" },
        editor: { value: this }
    });
}

/**
 * Creates an editor home
 * @returns {EditorHome}
 */
export function createEditorHome() {
    return Object.assign(Object.create(BaseWindow, {
        object: { value: "environment" },
        name: { value: "editor-home" },
        type: { value: "home" },
        editor: { value: this }
    }), EditorHome);
}

/**
 * Creates an editor style
 * @returns {EditorStyle}
 */
export function createEditorStyle() {
    return Object.assign(Object.create(BaseWindow, {
        object: { value: "environment" },
        name: { value: "editor-style" },
        type: { value: "style" },
        editor: { value: this }
    }), EditorStyle);
}

/**
 * Creates an editor status manager
 * @returns {EditorStatus}
 */
export function createEditorStatus() {
    return Object.create(EditorStatus, {
        object: { value: "environment" },
        name: { value: "editor-status" },
        type: { value: "status" },
        editor: { value: this }
    });
}

/**
 * Creates an editor log manager
 * @returns {EditorLog}
 */
export function createEditorLog() {
    return Object.assign(Object.create(BaseWindow, {
        object: { value: "environment" },
        name: { value: "editor-log" },
        type: { value: "log" },
        editor: { value: this }
    }), EditorLog);
}

/**
 * Creates an editor log manager
 * @returns {EditorExport}
 */
export function createEditorExport() {
    return Object.assign(Object.create(BaseWindow, {
        object: { value: "environment" },
        name: { value: "editor-exporter" },
        type: { value: "exporter" },
        editor: { value: this }
    }), EditorExport);
}