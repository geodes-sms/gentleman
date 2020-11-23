/* eslint-disable indent */
import { Manager } from '@environment/index.js';
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';

const MODEL_GENTLEMAN_PROJECTION = require('@include/gentleman_model.json');
const { concept, projection, editor } = MODEL_GENTLEMAN_PROJECTION;

const Environment = Manager.init();
Environment.render();

const ConceptEditor = Environment.createEditor().init(concept, projection).open();
if (editor) {
    ConceptEditor.buildTarget = editor.build;
}