//判断用户是否登陆
var IsRunLoginRequestCount = 0;
window.UserIsLogin = function(callback){
	// (callback)();
	// return false;

	$.ajax({
		url: "/by-service/sys/islogin",
        type: "POST",
        dataType: "json",
        success: function (result) {
			var code = result["code"];
        	if(code=="0"){
        		try{
        			(callback)();
        		}catch(e){
        			//TODO handle the exception
        		}
        	}else{
        		top.location.href = "/model3d/login/index.html?t="+new Date().getTime();
        	}
        },
        error : function(a,b,c){
        	IsRunLoginRequestCount = IsRunLoginRequestCount + 1;
        	if(IsRunLoginRequestCount<3){
        		setTimeout(function(){
	        		UserIsLogin();
	        	},1000);
        	}
        }
	});
}

