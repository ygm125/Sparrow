(function(S){//依赖core
    
    var core_trim = String.prototype.trim,
        core_push = Array.prototype.push,
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        rcamelCase = /-([a-z])/ig;


    S.extend(S,{
        each : function(object, callback) {
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
        capitalize : function( str ){
            var firstStr = str.charAt(0);
            return firstStr.toUpperCase() + str.replace( firstStr, '' );
        },
        camelCase: function(string) {
            return string.replace('-ms-', 'ms-').replace(rcamelCase, function(match, letter) {
                return(letter + '').toUpperCase();
            });
        },
        oneObject: function(array, val) {
            if(typeof array == "string") {
                array = array.match(rword) || [];
            }
            var result = {},
                value = val !== void 0 ? val : 1;
            for(var i = 0, n = array.length; i < n; i++) {
                result[array[i]] = value;
            }
            return result;
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
        isEmptyObject: function(obj) {
            var name;
            for(name in obj) {
                return false;
            }
            return true;
        },
        isWindow: function( obj ) {
            return obj && typeof obj === 'object' && 'setInterval' in obj;
        }
    });

    S.trim = S.fn.trim = core_trim ? function(string) {
        return string.trim();
    } : function(string) {
        return string.replace(rtrim, '');
    }

    if(!window.JSON){
         window.JSON = {
            parse: function(data) {
                return(new Function("return " + data))();
            },
            stringify: function(vContent) {
                if(vContent instanceof Object) {
                    var sOutput = "";
                    if(vContent.constructor === Array) {
                        for(var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
                        return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
                    }
                    if(vContent.toString !== Object.prototype.toString) {
                        return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\"";
                    }
                    for(var sProp in vContent) {
                        sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ",";
                    }
                    return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
                }
                return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
            }
        }
    }

})(S);