# **Gentleman**

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman is a lightweight web-based projectional editor generator.  
Gentleman aims to **to close the gap between models and domain experts**.

| Concept defintion        | Projection definition           |
|:-------------:|:-------------:|
| ![Concept definition screenshot](https://geodes-sms.github.io/gentleman/assets/images/concept-definition.png "Concept definition")  | ![Projection definition screenshot](https://geodes-sms.github.io/gentleman/assets/images/projection-definition.png "projection definition") |

## Features

- Platform agnostic: Gentleman target the web (no installation required)
- Support textual and tabular notations and multimedia content
- Offer specialized UI units for projection layout and fields
- Integration with Ecore: Define an Ecore model and use it with Gentleman projections

## Workflow

### **Metamodelling**

The *metamodelling* workflow includes every activity required to build an editor

- `[M]` Create concepts (metamodel)
- `[P]` Create projections
- `[E]` Configure the editor

**Required scripts:** `gentleman.mod.js` **+** `gentleman.app.js`

### **Modelling**

The *modelling* workflow begins with every design artefacts (M.P.E.) in place

- `[m]` Create instances (model)
- `[p]` Manipulate projections
- `[e]` Personnalize the editor

**Required scripts:** `gentleman.app.js`

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
        <script src="gentleman.mod.js"></script>  <!-- required for << design workflow >> -->
        <script src="gentleman.app.js"></script>
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

## Demonstration

Take a look at the [demonstration (MODELS 2020) and see the tool in action](https://youtu.be/wJ4hVZjmrv4).

⭐⭐⭐ **[Play with Gentleman](https://geodes-sms.github.io/gentleman/demo/index.html)** ⭐⭐⭐

# Documentation

<!-- You can read the documentation for Gentleman [here](https://geodes-sms.github.io/gentleman/docs). If you would like to help improve this documentation, the source for many of the docs can be found in the doc folder within this repository.  -->

- [**Editor**](docs/editor.md)
  - [Getting started](docs/editor.md#interaction)
  - [User interface](docs/editor.md#user-interface)
  - [Interaction](docs/editor.md#interaction)
  - [Configuration](docs/editor.md#configuration)
- [**Concept**](docs/concept.md)
  - [Primitive](docs/concept.md#primitive)
  - [Concrete](docs/concept.md#concrete)
  - [Prototype](docs/concept.md#prototype)
  - [Derivative](docs/concept.md#derivative)
  - [Attribute](docs/concept.md#attribute)
  - [Property](docs/concept.md#property)
- [**Projection**](docs/projection.md)
  - [Layout](docs/projection.md#layout)
  - [Field](docs/projection.md#field)
  - [Static](docs/projection.md#static)
  - [Style](docs/projection.md#style)
  - [Template](docs/projection.md#template)

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

1. Ensure that you have updated [build file](scripts/build.js) with newly created css files
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
