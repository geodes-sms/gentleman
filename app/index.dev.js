import './stylesheets.js';

const { App } = require("./src/app-editor.js");
const { Preview } = require("./src/app-preview.js");

const eId = localStorage.getItem("gentleman.preview");

if (eId) {
    Preview.init(eId);
    localStorage.removeItem("gentleman.preview");
} else {
    App.init();
}
