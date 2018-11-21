import { __VERSION } from '@src/global';
import { Key, EventType } from '@src/enums';
import { UTILS as $, HELPER as _ } from '@utils';

/**
 * Preprend a string with a dot
 * @param {string} str 
 * @returns {string}
 */
function dot(str) { return '.' + str; }

const THANK_YOU = ['thx', 'ty', 'thanks', 'thank'];
const POLITE = ["You're welcome.", "I'm happy to help.", "Glad I could help.", "Anytime.", "It was nothing.", "No problem.", "Don't mention it.", "It was my pleasure."];
const BYE = ['bye', 'close', 'exit', 'done'];

export function openConv() {
    var self = this;

    const CONVO = 'convo';
    const CONVO_USER = [CONVO, 'convo--user'];
    const CONVO_GENTLEMAN = [CONVO, 'convo--gentleman', 'font-gentleman'];

    var container = $.getElement(dot('convo-container'));
    var greeting = $.createP({ class: CONVO_GENTLEMAN });
    var qq, convo;
    if (container) {
        $.show(container);
        convo = $.getElement(dot('convo-wrapper'));
        convo.appendChild(greeting);
        qq = $.getElement(dot('question'));
    } else {
        container = $.createDiv({ class: 'convo-container' });
        convo = $.createDiv({ class: ['convo-wrapper'] });
        convo.appendChild(greeting);
        qq = $.createTextArea({ class: ['question'], placeholder: "Ask a question" });
        qq.addEventListener(EventType.KEYDOWN, function (event) {
            switch (event.key) {
                case Key.enter:
                    var val = qq.value;
                    var q = $.createP({ class: CONVO_USER, text: val });
                    convo.appendChild(q);
                    qq.value = "";

                    // delay answer => conv feeling (UX)
                    setTimeout(function () {
                        var a = $.createP({ class: CONVO_GENTLEMAN });
                        convo.appendChild(a);
                        var ask_response = ask(val);
                        $.TypeWriter(a, ask_response, function () {
                            if (ask_response.close) {
                                setTimeout(function () { $.hide(container); }, 500);
                            }
                        });
                    }, 200);

                    event.preventDefault();
                    event.stopPropagation();

                    break;
                case Key.backspace:
                    event.stopPropagation();

                    break;
                case Key.escape:
                    $.hide(container);
                    event.stopPropagation();

                    break;
                default:
                    break;
            }

        });
        $.appendChildren(container, [convo, qq]);
        self.body.appendChild(container);
    }
    $.TypeWriter(greeting, [{ type: 0, val: "Hello, how may I help you?" }]);
    qq.focus();

    /**
     * Process question
     * @param {string} qq question
     * @returns {string} answer
     */
    function ask(qq) {
        // remove accents and keep words
        var words = _.removeAccents(qq).replace(/[^a-zA-Z0-9 _-]/gi, '').split(' ');
        if (words.findIndex(function (val) { return val.toLowerCase() === 'version'; }) !== -1) {
            return [
                { type: 0, val: "You are currently using Gentleman " },
                { type: 1, val: "version " + __VERSION }
            ];
        } else if (words.findIndex(function (val) { return THANK_YOU.indexOf(val.toLowerCase()) !== -1; }) !== -1) {
            return [{ type: 0, val: POLITE[_.random(POLITE.length - 1)] }];
        } else if (words.findIndex(function (val) { return BYE.indexOf(val.toLowerCase()) !== -1; }) !== -1) {
            let result = [{ type: 0, val: "Good bye, happy coding :)" }];
            result.close = true;
            return result;
        } else {
            return [{ type: 0, val: "Sorry, I cannot answer this question at the moment. Ask me again later." }];
        }
    }
}