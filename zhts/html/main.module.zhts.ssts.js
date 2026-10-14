/**
 * 实时态势
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
		
		
	let _ZHTS_SSTS_TREE,
		_ZHTS_SSTS_MUBIAO_DATA_FILTER,
		_ZHTS_SSTS_MUBIAO_CONTROL;
	
	/**
	 * 业务变量
	 */
	let _mbMap = new Map(),
		$message;
	
	module.getMBLBValue = function(mblb){
		let _s= "";
        if (mblb === '03') {//空中
            _s = "空中";
        } else if (mblb === '02') {//水面
             _s = "水面";
        }else if (mblb === '04') {//水下
            _s = "水下";
        }else if (mblb === '01') {//陆地
            _s = "陆地";
        }
        _s+= "目标";
        return _s;
	}
	
	module.getClassWebSocketStomp = function(){
		return _classWebSocketStomp;
	}
	
	module.setTitleMessage = function(message){
		if(!message){
			return this;
		}
		layer.tips(message, $messageContent,{
			anim:-1,
			isOutAnim: false
		});
		return this;
	}
	module.setMessage = function(message){
		if($message.data("message")!=message){
			$message.data("message",message);
			$message.html("<i class='iconfont fa fa-refresh'></i>&nbsp;"+message);
		}
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
	
	/**
	 * 添加数据节点
	 */
	module.addTreeNodes = function(){
		_ZHTS_SSTS_TREE.addNodes(arguments);
		return this;
	}
	module.clearMBs = function(){
		_ZHTS_SSTS_MUBIAO_CONTROL.clearLayers();		
	}
	
	/**
	 * 连接远程服务
	 */
	_this.count = 0;
	module.openConnection = function(){
		
			//综合态势目标系统--回调函数
			function onSSTS_ZHTSRHJG(queueName,data,boolean){
				let _filterState = onSSTS_ZHTSRHJGFilter(data);
				if(!_filterState && !boolean){
					return;
				}
				
				_this.count += 1;
//				_this.setMessage("实时数据"+new Date)
				_this.setMessage("实时数据");
//					.setTitleMessage("接收数量["+_this.count+"]<br/>接收目标："+data.mbmc+"<br/>经度："+data.jd+"<br/>纬度："+data.wd);
				
				let _treeNode = _ZHTS_SSTS_TREE.getNodeById(data.mbbh);
				if(!_treeNode){
//					console.info("接收数据"+data.mbbh+"，"+data.mbmc);
					let _node = {
						id : data.mbbh,
						name : (function(){
							let _name = data.mbmc;
							if(data.mblb=="03"){
								if(!/(\[|\])/g.test(_name) && data.jxh){
									_name += "["+data.jxh+"]";
								}
							}
							return _name;
						})(),
						pId : data.jbkh,
						checked : data.show,
						__gjdq : data.gjdq,
						__gjdqmc : data.gjdqmc,
						__mblb : data.mblb,
						__mblbmc : _this.getMBLBValue(data.mblb)
					};
					for(let i in _node){
						if(_node[i]==undefined || _node[i]==null){
							_node[i] = "不明";
						}
					}
					_this.addTreeNodes(null,0,[_node]);
				}else{
					//如果已经存在目标则参考treeNode中的状态
					data.show = _treeNode.checked;
				}
				
				data.__queueName = queueName;
				_ZHTS_SSTS_MUBIAO_DATA_FILTER.updateMBById(data.mbbh,data);
			}
			
			//综合态势目标系统--回调函数--过滤器
			let _SSTS_DEFAULT = _ZHTS_SSTS_MUBIAO_CONTROL.getSSTSDefault();
			function onSSTS_ZHTSRHJGFilter(data){
				if(!data){
					return false;
				}
				
				switch ((""+data.dwsx)){
					case "0":
						data.dwsx = "difang";
						data.dwsxmc = "difang";
						break;
					case "1":
						data.dwsx = "wofang";
						data.dwsxmc = "我方";
						break;
					case "2":
						data.dwsx = "youfang";
						data.dwsxmc = "友方";
						break;
					default:
						data.dwsx = "-1";
						data.dwsxmc = "不明";
						break;
				}
				
				data.jmsx = ""+data.mbjm;
				switch (data.jmsx){
					case "1":
						data.jmsx = "junyong";
						break;
					default:
						data.jmsx = "minyong";
						break;
				}
				
				let _isShow;
				if(!_SSTS_DEFAULT.MUBIAOSHOW.DIWOSHUXING.DIFANG && data.dwsx=="difang"){
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.DIWOSHUXING.WOFANG && data.dwsx=="wofang"){
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOLEIBIE.HAIQING && (data.mblb=="02"|| data.mblb=="04")){
					//02 水面,03 空中,04 水下,01 陆地
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOLEIBIE.KONGQING && data.mblb=="03"){
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOLEIBIE.LUQING && data.mblb=="01"){
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.JUNMINSHUXING.JUNYONG && data.jmsx=="junyong"){
					_isShow = "hide";
				}else if(!_SSTS_DEFAULT.MUBIAOSHOW.JUNMINSHUXING.MINYONG && data.jmsx=="minyong"){
					_isShow = "hide";
				}else{
					_isShow = "show";
				}
				
				data.show = _isShow=="show" ? true : false;
				return data.show;
			}
			
		//设置callback
		this.setCallback("SSTS_ZHTSRHJG",onSSTS_ZHTSRHJG);
		
		//配置连接
		let _default = {
			url : getModuleURL("system.ssts.url"),
			vhost: getModuleURL("system.ssts.vhost"),
			user : getModuleURL("system.ssts.user"),
			password : getModuleURL("system.ssts.password"),
			queueArray : _callback,
			onConnect : function(){
				_this.setMessage("接入成功"+new Date)
					.setSendMessage(true);
				_this.count = 0;
//				onTsZhtsMbSystemChannel(_this.testData()[0],true);
//				onTsZhtsMbSystemChannel(_this.testData()[1],true);
			},
			onError : function(e){
				_this.setMessage("系统错误"+new Date)
					.closeConnection()
					.clearMBs();
				setTimeout(function(){
					_this.resetConnection();
				},3000);
			},
			onClose : function(){
				_this.setMessage("断开连接"+new Date)
					.closeConnection()
					.clearMBs();
				setTimeout(function(){
					_this.resetConnection();
				},3000);
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
		//$.getJSON("http://192.168.1.103:9100"+getModuleURL("http.zhts.ssts.server.sendMessage")+"?isStart="+(boolean?"start":"end"));
	}
	
	/**
	 * socket stomp队列操作区
	 */
	module.addSocketQueue = function(queueName){
		let _classWebSocketStomp = this.getClassWebSocketStomp(),
			_call = this.getCallback(queueName);
		_classWebSocketStomp.addQueue(queueName,_call);
		
		let _controlModule = parent.ZHTS_SSTS_MUBIAO_CONTROL,
			_SSTS_DEFAULT = _controlModule.getSSTSDefault();
		_SSTS_DEFAULT.QUEUE_MQ.push(queueName);
		_controlModule.httpUpdateServerConfig();
	}
	module.removeSocketQueue = function(queueName){
		let _classWebSocketStomp = this.getClassWebSocketStomp(),
			_call = this.getCallback(queueName);
		_classWebSocketStomp.removeQueue(queueName);
		
		let _controlModule = parent.ZHTS_SSTS_MUBIAO_CONTROL,
			_SSTS_DEFAULT = _controlModule.getSSTSDefault();
		let _index = _SSTS_DEFAULT.QUEUE_MQ.indexOf(queueName);
		if(_index>-1){
			_SSTS_DEFAULT.QUEUE_MQ.splice(_index,1);
			_controlModule.httpUpdateServerConfig();
		}
	}
	
	/**
	 * 初始化模块
	 */
	module.init = function(){
		
		_ZHTS_SSTS_TREE = parent.ZHTS_SSTS_TREE,
		_ZHTS_SSTS_TREE_GROUP = parent.ZHTS_SSTS_TREE_GROUP,
		_ZHTS_SSTS_MUBIAO_DATA_FILTER = parent.ZHTS_SSTS_MUBIAO_DATA_FILTER,
		_ZHTS_SSTS_MUBIAO_CONTROL = parent.ZHTS_SSTS_MUBIAO_CONTROL;
		
		_ZHTS_SSTS_TREE.init();
		_ZHTS_SSTS_TREE_GROUP.init();
		_ZHTS_SSTS_MUBIAO_DATA_FILTER.init();
		_ZHTS_SSTS_MUBIAO_CONTROL.init();
		parent.ZHTS_SSTS_HTTP.init();
		
		$doc = $("#x-view-content"),
		$message = $doc.find("#accordion-zhts-message"),
		$messageContent = $doc.find("#window-accordion-panel .x-accordion-item:eq(0) .x-accordion-title:eq(0)");
		_classWebSocketStomp = new ClassWebSocketStomp();
//		_classWebSocketStomp.openDebug(true);
		return this;
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS={});

/**
 * 实时态势树 ztree
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		$ztree,_treeObj;
	
	let _ZHTS_SSTS_TREE_GROUP;
	
	/**
	 * 生成ztree tree
	 */
	module.initTree =  function(){
			
		//复选框事件
        function onCheck(event, treeId, treeNode) {
        	//如果是父节点
        	if(treeNode.children){
        		let _controlNodeArray = _this.getNodes(treeNode.children || []);
        		$.each(_controlNodeArray,function(index,el){
        			if(!/^root/.test(el.id)){
        				let _feature = parent.ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(el.id);
			        	if(_feature){
			        		if(treeNode.checked){
				        		_feature.show();
				        		_ZHTS_SSTS_TREE_GROUP.setNodeShow(el.id,true);
				        	}else{
				        		_feature.hide();
				        		_ZHTS_SSTS_TREE_GROUP.setNodeShow(el.id,false);
				        	}
			        	}
        			}
        		});
        	}else{
        		let _feature = parent.ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(treeNode.id);
	        	if(_feature){
	        		if(treeNode.checked){
		        		_feature.show();
		        		_ZHTS_SSTS_TREE_GROUP.setNodeShow(treeNode.id,true);
		        	}else{
		        		_feature.hide();
		        		_ZHTS_SSTS_TREE_GROUP.setNodeShow(treeNode.id,false);
		        	}
	        	}
        	}
        }
        
        function onDblClick(event, treeId, treeNode){
        	if(!treeNode || treeNode.children){
        		return;
        	}
        	
        	parent.MAPCONTROL.setFeaturePositionAnimateById(treeNode.id);
        }
        
        let _setting = {
            check: {
                enable: true,
                chkStyle: "checkbox",
//	            chkStyle: "radio",
//              autoCheckTrigger : true
            },
            data: {
                simpleData: {
					enable: true
				}
            },
            callback: {
                onCheck: onCheck,
                onDblClick : onDblClick
            }
        };
        
        let _classZTree = new ClassZTree();
        _classZTree.init({
            element: $ztree,
            setting: _setting,
            zNodes: [],
        });
        _treeObj = _classZTree.getZTreeObj();
        
        _this.addNodeRoots();
        let _nodeRoot = _this.getNodeById("root");
        _treeObj.expandNode(_nodeRoot,true,false);
//      $ztree.parent().addMCustomScrollbar();
	}
	module.addNodeRoots = function(){
		let _nodes = [{
        	id : "root",
			name : "态势目标列表",
			pId : 0,
			checked : false,
			isParent : true,
        }];
        _treeObj.addNodes(null,-1,_nodes);
	}
	module.getNodes = function(nodes){
		let _array = [];
		function getNodes(nodes){
			$.each(nodes, function(index,el) {
				_array.push(el);
				if(el.children){
					getNodes(el.children);
				}
			});
		}
		getNodes(nodes);
		return _array;
	}
	module.getNodesFilterByParent = function(nodes){
		let _array = [];
		function getNodes(nodes){
			$.each(nodes, function(index,el) {
				if(el.children){
					getNodes(el.children);
				}else{
					_array.push(el);
				}
			});
		}
		getNodes(nodes);
		return _array;
	}
	
	/**
	 * 添加节点
	 * @param {Object} nodes
	 */
	module.addNodes = function(){
		let _arguments = arguments[0];
		let _nodes = _arguments[2],
			_nodeRoot = _this.getNodeById("root");
			
		if(!_nodeRoot){
			_this.addNodeRoots();
			_nodeRoot = _this.getNodeById("root");
		}
		
		$.each(_nodes, function(index,el) {
			if(!el.id || !el.name){
				console.warn("id or name is null"+new Date);
			}
			
			_ZHTS_SSTS_TREE_GROUP.setNodeShow(el.id,true);
			
			//如果国家和目标类别没有node则添加
			let _nodeGJDQ = _this.getNodeById(_nodeRoot.id+"_"+el.__gjdqmc);
			if(!_nodeGJDQ){
				_nodeGJDQ = {
					id : "root_"+el.__gjdqmc,
					name : el.__gjdqmc+" (0)",
					pId : "root",
					icon : WebLoader.getImageURL(el.__gjdq),
//					checked : _nodeRoot.checked,
//					checked : false
				};
				_treeObj.addNodes(_nodeRoot,-1,[_nodeGJDQ]);
				_nodeGJDQ = _this.getNodeById(_nodeGJDQ.id);
			}
			
			let _nodeMBLB = _this.getNodeById(_nodeGJDQ.id+"_"+el.__mblb);
			if(!_nodeMBLB){
				_nodeMBLB = {
					id : _nodeGJDQ.id+"_"+el.__mblb,
					name : el.__mblbmc+" (0)",
					pId : _nodeGJDQ.id,
//					checked : _nodeGJDQ.checked
				};
				_nodeMBLB.icon = (function(){
					let _url;
					switch (el.__mblb){
						case "02":
							_url = WebLoader.getImageURL("boat");
							break;
						case "04":
							_url = WebLoader.getImageURL("boat");
							break;
						case "03":
							_url = WebLoader.getImageURL("plane");
							break;
						default:
							break;
					}
					return _url;
				})();
				
				_treeObj.addNodes(_nodeGJDQ,-1,[_nodeMBLB],true);
				_nodeMBLB = _this.getNodeById(_nodeMBLB.id);
			}
			
			//修正checked状态
//			el.checked = _nodeMBLB.checked;
			el.icon = _nodeMBLB.icon || (function(){
				let _url;
				switch (el.__mblb){
					case "02":
						_url = WebLoader.getImageURL("boat");
						break;
					case "04":
						_url = WebLoader.getImageURL("boat");
						break;
					case "03":
						_url = WebLoader.getImageURL("plane");
						break;
					default:
						break;
				}
				return _url;
			})();
			_treeObj.addNodes(_nodeMBLB,-1,[el],true);
			
			_nodeMBLB.name = _nodeMBLB.name.replace(/\(\d+\)/, "("+_this.getNodesFilterByParent([_nodeMBLB]).length+")");
			_treeObj.updateNode(_nodeMBLB);
			
			_nodeGJDQ.name = _nodeGJDQ.name.replace(/\(\d+\)/, "("+_this.getNodesFilterByParent([_nodeGJDQ]).length+")");
			_treeObj.updateNode(_nodeGJDQ);
		});
		
		_nodeRoot.name = _nodeRoot.name.replace(/\(\d+\)/, "");
		_nodeRoot.name += " ("+_this.getNodesFilterByParent([_nodeRoot]).length+")";
		_treeObj.updateNode(_nodeRoot);
		
	}
	module.getTreeObj = function(){
		return _treeObj;
	}
	module.getNodeById = function(id){
		return _treeObj.getNodeByParam("id",id);
	}
	
	module.init = function(){
		_ZHTS_SSTS_TREE_GROUP = parent.ZHTS_SSTS_TREE_GROUP;
		
		$doc = $("#x-view-content");
		$ztree = $("#accordion-ztree-zhts");
		this.initTree();
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_TREE={});

/**
 * 目标数据过滤
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		_ZHTS_SSTS_MUBIAO_CONTROL;
	
	/**
	 * 取出目标数据
	 * @param {Object} id
	 */
	module.getMBById = parent.ZHTS_SSTS.getMBById;
	
	/**
	 * 添加目标
	 * @param {Object} id
	 */
	module.addFeature = function(id,data){
		let _result = this.formatDataToFeatureBase(data);
		_ZHTS_SSTS_MUBIAO_CONTROL.addTracker(_result);
	}
	module.updateFeature = function(id,data){
		let _result = this.formatDataToFeatureBase(data);
		_ZHTS_SSTS_MUBIAO_CONTROL.updateTracker(id,_result);
	}
	module.updateMBById = function(id,data){
		let _mb = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(id);
		
		if(!_mb){
			this.addFeature(id,data);
		}else{
			this.updateFeature(id,data);
		}
	}
	module.formatDataToFeatureBase = function(data){
		//格式化数据到标准Feature
		let _default = {
			id : data.mbbh,
			name : data.mbmc,
			coordinates : [data.jd,data.wd],
			ph : data.ph,
			dwsx : data.dwsx,
			mblb : data.mblb,
			jbkh : data.jbkh,
			jbdh : data.jbdh,
			show : data.show,
			rotation : 0
		};
		let _HJLayer,_color;
		if(_default.dwsx=="wofang"){
			_HJLayer = _ZHTS_SSTS_MUBIAO_CONTROL.getLayerHJWOFANG();
			_color = "red";
		}else{
			_HJLayer = _ZHTS_SSTS_MUBIAO_CONTROL.getLayerHJDIFANG();
			_color = "blue";
		}
		
		//设置图标的锚点
        let _anchor = [0.5, 0.5];
        if (data.mblb === '03') {//空中
            _anchor = [0.5, 0.9];
            _default.jbkh = _default.jbkh || 32;
            _default.jbdh = _default.jbdh || 7200;
        } else if (data.mblb === '02') {//水面
            _anchor = [0.1, 0.5];
            _default.jbkh = _default.jbkh || 32;
            _default.jbdh = _default.jbdh || 6800;
        }else if (data.mblb === '04') {//水下
            _anchor = [0.1, 0.5];
            _default.jbkh = _default.jbkh || 32;
            _default.jbdh = _default.jbdh || 6800;
        }else if (data.mblb === '01') {//陆地
            _anchor = [0.5, 0.5];
            _default.jbkh = _default.jbkh || 32;
            _default.jbdh = _default.jbdh || 5201;
        }
        
        let _SSTS_DEFAULT = _ZHTS_SSTS_MUBIAO_CONTROL.getSSTSDefault();
		let _feature = {
			id:_default.id,
	        rotation:_default.rotation,
	        coordinates:_default.coordinates,
	        icon :{
	        	anchor : _anchor,
	        	src : '/plot-service/plot/api/getJB?JBKH='+_default.jbkh+'&JBDH='+_default.jbdh+'&CC='+_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOCHICUN+'&JBYS='+(function(){
	        		let _s;
	        		if(_default.dw=="wofang"){
	        			_s = "R"
	        		}else{
	        			_s = "B";
	        		}
	        		return _s;
	        	})()
	        },
	        hjLayer:_HJLayer,
		}
		
		$.extend(true, _default, {
			color : _color,
			feature : _feature,
			jmsx : data.mbjm=="1"?"junyong":"minyong",
			__cache : data
		});
		
		return _default;
	}
	
	module.init = function(){
		_ZHTS_SSTS_MUBIAO_CONTROL = parent.ZHTS_SSTS_MUBIAO_CONTROL;
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_MUBIAO_DATA_FILTER={});

/**
 * 目标控制
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,_callback={},
		_moduleName = "zhts.ssts.mubiao.control",
		$doc;
		
	let _mapAPI=top._beyonmap,
		ZKMap = top.ZKMap,
		map2d=top.map2d,
		_map = map2d,
		ol=top.ol;
	
	let _layerMap=new Map(),
		_layer_MUBIAO,
		_layer_MUBIAO_TRACKER,
		_layerHJ_WOFANG,_layerHJ_DIFANG,
		_layerHJ_WOFANG_LISHI,_layerHJ_DIFANG_LISHI,
		_mubiaoMap=new Map();
	
	let _ZHTS_SSTS,
		_ZHTS_SSTS_TREE,
		_ZHTS_SSTS_MUBIAO_CONTEXTMENU;
	
	/**
	 * 默认配置
	 */
	let _SSTS_DEFAULT = {
		QUEUE_MQ: ["SSTS_ZHTSRHJG"],
		MUBIAOSHOW : {
			DIWOSHUXING : {
				DIFANG : true,
				WOFANG : true
			},
			MUBIAOLEIBIE : {
				HAIQING : true,
				KONGQING : true,
				LUQING : true
			},
			JUNMINSHUXING : {
				JUNYONG : true,
				MINYONG : true
			},
			BIAOPAISHEZHI : true,
			MUBIAODAXIAO : 0.5,
			MUBIAOCHICUN : 64,
		},
		GUIJI :{
			DIFANG :{
				HANGJILEIBIE : "line_point",
				HANGJILEIXING : 1,
				HANGJICUXI : 1,
				HANGJIYANSE : "blue",
				ZIHAODAXIAO : "12px"
			},
			WOFANG :{
				HANGJILEIBIE : "line_point",
				HANGJILEIXING : 1,
				HANGJICUXI : 1,
				HANGJIYANSE : "red",
				ZIHAODAXIAO : "12px"
			},
		},
		XIAOSHI : {
			KONGZHONG : 480,
			SHUIMIAN : 480,
			LUDI : 480
		}
	};
	
	module.getModuleName = function(){
		return _moduleName;
	}
	module.getMap = function(){
		return _mapAPI.getMap();
	}
	module.getSSTSDefault = function(){
		return _SSTS_DEFAULT;
	}
	module.setSSTSDefault = function(data){
		if(!data){
			return this;
		}
		_SSTS_DEFAULT = data;
		return this;
	}
	module.httpUpdateServerConfig = function(option){
		let _default = this.getSSTSDefault();
		if(!_default.MUBIAOSHOW.MUBIAOCHICUN){
			_default.MUBIAOSHOW.MUBIAOCHICUN = 64;
		}
		let _url = getModuleURL("http.zhts.ssts.server.config.add"),
			_data = {
				type : "zhts",
				lastSetting : JSON.stringify(_default)
			},
			_sendData = JSON.stringify(_data);
			
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
//					console.info("保存配置成功");
					let _module = getModuleWindowByName("module.taishi.system.set");
					if(_module){
						_module.layui.layer.msg("保存配置成功",{offset:"rt"});
					}
					if(option && option.callback){
						option.callback();
					}
				}else{
					layui.layer.msg(result["message"]);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
	}
	
	/**
	 * 获取服务器配置参数
	 * @param {Object} option
	 */
	module.httpGetServerConfigById = function(option){
		let _url = getModuleURL("http.zhts.ssts.server.config.getById"),
			_data = {
				type : "zhts"
			};
			
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					_this.__isQueryServerConfig = true;
					if(option && option.callback){
						option.callback(result.data);
					}
				}else{
					layui.layer.msg(result["message"]);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
	}
	/**
	 * 是否查询过服务器配置
	 */
	module.getIsQueryServerConfig = function(){
		return this.__isQueryServerConfig;
	}
	
	/**
	 * 添加航迹图层
	 */
	module.addLayers = function(){
		this.removeLayersHJ();
//      _mapAPI.viewer.setCenter([-51.217655, -30.034644999999998]);
//      _mapAPI.viewer.setZoom(9);
		let _defaultWOFANG = {
			moduleName : this.getModuleName()+".wofang",
			hjColor:_SSTS_DEFAULT.GUIJI.WOFANG.HANGJIYANSE ||'red',
	        hjStrokeWidth:_SSTS_DEFAULT.GUIJI.WOFANG.HANGJICUXI || 1,
	        hjShape:_SSTS_DEFAULT.GUIJI.WOFANG.HANGJILEIBIE || ZKMap.HJShape.LINE,
	        hjPointsCount : Number(_SSTS_DEFAULT.GUIJI.WOFANG.HANGJILEIXING) || Number.MAX_VALUE,
	        hjLinePoint : new ol.style.Style({
	        	image:new ol.style.Circle({
                    radius:2,
                    fill:new ol.style.Fill({
                        color:'#fff'
                    }),
                    stroke:new ol.style.Stroke({
                        width:1,
                        color:_SSTS_DEFAULT.GUIJI.WOFANG.HANGJIYANSE||'red'
                    })
                })
	        }),
		};
		_layerHJ_WOFANG = _mapAPI.layerManager.addHjImageLayer(_defaultWOFANG);
		
		let _defaultWOFANG_LISHI = $.extend(true, {}, _defaultWOFANG);
		$.extend(true, _defaultWOFANG_LISHI, {
			id : "___hj___2",
			moduleName : this.getModuleName()+".wofang.lishi",
			
		})
	    _layerHJ_WOFANG_LISHI = _mapAPI.layerManager.addHjImageLayer(_defaultWOFANG_LISHI);
	    
	    let _defaultDIFANG = {
	    	moduleName : this.getModuleName()+".difang",
			hjColor:_SSTS_DEFAULT.GUIJI.DIFANG.HANGJIYANSE ||'blue',
	        hjStrokeWidth:_SSTS_DEFAULT.GUIJI.DIFANG.HANGJICUXI || 1,
	        hjShape:_SSTS_DEFAULT.GUIJI.DIFANG.HANGJILEIBIE || ZKMap.HJShape.LINE,
	        hjPointsCount : Number(_SSTS_DEFAULT.GUIJI.DIFANG.HANGJILEIXING) || Number.MAX_VALUE,
	        hjLinePoint : new ol.style.Style({
	        	image:new ol.style.Circle({
                    radius:2,
                    fill:new ol.style.Fill({
                        color:'#fff'
                    }),
                    stroke:new ol.style.Stroke({
                        width:1,
                        color:_SSTS_DEFAULT.GUIJI.DIFANG.HANGJIYANSE||'blue'
                    })
                })
	        }),
		};
	    _layerHJ_DIFANG = _mapAPI.layerManager.addHjImageLayer(_defaultDIFANG);
	    
//	    var _clusterSource = new ol.source.Cluster({
//			distance: 40,
//			source: new ol.source.Vector()
//		});
//		// Animated cluster layer
//		var _clusterLayer = new ol.layer.AnimatedCluster({
//			id : "___hj___3",
//			moduleName : this.getModuleName()+".difang.lishi",
//			source: _clusterSource,
//	        displayInLayerSwitcher: false,
//			animationDuration: 700,
//			// Cluster style
//			style: function(feature, resolution) {
//				var size = feature.get('features').length;
//				var style = styleCache[size];
//				if(!style) {
//					var color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
//					var radius = Math.max(8, Math.min(size * 0.75, 20));
//					var dash = 2 * Math.PI * radius / 6;
//					dash = [0, dash, dash, dash, dash, dash, dash];
//					style = styleCache[size] = [new ol.style.Style({
//						image: new ol.style.Circle({
//							radius: radius,
//							stroke: new ol.style.Stroke({
//								color: "rgba(" + color + ",0.5)",
//								width: 15,
//								lineDash: dash
//							}),
//							fill: new ol.style.Fill({
//								color: "rgba(" + color + ",1)"
//							})
//						}),
//						text: new ol.style.Text({
//							text: size.toString(),
//							fill: new ol.style.Fill({
//								color: '#fff'
//							})
//						})
//					})];
//				}
//				return style;
//			}
//		});
//		_mapAPI.getMap().addLayer(_clusterLayer);
//		_layerHJ_DIFANG_LISHI = _clusterLayer;
		
	    let _defaultDIFANG_LISHI = $.extend(true, {}, _defaultDIFANG);
		$.extend(true, _defaultDIFANG_LISHI, {
			id : "___hj___3",
			moduleName : this.getModuleName()+".difang.lishi",
		})
	    _layerHJ_DIFANG_LISHI = _mapAPI.layerManager.addHjImageLayer(_defaultDIFANG_LISHI);
//	    _layerHJ_DIFANG.style.point.setStroke(new ol.style.Stroke({
//          color: '#3399CC',
//          width: 10,
//      }));
//      
//      let _hjlx = _layerHJ_DIFANG.style.point,
//      	_difangImage = _hjlx.getImage();
//      _difangImage.getStroke().setColor("green"||_SSTS_DEFAULT.GUIJI.DIFANG.HANGJIYANSE || "blue");
//      debugger;
//      	_hjlx = _layerHJ_DIFANG.style.point_line,
//      	_difangImage = _hjlx.getImage();
//      _difangImage.getStroke().setColor(_SSTS_DEFAULT.GUIJI.DIFANG.HANGJIYANSE || "blue");
	    return this;
	}
	module.initLayerArray = function(){
		let _map = new Map();
		$.each(parent.MAPCONTROL.getLayerArray(), function(index,el) {
			let _id = el.get("id");
//			console.info(_id);
			if(/^___hj___/.test(_id)){
				_map.set(_id,el);
			}else if(/^___tracker___$/.test(_id)){
				_this.setLayerMuBiao(el);
				_map.set(_id,el);
			}if(/^___link/.test(_id)){
				_map.set(_id,el);
				if(/^___link_tag___$/.test(_id)){
					_layer_MUBIAO_TRACKER = el;
				}
			}
		});
		_layerMap = _map;
		return this;
	}
	module.getLayerMap = function(){
		return _layerMap;
	}
	module.setLayerMuBiao = function(layer){
		_layer_MUBIAO = layer;
		return this;
	}
	module.getLayerMuBiao = function(){
		return _layer_MUBIAO;
	}
	module.getLayerHJByType = function(type){
		let _layer,_id;
		this.getLayerMap().forEach(function(value,key){
			_id = value.get("id");
			if(type=="wofang" && /^___hj___0/.test(_id)){
				_layer = value;
			}else if(type=="difang" && /^___hj___1/.test(_id)){
				_layer = value;
			}
		});
		return _layer;
	}
	module.getLayerHJWOFANG = function(){
		return _layerHJ_WOFANG;
	}
	module.getLayerHJDIFANG = function(){
		return _layerHJ_DIFANG;
	}
	module.removeLayersHJ = function(){
		return this;
		_mapAPI.getMap().removeLayer(_layerHJ_WOFANG);
		_mapAPI.getMap().removeLayer(_layerHJ_WOFANG_LISHI);
		_mapAPI.getMap().removeLayer(_layerHJ_DIFANG);
		_mapAPI.getMap().removeLayer(_layerHJ_DIFANG_LISHI);
	}
	module.clearLayers = function(){
		this.clearLayerFeaturesMBs();
		this.getLayerMap().forEach(function(value,key){
			value.clear();
		});
		return this;
	}
	
	
	/**
	 * 目标操作区域
	 */
	module.getLayerFeaturesMB = function(){
		if(_layer_MUBIAO){
			return _layer_MUBIAO.getSource().getFeatures();
		}
		return [];
	}
	module.getFeatureById = function(id){
		if(_layer_MUBIAO){
			return _layer_MUBIAO.getSource().getFeatureById(id);
		}
	}
	module.clearLayerFeaturesMBs = function(){
		if(_layer_MUBIAO){
			_layer_MUBIAO.getSource().clear();
		}
		return this;
	}
	
	/**
	 * 设置敌我显示
	 */
	module.setLayerFeatureShowDW = function(dw,show){
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			if(value.get("__dwsx")==dw){
				if(show===true){
					value.show();
				}else if(show===false){
					value.hide();
				}
				value.changed();
			}
		});
		_SSTS_DEFAULT.MUBIAOSHOW.DIWOSHUXING[dw.toUpperCase()] = show;
		this.httpUpdateServerConfig();
	}
	module.setLayerFeatureShowMBLB = function(mblb,show){
		let _mblbNumber = "null";
		if(mblb=="haiqing"){
			_mblbNumber = "02";
		}else if(mblb=="kongqing"){
			_mblbNumber = "03";
		}else if(mblb=="luqing"){
			_mblbNumber = "01";
		}
		
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			let _cache = value.get("__cache");
			if(_cache.mblb==_mblbNumber){
				if(show===true){
					value.show();
				}else if(show===false){
					value.hide();
				}
				value.changed();
			}
		});
		_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOLEIBIE[mblb.toUpperCase()] = show;
		this.httpUpdateServerConfig();
	}
	module.setLayerFeatureShowJMSX = function(jmsx,show){
		let _jmsxNumber = jmsx=="junyong" ? "1" : "2";
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			let _cache = value.get("__cache");
			if((""+_cache.mbjm)===_jmsxNumber){
				if(show===true){
					value.show();
				}else if(show===false){
					value.hide();
				}
				value.changed();
			}
		});
		_SSTS_DEFAULT.MUBIAOSHOW.JUNMINSHUXING[jmsx.toUpperCase()] = show;
		this.httpUpdateServerConfig();
	}
	/**
	 * 显隐所有标牌，包含线的控制
	 * @param {Object} boolean
	 */
	module.setLayerFeatureLabelsShow = function(boolean){
		let _isShow;
		if(boolean.toString()==="true"){
			_isShow = true;
		}else if(boolean.toString()==="false"){
			_isShow = false;
		}
		map2d.getDefaultLinkTagLayer().setVisible(_isShow);
		_SSTS_DEFAULT.MUBIAOSHOW.BIAOPAISHEZHI = _isShow;
		this.httpUpdateServerConfig();
		return this;
	}
	/**
	 * 对Feature进行缩放，大号、中号、小号
	 */
	module.setLayerFeatureSize = function(size){
		let _int = Number(size);
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			value.setScale(_int);
			value.changed();
		});
		_SSTS_DEFAULT.MUBIAOSHOW.MUBIAODAXIAO = _int;
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 设置航迹类别
	 * @param {Object} dw
	 * @param {Object} type
	 */
	module.setLayerHJLEIBIE = function(dw,type){
		let _layer;
		if(dw=="wofang"){
			_layer = _layerHJ_WOFANG;
		}else if(dw=="difang"){
			_layer = _layerHJ_DIFANG;
		}
		_layer.hjConfig.setHJShape(ZKMap.HJShape[type.toString().toUpperCase()]);
		_SSTS_DEFAULT.GUIJI[dw.toUpperCase()].HANGJILEIBIE = type;
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 设置航迹粗细
	 * @param {Object} dw
	 * @param {Object} width
	 */
	module.setLayerHJLineWidth = function(dw,width){
		let _int = Number(width),
			_layer;
		if(dw=="wofang"){
			_layer = _layerHJ_WOFANG;
		}else if(dw=="difang"){
			_layer = _layerHJ_DIFANG;
		}
		_layer.hjConfig.setHjStrokeWidth(_int);
		_SSTS_DEFAULT.GUIJI[dw.toUpperCase()].HANGJICUXI = _int;
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 设置航迹color
	 * @param {Object} dw
	 * @param {Object} color
	 */
	module.setLayerHJLineColor = function(dw,color){
		let _layer;
		if(dw=="wofang"){
			_layer = _layerHJ_WOFANG;
		}else if(dw=="difang"){
			_layer = _layerHJ_DIFANG;
		}
		_layer.hjConfig.setHjColor(color);
		_layer.hjConfig.setHjLinePoint(new ol.style.Style({
        	image:new ol.style.Circle({
                radius:2,
                fill:new ol.style.Fill({
                    color:'#fff'
                }),
                stroke:new ol.style.Stroke({
                    width:1,
                    color:color
                })
            })
        }));
		
		_SSTS_DEFAULT.GUIJI[dw.toUpperCase()].HANGJIYANSE = color;
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 设置航迹类型，全、中、短、无
	 * @param {Object} dw
	 * @param {Object} type
	 */
	module.setLayerHJLEIXING = function(dw,num){
		let _int = Number(num) || Number.MAX_VALUE;
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			let _dw = value.get("__dwsx");
			if(_dw==dw){
				value.setHjPointsCount(_int);
			}
		});
		_SSTS_DEFAULT.GUIJI[dw.toUpperCase()].HANGJILEIXING = num;
		this.httpUpdateServerConfig();
	}
	/**
	 * 设置轨迹字号大小
	 * @param {Object} dw
	 * @param {Object} size
	 */
	module.setLayerFeatureFontSize = function(dw,size){
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			let _dw = value.get("__dwsx");
			if(_dw==dw){
				$.each(value.linktags, function(i,e) {
					if(e.get("name")=="content"){
						e.setFont(size+' Calibri,sans-serif');
						e.changed();
					}
				});
				value.changed();
			}
		});
		_SSTS_DEFAULT.GUIJI[dw.toUpperCase()].ZIHAODAXIAO = size;
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 修改颜色变灰，功能待定
	 */
	module.setLayerFeatureColor = function(){
		$.each(this.getLayerFeaturesMB(), function(key,value) {
			let _icon = value.get("icon");
			_icon.src = _icon.src.replace(/JBYS=[a-z]+/i,"JBYS=H");
			value.changed();
		});
	}
	
	/**
	 * 设置消失时间
	 */
	module.setLayerFeatureHide = function(mblb,num){
		if(!_SSTS_DEFAULT.XIAOSHI){
			_SSTS_DEFAULT.XIAOSHI = {};
		}
		_SSTS_DEFAULT.XIAOSHI[mblb.toUpperCase()] = Number(num);
		this.httpUpdateServerConfig();
	}
	
	/**
	 * 定时清除feature
	 */
	module.setIntervalFeature = function(){
		if(!_SSTS_DEFAULT.XIAOSHI){
			_SSTS_DEFAULT.XIAOSHI = {};
		}
		
		try{
			let _mbs = this.getLayerFeaturesMB();
			for(let i=_mbs.length-1;i>-1;i--){
				let _mb = _mbs[i];
				let _cache = _mb.get("__cache");
				let _ksDate = _mb.get("__date");

				if(_cache && _cache.mblb){
					let _wzsj = _cache["wzsj"],
						_jsDate = new Date();
					
					let _time;
					if((""+_cache.mblb)=="01" && _SSTS_DEFAULT.XIAOSHI.LUDI){
						_time = _SSTS_DEFAULT.XIAOSHI.LUDI;
					}else if((""+_cache.mblb)=="02" && _SSTS_DEFAULT.XIAOSHI.SHUIMIAN){
						_time = _SSTS_DEFAULT.XIAOSHI.SHUIMIAN;
					}else if((""+_cache.mblb)=="03" && _SSTS_DEFAULT.XIAOSHI.KONGZHONG){
						_time = _SSTS_DEFAULT.XIAOSHI.KONGZHONG;
					}
					
					if(_time){
						if(_jsDate.getTime()-_ksDate.getTime()>_time*1000*60){
							try{
								_mb.remove();
							}catch(e){
								console.warn(e.message);
							}
							
							//找到tree中目标进行删除
							let _treeModule = parent.ZHTS_SSTS_TREE;
							let _treeModuleGroup = parent.ZHTS_SSTS_TREE_GROUP;
							let _nodes = _treeModule.getNodes(_treeModule.getTreeObj().getNodes());
							for(let i = _nodes.length-1;i>-1;i--){
								let _node = _nodes[i];
								if(_node.id==_cache.mbbh){
									_treeModule.getTreeObj().removeNode(_node);
									_treeModuleGroup.setNodeShow(_node.id,false);
								}
							}
							
							//判断态势分组中目标是否需要置灰
						}
					}
				}
			}
		}catch(e){
			//TODO handle the exception
		}
		
		setTimeout(function(){
			_this.setIntervalFeature();
		},1000*60);
	}
	
		
		/**
		 * 模板LineTrg
		 * @param {Object} data
		 */
		function createTemplateLineTag0(data){
	    	return [
	        	data.mbmc || data.jxh,
	        	data.gjdqmc,
//	            '类型：'+parent.ZHTS_SSTS.getMBLBValue(data.mblb),
//	            '时间：'+data.sbsj
	        ];
	    }
	    function createTemplateLineTag1(data){
	    	let _array = [];
	    	_array.push('名称：'+data.mbmc);
	    	_array.push('国家：'+data.gjdqmc);
	    	data.jd ? _array.push('经度：'+GPS.formatDegree("lon",data.jd)) : "";
	    	data.wd ? _array.push('纬度：'+GPS.formatDegree("lat",data.wd)) : "";
	    	data.hx ? _array.push('航向：'+parseInt(data.hx)) : "";
	    	data.sd ? _array.push( '速度：'+parseInt(data.sd)+" km/h") : "";
	    	data.gsd ? _array.push('高/深：'+data.gsd) : "";
	    	_array.push('编码：'+data.mbbh);
	    	data.mbzwmc ? _array.push('中文：'+data.mbzwmc) : "";
	    	data.mblb ? _array.push('类型：'+_ZHTS_SSTS.getMBLBValue(data.mblb)) : "";
	    	data.mbflmc ? _array.push('分类：'+data.mbflmc) : "";
	    	data.ph ? _array.push('机弦号：'+data.jxh) : "";
	    	data.hqsds ? _array.push('手段：'+data.hqsds) : "";
	    	data.jbkh ? _array.push('库号：'+data.jbkh) : "";
	    	data.jbdh ? _array.push('代号：'+data.jbdh) : "";
	    	data.wzsj ? _array.push('时间：'+data.wzsj) : "";
	    	return _array;
	    }
	    
	module.addTracker = function(option){
		if(!option){
			return;
		}
		if(this.getFeatureById(option.id)){
			return;
		}
		
		if(option.feature && option.feature.icon){
			$.extend(true, option.feature.icon,{
				scale : Number(_SSTS_DEFAULT.MUBIAOSHOW.MUBIAODAXIAO)
			});
		}
		
		let _dw = option.dwsx,
			_cache = option.__cache;
		
//		let coordinates = [[-51.217655,-30.034644999999998],[-51.217651000000004,-30.034643000000003],[-51.217586000000004,-30.034547000000003],[-51.217586000000004,-30.034547000000003],[-51.217624,-30.034433],[-51.217742,-30.034341000000005],[-51.217742,-30.034341000000005],[-51.21794100000001,-30.034282000000005],[-51.21796000000001,-30.034275000000015],[-51.217990000000015,-30.034244],[-51.217990000000015,-30.034244],[-51.21800600000002,-30.034178999999995],[-51.21853200000001,-30.033462],[-51.21898200000001,-30.032844000000004],[-51.21908100000002,-30.032720000000012],[-51.21908100000002,-30.032720000000012],[-51.21918100000002,-30.032596000000005],[-51.21934500000002,-30.03234100000001],[-51.21940600000001,-30.032205000000005],[-51.21942100000002,-30.03204500000001],[-51.219390000000026,-30.03191300000001],[-51.219318000000015,-30.031766000000005],[-51.219039000000016,-30.031417000000005],[-51.21899000000002,-30.031279999999995],[-51.21898200000001,-30.031135],[-51.218997000000016,-30.031047000000008],[-51.218997000000016,-30.031047000000008],[-51.219135000000016,-30.030666000000004],[-51.219390000000026,-30.02929800000002],[-51.219390000000026,-30.02929800000002],[-51.21939800000002,-30.028841999999997],[-51.21940900000002,-30.02852200000003],[-51.21951600000002,-30.02710900000001],[-51.21951200000003,-30.026958000000015],[-51.219478000000024,-30.026811000000016],[-51.21896700000003,-30.025621000000008],[-51.21890600000002,-30.025396000000008],[-51.21889800000002,-30.025247000000007],[-51.21890600000002,-30.025129000000007],[-51.21897100000002,-30.024961000000005],[-51.21920700000002,-30.024591],[-51.21920700000002,-30.024591],[-51.21922300000002,-30.02445900000002],[-51.21920700000002,-30.024342999999995],[-51.21913100000002,-30.024161999999997],[-51.21913100000002,-30.024161999999997],[-51.21909700000001,-30.024095000000017],[-51.21908900000002,-30.024080000000005],[-51.218994000000016,-30.023863999999996],[-51.21891700000001,-30.023740000000004],[-51.21884900000003,-30.023675000000004],[-51.21875700000002,-30.023609000000008],[-51.21860100000002,-30.02347900000001],[-51.21819300000002,-30.02314900000001],[-51.21819300000002,-30.02314900000001],[-51.21809700000003,-30.022977000000004],[-51.21810100000002,-30.022619],[-51.21815400000002,-30.02181200000002],[-51.21809700000003,-30.02155100000001],[-51.21776500000002,-30.021211],[-51.21776500000002,-30.021211],[-51.21714700000001,-30.020790000000012],[-51.21667400000001,-30.020370000000014],[-51.21606400000001,-30.019584000000016],[-51.215217000000024,-30.018178000000013],[-51.21210400000002,-30.01222400000001],[-51.211795000000016,-30.011249000000007],[-51.210037000000014,-30.00788800000001],[-51.209869000000005,-30.00758100000001],[-51.209533000000015,-30.006977000000013],[-51.209293000000024,-30.006483000000003],[-51.209007000000014,-30.005727000000007],[-51.20793900000002,-30.002504000000002],[-51.207824000000016,-30.002170000000028],[-51.20753000000001,-30.00130600000002],[-51.207038000000026,-29.99985500000001],[-51.20693900000002,-29.999555000000008],[-51.20649700000003,-29.998191000000013],[-51.206428000000024,-29.997968000000014],[-51.206054000000016,-29.996639000000023],[-51.205959000000014,-29.99646700000001],[-51.205959000000014,-29.99646700000001],[-51.20270900000001,-29.986259000000018],[-51.19986700000001,-29.977310000000024],[-51.19979400000001,-29.976978000000017],[-51.19951200000002,-29.976142000000024],[-51.19925600000001,-29.97558700000002],[-51.19903100000001,-29.97518100000002],[-51.198791000000014,-29.974842000000024],[-51.19822300000001,-29.974126000000005],[-51.197872000000004,-29.973754000000028],[-51.19741400000001,-29.973333000000025],[-51.19700200000001,-29.972986000000013],[-51.19665900000002,-29.972738000000014],[-51.19608600000001,-29.97237200000002],[-51.19560200000001,-29.972120000000018],[-51.19504900000001,-29.97186600000002],[-51.19480500000001,-29.971778000000015],[-51.194282000000015,-29.97159900000002],[-51.193851,-29.971471000000015],[-51.193359,-29.971349000000025],[-51.192916000000004,-29.97126300000003],[-51.19217300000001,-29.971170000000015],[-51.18662600000001,-29.97065300000002],[-51.18561500000001,-29.97065900000002],[-51.184635000000014,-29.970729000000027],[-51.18375000000001,-29.970865000000018],[-51.182209000000014,-29.97123100000001],[-51.18114400000002,-29.971475000000027],[-51.18024000000002,-29.97164700000002],[-51.179645000000015,-29.97174600000003],[-51.179019000000025,-29.97181300000001],[-51.17806600000002,-29.971839000000017],[-51.17723000000003,-29.97183600000001],[-51.17636400000002,-29.971790000000006],[-51.175617000000024,-29.97171900000003],[-51.17468600000002,-29.971546000000025],[-51.174041000000024,-29.97141400000001],[-51.17330500000002,-29.971220000000024],[-51.17243500000002,-29.97089900000001],[-51.17171000000001,-29.97058600000002],[-51.17044800000002,-29.969966000000014],[-51.16975700000001,-29.969627000000003],[-51.168807000000015,-29.969276000000015],[-51.16798700000002,-29.969066000000034],[-51.16721300000002,-29.96892100000003],[-51.16407000000002,-29.968656000000024],[-51.16151400000002,-29.96847900000001],[-51.13997200000002,-29.967569000000026],[-51.13829000000002,-29.96751200000002],[-51.136524000000016,-29.96748700000002],[-51.13375800000002,-29.967477000000017],[-51.132148000000015,-29.967533000000017],[-51.12957700000001,-29.967653000000013],[-51.11986500000001,-29.968231000000003],[-51.11951000000001,-29.96823600000002],[-51.116523000000015,-29.968397000000017],[-51.11553100000002,-29.968471000000015],[-51.11473400000002,-29.968521000000024],[-51.11344100000002,-29.96858900000003],[-51.11320800000002,-29.96858900000003],[-51.11172100000003,-29.968671],[-51.110595000000025,-29.968666000000013],[-51.109565000000025,-29.968614000000017],[-51.109199000000025,-29.968582000000012],[-51.108585000000026,-29.968492000000012],[-51.10789400000002,-29.96837600000002],[-51.10711200000002,-29.968223000000016],[-51.106548000000025,-29.968086000000007],[-51.10600600000002,-29.96793300000001],[-51.10526600000002,-29.967702000000017],[-51.10442300000002,-29.96740300000002],[-51.10389700000002,-29.967189000000005],[-51.10329800000001,-29.966920000000023],[-51.09983800000002,-29.96514700000001],[-51.09794200000001,-29.96422000000002],[-51.09538200000001,-29.962848000000015],[-51.089202000000014,-29.95962100000002],[-51.088352000000015,-29.959226000000015],[-51.08657400000001,-29.958438000000015],[-51.08482300000002,-29.95776100000002],[-51.08332000000002,-29.95724800000003],[-51.08095900000001,-29.956550000000036],[-51.07887600000002,-29.95605000000002],[-51.07775800000002,-29.95582700000002],[-51.07670200000002,-29.95565000000002],[-51.07497700000001,-29.955389000000025],[-51.07369900000002,-29.955232000000024],[-51.06957600000002,-29.95480500000003],[-51.06916400000002,-29.95476300000003],[-51.06159900000003,-29.953998000000027],[-51.05873800000002,-29.953729000000017],[-51.05350400000002,-29.953203000000016],[-51.052509000000015,-29.953121000000024],[-51.05087600000002,-29.95309200000002],[-51.049461000000015,-29.95309800000001],[-51.048271000000014,-29.953163000000025],[-51.046585000000015,-29.953277000000014],[-51.04394100000002,-29.953620000000008],[-51.04223200000002,-29.953895000000017],[-51.03925700000002,-29.954280000000026],[-51.03621600000002,-29.95460800000002],[-51.03401100000003,-29.95478600000002],[-51.03264600000002,-29.955196000000036],[-51.03171900000003,-29.95553700000002],[-51.03127200000002,-29.955635000000015],[-51.03087900000002,-29.955619000000013],[-51.02998700000001,-29.955427000000014],[-51.02893000000001,-29.955226000000003],[-51.02852600000002,-29.955173000000016],[-51.02701500000001,-29.955345000000015],[-51.02561500000002,-29.95553700000002],[-51.025222000000014,-29.95561400000001],[-51.02344500000002,-29.95601400000001],[-51.02152200000002,-29.956415000000014],[-51.020484000000025,-29.956609000000014],[-51.018821000000024,-29.95680200000001],[-51.01814200000002,-29.956846000000013],[-51.01652900000002,-29.956907000000015],[-51.01464000000002,-29.956840000000014],[-51.01363300000002,-29.95672000000002],[-51.01234800000002,-29.956535000000024],[-51.00756000000002,-29.955627000000014],[-51.00625600000002,-29.95535400000002],[-51.00491700000002,-29.955114000000016],[-51.00404700000002,-29.954925000000017],[-51.00336800000002,-29.95478600000002],[-51.00291000000002,-29.95470400000002],[-51.00121300000003,-29.954397000000014],[-50.99984300000001,-29.954103000000003],[-50.99823700000002,-29.953805000000017],[-50.996150000000014,-29.953552000000016],[-50.99426200000002,-29.953350000000015],[-50.99113800000002,-29.95317200000001],[-50.98940600000002,-29.95314400000001],[-50.98604900000001,-29.953128000000014],[-50.975513000000014,-29.953039000000032],[-50.97507800000001,-29.95301600000002],[-50.97335400000001,-29.952934],[-50.971790000000006,-29.95279800000001],[-50.97012300000001,-29.952566000000033],[-50.96805900000002,-29.95221300000002],[-50.966171,-29.95169800000002],[-50.96428600000001,-29.951129],[-50.953365000000005,-29.947341000000016],[-50.950171999999995,-29.94620500000002],[-50.948005,-29.945585000000015],[-50.945861,-29.94503500000002],[-50.94411,-29.944683000000012],[-50.942535,-29.944444000000004],[-50.939777,-29.944057000000022],[-50.938453,-29.943910000000017],[-50.935382000000004,-29.94350200000001],[-50.934940000000005,-29.943452000000022],[-50.933002,-29.94323700000001],[-50.92963000000001,-29.94297200000001],[-50.928184,-29.942892000000022],[-50.922241,-29.942705000000018],[-50.91968899999999,-29.94272000000001],[-50.915206,-29.94288400000002],[-50.905937,-29.943315000000013],[-50.904070999999995,-29.943376000000015],[-50.90323599999999,-29.943376000000015],[-50.902049999999996,-29.943239000000034],[-50.900714,-29.942920000000015],[-50.89951299999999,-29.942543999999998],[-50.89686499999999,-29.941280000000013],[-50.89581199999999,-29.94081800000003],[-50.89501899999999,-29.940542000000022],[-50.894191,-29.94034300000002],[-50.89088399999999,-29.93950400000002],[-50.88976599999999,-29.93911900000002],[-50.888507,-29.938552000000016],[-50.88678699999999,-29.937564000000016],[-50.881122,-29.934560000000026],[-50.87799,-29.93279000000002],[-50.87409199999999,-29.93065800000003],[-50.871383,-29.929481000000024],[-50.867777999999994,-29.928096000000025],[-50.865202999999994,-29.927173000000025],[-50.863570999999986,-29.926490000000022],[-50.861166999999995,-29.925626000000022],[-50.856387999999995,-29.92417500000002],[-50.850035999999996,-29.922948000000027],[-50.841368999999986,-29.921482000000033],[-50.83482699999999,-29.92041900000003],[-50.83000899999999,-29.919420000000038],[-50.82663299999999,-29.918386000000027],[-50.82015899999999,-29.916193000000014],[-50.81848499999998,-29.91572100000002],[-50.81724899999999,-29.915391000000028],[-50.81430799999999,-29.914678000000016],[-50.81289999999999,-29.914356000000033],[-50.81107999999999,-29.914007000000026],[-50.80907799999999,-29.913728000000013],[-50.80524799999999,-29.91328400000001],[-50.80363799999999,-29.913164000000023],[-50.80103599999998,-29.913036000000034],[-50.79344499999999,-29.91259900000002],[-50.78849699999999,-29.912378000000004],[-50.783640999999996,-29.91208600000001],[-50.777339,-29.91174100000002],[-50.774295,-29.911468000000028],[-50.769183999999996,-29.910659000000024],[-50.766093999999995,-29.909910000000018],[-50.76088299999999,-29.908203000000036],[-50.75714099999999,-29.906618000000023],[-50.727839999999986,-29.894044000000022],[-50.723715999999996,-29.89277000000004],[-50.72333499999999,-29.892652000000027],[-50.721289999999996,-29.89201900000002],[-50.714149,-29.890733000000026],[-50.695369,-29.890010000000018],[-50.682529,-29.889467000000025],[-50.668418,-29.887414000000014],[-50.664031,-29.88673200000001],[-50.658100000000005,-29.886402000000018],[-50.64007500000001,-29.88662500000001],[-50.63123700000001,-29.886142000000007],[-50.620506000000006,-29.885084000000006],[-50.61596600000001,-29.88499800000001],[-50.60247400000001,-29.885755000000024],[-50.59457700000001,-29.886224],[-50.58856900000001,-29.886238000000027],[-50.570976000000016,-29.88460100000001],[-50.56261400000001,-29.884006000000014],[-50.54755000000001,-29.883544000000022],[-50.54019900000001,-29.88347400000002],[-50.53526600000001,-29.88300700000002],[-50.51673100000001,-29.880647000000025],[-50.51514400000001,-29.88042800000003],[-50.513439000000005,-29.88031700000002],[-50.512443000000005,-29.88025200000002],[-50.507442000000005,-29.880229000000014],[-50.503490000000006,-29.88057500000002],[-50.498172000000004,-29.88141600000003],[-50.492610000000006,-29.882793000000028],[-50.478855,-29.887683000000024],[-50.476356,-29.88860800000002],[-50.473518000000006,-29.889514000000005],[-50.47158400000001,-29.88975900000002],[-50.46871900000001,-29.890058000000018],[-50.464889,-29.890029000000006],[-50.462425,-29.889753000000013],[-50.459949,-29.88927800000002],[-50.455135,-29.88782600000001],[-50.451831,-29.88681000000001],[-50.449008000000006,-29.886386000000023],[-50.448734,-29.88628900000002],[-50.445846,-29.884908000000017],[-50.437335000000004,-29.88221900000002],[-50.433837000000004,-29.88073300000002],[-50.429836,-29.878536000000025],[-50.41841099999999,-29.871667000000016],[-50.417339,-29.87092200000002],[-50.414291000000006,-29.86710300000002],[-50.412403,-29.865787000000026],[-50.409961,-29.86510200000002],[-50.406963,-29.86515000000002],[-50.40347599999999,-29.86632500000001],[-50.400946999999995,-29.86793700000004],[-50.400217999999995,-29.86865400000002],[-50.399233999999986,-29.86998300000002],[-50.398264999999995,-29.871583000000022],[-50.39764399999999,-29.873136000000017],[-50.39673599999998,-29.87587500000003],[-50.39564799999999,-29.877937000000024],[-50.39502699999998,-29.878700000000023],[-50.39288299999998,-29.88086800000002],[-50.38812999999998,-29.88510700000002],[-50.38712599999998,-29.885955000000024],[-50.38304099999998,-29.889556000000027],[-50.380728999999974,-29.890829000000018],[-50.37743699999997,-29.891708000000023],[-50.36762599999997,-29.891611000000033],[-50.358611999999965,-29.892034000000024],[-50.35676899999997,-29.89223800000002],[-50.35525499999997,-29.892658000000026],[-50.35374399999996,-29.89330800000002],[-50.35023399999997,-29.895671000000036],[-50.34851799999996,-29.89657400000003],[-50.34671399999997,-29.897232000000017],[-50.34452399999997,-29.897541000000025],[-50.342341999999974,-29.89740100000003],[-50.339945999999976,-29.89695100000003],[-50.338648999999975,-29.896684000000015],[-50.337984999999975,-29.896570000000025],[-50.33752399999997,-29.896511000000018],[-50.33670399999997,-29.896450000000037],[-50.33589899999997,-29.896432000000026],[-50.33244699999998,-29.896408000000015],[-50.331652999999974,-29.896436000000016],[-50.32993999999997,-29.89654900000002],[-50.32913899999997,-29.896617000000013],[-50.32783799999997,-29.896781000000026],[-50.32181899999997,-29.89771200000002],[-50.31872899999997,-29.89807100000003],[-50.31714999999997,-29.89821200000003],[-50.31555899999998,-29.89831100000002],[-50.31420499999997,-29.898368000000026],[-50.31236999999997,-29.89841000000002],[-50.31137399999997,-29.89841200000002],[-50.309897999999976,-29.898386000000023],[-50.308299999999974,-29.898332000000032],[-50.294939999999976,-29.89770300000003],[-50.29410899999998,-29.89763200000003],[-50.29336899999998,-29.897546000000027],[-50.29182399999998,-29.89726400000003],[-50.290991999999974,-29.897077000000024],[-50.28951999999997,-29.89666300000004],[-50.28892799999998,-29.89646100000003],[-50.28832199999998,-29.896234000000028],[-50.28740599999999,-29.895854000000035],[-50.28653999999998,-29.89546200000003],[-50.28653999999998,-29.89546200000003],[-50.28627699999998,-29.895381000000036],[-50.285727999999985,-29.895135000000025],[-50.285399999999974,-29.895011000000032],[-50.28516299999998,-29.894924000000024],[-50.28488499999999,-29.894847000000027],[-50.28460999999998,-29.894794000000026],[-50.28404199999998,-29.89475000000003],[-50.28375199999998,-29.894763000000026],[-50.28350399999998,-29.894794000000026],[-50.28317599999997,-29.89486100000002],[-50.28276399999998,-29.89497700000004],[-50.28250099999998,-29.895078000000026],[-50.28203199999997,-29.89529400000003],[-50.28027699999998,-29.896373000000025],[-50.279684999999986,-29.89677400000003],[-50.27881999999998,-29.897493000000026],[-50.27823599999998,-29.89807100000003],[-50.27623699999998,-29.90040900000003],[-50.27360899999998,-29.903358000000026],[-50.27301399999998,-29.90407900000004],[-50.27301399999998,-29.90407900000004],[-50.27287199999999,-29.904289000000034],[-50.27253299999999,-29.904848000000015],[-50.272204999999985,-29.90546200000003],[-50.27199499999999,-29.905958000000034],[-50.27133499999997,-29.90800000000003],[-50.27114399999998,-29.908575000000027],[-50.27001899999998,-29.91213900000004],[-50.26973699999998,-29.91302600000003],[-50.26877899999998,-29.915945000000015],[-50.26829899999998,-29.91740900000002],[-50.26610499999997,-29.924018000000025],[-50.265822999999976,-29.92462100000003],[-50.265490999999976,-29.925193000000014],[-50.26471699999997,-29.926155000000023],[-50.25523699999997,-29.935903000000025],[-50.24112999999997,-29.95035100000002],[-50.23579399999997,-29.955825000000033],[-50.23209699999997,-29.95955200000003],[-50.23129199999996,-29.960430000000045],[-50.23110899999997,-29.960662000000028],[-50.23092999999996,-29.960933000000026],[-50.23062799999997,-29.961437000000032],[-50.230326999999974,-29.962099000000023],[-50.23013999999997,-29.962680000000027],[-50.23000699999997,-29.963384000000026],[-50.22996899999997,-29.963979000000023],[-50.22991499999997,-29.96602000000003],[-50.22988499999997,-29.966289000000025],[-50.22984299999997,-29.966592000000013],[-50.22974299999997,-29.967012000000025],[-50.229609999999965,-29.96743900000002],[-50.229418999999965,-29.967922000000016],[-50.22910299999997,-29.96852300000002],[-50.22885499999997,-29.968896000000022],[-50.22865999999997,-29.96915000000002],[-50.22804999999997,-29.969839000000036],[-50.22233899999997,-29.976123000000023],[-50.222010999999966,-29.976451000000033],[-50.221636999999966,-29.976753000000024],[-50.221133999999964,-29.97711700000002],[-50.220553999999964,-29.97744700000002],[-50.219824999999965,-29.97780000000003],[-50.219351999999965,-29.977973000000034],[-50.218707999999964,-29.97814500000002],[-50.20407099999996,-29.98091300000003],[-50.203249999999954,-29.981081000000025],[-50.20244199999996,-29.98132700000002],[-50.20185399999996,-29.981580000000022],[-50.20114499999996,-29.98200000000002],[-50.20027099999996,-29.982715000000034],[-50.19836799999996,-29.984355000000022],[-50.19446099999997,-29.987720000000024],[-50.18943399999997,-29.992078000000028],[-50.189345999999965,-29.992153000000016],[-50.18923499999997,-29.992248000000018],[-50.18787299999996,-29.99322700000002],[-50.18760599999997,-29.993389000000022],[-50.18456599999997,-29.99522700000003],[-50.18414599999997,-29.995483000000014],[-50.18339899999997,-29.99594800000002],[-50.18265899999997,-29.99640800000003],[-50.178534999999975,-29.998916000000023],[-50.177054999999974,-29.999813000000017],[-50.17507499999997,-30.001016000000007],[-50.170947999999974,-30.003517000000016],[-50.169638999999975,-30.004310000000018],[-50.168375999999974,-30.005075000000026],[-50.16677799999997,-30.006023000000027],[-50.166228999999966,-30.006265000000013],[-50.166228999999966,-30.006265000000013],[-50.165667999999975,-30.00643100000002],[-50.165400999999974,-30.006496000000034],[-50.164969999999975,-30.00656700000001],[-50.16459999999997,-30.00660700000001],[-50.16410399999998,-30.006624000000016],[-50.16247099999998,-30.006601000000018],[-50.16175399999997,-30.006570000000018],[-50.16140699999999,-30.006557000000022],[-50.16090699999999,-30.00649800000003],[-50.16046899999998,-30.00642300000002],[-50.15999899999998,-30.00629000000002],[-50.159579999999984,-30.006149000000022],[-50.159056999999976,-30.005926000000017],[-50.158614999999976,-30.005662000000015],[-50.15816399999998,-30.00532100000003],[-50.15771099999998,-30.00492600000002],[-50.15693599999999,-30.00419600000002],[-50.15555899999998,-30.002906000000024],[-50.15358699999998,-30.00105600000002],[-50.15235099999998,-29.999895000000016],[-50.15170599999998,-29.999290000000016],[-50.15026399999999,-29.997945],[-50.14893699999998,-29.996707000000015],[-50.14880299999998,-29.99655100000001],[-50.147784999999985,-29.995586000000017],[-50.14643399999998,-29.99430200000002],[-50.14633499999998,-29.994209000000012],[-50.14435099999997,-29.99236400000001],[-50.14416499999998,-29.992189000000003],[-50.14404999999998,-29.992082000000018],[-50.14269599999998,-29.990821000000018],[-50.14152099999997,-29.98971100000002],[-50.14115099999998,-29.989362000000014],[-50.14105199999998,-29.989244000000014],[-50.14090299999998,-29.989044000000014],[-50.14011299999997,-29.988309000000015],[-50.13941499999998,-29.98765700000002],[-50.13848399999998,-29.986787000000028],[-50.137789999999974,-29.986120000000014],[-50.137667999999984,-29.986009000000024],[-50.137476999999976,-29.985874000000024],[-50.136660999999975,-29.98537200000002],[-50.13564599999998,-29.984748000000025],[-50.134432999999966,-29.98399900000001],[-50.134432999999966,-29.98399900000001],[-50.13431899999998,-29.98398200000002],[-50.13426499999997,-29.984001000000028],[-50.13418099999997,-29.984075000000026],[-50.13416999999997,-29.984109000000032],[-50.13411999999997,-29.98414900000003],[-50.13407499999997,-29.984186000000037],[-50.13322399999997,-29.984893000000014],[-50.13322399999997,-29.984893000000014],[-50.13312899999997,-29.98477500000002],[-50.13312899999997,-29.98477500000002],[-50.133135999999965,-29.984767000000026]];
		let _tracker = _mapAPI.addTracker(option.feature);
		_tracker.set("__type",_moduleName+".mubiao");
		_tracker.set("__name",option.name);
		_tracker.set("__dwsx",_dw.toLowerCase());
		_tracker.set("__cache",_cache);
		_tracker.set("__date",new Date());
		_tracker.set("mbType",_moduleName+".feature");
		_tracker.setHjPointsCount(_SSTS_DEFAULT.GUIJI[_dw.toUpperCase()].HANGJILEIXING);
		_tracker.setMaxHjPointsCount(1000);

	    let _linkTag = _tracker.addLinkTag({
	    	name : "content",
//	        anchor:option.feature.anchor,
			offset : [0,15],
//			offset : [_SSTS_DEFAULT.MUBIAOSHOW.MUBIAOCHICUN*0.75*_SSTS_DEFAULT.MUBIAOSHOW.MUBIAODAXIAO,0],
	        // showLevel:0,
	        content:createTemplateLineTag0(_cache),
	        fill:{color:option.color},
	        lineStroke:{color:option.color,width:.5},
	        font:_SSTS_DEFAULT.GUIJI[_dw.toUpperCase()].ZIHAODAXIAO+' Calibri,sans-serif',
	        stroke :{color : "rgba(255,255,255,1)",width:2.5}
	    });
	    _linkTag.set("__type",_tracker.get("__type")+".linkTag");
	    _linkTag.set("__parentId",option.id);
	    _linkTag.set("mbType",_moduleName+".feature");
	    
	    //标牌双击
	    function onLinkTagDBLClick(evt){
	    	let _feature = evt.target.toBindFeature_;
	    	if(_feature){
	    		let _cache = _feature.get("__cache"),
	    			_showState = _feature.get("__showLinkTagState");
	    		if(_showState){
	    			_showState = false;
	    			evt.target.setContent(createTemplateLineTag0(_cache));
	    		}else{
	    			_showState = true;
	    			evt.target.setContent(createTemplateLineTag1(_cache));
	    			
	    			let _date = new Date(_cache["wzsj"]);
	    			let _startTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd")+" 00:00:00";
	    			let _endTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd hh:mm:ss");
	    			
	    			_this.setCallback("map.moveent",function(event){
	    				try{
	    					_feature.changed();
	    				}catch(e){
	    					//TODO handle the exception
	    				}
	    				
	    				_this.setCallback("map.moveent",null);
	    			});
	    			
	    			parent.OPENWINDOW.openTONGXINTAISHI_ECHARTS({
	    				mbbh : _cache.mbbh,
	    				mbmc : _cache.mbmc,
	    				startTime : _startTime,
						endTime : _endTime
	    			});
	    			
	    			parent.OPENWINDOW.openMUBIAOSHIXUTU({
	    				title : "（"+_cache.mbmc+"["+_cache.mbbh+"]）",
	    				data : {
	    					mbmc : _cache.mbmc,
	    					mbbh : _cache.mbbh,
	    					startTime : _startTime,
							endTime : _endTime
	    				}
	    			});
	    			
	    			
//	    			setTimeout(function(){
//	    				_feature.changed();
//	    			},2000);
	    		}
	    		_feature.set("__showLinkTagState",_showState);
	    	}
	    }
	    _linkTag.on(ZKMap.EventType.FEATUREDBCLICK,onLinkTagDBLClick);
	    
	    let _node = _ZHTS_SSTS_TREE.getNodeById(option.id);
	    if(option.show===false || !_node.checked){
	    	_tracker.hide();
	    }
	    
	    if(!this.__isInitLayerArray){
	    	_this.initLayerArray();
	    	this.__isInitLayerArray = true;
	    }
	    
	    this.updateTracker(option.id,option);
	}
	module.updateTracker = function(id,option){
    	let _tracker = this.getFeatureById(id);
    	if(!_tracker){
    		return;
    	}
    	
    	let _coordinate = option.feature.coordinates;
		if(!_coordinate){
    		return false;
    	}
        _tracker.setPosition(_coordinate);
        
        let _cache = option.__cache;
		let start = _tracker.getPosition(),
        	end = _coordinate;
//      let _rotation = -Math.atan2(end[1] - start[1],end[0] - start[0]) * 180/Math.PI ;
        let _rotation = Number(_cache.hx);
		if(option.mblb=="02" || option.mblb=="04"){
			_rotation += 90;
		}else if(option.mblb=="03" && /直升机/.test(_cache.mbflmc)){
			_rotation = 0;
		}
		_tracker.setRotation(_rotation);
        _tracker.set("__cache",_cache);
        if(_tracker.get("__showLinkTagState")){
        	_tracker.getLinkTags().forEach(function(value,key){
        		value.setContent(createTemplateLineTag1(_cache));
        	})
        }
        
        if(option.show){
        	_tracker.show();
        }else{
        	_tracker.hide();
        }
	}
	module.setFeatureViewAuto = function(id,boolean){
		let _feature = this.getFeatureById(id);
		if(!_feature){
			return this;
		}
		
		let _dwsx = _feature.get("__dwsx"),
			_featureSize,_fontSize,
			_strokeColor = _feature.get("__lineTagStrokeColor");
			
		_feature.set("__isAutoUpdatePosition",boolean);
		if(boolean){
			_featureSize = 1;
			_fontSize = "18px";
			_feature.__funcAutoUpdatePosition = function(){
				let _is = _feature.get("__isAutoUpdatePosition");
				if(!_is){
					_feature.__funcAutoUpdatePosition = function(){}
					return;
				}
				
				//如果没有缓存
//				let _fontColor;
//				if(_strokeColor!="green"){
//					_strokeColor = "rgba(255,255,255,1)";
//					_fontColor = "green";
//				}
//				_feature.set("lineTagStrokeColor",_strokeColor);
//				$.each(_feature.linktags, function(key,value) {
//					value.get("stroke").setColor(_strokeColor);
//					value.get("fill").setColor(_fontColor);
//				});
				
//				let _prevCoordintes = _feature.get("__coordinates");
//				if((""+_prevCoordintes).toString()!=_feature.getGeometry().getCoordinates().toString()){
//					_feature.set("__coordinates",_feature.getGeometry().getCoordinates());
//					_this.setFeaturePositionAnimateById(_feature);
//				}
//				setTimeout(function(){
//					_feature.__funcAutoUpdatePosition();
//				},250);
			}
			_feature.__funcAutoUpdatePosition();
		}else{
			_feature.__autoUpdatePosition = function(){};
//			$.each(_feature.linktags, function(key,value) {
//				value.get("stroke").setColor("rgba(255,255,255,1)");
//				value.get("fill").setColor("blue");
//			});
			_featureSize = _SSTS_DEFAULT.MUBIAOSHOW.MUBIAODAXIAO;
			_fontSize = _SSTS_DEFAULT.GUIJI[_dwsx.toUpperCase()].ZIHAODAXIAO;
		}
		
		_feature.setScale(_featureSize);
		$.each(_feature.linktags, function(i,e) {
			if(e.get("name")=="content"){
				e.setFont(_fontSize+' Calibri,sans-serif');
			}
		});
		_feature.changed();
		_feature.setTrackView(boolean);
		return this;
	}
	module.setFeaturePositionAnimateById = function(feature){
		let _view = this.getMap().getView();
    	let _viewAnimate0 = {};
    	_view.animate(_viewAnimate0,{
    		center: ol.extent.getCenter(feature.getGeometry().getExtent()),
    		projection: 'EPSG:3857',
    	});
	}
	
	/**
	 * 绘制历史航迹
	 * @param {Object} option
	 */
	module.newFeatureLSHJ = function(option){
		let _data = option.data;
		var feature = new ol.Feature();
		let geometry = new ol.geom.Point(ol.proj.fromLonLat([_data.jd,_data.wd]));
		feature.setGeometry(geometry);
        var style = new ol.style.Style({
        	image: new ol.style.Circle({
				radius: 4,
				fill: new ol.style.Fill({
					color: 'red'
				})
			}),
//          text: new ol.style.Text({
//			    font: '12px Calibri,sans-serif',
//			    fill: new ol.style.Fill({
//			      color: '#000'
//			    }),
//			    stroke: new ol.style.Stroke({
//			      color: '#fff',
//			      width: 3
//			    }),
//			    text : (function(){
//			    	let _t = _data.wzsj;
//			    	if(_t){
//			    		_t = _t.replace(/^\d+\-\d+\-\d+\s+/,"");
//			    		_t = option.index+"("+_t+")";
//			    	}
//			    	return _t;
//			    })() || "NewObject",
//			    offsetX : 44
//			})
        });
        feature.setStyle(style);
        feature.set("__type",this.getModuleName()+".feature.lsgj.point");
        feature.set("mbType",feature.get("__type"));
        feature.set("__cache",option.data);
        feature.set("__parentLineId",option.parentLineId);
        option.layer.getSource().addFeature(feature);
        
        //绘制overlayer
		let _html = [];
		$.each(_data.mbwzsjEvent || [], function(index,el) {
			_html.push("时间："+el.wzsj);
//			_html.push(el.title);
			_html.push("事件："+el.sjnr);
		});
		
		if(_html.length>0){
			/**
			 * 注意顺序
			 */
//			let _div = document.createElement("div");
//			let _overlay = new ol.Overlay({
//				element:_div,
//				offset:[20,-5],
//				position:geometry.getCoordinates()
//			});
//			_map.addOverlay(_overlay);
//			
//			let $div = $(_overlay.element);
//			$div.addClass("point_mb_wzsj_event_overlay").html(_html.join("<br/>"));
			
			var a = document.createElement("div")
			var b = new ol.Overlay({element:a,offset:[0,0],position:geometry.getCoordinates()});
			map2d.getMap().addOverlay(b);
			
			let $a = $(a);
			$a.addClass("point_mb_wzsj_event_overlay").html(_html.join("<br/>"));
			$a.data("__cache",_data.mbwzsjEvent);
			$a.on("click",function(){
				let $this = $(this),
					_cache = $this.data("__cache");
				
				let _mbxx =  _cache[0];
				
				let _url = getModuleURL("module.zhts.ssts.lsgj.add");
    			WebLoader.layer.openWin({
					type : 2,
					title : "<i class='iconfont fa fa-edit'></i>记录事件（"+_mbxx.mbmc+"）",
					shade : false,
					area : ["600px","400px"],
					skin : " webloader-layer webloader-layer-sm skin-transparent-no",
					content : _url,
					btn : false,
					callback : {
    					onSuccess : function(layero,index){
    						let _module = getModuleWindowPageObjectByURL(_url).FORM;
    						let $doc = _module.getFormDoc();
    						$doc.setFormValue(_mbxx);
    						$doc.getFormInput("title").attr("disabled",true);
    						$doc.getFormInput("sjnr").attr("disabled",true);
    					}
    				}				
				});
			});
		}
		
	}
	
	module.setDrawLSHJ = function(option){
		let _layer;
		if(option.dwsx=="difang"){
			_layer = _layerHJ_DIFANG_LISHI;
		}else if(option.dwsx=="wofang"){
			_layer = _layerHJ_WOFANG_LISHI;
		}
		_layer.clear();
		_layer.setZIndex(10);
		
		let _array = [],
			_id = WebLoader.createUUID();
			
		let _tempDocId = "point_mb_wzsj_event_overlay";
			$("."+_tempDocId).remove();
		$.each(option.data, function(index,el) {
			_this.newFeatureLSHJ({
				parentLineId : _id,
				index : index,
				data : el,
				layer : _layer
			});
//			_array.push(ol.proj.fromLonLat([el.jd,el.wd],"EPSG:3857","EPSG:4326"));
			_array.push([el.jd,el.wd]);
		});
		
		//绘制线段
//		let _lineString = _array.toLINESTRING();
//		let _coordinates = WebLoader.toGeometryMultiPoint(obj.lineString);
		let _newCoordinates = _classLineStringUtil.transformMultiLineString(_array);
//		let _newLineString = _newCoordinates.toMULTILINESTRING();
		
//		var line = new ol.geom.LineString(_newCoordinates, "XY");
		var line = new ol.geom.MultiLineString(_newCoordinates);
		line.transform("EPSG:4326","EPSG:3857");
        var newFeature = new ol.Feature({
            geometry: line,
        });
        newFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "rgba(255,0,0,0.75)",
                    width: 1
                })
            })
        );
        newFeature.set("id",_id);
        newFeature.set("__type",this.getModuleName()+".feature.lsgj.line");
		newFeature.set("__count",_array.length);
        _layer.getSource().addFeature(newFeature);
        
