
import { getElement, createDiv, createHeader, createParagraph, createSpan, appendChildren, createInput, createLabel } from "zenkai";
import { Gentleman as GE } from './editor/index.js';
import { __ENV, hide, show, UI } from '@utils/index.js';
// CSS imports
import '@css/normalize.css';
import '@css/base.css';
import '@css/site.css';
import '@css/editor.css';
import '@css/note.css';
import '@css/state.css';

const EL = UI.Element;

const container = getElement("[data-gentleman-editor]");
var header = createHeader({ id: 'header', class: 'editor-header' });
var splashscreen = createDiv({ id: 'splashscreen', class: 'splashscreen' });
var instruction = createParagraph({ class: 'instruction-container font-gentleman' });

var lblSelector = createLabel({ class: [EL.BUTTON, 'btn-loader', UI.HIDDEN], text: "Load a Metamodel" });
var inputSelector = createInput.file({ id: 'fileInput', accept: '.json' });
inputSelector.addEventListener('change', function (e) {
    var file = this.files[0];
    var reader = new FileReader();
    if (file.name.endsWith('.json')) {
        reader.onload = function (e) {
            hide(lblSelector);
            var editor = GE.Editor.create(JSON.parse(reader.result));
            var headerContent = createDiv({ class: "content-wrapper editor-header-content" });
            headerContent.appendChild(createSpan({ id: 'language', class: 'model-language', text: editor.language }));
            header.appendChild(headerContent);
            GE.Menu.create().init(editor, headerContent);
            GE.Note.create().init(editor, container);

            instruction.innerHTML = "Good news! Your Metamodel is valid and has been successfully loaded.\nTo continue, open a saved model or create a new one.";
        };
        reader.readAsText(file);
    } else {
        alert("Please use a .gen file");
    }
});

lblSelector.appendChild(inputSelector);
appendChildren(splashscreen, [instruction, lblSelector]);
appendChildren(container, [header, splashscreen]);

instruction.innerHTML = "Greetings and welcome to <strong>Gentleman</strong>.\n To begin, please load a model.";
