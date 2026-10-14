var _FunctionObject = _FunctionObject || {};
(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		_FunctionObject._xUtilLayuiTable = _xUtilLayuiTable;
		
		_FunctionObject.InitTable = function(){
			
			var _this = this;
			
			var _data = _this.$layuiSearchInputBox.getElValue();
			
			//判断结束时间是否小于开始时间
			if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
				layui.layer.msg("结束时间不能小于开始时间");
				return false;
			}
			
			//复写方法，浏览器缩放时可以动态设置
			_xUtilLayuiTable.GetTableAutoHeight = function(){
				return _this.$xHiddenWindow.outerHeight() - _this.$layuiSearchInputBox.outerHeight() - 45;
			}
			
			//初始化layer表格对象
			_xUtilLayuiTable.SetLayuitable(_FunctionObject.layuiTable);
			
			_xUtilLayuiTable.Init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				cellMinWidth: 1,
				height: _xUtilLayuiTable.GetTableAutoHeight(),
				page : true,
				limit:20,
				cols: _layuiTableHeader.data["table"].header || [],
				url: "/model_3d/api/modelKeyNote/getPagerData",
				method : "post",
				parseData:function (result) {
					result.data = result.data || {};
					return {
						code:0,
						count: result.data.total ? result.data.total : 0,
						data:result.data.rows
					}
				},
				request:{
					pageName:'page',
					limitName:'rows'
				},
				where : (function(){
					
					var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
					
					if(_this.moduleModelTree.__modelTree){
						var _nodes = _this.moduleModelTree.GetTreeObject().getSelectedNodes();
						if(_nodes.length<1){
							layui.layer.msg("请选择左侧模型");
							return false;
						}
						
						_data.modelIdentifier = _nodes[0].other;
					}
					
					var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
                	if(_iframeWindow && _iframeWindow._FunctionObject){
                		var treeObj = _iframeWindow._FunctionObject.getZtree();
	                	if(treeObj){
	                		var _nodes = treeObj.getSelectedNodes();
	                		if(_nodes.length>0){
	                			var _node = _nodes[0];
	                			_data.type = _node.id;
	                		}
	                	}
                	}
                	
					for(var i in _data){
						if(!_data[i]){
							delete _data[i];
						}
					}
					
					return _data;
				})(),
				autoHeight : true,
				onRowClick : function(obj){
					
				},
				onRowTool : function(obj){
					var data = obj.data,
						layEvent = obj.event;
					if(layEvent === 'delete') {
						_FunctionObject.RemoveTableById(data.id);
					}else if(layEvent === 'update'){
						_FunctionObject._focusSelectedTableTdData = data;
						_FunctionObject.OpenLayerEditPage("update",data.id);
					}else if(layEvent === 'unbindSn'){
						_FunctionObject.httpUnbindSn(data.id);
					}
				},
				onSelected : function(selectedArray,obj){
//					console.info(selectedArray,obj);
				}
			});
		}
		
		//绑定表格工具栏
		_FunctionObject.$layuiTableTopToolbar.find("[x-btn-name]").on("click",function(){
			var $this = $(this),
				_val = $this.attr("x-btn-name");
			switch (_val){
				case "add":
					_FunctionObject.OpenLayerEditPage('add');
					break;
				case "table-refresh":
					_xUtilLayuiTable.reload();
					break;
				case "delete-multiple":
					var _data = _xUtilLayuiTable.layuitable.checkStatus("layui-table-search-data");
					var _ids = [];
					$.each(_data.data, function(index,el) {
						_ids.push(el.id);
					});
					_FunctionObject.RemoveTableMultipleById(_ids);
					break;
				default:
					break;
			}
		});
		
		//打开编辑或新增页面
		_FunctionObject.OpenLayerEditPage = function(_action,_id){
			
			if(_action=="add"){
				var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
	        	if(!_iframeWindow){
	        		top.layui.layer.msg("未初始化字典管理窗口");
	        		return;
	        	}
	        	
	        	var treeObj = _iframeWindow._FunctionObject.getZtree();
	        	if(!treeObj){
	        		top.layui.layer.msg("分类树未初始化");
	        		return;
	        	}
	        	
	    		var _nodes = treeObj.getSelectedNodes(),
	    			_node = _nodes[0];
	        	
	        	if(!_node){
	        		top.layui.layer.msg("分类树项目没有选中");
	        		return;
	        	}
	        	
			}
	        	
			var _this = this;
			var _title = _action == "update" ? "更新" : "新增";
			top.layui.layer.open({
				id : "layer-open-car",
                type: 2,
                anim : -1,
                title: "<i class='iconfont fa fa-book'></i>&nbsp;"+_title,
                shade : 0.3,
                area: ['550px', '400px'],
                shadeClose: false,
                isOutAnim : false,
                content: "/model3d/3dmodel/page/model-transition-animate-manage/dict.add.html?action="+_action+(_id?"&id="+_id:""),
                btn: ['保存', '取消'],
                yes: function (index,layero) {
                	
                	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.add.html");
                	_iframeWindow._FunctionObject.httpSubmitPage(function(){
                		_this._xUtilLayuiTable.reload();
                		top.layui.layer.close(index);
                	});
                	
                },
                cancel: function(index, layero){
					
				}, 
				end : function(index, layero){
                	
                },
                success: function(layero, index){
				   
				}
            });
		}
		
		//打开分类页面
		_FunctionObject.OpenLayerClassEditPage = function(_action,_id){
			var _title = "分类管理";
			top.layui.layer.open({
				id : "layer-open-car",
                type: 2,
                anim : -1,
                title: "<i class='iconfont fa fa-truck'></i>&nbsp;"+_title,
                shade : 0.001,
                area: ['300px', '540px'],
                shadeClose: false,
                isOutAnim : false,
                content: "/model3dNode/3dmodel/page/model-data-manage/dict.class.add.html?action="+_action+(_id?"&id="+_id:""),
                btn: false,              
                cancel: function(index, layero){
					
				}, 
				end : function(index, layero){
                	
                },
                success: function(layero, index){
				   
				}
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = [id];
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : "/model_3d/api/modelKeyNote/deleteData",
					type : "post",
					data : _data,
					contentType : "application/json;charset=UTF-8",
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
				
			});
		}
		
		//删除多个数据
		_FunctionObject.RemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = id;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : "/model_3d/api/modelKeyNote/deleteData",
					type : "post",
					data : _data,
					contentType : "application/json;charset=UTF-8",
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			
			_this.layuiForm.render();
			_this.$layuiSearchInputBox.find("[x-btn-name='button-search']").on("click",function(){
				_this.InitTable();
			});
			
			//绑定回车键
			_this.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
				if(event.keyCode==13){
					_this.InitTable();
				}
			});
			
			layui.use('laydate', function(){
				
				_FunctionObject.layerDate = layui.laydate;
				
				//获取搜索表单对象
				var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
				
				//定义时间格式，如果是航班数据，则显示时分秒
				var _dateFormat,
					_startTime,
					_endTime;
				
				_dateFormat = "yyyy-mm-dd";
				_startTime = xUtilBase.classDate.responseDate(new Date(),_dateFormat);
				_endTime = xUtilBase.classDate.responseDate(new Date(),_dateFormat);
				
				//定义开始时间插件
				var _default = {
					elem: '#layui-date-start',
					value: _startTime,
					isInitValue: true
				};
				if(_dateFormat=="yyyy-mm-dd hh:mm:ss"){
					$.extend(true, _default, {type:'datetime'});
				}
				_FunctionObject.layuiDate.render(_default);
				
				//定义结束时间插件
				_default = {
					elem: '#layui-date-end',
					value: _endTime,
					isInitValue: true
				};
				if(_dateFormat=="yyyy-mm-dd hh:mm:ss"){
					$.extend(true, _default, {type:'datetime'});
				}
				_FunctionObject.layuiDate.render(_default);
			});
		}
		
		_FunctionObject.init = function(){
			
			var _this = this;
			
			layui.use(["form","laydate","table"], function(){
				_FunctionObject.layuiForm = layui.form;
				_FunctionObject.layuiDate = layui.laydate;
				
				var _className = "table".toUpperCase();
				var _html = template("TemplateTableSearch"+_className,{isRun : true});
				_FunctionObject.$layuiSearchInputBox.empty().html(_html);
				
				_FunctionObject.BindSearchInputEvent();
				
				_FunctionObject.layuiTable = layui.table;
				_FunctionObject.InitTable();
				
				_this.moduleModelTree.LoadModelTree();
				
			});
			
		}
		
		_FunctionObject.init();
	}
})(jQuery);


