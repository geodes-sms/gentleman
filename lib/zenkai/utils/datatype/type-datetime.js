import { isInt, valOrDefault } from './type-manip.js';

/**
 * Returns a value indicating the day of the week with monday = 0
 * @param {Date} date 
 * @memberof TYPE
 */
export function dayOfWeek(date) {
    var d = date.getDay();
    return d == 0 ? 6 : d - 1;
}

// Compare 2 times and returns
//  1 if t1 > t2
//  0 if t1 = t2
// -1 if t1 < t2
export function compareTime(t1, t2) {
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
}

export function parseTime(n) {
    var hh = +n | 0;
    var mm = '00';
    if (!isInt(+n))
        mm = (n + '').split('.')[1] * 6;
    return hh + ':' + mm;
}

// Returns a date using the format "YYYY-mm-dd"
export function shortDate(myDate) {
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
export function longDate(myDate) {
    var d = new Date(myDate);
    var hh = d.getHours();
    var MM = d.getMinutes();

    if (MM < 10) MM = '0' + MM;
    d = shortDate(d) + ' ' + hh + ':' + MM;

    return d;
}

// Convertie une date de string (YYYY-MM-DD) en format Date
export function parseDate(strDate) {
    var arrDate = strDate.split('-');
    return new Date(arrDate[0], arrDate[1] - 1, arrDate[2], 0, 0, 0, 0);
}

// Convertie une date de string (YYYY-MM-DD hh:mm) en format Date
export function parseDateTime(strDate) {
    var arrDateTime = strDate.split(' ');
    var arrTime = arrDateTime[1].split(':');
    var d = parseDate(arrDateTime[0]).setHours(+arrTime[0], +arrTime[1]);
    return new Date(d);
}

const DICT = {
    'en': {
        'second': 'second(s)',
        'minute': 'minute(s)',
        'hour': 'hour(s)',
        'day': 'day(s)',
        'week': 'week(s)',
        'month': 'month(s)',
        'year': 'year(s)',
    },
    'fr': {
        'second': 'seconde(s)',
        'minute': 'minute(s)',
        'hour': 'heure(s)',
        'day': 'jour(s)',
        'week': 'semaine(s)',
        'month': 'mois',
        'year': 'année(s)',
    },
};

const trans = function translation(lang, key, isPlural) {
    var value = DICT[lang][key];

    if (value === undefined) {
        return undefined;
    }

    if (isPlural) {
        return value.replace(/\(([a-z]+)\)/g, '$1');
    }

    return value.replace(/\([a-z]+\)/g, '');
};

const timeAgoResponse = function timeAgoResponseBuilder(time, unit, _lang) {
    var lang = valOrDefault(_lang, 'en');
    var isPlural = time === 1;
    var msg = {
        en: `${time} ${trans('en', unit, isPlural)} ago`,
        fr: `il y a ${time} ${trans('fr', unit, isPlural)}`,
    };

    return msg[lang];
};

export function timeAgo(time, callback) {
    callback = valOrDefault(callback, timeAgoResponse);
    const seconds = Math.floor((Date.now() - (new Date(time)).getTime()) / 1000);
    const MINUTE = 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    const WEEK = DAY * 7;
    const MONTH = DAY * 30;
    const YEAR = WEEK * 52;

    if (seconds < MINUTE) {
        return callback(seconds, 'second');
    } else if (seconds < HOUR) {
        return callback(~~(seconds / MINUTE), 'minute');
    } else if (seconds < DAY) {
        return callback(~~(seconds / HOUR), 'hour');
    } else if (seconds < WEEK) {
        return callback(~~(seconds / DAY), 'day');
    } else if (seconds < MONTH) {
        return callback(~~(seconds / WEEK), 'week');
    } else if (seconds < YEAR) {
        return callback(~~(seconds / MONTH), 'month');
    } else {
        return callback(~~(seconds / YEAR), 'year');
    }
}