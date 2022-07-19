const EDITOR = require('@models/music-model/config.json');
const CONCEPT = require('@models/music-model/concept.json');
const PROJECTION = require('@models/music-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});