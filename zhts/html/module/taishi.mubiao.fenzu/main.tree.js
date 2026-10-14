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
        	
        }
        
        function onDblClick(event, treeId, treeNode){
        	
        }
        
        function onClick(event, treeId, treeNode){
        	
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
			_FunctionObject.TREE.init();
		}
		
		_FunctionObject.init();
	}
})(jQuery);