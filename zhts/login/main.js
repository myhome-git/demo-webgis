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
			_FunctionObject.$btnVerificationCode.find("img").attr("src",window.Common.Config.PROBJECT_IP+"/captcha.jpg?t="+new Date().getTime());
		}
		
		//单击更换验证码
		_FunctionObject.$btnVerificationCode.on("click",function(){
			_FunctionObject.getVerificationCode();
		});

		//用户登录
		_FunctionObject.httpUserLogin = function(){
			var _values = _FunctionObject.$viewLoginWindow.getElValue();
			var _data = "username="+_values.username+"&password="+_values.password+"&captcha="+_values.captcha;
			xUtilBase.ajax({
				url : window.Common.Config.PROBJECT_IP+"/sys/login"+location.search,
				data : _data,
				dataType: "json",
				success: function(result){
					//登录成功
					if(result.code == 0){
						sessionStorage.setItem("zhts",JSON.stringify({
							token : result.data.token
						}));
						top.location.href = "../html/index.html";
					}else{
						layui.layer.msg(result.msg);
                        _FunctionObject.getVerificationCode();
					}
				}
			});
		}
		
		_FunctionObject.$viewLoginWindow.find("#http-submit").on("click",function(){
			_FunctionObject.httpUserLogin();
		});
                
                _FunctionObject.$viewLoginWindow.find("input").on("keyup",function(event){
                    if (event.keyCode == 13) {
                        _FunctionObject.httpUserLogin();
                    }			
		});
		
        //初始化
        _FunctionObject.init = function () {
			_FunctionObject.getVerificationCode();
			$('#x-view-window-background').polygonizr({
				duration : 2,
				animationFps : 60,
				restNodeMovements : 0.5
			});
        }

        _FunctionObject.init();

    }
})(jQuery)