const EDITOR = require('@models/statechart-model/config.json');
const CONCEPT = require('@models/statechart-model/concept.json');
const PROJECTION = require('@models/statechart-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});