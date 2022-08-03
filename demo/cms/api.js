import { PEOPLE_DATA, PROJECTS_DATA, ORGANIZATION_DATA, TOOLS_DATA } from './data.js';

export const API = {
    fetch(editor, organization) {
        let people = organization.getAttribute("members").getTarget();
        let projects = organization.getAttribute("projects").getTarget();
        let tools = organization.getAttribute("tools").getTarget();

        organization.getAttribute("name").setValue(ORGANIZATION_DATA.name);
        organization.getAttribute("description").setValue(ORGANIZATION_DATA.description);
        organization.getAttribute("phone").setValue(ORGANIZATION_DATA.phone);
        organization.getAttribute("website").setValue(ORGANIZATION_DATA.website);
        organization.getAttribute("email").setValue(ORGANIZATION_DATA.email);


        let socials = organization.getAttribute("socials").getTarget();

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

        TOOLS_DATA.forEach(item => {
            let tool = editor.createConcept("tool");

            const { name, description, startYear, url, logo, contributors = [] } = item;

            tool.getAttribute("name").setValue(name);
            tool.getAttribute("description").setValue(description);
            tool.getAttribute("start-date").setValue(startYear);
            tool.getAttribute("url").setValue(url);
            tool.getAttribute("logo").setValue(logo);

            let partners = tool.getAttribute("contributors").getTarget();

            contributors.forEach(contrib => {
                let partner = editor.createConcept("partner");

                partner.getAttribute("name").setValue(contrib);

                partners.addElement(partner);
            });

            tools.addElement(tool);
        });
    }
};