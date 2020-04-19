import { Environment } from './enums.js';

export const __ENV = Environment.TEST;
export const __VERSION = '0.3.0';
export var DOC = typeof module !== 'undefined' && module.exports ? null : document;

export function setDocument(d) { DOC = d; }