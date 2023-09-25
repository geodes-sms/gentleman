import {
    createDocFragment, createDiv, createSection, createButton, createUnorderedList, createListItem,
    removeChildren, isHTMLElement, isNullOrUndefined, createH2, createImage,
} from 'zenkai';
import { select, unselect } from '@utils/index.js';
import { FileConfig } from './editor-config.js';
import { FileIO } from './editor-file.js';
import { SettingsData } from './editor-data.js';
import { SettingsBuild } from './editor.build.js';


export const EditorHome = {
    /** @type {Menu} */
    menu: null,
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLButtonElement} */
    btnStart: null,
    /** @type {Settings} */
    settings: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

    clear() {
        removeChildren(this.container);

        return this;
    },
    update() {

    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-home"]
            });

            let logo = createImage({
                class: ["editor-logo"],
                src: "https://gentlemancp.org/assets/images/logo_gentleman_200.png"
            });

            let title = createH2({
                class: ["editor-title"]
            }, "Settings");

            let container = createDiv({
                class: ["editor-home-header"]
            }, [logo, title]);

            this.container.append(container);
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = Object.create(Menu, {
                editor: { value: this.editor },
            }).init();

            fragment.append(this.menu.render());
        }

        if (!isHTMLElement(this.btnStart)) {
            this.btnStart = createButton({
                class: ["btn", "editor-home-section--model__button", "editor-home-section__button--start"],
                dataset: {
                    action: "close",
                    context: "home"
                }
            }, "Done!");

            fragment.append(this.btnStart);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        const { hasConceptModel, hasProjectionModel } = this.editor;

        this.btnStart.disabled = !(hasConceptModel && hasProjectionModel);

        return this;
    },


    /**
     * 
     * @param {string} name 
     * @param {HTMLElement} element 
     */
    actionHandler(name, element) {
        const { concept } = element.dataset;

        if (name === "open-concept") {
            this.menu.config.selectItem(concept);
            this.menu.config.showInfo(concept);
        }
    },

    bindEvents() {
        this.editor.registerHandler("concept-model.updated", () => {
            this.menu.config.clear();

            if (!this.editor.hasConceptModel) {
                return;
            }

            this.editor.conceptModel.schema
                .filter(c => c.root)
                .forEach(c => {
                    this.menu.config.addItem(c);
                });
        });
    }
};

const Menu = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    tabsElement: null,
    /** @type {Map} */
    tabs: null,
    /** @type {string} */
    currentTab: null,
    /** @type {HTMLElement} */
    activeTab: null,
    /** @type {FileIO} */
    fileIO: null,
    /** @type {FileConfig} */
    config: null,
    /** @type {SettingsData} */
    dataSettings: null,
    /** @type {SettingsBuild} */
    buildSettings: null,

    init() {
        this.tabs = new Map();
        this.tabs.set("file", "File");
        this.tabs.set("config", "Config");
        // this.tabs.set("data", "Data");
        // this.tabs.set("build", "Build");
        this.currentTab = "file";

        return this;
    },
    refresh() {

    },

    /**
     * Creates the model menu section
     * @returns {HTMLElement}
     */
    render() {
        this.container = createSection({
            class: ["editor-home-menu"],
        });

        this.tabsElement = createUnorderedList({
            class: ["bare-list", "editor-home-menu-tabs"],
        });

        this.tabs.forEach((val, key) => {
            let tab = createListItem({
                class: ["editor-home-menu-tab"],
                dataset: {
                    name: key
                }
            }, val);
            this.tabs.set(key, tab);
            this.tabsElement.append(tab);
        });

        this.window = createDiv({
            class: ["editor-home-menu-section"],
        });

        this.fileIO = createFileIO.call(this);
        this.config = createFileConfig.call(this);
        this.dataSettings = createDataSettings.call(this);
        // this.buildSettings = createBuildSettings.call(this);

        this.window.append(this.fileIO.render());
        this.window.append(this.config.render());
        this.window.append(this.dataSettings.render());
        // this.window.append(this.buildSettings.render());

        this.selectTab(this.currentTab);

        this.container.append(this.tabsElement, this.window);

        this.bindEvents();

        return this.container;
    },
    selectTab(name) {
        if (isNullOrUndefined(name)) {
            return;
        }

        if (this.activeTab && this.currentTab === name) {
            return;
        }

        if (name === "file") {
            this.fileIO.show();
            this.config.hide();
            this.dataSettings.hide();
            // this.buildSettings.hide();
        } else if (name === "config") {
            this.config.show();
            this.fileIO.hide();
            this.dataSettings.hide();
            // this.buildSettings.hide();
        }

        if (this.activeTab) {
            unselect(this.activeTab);
        }

        this.currentTab = name;
        this.activeTab = this.tabs.get(this.currentTab);
        select(this.activeTab);
    },

    bindEvents() {
        this.tabsElement.addEventListener('click', (event) => {
            const { target } = event;
            const { name } = target.dataset;

            this.selectTab(name);
        });
    }
};

/**
 * Creates a drop area
 * @param {string} type 
 * @param {string} [_title] 
 * @returns {FileIO}
 * @this {EditorHome}
 */
function createFileIO(types) {
    const fileIO = Object.create(FileIO, {
        editor: { value: this.editor }
    });
    fileIO.init();

    return fileIO;
}

/**
 * Creates a drop area
 * @returns {FileConfig}
 * @this {EditorHome}
 */
function createFileConfig() {
    const fileConfig = Object.create(FileConfig, {
        editor: { value: this.editor }
    });
    fileConfig.init();

    return fileConfig;
}

/**
 * Creates a drop area
 * @returns {FileConfig}
 * @this {EditorHome}
 */
function createDataSettings() {
    const settings = Object.create(SettingsData, {
        editor: { value: this.editor }
    });
    settings.init();

    return settings;
}

/**
 * Creates a drop area
 * @returns {FileConfig}
 * @this {EditorHome}
 */
function createBuildSettings() {
    const settings = Object.create(SettingsBuild, {
        editor: { value: this.editor }
    });
    settings.init();

    return settings;
}
