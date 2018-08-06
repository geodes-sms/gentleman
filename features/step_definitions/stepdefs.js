const { Given, When, Then } = require('cucumber');
const expect = require('chai').expect;
const _ = require('../../src/helpers/helpers').HELPER;

function validateRequired(attr) {
    var isValid = true;
    this.error = null;

    if (!attr.isOptional) {
        isValid = !_.isNullOrWhiteSpace(attr.value.toString());
        if (!isValid) {
            this.error = "This attribute is <strong>required</strong>.";
        }
    }

    return isValid;
}

Given('an attribute is {boolean}', function (optional) {
    this.attr = {
        isOptional: optional
    };
});

When('I give it the {string}', function (value) {
    this.attr.value = value;
    this.isValid = validateRequired.call(this, this.attr);
});

Then('I should get {boolean}', function (isValid) {
    expect(this.isValid).to.equal(isValid);
});

Then('I should get a {boolean}', function (hasErrorMessage) {
    expect(!_.isNullOrWhiteSpace(this.error)).to.equal(hasErrorMessage);
});