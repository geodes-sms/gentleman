import '@src/stylesheets.js';
import './assets/style.css';

import {
    findAncestor, getElement, getElements, isHTMLElement, isNullOrUndefined
} from 'zenkai';

const PEOPLE_CONCEPT = require('@models/cms-model/person-concept.json');
const PEOPLE_PROJECTION = require('@models/cms-model/person-projection.json');
const ORGANIZATION_CONCEPT = require('@models/cms-model/organization-concept.json');
const ORGANIZATION_PROJECTION = require('@models/cms-model/organization-projection.json');
const PROJECT_CONCEPT = require('@models/cms-model/project-concept.json');
const PROJECT_PROJECTION = require('@models/cms-model/project-projection.json');

const PEOPLE_DATA = require('./assets/data/people.json');
const PROJECTS_DATA = require('./assets/data/projects.json');
const TOOLS_DATA = require('./assets/data/tools.json');
const { activateEditor } = require('@src');


let editor = activateEditor(".app-editor")[0];
editor.init({
    config: {
        header: false,
    },
    conceptModel: [PEOPLE_CONCEPT, ORGANIZATION_CONCEPT, PROJECT_CONCEPT],
    projectionModel: [ORGANIZATION_PROJECTION, PEOPLE_PROJECTION, PROJECT_PROJECTION]
});

let organization = editor.createConcept("research-organization");
organization.getAttribute("name").setValue("GEODES");
organization.getAttribute("description").setValue("GEODES was founded as part of DIRO in 1992. It was then called GÉLO and changed to GEODES in 2005. Since then, more than 30 students have obtained a PhD degree from the group, and more then a 100 students have graduated with a Master's degree. Many of these students are professors in Quebec, Canada, and around the world (ÉTS, Laval, Polytechnique, UQAM, Ottawa, DePaul, Houston, Indiana, Michigan, United Arab Emirates, etc.), and others hold key positions at large tech companies. GEODES is very scientifically very active group with over 20 publications per year in journals, conference proceedings and book chapters.");
let instance = editor.createInstance(organization);
instance.changeSize("fullscreen");

const App = {
    /** @type {HTMLElement} */
    editorInstance: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {Map<string, HTMLElement>} */
    items: null,
    /** @type {Map<string, View>} */
    views: null,
    /** @type {HTMLElement} */
    selectedName: null,
    /** @type {HTMLElement} */
    selectedItem: null,

    init(container, instance) {
        this.container = container;
        this.items = new Map();
        this.views = new Map();
        this.editorInstance = instance;

        this.bindDOM();
        this.bindEvents();

        return this;
    },
    refresh() {

    },
    fetchData() {
        let people = organization.getAttribute("members").getTarget();
        let projects = organization.getAttribute("projects").getTarget();

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

        if (item === this.selectItem) {
            return this;
        }

        if (this.selectedItem) {
            this.selectedItem.classList.remove("selected");
        }

        this.selectedItem = item;
        this.selectedName = name;
        this.selectedItem.classList.add("selected");

        this.updateView(name);

        this.refresh();

        return this;
    },
    updateView(name) {
        let projection = this.editorInstance.projection;

        if (name === "general") {
            let index = projection.findView("general");
            if (index === -1) {
                return false;
            }

            projection.changeView(index);
        } else if (name === "people") {
            let index = projection.findView("people");
            if (index === -1) {
                return false;
            }

            projection.changeView(index);
        } else if (name === "projects") {
            let index = projection.findView("project");
            if (index === -1) {
                return false;
            }

            projection.changeView(index);
        }

        return;
    },
    bindDOM() {
        this.menu = getElement(`[data-cms="menu"]`);
        getElements(`[data-cms="menu-item"]`, this.menu).forEach(item => {
            const { cmsName } = item.dataset;
            this.items.set(cmsName, item);
            let view = Object.create(View, {
                name: { value: cmsName },
                parent: { value: this },
            });

            this.views.set(cmsName, view.init());
        });

        this.selectItem("general");

        this.refresh();
    },

    bindEvents() {
        const getItem = (element) => {
            let pred = (el) => el.dataset.cms === "menu-item";
            if (pred(element)) {
                return element;
            }

            return findAncestor(element, pred, 3);
        };

        this.menu.addEventListener("click", (event) => {
            let item = getItem(event.target);
            if (!isHTMLElement(item)) {
                return false;
            }

            this.selectItem(item.dataset.cmsName);
        });
    }
};

const View = {
    item: null,
    projection: null,
    init() {
        return this;
    },
    bindEvents() {

    }
};

App.init(getElement(".page-body"), instance);
App.fetchData();