//      let _extent = newFeature.getGeometry().getExtent(),
//      	_view = this.getMap().getView();
//		if(_extent){
//			_view.fit(_extent);
//  		_view.animate({
//  			center: [(_extent[0]+_extent[2])/2,(_extent[1]+_extent[3])/2],
//  			zoom : _view.getZoom()-.5
//  		});
//		}
		
		let _map = this.getMap();
		
		function onPointermove(e){
			_layer.getSource().getFeatures().forEach(function(value,key){
				let _type = value.get("__type");
            	if(_type!=_this.getModuleName()+".feature.lsgj.point"){
            		return;
            	}
	            value.getStyle().setText(null);
			});
	        var pixel = _map.getEventPixel(e.originalEvent);
	        var hit = _map.hasFeatureAtPixel(pixel);
	        if (hit) {
	            var f = _map.forEachFeatureAtPixel(e.pixel, function (feature) {
	                return feature;
	            });
				
	            if (f) {
	            	let _type = f.get("__type");
	            	if(_type!=_this.getModuleName()+".feature.lsgj.point"){
	            		return;
	            	}
	            	let _cache = f.get("__cache");
	            	let _style = f.getStyle();
					_style.setText(new ol.style.Text({
					    font: '12px Calibri,sans-serif',
					    fill: new ol.style.Fill({
					      color: '#000'
					    }),
					    stroke: new ol.style.Stroke({
					      color: '#fff',
					      width: 3
					    }),
					    text : (function(){
					    	let _t = _cache.wzsj;
					    	return _t;
					    })() || "NewObject",
					    offsetX : 60
					}));
					f.changed();
	            }
	
	        }
		}
		
		_map.un('pointermove', onPointermove);
		_map.on('pointermove', onPointermove);
	}
	module.clearLSHJFeatures = function(id){
		this.getLayerMap().forEach(function(value,key){
			value.getSource().getFeatures().forEach(function(v,k){
				if(v.get("id")==id || v.get("__parentLineId")==id){
    				value.getSource().removeFeature(v);
    			}
			})
		});
		$(".point_mb_wzsj_event_overlay").parent().remove();
	}
	module.clearLSHJ = function(){
		_layerHJ_DIFANG_LISHI.getSource().clear();
		_layerHJ_WOFANG_LISHI.getSource().clear();
		$(".point_mb_wzsj_event_overlay").parent().remove();
	}
	
	module.close = function(){
		this.clearLayers();
	}
	
	module.test3857 = function(){
		//123,52,-153,-15
		var featureLine = new ol.Feature();
//	    var multiLine = new ol.geom.MultiLineString([[ol.proj.fromLonLat([126,44]),[-170,46]]]);
		let _coordinate0 = ol.proj.transform([126,44], 'EPSG:4326', 'EPSG:3857'),
			_coordinate1 = ol.proj.transform([-179,-84], 'EPSG:4326', 'EPSG:3857');
	    var multiLine = new ol.geom.MultiLineString([[_coordinate0,_coordinate1]]);
	    featureLine.setGeometry(multiLine);
	    featureLine.setStyle(new ol.style.Style({
        	fill:new ol.style.Fill({
                color:'red'
            }),
            stroke:new ol.style.Stroke({
                width:1,
                color:'red'
            })
        }));
	    this.getLayerHJWOFANG().getSource().addFeature(featureLine);
//	    multiLine.transform("EPSG:4326", "EPSG:3857");
	}
	
	module.setCallback = function(type,callback){
		_callback[type] = callback;
		return this;
	}
	module.getCallback = function(type){
		return _callback[type];
	}
	
	module.init = function(){
		_ZHTS_SSTS = parent.ZHTS_SSTS,
		_ZHTS_SSTS_TREE = parent.ZHTS_SSTS_TREE;
		_ZHTS_SSTS_MUBIAO_CONTEXTMENU = parent.ZHTS_SSTS_MUBIAO_CONTEXTMENU;
		
		//加载默认设置
		this.httpGetServerConfigById({
			callback : function(data){
				let _data = data ? data.lastSetting : null;
				try{
					_data = JSON.parse(_data);
				}catch(e){
					//TODO handle the exception
				}
				_this.setSSTSDefault(_data);
				_this.addLayers();
				
				//添加一个目标，激活层
				let _feature = {
					id:WebLoader.createUUID(),
			        coordinates:[0,0],
			        hjLayer:_layerHJ_WOFANG,
				}
				_mapAPI.addTracker(_feature);
				_this.initLayerArray();
				_this.clearLayers();
				map2d.getDefaultTrackerLayer().setZIndex(998);
				map2d.getDefaultLinkTagLayer().setZIndex(999);
				
				_layerHJ_WOFANG.hjConfig.setHjStrokeWidth(_SSTS_DEFAULT.GUIJI.WOFANG.HANGJICUXI);
				_layerHJ_DIFANG.hjConfig.setHjStrokeWidth(_SSTS_DEFAULT.GUIJI.DIFANG.HANGJICUXI);
				
				_ZHTS_SSTS.openConnection();
				_ZHTS_SSTS_MUBIAO_CONTEXTMENU.init();
				
				//开启定时检测
				_this.setIntervalFeature();
				
				_this.getMap().on("moveend",function(event){
					if(_this.getCallback("map.moveent")){
						_this.getCallback("map.moveent")(event);
					}
				});
				
//				_this.test3857();
			}
		});
//		this.setLayerFeatureLabelsShow(_SSTS_DEFAULT.MUBIAOSHOW.BIAOPAISHEZHI);
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_MUBIAO_CONTROL={});


