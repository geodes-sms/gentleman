const EDITOR = require('@models/todo-model/config.json');
const CONCEPT = require('@models/todo-model/concept.json');
const PROJECTION = require('@models/todo-model/projection.json');
const HANDLER = {
    "open-option": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "option");

        let window = this.findWindow("side-instance");
        if (!window) {
            window = this.createWindow("side-instance");
            window.container.classList.add("td-option-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
};

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION,
    handlers: HANDLER
});