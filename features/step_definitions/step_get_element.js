const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const { JSDOM }  = require('jsdom');
import { setDocument, DOC } from "@src/global";
const  { UTILS } = require('@utils');
var fs = require('fs');

const html = fs.readFileSync('./features/step_definitions/common/template.html', 'utf8');
const dom = new JSDOM(html);
setDocument(dom.window.document);

//console.log(dom.window.document.querySelector("p").textContent); // "Hello world"

Given('a DOMString {string}', function (str) {
    this.selector = str;
});

When("I query the DOM for the matched elements", function () {
    this.el = UTILS.getElement(this.selector);
    this.actualAnswer = this.el !== null;
}); 

Then("I should be told it {boolean}", function(exist){
    expect(this.actualAnswer).to.equal(exist);
});