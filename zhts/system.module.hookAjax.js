function ClassAjaxHook(){
	
	let _systemName = SYSTEM.PROBJECT_PATH.replace(/^\//,"");
	
	function getStorage(){
		if(!sessionStorage) throw new Error("browser does not support sessionStorage");
		try{
			let _result = {};
			_result = sessionStorage.getItem(_systemName);
			_result = JSON.parse(_result);
			return _result || {};
		}catch(e){
			return {};
		}
	}
	
	this.__option = {
		onreadystatechange:function(xhr){
//	        console.log("onreadystatechange called: %O",xhr);
			//如果return true的并不会继续执行继承，否则反之
	        if(xhr.status==200 && xhr.readyState==4){
	        	let _JSON;
	        	try{
	        		_JSON = JSON.parse(xhr.responseText);
	        	}catch(e){
	        		//TODO handle the exception
	        	}
	        	
	        	if(!_JSON){
	        		console.warn("返回数据不是标准格式",xhr);
	        	}else if(_JSON.code === undefined){
	        		console.warn("返回数据不是标准格式",xhr);
	        	}
	        }
	    },
	    send:function(arg,xhr){
//	    	console.info("callback send start");
			let _storage = getStorage() || {};
	    	xhr.setRequestHeader("token",_storage["token"] || "null");
	    	xhr.setRequestHeader("system-name",_systemName);
//	    	console.info("callback send end");
//			console.log("send called: %O",arg[0]);
	    },
	    setRequestHeader:function(arg,xhr){
//	        console.log("setRequestHeader called!",arg)
//			xhr.setRequestHeader("token","ajaxhook");
//			xhr.setRequestHeader("token",new Date().getTime());
	    }
	};
	
	this.setOption = function(option){
		ah.hook(this.__option);
	}
	
	this.init = function(){
		this.setOption();
	}
	return this;
}
var _classAjaxHook = new ClassAjaxHook({});
_classAjaxHook.init();
