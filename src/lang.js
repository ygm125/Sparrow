define(Array.isArray?[]:['lang-patch'],function(){

    var core_push = Array.prototype.push,
      rcamelCase = /-([a-z])/ig;

    S.extend(S,{
        isString: function(obj) {
            return S.type(obj) == 'string';
        },
        isFunction: function(obj) {
            return S.type(obj) === "function";
        },
        isArray:Array.isArray,
        isObject: function(obj) {
            return S.type(obj) === 'object';
        },
        isEmptyObject: function(obj) {
            var name;
            for(name in obj) {
                return false;
            }
            return true;
        },
        isWindow: function( obj ) {
            return obj && typeof obj === 'object' && 'setInterval' in obj;
        },
        makeArray: function( arr, results ) {
            var type,
                ret = results || [];
            if ( arr != null ) {
                type = S.type( arr );
                if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || S.isWindow( arr ) ) {
                    core_push.call( ret, arr );
                } else {
                    S.merge( ret, arr );
                }
            }
            return ret;
        },
        parseXML : function( data ) {
            var xml, tmp;
            try {
                // 标准浏览器
                if ( window.DOMParser ) { 
                    tmp = new DOMParser();
                    xml = tmp.parseFromString( data , 'text/xml' );
                }
                // IE6/7/8
                else{
                    xml = new ActiveXObject( 'Microsoft.XMLDOM' );
                    xml.async = 'false';
                    xml.loadXML( data );
                }
            } catch( e ) {
                xml = undefined;
            }
            return xml;
        },
        // capitalize : function( str ){
        //     var firstStr = str.charAt(0);
        //     return firstStr.toUpperCase() + str.replace( firstStr, '' );
        // },
        // camelCase: function(string) {
        //     return string.replace('-ms-', 'ms-').replace(rcamelCase, function(match, letter) {
        //         return(letter + '').toUpperCase();
        //     });
        // },
        oneObject: function(array, val) {
            if(typeof array == "string") {
                array = array.match(S.rword) || [];
            }
            var result = {},
                value = val !== void 0 ? val : 1;
            for(var i = 0, n = array.length; i < n; i++) {
                result[array[i]] = value;
            }
            return result;
        },
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
    
 
});
