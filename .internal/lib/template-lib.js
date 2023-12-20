"use strict";

// *------------*
// | Ocl-Engine |
// *------------*

var oclEngine = OclEngine.create();

oclEngine.setTypeDeterminer(function(obj) {

    if (obj && obj._type)
        return obj._type;
    else
        return "defaulttype";
});

function runQueryOver(oclQueryStr, obj) {

    var query = oclEngine.createQuery(oclQueryStr);

    return oclEngine.evaluateQuery(obj, query);
}

// Exemple d'utilisation de runQueryOver.

// var test = runQueryOver("self.participants->forAll(p | p.age >= 18)", {
//     "participants": [
//         { age: 19 },
//         { age: 84 },
//         { age: 18 }
//     ]
// });
//
// console.log(test);
// => true

// *-----------------*
// | Template-Runner |
// *-----------------*

function runTemplate(modelObj, templateObj) {

    if (templateObj._type != "template") {
        return "[ERROR] Invalid Template.";
    }

    var result = "";

    function process(instructions, obj) {

        for (var instruction of instructions) {

            switch(instruction._type) {

                case "static":

                    // - value (string)

                    var value = instruction.value;

                    if (value === undefined || value === null)
                        break;

                    value = v.replaceAll(value, "\\n", "\n");

                    result += value;

                    break;

                case "selection":

                    // - path (string)
                    // - post_processing (optional) (string)

                    if (!instruction.path)
                        break;

                    var value = runQueryOver(instruction.path, obj);

                    if (value === undefined || value === null)
                        break;

                    if (instruction.post_processing)
                        value = eval(instruction.post_processing);

                    if (value === undefined || value === null)
                        break;

                    result += value;

                    break;

                case "foreach":

                    // - items (string)
                    // - as (string)
                    // - content (Set of instruction)

                    if (!instruction.items)
                        break;

                    if (!instruction.as)
                        break;

                    if (!instruction.content)
                        break;

                    var items = runQueryOver(instruction.items, obj);

                    if (!items)
                        break;

                    for (var item of items) {

                        // On part du même contexte,
                        var newObj = {...obj};

                        // auquel on rajoute l'item actuel.
                        newObj[instruction.as] = item;

                        process(instruction.content, newObj);
                    }

                    break;

                case "if":

                    // - condition (string)
                    // - then_content (Set of instruction)
                    // - else_content (optional) (Set of instruction)

                    if (!instruction.condition)
                        break;

                    if (!instruction.then_content)
                        break;

                    var success = runQueryOver(instruction.condition, obj);

                    if (success) {

                        process(instruction.then_content, obj);

                    // La clause « else » étant facultative,
                    // On vérifie qu'elle soit définie.
                    } else if (instruction.else_content) {
                        process(instruction.else_content, obj);
                    }

                    break;

                case "run_template":

                    // - template (Reference to template)
                    // - with_context (string)

                    if (!instruction.template)
                        break;

                    if (!instruction.template.content)
                        break;

                    if (!instruction.with_context)
                        break;

                    var context = runQueryOver(instruction.with_context, obj);

                    if (!context)
                        break;

                    process(instruction.template.content, context);

                    break;

                default:
                    console.log("Unknown instruction: ", instruction);
            }
        }
    }

    if (templateObj.content)
        process(templateObj.content, modelObj);

    return result;
}

// *-----------------*
// | Model-Converter |
// *-----------------*

function getAllRootId(gentlemanModel) {

    var result = [];

    if (!("values" in gentlemanModel))
        return result;

    for (var value of gentlemanModel.values) {

        if (!("id" in value))
            continue;

        if (!("root" in value))
            continue;

        if (value.root)
            result.push(value.id);
    }

    return result;
}

