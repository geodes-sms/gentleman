import { isNullOrUndefined } from "zenkai";

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const tryResolve = (obj, prop, fallback) => isNullOrUndefined(obj) ? fallback : obj[prop];