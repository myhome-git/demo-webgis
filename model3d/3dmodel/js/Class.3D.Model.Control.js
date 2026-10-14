//模型控制Class
function ClassModelControl(){
	
	//定义变量
	var _this = this;
	
	//初始化外部Class
	this.InitLinkClass = function(__class){
		
		this.__linkClass = __class;
		
		this.__sceneIndex = this.__linkClass.SceneIndex;
		
		this.__modelId = this.__linkClass.ModelId;
		
	}
	
	//获取外部Class
	this.GetLinkClass = function(){
		
		return this.__linkClass;
		
	}
	
	//获取外部控制器对象
	this.GetLinkControl = function(){
		
		return this.__linkClass.webObject;
		
	}
	
	this.GetLinkScene = function(){
		
		return this.GetLinkControl().scenes.get(this.__sceneIndex);
		
	};
	
	//获取外部模型管理器
	this.GetLinkModelManager = function(){
		
		return this.GetLinkScene().modelManager;
		
	}
	
	//获取当前模型对象
	this.GetLinkModel = function(){
		
		return this.GetLinkModelManager().getModel(this.__modelId);
		
	}
	
	/******************模型控制部分API*******************/
	
	//检测模型是否载入
	this.IsLoadModel = function(_id){
		
		return this.GetLinkControl().isLoad(this.__sceneIndex,_id);
		
	}
	
	//加载模型
	this.LoadModel = function(){
		
		var _arguments = formatArguments(arguments),
		
			_object = _arguments["object"];
		
		this.SetModelReset();
		
		var _linkClass = this.GetLinkClass();
		
		this.__sceneIndex = _linkClass.SceneIndex = _object.index;
	
		this.__modelId = _linkClass.ModelId = _object.id;
		
		this.__modelName = _linkClass.ModelName = _object.name;
		
		this.__modelType  = _linkClass.ModelType = _object.type;
		
		this.__modelPath = _linkClass.ModelUrl = _object.path;
		
		this.__modelGuoJia = _linkClass.ModelGuoJia = _object.guojia;
		
		var _default = {};
		
		try{
			
			$.extend(true, _default, _object);
			
		}catch(e){
			//TODO handle the exception
		}
		
		if(_default.position){
			
			this.GetLinkControl().sceneDefaultOptions.camera.initPos = _default.position;

		}
		
		_linkClass.CreateModel(_default,_default.success);
		
		return this;
		
	}
	
	//重置模型控制中心点为原点
	this.ResetModelCenter = function(_vector3){
		
		if(!_vector3){
			
			_vector3 = new THREE.Vector3(0,0,0);
			
		}
		
		this.GetLinkScene().controls.target = _vector3;
		
	}
	
	//清除模型数据
	this.ClearModel = function(){
		
		this.ClearModelNodeAllList();
		
		this.ClearModelNodeAnimateList();
		
	}
	
	//移除模型
	this.RemoveModel = function(){
		
		var _this = this;
		
    	var modelManager = _this.GetLinkModelManager();
    	
    	if(modelManager.currentShowModel){
    		
    		//清除模型数据
			this.ClearModel();
    		
    		this.GetLinkControl().remove(this.__sceneIndex,modelManager.currentShowModel.id);
    		
    	}
    	
	}
	
	//获取场景类型
	this.GetSceneBackgroundType = function(){
		
		return this.GetLinkScene().sceneBackground.backGroundType;
		
	}
	
	//获取场景类型名称
	this.GetSceneBackgroundString = function(){
		
		var _type = this.GetSceneBackgroundType();
		
		var _name;
		
		switch (_type){
			case 0:
				_name = "水面";
				break;
			case 1:
				_name = "海洋";
				break;
			case 2:
				_name = "天空";
				break;
			case 3:
				_name = "云层";
				break;
			case 4:
				_name = "纯色";
				break;
			case 5:
				_name = "背景图";
				break;
			default:
				break;
		}
		
		return _name;
		
	}
	
	
	//获取模型视角
	this.GetModelView = function(){
		
		return this.GetLinkScene().camera.position;
		
	}
	
	//设置模型视角
	this.SetModelView = function(_vector3,_func){
		
		var _ret = this.GetLinkScene().camera.position.copy(_vector3);
		
		if(_func){
			
			_func();
			
		}
		
		return _ret;
		
	}
	
	//获取选中节点
	this.GetSeletedNode = function(){
		
		return this.GetLinkControl().getModelNode();
		
	}
	
	//设置模型锁定，锁定了单击事件，但是无法锁定定位和高亮引起的节点变动
	this.SetModelLock = function(_boolean){
		
		//_webObject.lockBaseScene() /_webObject.unLockBaseScene（）
		var _mothodName = _boolean ? "lockBaseScene" : "unLockBaseScene";
		
		this.GetLinkControl()[_mothodName]();
		
	}
	
	//显示模型网格
	this.ShowGrid = function(_boolean){
		
		if(_boolean==true){
			
			this.ShowGrid(false);
			
			this.GetLinkControl().showGrid(this.__sceneIndex,this.__modelId,true);
			
		}else{
			
			this.GetLinkControl().showGrid(this.__sceneIndex,this.__modelId,false);
			
		}
		
		return this;
		
	}

	
	
	
	//取出node列表
	this.GetModelNodeAllList = function(){
		
		return this.__modelNodeList || [];
		
	}
	
	//取出node列表-ztree格式
	this.GetModelNodeAllListZTree = function(){
		
		return this.__modelNodeListZTree || [];
		
	}
	
	//清除node列表
	this.ClearModelNodeAllList = function(){
		
		this.__modelNodeListIndex = [];
		
		this.__modelNodeList = [];
		
		this.__modelNodeListZTree = [];
		
		return this;
		
	}
	
	//重置模型
	this.SetModelReset = function(){
		
		this.SetModelLock(false);
		
		this.ShowGrid(false);
		
	}
	
	//判断模型是否有动画
	this.GetIsModelNodeAnimate = function(){
		
		return this.__isModelNodeAnimate || false;
		
	}
	
	//解析模型所有动画
	this.FormatModelNodeAnimateList = function(){
		
		//清除上次数据
		this.ClearModelNodeAnimateList();
		
		var _this = this;
		
		//获取屏幕对象
		var _scene = this.GetLinkScene();
		
	    if(_scene && _scene.animationCtrlMap.has(this.__modelId)){
	    	
	        var animationCtrl=_scene.animationCtrlMap.get(this.__modelId);
	        
	        var _map = animationCtrl.nodeActions;
	        
	        //判断节点是否解析
	        if(!_this.__modelNodeListIndex){
	        	
	        	_this.FormatModelNodeAllList();
	        	
	        }
	        
	        //开始加入动画
	        _map.forEach(function(key,value){
	        	
	        	var _index = _this.__modelNodeListIndex.indexOf(value.id);
	        	
	        	var _node = _this.__modelNodeList[_index];
	        	
	        	_node.__animate = _node.__animate || [];
	        	
	        	//新建对象，并且进行id绑定
	        	var _newObject = new Object();
	        	
	        	_newObject.__id = _node.id;
	        	
	        	_newObject.__name = _node.name;
	        	
	        	for(var i in key){
	        		
	        		_newObject[i] = key[i];
	        		
	        	}
	        	
	        	//对节点进行数据绑定，方便后期调用
	        	_node.__animate.push(_newObject);
	        	
	        	_this.__modelNodeAnimateList.push(_newObject);
	        	
	        })
	    }
	    
	    if(this.GetModelNodeAnimateList().length>0){
	    	
	    	this.__isModelNodeAnimate = true;
	    	
	    }else{
	    	
	    	this.__isModelNodeAnimate = false;
	    	
	    }
	    
	    return _this.GetModelNodeAnimateList();
	    
	}
	
	//取出所有动画列表
	this.GetModelNodeAnimateList = function(){
		
		return this.__modelNodeAnimateList;
		
	}
	
	//根据id取出动画
	this.GetModelNodeAnimateById = function(_id){
		
		var _index = this.__modelNodeListIndex.indexOf(_id);
		
		if(_index<0){
			
			return;
			
		}
		
		return this.__modelNodeList[_index].__animate;
		
	}
	
	//清除动画列表
	this.ClearModelNodeAnimateList = function(){
		
		this.__modelNodeAnimateListIndex = [];
		
		this.__modelNodeAnimateList = [];
		
		return this;
		
	}
	
	//根据id获取节点
	this.GetModelNodeById = function(_id){
		
		return	this.GetLinkModel().getObjectByProperty("id",_id);
    
	}
	
	//根据name获取节点
	this.GetModelNodeByName = function(_name){
		
		return	this.GetLinkModel().getObjectByProperty("name",_name);
    
	}
	
	//节点定位，包含视角切换
	this.SetModelNodePosition = function(){
		
		var _arguments = formatArguments(arguments),
		
			_node = _arguments["object"],
			
			_option = _arguments["object0"],
			
			_function = _arguments["function"],
			
			//是否高亮
			_boolean = _arguments["boolean"],
			
			_time = _arguments["number0"] || 2000;
		
		//如果是字符串需要转换成对象
		var _threeVector3;
		
		if(_option){
			
			var _nodeView = _option.view;
			
	    	try{
	    		_nodeView = JSON.parse(_nodeView);
	    		
	    		if(_nodeView.cameraPosition){
	    			
	    			_threeVector3 = new THREE.Vector3(_nodeView.cameraPosition.x,_nodeView.cameraPosition.y,_nodeView.cameraPosition.z);
	    			
	    		}
	    		
	    	}catch(e){
	    		_nodeView = null;
	    		//TODO handle the exception
	    	}
		}
		
    	this.GetLinkControl().locateNode(this.__sceneIndex,this.__modelId,_time,_node.name, _boolean,_function,_threeVector3);
    	
    	return this;
    	
	}
	
	//设置节点高亮，其它部位互斥透明，点击右键恢复可点击状态
	this.SetModelNodeHighlight = function(){
		
		var _arguments = formatArguments(arguments),
		
			_array = _arguments["array"],
			
			//高亮和取消高亮
			_boolean = _arguments["boolean"];
			
		if(_boolean==undefined || _boolean==null){
			
			_boolean = true;
			
		}
		
		this.GetLinkControl().highlight(this.__sceneIndex,this.__modelId,_array,_boolean);
		
		return this;
		
	}
	
	//清除所有高亮
	this.ClearModelNodeAllHighlight = function(){

		this.GetLinkScene().modelManager.clearHighlight();
		
	}
	
	//设置节点显示或隐藏
	this.SetModelNodeShow = function(){
		
		var _arguments = formatArguments(arguments),
		
			_id = _arguments["number"],
			
			_boolean = _arguments["boolean"];
		
		var _node = this.GetModelNodeById(_id);
		
		if(_node){
			
			if(_boolean!=true){
				
				_boolean = false;
				
			}
			
			_node.visible = _boolean;
			
			var _list = this.GetModelNodeHiddenList();
			
			if(!_boolean){
				
				if(_list.indexOf(_id)<0){
					
					this.__modelNodeHiddenList.push(_id);
					
				}
				
			}else{
				
				this.__modelNodeHiddenList.splice(_list.indexOf(_id),1);
				
			}
			
		}
		
		return this;
		
	}
	
	//取出隐藏node列表
	this.GetModelNodeHiddenList = function(){
		
		if(!this.__modelNodeHiddenList){
			
			this.__modelNodeHiddenList = [];
			
		}
		
		return this.__modelNodeHiddenList;
		
	}
	
	//设置透明度
	this.SetModelNodeAlphaColor = function(){
		
		var _arguments = formatArguments(arguments),
		
			_nodeName = _arguments["string"],
			
			_color = _arguments["string0"];
			
			_transparent = _arguments["number"],
			
			_boolean = _arguments["boolean"];
		
		var _node = this.GetModelNodeByName(_nodeName);
		
		if(_node){
			
			this.GetLinkModelManager().setObjectAlphaColor(this.__modelId,_transparent||0.3,_color!=undefined ? new THREE.Color(_color) : undefined,undefined,[],[_node]);
			
		}
		
	}
	
	//清除所有透明
	this.ClearModelNodesAlphaColor = function(){
		
		this.GetLinkModelManager().restoreObjectAlphaColor(this.__modelId);
		
//		this.GetLinkModelManager().setObjectAlphaColor(this.__modelId,1,undefined,undefined,[],[]);
			
	}
	
	//更新模型材质
	this.UpdateModelMaterial = function(){
		
		var _array = this.GetModelNodeAllList();
		
		var _node;
		
		$.each(_array, function(index,el) {
			
			_node = _this.GetModelNodeByName(el.name);
			
			if(_node && _node.isMesh && _node.material){
				
				if(xUtilBase.typeOf(_node.material)=="array"){
					
					$.each(_node.material, function(index,el) {
						
						el.needsUpdate = true;
						
					});
					
				}else{
					
					console.info("material is not array");
					
					_node.material.needsUpdate = true;
					
				}
				
			}
			
		});
		
	}
	
	
	//节点标牌,如果想要保留其它标牌，传入参数为false
	this.SetModelNodeLabel = function(){
		
		var _arguments = formatArguments(arguments),
		
			_nodeName = _arguments["string"],
			
			_doc = _arguments["htmldivelement"] || _arguments["htmlfontelement"] || _arguments["string0"],
			
			_boolean = _arguments["boolean"];
			
		if(_boolean==undefined){
			
			_boolean = true;
			
		}
			
		this.GetLinkControl().showLabel(this.__sceneIndex,this.__modelId,_nodeName,true,_doc || _nodeName,undefined,50,_boolean);
		
		return this;
		
	}
	
	//清除标牌
	this.ClearModelNodeLabel = function(){
		
		var _arguments = formatArguments(arguments),
		
			_nodeName = _arguments["string"],
			
			_boolean = _arguments["boolean"];
		
		this.GetLinkScene().labelManager.collection.forEach(function(label){
			
			if(label.labelId && label.labelId==_nodeName){
				
				label.show(false);
				
			}
			
		});
			
	}
	
	//清除所有label，废弃
	this.ClearModelNodeAllLabel = function(){
		
		this.GetLinkScene().labelManager.clearAllLabel();
		
	}
	
	//节点标牌
	this.SetModelNodeLabels = function(){
		
		var _arguments = formatArguments(arguments),
		
			_nodeNameArray = _arguments["array"],
			
			_docArray = _arguments["array0"],
			
			_boolean = _arguments["boolean"];
			
		if(_boolean==undefined){
			
			_boolean = true;
			
		}
		
		this.GetLinkControl().showLabel(this.__sceneIndex,this.__modelId,_nodeNameArray,true,_docArray,undefined,50,_boolean);
		
		return this;
		
	}
	
	//清除屏幕label，不建议使用
	this.ClearScenesLabel = function(){
		
		this.GetLinkControl().hideAllLabel(this.__sceneIndex);
		
	}
	
	//设置节点动画播放和停止
	this.PlayModelAction = function(){
		
		var _arguments = formatArguments(arguments),
		
			_node = _arguments["object"],
			
			_boolean = _arguments["boolean"];
			
//		dhmc: "A_AIM_120空空导弹_01", dhnm: "01", dhksz: "198", dhjsz: "295"
		
		var _o = {
			
			actionName : "Take 001",
			
			actionStartTime : parseInt(0),
			
			actionEndTime : parseInt(9999)
			
		};
		
		
		this.GetLinkControl().playAction(this.__sceneIndex,
			
			this.__modelId,
			
			_o.actionName,_o.actionStartTime,_o.actionEndTime,_boolean,1);
		
		return this;
		
	}
	
	//设置节点动画播放和停止
	this.PlayModelNodeAction = function(){
		
		var _arguments = formatArguments(arguments),
		
			_node = _arguments["object"],
			
			_loop = _arguments["number"] || 1,
			
			//开始播放时间
			_palyStartTime = _arguments["number0"],
			
			//播放毫秒数
			_palyTime = _arguments["number1"],
			
			_boolean = _arguments["boolean"];
		
		var _this = this;
		
		var _animateArray = _this.GetModelNodeAnimateById(_node.id);
		
		if(!_animateArray){
			
			console.warn(_node.name+"未找到动画属性");
			
			return;
			
		}
		
		var _animate = _animateArray[0];
		
		_animate.paused = false;
		
//		dhmc: "A_AIM_120空空导弹_01", dhnm: "01", dhksz: "198", dhjsz: "295"
		
		var _modelNode = this.GetModelNodeById(_node.id);
		
		this.GetLinkControl().playNodeAction(this.__sceneIndex,
			
			this.__modelId,
			
			_modelNode,_animate.startTime || 0, _animate.endTime || _animate.actionTime,_boolean,_loop);
			
		if(_palyTime){
			
			_animate.__runTime = 0;
			
			//设定时间来控制动画的停止
			function _controlTime(){
				
				_animate.__runTime = _animate.__runTime + 100;
				
				if(_animate.__runTime >= _palyTime){
					
					_animate.action.paused = true;
					
					return false;
					
				}
				
				setTimeout(function(){
					
					_controlTime();
					
				},100);
				
			}
			
			_controlTime();
			
		}
		
		return this;
		
	}
	
	//设置旋转
	this.SetModelRotation = function(){
		
		var _arguments = formatArguments(arguments),
		
			_boolean = _arguments["boolean"];
			
		var $doc = $("#control-panel"),
		
			$input = $doc.find("li[name='rotation'] input[type='checkbox']"),
			
			_inputHTML = $input.prop("outerHTML").toLowerCase();
		
		if(/checked/.test(_inputHTML) && !_boolean){
			
			$input.removeAttr("checked");
			
			$input.trigger("click");
			
		}else if(!(/checked/.test(_inputHTML)) && _boolean){
			
			$input.trigger("click");
			
		}
		
		return this;
		
	}
	
	//控制巡游
	this.SetModelControlCameraRotateSwitch = function(_boolean){
		
		var _class = this.GetLinkClass();
		
		_class.SetModelControlCameraRotateSwitch(_boolean);
		
		_class.ShowElementLabels(_class.__SystemListArray);
		
	}
	
	//格式化模型节点列表
	this.FormatModelNodeAllList = function(){
		
		//清除上次数据
		this.ClearModelNodeAllList();
		
		var _this = this;
		
		var modelArray = _this.GetLinkModel();
		
		if(!modelArray){
			
			return _this;
			
		}
		
		//解析属性，双下划线表示不是原属性，而是自定义属性
		_this.__modelNodeAttribute = ["id","name","type","position","scale","__animate","uuid"];
		
		//默认使用第一个属性作为标识
		var _idName = _this.__modelNodeAttribute[0];
		
		//递归向上取出所有node
		function gettempTop(modelArray){
			
			if(!modelArray.parent){
				
				return;
				
			}
			
			if(_this.__modelNodeListIndex.indexOf(modelArray[_idName])<0){
				
				_this.__modelNodeListIndex.push(modelArray[_idName]);
				
				//生成新节点对象
				var _newObject = new Object();
				
				$.each(_this.__modelNodeAttribute, function(index,el) {
					
					_newObject[el] = modelArray[el];
					
				});
				
				_this.__modelNodeList.push(_newObject);
						
				_this.__modelNodeListZTree.push({
		
					id : _newObject[_idName],
					
					name : (function(){
						
						return "["+modelArray.type+"] " + _newObject.name;
						
					})(),
					
					pId : modelArray.parent ? modelArray.parent[_idName] : 0,
					
					checked : true,
					
					__modelNodeName : _newObject.name,
					
					__cacheThree : {
								
						name : _newObject.name,
						
						type : _newObject.type,
						
						uuid : _newObject.uuid
						
					}
					
				});
				
			}else{
				
				console.warn("发现重复唯一标识符"+_idName+"["+modelArray[_idName]+"]，请检查模型");
				
			}
			
			if(modelArray.parent){
				
				gettempTop(modelArray.parent);
				
			}
			
		}
		
		gettempTop(modelArray);

		//递归向下取出所有node
		function gettemp(modelArray){
			
			if(modelArray.children && xUtilBase.typeOf(modelArray.children)=="array"){
				
				$.each(modelArray.children, function(x,children) {
					
					if(_this.__modelNodeListIndex.indexOf(children[_idName])<0){
						
						_this.__modelNodeListIndex.push(children[_idName]);
						
						//生成新节点对象
						var _newObject = new Object();
						
						$.each(_this.__modelNodeAttribute, function(index,el) {
							
							_newObject[el] = children[el];
							
						});
						
						_this.__modelNodeList.push(_newObject);
						
						_this.__modelNodeListZTree.push({
				
							id : _newObject[_idName],
							
							name : (function(){
								
//								if(!/^Object3D/.test(modelArray.type)){
//									
//									
//									
//								}
								
								return "["+modelArray.type+"] " + _newObject.name;
								
								return _newObject.name;
								
							})(),
							
							pId : children.parent[_idName],
							
							checked : true,
							
							__modelNodeName : _newObject.name,
							
							__cacheThree : {
								
								name : _newObject.name,
								
								type : _newObject.type,
								
								uuid : _newObject.uuid
								
							}
							
						});
						
					}else{
						
						console.warn("找到重复节点",children);
						
					}
					
					gettemp(children);
					
				});
			}
			
		}
		
		gettemp(modelArray);
		
		return _this.GetModelNodeAllList();
		
	}
	
	//临时调试
	this.TempRun = function(){
		
		return this;
		
	}
	
	//class默认初始化
	this.Init = function(){
		//_sceneIndex
	}
	
	this.Init();
	
}
