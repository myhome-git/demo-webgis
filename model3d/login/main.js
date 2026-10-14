var _FunctionObject = _FunctionObject || {};
(function ($) {
    $(document).ready(documentReady);
    function documentReady() {


        _FunctionObject.$body = $("body");
        
        _FunctionObject.$viewWindow = $("#x-view-window");
        
        _FunctionObject.$viewContent = _FunctionObject.$body.find("#x-view-content");
        _FunctionObject.$viewLoginWindow = _FunctionObject.$viewContent.find("#x-view-login-window");
        _FunctionObject.$btnVerificationCode = _FunctionObject.$viewLoginWindow.find("#verification-code");

        _FunctionObject.$viewfoot = _FunctionObject.$viewWindow.find("#x-view-foot");

        _FunctionObject.layer = layui.layer;

		//更换验证码
		_FunctionObject.getVerificationCode = function(){
			_FunctionObject.$btnVerificationCode.find("img").attr("src","/by-service/captcha.jpg?date="+new Date().getTime());
		}
		
		//单击更换验证码
		_FunctionObject.$btnVerificationCode.on("click",function(){
			_FunctionObject.getVerificationCode();
		});
		
		_FunctionObject.$viewLoginWindow.find(".layui-input").on("keyup",function(event){
			
		 	if(event.keyCode==13){
		 		
		 		_FunctionObject.httpUserLogin();
		 		
		 	}
		 	
		});

		//用户登录
		_FunctionObject.httpUserLogin = function(){
			
			var _this = this;
			
			var _values = _FunctionObject.$viewLoginWindow.getElValue();
			var _data = "username="+_values.username+"&password="+_values.password+"&captcha="+_values.captcha;
			xUtilBase.ajax({
				url: "/by-service/sys/login",
				type: "POST",
				data : _data,
				dataType: "json",
				success: function(result){
					//登录成功
					if(result.code == 0){
						location.href = "/model3d/3dmodel/index.html?TIME="+new Date().getTime();
					}else{
						layui.layer.msg(result.msg);
//						_this.getVerificationCode();
					}
				}
			});
			
		}
		
		_FunctionObject.$viewLoginWindow.find("#http-submit").on("click",function(){
			_FunctionObject.httpUserLogin();
		});
		
        //初始化
        _FunctionObject.init = function () {
        	
        	layui.use(["layer"],function(){
        		
        	});
        	
			_FunctionObject.getVerificationCode();
        }

        _FunctionObject.init();

    }
})(jQuery)