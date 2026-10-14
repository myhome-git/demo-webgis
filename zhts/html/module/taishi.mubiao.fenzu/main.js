var _FunctionObject = _FunctionObject || {};
var _pageObject = _FunctionObject;
var _iframeMain;

/**
 * tree
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,$tree,_classZTree;
	
	let _moduleMain = getModuleWindowPageObjectByName("system.main");
	let _username = _moduleMain.USER_MAIN.getUserInfo()["username"];
	
	/**
	 * 提交表单数据
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url = getModuleURL("http.zhts.ssts.mubiaofenzu.tree.add"),
			layui = top.layui;
		
		let _nodes = _this.getNodes(_classZTree.getZTreeObj().getNodes());
		
		let _moduleMain = getModuleWindowPageObjectByName("system.main");
		_data = {
			username : _moduleMain.USER_MAIN.getUserInfo()["username"],
			nodes : _nodes
		};
		
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					_this.updateTree();
					layui.layer.msg("操作成功");
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
	 * 根据id获取数据
	 * @param {Object} id
	 */
	module.httpGetDataById = function(option){
		let _moduleMain = getModuleWindowPageObjectByName("system.main");
		let _data = {
			username : _moduleMain.USER_MAIN.getUserInfo()["username"],
		};
		_sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiaofenzu.tree.getList"),
			data : _sendData,
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
	module.httpGetMBDataById = function(option){
//		let _sendData = JSON.stringify(option.data);
		let _sendData = option.data;
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiaofenzu.pager"),
			type : "get",
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					
					if(option && option.callback){
						option.callback(result.data.rows);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.updateTree = function(){
		top.PAGEOBJECT.ZHTS_SSTS_TREE_GROUP.httpGetMBGroupList();
	}
	
	/**
	 * 获取所有节点
	 * @param {Object} nodes
	 */
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
	module.getSelectedNodes = function(){
		return _classZTree.getZTreeObj().getSelectedNodes();
	}
	module.isSelectedNode = function(){
		if(this.getSelectedNodes().length>0){
			return true;
		}
		return false;
	}
	
	module.addNodes = function(parentNode,node,callback){
		_classZTree.getZTreeObj().addNodes(parentNode,[node]);
		
		if(callback){
			callback();
		}
	}
	module.updateNode = function(node,callback){
		_classZTree.getZTreeObj().updateNode(node);
		if(callback){
			callback();
		}
	}
	module.removeNode = function(node,callback){
		if(!node){
			return;
		}
		_classZTree.getZTreeObj().removeNode(node);
		if(callback){
			callback();
		}
	}
	
	/**
	 * 初始化tree
	 * @param {Object} data
	 */
	module.initTree = function(data){
		//复选框事件
        function onCheck(event, treeId, treeNode) {
        	//如果是父节点
        	if(treeNode.children){
        		let _controlNodeArray = _this.getNodes(treeNode.children || []);
        		
        	}else{
        		
        	}
        }
        
        function onDblClick(event, treeId, treeNode){
        	_FunctionObject.FENZUGUANLI.InitTable({
        		where : {
        			pId : treeNode.id,
        			username : _username
        		}
        	});
        }
        
        function onClick(event, treeId, treeNode){
        	_FunctionObject.FENZUGUANLI.InitTable({
        		where : {
        			pId : treeNode.id,
        			username : _username
        			
        		}
        	});
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
            	onClick : onClick,
                onCheck: onCheck,
                onDblClick : onDblClick
            }
        };
        
        _classZTree = new ClassZTree();
        _classZTree.init({
            element: $tree,
            setting: _setting,
            zNodes: data || [],
        });
//      _treeObj = _classZTree.getZTreeObj();
        
//      let _nodeRoot = _this.getNodeById("root");
//      _treeObj.expandNode(_nodeRoot,true,false);
//      $ztree.parent().addMCustomScrollbar();
	}
	
	module.createNode = function(_selectedNode){
		layui.layer.prompt({
			title : "名称"
		},function(value, index, elem){
			let _newNode,_parentNode;
			if(_selectedNode.length<1){
				_newNode = {
					id : WebLoader.createUUID(),
					name : value,
					pId : 0
				};
			}else{
				_parentNode = _selectedNode[0];
				_newNode = {
					id : WebLoader.createUUID(),
					name : value,
					pId : _parentNode.id
				};
			}
			_this.addNodes(_parentNode,_newNode,function(){
				_this.httpSubmitForm({
					callback : function(){
						layui.layer.close(index);
					}
				});
			});
		});
	}
	
	module.bindEvent = function(){
		$doc.find("[x-btn-name]").on("click",function(){
			let $this = $(this),
				_value = $this.attr("x-btn-name");
				
			let layui = top.layui;
			switch (_value){
				case "add":
					(function(){
						let _selectedNode = _this.getSelectedNodes();
						if(_selectedNode.length>0){
							_this.httpGetMBDataById({
								data :{
									pId : _selectedNode[0].id,
									page : 1,
									rows : 1
								},
								callback : function(data){
									if(data && data.length>0){
										layui.layer.msg("已存在目标数据，无法添加子节点");
										return;
									}
									
									_this.createNode(_selectedNode);
								}
							});
						}else{
							_this.createNode(_selectedNode);
						}
						
					})();
					break;
				case "clear":
					(function(){
						_classZTree.getZTreeObj().refresh();
					})();
					break;
				case "update":
					(function(){
						let _selectedNode = _this.getSelectedNodes();
						if(_selectedNode.length<1){
							layui.layer.msg("未选中数据");
							return;
						}
						let _node = _selectedNode[0];
						layui.layer.prompt({
							title : "名称",
							value : _node.name
						},function(value, index, elem){
							_node.name = value;
							_this.updateNode(_node,function(){
								_this.httpSubmitForm({
									callback : function(){
										layui.layer.close(index);
									}
								});
							});
						});
					})();
					break;
				case "delete":
					(function(){
						let _selectedNode = _classZTree.getZTreeObj().getSelectedNodes();
						if(_selectedNode.length<1){
							layui.layer.msg("未选中数据");
							return;
						}
						let _node = _selectedNode[0];
						_this.removeNode(_node,function(){
							_this.httpSubmitForm({
								callback : function(){
									_FunctionObject.FENZUGUANLI.InitTable({});
								}
							});
						})
					})();
					break;
				default:
					break;
			}
		});
	}
	
	module.init = function(){
		$doc = $("#tree-box");
		$tree = $("#ssts-group-tree");
		this.bindEvent();

		layui.use(["form"],function(){
			layui.form.render();
			_this.httpGetDataById({
				callback : function(data){
					_this.initTree(data);
				}
			});
		});
	}
	
})(jQuery,_pageObject,_pageObject.TREE={});

