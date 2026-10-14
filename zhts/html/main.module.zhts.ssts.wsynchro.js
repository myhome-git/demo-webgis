/**
 * 异步消息控制
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module;
	let _messageState,
		_synchroName = "_WSynchro_Array";
	
	/**
	 * 根据url取出响应窗口
	 * @param {Object} url
	 */
	module.getControlWindowByURL = function(url){
		let _array = [];
		for(let i=WSynchro.windows.length-1;i>-1;i--){
			if(!WSynchro.windows[i].location.href){
				WSynchro.windows.splice(i,1);
			}else{
				let el = WSynchro.windows[i];
				if(new RegExp(el.location.pathname,"ig").test(url)){
					_array.push(el);
				}
			}
		}
		return _array;
	}
	
	/**
	 * 操作状态
	 * @param {Object} boolean
	 */
	module.setMessageState = function(boolean){
		_messageState = boolean;
		return this;
	}
	module.getMessageState = function(boolean){
		return _messageState;
	}
	
	/**
	 * 通知窗口
	 */
	module.addStorageWin = function(){
		let _array;
		try{
			_array = sessionStorage.getItem(_synchroName);
			_array = JSON.parse(_array);
		}catch(e){
			_array = [];
		}
		
		if(!(_array instanceof Array)){
			_array = [];
		}
		
		if(_array.indexOf(location.pathname)<0){
			_array.push(location.pathname);
			sessionStorage.setItem(_synchroName,JSON.stringify(_array));
		}
		return this;
	}
	
	module.removeStorageWin = function(){
		let _array;
		try{
			_array = sessionStorage.getItem(_synchroName);
			_array = JSON.parse(_array);
		}catch(e){
			_array = [];
		}
		
		if(!(_array instanceof Array)){
			_array = [];
		}
		
		let _index = _array.indexOf(location.pathname);
		if(_index>-1){
			_array.splice(_index,1);
			sessionStorage.setItem(_synchroName,JSON.stringify(_array));
		}
		return this;
	}
	
	/**
	 * 注册消息
	 */
	module.regMessage = function(){
		WSynchro.on('synchronize', function (e) {
			console.info("收到消息",e);
			_this.setMessageState(true);
			if(new RegExp(location.pathname,"ig").test(e.id)){
				console.info("准备执行",e);
				if(e.callback){
					e.callback(window);
				}
			}
		   _this.setMessageState(false);
		});
		return this;
	}
	
	/**
	 * 发送消息
	 */
	module.sendMessage = function(option){
		let msg = {
	        id: location.pathname,
	    };
	    if (!this.getMessageState()) {
	        WSynchro.synchronize(option || msg);
	    }
	    return this;
	}
	
	/**
	 * 初始化模块
	 */
	module.init = function(){
		this.regMessage();
		return this;
	}
	
	module.init();
	
})(jQuery,_pageObject,_pageObject.SYNCHRO_MESSAGE={});
