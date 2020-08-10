/* eslint-disable indent */
import { Manager } from '@environment/index.js';
import { Loader } from '@environment/loader.js';
import './stylesheets.js';
import '@css/model/gentleman.css';
// import '@css/model/projection.css';

const METAMODEL_GENTLEMAN = require('@samples/gentleman_model.json');
// const METAMODEL_GENTLEMAN = require('@samples/gentleman_projection.json');
// const METAMODEL_MINDMAP = require('@samples/mindmap.json');
// const METAMODEL_RELIS = require('@samples/relis.json');

const Environment = Manager.init();
Environment.render();

// const metamodel = Loader.loadMetaModel(METAMODEL_GENTLEMAN);
// const model = metamodel.createModel().init();

const Editor = Environment.createEditor()      
                          .init(METAMODEL_GENTLEMAN)
                          .open();         

// const Builder = Environment.createBuilder()      
//                           .init(metamodel)
//                           .open();         