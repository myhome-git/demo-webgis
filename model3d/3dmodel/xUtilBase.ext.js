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

//声明layer
var layer = layui.layer;


//通用代码，获取字典对象
function GetMainWindowDICT(){
	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/web3d/3dmodel/index.html");
	if(!_iframeWindow){
		_iframeWindow = xUtilBase.GetIframeContentWindowById("/web3d/3dmodel/");
		if(!_iframeWindow){
			top.layui.layer.msg("未初始化主窗口");
			return;
		}
	}
	return _iframeWindow._FunctionObject.moduleControl.DICT;
}


//文件上传转换对象
function formatUploadFileToJSON(_cache){
	
	var _return = {
		
		dmtArrayString : [],
		
		useDmt : [],
		
		oldDmt :[]
		
	};
	
	if(_cache){
		
		//本次上传文件
		if(_cache.uploadFiles){
					
			$.each(_cache.uploadFiles, function(index,el) {
			
				var _o = {
					
					identifier : el.__httpUploadRetrun,
					
					name : el.name,
					
					type : el.type
					
				};
				
				_return.dmtArrayString.push(_o);
				
				_return.useDmt.push(_o.identifier);
				
			});
			
		}
		
		//历史文件
		if(_cache.oldFiles){
			
			$.each(_cache.oldFiles, function(index,el) {
				
				_return.oldDmt.push(el.__httpUploadRetrun);
				
			});
			
		}
		
	}
	
	//多媒体转换为字符串
	try{
		
		if(_return.dmtArrayString.length<1){
			
			_return.dmtArrayString = "";
			
		}else{
			
			_return.dmtArrayString = JSON.stringify(_return.dmtArrayString);
			
		}
		
	}catch(e){
		//TODO handle the exception
	}
	
	return _return;
	
}

