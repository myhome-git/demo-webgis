!(function($,x){
	
	
	$.ajaxSetup({cache:false});

	$(document).ajaxComplete(onComplete);
	
	function onComplete(event,xhr,settings) {
		var _result;
		try{
			_result = JSON.parse(xhr.responseText);		
		}catch(e){}
		
		if(_result && _result["code"]==10001){
//			top.location.href = _result.msg;
		}
	}
	
	x.ajax = function(params){
		var _default = {
			dataType : "json",
			type : "POST",
			cache:false,
			error : function(xhr,type,text){
				layer.msg(""+text,{time:5000});
			},
			beforeSend : function(xhr,event){
				//ajax发送之前，不可修改event数据
				//console.info("beforeSend生效",xhr,event);
			}
		};
		_default = $.extend(true, _default, params);
		$.ajax(_default);
	}
})(jQuery,xUtilBase);

//取工程路径
function GetPROBJECT_PATH(){
	return  window.Common.Config.PROBJECT_IP + window.Common.Config.PROBJECT_PATH;
}

//声明layer
var layer = layui.layer;

