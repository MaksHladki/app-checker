; function AppChecker(options) {
    "use strict";
    var timeout = null;

    var defaults = {
        IOS: {},
        android: {},
        delay: 1000,
        delta: 500,
        modal: {
            container: {
                id: 'app-checker_container'
            },
            loader: {
                id: 'app-checker_loader'
            },
            close: {
                id: 'app-checker_close'
            }
        }
    };

    var settings = setOptions(defaults, options);

    function setOptions(defaults, options) {
        var extended = {};
        for (var key in defaults) {
            extended[key] = defaults[key];
        };
        for (var key in options) {
            extended[key] = options[key];
        };
        return extended;
    };

    function isAndroid() {
        return navigator.userAgent.match('Android');
    }

    function isIOS() {
        return navigator.userAgent.match(/iPad|iPhone|iPod/);
    }

    function isMobile() {
        return isAndroid() || isIOS();
    }

    function isOpera() {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    }

    function isFirefox() {
        return typeof InstallTrigger !== 'undefined';
    }

    //get uri schema
    function getUri() {
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

    function getStoreUrlIOS() {
        var baseUrl = "itms-apps://itunes.apple.com/app/";
        var name = settings.IOS.appName;
        var id = settings.IOS.appId;
        return (id && name) ? (baseUrl + name + "/id" + id + "?mt=8") : null;
    }

    function getStoreURLAndroid() {
        var baseurl = "market://details?id=";
        var id = settings.Android.appId;
        return id ? (baseurl + id) : null;
    }

    function getStoreLink() {
        if (isAndroid())
            return getStoreURLAndroid();
        return getStoreUrlIOS();
    }


    /*
    * jsonp module
    */
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


    /*
    * Loader  module  
    */
    var $loader = (function (modal) {
        var cSpeed = 10;
        var cWidth = 64;
        var cHeight = 64;
        var cTotalFrames = 12;
        var cFrameWidth = 64;
        var cImageSrc = 'data:image/png;base64,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';
        var cImageTimeout = false;
        var cIndex = 0;
        var cXpos = 0;
        var cPreloaderTimeout = false;
        var SECONDS_BETWEEN_FRAMES = 0;

        function startAnimation() {
            document.getElementById(modal.loader.id).style.backgroundImage = 'url(' + cImageSrc + ')';
            document.getElementById(modal.loader.id).style.width = cWidth + 'px';
            document.getElementById(modal.loader.id).style.height = cHeight + 'px';

            var fps = Math.round(100 / cSpeed);
            SECONDS_BETWEEN_FRAMES = 1 / fps;

            cPreloaderTimeout = setTimeout(continueAnimation, SECONDS_BETWEEN_FRAMES / 1000);
        }

        function continueAnimation() {
            cXpos += cFrameWidth;
            cIndex += 1;

            if (cIndex >= cTotalFrames) {
                cXpos = 0;
                cIndex = 0;
            }

            if (document.getElementById(modal.loader.id))
                document.getElementById(modal.loader.id).style.backgroundPosition = (-cXpos) + 'px 0';

            cPreloaderTimeout = setTimeout(continueAnimation, SECONDS_BETWEEN_FRAMES * 1000);
        }

        function stopAnimation() {
            clearTimeout(cPreloaderTimeout);
            cPreloaderTimeout = false;
        }

        function imageLoader(s, fun) {
            clearTimeout(cImageTimeout);
            cImageTimeout = 0;
            var genImage = new Image();
            genImage.onload = function () { cImageTimeout = setTimeout(fun, 0) };
            genImage.onerror = new Function('alert(\'Could not load the image\')');
            genImage.src = s;
        }

        function initLoader() {
            new imageLoader(cImageSrc, startAnimation);
        }

        return {
            stop: stopAnimation,
            start: initLoader
        };

    })(settings.modal);


    /*
    * Show loader and modal window
    */
    var $modal = (function (modal) {
        var that = {};

        var createContainer = function () {
            var container = document.createElement('div');
            container.className = 'app-checker';
            container.id = modal.container.id;
            document.body.appendChild(container);
            return container;
        };

        var getContainer = function () {
            var container = document.getElementById(modal.container.id);
            if (!container)
                container = createContainer();
            return container;
        };

        var removeElementById = function (id) {
            var element = document.getElementById(id);
            if (element)
                element.parentNode.removeChild(element);
        };

        var removeContainer = function () {
            removeElementById(modal.container.id);
            $loader.stop();
        };

        var removeLoader = function () {
            removeElementById(modal.loader.id);
            $loader.stop();
        };

        that.removeContainer = removeContainer;

        that.createModal = function (app) {
            var container = getContainer();

            var rating = '';
            for (var i = 1; i <= 5; i++)
                rating += '<span>' + (i <= app.rating ? '★' : '☆') + '</span>';

            var template = [
                '<div class="app-checker_modal">',
                '<a class="app-checker_close" id="' + modal.close.id + '">X</a>',
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

            container.innerHTML = template;

            var closeBtn = document.getElementById(modal.close.id);
            if (!closeBtn) return;

            closeBtn.addEventListener('click', function (e) {
                removeContainer();
            });
        }

        that.createLoader = function () {
            var container = getContainer();

            var loader = document.createElement('div');
            loader.id = modal.loader.id;
            loader.className = 'app-checker_loader';
            container.appendChild(loader);

            $loader.start();//start animation
        };

        return that;

    })(settings.modal);

    //set data to modal window
    function setData(data) {
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

        $modal.createModal(app);
    }

    //get ios app data using jsonp
    function getAppInfoIOS() {
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

    function openModal(callTime) {
        var wait = settings.delay + settings.delta;

        // iframe.onload not fired
        if (Date.now() - callTime >= wait) {
            $modal.removeContainer();
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



    var run = function () {
        if (!isMobile()) return;

        $modal.createLoader();//show loader

        //if schema doesn't use, show modal or redirect to store
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
            $modal.removeContainer();

            if (isAndroid()) {
                if (isOpera || isFirefox) return;
            }

            window.location.href = getUri();
        };
        iframe.src = getUri();
    }

    return run();
};

function appCheckerCallback() { };