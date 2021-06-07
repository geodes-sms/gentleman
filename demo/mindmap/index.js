const EDITOR = require('@models/mindmap-model/mindmap_config.json');
const CONCEPT = require('@models/mindmap-model/mindmap_metamodel.json');
const PROJECTION = require('@models/mindmap-model/mindmap_projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});