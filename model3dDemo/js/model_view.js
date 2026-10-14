//var currentSelectedNode=undefined //存储选中的node节点
//调用接口
var _webObject = {
    //场景map
    scenes:new Map(),
	rendererManager :new rendererManager(),
    loadManager : new THREE.LoadingManager(),
    //初始化进度条框
    processes : undefined,
    //加载模型回调
    loadCallback:{
        onProgress:function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                _webObject.processes.update(Math.round(percentComplete, 2) + "%", percentComplete>99?"正在解析模型，请稍等...":"正在下载模型...");
            }
        },        
        onFinish : function (obj) {
            _webObject.processes.update("100%", "下载完成");
            setTimeout(function () {
                _webObject.processes.setVisible(false);
            }, 500);
			//处理外部回调
			var listener=_webObject.listener.get(obj.baseScene._id);
			if(listener){
				var cb=listener.get("addModel");
				if(cb)cb(obj);
			}			
        },        
        onError : function (xhr) {
            _webObject.processes.update("出错", "下载模型失败,请检查网络！");
            setTimeout(function () {
                _webObject.processes.setVisible(false);
            }, 3000);
        }
	},
	mouseState:{
		position:{x:0,y:0},
		lastPosition:{x:0,y:0},
		bClick:true
	},
    //事件回调
	listener:new Map(),
	//主刷新animate控制
	mainAnimate_startOrstop:true,

	isDebug:VIEW_MODE==='_RELEASE'?true:false,
	currentSelectedNode:undefined, //存储选中的node节点
	lockScene:false //true 表示不锁定场景

};

_webObject.sceneDefaultOptions = {
	// size: {
    //     left:0,
    //     top:0,
	// 	width: 1920,
	// 	height: 1024
    // }, //need
	background: {
		SceneBackgroundModel: SceneBackgroundModel.PICTURE,
		param: 'skybox',
	},
	lights: {
		ambient: {
			color: 0xffffff,
			intensity: 0.5
		},
		direction:{
			color:0xffffff,
			intensity:3.0, // TODO(#116),
			position:new THREE.Vector3(50, 50, -25),
			castShadow:true,
		},

		exposure: 1.5,
        textureEncoding: 'sRGB',

		// spot:{
		// 	color:0xFF7F00,
		// 	intensity:5,
		// 	position:new THREE.Vector3(50, 50, -25),  //This is set equal to Object3D.DefaultUp (0, 1, 0), so that the light shines from the top down.
		// 	distance:100,			//If non-zero, light will attenuate linearly from maximum intensity at the light's position down to zero at this distance from the light. Default is 0.0.
		// 	angle:0.3,		//Maximum extent of the spotlight, in radians, from its direction. Should be no more than Math.PI/2. The default is Math.PI/3.
		// 	penumbra:0.2,     //Percent of the spotlight cone that is attenuated due to penumbra. Takes values between zero and 1. The default is 0.0.                 
		// 	decay:1,		//The amount the light dims along the distance of the light.In physically correct mode, decay = 2 leads to physically realistic light falloff. The default is 1.
		// 	castShadow:true
		// }
	},
	camera: { //option
		fov: 75,
		aspect: 1920 / 768,
		near: 0.1,
		far: 10000,
		initPos: new THREE.Vector3(0, 0, 0)
	},
	controls: {
		mode: 1,
		//针对flycontrols
		moveSpeed: 50,
		maxMoveSpeed: 100,
		rollSpeed: 0.1,
		dragToLook: true, //
		autoForward: false,
		//other
		rotateSpeed: 1,
		zoomSpeed: 1.2,
		panSpeed: 0.8,
		noZoom: false,
		noPan: false,
		staticMoving: true,
		dynamicDampingFactor: 0.3
    },
    loadManager:this.loadManager
};

function mainAnimate() {
	if(_webObject.mainAnimate_startOrstop===false)return;
	_webObject.rendererManager.render();
	requestAnimationFrame(mainAnimate);
	if(_webObject._stats){
		_webObject._stats.update();
	}	
}



