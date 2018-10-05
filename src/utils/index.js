import { UTIL } from './utils.js';
import { Effect } from './effects.js';
import { Interactive } from './interactive.js';
import { TypeWriter } from './typewriter.js';

export const UTILS = Object.assign({}, UTIL, Effect, Interactive, { TypeWriter: TypeWriter });