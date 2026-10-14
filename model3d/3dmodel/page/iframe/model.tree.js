var _FunctionObject = _FunctionObject|| {};

(function($,xUtilBase){
	
	$(document).ready(documentReady);
	
	function documentReady(){
		
		//初始化模型树
		_FunctionObject.LoadModelTree = function(){
			
			var _this = this;
			
			var _data = {
				
				id : "mubiaofenlei",
				
				page: 1,
				
				rows: 1000
				
			};
			
			_data = JSON.stringify(_data);
			
			xUtilBase.ajax({
				url : "/model_3d/api/model3dDictType/getSubTreeById",
				type : "post",
				data : _data,
				contentType : "application/json;charset=UTF-8",
				success : function(result){
					if(result["code"]=="0"){
						if(!result.data){
							return false;
						}
						
			        	var nodes = [];
			        	
			        	$.each(result.data, function(index,el) {
		            		nodes.push({
		            			id : el.id,
		            			name : el.name,
		            			pId : el.pId
		            		});
		            	});
		            	
		            	//选中事件
						function onCheck(event, treeId, treeNode){
							
							_this.__modelTree.GetZTreeObj().selectNode(treeNode, false, false);
							
						}
						
						//单击事件
						function onClick(event, treeId, treeNode){
							
							_this.__modelTree.GetZTreeObj().checkNode(treeNode, !treeNode.checked, true);
							
							if(treeNode.checked){
								
							}
							
						}
		
						var setting = {
							check: {
								enable: true,
								chkStyle: "radio",
								radioType : "all",
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
							}
						};
						var _xZTree = new xZTree();
			
						_xZTree.init({
							element : $("#modelTree"),
							setting : setting,
							zNodes : nodes
						});
						
						_this.__modelTree = _xZTree;
						
					}else{
						top.layui.layer.msg("获取模型树失败");
					}
				}
			});
				
		}
		
		//设置树选中
		_FunctionObject.SetTreeSelectedById = function(_ids){
			
			var _this = this;
			
			var _ztree = _this.GetTreeObject();
			
			$.each(_ids, function(index,el) {
				
				var _treeNode = _ztree.getNodeByParam("id",el,null);
				
				if(_treeNode){
					
					_ztree.checkNode(_treeNode, true, true);
					
					_ztree.selectNode(_treeNode);
					
				}
				
			});
			
		}
		
		//获取tree对象
		_FunctionObject.GetTreeObject = function(){
			
			return this.__modelTree.GetZTreeObj();
			
		}
		
		_FunctionObject.init  = function(){
			
			this.LoadModelTree();
			
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);