//数据管理器
// _webObject.loadManager.onProgress = function (item, loaded, total) {
//     // console.log( item, loaded, total );
//     var percent = Math.round(loaded / total * 100, 2);
//     if (percent == 100 && total != 1) {
//         percent = 99;
//         // processes.setVisible(false);
//     }
//     processes.update(percent + "%", "正在加载模型...");
// };

_webObject.render = function (startOrstop) {
	this.mainAnimate_startOrstop=startOrstop;
	if(startOrstop===true)
		mainAnimate();
};


_webObject.loadManager.onError = function (item, loaded, total) {
    _webObject.processes.update("出错", "请联系管理员！");
    setTimeout(function () {
        _webObject.processes.setVisible(false);
    }, 3000);
};
function docMouse2containerMouse(pos) {
	pos.x -= _webObject.container.offsetLeft;
	pos.y -= _webObject.container.offsetTop;
}
_webObject.onWindowResize = function () {
	_webObject.rendererManager.onWindowResize();
};
_webObject.onClick=function(event) {
	if(!_webObject.mouseState.bClick)return false;
	var pos=new THREE.Vector2(event.offsetX,event.offsetY);
	if(event.target===_webObject.rendererManager.renderObj._renderer.domElement){
		!_webObject.lockScene&&_webObject.rendererManager.onLeftClick(pos);
	}else{
		var dom=event.target;
		if(dom.className==="css2drenderDom"){
			pos.x+=dom.offsetLeft;
			pos.y+=dom.offsetTop;
			
			!_webObject.lockScene&&_webObject.rendererManager.onLeftClick(pos);//锁定选择的模型
			
		}
	}
	
}
_webObject.mouseDown=function(event) {

	event.preventDefault();
	// var pos=new THREE.Vector2(event.clientX,event.clientY);
	var pos = new THREE.Vector2(event.offsetX, event.offsetY);
	_webObject.mouseState.lastPosition.x=pos.x;
	_webObject.mouseState.lastPosition.y=pos.y;
	_webObject.mouseState.bClick=true;
}
_webObject.mouseUp=function(event) {

	event.preventDefault();
	// var pos=new THREE.Vector2(event.clientX,event.clientY);
	var pos = new THREE.Vector2(event.offsetX, event.offsetY);
	_webObject.mouseState.position.x=pos.x;
	_webObject.mouseState.position.y=pos.y;
	var lastPos=_webObject.mouseState.lastPosition;
	if(Math.abs(pos.x-lastPos.x)>5||Math.abs(pos.y-lastPos.y)>5)
	{
		_webObject.mouseState.bClick=false;
	}
}
_webObject._createRender=function(containerDom){
	
    //0、渲染
	var renderParams = {
		width: containerDom.offsetWidth,
		height: containerDom.offsetHeight,
		antialias: true,
		postprocess: false,
		domElement: containerDom,
		exposure: 1.5,
        textureEncoding: 'sRGB'
    };
    _webObject.container=containerDom;
	var renderObj = this.rendererManager.addRender(renderParams);
    renderObj.setDomElement(containerDom);
	window.addEventListener('resize', _webObject.onWindowResize, false);
	//捕获阶段处理事件
	containerDom.addEventListener('click', _webObject.onClick, true);
    //$(containerDom).on('click', _webObject.onClick);
	//$(containerDom).on('mousemove', onDocumentMouseMove);
	$(containerDom).on('mousedown', _webObject.mouseDown);
	$(containerDom).on('mouseup', _webObject.mouseUp);
	if(this.isDebug){
		this._stats = new Stats();
		document.body.appendChild( this._stats.dom );
	}
    return renderObj;
}

