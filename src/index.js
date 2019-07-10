import { Gentleman } from './editor/index.js';
import { UTILS, HELPER, TypeWriter, TypeWriterType } from '@utils';
import { UI } from './enums';
// CSS imports
import '@css/normalize.css';
import '@css/base.css';
import '@css/site.css';
import '@css/editor.css';
import '@css/note.css';
import '@css/state.css';

const EL = UI.Element;

(function (GE, $, _) {
    alert("Hello");
    const container = $.getElement("[data-gentleman-editor]");
    var header = $.createHeader({ id: 'header', class: 'editor-header' });
    var splashscreen = $.createDiv({ id: 'splashscreen', class: 'splashscreen' });
    var instruction = $.createP({ class: 'instruction-container font-gentleman' });

    var lblSelector = $.createLabel({ class: [EL.BUTTON, 'btn-loader', UI.HIDDEN], text: "Load a Metamodel" });
    var inputSelector = $.createFileInput({ id: 'fileInput', accept: '.json' });
    inputSelector.addEventListener('change', function (e) {
        var file = this.files[0];
        var reader = new FileReader();
        if (file.name.endsWith('.json')) {
            reader.onload = function (e) {
                $.hide(lblSelector);
                var editor = GE.Editor.create(JSON.parse(reader.result));
                var headerContent = $.createDiv({ class: "content-wrapper editor-header-content" });
                headerContent.appendChild($.createSpan({ id: 'language', class: 'model-language', text: editor.language }));
                header.appendChild(headerContent);
                GE.Menu.create().init(editor, headerContent);
                GE.Note.create().init(editor, container);
                
                TypeWriter(instruction, [
                    {
                        type: TypeWriterType.NORMAL,
                        val: "Good news! Your Metamodel is valid and has been successfully loaded."
                    },
                    {
                        type: TypeWriterType.NORMAL,
                        val: "\nTo continue, open a saved model or create a new one."
                    }
                ], function () { });
            };
            reader.readAsText(file);
        } else {
            alert("File not supported!");
        }
    });

    lblSelector.appendChild(inputSelector);
    $.appendChildren(splashscreen, [instruction, lblSelector]);
    $.appendChildren(container, [header, splashscreen]);

    TypeWriter(instruction, [
        {
            type: TypeWriterType.NORMAL,
            val: "Hello friend, welcome to "
        },
        {
            type: TypeWriterType.BOLD,
            val: "Gentleman"
        },
        {
            type: TypeWriterType.NORMAL,
            val: ".\nTo begin, please load a "
        },
        {
            type: TypeWriterType.ITALIC,
            val: "Metamodel.\n",
            tooltip: "A metamodel is ..."
        }
    ], function () { $.show(lblSelector); });
})(Gentleman, UTILS, HELPER);