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
			
			var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/main.html");
			if(!_iframeWindow){
        		top.layui.layer.msg("未初始化模型窗口");
        		return;
        	}
			
			var _modelId = _iframeWindow._FunctionObject.moduleModelTree.GetTreeObject().getSelectedNodes();
			if(_modelId.length<1){
				top.layui.layer.msg("未选中模型");
        		return;
			}
			
			_data.modelIdentifier = _modelId[0].other;
			
			var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
			if(!_iframeWindow){
        		top.layui.layer.msg("未找到模型子节点窗口");
        		return;
        	}
			
			//_data.blogContent = _FunctionObject.blogEditor.getMarkdown();
			_data.action = _pageAction || "add";
			
			var _url = "";
			if(_data.action=="update"){
				_url = "/model_3d/api/modelKeyNoteClass/updateData";
				_data.srcId = _data.id;
			}else{
				_url = "/model_3d/api/modelKeyNoteClass/insertData";
			}
			
			_data.pId = "0";
			
//			console.info(_data);
			_temp_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : _url,
				data : _temp_data,
				contentType : "application/json;charset=UTF-8",
				success : function(result){
					if(result["code"]=="0"){
						if(_pageAction=="add"){
							top.layui.layer.msg("添加成功");
						}else{
							top.layui.layer.msg("更新成功");
						}
						
						_iframeWindow._FunctionObject.getTreeList();
						
						if(_func){
							_func();
						}
					}else{
						top.layui.layer.msg(result["message"]);
					}
				},
				error : function(a,b,c){
					top.layui.layer.msg(b);
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
			
			var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-transition-animate-manage/dict.class.main.html");
			if(!_iframeWindow){
        		top.layui.layer.msg("未找到字典分类窗口");
        		return;
        	}
			
			var treeObj = _iframeWindow._FunctionObject.getZtree();
        	if(!treeObj){
        		top.layui.layer.msg("节点树未初始化");
        		return;
        	}
        	
       		
        	var _nodes = _this.__selectedNodes = treeObj.getSelectedNodes();
        	
        	if(_pageAction=="add"){
        		
        		var _node = {
        			
        			pId : 0,
        			
        			pName : "无"
        			
        		};
	        	
	        	$fromdom.setElValue(_node);
        		
        	}else if(_pageAction=="update"){
        		
        		var _node = {
        			
        			pId : 0,
        			
        			id : _nodes[0].id,
        			
        			name : _nodes[0].name
        			
        		};
        		
        		$fromdom.setElValue(_node);
        		
        	}
        	
        	
        	
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);