_webObject.createScene=function(sceneId,containerDom,sceneOptions){
    var options=sceneOptions||_webObject.sceneDefaultOptions;
    //得到第一个renderobj。一般也只有一个
    var renderObj=this.rendererManager.getRender(0);
    if(!renderObj){
        renderObj=this._createRender(containerDom);
    }
    //构造一个scene
    options.id=sceneId;
    options.size=options.size||{left:0,top:0,width:containerDom.offsetWidth,height:containerDom.offsetHeight};

    options.outline = false;
    if(!options.loadManager)options.loadManager=this.loadManager;
	var baseScene = renderObj.addBaseScene(options);
    this.scenes.set(sceneId,baseScene);    
    bgManager.addSceneManager(baseScene);
	this.render(true);
}

//添加一个模型
_webObject.addModel = function (sceneId, url, modelId,cb,initEffectParams) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var modelManager=baseScene.modelManager;
    var obj=modelManager.getObject(modelId);
    //场景已存在model
    if(defined(obj)){
        if(obj.scene.visible)
           _webObject.processes.update("模型已加载过!", " ");
        else{
            modelManager.currentShowModel.scene.visible=false;
            obj.scene.visible=true;
            modelManager.currentShowModel=obj;
        }
            
        setTimeout(function () {
            processes.setVisible(false);
        }, 3000);
        return null;
    }
    var obj = {
        url: url,
        id: modelId
    }
    if(cb instanceof Function)
    {
		if(!_webObject.listener.has(sceneId)){
			var lisen=new Map;
			_webObject.listener.set(sceneId,lisen);
			lisen.set("addModel",cb);
		}else{
			var lisen=_webObject.listener.get(sceneId);
			if(!lisen.has("addModel")){
				lisen.set("addModel",cb);
			}
		}        
    }    
    modelManager.addModel( obj,initEffectParams, _webObject.loadCallback.onProgress,_webObject.loadCallback.onFinish,_webObject.loadCallback.onError);    
}
//场景是否存在模型
_webObject.hadModelInScene=function(sceneId){
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return false;
    var modelManager=baseScene.modelManager;
    return modelManager.size()>0;
}

_webObject.setModelProperty = function (sceneId, modelId,data) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var modelManager=baseScene.modelManager;
    modelManager.setModelNodeProperty(modelId,data);
}
_webObject.remove = function (sceneId, modelId) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var modelManager=baseScene.modelManager;
    modelManager.removeModel(modelId);   
}

_webObject.isLoad = function (sceneId, modelId) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return false;
    var modelManager=baseScene.modelManager;
    return modelManager.has(modelId)?true:false;
}

_webObject.setShow = function (sceneId, modelId, visible) {
	if(_webObject.lockScene){
		return;
	}
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var modelManager=baseScene.modelManager;
    modelManager.showModel(modelId, visible);
}

