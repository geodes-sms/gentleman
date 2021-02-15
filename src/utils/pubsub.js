import { hasOwn, isFunction } from "zenkai";

var events = {};


// Pub-Sub pattern implementation
export const Events = {
    on: function (eventName, fn) {
        if (!isFunction(fn)) {
            return false;
        }

        events[eventName] = events[eventName] || [];
        events[eventName].push(fn);
    },
    once: function (eventName, fn) {
        if (!isFunction(fn)) {
            return false;
        }

        events[eventName] = events[eventName] || [];
        events[eventName].push(function () {
            fn.apply(this, arguments);
        });
    },
    off: function (eventName, fn) {
        if (!hasOwn(events, eventName)) {
            return false;
        }

        for (var i = 0; i < events[eventName].length; i++) {
            if (events[eventName][i] === fn) {
                events[eventName].splice(i, 1);

                return true;
            }
        }

        return false;
    },
    clearAll: function () {
        events = {};
    },
    clear: function (eventName) {
        if (hasOwn(events, eventName)) {
            events[eventName] = [];
        }
    },
    emit: function (eventName, data) {
        if (hasOwn(events, eventName)) {
            events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    }
}; 