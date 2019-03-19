import { EnumProjection } from './enum.js';
import { AbstractProjection } from './abstract.js';
import { PointerProjection } from './pointer.js';
import { RawProjection } from './raw.js';

/**
 * Returns a value indicating whether the projection is an Enum
 * @param {Object} projection 
 */
export function isEnum(projection) { return EnumProjection.isPrototypeOf(projection); }

/**
 * Returns a value indicating whether the projection is an Extension
 * @param {Object} projection 
 */
export function isExtension(projection) { return AbstractProjection.isPrototypeOf(projection); }

/**
 * Returns a value indicating whether the projection is a Pointer
 * @param {Object} projection 
 */
export function isPointer(projection) { return PointerProjection.isPrototypeOf(projection); }

/**
 * Returns a value indicating whether the projection is a Raw
 * @param {Object} projection 
 */
export function isRaw(projection) { return RawProjection.isPrototypeOf(projection); }