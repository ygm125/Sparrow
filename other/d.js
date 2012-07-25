var isPromise = function (value) {
    return value && typeof value.then === "function";
};

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

var defer = function () {

    var pending = [], value, deferred = {};
 
        deferred.resolve= function (_value) {
            if (pending) {
                value = ref(_value);
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    value.then.apply(value, pending[i]);
                }
                pending = undefined;
            }
        }

        deferred.promise={
            then: function (_callback, _errback) {
                var result = defer();
                // provide default callbacks and errbacks
                _callback = _callback || function (value) {
                    // by default, forward fulfillment
                    return value;
                };
                _errback = _errback || function (reason) {
                    // by default, forward rejection
                    return reject(reason);
                };
                var callback = function (value) {
                    result.resolve(_callback(value));
                };
                var errback = function (reason) {
                    result.resolve(_errback(reason));
                };
                if (pending) {
                    pending.push([callback, errback]);
                } else {
                    value.then(callback, errback);
                }
                return result.promise;
            }
        }

        deferred.promise.done=function(_callback){

           return this.then(_callback,null);
        }

        deferred.promise.fail=function(_errback){

           return this.then(null,_errback);
        }

        deferred.promise.always=function(fn){

           return this.done(fn).fail(fn);
        }

    return deferred;
};

var whenAll=function(promises){
        var deferred = defer(),
            countDown = promises.length,
            result=[],
            gloBraker=false;
       
        for (var i = 0; i < countDown; i++) {
            promises[i].then(function(res){
                d(i,res);//i伪代码
            },function(err){
                d(i,err,'err');
            })
        };

        function d(key,value,state){
            if(gloBraker)return;
            if('err'===state){
                gloBraker=true;
                deferred.reject({'err':value,'errNum':key});
            }else{
                result[key]=value;
                if (--countDown === 0) {
                   deferred.resolve(result);
                }
            }
        }

        return deferred.promise;
}

