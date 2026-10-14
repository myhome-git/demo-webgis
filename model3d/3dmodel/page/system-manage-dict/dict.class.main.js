var _FunctionObject = _FunctionObject || {};
window._FunctionObject = _FunctionObject;
(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$ztree = $("#ztree-dict-class");
		_FunctionObject.$ztreeToolbar = _FunctionObject.$body.find("#ztree-toolbar");
		
		//绑定表格工具栏
		_FunctionObject.$ztreeToolbar.find("[x-btn-name]").on("click",function(){
			var $this = $(this),
				_val = $this.attr("x-btn-name");
			switch (_val){
				case "add":
					_FunctionObject.OpenLayerEditPage('add');
					break;
				case "update":
					_FunctionObject.OpenLayerEditPage('update');
					break;
				case "refresh":
					_FunctionObject.getTreeList();
					var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/system-manage-dict/dict.main.html");
                	if(_iframeWindow){
                		setTimeout(function(){
                			_iframeWindow._FunctionObject.InitTable();
                		},750);
                	}
					break;
				case "delete-multiple":
					var _nodes = _FunctionObject.getZtree().getSelectedNodes();
					if(_nodes.length<1){
						top.layui.layer.msg("没有选择节点");
						return false;
					}
					if(_nodes.length>1){
						top.layui.layer.msg("不能删除多个");
						return false;
					}
					_FunctionObject.RemoveTreeById(_nodes[0].id);
					break;	
				default:
					break;
			}
		});
		
		//获取ztree数据
		_FunctionObject.getTreeList = function(){
			var _this = this;
			xUtilBase.ajax({
				url : "/model_3d/api/model3dDictType/getModel3dDictTypeTree",
				type : "get",
				success : function(result){
					if(result["code"]=="0"){
						var _nodes = result.data;
						
						//复选框
						function onCheck(event, treeId, treeNode){
							
							var treeObj = $.fn.zTree.getZTreeObj(treeId);
							
							var nodes = treeObj.getCheckedNodes(true);
							
						}
						
						//复选框
						function onClick(event, treeId, treeNode){
							if(treeNode){
								
								var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/system-manage-dict/dict.main.html");
								
			                	if(_iframeWindow){
			                		
			                		_iframeWindow._FunctionObject.InitTable();
			                		
			                	}
			                	
			                	_this.__cacheSelectedNode = treeNode;
			                	
							}
						}
						var setting2 = {
							data: {
								simpleData: {
									enable: true
								}
							},
							callback :{
								onCheck : onCheck,
								onClick : onClick
							}
						};

						_this.classZtree = _xZTree2 = new xZTree();
						_xZTree2.init({
							element : _FunctionObject.$ztree,
							setting : setting2,
							zNodes : _nodes
						});
						
						if(_this.__cacheSelectedNode){
							
							var _ztree = _this.classZtree.GetZTreeObj();
			
								_ztree.selectNode(_this.__cacheSelectedNode);
							
						}
						
					}else{
						layer.msg(result["message"],{time:5000});
					}
				}
			});
		}
		
		//取出ztree对象
		_FunctionObject.getZtree = function(){
			return this.classZtree ? this.classZtree.GetZTreeObj() : null;
		}
		
		//取出选中
		_FunctionObject.getSelectedNode = function(){
			var treeObj = this.getZtree();
        	if(!treeObj){
        		top.layui.layer.msg("节点树未初始化");
        		return;
        	}
        	
        	var _nodes = treeObj.getSelectedNodes();
        	if(_nodes.length<1){
        		top.layui.layer.msg("未选中左侧分类");
        		return;
        	}
        	
        	return _nodes[0];
		}
		
		//打开编辑或新增页面
		_FunctionObject.OpenLayerEditPage = function(_action,_id){
			var _this = this;
			var _title = _action == "update" ? "更新分类" : "新增分类";
			top.layui.layer.open({
				id : "layer-open-car",
                type: 2,
                anim : -1,
                title: "<i class='iconfont fa fa-book'></i>&nbsp;"+_title,
                shade : 0.3,
                area: ['550px', '350px'],
                shadeClose: false,
                isOutAnim : false,
                content: "/model3d/3dmodel/page/system-manage-dict/dict.class.add.html?action="+_action+(_id?"&id="+_id:""),
                btn: ['保存', '取消'],
                yes: function (index,layero) {
                	
                	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/system-manage-dict/dict.class.add.html");
                	_iframeWindow._FunctionObject.httpSubmitPage(function(){
                		top.layui.layer.close(index);
                	});
                	
                },
                cancel: function(index, layero){
					
				}, 
				end : function(index, layero){
                	
                },
                success: function(layero, index){
				   
				   _this.__cacheSelectedNodes = _this.getZtree().getSelectedNodes();
				   
				}
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTreeById = function(id){
			var _this = this;
			var treeObj = _this.getZtree();
			if(!treeObj){
				top.layui.layer.msg("tree未初始化");
				return false;
			}
			
			var _node = treeObj.getNodeByParam("id",id);
			if(!_node){
				top.layui.layer.msg("节点不存在");
				return false;
			}
			if(_node.children && _node.children.length>0){
				top.layui.layer.msg("该节点下还有子节点，请先删除子节点");
				return false;
			}
			top.layui.layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示',anim : -1,shade : 0.001}, function(index){
				  var _data = [id];
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : "/model_3d/api/model3dDictType/deleteData",
						type : "post",
						data : _data,
						contentType : "application/json;charset=UTF-8",
						success : function(data){
							if(data["code"]=="0"){
								top.layui.layer.msg("删除成功");
								treeObj.removeNode(_node);
							}else{
								top.layui.layer.msg(data["message"],{time:5000});
							}
						}
					});
				
			});
		}
		
		_FunctionObject.init = function(){
			
			var _this = this;
			
			layui.use(['form','laydate','table'], function(){
				
				_this.layuiForm = layui.form;
				
				_this.layuiDate = layui.laydate;
				
				_this.layuiTable = layui.table;
				
			});
			
			this.getTreeList();
			
		}
		
		_FunctionObject.init();
	}
})(jQuery);