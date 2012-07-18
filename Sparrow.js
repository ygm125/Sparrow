(function() {
    var root = this,
        document = root.document,
        w3c = document.dispatchEvent,       //w3c事件模型
        HEAD = document.head || document.getElementsByTagName("head")[0],
        class2type = {},
        toString = Object.prototype.toString,
        quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/;

    var _S = root.S,
         S = function(selector, context) {
             return new S.fn.init(selector, context);
         };

    S.fn = S.prototype = {
        init: function(selector, context) {
            var match, elem;

            if (!selector) {
                return this;
            }
            // Handle $(DOMElement)
            if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }
            // The body element only exists once, optimize finding it
            if (selector === "body" && document.body) {
                this.context = document;
                this[0] = document.body;
                this.selector = "body";
                this.length = 1;
                return this;
            }

            if (typeof selector === "string") {
                match = quickExpr.exec(selector);
                if (match) {
                    if (match[1]) {
                    } else {
                        elem = document.getElementById(match[2]);
                        this.length = 1;
                        this[0] = elem;
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
                }

            } else if (S.isFunction(selector)) {
                return S.ready(selector);
            }

        },
        length: 0,
        version: "v0.1"
    }

    //=====Base
    var extend = S.extend = S.fn.extend = function(target, source) {
        var args = [].slice.call(arguments), key,
                ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
        target = target || {};
        for (var i = 1; source = args[i++]; ) {
            for (key in source) {
                if (ride || !(key in target)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,XMLHttpRequest".replace(/[^,]+/g, function(name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    extend(S, {
        noop: function() { },
        type: function(obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
        },
        isFunction: function(obj) {
            return S.type(obj) === "function";
        },
        isArray: Array.isArray || function(obj) {
            return S.type(obj) === "array";
        },
        isWindow: function(obj) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        },
        on: w3c ? function(el, type, fn, phase) {
            el.addEventListener(type, fn, !!phase);
            return fn;
        } : function(el, type, fn) {
            el.attachEvent && el.attachEvent("on" + type, fn);
            return fn;
        },
        off: w3c ? function(el, type, fn, phase) {
            el.removeEventListener(type, fn || S.noop, !!phase);
        } : function(el, type, fn) {
            if (el.detachEvent) {
                el.detachEvent("on" + type, fn || S.noop);
            }
        },
        deferred: function() {//一个简单的异步列队
            var list = [], self = function(fn) {
                fn && fn.call && list.push(fn);
                return self;
            }
            self.fire = function(fn) {
                list = self.reuse ? list.concat() : list
                while (fn = list.shift()) {
                    fn();
                }
                return list.length ? self : self.complete();
            }
            self.complete = S.noop;
            return self;
        },
        browser: (function() {
            var ua = navigator.userAgent.toLowerCase(),
            browser = {
                msie: /msie/,
                msie6: /msie 6\.0/,
                msie7: /msie 7\.0/,
                msie8: /msie 8\.0/,
                msie9: /msie 9\.0/,
                msie10: /msie 10\.0/,
                firefox: /firefox/,
                opera: /opera/,
                webkit: /webkit/,
                iPad: /ipad/,
                iPhone: /iphone/,
                android: /android/
            };
            for (var key in browser) {
                browser[key] = browser[key].test(ua);
            }
            return browser;
        })(),
        each: function(object, callback) {
            var i = 0,
            length = object.length,
            name;
            if (length) {
                for (; i < length; i++) {
                    callback.call(object[i], i, object[i]);
                }
            }else {
                for (name in object) {
                    callback.call(object[name], name, object[name]);
                }
            }
            return object;
        },
        exports: function(name) {
            root.S = _S;
            name && (root[name] = S);
            return S;
        }
    });
    //----------

    //===domReady
    extend(S, {
        isReady: false,
        ready: S.deferred(),
        fireReady: function() {
            if (S.isReady) return;
            S.isReady = true;
            S.ready.fire();
            S.fireReady = S.noop;
        }
    });

    if (document.readyState === "complete") {
        S.fireReady();
    } else if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function() {
            document.removeEventListener("DOMContentLoaded", arguments.callee, false);
            S.fireReady();
        }, false);
    } else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", function() {
            if (document.readyState === "complete") {
                document.detachEvent("onreadystatechange", arguments.callee);
                S.fireReady();
            }
        });

        var top = false;
        try {
            top = window.frameElement == null && document.documentElement;
        } catch (e) { }

        if (top && top.doScroll) {
            (function doScrollCheck() {
                if (!S.isReady) {
                    try {
                        // http://javascript.nwbox.com/IEContentLoaded/
                        top.doScroll("left");
                    } catch (e) {
                        return setTimeout(doScrollCheck, 50);
                    }
                    S.fireReady();
                }
            })();
        }
    }
    //----------------------------------

    root.S = S;

})();