_webObject.showOperateCtrl = function (sceneId, visible) {
    // if(visible){
    // 	var obj ={
	// 		//url:"http://localhost:9090/web3d/data/model/DDG-89/DDG-89_draco.glb",
	// 		url:"http://localhost:9090/web3d/data/model/T-AGOS-19/T-AGOS-19.glb",
    // 		id:"test"
    // 	}
    // 	this.addModel(0,obj.url,obj.id,undefined,
	// 		{materialEffect:{
	// 			metalness:0.5,
	// 			roughness:0.4
	// 		},
	// 		backGroundType:SceneBackgroundModel.WATER
	// 	});
    // }
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    baseScene.ShowOperateControl(visible);

}
_webObject.showLabel=function(sceneId,modelId,nodeName,bShow,divDom,offset=undefined,aniTime=500,bClearOther=true,cb){
	if(_webObject.lockScene){
		return;
	}
	var baseScene=this.scenes.get(sceneId);
	if(!baseScene)return null;
	var labelManager=baseScene.labelManager;
	var modelManager=baseScene.modelManager;
	var model=modelManager.getModel(modelId);
	var node=model.getObjectByName(nodeName);
	if(!defined(node))return;
	var node_bs=new THREE.Sphere();
	try{
		node_bs.copy(modelManager.calculateBoundingSphere(node));
	}catch(e){
		console.warn("没有找到node世界位置");
	}
	if(!offset){
		offset=modelManager.autoOffset(model,node_bs.center);
	}    
	//var offset=offset||new THREE.Vector3(0.4,0.4,0.5);
	var info=divDom||nodeName;
	labelManager.addPopLabel(nodeName,info,node_bs.center,offset,new THREE.Matrix4(),aniTime,bClearOther,cb);
	return true
    

}
_webObject.hideAllLabel=function(sceneId){
	if(_webObject.lockScene){
		return;
	}
	var baseScene=this.scenes.get(sceneId);
	if(!baseScene)return null;
	baseScene.labelManager.clearAllLabel()
	return true
    
}
_webObject.highlight=function(sceneId, modelId,nodeName,bNew=true){
	if(_webObject.lockScene){
		return;
	}
	var baseScene=this.scenes.get(sceneId);
	if(!baseScene)return null;
	var modelManager=baseScene.modelManager;
	modelManager.highlight(modelId,nodeName,bNew);
	return true
    
}
_webObject.locateNode = function (sceneId, modelId, time, nodeName,bHighlight,cb,threeVector3) {
	if(_webObject.lockScene){
		return;
	}
	var baseScene=this.scenes.get(sceneId);
	if(!baseScene)return null;
	var modelManager=baseScene.modelManager;
	modelManager.locateModelNodeByName(modelId, nodeName,time, bHighlight,cb,threeVector3)
	return true
    
}
//播放节点动画
/*
sceneId：场景索引
modelID：添加模型时给的模型ID
node：节点名称/三维节点对象
play：播放或者停止
loop：播放次数
*/
_webObject.playNodeAction = function(sceneId,modelId,nodeName, startTime, endTime, play = true, loop = 2,timeIsFrameNums=false){
    if(_webObject.lockScene){
		return;
	}
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    if(baseScene&&baseScene.animationCtrlMap.has(modelId)){
        var animationCtrl=baseScene.animationCtrlMap.get(modelId);
        animationCtrl.playNodeAction(nodeName,play,loop,startTime, endTime,timeIsFrameNums);
    }
    
}
_webObject.playAction = function (sceneId, modelId, actionName, startTime, endTime, play = true, loop = 2) {
    if(_webObject.lockScene){
		return;
	}
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    if (baseScene && baseScene.animationCtrlMap.has(modelId)) {
        var animationCtrl = baseScene.animationCtrlMap.get(modelId);
        animationCtrl.playAction(actionName, play, loop, startTime, endTime);
    }

}
//draw
/*
var drawOptions={
    type:'cylinder',
    name:'RadarScanning',
    euler:{
        x:0,y:0,z:Math.PI/2
    },
    geometry:{
        radiusTop:0,
        radiusBottom:50,
        height:100,        
        radialSegments:25,
        heightSegments:5,
        openEnded:false,
        thetaStart:0,
        thetaLength:Math.PI*2,
        centerIsTop:true
    },
    material:{
        color:0xffffff,
        transparent:true,
        opacity:0.6,
        side:THREE.DoubleSide,
        emissive:0x072534
    },
    wireframe:{
        color:0xffffff,
        transparent:true,
        opacity:0.6,
    }
}
*/
_webObject.addDrawObject = function (sceneId,modelId,meshName,drawID,drawOptions) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var model=baseScene.getModel(modelId);
    if(model==null) return;
    var mesh=model.getObjectByName(meshName);
    if(!mesh)mesh=model;
    var dM=baseScene.drawManager;
    if(dM){
        dM.addDrawObject(drawID,drawOptions.type,drawOptions.name,mesh,drawOptions);
    }
}

_webObject.removeDrawObject = function (sceneId,drawID) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var dM=baseScene.drawManager;
    if(dM){
        dM.removeDrawObject(drawID);
    }
}
//dM.animateDraw(2,true,'scan',18)
_webObject.animateDraw = function (sceneId,drawID,bPlay,type,duration) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    var dM=baseScene.drawManager;
    if(dM){
        dM.animateDraw(drawID,bPlay,type,duration);
    }
}

