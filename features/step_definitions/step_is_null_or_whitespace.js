const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');

function isNullOrWhiteSpace(str) {
    return (!str || str.length === 0 || /^\s*$/.test(str));
}

Given('a string {string}', function (str) {
    this.string = str === "null" ? null : str;
});

When("I ask whether it's null or made of whitespace", function () {
    this.actualAnswer = isNullOrWhiteSpace(this.string);
}); 

Then('I should be told {boolean}', function (expectedAnswer) {
    expect(this.actualAnswer).to.equal(expectedAnswer);
});