const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const { HELPER: _ } = require('../../build/utils');

function validateRequired() {
    var isValid = true;
    this.error = null;

    if (!this.isOptional) {
        isValid = !_.isNullOrWhiteSpace(this.value.toString());
        if (!isValid) {
            this.error = "This attribute is <strong>required</strong>.";
        }
    }

    return isValid;
}

Given('an attribute is {boolean}', function (optional) {
    this.isOptional = optional;
});

When('I give it the {string}', function (value) {
    this.value = value;
    this.isValid = validateRequired.call(this);
});

Then('the attribute should be {boolean}', function (isValid) {
    expect(this.isValid).to.equal(isValid);
});

Then('I should get a {boolean}', function (hasErrorMessage) {
    expect(!_.isNullOrWhiteSpace(this.error)).to.equal(hasErrorMessage);
});