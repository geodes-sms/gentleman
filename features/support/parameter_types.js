const { defineParameterType } = require('cucumber');
const { HELPER: _ } = require('../../src/helpers');

defineParameterType({
    name: "boolean",
    regexp: /true|false/,
    transformer(val) { return _.toBoolean(val.toString()); }
});

defineParameterType({
    name: "undefined",
    regexp: /undefined/,
    transformer(val) { return val === 'undefined' ? undefined : val; }
});