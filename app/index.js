// import '@css/normalize.css';
// import '@css/base.css';
// import '@css/effect.css';
// import '@css/app/layout.css';
// import '@css/app/field.css';
// import '@css/app/editor.css';
// import '@css/app/editor-home.css';
// import '@css/app/editor-header.css';
// import '@css/samples/gentleman.css';
// import '@css/samples/projection.css';
// import '@css/samples/style.css';
// import './style.css';

const { App } = require("./src/app-editor.js");
const { Preview } = require("./src/app-preview.js");

const eId = localStorage.getItem("gentleman.preview");

if (eId) {
    Preview.init(eId);
    localStorage.removeItem("gentleman.preview");
} else {
    App.init();
}
