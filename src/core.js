/*
* ===========================================================
* 核心模块一般不依赖任何模块
* 只有在复杂选择器或dom元素创建时依赖selector或node模块
* ===========================================================
*/
+function(){
    var root = this,
        document = root.document,
        readyList,
        rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
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

    S.rword = /[^, ]+/g;

    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,XMLHttpRequest".replace(S.rword, function(name) {
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

    S.each = S.fn.each = function(object, callback) {
            var i = 0,
                length, name;
            if(typeof object === 'function') {
                callback = object;
                object = this;
            }
            length = object.length;
            if(length) {
                for(; i < length; i++) {
                    if(callback.call(object[i], i, object[i], object) === false) {
                        break;
                    }
                }
            } else {
                for(name in object) {
                    if(callback.call(object[name], name, object[name], object) === false) {
                        break;
                    }
                }
            }
            return object;
    }

    S.extend(S,{
        log: function(s) {
            console && console.log(s);
        },
        guid : function( pre ){
            return ( pre || 'S_' ) + 
                ( +new Date() ) + 
                ( Math.random() + '' ).slice( -8 );
        },
        uuid:0,
        noop: function() {},
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
        },
        access: function(elems, fn, key, value, chainable) {
            if(typeof key === "object") {
                for(var i in key) {
                    S.access(elems, fn, i, key[i], 1);
                }
                return elems;
            } else {
                if(value) {
                    elems.each(function() {
                        return fn(this, key, value);
                    });
                    if(!chainable) {
                        return elems;
                    }
                } else {
                    return fn(elems[0], key);
                }
            }
        }
    })

    S.expando = S.guid();

    void function(){
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

    }();

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
                //window.addEventListener( 'load', S.fireReady, false );
            } else if(document.attachEvent) {
                document.attachEvent("onreadystatechange", function() {
                    if(document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        S.fireReady();
                    }
                });
                //window.attachEvent( 'onload', S.fireReady );
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

    S.when = function(promises, operate) {
        var promise = S.Deferred(),
            len = promises.length,
            result = [],
            gloBraker = false;

        if(!len) {
            promise.resolve(promises);
            return promise.promise;
        }

        operate = operate || 'ALL';

        S.each(promises, function(i, v) {
            v.then(function(res) {
                d(i, res);
            }, function(err) {
                d(i, err, 'err');
            });
        });

        function d(key, value, state) {
            if(gloBraker) return;
            if('err' === state) {
                gloBraker = true;
                promise.reject({
                    'err': value,
                    'errNum': key
                });
            } else {
                result[key] = value;
                if(operate === 'ALL' && --len === 0) {
                    promise.resolve(result);
                }
                if(operate === 'ANY') {
                    gloBraker = true;
                    promise.resolve(result);
                }
            }
        }
        return promise.promise;
    }

    S.whenAll = function(promises) {
        return S.when(promises, 'ALL');
    }

    S.whenAny = function(promises) {
        return S.when(promises, 'ANY');
    }

    void function(){
        var modules = {},
            returns = [];
            head = document.head || document.getElementsByTagName("head")[0],
            load= function(url, options) {
                var promise = S.Deferred();
                /.js$/.test(url) ? "" : (url += '.js');
                if(url in modules) {
                    (function doCheck() {
                        if(modules[url]['state'] === 2) {
                            promise.resolve(modules[url]['rtn']);
                        } else {
                            setTimeout(doCheck, 20);
                        }
                    })();
                    return promise.promise;
                }
                modules[url] = {
                    'state': 1
                };
                options = options || {};

                var jc = document.createElement('script');
                jc.src = url;
                jc.async = true;
                if(options.charset) {
                    jc.charset = options.charset;
                }
                jc.onerror = jc.onload = jc.onreadystatechange = function() {
                    if(!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {

                        var obj = returns.shift(),
                            deps = obj.deps,
                            callback = obj.callback;
                        S.require(url, deps, callback, promise);

                        jc.onerror = jc.onload = jc.onreadystatechange = null;
                        head.removeChild(jc);
                    }
                };
                head.insertBefore(jc, head.firstChild);
                return promise.promise;
            },
            loadAll=function(arr){
                    S.each(arr,function(i,v){
                            arr[i]=load(v);
                    });
                    return S.whenAll(arr);
            };

        root.require = S.require = function(name, deps, callback, promise) {
            if(typeof deps === "function") {
                callback = deps;
                deps = [];
            }
            /.js$/.test(name) ? "" : (name += '.js');
            if(S.type(deps) === "array" && deps.length) {
                loadAll(deps).then(function(res) {
                    if(promise) {
                        modules[name]['state'] = 2;
                        promise.resolve(modules[name]['rtn'] = callback.apply(S, res));
                    } else {
                        load(name).then(function(o) {
                            res.unshift(o);
                            callback.apply(S, res)
                        });
                    }
                });
            } else {
                if(modules[name]) {
                    modules[name]['rtn'] = callback.call(S);
                    modules[name]['state'] = 2;
                    if(promise) {
                        promise.resolve(modules[name]['rtn']);
                    }
                } else {
                    load(name).then(function(o) {
                        callback.call(S, o);
                    });
                }
            }
        };

        root.define = S.define = function(deps, callback) {
            if(typeof deps === "function") {
                callback = deps;
                deps = [];
            }
            returns.unshift({
                'deps': deps,
                'callback': callback
            });
        };


    }();
     

    root.S = S;
    !root.$ && (root.$ = S);
}();