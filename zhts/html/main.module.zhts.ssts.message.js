/**
 * 实时态势消息
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		_classWebSocketStomp,
		$content;
		
		
	let _ZHTS_SSTS_MESSAGE_HTTP,
		_ZHTS_SSTS_FILTER = {};
		
	toastr.options.timeOut = 1000*10;
	toastr.options.positionClass = "toast-bottom-left";
	/**
	 * 业务变量
	 */
	let _mbMap = new Map(),
		$message;
	
	module.getClassWebSocketStomp = function(){
		return _classWebSocketStomp;
	}
	
	module.setMessage = function(message){
		toastr.warning(message);
		return this;
	}
	
	/**
	 * set get callback
	 */
	module.setCallback = function(type,callback){
		_callback[type] = callback;
		return this;
	}
	module.getCallback = function(type){
		return _callback[type];
	}
	
	module.setFilterData = function(data){
		_ZHTS_SSTS_FILTER = data;
		return this;
	}
	
	/**
	 * 连接远程服务
	 */
	module.openConnection = function(){
			
			let _messageFilterMap = new Map();
			
			//综合态势目标系统--回调函数
			function onSSTS_ZHTS_MESSAGE(queueName,data,boolean){
				if(!data && !boolean){
					return;
				}
				
//				//判断是否在10秒内已经弹出过
//				let _prevDate = _messageFilterMap.get(data.mbbh);
//				if(!_prevDate){
//					_prevDate = new Date();
//					_messageFilterMap.set(data.mbbh,_prevDate);
//				}
//				
//				if(new Date().getTime()-_prevDate.getTime()<1000*10){
//					return;
//				}
//				_messageFilterMap.set(data.mbbh,new Date());
				
				if(!data.isRepeat){
					if(_ZHTS_SSTS_FILTER.message){
//						console.info(new Date(),data);
						_this.setMessage(data.title+"<br/>"+data.content);
					}

					if(_ZHTS_SSTS_FILTER.pause && data.mbbh){
						let _feature = parent.ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(data.mbbh);
						if(_feature){
							let _default = {
								pauseCount : 5,
								pauseTime :500,
								callback : function(feature){
									let _treeNode = parent.ZHTS_SSTS_TREE.getNodeById(data.mbbh);
									if(_treeNode){
										if(_treeNode.checked){
											feature.show();
										}else{
											feature.hide();
										}
									}
								}
							};
							WebLoader.classGIS.animateFeaturePause(_feature,_default);
							
//							let _default = {
//								type:'blink',
//						        duration:2000,
//						        nb:6,
//						        repeat:3
//							};
//							_feature.animate(_default);
//							$.each(_feature.linktags || [], function(index,el) {
//						   		el.animate(_default);
//							});
						}
					}
					
				}
			}
			
		//设置callback
		this.setCallback("SSTS_MESSAGE",onSSTS_ZHTS_MESSAGE);
		
		//配置连接
		let _default = {
			url : getModuleURL("system.ssts.url"),
			vhost: getModuleURL("system.ssts.vhost"),
			user : getModuleURL("system.ssts.user"),
			password : getModuleURL("system.ssts.password"),
			queueArray : _callback,
			onConnect : function(){
//				_this.setMessage("接入成功"+new Date)
//					.setSendMessage(true);
				_this.count = 0;
//				onTsZhtsMbSystemChannel(_this.testData()[0],true);
//				onTsZhtsMbSystemChannel(_this.testData()[1],true);
			},
			onError : function(e){
				_this.count += 1;
				_this.setMessage("系统错误"+new Date)
					.closeConnection()
					.clearMBs();
				
				if(_this.count>5){
					setTimeout(function(){
						_this.resetConnection();
					},10000);
				}
			},
			onClose : function(){
				_this.count += 1;
				_this.setMessage("断开连接"+new Date)
					.closeConnection()
					.clearMBs();
					
				if(_this.count>5){
					setTimeout(function(){
						_this.resetConnection();
					},10000);
				}
			}
		}
		_classWebSocketStomp.init(_default);
	}
	/**
	 * 重新连接
	 */
	module.resetConnection = function(){
		let _state = _classWebSocketStomp.getConnected();
		if(!_state){
			_this.setMessage("重新连接"+new Date);
			_classWebSocketStomp.openConnection();
			setTimeout(function(){
				_this.resetConnection();
			},5000);
		}
	}
	/**
	 * 关闭连接
	 */
	module.closeConnection = function(){
		_classWebSocketStomp.closeConnection();
		return this;
	};
	
	/**
	 * 通知服务器发送消息
	 * @param {Object} boolean
	 */
	module.setSendMessage = function(boolean){
		//$.getJSON("http://[IP已脱敏]"+getModuleURL("http.zhts.ssts.server.sendMessage")+"?isStart="+(boolean?"start":"end"));
	}
	
	/**
	 * socket stomp队列操作区
	 */
	module.addSocketQueue = function(queueName){
		let _classWebSocketStomp = this.getClassWebSocketStomp(),
			_call = this.getCallback(queueName);
		_classWebSocketStomp.addQueue(queueName,_call);
	}
	module.removeSocketQueue = function(queueName){
		let _classWebSocketStomp = this.getClassWebSocketStomp(),
			_call = this.getCallback(queueName);
		_classWebSocketStomp.removeQueue(queueName);
	}
	
	/**
	 * 初始化模块
	 */
	module.init = function(){
		_classWebSocketStomp = new ClassWebSocketStomp();
		
		_ZHTS_SSTS_MESSAGE_HTTP = parent.ZHTS_SSTS_MESSAGE_HTTP;
		_ZHTS_SSTS_MESSAGE_HTTP.init({
			callback : function(result){
				_this.setFilterData(result);
				_this.openConnection();
			}
		});
		
		$doc = $("#x-view-content"),
		$message = $doc.find("#accordion-zhts-message"),
		$messageContent = $doc.find("#window-accordion-panel .x-accordion-item:eq(0) .x-accordion-title:eq(0)");
//		_classWebSocketStomp.openDebug(true);
		return this;
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_MESSAGE={});

/**
 * 实时态势 http接口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {};
	
	/**
	 * 根据时间取所有目标
	 * @param {Object} data
	 */
	module.httpGetFilters = function(option){
		xUtilBase.ajax({
			url : "/data-server/api/warningtype/queryAll",
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					let _d = result.data[0];
					if(option && option.callback){
						option.callback(_d);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.init = function(option){
		this.httpGetFilters(option);
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_MESSAGE_HTTP={});
