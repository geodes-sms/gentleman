/* eslint-disable indent */
import { Manager } from '@environment/index.js';
import { Loader } from '@environment/loader.js';
import './stylesheets.js';
import '@css/model/gentleman.css';

const METAMODEL_GENTLEMAN = require('@samples/gentleman_model.json');
// const METAMODEL_MINDMAP = require('@samples/mindmap.json');
// const METAMODEL_RELIS = require('@samples/relis.json');

const Environment = Manager.init();
Environment.render();

const metamodel = Loader.loadMetaModel(METAMODEL_GENTLEMAN);
const model = metamodel.createModel().init();

const Editor = Environment.createEditor()      
                          .init(metamodel)
                          .open();         