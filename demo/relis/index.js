const EDITOR = require('@models/relis-model/config.json');
const CONCEPT = require('@models/relis-model/concept.json');
const PROJECTION = require('@models/relis-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});