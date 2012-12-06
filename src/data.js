define(["lang"],function(){

    S.cache = {};

    S.data=function (elem, name, value){
                var index = elem === window ? 0 : elem.nodeType === 9 ? 1 :
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
         var index = elem === window ? 0 :
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

    S.extend(S.fn, {
        data:function(name,value){
            return S.access(this, function( elem, name, value ) {
                return S.data(elem, name, value);
            }, name, value);
        },
        removeData:function(name){
            return this.each(function(i,elem){
               S.removeData(elem,name);
            });
        }
    });
});