//type:回调类型 type:"click"
_webObject.addBaseSceneCallBack = function (sceneId,type,cb) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    baseScene.addCallBack(type,cb);
}

// function clickModel(baseScene,root,selObj){
// 	//选中的物体
// 	var node=selObj.object;
// 	var labelManager=baseScene.labelManager;
// 	if(labelManager){
// 		//没有选中，即点击空白处
// 		if(!node){
// 			labelManager.clearAllLabel();
// 		}else{
// 			var offset=new THREE.Vector3(0.5,0.5,0.5);
// 			//var obj=baseScene.getObjectFromObj3D(root);
// 			var pickPos=selObj.point;
// 			getDivInfo(node.name,function(div){
// 				labelManager.addInfoLabel(0,div,pickPos,offset);
// 			})
// 		}
// 	}		
// }
//type:回调类型 type:"click"
_webObject.addBaseSceneListener = function (sceneId,type,func) {
    var baseScene=this.scenes.get(sceneId);
    if(!baseScene)return null;
    baseScene.addListener(type,func);
}



_webObject.loadState = {
    loading: 0,
    loadSuccess: 1,
    downloadError: 2,
    loadError: 3,
}





function Processwindow() {
	var win = document.getElementById("process-window");
	if (!win) {
		var html = '<div id = "process-window" class="Absolute-Center"><div id = "animition"><div id = "percent"> 30%</div><div id ="round-picture"></div></div><div id = "text" style="padding: 10px;">正在加载 拉森号 </div></div>';
		document.body.insertAdjacentHTML("beforeend", html);
		win = document.getElementById("process-window");
	}
	this.win = win;
	this.percent = document.getElementById("percent");
	this.text = document.getElementById("text");
	this.update = function (percent, text) {
		this.percent.innerText = percent;
		if (text) {
			this.text.innerText = text;
		}
		this.setVisible(true);
	};
	this.setVisible = function (bVisible) {
		this.win.style.display = bVisible ? "" : "none";
	};
	this.setVisible(false);
}



