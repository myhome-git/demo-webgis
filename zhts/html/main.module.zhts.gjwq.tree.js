/**
 * 攻击武器tree
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		$ztree,_treeObj;
		
	let _WUQI_XIAONENG_DRAW_SHOW;

	/**
	 * 生成ztree tree
	 */
	module.initTree =  function(data){
			
		//复选框事件
        function onCheck(event, treeId, treeNode) {
        	//如果是父节点
        	if(treeNode.children){
        		let _controlNodeArray = _this.getNodes(treeNode.children || []);
        		$.each(_controlNodeArray,function(index,el){
        			_this.addMapWUQI(el);
        			if(!el.children || el.children.length<1){
        				let _feature = _WUQI_XIAONENG_DRAW_SHOW.getFeatureById(el.id);
			        	if(_feature){
			        		if(treeNode.checked){
				        		_this.addMapWUQI(el);
				        	}else{
				        		_WUQI_XIAONENG_DRAW_SHOW.removeFeatureWUQI(el.id);
				        	}
			        	}
        			}
        		});
        	}else{
        		if(treeNode.checked){
        			_this.addMapWUQI(treeNode);
	        	}else{
	        		_WUQI_XIAONENG_DRAW_SHOW.removeFeatureWUQI(treeNode.id);
	        	}
        	}
        }
        
        function onDblClick(event, treeId, treeNode){
        	if(treeNode.children){
        		return;
        	}
        	
        	parent.WUQI_XIAONENG_DRAW_SHOW.setFeaturePositionAnimateById(treeNode.id);
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
            zNodes: data || [],
        });
        _treeObj = _classZTree.getZTreeObj();
        
//      let _nodeRoot = _this.getNodeById("root");
//      _treeObj.expandNode(_nodeRoot,true,false);
        $ztree.parent().addMCustomScrollbar();
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
	 * 添加武器
	 * @param {Object} nodes
	 */
	module.addMapWUQI = function(obj){
		if(obj.userObject){
			parent.WUQI_XIAONENG_DRAW_SHOW.addFeatureWUQI(obj.userObject);
		}
	}
	
	module.getTreeObj = function(){
		return _treeObj;
	}
	module.getNodeById = function(id){
		return _treeObj.getNodeByParam("id",id);
	}
	
	module.init = function(data){
		_WUQI_XIAONENG_DRAW_SHOW = parent.WUQI_XIAONENG_DRAW_SHOW;
		
		$doc = $("#x-view-content");
		$ztree = $("#accordion-ztree-gjwq");
		this.initTree(data);
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_GJWQ_TREE={});

/**
 * 攻击武器 http接口
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
	module.httpGetTree = function(option){
		xUtilBase.ajax({
			url : "/data-server/ts/wq/queryWqByTree",
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option && option.callback){
						option.callback(result.data);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.init = function(){
		this.httpGetTree({
			callback : function(result){
				parent.ZHTS_GJWQ_TREE.init(result);
			}
		});
	}
	
})(jQuery,_pageObject,_pageObject.ZHTS_GJWQ_HTTP={});
