import { getElement, createDiv, createHeader, createSpan, appendChildren } from "@zenkai";
import { Gentleman as GE } from './editor/index.js';
import { __ENV } from './global/global.js';
import { METAMODEL_GENTLEMAN } from './samples/create.mm.js';
import { METAMODEL_RELIS } from './samples/relis.mm.js';

// CSS imports
import '@css/normalize.css';
import '@css/base.css';
import '@css/site.css';
import '@css/editor.css';
import '@css/note.css';
import '@css/state.css';

const MODE = 'edit';

const editor = GE.Editor.create();

const container = getElement("[data-gentleman-editor]");
const header = createHeader({ id: 'header', class: 'editor-header' });
var splashscreen = createDiv({ id: 'splashscreen', class: 'splashscreen' });
var headerContent = createDiv({ class: "content-wrapper editor-header-content" });
var language = createSpan({ id: 'language', class: 'model-language' });
headerContent.appendChild(language);
header.appendChild(headerContent);

const menu = GE.Menu.create().init(editor, headerContent);
const note = GE.Note.create().init(editor);

appendChildren(container, [header, splashscreen, note.container]);

editor.init(null, METAMODEL_RELIS);

if (MODE === 'create') {
    editor.init(null, METAMODEL_GENTLEMAN);
}

language.textContent = editor.language;
