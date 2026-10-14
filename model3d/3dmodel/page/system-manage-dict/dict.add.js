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
			
			var _url = "";
			if(_data.action=="update"){
				_url = "/model_3d/api/model3dDict/updateData";
				
			}else{
				_url = "/model_3d/api/model3dDict/insertData";
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
			});
			
			if(_pageAction=="update"){
	        	$fromdom.setElValue({
	        		page_action : "编辑"
	        	});
	        	
	        	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/system-manage-dict/dict.main.html");
	        	if(!_iframeWindow){
	        		top.layui.layer.msg("未初始化表格数据");
	        		return;
	        	}
	        	
	        	_FunctionObject._focusSelectedTableTdData = _iframeWindow._FunctionObject._focusSelectedTableTdData;
	        	var _data = _iframeWindow._FunctionObject._focusSelectedTableTdData;
	        	
	        	if(!_data){
	        		top.layui.layer.msg("获取数据失败");
	        		return;
	        	}
	        	
	        	$fromdom.setElValue(_data);
	        	
	        	//反显后，删除对象，防止出错
	        	_iframeWindow._FunctionObject._focusSelectedTableTdData = _data = undefined;
	        }else{
	        	
	        	$fromdom.setElValue({
	        		page_action : "新增"
	        	});
	        	
	        	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/system-manage-dict/dict.class.main.html");
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
	        	
	        	$fromdom.setElValue({
	        		type : _node.id,
	        		key : _node.id+"__"
	        	});
	        	
	        }
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);