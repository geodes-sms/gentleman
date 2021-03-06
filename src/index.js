/* eslint-disable indent */
import { Manager } from '@environment/index.js';

if (window.GENTLEMAN_CONFIG) {
    Manager.init(window.GENTLEMAN_CONFIG);
} else {
    Manager.init();
}


export * from '@environment/index.js';