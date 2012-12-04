+function(){
    var root = this,
        document = root.document,
        readyList,
        rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        rword = /[^, ]+/g,
        class2type = {},
        core_toString = class2type.toString,
        core_slice = Array.prototype.slice,
        core_splice = Array.prototype.splice,

        _S = root.S,
        S = function(selector, context) {
            return new S.fn.init(selector, context);
        };

    S.fn = S.prototype = {
        constructor: S,
        init: function(selector, context) {
            var elems;

            if(!selector) {
                return this;
            }

            if(selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            }

            if(selector === "body" && document.body) {
                this[0] = document.body;
                this.length = 1;
                return this;
            }

            if(typeof selector === "string") {

                if( selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3 ){
                    context = context && context.nodeType ? context.ownerDocument || context : document;
                    elems = S.create( selector, context );
                }else{
                    context = context || document;
                    match = rquickExpr.exec( selector );
                    if( match && ~match[0].indexOf('#') ){
                        elem = document.getElementById( match[2] );
                        if( elem ){
                            this[0] = elem;
                            this.length = 1;
                        }
                        return this;
                    }

                    elems = S.query( selector, context );
                }

                return S.merge( elems, this );

            } else if(typeof selector === 'function') {
                return S.ready(selector);
            }

            return S.merge( selector , this );
        },
        length: 0,
        toArray: function() {
            return core_slice.call(this);
        },
        get: function(num) {
            return num == null ? this.toArray() : (num < 0 ? this[this.length + num] : this[num]);
        },
        slice: function(start, end) {
            return core_slice.call(this, start, end);
        },
        splice:core_splice
    }

    S.fn.init.prototype = S.fn;

    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,XMLHttpRequest".replace(rword, function(name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    S.extend = S.fn.extend = function(target, source) {
            var args = core_slice.call(arguments),
                key, ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
            target = target || {};
            for(var i = 1; source = args[i++];) {
                for(key in source) {
                    if(ride || !(key in target)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
    }

    S.extend(S,{
        log: function(s) {
            console && console.log(s);
        },
        noop: function() {},
        now: function() {
            return +new Date();
        },
        type: function(obj) {
            return obj == null ? String(obj) : class2type[core_toString.call(obj)] || "object";
        },
        browser: (function() {
            var ua = root.navigator.userAgent.toLowerCase(),
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
            for(var key in browser) {
                browser[key] = browser[key].test(ua);
            }
            return browser;
        })(),
        exports: function(name) {
            root.S = _S;
            name && (root[name] = S);
            return S;
        },
        merge: function(first, second) {
            var l = second.length,
                i = first.length,
                j = 0;

            if(typeof l === "number") {
                for(; j < l; j++) {
                    first[i++] = second[j];
                }
            } else {
                while(second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        }
      
    });


    (function(S){
        var ref = function(value) {
            if(value && typeof value.then === "function") return value;
            return {
                then: function(callback) {
                    return ref(callback(value));
                }
            };
        };
        var reject = function(reason) {
            return {
                then: function(callback, errback) {
                    return ref(errback(reason));
                }
            };
        };
        var Promise = function() {
            var pending = [],
                value,
                promise = {
                    resolve: function(_value) {
                        if(pending) {
                            value = ref(_value);
                            for(var i = 0, ii = pending.length; i < ii; i++) {
                                value.then.apply(value, pending[i]);
                            }
                            pending = undefined;
                        }
                    },
                    reject: function(_value) {
                        this.resolve(reject(_value));
                    }
                };

            promise.promise = {
                then: function(_callback, _errback) {
                    var result = Promise();
                    _callback = _callback ||
                    function(value) {
                        return value;
                    };
                    _errback = _errback ||
                    function(reason) {
                        return reject(reason);
                    };
                    var callback = function(value) {
                            result.resolve(_callback(value) || value);
                        };
                    var errback = function(reason) {
                            result.reject(_errback(reason) || reason);
                        };
                    if(pending) {
                        pending.push([callback, errback]);
                    } else {
                        value.then(callback, errback);
                    }
                    return result.promise;
                },
                done: function(_callback) {
                    return this.then(_callback, null);
                },
                fail: function(_errback) {
                    return this.then(null, _errback);
                },
                always: function(fn) {
                    return this.done(fn).fail(fn);
                }
            }

            return promise;
        };

        S.Deferred=Promise;

    })(S);

    S.extend(S, {
        isReady: false,
        ready: function(fn){
            S.ready.promise().done(fn);
        },
        fireReady: function() {
            if(S.isReady) return;
            S.isReady = true;
            readyList.resolve();
            S.fireReady = S.noop;
        }
    });

    S.ready.promise=function(){
        if (!readyList ){
            readyList = S.Deferred();
            if(document.readyState === "complete") {
                setTimeout(S.fireReady, 1 );
            } else if(document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function() {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    S.fireReady();
                }, false);
            } else if(document.attachEvent) {
                document.attachEvent("onreadystatechange", function() {
                    if(document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        S.fireReady();
                    }
                });

                var top = false;
                try {
                    top = window.frameElement == null && document.documentElement;
                } catch(e) {}

                if(top && top.doScroll) {
                    (function doScrollCheck() {
                        if(!S.isReady) {
                            try {
                                // http://javascript.nwbox.com/IEContentLoaded/
                                top.doScroll("left");
                            } catch(e) {
                                return setTimeout(doScrollCheck, 50);
                            }
                            S.fireReady();
                        }
                    })();
                }
            }
        }
        return readyList.promise;
    }

    root.S = S;
    !root.$ && (root.$ = S);
}();