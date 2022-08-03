# <img alt="Gentleman logo" height="60" src="https://gentlemancp.org/assets/images/logo_gentleman_200.png"> Gentleman

<!-- [![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman) -->

Gentleman is a **lightweight web-based projectional editor** that allows you to create and manipulate concept-based models through projection.

## Features

✔️ Common editing features: contextual assistance, copy-paste, undo/redo  
✔️ Support multiple projections for a concept  
✔️ Easy to switch the projections used against a model  
✔️ Projections are defined with specialized UI elements  
✔️ Support graphical projectional editor using SVG  
✔️ SVG projection can be imported or created in the editor  
✔️ Support multiple layouts with simulations  


[**Gentleman IDE**](https://geodes-sms.github.io/gentleman/app/index.html)

## Examples

| Mindmap               | Traffic Light (TL)             | TodoList           | Statechart     | Sequence Diagram | Music Sheet      |
|:---------------------:|:------------------------------:|:------------------------------:|:---------------------:|:------------------------------:|:------------------------------:|
| ![*Oops!* missing image 😅][mindmap-img]         | ![*Oops!* missing image 😅][tl-img] | ![*Oops!* missing image 😅][todo-img] | ![*Oops!* missing image 😅][sc-img] | ![*Oops!* missing image 😅][ds-img] | ![*Oops!* missing image 😅][music-img] 
| [Try it out][mindmap-app] | [Try it out][tl-app] | [Try it out][todo-app] | [Try it out][sc-app] | [Try it out][ds-app] | [Try it out][music-app] 

[mindmap-app]: https://geodes-sms.github.io/gentleman/demo/mindmap/index.html
[mindmap-img]: https://gentlemancp.org/assets/images/demo_mindmap.gif "Mindmap demo"
[tl-app]: https://geodes-sms.github.io/gentleman/demo/traffic-light/index.html
[tl-img]: https://gentlemancp.org/assets/images/demo_traffic_light.gif "Traffic light demo"
[todo-app]: https://geodes-sms.github.io/gentleman/demo/todo/index.html
[todo-img]: https://gentlemancp.org/assets/images/demo_todo.gif "TodoList demo"
[sc-app]: https://geodes-sms.github.io/gentleman/demo/statechart/index.html
[sc-img]: https://gentlemancp.org/assets/images/demo_statechart.gif "Statechart demo"
[ds-app]: https://geodes-sms.github.io/gentleman/demo/sequence/index.html
[ds-img]: https://gentlemancp.org/assets/images/demo_sequence.gif "Sequence Diagram demo"
[music-app]: https://geodes-sms.github.io/gentleman/demo/music/index.html
[music-img]: https://gentlemancp.org/assets/images/demo_music.gif "Music demo"
If the links for graphical projections examples do not work:
 - Follow the installation steps.
 - Create a new Editor.
 - Import the metamodels and projection available in the `models` folder.
 - Start the editing!
# Documentation 📖

For live examples (demo), docs and to learn more about Gentleman, please visit [gentlemancp.org](https://gentlemancp.org).  
If you are in a hurry here are some **quick links**:  
🔗 [Documentation](https://gentlemancp.org/docs)  
🔗 [Getting started](https://gentlemancp.org/docs/getting-started)  

## Integration

Gentleman can be added to any web application in 2 steps:

1. Add the library (JS script) to your page
2. [Decorate an HTML Tag](#decorate-an-html-tag) **OR** [Dynamically create an instance](#dynamically-create-an-instance)

> Gentleman library: `gentleman.core.js`.

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

### Browser Compatibility

Gentleman supports all browsers that are [ES5-compliant](https://kangax.github.io/compat-table/es5/) (IE8 and below are not supported).

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

2. Aurélien Ducoin, E.Syriani. *Graphical Projectional Editing in Gentleman*  
   [Demonstration](https://www.youtube.com/watch?v=wd00pRAHxsU&ab_channel=GEODESGentleman)

# Distribution 📂

This distribution contains the following files and folders:

- src: the library source code
- app: the application source code
- dist: the distributed library
- docs: the app documentation
- assets: contains static files for library and app

# Contributors

- Louis-Edouard LAFONTANT
- Aurélien DUCOIN

# License ©️

The source code is licensed under a [GPL 3.0 license](https://opensource.org/licenses/GPL-3.0) ![GPL](https://img.shields.io/badge/license-GPL3.0-blue)
