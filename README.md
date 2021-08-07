# **Gentleman** 🎯

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman is a **lightweight web-based projectional editor** that allows you to create and manipulate concept-based models through projections.

## Features

✔️ Easy integration with any web application  
✔️ Compatible with Ecore model  
✔️ Support textual and tabular notations and multimedia content  
✔️ Support multiple projections for a concept  
✔️ Easy to switch the projections used against a model  
✔️ Projections are defined with specialized UI elements

**Gentleman IDE**: [Create concepts and projections](https://geodes-sms.github.io/gentleman/app/index.html)

## Examples

| Mindmap               | Traffic Light (TL)             |
|:---------------------:|:------------------------------:|
| ![*Oops!* missing image 😅][3]         | ![*Oops!* missing image 😅][4] |
| [Try it out][1] | [Try it out][2] |

[1]: https://geodes-sms.github.io/gentleman/demo/mindmap/index.html
[2]: https://geodes-sms.github.io/gentleman/demo/traffic-light/index.html
[3]: https://github.com/geodes-sms/gentleman/blob/8bbbdd371a627c5464780cd517670689e79f009b/assets/images/mindmap.gif "Mindmap demo"
[4]: https://github.com/geodes-sms/gentleman/blob/7c8cd4aa2a8d7a7ab59b339649cfbb9e9785ef88/assets/images/traffic_light.gif "Traffic light demo"

# Documentation 📖

The documentation can be found [here](https://geodes-sms.github.io/gentleman/public/docs) 👈.  

## Integration

Gentleman can be added to any web application in 2 steps:

1. Add the [required scripts](#scripts) to your page
2. [Decorate an HTML Tag](#decorate-an-html-tag) **OR** [Dynamically create an instance](#dynamically-create-an-instance)

### Scripts

- `gentleman.core.js` (*required*): Gentleman library.
- `gentleman.app.js` (*optional*): Provides an IDE to create concepts and projections.

### Decorate an HTML Tag

```html
<html>
    <body>
        ...
        <div data-gentleman="editor"></div>
        ...
        <script src="gentleman.core.js"></script>
        <script>
            let editor = Gentleman.activateEditor()[0]
            editor.init({...});
        </script>
    </body>
</html>
```

### Dynamically create an instance

```javascript
// your application
const App = {};
...
// create and initialize an editor
let editor = Gentleman.createEditor();
editor.init({...});
...
// append the editor to the page
App.container.append(editor.container);
```

# Installation 💻

## Building the Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command to install the dependencies

```
$ npm install
```

### Development

When working on the code, you will need a folder named `.internal` at the root of the project.  
This folder is used as the source of content for the *webpack-dev-server* (see [webpack.dev.js](/webpack.dev.js)) that provides live reloading. It can be used to store dev-specific files and assets.

1. Create a folder named `.internal` in the root
2. Add an `index.html` file in the `.internal` folder
3. Add the script `<script src="app.bundle.js"></script>` at the end of the `index.html` page

Once you have the `.internal` folder in place, execute the following command

```
$ npm run start
```

This will start a development server (*webpack-dev-server*) and should open the application in the browser.

### Production

To deploy the code or test in a production environment, follow these steps.

1. Update the [build file](scripts/build.js) with newly created css files
2. From the project folder, execute the following command to build the code for production

```
$ npm run build
```
  
# Publication 📃

1. L-E Lafontant, E. Syriani. *Gentleman: a light-weight web-based projectional editor generator*  
   [Paper](https://dl.acm.org/doi/pdf/10.1145/3417990.3421998)  
   [Demonstration](https://youtu.be/wJ4hVZjmrv4)

# Distribution 📂

This distribution contains the following files and folders:

- src: the library source code
- app: the application source code
- dist: the distributed library
- docs: the app documentation
- assets: contains static files for library and app

# License ©️

The source code is licensed under a [MIT LICENSE](https://opensource.org/licenses/MIT) ![MIT](https://img.shields.io/badge/license-MIT-blue.svg)
