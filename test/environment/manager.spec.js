// require jsdom-global
var jsdom = require('jsdom-global');
var fs = require('fs');

// require chai for BDD
var expect = require('chai').expect;

// import the library under test
const { Manager } = require('@environment/manager.js');

describe('DOM query helpers', function () {
    before('initialize DOM', function () {
        const html = fs.readFileSync(`${__dirname}/../template.html`, 'utf8');
        this.jsdom = jsdom(html);
    });

    describe('#Manager.init()', function () {
        it("should return a manager instance", function () {
            var result = Manager.init();

            expect(result.container).to.be.an.instanceOf(HTMLElement);
            // expect(result.container.dataset).to.have.property('gentleman');
        });
    });

    
    after(function () {
        this.jsdom();
    });
});