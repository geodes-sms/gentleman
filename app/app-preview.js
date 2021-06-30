import { getElement } from "zenkai";
import { hide } from "@utils/index.js";


export const Preview = {
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    editorSection: null,
    /** @type {Editor} */
    editor: null,
    /** @type {BroadcastChannel} */
    channel: null,

    /**
    * Initiliazes the App
    * @returns {App}
    */
    init(channelId) {
        this.channel = new BroadcastChannel(channelId);
        this.editor = Gentleman.createEditor().init({
            config: {
                "settings": false
            }
        });

        this.bindDOM();
        this.render();
        this.bindEvents();

        return this;
    },
    refresh() {
        if (!this.editor.isReady) {
            this.editor.close();
        } else {
            this.editor.open();
        }

        return this;
    },
    render() {
        this.editorSection.append(this.editor.container);

        this.refresh();
    },
    /**
     * Gets an `Editor`
     * @returns {Editor}
     */
    getEditor() {
        return this.editor;
    },
    bindDOM() {
        this.menu = getElement(`[data-component="menu"]`);
        this.editorSection = getElement(`[data-component="editor"]`);
        hide(this.menu);
    },
    bindEvents() {
        this.channel.addEventListener('message', (event) => {
            const { concept: cModel, projection: pModel } = event.data;

            let values = [];

            if (this.editor.conceptModel) {
                values = this.editor.conceptModel.export();
            }

            this.editor.unload()
                .freeze()
                .loadConceptModel(cModel, values)
                .loadProjectionModel(pModel)
                .unfreeze()
                .open();
        });
    }
};