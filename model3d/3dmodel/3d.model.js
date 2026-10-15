/***************************************测试代码*******************************************************/

var _XModelArray = [],
	_classSceneControl = new ClassSceneControl(),
	_classModelControl = new ClassModelControl(),
	_classPanelModelList = new ClassPanelModelList(),
	_classPanelModelChildrenList = new ClassPanelModelChildrenList(),
	_classPanelModelChildrenMenu = new ClassPanelModelChildrenMenu(),
	_classPanelModelChildrenEdit = new ClassPanelModelChildrenEdit(),
	_classPanelModelParamSetting = new ClassPanelModelParamSetting(),
	_ModelTest;

window.UserIsLogin();

!(function($,x){
	
	
	$.ajaxSetup({cache:false});

	$(document).ajaxComplete(onComplete);
	
	
	$panelRequestAction = $("#x-view-model-action-name");
	
	function onComplete(event,xhr,settings) {
		var _result;
		try{
			_result = JSON.parse(xhr.responseText);		
		}catch(e){}
		
		if(xhr.status==200 && xhr.readyState==4){
			
			if(!_result){
				
				$panelRequestAction.html("<font>服务器返回格式非JSON</font>");
				
			}else if(_result["code"]!=0){
				
				$panelRequestAction.html("<font>"+(_result["msg"] || _result["message"] || "message为null")+"</font>");
	
			}else{
				
				$panelRequestAction.html("<font>服务器返回数据成功...</font>");
				
				setTimeout(function(){
					
					$panelRequestAction.empty();
					
				},500);
				
			}
		}else{
			
			$panelRequestAction.html("<font>请求失败，返回代码"+xhr.status+"</font>");
			
		}

	}
	
	xUtilBase.ajax = function(params){
		var _default = {
			dataType : "json",
			type : "POST",
			cache:false,
			error : function(xhr,type,text){
				layer.msg(""+text,{time:5000});
			},
			beforeSend : function(xhr,event){
				//ajax发送之前，不可修改event数据
				//console.info("beforeSend生效",xhr,event);
				$panelRequestAction.html("<font>正在请求数据...</font>");
			}
		};
		_default = $.extend(true, _default, params);
		$.ajax(_default);
	}
})(jQuery,xUtilBase);

