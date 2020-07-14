import { isNullOrUndefined } from "zenkai";

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];

export const isPrototypeOf = (child, parent) => Object.prototype.isPrototypeOf.call(parent, child);