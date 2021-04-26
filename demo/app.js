const EDITOR_HANDLER = {
    "preview-projection": function (target) {
        const RESOURCE_NAME = "metamodel";

        if (!this.hasResource(RESOURCE_NAME)) {
            this.notify("<strong>Metamodel not found</strong>: The <em>metamodel</em> might have not been loaded yet.<br> Add it in the resource tab and try again.", "error", 4000);

            return false;
        }
        
        this.triggerEvent({ "name": "build-projection", options: { download: false, notify: "error" } }, (pmodel) => {
            if (!pmodel) {
                return;
            }

            let model = this.getModel(RESOURCE_NAME);

            const editor = getPreviewEditor.call(this);

            let values = [];
            if (editor.conceptModel) {
                values = editor.conceptModel.export();
            }

            editor.unload()
                .loadConceptModel(model.concept || model, values)
                .loadProjectionModel(pmodel)
                .open();
        });
    },
};

function initApp(container) {
    let menu = document.querySelector(".app-menu", container);
    let editor = Gentleman.Task.getEditor(".app-editor", container);
    editor.init({
        handlers: EDITOR_HANDLER
    });

    menu.addEventListener("click", (event) => {
        const { target } = event;

        const { action, name } = target.dataset;

        if (action === "load-model") {
            const { concept, projection, editor: config } = Gentleman.Models.get(name);

            editor.unload()
                .freeze()
                .setConfig(config)
                .loadConceptModel(concept)
                .loadProjectionModel(projection)
                .unfreeze()
                .open();
        }
    });
}

let previewEditor = null;
function getPreviewEditor() {
    if (!previewEditor) {
        let modelHanlder = {
            update: (message) => {
                if (message === "value.changed") {
                    this.triggerEvent({ name: "preview-projection" });
                }
            }
        };
        this.conceptModel.register(modelHanlder);

        previewEditor = Gentleman.Task.createEditor().init({
            handlers: {
                "editor.close@post": () => {
                    this.conceptModel.unregister(modelHanlder);
                    previewEditor.destroy();
                    previewEditor = null;
                }
            }
        });

        let app = document.querySelector(".app-body");
        app.append(previewEditor.container);
    }
    return previewEditor;
}

(function init() {
    const applications = document.querySelectorAll(".app");

    for (let i = 0; i < applications.length; i++) {
        const appContainer = applications[i];
        initApp(appContainer);
    }
})();