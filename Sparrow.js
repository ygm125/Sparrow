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

    //=======================
    //======================
    var Promise = function() {
    }

    Promise.prototype.then = function(onResolved, onRejected) {
                                /* invoke handlers based upon state transition */
    };

    Promise.prototype.resolve = function(value) {
    };

    Promise.prototype.reject = function(error) {
    };

    Promise.when = function() {
                                /* handle promises arguments and queue each */
    };

    S.ajax=function(url,data,callback){
        var xho = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
        defOption={
            type:'POST',
            dataType:'html',
            callback:S.noop,
            async: true
        },
        promise=new Promise();

        if(S.isObject(url)){
            defOption=S.extend(defOption,url);
        }else{
            defOption.url=url;
        }
        xho.onreadystatechange=function(){
            if (obj.readyState == 4 && obj.status == 200) {
                //defOption.callback(xho.responseText);
                promise.resolve(xho.responseText);
            } 
        } 
        xho.open(defOption.type, defOption.url, defOption.async); 
        if(defOption.type==='POST'){
          xho.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xho.send(data);

        return promise;
    }
    //===================
    //===================


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
        isObject: function(obj) {
            return S.type(obj) === 'object';
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
        getAttr:function(el,attribute){
                if ((attribute in el) && 'href' != attribute) {
                    return el[attribute];
                } else {
                    return el.getAttribute(attribute, S.support.hrefNormalized ? null : 2);
                }
        },
        setAttr:function(el, attribute, value){
                if (attribute in el) {
                    el[attribute] = value;
                } else {
                    el.setAttribute(attribute, value);
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
               return document.defaultView.getComputedStyle(elem, null).getPropertyValue(name);
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
        },
        access:function(elems, fn, key, value, chainable){
            if (typeof key === "object" ) {
                for (var i in key ) {
                    S.access(elems, fn, i, key[i], 1);
                }
                return elems;
            }else{
                if(value){
                    elems.each(function(){
                        fn(this,key,value);
                    });
                    if(!chainable){
                        return elems;
                    }
                }else{
                   return fn(elems[0],key);
                }
            }
        },
        getScrollTop: function(node) {
            var doc = node ? node.ownerDocument : document;
            return doc.documentElement.scrollTop || doc.body.scrollTop;
        },
        getScrollLeft: function(node) {
            var doc = node ? node.ownerDocument : document;
            return doc.documentElement.scrollLeft || doc.body.scrollLeft;
        },
        offset:function(elem){
            var left = 0, top = 0, right = 0, bottom = 0;
            if (elem.getBoundingClientRect) {
                var rect = elem.getBoundingClientRect();
                left = right = S.getScrollLeft(elem); top = bottom = S.getScrollTop(elem);
                left += rect.left; right += rect.right;
                top += rect.top; bottom += rect.bottom;
            } else {
                var n = elem;
                while (n) { left += n.offsetLeft, top += n.offsetTop; n = n.offsetParent; };
                right = left + elem.offsetWidth; bottom = top + elem.offsetHeight;
            };
            return { "left": left, "top": top, "right": right, "bottom": bottom };
        },
        position: function(elem) {
            var rect = S.rect(elem), sLeft = S.getScrollLeft(elem), sTop = S.getScrollTop(elem);
            rect.left -= sLeft; rect.right -= sLeft;
            rect.top -= sTop; rect.bottom -= sTop;
            return rect;
        },
        contains: document.defaultView ? function (a, b) { return !!( a.compareDocumentPosition(b) & 16 ); }
        : function (a, b) { return a != b && a.contains(b); }
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
            return S.access(this, function( elem, name, value ) {
                return value ? S.setAttr( elem, name, value ) : S.getAttr( elem, name );
            }, name, value);
        },
        removeAttr: function(name) {
            return this.each(function() {
                S.removeAttr(this, name);
            });
        },
        val:function(value){
            return S.access(this, function( elem, name, value ) {
                 return value ? (elem.value = value) : elem.value;
            }, null, value);
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
            return S.access(this, function( elem, name, value ) {
                return value ? S.setCss( elem, name, value ) : S.getCss( elem, name );
            }, name, value);
        },
        show:function(elem){
            return this.each(function() {
                if(!S.getAttr(this,'olddisplay')){
                    S.setAttr(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display',S.getAttr(this,'olddisplay'));
            });
        },
        hide:function(elem){
             return this.each(function() {
                if(!S.getAttr(this,'olddisplay')){
                    S.setAttr(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display','none');
            });
        }
    });
    //--------
    //===Offset
    extend(S.fn, {
        offset: function() {
          return S.offset(this[0]);
        },
        position:function(){
          return S.position(this[0]);
        }
    });
    //---------
    //===Manipulation
    extend(S.fn, {
        html: function() {

        },
        text:function(){

        },
        append:function(){

        }
    });
    //-----------
    //================


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