import '@css/normalize.css';
import '@css/base.css';
import '@css/effect.css';
import '@css/app/layout.css';
import '@css/app/field.css';
import '@css/app/editor.css';
import '@css/app/editor-home.css';
import '@css/app/editor-header.css';
import './assets/style.css';

import { 
    findAncestor, getElement, getElements, isHTMLElement, isNullOrUndefined 
} from 'zenkai';

const PEOPLE_CONCEPT = require('@models/cms-model/person-concept.json');
const ORGANIZATION_CONCEPT = require('@models/cms-model/organization-concept.json');
const ORGANIZATION_PROJECTION = require('@models/cms-model/organization-projection.json');
const PROJECTION = require('@models/cms-model/projection.json');

const PEOPLE_DATA = require('./assets/data/people.json');
const TOOLS_DATA = require('./assets/data/tools.json');
const { activateEditor } = require('@src');


let editor = activateEditor(".app-editor")[0];
editor.init({
    config: {
        header: false,
    },
    conceptModel: [PEOPLE_CONCEPT, ORGANIZATION_CONCEPT],
    projectionModel: ORGANIZATION_PROJECTION
});

let organization = editor.createConcept("research-organization");
organization.getAttribute("name").setValue("GEODES");
organization.getAttribute("description").setValue("GEODES was founded as part of DIRO in 1992. It was then called GÉLO and changed to GEODES in 2005. Since then, more than 30 students have obtained a PhD degree from the group, and more then a 100 students have graduated with a Master's degree. Many of these students are professors in Quebec, Canada, and around the world (ÉTS, Laval, Polytechnique, UQAM, Ottawa, DePaul, Houston, Indiana, Michigan, United Arab Emirates, etc.), and others hold key positions at large tech companies. GEODES is very scientifically very active group with over 20 publications per year in journals, conference proceedings and book chapters.");
let instance = editor.createInstance(organization);
instance.changeSize("fullscreen");

let people = organization.getAttribute("members").getTarget();


const App = {
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

    init(container) {
        this.container = container;
        this.items = new Map();
        this.views = new Map();
        this.bindDOM();
        this.bindEvents();
    },
    refresh() {

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
        this.selectedItem.classList.add("selected");

        this.updateView();

        this.refresh();

        return this;
    },
    updateView() {

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

App.init(getElement(".page-body"));

function loadData(data) {
    if (Array.isArray(data)) {
        data.forEach(item => {
            let person = editor.createConcept("person");

            const [lastName, firstName] = item.name.split(",");

            person.getAttribute("first-name").setValue(firstName);
            person.getAttribute("last-name").setValue(lastName);
            person.getAttribute("occupation").setValue(item.position);
            person.getAttribute("email-address").setValue(item.website);
            person.getAttribute("photo").setValue(item.photo);

            people.addElement(person);
        });
    }
}