(function($){
	
	$(document).ready(documentReady);
	
	function documentReady(){
		
		//创建模型控制对象
		_XModelClass0 = new _XModelClass();
		
		_XModelClass0.webObject = _webObject;
		
		_XModelClass0.SceneIndex = 0;
		
		_XModelArray.push(_XModelClass0);
		
		
		//初始化scene
		_classSceneControl.InitLinkClass(_XModelClass0);
		
		_classSceneControl.CreateScene(0,"#model-main");
		
		_classSceneControl.AddEventListener("click",function(baseScene,root,selObj){
			
			//选中的物体
			var _node=selObj.object;
			
			//判断是否选中，如果是空白，则取消上次锁定，可以进行选择，如果不是空白，则屏蔽点击
			if(!_node){
				
				_classModelControl.ClearScenesLabel();
				
				_classModelControl.ClearModelNodeAllHighlight();
				
//				_classModelControl.ClearModelNodeAllTransparent();
				
				_classPanelModelChildrenEdit.ClosePanel();
				
				return;
			}
			
			var  _treeNode = _classPanelModelChildrenList.__cacheZtree.GetZTreeObj().getNodeByParam("__modelNodeName",_node.name);
			
			if(_treeNode){
				
				var _cacheNode = _treeNode.__cacheNode;
				
				if(_cacheNode){
					
					var _option = {
						
						view : _cacheNode.view
						
					};
					
					_classModelControl.SetModelNodePosition(_node,_option);
					
					_classModelControl.SetModelNodeLabel(_node.name,_cacheNode.chName ||_node.name );
					
				}else{
					
					_classModelControl.SetModelNodeLabel(_node.name);
					
				}
				
			}
			
		});
		
		//初始化模型控制器
		_classModelControl.InitLinkClass(_XModelClass0);
		
		//初始化所需dom操作class
			
			//模型列表绑定外部class
			_classPanelModelList.InitLinkClass("ClassPanelModelChildrenList",_classPanelModelChildrenList);
			_classPanelModelList.InitLinkClass("ClassModelControl",_classModelControl);
			_classPanelModelList.InitLinkClass("ClassPanelModelChildrenEdit",_classPanelModelChildrenEdit);
			
			//模型子节点绑定外部class
			_classPanelModelChildrenList.InitLinkClass("ClassPanelModelList",_classPanelModelList);
			_classPanelModelChildrenList.InitLinkClass("ClassModelControl",_classModelControl);
			_classPanelModelChildrenList.InitLinkClass("ClassPanelModelChildrenEdit",_classPanelModelChildrenEdit);
			_classPanelModelChildrenList.Init();
			
			//菜单控制
			_classPanelModelChildrenMenu.InitLinkClass("ClassPanelModelList",_classPanelModelList);
			_classPanelModelChildrenMenu.InitLinkClass("ClassPanelModelChildrenList",_classPanelModelChildrenList);
			_classPanelModelChildrenMenu.InitLinkClass("ClassPanelModelChildrenEdit",_classPanelModelChildrenEdit);
			_classPanelModelChildrenMenu.InitLinkClass("ClassModelControl",_classModelControl);
			_classPanelModelChildrenMenu.InitLinkClass("ClassPanelModelParamSetting",_classPanelModelParamSetting);
			_classPanelModelChildrenMenu.Init();
			
			//节点编辑
			_classPanelModelChildrenEdit.InitLinkClass("ClassModelControl",_classModelControl);
			_classPanelModelChildrenEdit.InitLinkClass("ClassPanelModelChildrenList",_classPanelModelChildrenList);
			_classPanelModelChildrenEdit.InitLinkClass("ClassPanelModelChildrenMenu",_classPanelModelChildrenMenu);
			
			
		
		//测试菜单
		var $testDoc = $("#model-test");
		
		var $buttonLoadModel = $testDoc.find("#loadModel");
		
		$testDoc.find("[x-button-name]").on("click",function(){
			
			var $this = $(this),
			
				_val = $this.attr("x-button-name");
				
			_ModelTest[_val]();
			
		});
		
		//模型旋转
		
		var $buttonModelRotation = $testDoc.find("#model-rotation");
		
		$buttonModelRotation.on("click",function(){
			var $this = $(this),
				_keyName = "model-rotation-state",
				_val = $this.attr(_keyName);
			if(_val!="true"){
				_classModelControl.SetModelControlCameraRotateSwitch(true);
				$this.attr(_keyName,"true");
			}else{
				_classModelControl.SetModelControlCameraRotateSwitch(false);
				$this.removeAttr(_keyName);
			}
		});
		
		
		//========================测试function======================================
		_ModelTest = new Object();
		
		//载入模型
		_ModelTest.loadModel = function(_option){
			
			var _this = this;
			
			var _object = {
				index : 0,
				id: "040100300000000539",
				name: "洛克希德·马丁F-22“猛禽”",
				path: "/model3d/data/model/Air.glb",
				type: "空",
				guojia: "美",
				success : function(){
					
					$("#x-view-model-name > font").html("洛克希德·马丁F-22“猛禽”");
					
				}
			};
			
//			var _object = {
//				index : 0,
//				id: "040100300000002335",
//				name: "拉森（DDG82）",
//				path: "/model3d/data/model/aliboke/alibok.glb",
//				type: "海",
//				guojia: "美",
//				success : function(){
//					
//					$("#x-view-model-name > font").html("洛克希德·马丁F-22“猛禽”");
//					
//				}
//			};
			
			if(_classModelControl.__modelId == _object.id){
				
				return;
				
			}
			
			$.extend(true, _object, _option);
			
			_classModelControl.RemoveModel();
			
			_classModelControl.LoadModel(_object);
			
		}
		
		//解析模型子节点
		_ModelTest.resolveModelNodeAllList = function(){
			
			_classModelControl.FormatModelNodeAllList();
		
		}
		
		//解析模型动画
		_ModelTest.resolveModelNodeAnimateList = function(){
			
			_classModelControl.FormatModelNodeAnimateList();
		
		}
		
		//显示节点
		_ModelTest.childrenNodeShow = function(){
			
			console.info(this);
			
			var _node = _classModelControl.GetSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeShow(_id,true);
				
			}
		
		}
		
		//隐藏节点
		_ModelTest.childrenNodeHidden = function(){
			
			var _node = _classModelControl.GetSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeShow(_id,false);
				
			}
		
		}
		
		
		//节点透明度调整
		_ModelTest.childrenNodeAlphaColor = function(){
			
			var _node = _classModelControl.GetSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeAlphaColor(_id,0.3);
				
			}
		
		}
		
		//节点透明度调整-没有透明度
		_ModelTest.childrenNodeAlphaColorNo = function(){
			
			var _node = _classModelControl.GetSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeAlphaColor(_id,1);
				
			}
		
		}
		
		
		//生成模型树
		_ModelTest.CreateModelTree = function(){
			
			var _this = this;
			
			var _data = {
				
				classId : "mubiaofenlei",
				
				page: 1,
				
				rows: 1000
				
			};
			
			_data = JSON.stringify(_data);
			
			xUtilBase.ajax({
				url : "/model3d/data/model/getClassTree",
				type : "get",
				data : _data,
				contentType : "application/json;charset=UTF-8",
				success : function(result){
					console.info(result);
					var nodes = [];
					
					$.each(result, function(index,el) {
						nodes.push({
							id : el.id,
							name : el.name,
							pId : el.pId,
							other : el.other
						});
					});
					
					
					_classPanelModelList.CreateTree(nodes);
					// if(result["code"]=="0"){
					// 	if(!result.data){
					// 		return false;
					// 	}
						
			        	
						
					// }else{
					// 	top.layui.layer.msg("获取模型树失败");
					// }
				}
			});
			
		}
		
		//取模型树盒子宽度
		_ModelTest.ShowPanelModelLeftMenu = function(_boolen){
			
			if(_boolen){
				
				$("#x-view-layer-control").show();
				
			}else{
				
				$("#x-view-layer-control").hide();
			}
			
		}
		
		_ModelTest.Init = function(){
			
			var _this = this;
			
			$.ajax({
				url : "3d.model.template.html",
				async: false,
				success : function(html){
					
					$("body").append(html);
				
					//加载模板
					var _html = template("TemplatePanelModelChildrenEdit",{});
					document.getElementById("x-view-model-children-edit-panel").innerHTML = _html;
					
					//模型子节点初始化
					_classPanelModelChildrenEdit.Init();
					
					layui.use(['element',"layer",'form'], function(){
						
						var element = layui.element; //导航的hover效果、二级菜单等功能，需要依赖element模块
						  
						  //监听导航点击
						element.on('nav(demo)', function(elem){
							
							//console.log(elem)
							layer.msg(elem.text());
							
						});
						  
						layui.form.render();
					  	
						layui.form.on('switch(model-children-view-switch)', function(data){
							
							_classPanelModelChildrenList.__isMousehover = data.elem.checked;
							
						}); 
						
						_this.CreateModelTree();
						
					});
					
				}
			});
			
			//绑定按钮打开面板
			$("#x-view-model-name").on("click",function(){
				
				_classPanelModelChildrenMenu.ClosePanel();
				
				_classPanelModelChildrenList.ClosePanel();
				
				_classPanelModelList.OpenPanel();
				
			});
			
		}
		
		_ModelTest.Init();
		
	}
	
})(jQuery);
