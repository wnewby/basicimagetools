;

/*
 * app.browser
 *
 * simple utility for browser detection to handle a few frustrations
 */

var app = app || {};

app.browser = (function () {
    var browser = {};

    browser.isIE = _checkIE();
    browser.isChrome = _checkChrome();

    function _checkIE() {
        return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
    }

    function _checkChrome() {
        return (navigator.userAgent.toLowerCase().indexOf('chrome') > -1);
    }

    return browser;
}());