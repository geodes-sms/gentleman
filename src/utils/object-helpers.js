export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export const isPrototypeOf = (child, parent) => Object.prototype.isPrototypeOf.call(parent, child);