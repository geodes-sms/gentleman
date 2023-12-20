"use strict";

document.addEventListener("DOMContentLoaded", function() {

    var divModel = document.getElementById("model");
    var divTemplate = document.getElementById("template");

    divModel.addEventListener("dragover", function(event) {
        event.preventDefault();
    });

    divTemplate.addEventListener("dragover", function(event) {
        event.preventDefault();
    });

    var divStates = {
        NONE: 0, // Aucune opération n'a été effectuée
        VALID: 1, // Un modèle valide a été déposé
        INVALID: 2, // Un modèle invalide a été déposé
        SPECIAL: 3 // Un modèle déjà converti a été déposé
    };

    function setValidColor(div, divState) {

        div.classList.remove("valid");
        div.classList.remove("invalid");
        div.classList.remove("special");

        switch(divState) {
            case divStates.NONE:
                break;
            case divStates.VALID:
                div.classList.add("valid");
                break;
            case divStates.INVALID:
                div.classList.add("invalid");
                break;
            case divStates.SPECIAL:
                div.classList.add("special");
                break;
        }
    }

    function checkModel(gentlemanModel) {

        var rootIds = getAllRootId(gentlemanModel);

        if (!rootIds)
            return false;

        try {

            for (var rootId of rootIds) {

                var result = convertModel(gentlemanModel, rootId);

                if (!result)
                    return false;
            }

        } catch (e) {

            console.log(e);

            return false;
        }

        return true;
    }

    function getRootIdsOfMainTemplates(gentlemanModel) {

        var results = [];

        var rootIds = getAllRootId(gentlemanModel);

        for (var rootId of rootIds) {

            var convertedTemplate = convertModel(gentlemanModel, rootId);

            if (convertedTemplate.is_main_entry_point)
                results.push(rootId);
        }

        return results;
    }

    function checkTemplate(gentlemanModel) {

        // Un template valide, est un modèle valide.
        if (!checkModel(gentlemanModel))
            return false;

        // On doit aussi s'assurer qu'exactement
        // un template node ait comme attribut
        // is_main_entry_point == true

        var rootIds = getRootIdsOfMainTemplates(gentlemanModel);

        if (rootIds.length < 1) {

            Swal.fire({
                title: "Error!",
                text: "No MainEntryPoint (should be ONE)",
                icon: "error",
                confirmButtonText: "OK"
            });

            return false;
        }

        if (rootIds.length > 1) {

            Swal.fire({
                title: "Error!",
                text: "Ambiguous MainEntryPoint (should only be ONE)",
                icon: "error",
                confirmButtonText: "OK"
            });

            return false;
        }

        return true;
    }

    var convertedModels = null;
    var convertedTemplate = null;

    function reset() {

        convertedModels = null;
        convertedTemplate = null;

        setValidColor(divModel, divStates.NONE);
        setValidColor(divTemplate, divStates.NONE);
    }

    function runTemplateIfEverythingIsOkay() {

        if (!convertedModels)
            return;

        if (!convertedTemplate)
            return;

        for (var i = 0; i < convertedModels.length; i++) {

            var convertedModel = convertedModels[i];

            var result = runTemplate(convertedModel, convertedTemplate);

            var blob = new Blob([result], { type: "text/plain" });

            var filename =
                convertedModels.length == 1 ?
                "result.txt" : "result-" + (i + 1).toString().padStart(2, '0') + ".txt";

            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        Swal.fire({
            title: "Success!",
            text: "Everything went smoothly!",
            icon: "success",
            confirmButtonText: "Cool"
        })

        reset();
    }

    function modelLoaded(model) {

        // Si le modèle est déjà converti.
        if ("_type" in model) {

            convertedModels = [JSON.retrocycle(model)];

            setValidColor(divModel, divStates.SPECIAL);

            return;
        }

        var isValid = checkModel(model);

        setValidColor(divModel, isValid ? divStates.VALID : divStates.INVALID);

        if (!isValid)
            return;

        convertedModels = [];

        var rootIds = getAllRootId(model);

        for (var rootId of rootIds)
            convertedModels.push(convertModel(model, rootId));
    }

    function templateLoaded(template) {

        // Si le template est déjà converti.
        if ("_type" in template && template._type == "template") {

            convertedTemplate = JSON.retrocycle(template);

            setValidColor(divTemplate, divStates.SPECIAL);

            return;
        }

        var isValid = checkTemplate(template);

        setValidColor(divTemplate, isValid ? divStates.VALID : divStates.INVALID);

        if (!isValid)
            return;

        var rootId = getRootIdsOfMainTemplates(template)[0];

        convertedTemplate = convertModel(template, rootId);
    }

    divModel.addEventListener("drop", function(event) {

        event.preventDefault();

        var files = event.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var content = e.target.result;

            var jsonData = null;

            try {
                jsonData = JSON.parse(content);

                if (typeof jsonData === "string")
                    throw new Error("This JSON does not contain an object (but a string).");

            } catch (e) {

                setValidColor(divModel, divStates.INVALID);

                Swal.fire({
                    title: "Error!",
                    text: e,
                    icon: "error",
                    confirmButtonText: "OK"
                });

                console.log(e);

                return;
            }

            modelLoaded(jsonData);

            runTemplateIfEverythingIsOkay();
        };

        reader.readAsText(file);
    });

    divTemplate.addEventListener("drop", function(event) {

        event.preventDefault();

        var files = event.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var content = e.target.result;

            var jsonData = null;

            try {
                jsonData = JSON.parse(content);

                if (typeof jsonData === "string")
                    throw new Error("This JSON does not contain an object (but a string).");

            } catch (e) {

                setValidColor(divTemplate, divStates.INVALID);

                Swal.fire({
                    title: "Error!",
                    text: e,
                    icon: "error",
                    confirmButtonText: "OK"
                });

                console.log(e);

                return;
            }

            templateLoaded(jsonData);

            runTemplateIfEverythingIsOkay();
        };

        reader.readAsText(file);
    });

});

