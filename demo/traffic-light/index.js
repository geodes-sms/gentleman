const EDITOR = require('@models/trafficlight-model/config.json');
const CONCEPT = require('@models/trafficlight-model/concept.json');
const PROJECTION = require('@models/trafficlight-model/projection.json');

let editor = Gentleman.activateEditor(".app-editor")[0];
editor.init({
    config: EDITOR,
    conceptModel: CONCEPT,
    projectionModel: PROJECTION
});