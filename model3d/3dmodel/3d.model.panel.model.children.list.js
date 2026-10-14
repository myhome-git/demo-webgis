/**
 * 模型左侧控制逻辑-模型列表
 */
function ClassPanelModelChildrenList(){
	
	//定义变量
	var _this = this,
	
		$panelMain = $("#x-view-model-children-tree-panel");
		
	this.__ClassLinkObject = new Object();
	
	//定义外部class变量
	var _classModelControl,
		_classPanelModelChildrenEdit;
	
	
	//初始化外部类
	this.InitLinkClass = function(_name,_class){
		
		this.__ClassLinkObject[_name] = _class;
		
	}
	
	//获取外部类
	this.GetLinkClass = function(_name){
		
		if(!_name){
			
			return this.__ClassLinkObject;
			
		}
		
		return this.__ClassLinkObject[_name];
		
	}
	
	//打开面板
	this.OpenPanel = function(){
		
		$panelMain.removeClass("panel-hidden");
		
	}
	
	//关闭面板
	this.ClosePanel = function(){
		
		$panelMain.addClass("panel-hidden");
		
	}
	
	//绑定搜索框
	this.BindTreeSearchInputEvent= function(){
		
		var keyupClock,
		
			$input = $panelMain.find(".x-panel-title > input[x-input-name='searchTreeNodeName']");
			
		//设置父层显示
		function removePanelHidden($doc){
			
			$doc.removeClass("panel-hidden");
			
			if(!$doc.parent().hasClass("ztree")){
				
				removePanelHidden($doc.parent());
				
			}
			
		}
			
		$input.on("keyup",function(event){
			
			keyupClock = event.timeStamp;
			
			var $this = $(this),
			
				_val = $this.val();
				
			if(!_this.GetZtreeObject()){
				
				return false;
				
			}
				
			if(!_val){
				
				//第一种方法的处理
//				$ztree.find("a").removeClass("panel-hidden");
				
				//第二种方法的处理
				_this.GetZtreeDocument2().addClass("panel-hidden");
				
				$panelMain.find(".btn-search-close").addClass("panel-hidden");
				
				_this.GetZtreeDocument().removeClass("panel-hidden");
				
				return false;
				
			}
			
			
			
			setTimeout(function(){
				
	            if(keyupClock-event.timeStamp==0){
	            	
					$panelMain.find(".btn-search-close").removeClass("panel-hidden");
					
					var _ztree = _this.GetZtreeObject(),
						
						$ztree = _this.GetZtreeDocument(),
						
						_nodes = _ztree.transformToArray(_ztree.getNodes());
					
					//使用原生搜索，会出现搜索不准确
//					var _searchNodes = _ztree.getNodesByParamFuzzy("name", _val, null);

					var _searchNodes = (function(){
						
						var _array = [];
						
						$.each(_nodes, function(index,el) {
								
							if(el.name.indexOf(_val)>-1){
								
								var _obj = $.extend(true, {}, el);
								
								_obj.open = true;
								
								_obj.isParent = false;
								
								_obj.children = [];
								
								_array.push(_obj);
								
							}
							
						});
						
						return _array;
						
					})();
					
					//第一种方法
//					$ztree.find("li").addClass("panel-hidden");
//					
//					$.each(_searchNodes, function(index,el) {
//						
//						var $d = $ztree.find("#"+el.tId+"_a");
//						
//						removePanelHidden($d);
//						
//					});
					
					//第二种方法
					$ztree.addClass("panel-hidden");
					
					//单击事件
					function onClick(event, treeId, treeNode){
						
						var _treeNode0 = _ztree.getNodeByParam("id",treeNode.id,null);
						
						if(_treeNode0){
							
							$ztree.find("#"+_treeNode0.tId+"_a").trigger("click");
							
							_ztree.selectNode(_treeNode0);
							
						}
						
					}

					var setting = {
						check: {
							enable: false,
						},
						data: {
							simpleData: {
								enable: true
							}
						},
						callback :{
							onClick: onClick,
						},
						view: {
							dblClickExpand: true
						}
					};
					
					var $ztree2 = $("#x-view-model-children-tree-search");
					
					$ztree2.removeClass("panel-hidden");
					
					var _xZTreeObject = new xZTree();
					
					_this.__cacheZtree2 = _xZTreeObject;
					
					_xZTreeObject.init({
						element : $ztree2,
						setting : setting,
						zNodes : _searchNodes
					});
					
	            }
			},500);
			
		});
		
	}
	
	
	//生成模型列表树，nameIndex用于名称搜索
	this.CreateTree = function(nodes){
		
		//指针
		var _this = this;
		
		//缓存第一次nodes，方便搜索
		_this.__cacheZtreeNodes = nodes;
		
		_this.__cacheZtreeNodesIndex = (function(){
			
			var _array = [];
			
			$.each(_this.__cacheZtreeNodes, function(index,el) {
				
				_array.push(el.__modelNodeName);
				
			});
			
			return _array;
			
		})();
		
		//选中事件，用于显隐
		function onCheck(event, treeId, treeNode){
			
			_classModelControl.ClearScenesLabel();
			
			var _node = _classModelControl.GetModelNodeById(treeNode.id);
				
			if(_node){
				
				_classModelControl.SetModelNodeShow(_node.id,treeNode.checked);
				
			}

		}
		
		//单击事件
		function onClick(event, treeId, treeNode){
			
			//关闭编辑面板
			_classPanelModelChildrenEdit.ClosePanel();
			
			var _node = _classModelControl.GetModelNodeById(treeNode.id),
			
				_cacheNode = treeNode.__cacheNode || {},
				
				_option = {
					
					view : _cacheNode.view
					
				};
			
			_classModelControl.SetModelNodePosition(_node,_option);
				
			_classModelControl.SetModelNodeLabel(_node.name,_cacheNode.chName || _node.name);
			
		}
		
		//双击事件
		function onDblClick(event, treeId, treeNode){
			
//			_xZTreeObject.GetZTreeObj().checkNode(treeNode, !treeNode.checked, true);
			
		}
		
		//展开节点
		function onExpand(event, treeId, treeNode){
			
			var _tId = treeNode.tId,
			
				$ztreeLi =  $ztreeDocument.find("#"+_tId),
			
				_init = $ztreeLi.attr("is-init");
			
			//判断是否初始化
			if(!_init){
				
				$ztreeLi.find(">ul a").hover(onmouseover,onmouseout);
				
				$ztreeLi.attr("is-init",true);
				
				$.each(treeNode.children,function(index,el){
					
					_this.UpdateTreeNodeInfo(el.__cacheNode);
					
				});
				
			}
		}
		
		//鼠标滑过
		function onmouseover(event) {
			
			if(_this.__isMousehover){

				var _tId = $(this).attr("id");
				
					_tId = _tId.replace(/\_a$/,""),
				
					_ztree_node = _xZTreeObject.GetZTreeObj().getNodeByTId(_tId),
					
					_node = _classModelControl.GetModelNodeById(_ztree_node.id);
				
				if(_node && _ztree_node.checked){
					
					var _treeNodeCache = _ztree_node.__cacheNode;
					
					if(!_treeNodeCache){
						
						_treeNodeCache = {};
						
					}
					
					_classModelControl.SetModelNodeHighlight([_node.name]);
					
					_classModelControl.SetModelNodeAlphaColor(_node.name);
					
					_classModelControl.SetModelNodeLabel(_node.name,_treeNodeCache.chName);
					
				}
				
			}
			
		}
		
		
		//鼠标移出
		function onmouseout(event) {
			
			if(_this.__isMousehover){
				
				_classModelControl.ClearModelNodeAllLabel();
					
				_classModelControl.ClearModelNodeAllHighlight();
				
				return;
				
				var _nodes = _this.__cacheZtree.GetZTreeObj().getSelectedNodes();
								
				if(_nodes){
					
					var _array = [];
					
					$.each(_nodes, function(index,el) {
						
						if(el.checked){
							
							_array.push(el.name);
							
						}
						
					});
					
					_classModelControl.SetModelNodeHighlight(_array);
					
					_classModelControl.SetModelNodeLabels(_array);
					
				}
				
			}
			
		}
		
		var setting = {
			check: {
				enable: true,
				chkStyle: "checkbox",
//				radioType : "all",
				autoCheckTrigger: true
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback :{
				onCheck : onCheck,
				onClick: onClick,
				onDblClick : onDblClick,
				onExpand : onExpand
			},
			view: {
				dblClickExpand: true
			}
		};
		
		
		var $ztreeDocument = $("#x-view-model-children-tree");
		var _xZTreeObject = __temp_xZTreeObject = new xZTree();
		_xZTreeObject.init({
			element : $ztreeDocument,
			setting : setting,
			zNodes : nodes
		});
		
		//expandNode第三个参数为true则展开所有节点
		_xZTreeObject.GetZTreeObj().expandNode(_xZTreeObject.GetZTreeObj().getNodes()[0], true, true, true);
		_xZTreeObject.GetZTreeObj().expandNode(_xZTreeObject.GetZTreeObj().getNodes()[0], false, true, true);
		
		$ztreeDocument.find("a").hover(onmouseover,onmouseout);
		
		_this.__cacheZtree = _xZTreeObject;
		
		var _element = $("#x-view-model-children-tree-scrollbar");
		
		_element.css({"height":(_element.parent().outerHeight() - 82)+"px"});
		
		_element.mCustomScrollbar({
			theme: 'minimal-dark',
			scrollInertia: 100,
			axis: 'yx',
			mouseWheel: {
				enable: true,
				axis: 'y',
				preventDefault: true
			}
		});
		
		//绑定节点信息
		_this.httpGetModelNodeAll(_classModelControl.__modelId,function(result){
			
			if(result["code"]=="0"){
				
				var _httpNodes = result.data || [];
				
				_this.__cacheZtreeHttpNodes = _httpNodes;
				
				$.each(_httpNodes, function(idnex,el) {
					
					_this.UpdateTreeNodeInfo(el);
					
				});
				
			}
			
		});
		
	}
	
	//重置节点信息
	this.UpdateTreeNodeInfo = function(_data){
		
		if(!_data){
			
			return;
			
		}
		
		var _ztree = _this.GetZtreeObject(),
		
			_treeNode = _ztree.getNodeByParam("__modelNodeName",_data.name),
		
			_mothodName;
		
		if(!_treeNode){
			
			return;
			
		}
		
		if(_treeNode && _data.chName){
			
			_treeNode.__cacheNode = _data;
			
			//更新缓存name索引
			var _index = _this.__cacheZtreeNodesIndex.indexOf(_data.name);
			
			//重新组合名称
			if(_index>-1 && _treeNode.__cacheThree){
				
				var _cacheThree = _treeNode.__cacheThree;
				
				var _name = "["+_cacheThree.type+"] "+(_data.chName || _cacheThree.name);
				
				_treeNode.name = _name;
				
				_this.__cacheZtreeNodes[_index].name = _name;
				
			}
			
			_ztree.updateNode(_treeNode,false);
			
			_mothodName = "addClass";
			
		}else{
			
			_treeNode.__cacheNode = null;
			
			_mothodName = "removeClass";
			
		}
		
		var $doc = _this.GetZtreeDocument().find("#"+_treeNode.tId+"_a");
		
		$doc[_mothodName]("http-result");
		
	}
	
	//获取ztree
	this.GetZtreeObject = function(){
		
		if(!_this.__cacheZtree){
			
			return;
			
		}
		
		return _this.__cacheZtree.GetZTreeObj();
		
	}
	
	//获取ztreeDocument
	this.GetZtreeDocument = function(){
		
		if(!_this.__cacheZtree){
			
			return $("#temsdfsdfsdfdsf");
			
		}
		
		return _this.__cacheZtree.element;
		
	}
	
	this.GetZtreeObject2 = function(){
		
		if(!_this.__cacheZtree2){
			
			return;
			
		}
		
		return _this.__cacheZtree2.GetZTreeObj();
		
	}
	
	//获取ztree2
	this.GetZtreeDocument2 = function(){
		
		if(!_this.__cacheZtree2){
			
			return $("#temsdfsdfsdfdsf");
			
		}
		
		return _this.__cacheZtree2.element;
		
	}
	
	//取出选择树节点
	this.GetTreeSelectedNodes = function(){
		
		var _ztree = _this.GetZtreeObject();
		
		if(!_ztree){
			
			return [];
			
		}
		
		return _ztree.getSelectedNodes();
		
	}
	
	//取出选中树节点
	this.GetTreeCheckedNodes = function(){
		
		var _ztree = _this.GetZtreeObject();
		
		if(!_ztree){
			
			return [];
			
		}
		
		return _ztree.getCheckedNodes();
		
	}
	
	//取出服务器数据-节点信息
	this.httpGetModelNodeById = function(_id,_func){
		
		var _data = {
			
			id : _id
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/node/getById",
			contentType : "application/json;charset=UTF-8",
			data : _data,
			success : function(result){
				if(_func){
					_func(result);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//取出服务器数据-节点信息
	this.httpGetModelNodeByIdentifier = function(_identifier,_func,_func0){
		
		var _data = {
			
			identifier : _identifier
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/node/getByIdentifier",
			contentType : "application/json;charset=UTF-8",
			data : _data,
			success : function(result){
				if(_func){
					_func(result);
				}
			},
			error : function(a,b,c){
				if(_func0){
					_func0();
				}
			}
		});
		
	}
	
	//取出服务器数据-全部节点信息
	this.httpGetModelNodeAll = function(_modelIdentifier,_func){
		
		var _data = {
			
			modelIdentifier : _modelIdentifier
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/node/queryByModelIdentifier",
			contentType : "application/json;charset=UTF-8",
			data : _data,
			success : function(result){
				if(_func){
					_func(result);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//取出服务器数据-标牌
	this.httpGetModelNodeLabelByIdentifier = function(_identifier,_func){
		
		var _data = {
			
			modelNodeIdentifier : _identifier
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/node/lable/getByModelNodeIdentifier",
			contentType : "application/json;charset=UTF-8",
			data : _data,
			success : function(result){
				if(_func){
					_func(result);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//取出服务器数据-动画
	this.httpGetModelNodeAnimateByIdentifier = function(_identifier,_func){
		
		var _data = {
			
			modelNodeIdentifier : _identifier
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/node/animate/getByModelNodeIdentifier",
			contentType : "application/json;charset=UTF-8",
			data : _data,
			success : function(result){
				if(_func){
					_func(result);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	
	//打开模型列表
	this.LoadModelList = function(){
		
		this.ClosePanel();
		
		var $panelModelList = $("#x-view-model-list-panel");
		
		$panelModelList.removeClass("panel-hidden");
		
	}
	
	//类初始化
	this.Init = function(){
		
		//初始化class
			_classModelControl = _this.GetLinkClass("ClassModelControl"),
		
			_classPanelModelChildrenEdit = _this.GetLinkClass("ClassPanelModelChildrenEdit");
		
		
		//绑定关闭按钮
		$panelMain.find(".x-panel-title .btn-close").unbind().on("click",function(){
			
			_this.ClosePanel();
			
		});
		
		//绑定关闭按钮
		$panelMain.find(".x-panel-title .btn-search-close").unbind().on("click",function(){
			
			_this.GetZtreeDocument2().addClass("panel-hidden");
			
			var $btn = $panelMain.find(".btn-search-close");
			
			$btn.prev().val("");
			
			$btn.addClass("panel-hidden");
			
			_this.GetZtreeDocument().removeClass("panel-hidden");
			
			//反显节点
			var _nodes = _this.GetZtreeObject().getSelectedNodes();
			
			if(_nodes.length>0){
				
				_this.GetZtreeObject().selectNode(_nodes[0]);
				
			}
			
		});
		
		//绑定关闭按钮
		$panelMain.find("[x-button-name='OpenPanelModelList']").unbind().on("click",function(){
			
			_this.ClosePanel();
			
			var _classPanelModelList = _this.GetLinkClass("ClassPanelModelList");
			
			_classPanelModelList.OpenPanel();
			
		});
		
		this.BindTreeSearchInputEvent();
		
	}
	
}
