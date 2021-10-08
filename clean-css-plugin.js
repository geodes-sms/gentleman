/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

var fs = require('fs');
var CleanCSS = require('clean-css');
const sources = [];

class CleanCssPlugin {
    constructor(options) {
        this.options = Object.assign({
            filename: 'bundle'
        }, options);
    }

    apply(compiler) {
        compiler.hooks.done.tap('CleanCss Plugin', (compilation) => {
            var bundle = new CleanCSS({
                sourceMap: true,
                rebaseTo: `./dist/${this.options.filename}.min.css`
            }).minify([
                './assets/css/normalize.css',
                './assets/css/base.css',
                './assets/css/layout.css',
                './assets/css/field.css',
                './assets/css/effect.css',
                './assets/css/manager.css',
                './assets/css/loader.css',
                './assets/css/editor.css',
            ]);

            // log bundle result
            outputFeedback(bundle.errors, true);
            outputFeedback(bundle.warnings);
            // write bundle file
            output({ path: `./dist/${this.options.filename}.min.css` }, bundle.styles);
            output({ path: `./dist/${this.options.filename}.min.map` }, bundle.sourceMap);
        });
    }
}

function outputFeedback(messages, isError) {
    var prefix = isError ? '\x1B[31mERROR\x1B[39m:' : 'WARNING:';

    messages.forEach(function (message) {
        console.error('%s %s', prefix, message);
    });
}

function output(options, minified) {
    fs.writeFileSync(options.path, minified, 'utf8');
}

CleanCssPlugin.sources = sources;
CleanCssPlugin.loader = require.resolve('./clean-css-loader');

module.exports = CleanCssPlugin;