//区域管理
(function($,_FunctionObject) {
	
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='fenzuguanli']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-QUYUGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		
		//复写方法，浏览器缩放时可以动态设置
		_xUtilLayuiTable.GetTableAutoHeight = function(){
			return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiTableSearchData.offset().top - 10;
		}
		
		_FunctionObject.InitTable = function(option){
			option = option || {};
			_xUtilLayuiTable.init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				height: _xUtilLayuiTable.GetTableAutoHeight(),	//采用美化版滚动条，不再layui内部进行滚动条
				toolbar : "#TemplateTableToolbar",
				cols: _layuiTableHeader.data["tableQUYUGUANLI"].header || [],
				url: getModuleURL("http.zhts.ssts.mubiaofenzu.pager"),
				where : option.where || (function(){
					var _data = _FunctionObject.$layuiSearchInputBox.getFormValue();
					for(var i in _data){
						if(_data[i].length<1){
							delete _data[i];
						}
					}
					
					return _data;
				})(),
				callback : {
					onRowClick : function(obj){
						
					},
					onRowTool : function(obj){
						var data = obj.data,
							layEvent = obj.event;
						if(layEvent === 'delete') {
							_FunctionObject.RemoveTableById([data.id]);
						}else if(layEvent === 'update'){
							_FunctionObject.openLayerEditPage("update",data.areaType,data.id);
						}else if(layEvent === 'select'){
							//先关闭由edit弹出的层
							layui.layer.close(_FunctionObject.__layerOpenIndex);
							_FunctionObject.httpGetPageById(data.id);
						}
					},
					onToolbar : function(layEvent,checkStatus){
						switch (layEvent){
							case "table-refresh":
								let _selectedNode = _pageObject.TREE.getSelectedNodes();
								if(_selectedNode.length<1){
									_FunctionObject.InitTable();
								}else{
									_xUtilLayuiTable.reload();
								}
								break;
							case "table-delete-multiple":
								let _ids = [];
								$.each(checkStatus.data, function(index,el) {
									_ids.push(el.id);
								});
								if(_ids.length<1){
									layui.layer.msg("未选中任何数据");
									return;
								}
								_FunctionObject.httpRemoveTableMultipleById(_ids);
								break;	
							default:
								break;
						}
					},
				}
			});
		}
		
		//打开编辑或新增页面
		_FunctionObject.openLayerEditPage = function(option){
			layui.layer.close(this.__layerOpenIndex);
			
			function clearMapDraw(){
				try{
        			let _module = _iframeMain.FENCE_DRAW;
            		//清除本次绘制
            		_module.clearInteractionActive()
            			.clearLayer();
            	}catch(e){
            		//TODO handle the exception
            	}
			}
			
			var _this=this,_title;
			switch (option.action){
				case "update":
					_title = "更新";
					break;
				case "select":
					_title = "查看";
					break;	
				default:
					_title = "新增";
					break;
			}
			
			//获取范围内的目标
			let _queryLayerArray = [];
			if(_title=="新增"){
				let _extentFeatures = WebLoader.classGIS.getMapLayerFeaturesByGeometry(
					_iframeMain.ZHTS_SSTS_MUBIAO_CONTROL.getLayerMuBiao(),
					option.event.feature.getGeometry(),
					function(feature){
						return true;
					}
				);
				$.each(_extentFeatures, function(index,el) {
					let _cache = el.get("__cache");
					_queryLayerArray.push({
						mbbh :  _cache["mbbh"],
						mbmc : el.get("__name"),
						mbph : _cache["ph"],
						mbjxh : _cache["jxh"],
						user_id : null
					});
				});
			}
			
			let _moduleName = "module.taishi.mubiao.fenzu.add",
				_url = getModuleURL(_moduleName),
				_open_id = _moduleName.replace(/\./,"-");
			layui.layer.openWin({
				id : _open_id,
                type: 2,
                title: _title,
                isOutAnim : false, 
                area: ['385px', '450px'],
                content: _url+"?id=fenzuguanli",
                btn: (function(){
                	if(option.action=="select"){
                		return false;
                	}else{
                		return ['保存', '取消'];
                	}
                })(),
                yes: function (index) {
                	let _win = getModuleWindowByURL(_url);
                	_win._pageObject.FORM.httpSubmitForm({
                		callback : function(){
	                		clearMapDraw();
	                		
	                		let _parentObj = getModuleWindowByName("module.taishi.mubiao.fenzu.main");
	                		_parentObj._pageObject.TREE.updateTree();
	                		_xUtilLayuiTable.reload();
	                		layui.layer.close(index);
	                	}
                	});
                },
                end : function(){
                	clearMapDraw();
                },
                success: function(layero, index){
                	_this.__layerOpenIndex = index;
                	let _win = getModuleWindowByName(_moduleName);
                	_win._FunctionObject.FENZUGUANLI.InitTable(_queryLayerArray);
                	
                	let _selectedNodes = _pageObject.TREE.getSelectedNodes();
                	if(_selectedNodes.length<1){
                		layui.layer.msg("未选中数据");
                		return;
                	}
                	_win._pageObject.FORM.getDoc().setFormValue({
                		pId : _selectedNodes[0].id
                	});
				}
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = {
					ids : id
				};
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : getModuleURL("http.zhts.ssts.mubiaofenzu.delete"),
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
							
							let _moduleMain = getModuleWindowPageObjectByName("system.main");
							_moduleMain.ZHTS_SSTS_TREE_GROUP.httpGetMBGroupList();
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
			});
		}
		
		//删除多个数据
		_FunctionObject.httpRemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				  var _data = {
					ids : id
				};
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : getModuleURL("http.zhts.ssts.mubiaofenzu.delete"),
						data : _data,
						success : function(data){
							if(data["code"]=="0"){
								layer.msg("删除成功");
								_xUtilLayuiTable.reload({
									isLastPageIndex : true
								});
								
								let _moduleMain = getModuleWindowPageObjectByName("system.main");
								_moduleMain.ZHTS_SSTS_TREE_GROUP.httpGetMBGroupList();
							}else{
								layer.msg(data["message"],{time:5000});
							}
						}
					});
				
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			//初始化表单
			layui.use('form', function(){
				_FunctionObject.layuiForm.render();
				_FunctionObject.$layuiSearchInputBox.find("[x-btn-name]").on("click",function(){
					var $this = $(this),
						_val = $this.attr("x-btn-name");
					switch (_val){
						case "button-search":
							_this.InitTable();
							break;
						case "button-clear":
							let _module = _iframeMain.FENCE_DRAW;
							
							if(_module.getSelectFeatures().length>0){
								_module.clearSelectFeatures();
							}
							
							if(_module.getFeatures().length<1){
								_module.clearLayer();
								_module.clearInteractionActive();
							}
							
							break;
						case "button-add-circle":
							let _isSelectedNode = _pageObject.TREE.isSelectedNode();
		                	if(!_isSelectedNode){
		                		layui.layer.msg("未选中左侧数据");
		                		return;
		                	}
                	
							layui.layer.close(_FunctionObject.__layerOpenIndex);
							function eventCallback(event){
								_this.openLayerEditPage({
									action : "add",
									event : event
								});
							}
							_iframeMain.FENCE_DRAW.clearLayer()
								.setCallback("draw.Circle.drawend",eventCallback)
								.changeInteractionActive(["select","draw.Circle"]);
							break;
						case "button-add-polygon":
							(function(){
								let _isSelectedNode = _pageObject.TREE.isSelectedNode();
			                	if(!_isSelectedNode){
			                		layui.layer.msg("未选中左侧数据");
			                		return;
			                	}
			                	
								layui.layer.close(_FunctionObject.__layerOpenIndex);
								function eventCallback(event){
									_this.openLayerEditPage({
										action : "add",
										event : event
									});
								}
								_iframeMain.FENCE_DRAW.clearLayer()
									.setCallback("draw.Polygon.drawend",eventCallback)
									.changeInteractionActive(["select","draw.Polygon"]);
							})();
							break;
						default:
							break;
					}
				});
				
				//绑定回车键
				_this.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
					if(event.keyCode==13){
						_this.InitTable();
					}
				});
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			var _className = "tableQUYUGUANLI".toUpperCase();
			var _html = template("TemplateTableSearch"+_className,{isRun : true});
			_FunctionObject.$layuiSearchInputBox.empty().html(_html);
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.InitTable(layui.table);
			});
		}
		
	}
})(jQuery,_FunctionObject.FENZUGUANLI = {});


(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		layui.use('element', function(){
			var element = layui.element;
			element.on('tab(docDemoTabBrief)', function(data){
				let $context = $(data.elem.context);
			    switch ($context.attr("module-tab-title-name")){
			    	case "fenzuguanli":
			    		_FunctionObject.FENZUGUANLI.init();
			    		break;
			    	default:
			    		break;
			    }
			});
			
			var _id = xUtilBase.getUrlParam("id");
			$(".layui-tab .layui-tab-title >li[module-tab-title-name='"+_id+"']").trigger("click");
		});
		
		_FunctionObject.init = function(){
			_iframeMain = getModuleWindowPageObjectByName("system.main");
			_iframeMain.FENCE_DRAW.init({
				map : _iframeMain.MAP.getMap(),
				ol : top.ol
			});
			
			_pageObject.TREE.init();
		}
		
		_FunctionObject.init();
	}
})(jQuery);