/**
 * 实时态势右键菜单
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		_cacheDblclickFeature;
	
	let _ZHTS_SSTS_MUBIAO_CONTROL,
		_ZHTS_SSTS_HTTP,
		_mapAPI=top._beyonmap,
		_map;
		
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
	
	module.setCacheDblclickFeature = function(feature){
//		console.info("准备缓存feature",feature);
		_cacheDblclickFeature = feature;
		return this;
	}
	module.getCacheDblclickFeature = function(){
//		console.info("取出缓存feature",_cacheDblclickFeature);
		return _cacheDblclickFeature;
	}
	module.bindClickRightCallback = function(eventName,obj,map){
		let _mName = _ZHTS_SSTS_MUBIAO_CONTROL.getModuleName().toLowerCase(),
			_regExpMuBiao = new RegExp("^"+_mName+".mubiao"+"$","i"),
			_regExpMuBiaoChildren = new RegExp("^"+_mName+".mubiao","i");
			
		/**
		 * 取出目标
		 */
		function getParentFeatureMB(feature){
			let _type = feature.get("__type");
			if(_type){
				_type = _type.toLowerCase();
				if(_regExpMuBiao.test(_type)){
					return feature;
				}
				if(_regExpMuBiaoChildren.test(_type)){
					let _parentId = feature.get("__parentId");
					if(_parentId){
						return _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(_parentId);
					}
				}
			}
		}
        
    	switch (eventName){
        	case "mubiaogensui-active":
        		//如果上次有缓存先关闭
        		if(_this.__trackViewBH){
        			_ZHTS_SSTS_MUBIAO_CONTROL.setFeatureViewAuto(_this.__trackViewBH,false);
        		}
        		let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
        		if(!_feature){
        			return;
        		}
        		let _cache = _feature.get("__cache");
        		let _id = _feature.get("id") || _feature.id_;
        		_ZHTS_SSTS_MUBIAO_CONTROL.setFeatureViewAuto(_id,true);
        		layui.layer.msg("已开启目标跟随"+_feature.get("__name"));
        		_this.__trackViewBH = _id;
        		break;
        	case "mubiaogensui-active-false":
        		if(_this.__trackViewBH){
        			_ZHTS_SSTS_MUBIAO_CONTROL.setFeatureViewAuto(_this.__trackViewBH,false);
	        		layui.layer.msg("已关闭目标跟随");
        		}
        		break;
        	case "jilushijian":
        		(function(){
        			let _cacheFeature = _this.getCacheDblclickFeature(),
        				_type = _cacheFeature.get("__type"),
        				_point_cache;
        			
        			let _featureMB,_data;
        			if(/point$/.test(_type)){
        				_point_cache = _cacheFeature.get("__cache");
        				_featureMB = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(_point_cache.mbbh);
        				if(!_featureMB){
        					return;
        				}
        			}else{
        				_featureMB = getParentFeatureMB(_cacheFeature);
		        		if(!_featureMB){
		        			return;
		        		}
        			}
        			_data = _featureMB.get("__cache");
        			let _url = getModuleURL("module.zhts.ssts.lsgj.add");
        			WebLoader.layer.openWin({
						type : 2,
						title : "<i class='iconfont fa fa-edit'></i>记录事件（"+_data.mbmc+"）",
						shade : false,
						area : ["600px","400px"],
						skin : " webloader-layer webloader-layer-sm skin-transparent-no",
						content : _url,
						btn : ["保存","取消"],
						callback : {
        					onSuccess : function(layero,index){
        						let _module = getModuleWindowPageObjectByURL(_url).FORM;
        						let $doc = _module.getFormDoc();
        						let _newData = $.extend(true, {}, _data);
        						$.extend(true, _newData, {
        							gjdqbm : _newData.gjdq
        						});
        						$doc.setFormValue(_newData).setFormValue(_point_cache);
        					}
        				},
        				yes : function(index,layero){
        					let _module = getModuleWindowPageObjectByURL(_url).FORM;
    						_module.httpSubmitForm({
    							callback : function(){
    								layui.layer.close(index);
    							}
    						});
        				}
					});
        		})();
        		break;
        	case "taishidianxinxi":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
	        		_this.openLayerMBXQ(_cache);
        		})();
        		break;
        	case "dangtianguiji":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
	    			let _date = WebLoader.classDate.responseDate(new Date(_cache.wzsj),"yyyy-mm-dd");
					_ZHTS_SSTS_HTTP.httpGetMBDByParam({
						data : {
							mbbh : _cache.mbbh,
							startDate : _date+" 00:00:00",
							endDate : _date+" 23:59:59"
						},
						callback : function(result){
							_ZHTS_SSTS_MUBIAO_CONTROL.setDrawLSHJ({
								id : _cache.mbbh,
								dwsx : _cache.dwsx,
								data : result
							});
						}
					});
        		})();
        		break;
        	case "mubiaotongxintaishi":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
	        		let _date = new Date(_cache["wzsj"]);
	    			let _startTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd")+" 00:00:00";
	    			let _endTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd hh:mm:ss");
        			let _option1 = {
        				mbbh : _cache.mbbh,
    					mbmc : _cache.mbmc,
    					startTime : _startTime,
						endTime : _endTime
        			};
					parent.OPENWINDOW.openTONGXINTAISHI_ECHARTS(_option1);
        		})();
        		break;
        	case "mubiaoshixutu":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
	        		let _date = new Date(_cache["wzsj"]);
	    			let _startTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd")+" 00:00:00";
	    			let _endTime = WebLoader.classDate.responseDate(new Date(_date),"yyyy-mm-dd hh:mm:ss");
	    			
	    			parent.OPENWINDOW.openMUBIAOSHIXUTU({
	    				title : "（"+_cache.mbmc+"["+_cache.mbbh+"]）",
	    				data : {
	    					mbmc : _cache.mbmc,
	    					mbbh : _cache.mbbh,
	    					startTime : _startTime,
							endTime : _endTime
	    				}
	    			});
        		})();
        		break;
        	case "mubiaoxiangqing-neibu":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
					let _sendData = JSON.stringify({
						mblb : _cache.mblb,
	    				mbmc : _cache.mbmc
					});
					xUtilBase.ajax({
						url : getModuleURL("http.zhts.ssts.mubiaoxiangqing.getById"),
						data : _sendData,
						success : function(result){
							if(result["code"]=="0"){
								if(!result.data){
									layui.layer.msg("数据格式不正确");
									return false;
								}
								parent.OPENWINDOW.openBAIKE({
				    				mblb : _cache.mblb,
				    				mbmc : _cache.mbmc
				    			});
							}else{
								layui.layer.msg("暂无数据",{time:5000});
							}
						}
					});
        		})();
        		break;	
        	case "mubiaoxiangqing-waibu":
        		(function(){
        			let _feature = getParentFeatureMB(_this.getCacheDblclickFeature());
	        		if(!_feature){
	        			return;
	        		}
	        		let _cache = _feature.get("__cache");
					let _sendData = JSON.stringify({
						mblb : _cache.mblb,
	    				mbmc : _cache.mbmc
					});
					
					xUtilBase.ajax({
						url : getModuleURL("http.zhts.ssts.mubiaoxiangqing.getById"),
						data : _sendData,
						success : function(result){
							if(result["code"]=="0"){
								if(!result.data){
									layui.layer.msg("数据格式不正确");
									return false;
								}
								
								let _option = {
									openType : "blank",
				    				mblb : _cache.mblb,
				    				mbmc : _cache.mbmc
								};
								
								let _moduleName = "module.baike.main",
									_url = getModuleURL(_moduleName);
								
				    			let _array = PAGEOBJECT.SYNCHRO_MESSAGE.getControlWindowByURL(_url);
				    			if(_array.length>0){
					    			$.each(_array, function(index,win) {
										win.location.href = win.location.pathname+"?"+WebLoader.toJsonValue(_option);
					    			});
				    			}else{
				    				parent.OPENWINDOW.openBAIKE(_option);
				    			}
							}else{
								layui.layer.msg("暂无数据",{time:5000});
							}
						}
					});
        		})();
        		break;
        	case "mubiao-LSGJ-clear":
        		(function(){
        			let _feature = _this.getCacheDblclickFeature();
	        		if(!_feature){
	        			return;
	        		}
	        		
	        		let _parentLineId = _feature.get("__parentLineId");
	        		_ZHTS_SSTS_MUBIAO_CONTROL.clearLSHJFeatures(_parentLineId);
        		})();
        		break;
        	case "mubiao-LSGJ-count":
        		//__parentLineId
				(function(){
					let _feature = _this.getCacheDblclickFeature();
	        		if(!_feature){
	        			return;
	        		}
	        		
	        		let _parentLineId = _feature.get("__parentLineId"),
	        			_count;
	        		_ZHTS_SSTS_MUBIAO_CONTROL.getLayerMap().forEach(function(value,key){
	        			value.getSource().getFeatures().forEach(function(v,k){
	        				if(v.get("id")==_parentLineId){
		        				_count = v.get("__count");
		        			}
	        			})
	        		});
	        		if(_count){
	        			layui.layer.msg("轨迹点数量[ "+_count+" ]");
	        		}else{
	        			layui.layer.msg("没有获取到轨迹点数量");
	        		}
				})();
        		break;	
        	default:
        		break;
        }
		return this;
	}
	
	/**
	 * 弹出原始报文
	 * @param {Object} data
	 */
	module.openLayerMBXQ = function(data){
		let _conetnt = [],
			_cache = data,
			_ysbw = _cache.ysbw;
		
		_conetnt.push('<div class="layui-tab" lay-filter="tab-zhts-ssts-feature-yswb" style="height:100%">');
		_conetnt.push('<div class="layui-tab-content" style="height:100%">');
		_conetnt.push('<div class="layui-tab-item layui-show layui-form" style="height:100%">');
		_conetnt.push('<div class="layui-row">');
		for(let i in _ysbw){
			if(!new RegExp(/^未知/).test(_this.transformFieldName(i))){
				_conetnt.push('<div class="layui-col-xs6 layui-col-sm6 layui-col-md6">');
				_conetnt.push('<div class="layui-form-item">');
				_conetnt.push('<label class="layui-form-label" title='+_this.transformFieldName(i)+'>'+_this.transformFieldName(i)+'</label>');
				_conetnt.push('<div class="layui-input-block" title='+_this.transformFieldValue(_ysbw[i])+'>'+_this.transformFieldValue(_ysbw[i])+'</div>');
				_conetnt.push('</div>');
				_conetnt.push('</div>');
			}
		}
		_conetnt.push('</div></div></div></div>');
		WebLoader.layer.openWin({
			type : 1,
			title : "<i class='iconfont fa fa-bookmark-o'></i>态势点信息（"+data.mbmc+"）",
			shade : false,
			area : ["600px","660px"],
			skin : " webloader-layer webloader-layer-sm",
			content : _conetnt.join(""),
			success : function(layero,index){
				let $item0 = layero.find(".layui-tab-item:eq(0)");
				$item0.addMCustomScrollbar();
			}
		});
	}
	/**
	 * 字段转换
	 * @param {Object} field
	 */
	module.transformFieldName = function(fieldName){
		let _default = {
			"mbbh": "目标编号",
			"bbh": "版本号",
			"bwnrfl": "报文类型",
			"sbsj": "上报时间",
			"zzdsbsj": "最新上报时间",
			"mbsl": "目标数量",
			"mbzt": "目标状态",
			"gjdq": "国家地区",
			"jz": "军种",
			"mbxz": "目标性质",
			"rw": "任务",
			"pzzt": "判证状态",
			"hh" : "呼号",
			"ph": "批号",
			"jxh": "机(弦)号",
			"lsdw" : "隶属单位",
			"qmbmc" : "群目标名称",
			"rwdx" : "任务对象",
			"cfd" : "出发地",
			"ddd" : "到达地",
			"zycd": "重要程度",
			"kxd": "可信度",
			"zxrw": "专项任务",
			"rhfs": "融合方式",
			"mmpy": "密码破译",
			"mbmc": "目标名称",
			"mblb": "目标类别",
			"zbxh": "装备型号",
			"mbzl": "目标种类",
			"jgqybhjh" : "经过区域编号集合",
			"mbqssj": "目标起始时间",
			"mbjssj": "目标结束时间",
			"zxwzdbh": "最新位置点编号",
			"zxwzdjd": "最新位置点经度",
			"zxwzdwd": "最新位置点纬度",
			"zxwzdhqsd": "最新位置点获取手段",
			"zxwzdqbly": "最新位置点情报来源",
			"zxwzdzcxt": "最新位置点侦查系统",
			"zxwzdkxd": "最新位置点可信度",
			"zxwzdpzdw": "最新位置点判证单位",
			"zxwzdydfx": "最新位置点移动方向",
			"zxjd": "最小经度",
			"zdjd": "最大经度",
			"zxwd": "最小纬度",
			"zdwd": "最大纬度",
			"qbr" : "取报人",
			"qbzt": "取报状态",
			"sfsc" : "是否删除(废弃)",
			"crttime" : "分区字段(废弃)",
			"jzzt" : "价值状态(废弃)",
			"scsj": "生成时间",
			"jddm" : "实际存储(废弃)",
			"hdqy" : "活动区域(废弃)",
			"zdrhtwip" : "自动融合台位IP(废弃)",
			"rhgc" : "融合上报单位",
			"ymbbh": "原始目标编号",
			"mbds": "目标点数",
			"tbds": "通报点数",
			"csr" : "未知(废弃)",
			"rksj": "入库时间",
			"lzds" : "未知(废弃)",
			"zdmb": "重点目标",
			"copsjlx": "其它",
			"pzsjlx": "判证数据类型",
			"lbdw" : "维持323",
			"ytms": "意图描述",
			"zdid" : "未知",
			"ysdw" : "未知",
			"yssd" : "未知",
			"rgpz" : "未知",
			"zxwzdmbdbh" : "最新位置点目标点编号",
			"zdis" : "未知",
			"pzdws": "判证单位编码",
			"hqsds": "获取手段编码",
			"zxtslx" : "最新态势类型",
			"zxwzdjwd" : "未知"
		};
		return _default[fieldName] || fieldName;
	}
	module.transformFieldValue = function(fieldValue){
		if(fieldValue==undefined || fieldValue==null){
			return "";
		}
		return fieldValue.toString();
	}
	
	module.bindContextmenu = function(){
		if(this.__isContentMenuReg){
			return;
		}
		
		this.__isContentMenuReg = true;
		
		_mapAPI.getContextMenu().setActive(true);
		//原始报文，百科
		//点、线、面，态势所有属性
		//事件记录
		//统计单个目标信息、待定
		//目标跟随，
		/**
		 * 跟随、原始报文、百科、记录事件
		 */
		
		let _mName = _ZHTS_SSTS_MUBIAO_CONTROL.getModuleName();
			_moduleFeatureName = _mName+".feature",
			_moduleFeatureLSGJName = _mName+".feature.lsgj.point";
        _mapAPI.getContextMenu().menuReg([
            	{
                    text: '<i class="iconfnot fa fa-ticket"></i>&nbsp;&nbsp;目标跟随',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("mubiaogensui",a,b);
                    },
                    items: [
                        {
                            text: '<i class="iconfnot fa fa-eye"></i>&nbsp;&nbsp;开启',
                            type:[_moduleFeatureName],
                            filter:function (feature) {
                                _this.setCacheDblclickFeature(feature);
                       			return true;
                            },
                        	callback : function(a,b){
		                    	_this.bindClickRightCallback("mubiaogensui-active",a,b);
		                    },
                        },
                        {
                          text: '<i class="iconfnot fa fa-eye-slash"></i>&nbsp;&nbsp;关闭',
                            type:[_moduleFeatureName],
                            filter:function (feature) {
                                _this.setCacheDblclickFeature(feature);
                       			return true;
                            },
                        	callback : function(a,b){
		                    	_this.bindClickRightCallback("mubiaogensui-active-false",a,b);
		                    },
                        },
                    ],
                },
                {
                    text: '<i class="iconfont fa fa-location-arrow"></i>&nbsp;&nbsp;&nbsp;当天轨迹',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("dangtianguiji",a,b);
                    }
                },
                {
                    text: '<i class="iconfont fa fa-edit"></i>&nbsp;&nbsp;记录事件',
                    classname: 'bold',
                    type:[_moduleFeatureName,_moduleFeatureLSGJName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("jilushijian",a,b);
                    }
                },
                {
                    text: '<i class="iconfont fa fa-list"></i>&nbsp;&nbsp;目标详情',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("mubiaoxiangqing",a,b);
                    },
                    items: [
                        {
                            text: '<i class="iconfnot fa fa-eye"></i>&nbsp;&nbsp;内部窗口显示',
                            type:[_moduleFeatureName],
                            filter:function (feature) {
                                _this.setCacheDblclickFeature(feature);
                       			return true;
                            },
                        	callback : function(a,b){
		                    	_this.bindClickRightCallback("mubiaoxiangqing-neibu",a,b);
		                    },
                        },
                        {
                          text: '<i class="iconfnot fa fa-eye-slash"></i>&nbsp;&nbsp;外部窗口显示',
                            type:[_moduleFeatureName],
                            filter:function (feature) {
                                _this.setCacheDblclickFeature(feature);
                       			return true;
                            },
                        	callback : function(a,b){
		                    	_this.bindClickRightCallback("mubiaoxiangqing-waibu",a,b);
		                    },
                        },
                    ],
                },
                {
                    text: '<i class="iconfont fa fa-podcast"></i>&nbsp;&nbsp;通信态势',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("mubiaotongxintaishi",a,b);
                    }
                },
                {
                    text: '<i class="iconfont fa fa-bar-chart"></i>&nbsp;&nbsp;时序彩虹图',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("mubiaoshixutu",a,b);
                    }
                },
                {
                    text: '<i class="iconfont fa fa-dot-circle-o"></i>&nbsp;&nbsp;&nbsp;态势点信息',
                    classname: 'bold',
                    type:[_moduleFeatureName],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("taishidianxinxi",a,b);
                    }
                },
