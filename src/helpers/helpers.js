const HELPER = (function () {
    var pub = {
        cloneObject: function (obj) {
            if (obj === null || typeof (obj) !== 'object')
                return obj;
            var temp = obj.constructor(); // changed
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj['isActiveClone'] = null;
                    temp[key] = this.cloneObject(obj[key]);
                    delete obj['isActiveClone'];
                }else{
                    console.log(key);
                }
            }
            return temp;
        },

        /**
         * Returns a value indicating whether a string is null or made of whitespace.
         * @param {string} str string
         */
        isNullOrWhiteSpace: function (str) { return (!str || str.length === 0 || /^\s*$/.test(str)); },
        // Verify that a number is an Integer
        isInt: function (n) { return n % 1 === 0; },

        // Compare 2 times and returns
        //  1 if t1 > t2
        //  0 if t1 = t2
        // -1 if t1 < t2
        compareTime: function (t1, t2) {
            var arr1 = t1.split(':');
            var arr2 = t2.split(':');

            // hour comparison
            if (+arr1[0] > +arr2[0])
                return 1;
            else if (+arr1[0] < +arr2[0])
                return -1;
            else {
                // minute comparison
                if (+arr1[1] > +arr2[1])
                    return 1;
                else if (+arr1[1] < +arr2[1])
                    return -1;
                else {
                    if (arr1.length == arr2.length && arr1.length == 3) {
                        // second comparison
                        if (+arr1[2] > +arr2[2])
                            return 1;
                        else if (+arr1[2] < +arr2[2])
                            return -1;
                    }

                    return 0;
                }
            }
        },
        parseTime: function (n) {
            var hh = +n | 0;
            var mm = '00';
            if (!this.isInt(+n))
                mm = (n + '').split('.')[1] * 6;
            return hh + ':' + mm;
        },
        // Returns a value indicating the day of the week with monday = 0
        dayOfWeek: function (date) {
            var d = date.getDay();
            return d == 0 ? 6 : d - 1;
        },

        valOrDefault: function (arg, val) {
            return typeof arg !== 'undefined' ? arg : val;
        },

        /**
         * Return the singular or plural form of a word based on a predicate
         * @param {boolean} predicate 
         * @param {string} singular 
         * @param {string} plural 
         */
        pluralize: function (predicate, singular, plural) {
            if (predicate)
                return singular;
            plural = plural.split("|");
            return singular.substring(0, singular.lastIndexOf(plural[0])) + plural[1];
        },

        XHR: function (file, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    callback(xhr.responseText);
                }
            };
            xhr.open('GET', file, true);
            xhr.send();
        },

        /**
         * Converts to boolean
         */
        toBoolean: function (val) {
            val = this.valOrDefault(val, false);
            return val === true || val.toString().toLowerCase() === 'true';
        },
        /**
         * Converts a boolean to an integer
         * @param {boolean} val 
         * @returns {int} 1 or 0
         */
        boolToInt(val) {
            return val ? 1 : 0;
        },
        isString(str) {
            return typeof myVar === 'string' || str instanceof String;
        },

        /**
         * Append the path to the current path
         * @param {string} target 
         * @param {string} path 
         */
        addPath: function (target, path) { return this.isNullOrWhiteSpace(target) ? path : target + '.' + path; },
        /**
         * Returns the directory of the path
         * @param {string} path 
         */
        getDir: function (path) { return path.substring(0, path.lastIndexOf('.')); },
        /**
         * Returns the directory of the path from the target
         * @param {string} path 
         */
        getDirTarget: function (path, target) { return path.substring(0, path.lastIndexOf(target) - 1); },

        defProp: Object.defineProperty,

        /**
         * Returns the index or value of the first element in the object
         * @param {Object|Array} obj 
         * @param {any} value 
         */
        find(obj, value) {
            if (Array.isArray(obj)) {
                let index = obj.indexOf(value);
                if (index !== -1) return index;
            } else {
                for (const e of Object.keys(obj)) {
                    if (obj[e] === value || obj[e].val === value) {
                        return e;
                    }
                }
            }
            return undefined;
        }
    };

    // Returns a date using the format "YYYY-mm-dd"
    function shortDate(myDate) {
        var d = new Date(myDate);
        var dd = d.getDate();
        var mm = d.getMonth() + 1; // January = 0
        var yyyy = d.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        d = yyyy + '-' + mm + '-' + dd;

        return d;
    }

    // Returns a date and time using the format "YYYY-mm-dd hh:MM"
    function longDate(myDate) {
        var d = new Date(myDate);
        var hh = d.getHours();
        var MM = d.getMinutes();

        if (MM < 10) MM = '0' + MM;
        d = shortDate(d) + ' ' + hh + ':' + MM;

        return d;
    }

    // Convertie une date de string (YYYY-MM-DD) en format Date
    function parseDate(strDate) {
        var arrDate = strDate.split('-');
        return new Date(arrDate[0], arrDate[1] - 1, arrDate[2], 0, 0, 0, 0);
    }

    // Convertie une date de string (YYYY-MM-DD hh:mm) en format Date
    function parseDateTime(strDate) {
        var arrDateTime = strDate.split(' ');
        var arrTime = arrDateTime[1].split(':');
        var d = parseDate(arrDateTime[0]).setHours(+arrTime[0], +arrTime[1]);
        return new Date(d);
    }

    return pub;
}());

if(typeof module !== 'undefined'){
    module.exports = HELPER;
}