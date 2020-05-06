import { Editor } from './editor/index.js';
const METAMODEL_MINDMAP = require('@samples/mindmap.json');
const METAMODEL_RELIS = require('@samples/relis.json');

// CSS imports
import '@css/normalize.css';
import '@css/base.css';
import '@css/field.css';
import '@css/editor.css';
import '@css/explorer.css';

const Workflow = {
    MODEL: 'model',
    DESIGN: 'design'
};

const WorkflowMetaModel = {
    // [Workflow.MODEL]: METAMODEL_MINDMAP,
    [Workflow.MODEL]: METAMODEL_RELIS,
    [Workflow.DESIGN]: "METAMODEL_PROTO"
};

const editor = Editor.create();
editor.workflow = Workflow.MODEL;
editor.init(WorkflowMetaModel[editor.workflow]);