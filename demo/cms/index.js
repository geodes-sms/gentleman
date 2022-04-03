// import '@src/stylesheets.js';
// import './assets/style.css';

import { findAncestor, getElement, getElements, hasOwn, isHTMLElement, isNullOrUndefined } from 'zenkai';
import { activateEditor } from '@src';
import { PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT, ORGANIZATION_PROJECTION, PEOPLE_PROJECTION, PROJECT_PROJECTION, FIELD_PROJECTION } from './models.js';
import { PEOPLE_DATA, PROJECTS_DATA, ORGANIZATION_DATA } from './data.js';


let editor = activateEditor(".app-editor")[0];
editor.init({
    config: {
        header: false,
    },
    conceptModel: [PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT],
    projectionModel: [ORGANIZATION_PROJECTION, PEOPLE_PROJECTION, PROJECT_PROJECTION, FIELD_PROJECTION]
});


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
    fetchData() {
        let people = this.organization.getAttribute("members").getTarget();
        let projects = this.organization.getAttribute("projects").getTarget();

        this.organization.getAttribute("name").setValue(ORGANIZATION_DATA.name);
        this.organization.getAttribute("description").setValue(ORGANIZATION_DATA.description);
        this.organization.getAttribute("phone").setValue(ORGANIZATION_DATA.phone);
        this.organization.getAttribute("website").setValue(ORGANIZATION_DATA.website);
        this.organization.getAttribute("email").setValue(ORGANIZATION_DATA.email);

        
        let socials = this.organization.getAttribute("socials").getTarget();

        for (const key in ORGANIZATION_DATA.socials) {
            const handle = ORGANIZATION_DATA.socials[key];

            let social = editor.createConcept("social");

            social.getAttribute("name").setValue(key);
            social.getAttribute("handle").setValue(handle);

            socials.addElement(social);
        }

        PEOPLE_DATA.forEach(item => {
            let person = editor.createConcept("person");

            const [lastName, firstName] = item.name.split(",");

            person.getAttribute("first-name").setValue(firstName);
            person.getAttribute("last-name").setValue(lastName);
            person.getAttribute("occupation").setValue(item.position);
            person.getAttribute("website").setValue(item.website);
            person.getAttribute("email").setValue(item.email);
            person.getAttribute("phone").setValue(item.phone);
            person.getAttribute("photo").setValue(item.photo);

            people.addElement(person);
        });

        PROJECTS_DATA.forEach(item => {
            let project = editor.createConcept("project");

            const { name, description, startYear, endYear, funding, logo } = item;

            project.getAttribute("name").setValue(name);
            project.getAttribute("description").setValue(description);
            project.getAttribute("start-date").setValue(startYear);
            project.getAttribute("end-date").setValue(endYear);
            project.getAttribute("funding").setValue(funding);
            project.getAttribute("logo").setValue(logo);

            let partners = project.getAttribute("partners").getTarget();

            item.partners.forEach(p => {
                let partner = editor.createConcept("partner");

                partner.getAttribute("name").setValue(p);

                partners.addElement(partner);
            });

            projects.addElement(project);
        });
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
App.fetchData();
