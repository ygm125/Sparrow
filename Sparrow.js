(function() {
    var root = this,
        document = root.document,
        w3c = document.dispatchEvent,       //w3c事件模型
        HEAD = document.head || document.getElementsByTagName("head")[0],
        class2type = {},
        quickID = /#([\w\-]+)$/,
        quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$)/,
        quickDelegate=/^(\w+)?\.?(\w+)?$/,
        rtrim = /(^\s*)|(\s*$)/g,
        rcamelCase = /-([a-z])/ig,

        core_slice = Array.prototype.slice,
        core_trim = String.prototype.trim,
        core_toString = Object.prototype.toString,
        core_splice = Array.prototype.splice,

        SPACE = ' ',
        ANY = '*',

    _S = root.S,
     S = function(selector, context) {
         return new S.fn.init(selector, context);
     };


    function tuneContext(context) {
        if (context === undefined) {
            context = document;
        }else if (typeof context==='string' && quickID.test(context)) {
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
                    }
                    return this;
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

            } else if (typeof selector === 'function') {
                return S.ready(selector);
            }
            return S.merge(this, ret || selector);
        },
        length: 0,
        splice: core_splice,
        toArray: function() {
            return core_slice.call(this);
        },
        get: function(num) {
            return num == null ? this.toArray() :
            (num < 0 ? this[this.length + num] : this[num]);
        },
        slice: function(start,end){
            return core_slice.call(this,start,end);
        },
        filter: function(fn) {
            for (var i = this.length-1 , j = -1 ; i > j; i--) {
                if(fn.call(this[i],i)){
                    core_splice.call(this,i,1)
                }
            };
            return this;
        },
        siblings:function(){
            var r = [];
            this.each(function(i,el){
                var n=(el.parentNode || {}).firstChild;
                for ( ; n; n = n.nextSibling ) {
                    if ( n.nodeType === 1 && n !== el ) {
                        r.push(n);
                    }
                }
            });
            r=S(r);
            r.previousThis=this;
            return r;
        },
        parent:function(){
            var r = [];
            r[0]=this[0].parentNode;
            r=S(r);
            r.previousThis=this;
            return r;
        },
        children:function(b){
           b = b ?'childNodes':'children';
           var r=[];
           S.merge(r,this[0][b]);
           r=S(r);
           r.previousThis=this;
           return r;
        },
        prev:function(){
            var r = [],
                pv=this[0].previousSibling;
            if (pv.nodeType !== 1) {
                pv=pv.previousSibling;
            }
            r[0]=pv;
            r=S(r);
            r.previousThis=this;
            return r;
        },
        next:function(){
            var r = [],
                nx=this[0].nextSibling;
            if (nx.nodeType !== 1) {
                nx=nx.nextSibling;
            }
            r[0]=nx;
            r=S(r);
            r.previousThis=this;
            return r;
        },
        end:function(){
            return this.previousThis||this.context||document;
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
        if (typeof object==='function') {
            callback = object;
            object = this;
        }
        length = object.length;
        if (length) {
            for (; i < length; i++) {
               if(callback.call(object[i], i, object[i], object)===false){
                  break;
               }
            }
        } else {
            for (name in object) {
               if(callback.call(object[name], name, object[name], object)===false){
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
        isObject: function(obj) {
            return S.type(obj) === 'object';
        },
        isEmptyObject: function( obj ) {
            var name;
            for ( name in obj ) {
                return false;
            }
            return true;
        },
        cache: {},
        uuid: 0,
        expando: "S" +(+new Date()+'').slice(-8),
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
            if(node.nodeType){
                return node;
            }

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
                       return fn(this,key,value);
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
        rect: function(node){
            var left = 0, top = 0, right = 0, bottom = 0;
            //ie8的getBoundingClientRect获取不准确
            if ( !node.getBoundingClientRect) {
                var n = node;
                while (n) { left += n.offsetLeft, top += n.offsetTop; n = n.offsetParent; };
                right = left + node.offsetWidth; bottom = top + node.offsetHeight;
            } else {
                var rect = node.getBoundingClientRect();
                left = right = S.getScrollLeft(node); top = bottom = S.getScrollTop(node);
                left += rect.left; right += rect.right;
                top += rect.top; bottom += rect.bottom;
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
        : function (a, b) { return a != b && a.contains(b); },
        /*http://oldenburgs.org/playground/autocomplete/
         http://www.cnblogs.com/ambar/archive/2011/10/08/throttle-and-debounce.html
         https://gist.github.com/1306893
        在一连串调用中，如果我们throttle了一个函数，那么它会减少调用频率，
        会把A调用之后的XXXms间的N个调用忽略掉，
        然后再调用XXXms后的第一个调用，然后再忽略N个*/
        throttle:  function(delay,action,tail,debounce) {
            var last_call = 0, last_exec = 0, timer = null, curr, diff,
            ctx, args, exec = function() {
                last_exec = Date.now;
                action.apply(ctx,args);
            };
            return function() {
                ctx = this, args = arguments,
                curr = Date.now, diff = curr - (debounce? last_call: last_exec) - delay;
                clearTimeout(timer);
                if(debounce){
                    if(tail){
                        timer = setTimeout(exec,delay);
                    }else if(diff >= 0){
                        exec();
                    }
                }else{
                    if(diff >= 0){
                        exec();
                    }else if(tail){
                        timer = setTimeout(exec,-diff);
                    }
                }
                last_call = curr;
            }
        },
        //是在一连串调用中，按delay把它们分成几组，每组只有开头或结果的那个调用被执行
        //debounce比throttle执行的次数更少
        debounce : function(idle,action,tail) {
            return $.throttle(idle,action,tail,true);
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
    //-----------------------
    //=================support
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
    //---------------------
    //================Promise
    var ref = function (value) {
        if (value && typeof value.then === "function")
            return value;
        return {
            then: function (callback) {
                return ref(callback(value));
            }
        };
    };

    var reject = function (reason) {
        return {
            then: function (callback, errback) {
                return ref(errback(reason));
            }
        };
    };

    var Promise = function () {

        var pending = [], value, 

            promise = {
                resolve: function (_value) {
                    if (pending) {
                        value = ref(_value);
                        for (var i = 0, ii = pending.length; i < ii; i++) {
                            value.then.apply(value, pending[i]);
                        }
                        pending = undefined;
                    }
                },
                reject: function(_value){
                    this.resolve(reject(_value));
                }
            };

            promise.promise={
                then: function (_callback, _errback) {
                    var result = Promise();
                    _callback = _callback || function (value) {
                        return value;
                    };
                    _errback = _errback || function (reason) {
                        return reject(reason);
                    };
                    var callback = function (value) {
                        result.resolve(_callback(value)||value);
                    };
                    var errback = function (reason) {
                        result.reject(_errback(reason)||reason);
                    };
                    if (pending) {
                        pending.push([callback, errback]);
                    } else {
                        value.then(callback, errback);
                    }
                    return result.promise;
                },
                done: function(_callback){
                   return this.then(_callback,null);
                },
                fail: function(_errback){
                   return this.then(null,_errback);
                },
                always: function(fn){
                   return this.done(fn).fail(fn);
                }
            }

        return promise;
    };

    S.Promise = Promise;

    S.when=function(promises,operate){
            var promise = Promise(),
                countDown = promises.length,
                result=[],
                gloBraker=false;
                
            if(countDown === 0){
                promise.resolve(promises);
                return promise.promise;
            }

            operate = operate || 'ALL';

            S.each(promises,function(i,v){
                v.then(function(res){
                    d(i,res);
                },function(err){
                    d(i,err,'err');
                });
            });
       
            function d(key,value,state){
                if(gloBraker)return;
                if('err'===state){
                    gloBraker=true;
                    //终止请求 情况有多种 考虑不全 暂时去掉
                    // for (var i = 0,j = promises.length; i < j ; i++) {
                    //     promises[i].xhr&&(promises[i].xhr.abort());
                    // };
                    promise.reject({'err':value,'errNum':key});
                }else{

                    result[key]=value;
                        
                    if (operate==='ALL' && --countDown === 0) {
                       promise.resolve(result);
                    }
                    if(operate==='ANY'){
                       gloBraker=true;
                       promise.resolve(result);
                    }
                }
            }

            return promise.promise;
    }

    S.whenAll=function(promises){
       return S.when(promises,'ALL');
    }

    S.whenAny=function(promises){
       return S.when(promises,'ANY');
    }

    S.param=function(obj,url){
        var oriParam,str='';
        obj=obj||{};
        if(url){
            url=url.split('?');
            if(url[1]){
                oriParam=url[1].split("&");
                for (var i = 0; i < oriParam.length; i++) {
                        var p=oriParam[i].split("=");
                        if(!(p[0] in obj)){
                            obj[p[0]]=p[1];
                        }
                };
            }
        }

        for (var key in obj) {
            str+= encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])+"&";
        };

        if(oriParam){
            return url[0]+'?'+str.replace(/&$/,'');
        }
        return str.replace(/&$/,'');
    }

    S.ajax=function(url,data){
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
        defOption={
            type:'POST',
            dataType:'html',
            async: true
        },
        promise=Promise();

        if(typeof url=== "object"){
            defOption=S.extend(defOption,url);
        }else{
            defOption.url=url;
            defOption.data=data;
        }

        if(defOption.type==='GET'){
           defOption.url=S.param(defOption.data,defOption.url);
           defOption.data=null;
        }else{
           defOption.data=S.param(defOption.data);
        }

        xhr.onreadystatechange=function(){
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status< 300 || xhr.status === 304){
                    var res;
                    if(defOption.dataType==='JSON'){
                        res=S.parse(xhr.responseText);
                    }else{
                        res=xhr.responseText;
                    }
                    promise.resolve(res);
                }else{//错误处理
                    promise.reject(xhr.status);
                }
            } 
        } 
        xhr.open(defOption.type, defOption.url, defOption.async); 
      
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        
        xhr.send(defOption.data);

        return promise.promise;
    };
  
    S.tmpl = (function (cache, SS) {
    return function (str, data) {
        var fn = !/\s/.test(str)
        ? cache[str] = cache[str] || S.tmpl(S(str).html())
        : function (data) {
            var i, variable = [SS], value = [[]];
            for (i in data) {
                variable.push(i);
                value.push(data[i]);
            };
            return (new Function(variable, fn.SS)).apply(data, value).join("");
        };
        fn.SS = fn.SS || SS + ".push('" 
        + str.replace(/\\/g, "\\\\")
             .replace(/[\r\t\n]/g, " ")
             .split("<%").join("\t")
             .replace(/((^|%>)[^\t]*)'/g, "$1\r")
             .replace(/\t=(.*?)%>/g, "',$1,'")
             .split("\t").join("');")
             .split("%>").join(SS + ".push('")
             .split("\r").join("\\'")
        + "');return " + SS;
        return data ? fn(data) : fn;
    }})({}, 'SS' + (+ new Date));

    S.load=function(url,options) {
        var promise=new Promise(),t =/[^\.]+$/.exec(url.split('?')[0]),jc;
        if(t=='js'){
            options = options || {};
            jc = document.createElement('script');
            jc.src = url;
            jc.async=true;
            if (options.charset) {
                jc.charset = options.charset;
            }
            jc.onerror = jc.onload = jc.onreadystatechange = function() {
                if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                    promise.resolve();
                    jc.onerror = jc.onload = jc.onreadystatechange = null;
                    HEAD.removeChild(jc);
                }
            };
        }else if(t=='css'){
            jc = document.createElement('link');
            jc.rel = 'stylesheet';
            jc.type = 'text/css';
            jc.href = url;
            //setTimeout(function(){},1);
            promise.resolve();
        }
        HEAD.insertBefore(jc, HEAD.firstChild);
        return promise.promise;
    };

    S.loadJsonp =(function(){
            var seq = new Date() * 1;
            return function (url,callback,options){
                options = options || {};
                var funName = "SJsonp" + seq++,
                    cb = options.cb || 'callback';
                root[funName] = function (data){
                    if (callback) {
                        callback(data);
                    }
                    root[funName] = null;     
                };
                url += (/\?/.test( url ) ? "&" : "?") + cb +'=' + funName;
                return S.load(url,options);
            };
    }());

    S.rload=function(url,options) {
        var promise=new Promise();
        /.js$/.test(url) ? "" : (url+='.js');
        if(url in modules){
            (function doCheck() {
                if(modules[url]['state']===2){
                        promise.resolve(modules[url]['rtn']);
                }else{
                        setTimeout(doCheck, 20);
                }
            })();
            return promise.promise;
        }
        modules[url]={ 'state': 1 };
        options = options || {};

        var jc = document.createElement('script');
            jc.src = url;
            jc.async=true;
            if (options.charset) {
                jc.charset = options.charset;
            }
            jc.onerror = jc.onload = jc.onreadystatechange = function() {
                if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {

                    var obj=returns.shift(),deps=obj.deps,callback=obj.callback;
                    S.require(url,deps,callback,promise);

                    jc.onerror = jc.onload = jc.onreadystatechange = null;
                    HEAD.removeChild(jc);
                }
            };
        HEAD.insertBefore(jc, HEAD.firstChild);
        return promise.promise;
    }


    S.rloadAll=function(arr){
            S.each(arr,function(i,v){
                    arr[i]=S.rload(v);
            });
            return S.whenAll(arr);
    };

    var modules={},returns=[];

    S._modules = modules;

    S.require=function(name,deps,callback,promise){
        if(S.isFunction(deps)){
            callback=deps;
            deps=[];
        }
        /.js$/.test(name) ? "" : (name+='.js');
        if(S.isArray(deps)&&deps.length){
                S.rloadAll(deps).then(function(res){
                   if(promise){
                        modules[name]['state']=2;
                        promise.resolve(modules[name]['rtn']=callback.apply(S,res));
                    }else{
                        S.rload(name).then(function(o){
                            res.unshift(o);
                            callback.apply(S,res)
                        });
                    }
                });
        }else{
            if(modules[name]){
                modules[name]['rtn']=callback.call(S);
                modules[name]['state']=2;
                if(promise){
                   promise.resolve(modules[name]['rtn']);
                }
            }else{
                S.rload(name).then(function(o){
                    callback.call(S,o);
                });
            }
        }
    };
    
    S.define=function(deps,callback){
        if(S.isFunction(deps)){
            callback=deps;
            deps=[];
        }
        returns.unshift({'deps':deps,'callback':callback});
    };
    //==============Event&&Data
     (function(S) {
        var topics = {},
            subUid = -1;
        S.subscribe = function( topic, func ) {
            topic=topics[topic]||(topics[topic] = []);
            var token = ++subUid;
            topic.push({
                token: token,
                func: func
            });
            return token;
        };
        S.publish = function( topic, args ) {
            if ( !topics[topic] )
                return false;
            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;
            while (len--) {
                subscribers[len].func( topic, args );
            }
            return this;
        };
        S.unsubscribe = function( token ) {
            if(!token){
                topics={};
            }
            for ( var m in topics ) {
                if ( topics[m] ) {
                    for ( var i = 0, j = topics[m].length; i < j; i++ ) {
                        if ( topics[m][i].token === token) {
                            topics[m].splice( i, 1 );
                            return token;
                        }
                    }
                }
            }
            return this;
        };
    }(S));

    S.fixEvent=function(event) {
        if (event) return event;
        event = root.event;
        event.pageX = event.clientX + S.getScrollLeft(event.srcElement);
        event.pageY = event.clientY + S.getScrollTop(event.srcElement);
        event.target = event.srcElement;
        event.stopPropagation = function(){
            this.cancelBubble = true;
        };
        event.preventDefault = function(){
            this.returnValue = false;
        };
        var relatedTarget = {
                "mouseout": event.toElement, "mouseover": event.fromElement
            }[ event.type ];
        if ( relatedTarget ){ event.relatedTarget = relatedTarget;}
        
        return event;
    };

    var bubbleTo=function(el,endEl,tag,cls) {
        var rel;
        if(el===endEl){
            return null;
        }
        if(cls){
            if(S(el).hasClass(cls)){
               return el;
            }else{
               rel=bubbleTo(el.parentNode,endEl,null,cls);
            }
        }
        if(tag){
            if(el.tagName.toLowerCase()===tag.toLowerCase()){
               return rel || el;
            }else{
               rel=bubbleTo(el.parentNode,endEl,tag,null);
            }
        }
        return rel;
    }

    S.eventHandler= function( elem,selector){
        return function( event ){
            event = S.fixEvent( event);
            var type = event.type;
            if(type in S.special.hover&& w3c ){
                var r = event.relatedTarget;
                if(this===r||S.contains(this,r))
                    return;
                type=S.special.hover[type];
            }
            var handlers = S.data( elem, 'events' )[type];
            if(handlers.undelegate&&selector in handlers.undelegate)//删除委托
                return;
            if(selector){
                var match=quickDelegate.exec(selector);
                if(match){
                    var tag=match[1],
                        cls=match[2],    
                        tar=event.target;
                    tar = bubbleTo(tar,elem,tag,cls);
                    if(!tar)return;
                    //event.delegateSource = elem;
                }
            }
            for( var i = 0, handler; handler = handlers[i++]; ){
                if( handler.call(tar||elem, event) === false ){
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }
    }

    S.data=function (elem, name, value){
                var index = elem === root ? 0 : elem.nodeType === 9 ? 1 :
                            elem[S.expando] ? elem[S.expando] :
                            (elem[S.expando] = ++S.uuid),
                    thisCache = S.cache[index] ? S.cache[index] : (S.cache[index] = {});

                if(value){
                    thisCache[name] = value;
                }else{
                    return thisCache[name];
                }
    }

    S.removeData=function(elem,name){
         var index = elem === root ? 0 :
                        elem.nodeType === 9 ? 1 :
                        elem[S.expando];
                if( index === void 0 ) return;

                var delteAll=function(){
                        delete S.cache[index];
                        if(index <= 1 ) return;
                        try{
                            delete elem[S.expando];
                        }
                        catch ( e ) {
                            elem.removeAttribute(S.expando);
                        }
                    };

                if(name){
                    delete S.cache[index][name];
                    if(S.isEmptyObject(S.cache[index])){
                        delteAll();
                    }
                }else{
                    delteAll();
                }
    }

    S.special={
        focus: {
            delegateType: "focusin"
        },
        blur: {
            delegateType: "focusout"
        },
        hover:{
            "mouseenter": "mouseover",
            "mouseleave": "mouseout"
        }
    }

    S._add=w3c ? function(el, type, fn, phase) {
            el.addEventListener(type, fn, !!phase);
            return fn;
        } : function(el, type, fn) {
            el.attachEvent && el.attachEvent("on" + type, fn);
            return fn;
        }

    S._remove=w3c ? function(el, type, fn, phase) {
            el.removeEventListener(type, fn || S.noop, !!phase);
        } : function(el, type, fn) {
            if (el.detachEvent) {
                el.detachEvent("on" + type, fn || S.noop);
            }
        }

    S.add=function(elem, type, fn,selector){
        var events = S.data(elem, 'events') || (S.data(elem, 'events', {}),S.data(elem, 'events')),
            handlers= events[type]||(events[type]=[]);
            handlers.push(fn);
            if(handlers.length === 1 ){
                var eventHandler = S.eventHandler( elem , selector );
                    events[type+'Handler']=eventHandler;
                    if(type in S.special.hover&& w3c ){
                        S._add(elem,S.special.hover[type], eventHandler);
                    }else{
                        S._add(elem,type,eventHandler);
                    }
            }
    }

    S.remove=function(elem, type,selector){
        var events = S.data(elem, 'events');
            if(!events) return;
            if(!type){
                S.each(events,function(type){
                    S._remove(elem,type,events[type+'Handler']);
                })
                S.removeData(elem,'events');
            }else{
                if(selector){
                    var undelegate=events[type]['undelegate']||(events[type]['undelegate']={});
                    if(!(selector in undelegate))
                        undelegate[selector]=selector;
                }
                S._remove(elem,type,events[type+'Handler']);
                delete events[type];
                if(S.isEmptyObject(events)){
                    S.removeData(elem,'events');
                }
            }
    }

    S.fireEvent=document.createEventObject?function(el,type){
                    var evt = document.createEventObject();
                    el.fireEvent('on'+type,evt)
                }:function(el,type){
                    var evt = document.createEvent( 'HTMLEvents' );
                    evt.initEvent(type, true, true);
                    el.dispatchEvent(evt);
                };

    extend(S.fn, {
        data:function(name,value){
            return S.access(this, function( elem, name, value ) {
                return S.data(elem, name, value);
            }, name, value);
        },
        removeData:function(name){
            return this.each(function(i,elem){
               S.removeData(elem,name);
            });
        },
        on:function(type,handler,selector) {
            return this.each(function(i,elem){
               S.add(elem,type,handler,selector);
            });
        },
        // one:function(){},
        off:function(type,selector){//暂时不提供删除单个handler的功能
            return this.each(function(i,elem){
                S.remove(elem,type,selector);
            });
        },
        bind:function(type,handler){
            return this.on(type,handler);
        },
        unbind:function(type){
            return this.off(type);
        },
        delegate:function(selector,type,handler) {
            return this.on(type,handler,selector);
        },
        undelegate:function(type,selector) {
            if(!selector){
               return this.off(type);
            }else{
               return this.off(type,selector);
            }          
        },
        trigger:function(type){
            return this.each(function(i,el){
                S.fireEvent(el,type);
            });
        },
        hover:function(fn,fo) {
           return this.on('mouseenter',fn || S.noop).on('mouseleave',fo || S.noop);
        }
    });
    //focusin focusout没有实现 
    S.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
        S.fn[name] = function(fn) {
            return arguments.length > 0 ? this.on(name,fn) : this.trigger(name);
        };
    });
    //------------------
    extend(S.fn, {
        //===============Attr
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
            if(value){
                return this.each(function(){
                    this.value=value;
                });
            }else{
                return this[0].value
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
        },
        //==============Css
        css: function(name, value) {
            return S.access(this, function( elem, name, value ) {
                return value ? S.setCss( elem, name, value ) : S.getCss( elem, name );
            }, name, value);
        },
        show:function(elem){
            return this.each(function() {
                if(!S.data(this,'olddisplay')){
                    S.data(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display',S.data(this,'olddisplay'));
            });
        },
        hide:function(elem){
             return this.each(function() {
                if(!S.data(this,'olddisplay')){
                    S.data(this,'olddisplay',S.getCss(this,'display'))
                }
                S.setCss(this,'display','none');
            });
        },
        //===============Offset
        offset: function() {
          return S.offset(this[0]);
        },
        position:function(){
          return S.position(this[0]);
        },
        //===============Manipulation
        empty: function (){
            return this.each(function(){
                this.innerHTML='';
            });
        },
        remove: function (){
            return this[0].parentNode ? this[0].parentNode.removeChild(this[0]) : this;
        },
        html: function(html) {
            if(html){
                return this.each(function(){
                    this.innerHTML=html;
                });
            }else{
                return this[0].innerHTML
            }
        },
        text:function(text){
            var name=S.browser.msie?'innerText':'textContent';
            if(text){
                return this.each(function(){
                    this[name]=text;
                });
            }else{
                return this[0][name];
            }
        },
        append:function(node){
            this[0].appendChild(S.buildFragment(node));
            return this;
        },
        prepend:function(node){
            var elem=this[0];
            elem.firstChild ? elem.insertBefore(S.buildFragment(node), elem.firstChild) : elem.appendChild(S.buildFragment(node));
            return this;
        },
        before:function(node){
            this[0].parentNode.insertBefore(S.buildFragment(node), this[0]);
            return this;
        },
        after:function(node){
            var elem=this[0];
            elem.nextSibling ? elem.parentNode.insertBefore(S.buildFragment(node), elem.nextSibling) : elem.parentNode.appendChild(S.buildFragment(node));
            return this;
        }
    });
    //---------------------
    extend(S, {
        //==============domReady
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