function BGManager() {
	this.scenes =[];
	this.collection = new Map();
	this.init = function (scenes) {
        this.scenes=scenes;
		for (var i = 0; i < scenes.length; i++) {
			var manager = this.createBgParams(scenes[i]);
			manager.setVisible(false);
			this.collection.set(scenes[i], manager);

		}
    };
    this.addSceneManager=function(baseScene){
        this.scenes.push(baseScene);
        var manager = this.createBgParams(baseScene);
		manager.setVisible(false);
		this.collection.set(baseScene, manager);
    }
	this.update = function () {
		var me = this;
		this.collection.forEach(function (value, key) {
			if (value.type == key.sceneBackground.backGroundType) {
				return;
			}
			value.dispose();
			value = me.createBgParams(key);
			me.collection.set(key, value);
		});
	};
	this.createBgParams = function (scene) {
		var bgObject = scene.sceneBackground;
		var sceneBackgroundModel = scene.sceneBackground.backGroundType;
		var params, items;
		var name = scene.id;
		var gui = new GUICtrls({
			div: "background-setting-panel",
			showControl: false,
		});

		gui.type = sceneBackgroundModel;
		var ambientLight = scene.lightCollection.AmbientLight;
		gui.dat.add(ambientLight, "intensity", 0, 10, "场景亮度").step(0.05).onChange(function (value) {

		});
		switch (sceneBackgroundModel) {
			case SceneBackgroundModel.WATER:
				params = bgObject.waterParams;
				gui.dat.add(params, "waterSize", 1, 10, "水面大小").step(1).onChange(function (value) {
					bgObject.updateWaterSceneParam();
				});
				gui.dat.add(params, "waterAlpha", 0.7, 1, "水透明度").step(0.01).onChange(function (value) {
					bgObject.updateWaterSceneParam();
				});
				// gui.dat.add(params,"waterDistortionScale",1,10,"再议").step( 0.1 ).onChange( function( value ) { 
				// 	bgObject.updateWaterSceneParam();
				// } );
				gui.dat.add(params, "skyInclination", 0, 0.5, "太阳高度角").step(0.01).onChange(function (value) {
					bgObject.updateWaterSceneParam();
				});
				gui.dat.add(params, "skyAzimuth", 0, 1, "太阳水平角").step(0.01).onChange(function (value) {
					bgObject.updateWaterSceneParam();
				});

				// gui.dat.add(params,"distance",400,2000,"太阳距离").step( 10 ).onChange( function( value ) { 
				// 	bgObject.updateWaterSceneParam();
				// } );
				break;
			case SceneBackgroundModel.OCEAN:
				params = bgObject.ocean2Params;
				gui.dat.add(params, "oceanSize", 100, 10000, "海面大小").step(10).onChange(function (value) {
					bgObject.updateOcean2Params();
				});
				gui.dat.add(params, "oceanWind", -15, 15, "波浪大小").step(1).onChange(function (value) {
					bgObject.updateOcean2Params();
				});
				gui.dat.add(params, "choppiness", 0.1, 4, "波纹精细度").step(0.1).onChange(function (value) {
					bgObject.updateOcean2Params();
				});
				gui.dat.add(params, "geometrySize", 1, 10000, "水面大小").step(1).onChange(function (value) {
					bgObject.updateOcean2Params();
				});
				gui.dat.add(params, "exposure", 0, 0.5, "材质亮度").step(0.01).onChange(function (value) {
					bgObject.updateOcean2Params();
				});
				// gui.dat.addColor(params,"ocean_color","海水颜色").onChange( function( value ) {  

				// } );
				break;
			case SceneBackgroundModel.SKY:
				params = bgObject.skyParams;
				gui.dat.add(params, "turbidity", 1, 20, "turbidity").step(0.1).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "rayleigh", 0, 4, "rayleigh").step(0.01).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "mieCoefficient", 0, 0.1, "mieCoefficient").step(0.001).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "mieDirectionalG", 0, 1, "mieDirectionalG").step(0.001).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "luminance", 0, 2, "luminance").step(0.0001).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "inclination", 0, 1, "inclination").step(0.0001).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				gui.dat.add(params, "azimuth", 0, 1, "azimuth").step(0.0001).onChange(function (value) {
					bgObject.updateSkyParam();
				});
				break;
		}
		gui.showTogge(false);
		gui.setVisible(false);
		return gui;
	}
	this.showMenu = function (id = undefined, visible = false) {
		if (!defined(id)) {
			if (this.scenes.length == 1)
				this.collection.values().next().value.setVisible(visible);
		} else {
			this.collection.forEach(function (value) {
				value.setVisible(visible);
			});
		}
	}

	this.toggleShow = function (id = undefined) {
		if (!defined(id)) {
			if (this.scenes.length == 1)
				this.collection.values().next().value.toggleShow();
		} else {
			this.collection.forEach(function (value) {
				value.toggleShow();
			});
		}
	}

	//this.init();
}

