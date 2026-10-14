var _FunctionObject = _FunctionObject|| {};
(function($,xUtilBase){
	$(document).ready(documentReady);
	function documentReady(){
		
		var $fromdom = $("#blog-add"),
			_btn = $fromdom.find("#submit"),
			_pageAction = xUtilBase.getUrlParam("action");
		
		$fromdom.get(0).BookSubmit = function(){
			_FunctionObject.httpSubmitPage();
		};
		
		//提交
		_FunctionObject.httpSubmitPage = function(_func){
			var _data = {};
			$.extend(true, _data, $fromdom.getElValue());
			
			//_data.blogContent = _FunctionObject.blogEditor.getMarkdown();
			_data.action = _pageAction || "add";
			
			_data.nodeName = (function(){
				
				var $input = $fromdom.find("[x-out-name='modelNodeIdentifier']");
				
				return $input.find("option:selected").text();
				
			})();
			
			var _url = "";
			if(_data.action=="update"){
				_url = "/model_3d/api/modelKeyNote/updateData";
				
			}else{
				_url = "/model_3d/api/modelKeyNote/insertData";
			}
			
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : _url,
				type : "post",
				data : _data,
				contentType : "application/json;charset=UTF-8",
				success : function(result){
					if(result["code"]=="0"){
						if(_data.action=="add"){
							top.layui.layer.msg("添加成功");
						}else{
							top.layui.layer.msg("更新成功");
						}
						$fromdom.clearElValue("x-out-name");
						if(_func){
							_func();
						}
					}else{
						layer.msg(result["message"]);
					}
				},
				error : function(a,b,c){
					layer.msg(b);
				}
			});
		}
		
		//取出服务器数据-全部节点信息
		_FunctionObject.httpGetModelNodeAll = function(_modelIdentifier,_func){
			
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
		
		_FunctionObject.init  = function(){
			var _this = this;
			var form,
				layer = layui.layer;
			
			layui.use('form', function(){
			  	_this.layuiForm = form = layui.form;
			  	form.render();
				//监听提交
				form.on('submit(formSubmit)', function(data){
					$fromdom.get(0).BookSubmit();
					return false;
				});
				
				//准备反显的数据
				var _elValue = {
					
					sortNum : 0,
					
					duringTime : 2000,
					
					stepTime : 3000
					
				};
				
				//获得模型内码
	        	var _iframeWindowModelDataMain = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/main.html");
	        	
	        	if(_iframeWindowModelDataMain){
	        		
	        		var _ztree = _iframeWindowModelDataMain._FunctionObject.moduleModelTree.GetTreeObject(),
	        		
	        			_selectedNodes = _ztree.getSelectedNodes();
	        			
	        		if(_selectedNodes && _selectedNodes.length>0){
	        			
	        			_elValue.modelIdentifier = _selectedNodes[0].other;
	        			
	        		}
	        		
	        	}
	        	
	        	//获取分类ID
	        	var _iframeWindowModelClassMain = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
	        	
	        	if(_iframeWindowModelClassMain){
	        		
	        		var _ztree = _iframeWindowModelClassMain._FunctionObject.getZtree(),
	        		
	        			_selectedNodes = _ztree.getSelectedNodes();
	        			
	        		if(_selectedNodes && _selectedNodes.length>0){
	        			
	        			_elValue.type = _selectedNodes[0].id;
	        			
	        			_elValue.typeName = _selectedNodes[0].name;
	        			
	        		}
	        		
	        	}
	        	
				//获取已经配置好的节点列表
				_this.httpGetModelNodeAll(_elValue.modelIdentifier,function(result){
					
					if(result["code"]=="0"){
						
						var _httpNodes = result.data || [],
						
							_selectNodes = [{
								key : "",
								value : "请选择"
							}];
						
						$.each(_httpNodes, function(idnex,el) {
							
							_selectNodes.push({
								key : el.identifier,
								value : el.chName
							});
							
						});
						
						$fromdom.find("[x-input-name='modelNodeIdentifier']").setSelect(_selectNodes);
						
						if(_pageAction=="update"){
							
				        	$fromdom.setElValue({
				        		
				        		page_action : "编辑"
				        		
				        	});
				        	
				        	var _xUtilLayuiTable = _iframeWindowModelDataMain._FunctionObject._xUtilLayuiTable;
				        	
				        	var _data = _iframeWindowModelDataMain._FunctionObject._focusSelectedTableTdData;
				        	
				        	if(!_data){
				        		top.layui.layer.msg("获取数据失败");
				        		return;
				        	}
				        	
				        	$.extend(true, _elValue, _data);
				        	
				        	$fromdom.setElValue(_elValue);
				        	
				        	//反显后，删除对象，防止出错
				        	_iframeWindowModelDataMain._FunctionObject._focusSelectedTableTdData = _data = undefined;
				        	
				        }else{
				        	
				        	$fromdom.setElValue({
				        		
				        		page_action : "新增"
				        		
				        	});
				        	
				        	$fromdom.setElValue(_elValue);
				        	
				        }
						
						layui.form.render();
						
					}
					
				});
				
			});
			
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);