
const { App } = require("./app-editor.js");
const { Preview } = require("./app-preview.js");

const eId = localStorage.getItem("gentleman.preview");

if (eId) {
    Preview.init(eId);
    localStorage.removeItem("gentleman.preview");
} else {
    App.init();
}
