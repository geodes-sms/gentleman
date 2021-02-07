/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';

// Import Gentleman Manager
import { Manager } from '@environment/index.js';

const MODEL_GENTLEMAN_PROJECTION = require('@include/gentleman_model.json');
const { concept, projection, editor } = MODEL_GENTLEMAN_PROJECTION;

const Environment = Manager.init();
const ConceptEditor = Environment.createEditor().init(concept, projection).open();
Environment.render();

if (editor) {
    ConceptEditor.buildTarget = editor.build;
}