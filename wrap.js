/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

var fs = require('fs');
var path = require('path');
var CleanCSS = require('clean-css');

var bundle = new CleanCSS({
    sourceMap: true,
    rebaseTo: './demo/demo-style.min.css'
}).minify([
    './assets/css/normalize.css',
    './assets/css/base.css',
    './assets/css/site.css',
    './assets/css/editor.css',
    './assets/css/note.css',
    './assets/css/state.css',
]);

// log bundle result
outputFeedback(bundle.errors, true);
outputFeedback(bundle.warnings);
// write bundle file
output({ path: './demo/demo-style.min.css' }, bundle.styles);
output({ path: './demo/demo-style.min.map' }, bundle.sourceMap);

function outputFeedback(messages, isError) {
    var prefix = isError ? '\x1B[31mERROR\x1B[39m:' : 'WARNING:';

    messages.forEach(function (message) {
        console.error('%s %s', prefix, message);
    });
}

function output(options, minified) {
    fs.writeFileSync(options.path, minified, 'utf8');
}