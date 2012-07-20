(function() {
    var root = this,
        document = root.document,
        w3c = document.dispatchEvent,       //w3c事件模型
        HEAD = document.head || document.getElementsByTagName("head")[0],
        class2type = {},
        quickID = /#([\w\-]+)$/,
        quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$)/,
        rtrim = /(^\s*)|(\s*$)/g,

        core_slice = Array.prototype.slice,
        core_trim = String.prototype.trim,
        core_toString = Object.prototype.toString,

        SPACE = ' ',
        ANY = '*',

    _S = root.S,
     S = function(selector, context) {
         return new S.fn.init(selector, context);
     };


    function tuneContext(context) {
        // 1). context 为 undefined 是最常见的情况，优先考虑
        if (context === undefined) {
            context = document;
        }
        // 2). context 的第二使用场景是传入 #id
        else if (S.isString(context) && quickID.test(context)) {
            context = getElementById(context.slice(1), document);
            // 注：#id 可能无效，这时获取的 context 为 null
        }
        // 3). context 还可以传入 HTMLElement, 此时无需处理
        // 4). 经历 1 - 3, 如果 context 还不是 HTMLElement, 赋值为 null
        else if (context && context.nodeType !== 1 && context.nodeType !== 9) {
            context = null;
        }
        return context;
    }

    // query #id
    function getElementById(id, context) {
        if (context.nodeType !== 9) {
            context = context.ownerDocument;
        }
        return context.getElementById(id);
    }
    // query tag
    function getElementsByTagName(tag, context) {
        return context.getElementsByTagName(tag);
    }
    // query .cls
    function getElementsByClassName(cls, tag, context) {
        var els = context.getElementsByClassName(cls),
            ret = els, i = 0, j = 0, len = els.length, el;

        if (tag && tag !== ANY) {
            ret = [];
            tag = tag.toUpperCase();
            for (; i < len; ++i) {
                el = els[i];
                if (el.tagName === tag) {
                    ret[j++] = el;
                }
            }
        }
        return ret;
    }
    if (!document.getElementsByClassName) {
        // 降级使用 querySelectorAll
        if (document.querySelectorAll) {
            getElementsByClassName = function(cls, tag, context) {
                return context.querySelectorAll((tag ? tag : '') + '.' + cls);
            }
        }
        // 降级到普通方法
        else {
            getElementsByClassName = function(cls, tag, context) {
                var els = context.getElementsByTagName(tag || ANY),
                    ret = [], i = 0, j = 0, len = els.length, el, t;

                cls = SPACE + cls + SPACE;
                for (; i < len; ++i) {
                    el = els[i];
                    t = el.className;
                    if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                        ret[j++] = el;
                    }
                }
                return ret;
            }
        }
    }


    S.fn = S.prototype = {
        constructor: S,
        init: function(selector, context) {
            var match, elem, id, tag, cls, ret = [],

                context = tuneContext(context);

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

                if (quickID.test(selector)) {
                    elem = getElementById(selector.slice(1), context);
                    if (elem) {
                        this.length = 1;
                        this[0] = elem;
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
                } else if (match = quickExpr.exec(selector)) {

                    if (match) {
                        if (match[1]) {
                            //new str
                        } else {
                            id = match[2];
                            tag = match[3];
                            cls = match[4];

                            if ((context = id ? getElementById(id, context) : context)) {
                                // #id .cls | #id tag.cls | .cls | tag.cls
                                if (cls) {
                                    if (!id || selector.indexOf(SPACE) !== -1) { // 排除 #id.cls
                                        ret = getElementsByClassName(cls, tag, context);
                                    }
                                    // 处理 #id.cls
                                    else {
                                        elem = getElementById(id, context);
                                        if (elem && S.hasClass(elem, cls)) {
                                            ret = [elem];
                                        }
                                    }
                                }
                                // #id tag | tag
                                else if (tag) { // 排除空白字符串
                                    ret = getElementsByTagName(tag, context);
                                }
                            }

                        }
                    }

                }

            } else if (S.isFunction(selector)) {
                return S.ready(selector);
            }

            return ret;
        },
        length: 0,
        toArray: function() {
            return core_slice.call(this);
        },
        get: function(num) {
            return num == null ? this.toArray() :
            (num < 0 ? this[this.length + num] : this[num]);
        },
        trim: core_trim ? function(string) {
            return string.trim();
        } : function(string) {
            return string.replace(rtrim, '');
        }
    }

    S.fn.init.prototype = S.fn;

    S.version = "0.1.1";

    "Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,XMLHttpRequest".replace(/[^,]+/g, function(name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

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

    var each = S.each = S.fn.each = function(object, callback) {
        var i = 0,
            length,
            name;

        if (S.isFunction(object)) {
            callback = object;
            object = this;
        }

        length = object.length;

        if (length) {
            for (; i < length; i++) {
                callback.call(object[i], i, object[i]);
            }
        } else {
            for (name in object) {
                callback.call(object[name], name, object[name]);
            }
        }
        return object;
    }

    extend(S, {
        log: function(s) {
            console && console.log(s);
        },
        noop: function() { },
        type: function(obj) {
            return obj == null ? String(obj) : class2type[core_toString.call(obj)] || "object";
        },
        isString: function(obj) {
            return S.type(obj) == 'string';
        },
        isFunction: function(obj) {
            return S.type(obj) === "function";
        },
        isArray: Array.isArray || function(obj) {
            return S.type(obj) === "array";
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
        exports: function(name) {
            root.S = _S;
            name && (root[name] = S);
            return S;
        }
    });

    if (!root.JSON) {
        root.JSON = {
            parse: function(data) {
                return (new Function("return " + data))();
            }
        }
    }
    //----------

    //========support
    S.support = (function() {
        var support,
        all,
        a,
        fragment,
        eventName,
        i,
        isSupported,
        clickFn,
        div = document.createElement("div");
        // Preliminary tests
        div.setAttribute("className", "t");
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

        all = div.getElementsByTagName("*");
        a = div.getElementsByTagName("a")[0];
        a.style.cssText = "top:1px;float:left;opacity:.5";

        // Can't get basic test support
        if (!all || !all.length || !a) {
            return {};
        }
        support = {
            style: /top/.test(a.getAttribute("style")),
            hrefNormalized: (a.getAttribute("href") === "/a"),
            opacity: /^0.5/.test(a.style.opacity),
            cssFloat: !!a.style.cssFloat,
            getSetAttribute: div.className !== "t"
        }

        return support;
    })();

    //----------

    //===Attr
    extend(S.fn, {
        attr: function(name, value) {
            this.each(function() {
                if (name in this) {
                    if (value) {
                        this.name = value
                    } else {
                        if (S.support.hrefNormalized)
                            return this.name;
                        else
                            return this.getAttribute(name, 2);
                    }
                } else {
                    return value ? (this.setAttribute(name, value)) : (this.getAttribute(name));
                }
            });
        }
    });

    //---------

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
    !root.$ && (root.$ = S);

})();