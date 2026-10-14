var _pageObject = _pageObject || {};
(function($,parent,module){
	module.parent = parent;
	let _this=module,
		_errorCount=0,
		_user;
	
	function autoBodyShow(){
		let $body = $("body");
		if($body.length>0){
			parent.USER_CONTROL.initCheckUserControl(function(){
				$body.addClass("visible-true");
			});
		}else{
			setTimeout(function(){
				autoBodyShow();
			},100);
		}
	}
	
	module.getUserInfo = function(){
		if(!_user){
			location.href = getProbjectPath()+"/login";
			return;
		}
		return _user;
	}
	
	module.httpGetUserLogin = function(){
		_user = {}
		autoBodyShow();
		return;
		$.ajax({
			url : "/by-service/sys/islogin",
			type : "post",
			success : function(result){
				if(result.code==0){
					_user = result;
					autoBodyShow();
				}else{
					location.href = getProbjectPath()+"/login";
				}
			},
			error : function(XMLHttpRequest,a,b){
				console.warn(XMLHttpRequest.statusText);
				_errorCount += 1;
				if(_errorCount>=3){
					location.href = getProbjectPath()+"/login";
					return;
				}
				setTimeout(function(){
					_this.httpGetUserLogin();
				},1000);
			},
			complete : function(){
				autoBodyShow();
			}
		});
	}
	
	module.init = function(){
		this.httpGetUserLogin();
	}
	
	module.init();
	
})(jQuery,_pageObject,_pageObject.USER_MAIN={});
