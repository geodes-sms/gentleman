const NativeModule = require('module');
const getOptions = require("loader-utils/lib/getOptions");
const sources = require('./clean-css-plugin').sources;

module.exports = function cleanCssLoader(css, map) {
    const options = this.options ? this.options.module : false;
    const query = getOptions(this);

    const callback = this.async();

    const mod = new NativeModule('filename', this);
    mod.paths = NativeModule._nodeModulePaths(this.context); // eslint-disable-line no-underscore-dangle
    sources.push(mod.parent.resourcePath);

    return callback(null, css, map);
};