function convertModel(gentlemanModel, rootValueId) {

    if (gentlemanModel.type != "model") {
        throw new Error("[ERROR] Not a gentleman model.");
    }

    // On va lister les (derivatives basées sur des primitives)

    var derivatives = {};

    for (var gentlemanConcept of gentlemanModel.concept) {

        // Exemple =>
        // "name": "name",
        // "nature": "derivative",
        // "base": "string"

        var valid = ("name" in gentlemanConcept) && ("nature" in gentlemanConcept) && ("base" in gentlemanConcept);

        if (!valid)
            continue;

        valid = gentlemanConcept.nature == "derivative";

        if (!valid)
            continue;

        valid = ["string", "boolean", "number"].includes(gentlemanConcept.base);

        if (!valid)
            continue;

        derivatives[gentlemanConcept.name] = gentlemanConcept.base;
    }

    // On va lister les prototypes

    var prototypes = new Set();

    for (var gentlemanConcept of gentlemanModel.concept) {

        // Exemple =>
        // "name": "primitive",
        // "nature": "prototype",
        // "attributes": []

        // Exemple (dans traffic-lights) =>
        // "name": "behaviour",
        // "nature": "prototype",
        // "attributes": [
        //     {
        //         "name": "target",
        //         "target": {
        //             "name": "reference",
        //             "accept": {
        //                 "name": "state"
        //             }
        //         },
        //         "required": true
        //     }
        // ]

        var valid = ("name" in gentlemanConcept) && ("nature" in gentlemanConcept);

        if (!valid)
            continue;

        valid = gentlemanConcept.nature == "prototype";

        if (!valid)
            continue;

        prototypes.add(gentlemanConcept.name);
    }

    // ----

    var gentlemanValues = gentlemanModel.values;

    // 1) On constitue un dictionary avec l'id comme key.

    // dictionary :: Dictionary<GentlemanId, GentlemanValue>
    var dictionary = {};

    for (var gentlemanValue of gentlemanValues) {

        var gentlemanId = gentlemanValue.id;

        if (gentlemanId in dictionary) {
            console.log("Ce n'est pas normal. " + gentlemanId + " est déjà dans le dictionary.");
        }

        dictionary[gentlemanId] = gentlemanValue;
    }

    // 2)

    // Memoization
    // On store les values déjà converties.
    // d'une part, pour éviter de les re-process (performances)
    // d'une autre part, pour éviter une exploration infinie (références circulaires)

    // convertedValues :: Dictionary<GentlemanId, ConvertedValue>
    var convertedValues = {};

    function simplify(convertedValue) {

        // Simplification des primitives

        if (["string", "boolean", "number", "reference"].includes(convertedValue._type))
            return convertedValue._value;

        if (convertedValue._type == "set")
            return convertedValue._values;

        return convertedValue;
    }

    function convertGentlemanValue(gentlemanId) {

        // Si on s'en est déjà occupé,
        // On renvoie la version déjà convertie.

        if (gentlemanId in convertedValues)
            return convertedValues[gentlemanId];

        // Sinon, on s'en occupe.

        if (!(gentlemanId in dictionary)) {
            console.log("Ce n'est pas normal. " + gentlemanId + " n'est pas dans le dictionary.");
        }

        gentlemanValue = dictionary[gentlemanId];

        // On fait un soft clone, pour en changer les properties
        // Sans changer l'original.
        gentlemanValue = {...gentlemanValue};

        var convertedResult = {};

        // On la push immédiatement dans notre table
        // Car lors de l'exploration, on risque de tomber
        // Sur une self-référence.
        // et il ne faudrait pas lancer une autre exploration,
        // depuis cette même exploration.
        convertedValues[gentlemanId] = convertedResult;

        // Si c'est une derivative, on la simplifie.
        if (gentlemanValue.name in derivatives)
            gentlemanValue.name = derivatives[gentlemanValue.name];

        // Si c'est un prototype, on en extrait l'instance concrète référée
        if (prototypes.has(gentlemanValue.name)) {

            // En pratique, on va les traiter comme des références.

            gentlemanValue.name = "reference";

            if (gentlemanValue.value)
                gentlemanValue.value = gentlemanValue.value.id;

            // {
            //   "id": "df13911a-633f-4161-a5eb-d557c2718c9f",
            //   "name": "behaviour",
            //   "root": false,
            //   "value": {
            //     "id": "cf86f71d-832c-40a6-a972-b113d8442203",
            //     "name": "manual"
            //   }
            // }

            // devient =>

            // {
            //   "id": "df13911a-633f-4161-a5eb-d557c2718c9f",
            //   "name": "reference",
            //   "value": "cf86f71d-832c-40a6-a972-b113d8442203"
            // }
        }

        convertedResult._type = gentlemanValue.name;

        switch(gentlemanValue.name) {

            case "string":
            case "boolean":
            case "number":

                var value = gentlemanValue.value;

                convertedResult._value = value;

                break;

            case "set":

                var values = gentlemanValue.value;

                convertedResult._values = values
                    .map(convertGentlemanValue)
                    .map(simplify);

                break;

            case "reference":

                var value = gentlemanValue.value;

                if (value == null)
                    convertedResult._value = null;
                else
                    convertedResult._value = convertGentlemanValue(value);

                break;

            default:

                if (!("attributes" in gentlemanValue))
                    break;

                for (var gentlemanAttribute of gentlemanValue.attributes) {
                    if (gentlemanAttribute.value == null)
                        convertedResult[gentlemanAttribute.name] = null;
                    else
                        convertedResult[gentlemanAttribute.name] = simplify(convertGentlemanValue(gentlemanAttribute.value.id));
                }
        }

        return convertedResult;
    }

    // Root node

    if (!(rootValueId in dictionary)) {
        throw new Error("[ERROR] Invalid rootValueId.");
    }

    var result = convertGentlemanValue(rootValueId);

    return result;
}

