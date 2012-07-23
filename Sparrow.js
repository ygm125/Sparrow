(function() {
    var root = this,
        document = root.document,
        w3c = document.dispatchEvent,       //w3c事件模型
        HEAD = document.head || document.getElementsByTagName("head")[0],
        class2type = {},
        quickID = /#([\w\-]+)$/,
        quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$)/,
        rtrim = /(^\s*)|(\s*$)/g,
        rcamelCase = /-([a-z])/ig,

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
        if (context === undefined) {
            context = document;
        }else if (S.isString(context) && quickID.test(context)) {
            context = getElementById(context.slice(1), document);
        }else if(context instanceof S){
            context=context[0];
        }else if (context && context.nodeType !== 1 && context.nodeType !== 9) {
            context = null;
        }
        return context;
    }

    function getElementById(id, context) {
        if (context.nodeType !== 9) {
            context = context.ownerDocument;
        }
        return context.getElementById(id);
    }

    function getElementsByTagName(tag, context) {
        return context.getElementsByTagName(tag);
    }

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
        if (document.querySelectorAll) {
            getElementsByClassName = function(cls, tag, context) {
                return context.querySelectorAll((tag ? tag : '') + '.' + cls);
            }
        }else {
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
            var match, elem, id, tag, cls, ret,
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
                           selector= S.buildFragment(selector).childNodes;
                        } else {
                            id = match[2];
                            tag = match[3];
                            cls = match[4];

                            if ((context = id ? getElementById(id, context) : context)) {
                                if (cls) {
                                    if (!id || selector.indexOf(SPACE) !== -1) {
                                        ret = getElementsByClassName(cls, tag, context);
                                    }else {
                                        elem = getElementById(id, context);
                                        if (elem && S.hasClass(elem, cls)) {
                                            ret = [elem];
                                        }
                                    }
                                }else if (tag) {
                                    ret = getElementsByTagName(tag, context);
                                }
                            }

                        }
                    }
                }

            } else if (S.isFunction(selector)) {
                return S.ready(selector);
            }
            return S.merge(this, ret || selector);
        },
        length: 0,
        toArray: function() {
            return core_slice.call(this);
        },
        get: function(num) {
            return num == null ? this.toArray() :
            (num < 0 ? this[this.length + num] : this[num]);
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
               if(callback.call(object[i], i, object[i])===false){
                  break;
               }
            }
        } else {
            for (name in object) {
               if(callback.call(object[name], name, object[name])===false){
                  break;
               }
            }
        }
        return object;
    }

    S.trim = S.fn.trim = core_trim ? function(string) {
            return string.trim();
        } : function(string) {
            return string.replace(rtrim, '');
    }

    extend(S, {
        log: function(s) {
            console && console.log(s);
        },
        camelCase: function (string){
            return string.replace('-ms-', 'ms-').replace(rcamelCase, function (match, letter){
                return (letter + '').toUpperCase();
            });
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
        deferred: function() {
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
        },
        merge: function( first, second ) {
            var l = second.length,
                i = first.length,
                j = 0;

            if ( typeof l === "number" ) {
                for ( ; j < l; j++ ) {
                    first[ i++ ] = second[ j ];
                }
            } else {
                while ( second[j] !== undefined ) {
                    first[ i++ ] = second[ j++ ];
                }
            }
            first.length = i;
            return first;
        },
        buildFragment: function (node)
        {
            var type = typeof node;
            if (type === 'string')
            {
                var fragment = document.createDocumentFragment(),
                    div = document.createElement("div"),
                    ret = [];

                div.innerHTML = node;
                while (div.childNodes[0] != null)
                {
                    fragment.appendChild(div.childNodes[0]);
                }
                node = fragment;
                //Release  memory
                div = null;
            }
            if (type === 'number')
            {
                node += '';
            }
            return node;
        },
        attr:function(el, attribute, value) {
            if ('object' === typeof attribute) {
                for (var prop in attribute) {
                    S.attr(el, prop, attribute[prop]);
                }
            }else{
                if(value){
                    if (attribute in el) {
                        el[attribute] = value;
                    } else {
                        el.setAttribute(attribute, value);
                    }
                }else{
                    if ((attribute in el) && 'href' != attribute) {
                        return el[attribute];
                    } else {
                        return el.getAttribute(attribute, S.support.hrefNormalized ? 2 : null);
                    }
                }
            }
        },
        removeAttr: function (elem, name){
            elem.removeAttribute(name);
        },
        setCss:function (elem, name, value){
            if (name === 'opacity' && !S.support.opacity){
                elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
            }else if(name == "float"){
                elem.style[ S.support.cssFloat ? "cssFloat" : "styleFloat" ] = value;
            }else{
                elem.style[S.camelCase(name)] = value;
            }
        },
        getCss: window.getComputedStyle ?
            function (elem, name)
            {
               return document.defaultView.getComputedStyle(elem, null).getPropertyValue( name );
            } :
            function (elem, name)
            {
                if (name === 'width' && elem.currentStyle['width'] === 'auto') {
                    return elem.offsetWidth;
                }
                if (name === 'height' && elem.currentStyle['height'] === 'auto'){
                    return elem.offsetHeight;
                }
                if(name == "float"){
                    return elem.currentStyle['styleFloat'];
                }
                return elem.currentStyle[S.camelCase(name)];
        }

    });

    if (!root.JSON) {
        S.JSON = {
            parse: function(data) {
                return (new Function("return " + data))();
            },
            stringify: function (vContent) { 
              if (vContent instanceof Object) { 
                var sOutput = ""; 
                if (vContent.constructor === Array) { 
                  for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++); 
                  return "[" + sOutput.substr(0, sOutput.length - 1) + "]"; 
                } 
                if (vContent.toString !== Object.prototype.toString) { return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\""; } 
                for (var sProp in vContent) { sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ","; } 
                return "{" + sOutput.substr(0, sOutput.length - 1) + "}"; 
              } 
              return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent); 
            } 
        }
    }else{
        S.JSON = root.JSON;
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
            if(value){
                return this.each(function() {
                    S.attr(this,name,value);
                });
            }else{
                return S.attr(this[0],name);
            }
        },
        removeAttr: function(name) {
            return this.each(function() {
                S.removeAttr(this, name);
            });
        },
        val:function(value){
            if(value){
                return this.each(function() {
                    this.value=value;
                });
            }else{
                return this[0].value;
            }
        },
        addClass: function(name) {
            return this.each(function() {
                var classNames = name.split(SPACE),
                           ori = SPACE + this.className + SPACE,
                           rm;
                while(rm = classNames.shift()){
                    if (ori.indexOf(SPACE + rm + SPACE) === -1) {
                        ori += rm + SPACE;
                    }
                }
                this.className = S.trim(ori);
            });
        },
        removeClass: function (name)
        {
            return this.each(function() {
                if(name){
                    var classNames = name.split(SPACE),
                               ori = SPACE + this.className + SPACE,
                               rm;
                    while(rm = classNames.shift()){
                        ori=ori.replace(SPACE+rm+SPACE,SPACE);
                    }
                    this.className=S.trim(ori);
                }else {
                    this.className = '';
                }
            });
        },
        hasClass: function(selector) {
            return (SPACE+this[0].className+SPACE).indexOf(SPACE+selector+SPACE)!=-1?true:false;
        }
    });
    //---------
    //===Css
    extend(S.fn, {
        css: function(name, value) {
            if(value){
                return this.each(function() {
                    S.setCss(this,name,value);
                });
            }else{
                return S.getCss(this[0],name);
            }
        },
        show:function(elem){
            return this.each(function() {
                if(!S.attr(this,'olddisplay')){
                    S.attr(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display',S.attr(this,'olddisplay'));
            });
        },
        hide:function(elem){
             return this.each(function() {
                if(!S.attr(this,'olddisplay')){
                    S.attr(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display','none');
            });
        }
    });
    //--------
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