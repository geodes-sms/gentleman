/* eslint-disable indent */
import { Manager } from '@environment/index.js';
import { Loader } from '@environment/loader.js';
import './stylesheets.js';

const METAMODEL_GENTLEMAN = require('@samples/gentleman.json');
const METAMODEL_MINDMAP = require('@samples/mindmap.json');
const MODEL_GENTLEMAN = require('@bin/gentleman.json');


const Environment = Manager.init();

const metamodel = Loader.loadMetaModel(METAMODEL_MINDMAP);
const model = metamodel.createModel().init();

const Editor = Environment.getEditor()      
                          .init(metamodel, model)
                          .open();                  

// const Explorer = Environment.getExplorer()
//                             .init(metamodel, model)
//                             .open();