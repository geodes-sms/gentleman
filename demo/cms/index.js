// import '@src/stylesheets.js';
// import './assets/style.css';

import { findAncestor, getElement, getElements, hasOwn, isHTMLElement, isNullOrUndefined } from 'zenkai';
import { activateEditor } from '@src';
import { 
    PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT, TOOL_CONCEPT, 
    ORGANIZATION_PROJECTION, ORGANIZATION_PROJECTION2, PEOPLE_PROJECTION, PROJECT_PROJECTION, TOOL_PROJECTION, FIELD_PROJECTION 
} from './models.js';
import { API } from './api';


let editors = activateEditor(".app-editor");
let editor = editors[0];
editor.init({
    config: {
        header: false,
    },
    conceptModel: [PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT, TOOL_CONCEPT],
    projectionModel: [ORGANIZATION_PROJECTION, PEOPLE_PROJECTION, PROJECT_PROJECTION, TOOL_PROJECTION, FIELD_PROJECTION]
});
editor.home.close();
editor.exporter.close(); console.log(editors.length);

for (let i = 1; i < editors.length; i++) {
    let editor = editors[i];
    editor.init({
        config: {
            header: false,
        },
        conceptModel: [PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT, TOOL_CONCEPT],
        projectionModel: [ORGANIZATION_PROJECTION, PEOPLE_PROJECTION, PROJECT_PROJECTION, TOOL_PROJECTION, FIELD_PROJECTION]
    });
    editor.home.close();
    editor.exporter.close();
}


const Tags = {
    "general": "general",
    "people": "people",
    "projects": "project",
    "tools": "tool"
};

const Titles = {
    "general": "General information",
    "people": "Members",
    "projects": "Funded projects",
    "tools": "Tools"
};

const App = {
    /** @type {HTMLElement} */
    editorInstance: null,
    /** @type {HTMLElement} */
    organization: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {Map<string, HTMLElement>} */
    items: null,
    /** @type {Map<string, View>} */
    views: null,
    /** @type {HTMLElement} */
    selectedItem: null,

    init(container, editor) {
        this.container = container;
        this.items = new Map();
        this.views = new Map();
        this.editor = editor;

        this.bindDOM();
        this.bindEvents();
        this.render();

        return this;
    },
    get hasSelectedItem() { return isHTMLElement(this.selectedItem); },
    getItemName(item) {
        if (!isHTMLElement(item)) {
            return null;
        }

        return item.dataset.cmsName;
    },

    refresh() {
        this.container.dataset.item = this.hasSelectedItem ? this.getItemName(this.selectedItem) : "";
    },
    render() {
        if (this.instance) {
            return this;
        }

        this.organization = this.editor.createConcept("research-organization");
        this.editorInstance = this.editor.createInstance(this.organization);
        this.editorInstance.changeSize("fullscreen");

        this.selectItem("general");

        this.refresh();

        return this;
    },
    selectItem(name) {
        if (isNullOrUndefined(name)) {
            return false;
        }

        if (!this.items.has(name)) {
            return false;
        }

        let item = this.items.get(name);

        if (item === this.selectedItem) {
            return this;
        }

        if (this.selectedItem) {
            this.selectedItem.classList.remove("selected");
        }

        this.selectedItem = item;
        this.selectedItem.classList.add("selected");

        this.updateView();

        return this;
    },
    updateView() {
        let name = this.getItemName(this.selectedItem);

        if (isNullOrUndefined(name) || !hasOwn(Tags, name)) {
            return;
        }

        switch (name) {
            case "general":
                API.fetchOrganization(this.editor, this.organization);        
                break;
            case "people":
                API.fetchPeople(this.editor, this.organization);        
                break;
            case "tools":
                API.fetchTools(this.editor, this.organization);        
                break;
            case "projects":
                API.fetchProjects(this.editor, this.organization);        
                break;
        
            default:
                break;
        }
        

        let tag = Tags[name];

        let projection = this.editorInstance.projection;

        let index = projection.findView(tag);
        if (index === -1) {
            return false;
        }

        projection.changeView(index);

        this.editorInstance.setTitle(`GEODES – ${Titles[name]}`);

        this.refresh();

        return;
    },
    bindDOM() {
        this.menu = getElement(`[data-cms="menu"]`);

        getElements(`[data-cms="menu-item"]`, this.menu).forEach(item => {
            const { cmsName } = item.dataset;
            this.items.set(cmsName, item);
        });
    },
    bindEvents() {
        const isMenuItem = (element) => isHTMLElement(element) && element.dataset.cms === "menu-item";

        const getMenuItem = (element) => isMenuItem(element) ? element : findAncestor(element, isMenuItem, 3);

        this.menu.addEventListener("click", (event) => {
            let item = getMenuItem(event.target);

            if (!isHTMLElement(item)) {
                return;
            }

            this.selectItem(this.getItemName(item));
        });
    }
};


App.init(getElement(".page-body"), editor);