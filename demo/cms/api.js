const ORGANIZATION_DATA = require('./assets/data/organization.json');
import YAML from 'yaml';

export const API = {
    fetchOrganization(editor, organization) {
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
    },
    fetchProjects(editor, organization) {
        fetch("https://raw.githubusercontent.com/geodes-sms/geodes-sms.github.io/main/_data/projects/funded.yml")
            .then(data => data.text())
            .then(data => {
                const PROJECTS_DATA = YAML.parse(data);

                let projects = organization.getAttribute("projects").getTarget();
                projects.removeAllElement();

                PROJECTS_DATA.forEach(item => {
                    let project = editor.createConcept("project");

                    const { name, description, startYear, endYear, funding, logo, partners = [] } = item;

                    project.getAttribute("name").setValue(name);
                    project.getAttribute("description").setValue(description);
                    project.getAttribute("start-date").setValue(startYear);
                    project.getAttribute("end-date").setValue(endYear);
                    project.getAttribute("funding").setValue(funding);
                    project.getAttribute("logo").setValue(logo);

                    let projectPartners = project.getAttribute("partners").getTarget();

                    if (Array.isArray(partners)) {
                        partners.forEach(p => {
                            let partner = editor.createConcept("partner");

                            partner.getAttribute("name").setValue(p);

                            projectPartners.addElement(partner);
                        });
                    }
                    projects.addElement(project);
                });
            });
    },
    fetchTools(editor, organization) {
        fetch("https://raw.githubusercontent.com/geodes-sms/geodes-sms.github.io/main/_data/projects/tools.yml")
            .then(data => data.text())
            .then(data => {
                const TOOLS_DATA = YAML.parse(data);

                let tools = organization.getAttribute("tools").getTarget();
                tools.removeAllElement();

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
            });
    },
    fetchPeople(editor, organization) {
        fetch("https://raw.githubusercontent.com/geodes-sms/geodes-sms.github.io/main/_data/people/people.yml")
            .then(data => data.text())
            .then(data => {
                const PEOPLE_DATA = YAML.parse(data);

                let people = organization.getAttribute("members").getTarget();
                people.removeAllElement();

                PEOPLE_DATA.forEach(item => {
                    let person = editor.createConcept("person");

                    const [lastName, firstName] = item.name.split(",");

                    person.getAttribute("first-name").setValue(firstName);
                    person.getAttribute("last-name").setValue(lastName);
                    person.getAttribute("occupation").setValue(item.position);
                    person.getAttribute("website").setValue(item.website);
                    person.getAttribute("email").setValue(item.email);
                    person.getAttribute("phone").setValue(item.phone);
                    person.getAttribute("photo").setValue(`https://geodes.iro.umontreal.ca/images/people/people/${item.image}`);

                    people.addElement(person);
                });
            });


    }
};