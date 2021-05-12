# **Gentleman**

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman is a lightweight web-based projectional editor generator.  
Gentleman aims to **to close the gap between models and domain experts**.

## Features

- Platform agnostic: Gentleman target the web (no installation required)
- Support textual and tabular notations and multimedia content
- Projections are defined with specialized UI elements for layouts and fields
- Integration with Ecore: Define an Ecore model and use it with Gentleman projections

## Workflow

### **Metamodelling**

The *metamodelling* workflow is reserved for the creation of concepts and projections.

**Required scripts:** `gentleman.core.js` **+** `gentleman.models.js`

### **Modelling**

The *modelling* workflow is reserved for the creation of concept instances using a projection ensemble.

**Required scripts:** `gentleman.core.js`

## Demonstration

- Mindmap (app): [Create a mindmap](https://geodes-sms.github.io/gentleman/demo/mindmap.html)
- Sandbox (app): [Play with Gentleman](https://geodes-sms.github.io/gentleman/demo/index.html)
- At MODELS 2020 (video): [Live demonstration (MODELS 2020)](https://youtu.be/wJ4hVZjmrv4)

## Tutorial

| Getting started        | Creating a metamodel           | Creating projections  |
|:------------- |:-------------:|:-----:|
| [![Getting started thumbnail](https://img.youtube.com/vi/kwcWam0_yNM/default.jpg)](https://youtu.be/kwcWam0_yNM)    | [![Creating a metamodel thumbnail](https://img.youtube.com/vi/GDl-tgEL3Yk/default.jpg)](https://youtu.be/GDl-tgEL3Yk) | [![Creating projections thumbnail](https://img.youtube.com/vi/2DcN7chsE6k/default.jpg)](https://youtu.be/2DcN7chsE6k) |

# Documentation

You can read the documentation for Gentleman [here](https://geodes-sms.github.io/gentleman/docs).  
If you would like to help improve this documentation, the source for many of the docs can be found in the `docs` folder within this repository.

## Integration

Gentleman can be added to any web application in 2 steps:

1. Add the required scripts to your page
2. [Decorate an HTML Tag](#decorate-an-html-tag) **OR** [Dynamically create an instance](#dynamically-create-an-instance)

### Decorate an HTML Tag

```html
<html>
    <body>
        ...
        <div data-gentleman="editor"></div>
        ...
        <script src="gentleman.core.js"></script>
        <script src="gentleman.models.js"></script>  <!-- required for << metamodelling workflow >> -->
    </body>
</html>
```

### Dynamically create an instance

```javascript
const options = {
    concept: null,
    projection: null, 
    config: null, 
    handlers: null
};

let editor = Gentleman.createEditor();
editor.init(options)
```

# Installation

## Building the Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command to install the dependencies

```
$ npm install
```

### Development

When working on the code, execute the following command

```
$ npm run start
```

This will start a development server (*webpack-dev-server*) that provides live reloading.

### Production

To deploy the code or test in a production environment, follow these steps.

1. Update the [build file](scripts/build.js) with newly created css files
2. From the project folder, execute the following command to build the code for production

```
$ npm run build
```
  
# Publication

[1] L-E Lafontant, E. Syriani. *Gentleman: a light-weight web-based projectional editor generator* [PDF](https://dl.acm.org/doi/pdf/10.1145/3417990.3421998)

# Distribution

This distribution contains the following files and folders:

- src: the source code
- dist: the distributed library
- docs: the app documentation
- assets: contains static files

# License

The source code is licensed under a [GNU GENERAL PUBLIC LICENSE 3](https://www.gnu.org/copyleft/gpl.html) ![GNU GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)
