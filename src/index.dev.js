/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';

// Import Gentleman Manager
import { Manager } from '@environment/index.js';


const Environment = Manager.init();

// const Editor = Environment.getEditor();
// Editor.init({
//     config: require('@include/concept-model/editor-config.json')
// });

// const MODEL_GENTLEMAN_PROJECTION = require('@include/gentleman_model.json');
// const { concept, projection, editor } = MODEL_GENTLEMAN_PROJECTION;

// const ConceptEditor = Environment.createEditor().init(concept, projection).initProjection().open();