function GUICtrls(params) {
	this._params = params;
	var parent = defaultValue(params.div, "data-gui-panel");
	var showTogge = defaultValue(params.showControl, true);

	this.domElement = document.getElementById(parent);

	if(!defined(this.domElement)){
		this.domElement=document.createElement("div");
		this.domElement.id=parent;
		this.domElement.className="layui-tab bg-panel";
	}

	this.dat = new dat.GUI( /*{parent:document.getElementById("data-gui-panel")}*/ {
		closeOnTop: false,
		hideable: true,
		autoPlace: false,
	});
	this.showTogge = function (showTogge) {
		var display = showTogge ? "" : "none";
		$(".close-button.close-bottom").css("display", display);
	};
	if (!showTogge) {
		this.showTogge(false);
	}
	this.domElement.appendChild(this.dat.domElement);

	this.controlers = dat.__controllers;
	this.dispose = function () {
		// this.clear();
		this.dat.destroy();
		this.dat.domElement.parentElement.removeChild(this.dat.domElement);
		this.dat = null;
		// this.controlers = null;
	}
	// this.clear=function(){
	// 	var arr = this.controlers;
	// 	for(var i=0;i<arr.length;i++){
	// 		this.dat.remove(arr[i]);
	// 	}
	// };
	this.setVisible = function (visible) {
		this.dat.domElement.style.display = visible ? "" : "none";
	};
	this.toggleShow = function () {
		var bShow = this.dat.domElement.style.display;
		this.dat.domElement.style.display = bShow == "none" ? "" : "none";
	};
	this.clearControl = function () {
		for (var i = this.dat.__controllers.length - 1; i >= 0; i--) {
			var cl = this.dat.__controllers[i];
			this.dat.remove(cl);
		}
	};

}
//获取选中的模型节点
_webObject.getModelNode = function(){
	return _webObject.currentSelectedNode?_webObject.currentSelectedNode:console.warn("未选中模型node节点")
}


//初始化
// 界面操作--背景改变按钮事件，界面背景参数配置
var bgManager;
$(function () {
    _webObject.processes=  new Processwindow();
	bgManager = new BGManager();


	// var header = `<li class="layui-this"><i class="iconfont fa fa-list-ul"></i>&nbsp;${name}</li>`;
	// var content = `<div class="layui-tab-item layui-show">
	// 			    	${items}
	// 			   </div>
	// 			   <div class="layui-tab-item">
	// 			    	我是保留区域<hr/>武器范围
	// 			   </div>`;

	// var showBgMenu = false;
	$("#background-changed").on("change", function (e) {
		var bg = parseInt($(e.target).children(":selected").attr("value"));
		if (bgManager.scenes.length < 1 || !defined(bg)) {
			return;
		}
		for (var i = 0; i < bgManager.scenes.length; i++) {
			var scene = bgManager.scenes[i];
			scene.sceneBackground.changedBG(bg);
			bgManager.update();
			bgManager.showMenu(scene, false);
		}


	});

	$("#background-setting-button").on("click", function () {
		// var display = $("#background-setting-panel").css("display");
		// display = display == "block" ? "none" : "block";
		// $("#background-setting-panel").css("display",display);
		bgManager.toggleShow();
	});
})

//_webObject.getModel = function(_sceneId,_id){	
//	_webObject.scenes.get(0).controls.enabled= false;
	//this.scenes.get(_sceneId).modelManager.getModel.getModel(_id);
//}


//锁定当前场景缩放 平移 旋转
_webObject.lockBaseScene = function(){	
//	_webObject.scenes.get(0).controls.enabled= false;
	_webObject.lockScene = true
}
_webObject.unLockBaseScene = function(){
//	_webObject.scenes.get(0).controls.enabled= true;
	_webObject.lockScene = false
}
 _webObject.showGrid =function(sceneId,modelId,boolean){
	 //debugger
	 //boolean = boolean || false
	var moudleOfScene=_webObject.scenes.get(sceneId).scene;
	if(boolean){
		var _model = _webObject.scenes.get(sceneId).modelManager.getModel(modelId);
		
		var _int = _model.boundingSphere.radius*2;
		
		var gridHelper = new THREE.GridHelper( _int, 10,0x0000ff, 0x808080);			
		moudleOfScene.add(gridHelper)
	}else{
	    for(let i=0;i<moudleOfScene.children.length;i++){
	        if(moudleOfScene.children[i] instanceof THREE.GridHelper){
	             moudleOfScene.remove(moudleOfScene.children[i])
	        }
	    }
	}
	//moudleOfScene.children.map(x => x instanceof THREE.GridHelper ? moudleOfScene.remove(x) : 1)
	
}