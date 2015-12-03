
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define("appChecker", factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root["appChecker"] = factory(root);
    }
})(window || this, function (root) {

    "use strict";

    if (!root.document || !root.navigator) {
        return;
    }

    var timeout = null;

    var defaults = {
        IOS: {},
        android: {},
        delay: 1000,
        delta: 500,
        drawModal: drawModal
    }

    var extend = function (defaults, options) {
        var extended = {};
        for (var key in defaults) {
            extended[key] = defaults[key];
        };
        for (var key in options) {
            extended[key] = options[key];
        };
        return extended;
    };

    var setup = function (options) {
        settings = extend(defaults, options);
    }

    var isAndroid = function () {
        return navigator.userAgent.match('Android');
    }

    var isIOS = function () {
        return navigator.userAgent.match(/iPad|iPhone|iPod/);
    }

    var isMobile = function () {
        return isAndroid() || isIOS();
    }

    //get uri schema
    var getUri = function () {
        if (isAndroid()) {

            var uri = settings.Android.uri;
            if (isAndroid() && !navigator.userAgent.match(/Firefox/)) {
                var matches = uri.match(/([^:]+):\/\/(.+)$/i);
                uri = "intent://" + matches[2] + "#Intent;scheme=" + matches[1];
                uri += ";package=" + settings.Android.appId + ";end";
            }
            return uri;
        }

        return settings.IOS.uri;
    }

    var getStoreUrlIOS = function () {
        var baseUrl = "itms-apps://itunes.apple.com/app/";
        var name = settings.IOS.appName;
        var id = settings.IOS.appId;
        return (id && name) ? (baseUrl + name + "/id" + id + "?mt=8") : null;
    }

    var getStoreURLAndroid = function () {
        var baseurl = "market://details?id=";
        var id = settings.Android.appId;
        return id ? (baseurl + id) : null;
    }

    var getStoreLink = function () {
        if (isAndroid())
            return getStoreURLAndroid();

        return getStoreUrlIOS();
    }

    //get ios data using jsonp
    var $jsonp = (function () {
        var that = {};

        that.send = function (src, options) {
            options = options || {};
            var callbackName = options.callbackName || 'callback',
                onSuccess = options.onSuccess || function () { },
                onTimeout = options.onTimeout || function () { },
                timeout = options.timeout || 5;

            var timeoutTrigger = window.setTimeout(function () {
                window[callbackName] = function () { };
                onTimeout();
            }, timeout * 1000);

            window[callbackName] = function (data) {
                window.clearTimeout(timeoutTrigger);
                onSuccess(data);
            };

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = src;

            document.getElementsByTagName('head')[0].appendChild(script);
        };

        return that;
    })();

    //create modal
    var drawModal = function (app) {
        var rating = '';
        debugger;
        for (var i = 1; i <= 5; i++)
            rating += '<span>' + (i <= app.rating ? '★' : '☆') + '</span>';

        var template = [
            '<div>',
            '<a href="#close" title="Close" class="close">X</a>',
            '<div class="block-main-info">',
            '<div class="left">',
            '<img src="' + app.img + '" />',
            '</div>',
            '<div class="right">',
            '<h2>' + app.name + '</h2>',
            '<div class="rating">',
            rating,
            '</div>',
            '<div class="company">',
            '<h5>' + app.price + '</h5>',
            '<h5>' + app.company + '</h5>',
            '</div>',
            '</div>',
            '</div>',
            '<div style="clear: both"></div>',
            '<div class="block-description">',
            '<p>' + app.description + '</p>',
            ' </div>',
            '<div class="block-footer">',
            '<hr />',
            '<button onclick="window.location.href=\'' + getStoreLink() + '\';">Перейти</button>',
            '</div>',
            '</div>'
        ].join('');

        var modal = document.createElement('div');
        modal.className = "app-checker";
        modal.id = "openModal";
        modal.innerHTML = template;
        document.body.appendChild(modal);

        window.location.href = '#' + modal.id;
    }

    //set data to modal window
    var setData = function (data) {
        var app = {};

        if (isAndroid()) {
            app = data;
        }

        if (isIOS()) {
            data = data.results[0];
            app = {
                name: data.trackCensoredName,
                description: data.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
                img: data.artworkUrl60,
                rating: Math.round(data.averageUserRating),
                price: data.formattedPrice,
                company: data.artistName
            };
        }

        drawModal(app);
    }

    //get ios app data using jsonp
    var getAppInfoIOS = function () {
        var baseUrl = 'https://itunes.apple.com/lookup';
        var callback = 'appCheckerCallback';
        var id = settings.IOS.appId;
        var url = baseUrl + '?id=' + id + '&callback=' + callback;

        $jsonp.send(url, {
            callbackName: callback,
            onSuccess: function (json) {
                setData(json);
            },
            onTimeout: function () {
                console.log('timeout!');
            },
            timeout: 3
        });
    }


    var openModal = function (callTime) {

        var wait = settings.delay + settings.delta;

        if (Date.now() - callTime >= wait) {
            // iframe.onload not fired
            return;
        }

        if (isAndroid()) {
            var data = settings.Android.info;
            var app = {
                name: data.name,
                description: data.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
                img: data.img,
                rating: data.rating,
                price: data.price,
                company: data.company
            };
            setData(app);
        }

        if (isIOS()) {
            getAppInfoIOS();
        }

    }

    var isOpera = function () {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    }

    var isFirefox = function () {
        return typeof InstallTrigger !== 'undefined';
    }

    var run = function () {
        if (!isMobile()) {
            return;
        }

        //check? if schema doesn't use, show modal or redirect to store
        timeout = setTimeout(openModal, settings.delay, Date.now());

        var iframe = document.createElement("iframe");

        iframe.style.border = "none";
        iframe.style.display = 'none';
        iframe.style.width = "1px";
        iframe.style.height = "1px";

        document.body.appendChild(iframe);
        iframe.onload = function () {
            clearTimeout(timeout);
            iframe.parentNode.removeChild(iframe);

            if (isAndroid()) {
                if (isOpera || isFirefox) return;
            }

            window.location.href = getUri();
        };
        iframe.src = getUri();
    }


    // Public API
    return {
        setup: setup,
        run: run
    };
});

function appCheckerCallback() { }