/**
 * Return form parameters
 * @returns {object|undefined}
 * @ignore
 */
function getFormParameters(form) {
    var formData = new FormData(form);
    // A révisier: provient du code de Christian Simeu (CEN-R)
    for (var pair of formData.entries()) {
        if (pair[1] === undefined) {
            formData.delete(pair[0]);
        }
    }
    return formData.entries();
}