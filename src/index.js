/* eslint-disable indent */
import { Manager } from '@environment/index.js';
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';


const Environment = Manager.init();
Environment.render();

const ConceptEditor = Environment.createEditor().init().open();