//模型树
(function($,_module){
	
	$(document).ready(documentReady);
	
	function documentReady(){
		
		//初始化模型树
		_module.LoadModelTree = function(){
			
			var _this = this;
			
			var _data = {
				
				classId : "mubiaofenlei"
				
			};
			
			_data = JSON.stringify(_data);
			
			xUtilBase.ajax({
				url : "/model_3d/model/getClassTree",
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
		            			pId : el.pId,
		            			other : el.other
		            		});
		            	});
		            	
		            	var _iframe = $("#iframe-dic-class-main");
		            	
						//单击事件
						function onClick(event, treeId, treeNode){
							
							_this.__modelTree.GetZTreeObj().checkNode(treeNode, !treeNode.checked, true);
							
							if(treeNode && (!treeNode.children || treeNode.children.length<1)){
								
								//需要清空分类树选择节点
								var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
					        	if(_iframeWindow){
					        		
					        		_iframeWindow._FunctionObject.__cacheSelectedNode = null;
									_iframeWindow._FunctionObject.getTreeList();
									
					        	}
					        	
								_iframe.attr("src","dict.class.main.html?id="+treeNode.other);
								
								setTimeout(function(){
									
									_FunctionObject.InitTable();
									
								},500);
								
								
							}else{
								
								_iframe.attr("src","about:blank");
								
							}
							
						}
		
						var setting = {
							check: {
								enable: false,
//								chkStyle: "radio",
//								radioType : "all",
//								autoCheckTrigger: true
							},
							data: {
								simpleData: {
									enable: true
								}
							},
							callback :{
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
		_module.SetTreeSelectedById = function(_ids){
			
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
		_module.GetTreeObject = function(){
			
			return this.__modelTree.GetZTreeObj();
			
		}
		
	}
	
})(jQuery,_FunctionObject.moduleModelTree = {});
