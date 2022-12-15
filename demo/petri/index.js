const EDITOR = require('@models/petri-model/config.json');
const CONCEPT = require('@models/petri-model/concept.json');
const PROJECTION = require('@models/petri-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});