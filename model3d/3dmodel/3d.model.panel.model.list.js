/**
 * 模型左侧控制逻辑-模型列表
 */
function ClassPanelModelList(){
	
	//定义变量
	var _this = this,
	
		$panelMain = $("#x-view-model-list-panel");
		
	this.__ClassLinkObject = new Object();
	
	
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
	
	//生成模型列表树
	this.CreateTree = function(nodes){
		
		//单击事件
		function onClick(event, treeId, treeNode){
			
			var _ztreeThis = this;
			
			if(treeNode.other){
				
				var _classModelControl = _this.GetLinkClass("ClassModelControl");
				
				if(_ztreeThis.__ztreeOtherId != treeNode.other){
					
					layui.layer.confirm("确认选择其它模型吗？选择其它会清空当前模型。",function(index, layero){
						
						layui.layer.close(index);
						
						var $font = $("<font></font>");
						
						$font.html(treeNode.name);
						
						$("#x-view-model-name").html($font);
						
						//关闭编辑窗口
						var _classPanelModelChildrenEdit = _this.GetLinkClass("ClassPanelModelChildrenEdit");
						
						_classPanelModelChildrenEdit.ClosePanel();

						// var _object = {
						// 	index : 1,
						// 	identifier:1,
						// 	id: "040100300000000539",
						// 	name: "洛克希德·马丁F-22“猛禽”",
						// 	url: treeNode.url,
						// 	model: "空",
						// 	country: "美",
						// 	success : function(){
								
						// 		$("#x-view-model-name > font").html("洛克希德·马丁F-22“猛禽”");
								
						// 	}
						// };
						const _object = nodes.find(item => item.id == treeNode.id)
						Object.assign(_object, {
							identifier: _object.id,
							url: _object._url,
							model: "空",
							country: "美",
						})
						
						//获取模型数据
						_this.LoadModel({ model: _object });
						
					});
					
				}else{
					
					var $font = $("<font></font>");
						
						$font.html(treeNode.name);
					
					$("#x-view-model-name").html($font);
					
					_this.httpGetPageByIdentifier(treeNode.other,function(_data){
						
						_ztreeThis.__ztreeOtherId = treeNode.other;
						
						_this.LoadModel(_data);
						
					});
					
				}
				
			}
			
		}
		
		//初始化模型列表
		var _modelSetting = {
			check: {
				enable: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback :{
				onClick: onClick
			},
			view: {
				dblClickExpand: true
			}
		};
		
		var $modelZTree = $("#x-view-model-tree");
		
		var _modelZTreeObject = new xZTree();
		
		_modelZTreeObject.init({
			
			element : $modelZTree,
			
			setting : _modelSetting,
			
			zNodes : nodes
			
		});
		
		_this.__cacheZtree = _modelZTreeObject;
		
	}
	
	//根据ID获取数据
	this.httpGetPageByIdentifier = function(id,_func){
		
		var _this = this;
		
		var _data = {
			
			id : id
			
		};
		
		_data = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : "/model_3d/model/getByIdentifier",
			type : "post",
			data : _data,
			contentType : "application/json;charset=UTF-8",
			success : function(result){
				if(result["code"]=="0"){
					
					if(!result.data){
						
						top.layui.layer.msg("数据格式不正确");
						
						return false;
						
					}
					
			    	_this.__cacheModel = {
			    		
			    		model : result.data
			    		
			    	};
			    	
			    	if(_func){
			    		
			    		_func(_this.__cacheModel);
			    		
			    	}
					
				}else{
					
					layui.layer.msg(result["message"],{time:5000});
					
				}
				
			}
			
		});
		
	}
	
	//保存模型视角
	this.httpSaveModelView = function(_func){
		
		var _classModelControl = _this.GetLinkClass("ClassModelControl");
		
		if(!_this.__cacheModel){
			
			top.layui.layer.msg("必须先创建模型信息后才能进行保存视角");
			
			return false;
			
		}
		
		var _data = $.extend(true, {}, _this.__cacheModel);
		
		var _modelScene = {
			
			background : _classModelControl.GetSceneBackgroundString(),
		
			view : _classModelControl.GetModelView(),
			
			sceneGamma : _classSceneControl.GetSceneGamma(),
			
			//曝光
			sceneToneMappingExposure : _classSceneControl.GetToneMappingExposure(),
			
			//设置环境强度
			sceneAmbientIntensity : _classSceneControl.GetAmbientIntensity(),
			
			//设置环境颜色
			sceneAmbientColor : _classSceneControl.GetAmbientColor()
			
		};
		
		_data.model.scene = JSON.stringify(_modelScene);
		
		//定义提交地址
		var _url = "/model_3d/model/update";
		
		//使用JSON方式
		var _newData = JSON.stringify(_data);
		
		xUtilBase.ajax({
			url : _url,
			contentType : "application/json;charset=UTF-8",
			data : _newData,
			success : function(result){
				if(result["code"]=="0"){
					top.layui.layer.msg("更新成功");
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
	
	//打开面板
	this.OpenPanel = function(){
		
		$panelMain.removeClass("panel-hidden");
		
	}
	
	//关闭面板
	this.ClosePanel = function(){
		
		$panelMain.addClass("panel-hidden");
		
	}
	
	//载入模型
	this.LoadModel = function(_option){
		
//		console.info(JSON.stringify(_option));
		
		var _this = this;
		
		var _classModelControl = _this.GetLinkClass("ClassModelControl");
		
		var _classPanelModelChildrenList = _this.GetLinkClass("ClassPanelModelChildrenList");
		
		var _model = _option.model,_scene=undefined;
		
		if(_option && _option.model && _option.model.scene){
			
			var _position,
			
				_scene,
			
				_scene_background,
				
				_scene_view;
			
			try{
				
				_scene = JSON.parse(_option.model.scene);
				
				_tempScene = _scene;
				
				_scene_view =  _scene.view;
				
				try{
					_scene_view = JSON.parse(_scene_view);
				}catch(e){
					//TODO handle the exception
				}
				
			}catch(e){
				//TODO handle the exception
			}

			if(xUtilBase.typeOf(_scene_view)!="object"){
				
				return;
				
			}
			
			_position = new THREE.Vector3(_scene_view.x,_scene_view.y,_scene_view.z);
			
		}
		
		//将_scene绑定到_this，防止指针乱跳
		_this.__sceneParams = _scene;
		
		var _object = {
			index : 0,
			id: _model.identifier,
			name: _model.name,
			path: _model.url,
			type: _model.type,
			guojia: _model.country,
			position : _position,
			backGroundType: 3,
			success : function(){
				
				console.info("模型加载完毕");
				
				//关闭面板
				_this.ClosePanel();
				
				//清除子节点树
				if(_classPanelModelChildrenList.__cacheZtree){
			
					_classPanelModelChildrenList.ClosePanel();
					
					var _ztree = _classPanelModelChildrenList.__cacheZtree.GetZTreeObj();
				
					var _nodes = _ztree.getNodes();
						
					if (_nodes && _nodes.length>0) {
						
						_ztree.removeChildNodes(_nodes[0]);
						
					}
					
				}
				
				//恢复默认
				_classSceneControl.SetSceneGamma(true)
					.SetToneMappingExposure()
					.SetAmbientIntensity()
					.SetAmbientColor();
				
				
				//开始设置模型
				_classModelControl.ShowGrid(false);
				
				_classModelControl.FormatModelNodeAllList();
				
				_classModelControl.FormatModelNodeAnimateList();
				
//				console.info("模型Gamma值："+JSON.stringify(_this.__sceneParams));
				
				if(_this.__sceneParams && _this.__sceneParams.sceneGamma!=undefined){
					
					//设置gamma、曝光、环境强度、环境颜色
					_classSceneControl.SetSceneGamma(_this.__sceneParams.sceneGamma)
						.SetToneMappingExposure(_this.__sceneParams.sceneToneMappingExposure)
						.SetAmbientIntensity(_this.__sceneParams.sceneAmbientIntensity)
						.SetAmbientColor(_this.__sceneParams.sceneAmbientColor);
				
					_classModelControl.UpdateModelMaterial();
					
				}
				
				//创建及打开模型子节点tree
				_classPanelModelChildrenList.CreateTree(_classModelControl.GetModelNodeAllListZTree());
				
				_classPanelModelChildrenList.OpenPanel();
				
				//打开模型顶部菜单
				_classPanelModelChildrenMenu.OpenPanel();
				
			}
			
		};
		
		$.extend(true, _object, _option);
		
		if(_classModelControl.__modelId == _object.id){
			
			_this.ClosePanel();
			
			_classPanelModelChildrenMenu.OpenPanel();
			
			_classPanelModelChildrenList.OpenPanel();
			
			return;
			
		}
		
		//清除模型信息
		_classModelControl.ClearScenesLabel();
		
		_classModelControl.RemoveModel();
		
		
		//加载模型
		_classModelControl.LoadModel(_object);
		
	}
	
	//类初始化
	this.Init = function(){
		
		//绑定关闭按钮
		$panelMain.find(".x-panel-title .btn-close").on("click",function(){
			
			_this.ClosePanel();
			
//			var _classPanelModelChildrenList = _this.GetLinkClass("ClassPanelModelChildrenList");
//			
//			_classPanelModelChildrenList.OpenPanel();
			
		});
		
		$("#scene-gamma").on("change",function(event){
			
			var $this = $(this);
			
			_classSceneControl.SetSceneGamma($this.prop("checked"));
			
			_classModelControl.UpdateModelMaterial();
			
		});
		
	}
	
	this.Init();
	
}