//              {
//                  text: '<i class="iconfont fa fa-bar-chart-o"></i>&nbsp;&nbsp;轨迹点数量',
//                  type:_moduleFeatureLSGJName,
//                  filter:function (feature) {
//                      _this.setCacheDblclickFeature(feature);
//             			return true;
//                  },
//              	callback : function(a,b){
//                  	_this.bindClickRightCallback("mubiao-LSGJ-count",a,b);
//                  },
//              },
                {
                    text: '<i class="iconfont fa fa-trash-o"></i>&nbsp;&nbsp;&nbsp;轨迹清除',
                    type:[_moduleFeatureLSGJName],
                    filter:function (feature) {
                        _this.setCacheDblclickFeature(feature);
               			return true;
                    },
                	callback : function(a,b){
                    	_this.bindClickRightCallback("mubiao-LSGJ-clear",a,b);
                    },
                },
            ]);
	}
	
	module.init = function(){
		_ZHTS_SSTS_MUBIAO_CONTROL = parent.ZHTS_SSTS_MUBIAO_CONTROL;
		_ZHTS_SSTS_HTTP = parent.ZHTS_SSTS_HTTP;
		_map = _ZHTS_SSTS_MUBIAO_CONTROL.getMap();
		this.bindContextmenu();
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_MUBIAO_CONTEXTMENU={});


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
	module.httpGetMBArray = function(data){
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.mubiaodata.getMBsByDate"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.callback){
						option.callback(result.data);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	/**
	 * 取目标位置点
	 * @param {Object} data
	 */
	module.httpGetMBDByParam = function(option){
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.lsgj.getMBDByParam"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.callback){
						option.callback(result.data);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.init = function(){
		
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_HTTP={});


/**
 * 实时态势-自定义分组
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		$ztree,_treeObj;
		
	let _ZHTS_SSTS_MUBIAO_CONTROL;

	/**
	 * 生成ztree tree
	 */
	module.initTree =  function(data){
		
		try{
			this.getTreeObj().destroy();
		}catch(e){
			//TODO handle the exception
		}
		
		let _nodes = [{
        	id : "root",
			name : "目标自定义分组",
			pId : 0,
			checked : true,
			isParent : true,
        }];
        
		//格式化数据
		$.each(data, function(index,el) {
			if(!el.pId){
				el.pId = "root";
			}
			
			if(el.cache){
				el.__cache = el.cache;
				el.id = el.__cache.mbbh;
				
				if(!/\[/g.test(el.name) && el.__cache.mbjxh){
					el.name += "["+el.__cache.mbjxh+"]";
				}
			}
			el.checked = true;
			_nodes.push(el);
		});
		
		//复选框事件
        function onCheck(event, treeId, treeNode) {
        	//如果是父节点
        	if(treeNode.children){
        		let _controlNodeArray = _this.getNodes(treeNode.children || []);
        		$.each(_controlNodeArray,function(index,el){
        			let _feature = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(el.id);
		        	if(_feature){
		        		if(treeNode.checked){
			        		_feature.show();
			        	}else{
			        		_feature.hide();
			        	}
		        	}
        		});
        	}else{
        		let _feature = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(treeNode.id);
	        	if(_feature){
	        		if(treeNode.checked){
		        		_feature.show();
		        	}else{
		        		_feature.hide();
		        	}
	        	}
        	}
        }
        
        function onDblClick(event, treeId, treeNode){
        	if(treeNode.children){
        		return;
        	}
        	
        	parent.MAPCONTROL.setFeaturePositionAnimateById(treeNode.id);
        }
        
        let _setting = {
            check: {
                enable: false,
                chkStyle: "checkbox",
//	            chkStyle: "radio",
//              autoCheckTrigger : true
            },
            data: {
                simpleData: {
					enable: true
				}
            },
            callback: {
                onCheck: onCheck,
                onDblClick : onDblClick
            }
        };
        
        let _classZTree = new ClassZTree();
        _classZTree.init({
            element: $ztree,
            setting: _setting,
            zNodes: _nodes,
        });
        _treeObj = _classZTree.getZTreeObj();
        let _nodeRoot = _this.getNodeById("root");
        _treeObj.expandNode(_nodeRoot,true,true);
        
        //自动给最后节点加上class
        function __autoSetClassNmae(nodes,className){
        	$.each(nodes, function(index,el) {
        		if(el.children && el.children.length>0){
        			__autoSetClassNmae(el.children,className);
        		}else{
        			let $doc = $ztree.find("#"+el.tId+"_span");
        			$doc.addClass(className);
        		}
        	});
        }
        
    	__autoSetClassNmae(_treeObj.getNodes(),"outline");
    	_treeObj.expandNode(_nodeRoot,false,true);
    	
    	//从地图查找目标是否存在
    	function __autoSearchLayerFeatures(nodes,className){
    		$.each(nodes, function(index,el) {
    			let _feature = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(el.id);
    			if(_feature){
    				let $doc = $ztree.find("#"+el.tId+"_span");
        			$doc.addClass(className);
    			}
    		});
    	}
    	__autoSearchLayerFeatures(this.getNodes(_treeObj.getNodes()),"online");
	}
	module.addNodeRoots = function(){
		let _nodes = [{
        	id : "root",
			name : "目标自定义分组",
			pId : 0,
			checked : true,
			isParent : true,
        }];
        _treeObj.addNodes(null,-1,_nodes);
	}
	module.getNodes = function(nodes){
		let _array = [];
		function getNodes(nodes){
			$.each(nodes, function(index,el) {
				_array.push(el);
				if(el.children){
					getNodes(el.children);
				}
			});
		}
		getNodes(nodes);
		return _array;
	}
	module.getNodesFilterByParent = function(nodes){
		let _array = [];
		function getNodes(nodes){
			$.each(nodes, function(index,el) {
				if(el.children){
					getNodes(el.children);
				}else{
					_array.push(el);
				}
			});
		}
		getNodes(nodes);
		return _array;
	}
	
	module.getTreeObj = function(){
		return _treeObj;
	}
	module.getNodeById = function(id){
		return _treeObj.getNodeByParam("id",id);
	}
	module.setNodeShow = function(id,show){
		let _node = this.getNodeById(id);
		if(_node){
			let $doc = $ztree.find("#"+_node.tId+"_span");
			show ? $doc.addClass("online") : $doc.addClass("outline");
		}
	}
	
	/**
	 * 获取分组tree
	 */
	module.httpGetMBGroupList = function(){
		
		let _moduleMain = getModuleWindowPageObjectByName("system.main");
		let _data = {
			username : _moduleMain.USER_MAIN.getUserInfo()["username"],
		};
		
		_data = JSON.stringify(_data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiaofenzu.getListAll"),
			data : _data,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					
					_this.initTree(result.data);
				}
			}
		});
	}
	
	module.init = function(){
		_ZHTS_SSTS_MUBIAO_CONTROL = parent.ZHTS_SSTS_MUBIAO_CONTROL;
		
		$doc = $("#x-view-content");
		$ztree = $("#accordion-ztree-zhts-group");
		
		this.httpGetMBGroupList();
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_SSTS_TREE_GROUP={});