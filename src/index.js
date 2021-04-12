/* eslint-disable indent */
import { Manager } from './manager.js';

const Models = new Map();

Manager.init();

export { Manager as Task, Models };