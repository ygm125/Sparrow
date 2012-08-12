S.define(['b','c'],function(b,c){
	S.log(b);
	S.log(c);

	S('button').click(function(){
		S.require('g',function(g){
			alert(g);
			S.log(S._modules);
		})
	});

	return 'aaa'+b+c;
});
