//const EDITOR = require('@models/sequence-model/config.json');
const CONCEPT = require('@models/sequence-model/concept.json');
const PROJECTION = require('@models/sequence-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    //config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});