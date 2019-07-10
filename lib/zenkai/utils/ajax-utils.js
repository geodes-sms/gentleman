/** 
 * Ajax namespace
 * @namespace AJAX 
 */

import { isFunction, isNullOrUndefined, valOrDefault } from "./datatype/index.js";

const HttpResponse = {
    // Successful
    OK: 200,
    Created: 201,
    Accepted: 202,
    NoContent: 204,
    // Client Error
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    UnsupportedMediaType: 415,
    // Server Error
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavaible: 503,
    GatewayTimeout: 504
};

const State = {
    OPENED: 1,
    RECEIVED: 2,
    LOADING: 3,
    DONE: 4
};

/**
 * An XHR resposne
 * @private
 * @typedef {Object} xhrResponse
 * @property {number} status - The response status code
 * @property {string} message - The response content
 */

/**
 * @callback xhrCallback
 * @param  {xhrResponse} response - The XHR response object
 * @private
 */

/**
 * This function creates and arranges the XMLHttpRequest object
 * @param {('GET'|'POST'|'PUT'|'DELETE')} type The HTTP method
 * @param {string} url The URL to send the request 
 * @param {*} successPred The success condition
 * @param {xhrCallback} successCb A callback function to handle a successful request
 * @param {xhrCallback} passCb A callback function to handle a valid request
 * @param {xhrCallback} failureCb A callback function to handle a failed request
 * @private
 */
const xhrHandler = function (type, url, successPred, successCb, failureCb, passCb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        var callback;
        if (xhr.readyState === State.DONE) {
            let response = createResponse(xhr.status, xhr.responseText);
            if (successPred(xhr.status)) {
                callback = successCb;
            } else {
                callback = failureCb;
                if (xhr.status >= 200 && xhr.status < 300) {
                    callback = isNullOrUndefined(passCb) ? failureCb : passCb;
                }
            }
            if (isFunction(callback)) {
                callback(response);
            }
        }
    };
    xhr.open(type, url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    return xhr;
};

function createResponse(status, content) {
    return {
        status: status,
        message: content
    };
}

function isSuccess(status) {
    return [HttpResponse.OK, HttpResponse.Accepted, HttpResponse.NoContent].includes(status);
}

/**
 * Sends a GET request
 * @param {string} url The URL to send the request 
 * @param {xhrCallback} [success] A callback function to handle a successful request
 * @param {xhrCallback} [fail] A callback function to handle a failed request
 * @memberof AJAX
 */
export function GET(url, success, fail, options) {
    options = valOrDefault(options, {});
    var _successPred = options.successPred;
    const successPred = isFunction(_successPred) ? _successPred : (status) => status === HttpResponse.OK;
    var xhr = xhrHandler('GET', url, successPred, success, fail, options.pass);
    xhr.send();
}

/**
 * Sends a POST request
 * @param {string} url The URL to send the request 
 * @param {*} data The data to be sent in the request
 * @param {xhrCallback} [success] A callback function to handle a successful request
 * @param {xhrCallback} [fail] A callback function to handle a failed request
 * @memberof AJAX
 */
export function POST(url, data, success, fail, options) {
    options = valOrDefault(options, {});
    var _successPred = options.successPred;
    const successPred = isFunction(_successPred) ? _successPred : (status) => [HttpResponse.OK, HttpResponse.Created].includes(status);
    var xhr = xhrHandler('POST', url, successPred, success, fail, options.pass);
    xhr.send(data);
}

/**
 * Sends a PUT request
 * @param {string} url The URL to send the request 
 * @param {*} data The data to be sent in the request
 * @param {xhrCallback} [success] A callback function to handle a successful request
 * @param {xhrCallback} [fail] A callback function to handle a failed request
 * @memberof AJAX
 */
export function PUT(url, data, success, fail, options) {
    options = valOrDefault(options, {});
    var _successPred = options.successPred;
    const successPred = isFunction(_successPred) ? _successPred : (status) => [HttpResponse.OK, HttpResponse.NoContent].includes(status);
    var xhr = xhrHandler('PUT', url, successPred, success, fail, options.pass);
    xhr.send(data);
}

/**
 * Sends a DELETE request
 * @param {string} url The URL to send the request 
 * @param {*} data The data to be sent in the request
 * @param {xhrCallback} [success] A callback function to handle a successful request
 * @param {xhrCallback} [fail] A callback function to handle a failed request
 * @memberof AJAX
 */
export function DELETE(url, data, success, fail, options) {
    options = valOrDefault(options, {});
    var _successPred = options.successPred;
    const successPred = isFunction(_successPred) ? _successPred : (status) => [HttpResponse.OK, HttpResponse.Accepted, HttpResponse.NoContent].includes(status);
    var xhr = xhrHandler('DELETE', url, successPred, success, fail, options.pass);
    xhr.send(data);
}