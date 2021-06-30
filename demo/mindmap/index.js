const EDITOR = require('@models/mindmap-model/config.json');
const CONCEPT = require('@models/mindmap-model/concept.json');
const PROJECTION = require('@models/mindmap-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});