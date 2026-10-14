/***
options={
	size:{
		width:1920,
		height:1024
	},                           //need
	background:{									//OPTIONS
		texture:{
			path:'textures/cube/skybox/',
			files:[
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'],
			},
		color:THREE.Color( 0xffffff)
	},
	fogColor:THREE.Color( 0xffffff),
	lights:{
		ambient:{
			color:0x404040,
			intensity:0.5
		},
		direction:{
			color:0xdddddd,
			intensity:2,
			position:THREE.Vector3(0, 0, 1)
		},
		spot:{
			color:0xffffff,
			intensity:1,
			position:THREE.Vector3(0, 1, 0),  //This is set equal to Object3D.DefaultUp (0, 1, 0), so that the light shines from the top down.
			distance:0.0,			//If non-zero, light will attenuate linearly from maximum intensity at the light's position down to zero at this distance from the light. Default is 0.0.
			angle:Math.PI/3,		//Maximum extent of the spotlight, in radians, from its direction. Should be no more than Math.PI/2. The default is Math.PI/3.
			penumbra:0.0,     //Percent of the spotlight cone that is attenuated due to penumbra. Takes values between zero and 1. The default is 0.0.                 
			decay:1,		//The amount the light dims along the distance of the light.In physically correct mode, decay = 2 leads to physically realistic light falloff. The default is 1.
			castShadow:false
		}
	},
	camera:{                                   //option
		fov:75,
		aspect:1920/768,
		near:1,
		far:1000
	},
	loadManager:{},
	controls:{
		rotateSpeed:1,
		zoomSpeed : 1.2,
		panSpeed : 0.8,
		noZoom : false,
		noPan : false,
		staticMoving : true,
		dynamicDampingFactor : 0.3
	}
}
*/
function ascSort( a, b ) {

	return a.distance - b.distance;

}

function baseScene(options) {
	//basescene 尺寸
	this._size={
		left:0,
		top:0,
		width:1920,
		height:1024
	};
	var size=this._size;
	size.left=defaultValue(options.size.left,0);
	size.top=defaultValue(options.size.top,0);
	size.width=defaultValue(options.size.width,1920);
	size.height=defaultValue(options.size.height,1024);

	this._id=defaultValue(options.id,undefined);	
	this._rendererObj=defaultValue(options.rendererObj,undefined);
	if(this._rendererObj) this._renderer=this._rendererObj._renderer;

	

	this.services=new Map;

	//1、添加scene
	this.scene = new THREE.Scene();
	var scene=this.scene;

	//实时刷新
	this.bReflush=true;
	//默认白色背景
	scene.background = new THREE.Color( 0xffffff );

	if (options.fogColor) {
		scene.fog=new THREE.Fog(options.fogColor);
	}

	//2、给scene添加透视相机PerspectiveCamera   //暂时3D只用透视相机
	var camera_ops={                                   //option
		fov:45,
		aspect:size.width/ size.height,
		near:1,
		far:2000
	};
	if (options.camera){
		camera_ops.fov=defaultValue(options.camera.fov,camera_ops.fov);
		camera_ops.aspect=defaultValue(options.camera.aspect,camera_ops.aspect);
		camera_ops.near=defaultValue(options.camera.near,camera_ops.near);
		camera_ops.far=defaultValue(options.camera.far,camera_ops.far);
	}
	this.camera = new THREE.PerspectiveCamera(camera_ops.fov, camera_ops.aspect, camera_ops.near, camera_ops.far );
	var camera=this.camera;
	if (options.camera&&options.camera.initPos) {
		camera.position.x=options.camera.initPos.x;
		camera.position.y=options.camera.initPos.y;
		camera.position.z=options.camera.initPos.z;
	}

	// var helpers = new THREE.CameraHelper(this.camera);
	scene.add( this.camera );

	//3、光源
	this.InitSceneCollection();
	if (options.lights) {
		//场景光
		var lights_ops=options.lights;
		this.addAmbientLight(lights_ops.ambient.color,lights_ops.ambient.intensity);
		//方向光
		if (lights_ops.direction) {
			this.addDirectionalLight("direction",lights_ops.direction);
		}
		//点光源
		if (lights_ops.spot) {
			this.addSpotLight("spotlight",lights_ops.spot);
		}
	}
	//4、鼠标控制
	this._control={};
	this._control.options=options.controls;
	this._control.controlList=new Map;
	var control_mode=defaultValue(this._control.options.mode,2);
	this.changeControlMode(control_mode);


	//添加的场景物件，以便pick时使用
	this._sceneObjLst=[];
	//保留加载的物件属性，以便后续唯一控制
	this._objList=new Map;
	//保留物件属性绘制对象，以便后续唯一控制
	this._drawingList=new Map;
	//鼠标选择的object
	this._INTERSECTED=undefined;
	//mesh边框
	this._outlinePass=undefined;
	this._composer=undefined;
	this._selectedMeshes=[];
	

	//设置背景管理器
	if (options.background) {
		var background_ops=options.background;
		this.sceneBackground = new sceneBackground(background_ops.SceneBackgroundModel,this,background_ops.param);
	}

	this._postprocess=false;	
	if (defined(options.outline)&&options.outline==true) {
		this.enableOutline(true);
	}

	this.loadManager=options.loadManager;
	
	var scope=this;

	//标牌管理器
	this.labelManager=new LabelManager(scope);
	this.registe_service("labelManager",this.labelManager);
	//scope._addLabelRender(scope._renderer.domElement.parentElement);

	
	//模型管理器
	this.modelManager=new ModelManager(scope);
	this.registe_service("modelManager",this.modelManager);
	//为场景绘制外部框等
	this.drawingHeatArea = new heatArea();

	this.drawManager= new drawManager(this);

	//EVENT
	this._bMouseMove=true;
	this._bLeftClick=true;
	//动画计时器
	this._clock = new THREE.Clock();

	//添加裁剪面
	this._clipPlanes = [
		new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 ),    //YZ平面->X
		new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0 ),	//XZ平面->-y
		new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), 0 )	//XY平面->-z
	];
	this._planeHelps=[
		new THREE.PlaneHelper( this._clipPlanes[ 0 ], 100, 0xff0000 ),
		new THREE.PlaneHelper( this._clipPlanes[ 1 ], 100, 0x00ff00 ),
		new THREE.PlaneHelper( this._clipPlanes[ 2 ], 100, 0x0000ff ),
	];

	//为场景添加界面
	//this._gui = undefined;
	this.operateUI=new OperateUI(scope);

	//添加旋转物件列表
	this._rotationList=new Map;

	this.animationCtrlMap=new Map;

	this.perAddFunc=[];
	//this.perAddFunc.push(this.addLabel);
	//注册监听
	this._listener=new Map;

	this.patrolEntity=undefined;

}

baseScene.prototype = {
	constructor:baseScene,
	//设置显隐性
	get size(){
		return this._size;
	},
	set size(size){
		this._size.left=size.left;
		this._size.top=size.top;
		this._size.width=size.width;
		this._size.height=size.height;
		this.camera.aspect=this._size.width/this._size.height;
		this.camera.updateProjectionMatrix();
		if(this._composer&&this._postprocess)this._composer.setSize( size.width, size.height );

		this.labelManager.setRenderSize(size);
		
	},
	
}
baseScene.prototype.setDomElement = function(domElement){
	this.labelManager.setDomElement(domElement);

}


baseScene.prototype.registe_service = function(moduleName,module){
	if(!this.services.has(moduleName)){
		module.registe_service();
		this.services.set(moduleName,module);
	}
}


baseScene.prototype.exec_service=function(moduleName,funcName,params){
	if(this.services.has(moduleName)){
		var module=this.services.get(moduleName);
		return module.exec_service(funcName,params);
	}
}
/*
*render
*/

baseScene.prototype.render = function(){
		for(var i=this.perAddFunc.length-1;i>=0;i--){
			this.perAddFunc[i]();
			this.perAddFunc.pop();
		}
		var clock=this._clock;
		var delta = clock.getDelta();
	//更新TWEEN
		TWEEN.update();
		//this.camera.aspect = this._size.width/this._size.height;
		this.camera.updateProjectionMatrix();	
		this.controls.update(delta);
		//执行渲染任务
		if(this.sceneBackground){
			var eventArray = this.sceneBackground.updateBackground;
			if(eventArray.length<0)
				return;
			for (var i = 0; i < eventArray.length; i++) {
				var func = eventArray[i].func;
				var args = eventArray[i].args;
				if(func instanceof Function){
					func(args);
				}
			}
		}
		
		if (this._postprocess==false) this._renderer.render( this.scene, this.camera );
		else if(this._composer&&this._postprocess) 
			this._composer.render();
		//绘制标牌
		//标牌位置在一帧内最后计算
		this.labelManager.render(this.scene, this.camera );

		//更新动画
		this.animationCtrlMap.forEach(function(animationCtrl){
			animationCtrl.update(delta);
		});

		//模型状态的一些改变
		this.modelManager.update(delta);

}
//添加脚本render绘制
baseScene.prototype.script_render = function(delta){
//更新TWEEN
	TWEEN.update();
	//this.camera.aspect = this._size.width/this._size.height;
	this.camera.updateProjectionMatrix();	
	this.controls.update(delta);
	//执行渲染任务
	if(this.sceneBackground){
		var eventArray = this.sceneBackground.updateBackground;
		if(eventArray.length<0)
			return;
		for (var i = 0; i < eventArray.length; i++) {
			var func = eventArray[i].func;
			var args = eventArray[i].args;
			if(func instanceof Function){
				func(args);
			}
		}
	}
	
	if (this._postprocess==false) this._renderer.render( this.scene, this.camera );
	else if(this._composer&&this._postprocess) 
		this._composer.render();
	//绘制标牌
	//标牌位置在一帧内最后计算
	this.labelManager.render(this.scene, this.camera );

	
	//模型状态的一些改变
	this.modelManager.update(delta);

}
baseScene.prototype.updateSize= function(size) {
	this.size=size;
	this.camera.aspect = this._size.width/this._size.height;
	this.camera.updateProjectionMatrix();	

}
/*
render.doc内的鼠标坐标是否在该scene里
*/
baseScene.prototype.isMouseInside= function(pos) {
	var size=this._size;
	if((pos.x-size.left)<0||(pos.x-size.left)>size.width||
		(pos.y-size.top)<0||(pos.y-size.height)>size.height)
		return false;
	return true;

}

baseScene.prototype.client2mouse= function(pos) {
	var mouse = new THREE.Vector2();
	mouse.x=(pos.x-this._size.left)/this._size.width*2-1;
	mouse.y=-(pos.y-this._size.top)/this._size.height*2+1;
	return mouse;
}
//raypick
baseScene.prototype.rayPick= function(mouse) {
	var pickObjs=[];
	var pick=this.modelManager.rayPick(mouse);
	pickObjs.push(pick);
	//按距离排序一下
	pickObjs.sort(ascSort);
	return pickObjs[0];
}

//返回false 该场景没有执行时间
//true 执行过事件
baseScene.prototype.onMouseMove=function(pos){
	if (this._bMouseMove==false) return false;
	if(this.isMouseInside(pos)){
		mouse=this.client2mouse(pos);
		var intersectobj=this.rayPick(mouse);
		
		if (this._outlinePass&& this._INTERSECTED != intersectobj.object ) {
			//if(this._INTERSECTED) this._INTERSECTED.children.pop();
			this._INTERSECTED = intersectobj.object;
			if (this._INTERSECTED) {
				this._selectedMeshes=[];
				this._selectedMeshes.push(this._INTERSECTED);
				this._outlinePass.selectedObjects=this._selectedMeshes;
				var pickPos=intersectobj.point;
				//this._tipLabel.position.set( pickPos.x, pickPos.y, pickPos.z);
				this._tipLabel.setPosition(pickPos);
				this._labelDiv.textContent = this._INTERSECTED.name;
				this._labelDiv.style.display="";
				//mesh不透明
				this.setMeshAlphaColor(this._INTERSECTED,1);
			}else{
				this._labelDiv.style.display="none";
				this._outlinePass.selectedObjects=[];
			}
		}
		return true;

	}else
		return false;
}

baseScene.prototype.clearClickLabel=function(){
	if(this._clickTip){
		this._clickTip.dispose();
		delete this._clickTip;
	}	
}

baseScene.prototype.onLeftClick=function(pos){
	if (this._bLeftClick==false){
		return false;
	}	
	if(this.isMouseInside(pos)){		
		mouse=this.client2mouse(pos);
		//获取选中模型的对象
		var intersectobj=this.modelManager.onLeftClick(mouse);
		intersectobj ? _webObject.currentSelectedNode=intersectobj.object : _webObject.currentSelectedNode = undefined
		if(intersectobj==undefined){
			intersectobj={};
		} 		
		//选取到物件,第一次添加outline
		if(!defined(this._outlinePass)&&intersectobj.object){
			this.enableOutline(true);
		}
		
		//不是上次选中的
		if (this._INTERSECTED != intersectobj.object ) {
			this._INTERSECTED = intersectobj.object;
			//点击默认选中边框
			//选中
			if (this._INTERSECTED) {				
				this._selectedMeshes=[];
				this._selectedMeshes.push(this._INTERSECTED);
				this._postprocess=true;
				this._outlinePass.selectedObjects=this._selectedMeshes;				
			}else{			
				this._outlinePass.selectedObjects=[];
				this._postprocess=false;
			}
			
			//查看一下是否有监听
			if(this._listener.has("click")){
				var func=this._listener.get("click");
				var root=intersectobj.userObj?intersectobj.userObj.scene:null;
				func(this,root,intersectobj);
			}
			//没有监听执行默认事件,弹标牌
			else{
				if (this._INTERSECTED) {
					var pickPos=intersectobj.point;	
console.log("pick位置："+ pickPos.x+";"+pickPos.y+";"+pickPos.z)					
					if(this.labelManager){
						//var sceneObjPos=this._selSceneObj.position;
						var offset=new THREE.Vector3(2,2,2);
						//offset.unproject( this.camera );
						//if(pickPos.x<sceneObjPos.x)offset.x=-offset.x;
						var obj=intersectobj.userObj;
						var info=this._INTERSECTED.name;
						if(obj.nodeNameMap){
							var info=obj.nodeNameMap.has(info)?obj.nodeNameMap.get(info):info;
						}					
						this.labelManager.addPopLabel(0,info,pickPos,offset);
					}					
				}else{
					if(this.labelManager)this.labelManager.showLabel(0,false);
				}
				
			}
		}else if(this._INTERSECTED==undefined){
			if(this.labelManager)this.labelManager.clearAllLabel();
		}
		return true;

	}else
		return false;
}

/*
*添加场景集合
*/

baseScene.prototype.InitSceneCollection = function(camera){
	this.lightCollection = {
		AmbientLight : undefined,
		DirectionalLight : new Map(),
		HemisphereLight : new Map(),
		PointLight : new Map(),
		RectAreaLight : new Map(),
		SpotLight : new Map(),
	}
	this.geometryCollection = new Map();
	this.modelCollection = new Map();
}

/*
*添加场景光
*/

baseScene.prototype.addAmbientLight = function(color,intensity){
	if(this.lightCollection){
		if(this.lightCollection.AmbientLight){
			this.scene.remove(this.lightCollection.AmbientLight);
		}
	}
	this.lightCollection.AmbientLight = new THREE.AmbientLight(color,intensity);
	this.lightCollection.AmbientLight.name = 'AmbientLight';
	this.scene.add( this.lightCollection.AmbientLight );
}

/*
*添加平行光
*/
baseScene.prototype.addDirectionalLight = function(name,direction){
	if(this.lightCollection){
		var d_color=defaultValue(direction.color,0xdddddd);
		var d_intensity=defaultValue(direction.intensity,4);
		var directionalLight=new THREE.DirectionalLight( d_color, d_intensity);
		var d_pos=defaultValue(direction.position,new THREE.Vector3(0,0,1));
		directionalLight.position.set(d_pos.x,d_pos.y,d_pos.z)
		//directionalLight.position.multiplyScalar( 80 );
		//directionalLight.position.set(d_pos.x,d_pos.y,d_pos.z).normalize();
		if(direction.castShadow){
			directionalLight.castShadow = true;
			directionalLight.shadow.mapSize.width = 1024;
			directionalLight.shadow.mapSize.height = 1024;
			this.castShadow=true;

			this._renderer.gammaInput = true;
			this._renderer.shadowMap.enabled = true;
		}
		// var helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
		// this.scene.add(helper);
		

		this.lightCollection.DirectionalLight.set(name,directionalLight);
		directionalLight.name = name;
		this.scene.add( directionalLight );
		return directionalLight;
	}
}

/*
*添加点光源
*/
baseScene.prototype.addSpotLight = function(name,spot){
	if(this.lightCollection){
		var s_color=defaultValue(spot.color,0xdddddd);
		var s_intensity=defaultValue(spot.intensity,4);
		var spotLight=new THREE.SpotLight( s_color, s_intensity);
		spotLight.distance=defaultValue(spot.distance,0);
		spotLight.angle=defaultValue(spot.angle,0);
		spotLight.penumbra=defaultValue(spot.penumbra,0);
		spotLight.decay=defaultValue(spot.decay,1);		
		var s_pos=defaultValue(spot.position,THREE.Vector3(10,20,10));
		spotLight.position.set(s_pos.x,s_pos.y,s_pos.z);
		if (spot.castShadow) {
			spotLight.shadow.mapSize.width = 1024;
			spotLight.shadow.mapSize.height = 1024;
			spotLight.castShadow = true;
			// Ground
			// var plane = new THREE.Mesh(
			// 	new THREE.PlaneBufferGeometry( 50, 50 ),
			// 	new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
			// );
			// plane.rotation.x = - Math.PI / 2;
			// plane.position.y = -5;
			// plane.receiveShadow = true;
			// this.scene.add(plane);
			this.castShadow=true;
			this._renderer.gammaInput = true;
			this._renderer.shadowMap.enabled = true;

		}
		
		// var spotLightHelper = new THREE.SpotLightHelper (spot);
		this.lightCollection.SpotLight.set(name,spotLight);
		spotLight.name = name;
		this.scene.add( spotLight );
		return spotLight;
	}
}

/*
*初始化界面控制
*/
baseScene.prototype.createTrackballControls = function(camera,dom=undefined,controls_ops={}){
	var controls = new THREE.TrackballControls( camera,dom );
	controls.rotateSpeed =defaultValue(controls_ops.rotateSpeed,1.0);
	controls.zoomSpeed = defaultValue(controls_ops.zoomSpeed,1.2);
	controls.panSpeed = defaultValue(controls_ops.panSpeed,0.8);
	controls.noZoom =defaultValue(controls_ops.noZoom,false);
	controls.noPan = defaultValue(controls_ops.noPan,false);
	controls.staticMoving = defaultValue(controls_ops.staticMoving,true);//enableDamping 
	// controls.enableDamping = defaultValue(controls_ops.staticMoving,true)
	controls.dynamicDampingFactor = defaultValue(controls_ops.dynamicDampingFactor,0.3);
	// controls.dampingFactor  = defaultValue(controls_ops.dynamicDampingFactor,0.3);
	return controls;
}
/*
*初始化界面控制
*/
baseScene.prototype.createOrbitControls = function(camera,rendererDom,controls_ops={}){
	var controls = new THREE.OrbitControls( camera , rendererDom );
	controls.mouseButtons = {
		LEFT: THREE.MOUSE.LEFT,
		MIDDLE: THREE.MOUSE.MIDDLE,
		RIGHT: THREE.MOUSE.RIGHT
	}
	//controls.addEventListener( 'change', render );
	controls.rotateSpeed =defaultValue(controls_ops.rotateSpeed,1.0);
	controls.zoomSpeed = defaultValue(controls_ops.zoomSpeed,1.2);
	controls.panSpeed = defaultValue(controls_ops.panSpeed,0.8);			
	controls.staticMoving = defaultValue(controls_ops.staticMoving,true)
	controls.dynamicDampingFactor  = defaultValue(controls_ops.dynamicDampingFactor,0.3);
	controls.minDistance = 0.1;
	controls.maxDistance = 500;
	controls.enablePan =defaultValue(!controls_ops.noPan,false);
	return controls;
}
/*
*初始化界面控制
*/
baseScene.prototype.createFlyControls = function(camera,dom=undefined,controls_ops={}){

	var controls= new THREE.FlyControls( camera,dom );
	//controls.addEventListener( 'change', render );
	// API

	controls.movementSpeed =defaultValue(controls_ops.moveSpeed,1.0);
	controls.maxMovementSpeed =defaultValue(controls_ops.maxMoveSpeed,100);
	//controls.domElement = this._renderer.domElement;
	controls.rollSpeed =defaultValue(controls_ops.rollSpeed,0.005);
	controls.dragToLook =defaultValue(controls_ops.dragToLook,false);
	controls.autoForward =defaultValue(controls_ops.autoForward,false);
	return controls;
}

/*
*清除对应光源集合
*/
baseScene.prototype.removeLightCollection = function(scene,lightCollection){
	lightCollection.forEach(function(name,item){
		scene.remove(item);
	});
	lightCollection.clear();
}

// //
// baseScene.prototype.playAnimations=function(obj,bPlay=true,times=1,timescale=1,duration=undefined) {
// 	if(typeof obj === 'string'){
// 		obj=this.getObjectByID(obj);
// 	}
// 	if (!defined(obj)) return false;
// 	for ( var i = 0; i < obj.animations.length; i ++ ) {
// 		var clip = obj.animations[i];
// 		if (duration) {clip.duration=duration};
// 		var action = obj.mixer.existingAction( clip );
// 		if (!defined(action)) {
// 			action=obj.mixer.clipAction( clip );
// 		}
// 		if(defined(action)){
// 			action.reset();
// 			action.setLoop(THREE.LoopRepeat,times);
// 			action.timeScale=timescale;
// 			bPlay ? action.play() : action.stop();
// 		}		
// 	}

// }

//模型边框使能
baseScene.prototype.enableOutline = function(enable){
	if (enable) {
		this._rendererObj._postprocess=true;
		this._postprocess=true;
		if (!defined(this._composer)) {
			this._postprocess=true;
			this._composer = new THREE.EffectComposer( this._renderer );
			var renderPass = new THREE.RenderPass( this.scene, this.camera );
			this._composer.addPass( renderPass );
			this._outlinePass = new THREE.OutlinePass( new THREE.Vector2( this._size.width, this._size.height ), this.scene, this.camera );
			this._outlinePass.visibleEdgeColor.set(0x21f006);
			this._outlinePass.hiddenEdgeColor.set(0x18379d);
			this._outlinePass.renderToScreen=true;
			//闪烁
			this._outlinePass.pulsePeriod = 3;
			this._composer.addPass( this._outlinePass );
		}
	}else{
		this._rendererObj._postprocess=false;
		this._postprocess=false;
	}
}



//旋转
//角度都是弧度
//支持节点旋转
baseScene.prototype.rotate = function(id,r,meshes=[]){
	if(!this._objList.has(id)) return false;
	var obj=this._objList.get(id);
	var sceneObj=obj.scene;
	if (meshes.length==0) {
		sceneObj.rotation.x=r.x;
		sceneObj.rotation.y=r.y;
		sceneObj.rotation.z=r.z;
		return true;
	}
	for (var k = 0; k <meshes.length; k++) {
		var name=meshes[k].name;
		for (var i = 0; i < sceneObj.children.length; i++) {
			var mesh=sceneObj.children[i];
			if (mesh.name===name) {
				mesh.rotation.x=r.x;
				mesh.rotation.y=r.y;
				mesh.rotation.z=r.z;
			}
		}	
	}
}




// 控制一个模型的绘制类型
// @param mdoel ： 是存放在baseScene中的id，或者模型 ，
baseScene.prototype.createHeatAreaDraw = function(model){
	var drawList = this._drawingList;
	var object=model;
	//如果给的是id
	if(!object.id)
		object = this._objList.get(model);
	if(drawList.has(object.id))
		return drawList.get(object.id);
	object.scene.name = object.id;
	var heatAreaDraw = new heatArea(object.scene,{});
	drawList.set(object.id,heatAreaDraw);
	return heatAreaDraw;
}
//切换相机控制
baseScene.prototype.changeControlMode = function(mode){
	if(this.controls)this.controls.dispose();
	var dom = document.getElementById("model-main");
	if(this._control.controlList.has(mode)){		
		this.controls=this._control.controlList.get(mode);
		this.controls.addListener();
	}
	else if (mode===3) {
		this.controls=this.createTrackballControls(this.camera,dom,this._control.options);
		this._control.controlList.set(mode,this.controls);
	}else if (mode===1) {		
		this.controls=this.createOrbitControls(this.camera,this._renderer.domElement.parentElement/*undefined*/,this._control.options);
		this._control.controlList.set(mode,this.controls);
	}else if (mode===2) {
		this.controls=this.createFlyControls(this.camera,dom,this._control.options);
		this.controls.domElement
		this._control.controlList.set(mode,this.controls);
	}
}
baseScene.prototype.resetControl=function(){
	if(this.controls)this.controls.reset();	
}

//对某个Object增加裁剪面
//裁剪面和材质有关
baseScene.prototype.addObjClipPlanes = function(obj,clipPlanes,clipIntersection){
	if(typeof obj === 'string' ){
		if(!this._objList.has(obj)) return false;
		var o=this._objList.get(obj);
		obj=o.scene;
	}	
	if(obj instanceof THREE.Mesh){
		//设置材质透明度
		if (Array.isArray(obj.material)) {
			obj.material.forEach(function(mat){
				if(!defined(mat.clippingPlanes))mat.clippingPlanes=[];
				for (var i = 0; i < clipPlanes.length; i++) {
					var cp=clipPlanes[i];
					var bAdd=true;
					for (var i = 0; i < mat.clippingPlanes.length; i++) {
						if(cp===mat.clippingPlanes[i]){
							bAdd=false;
							break;
						}
					}
					if (bAdd){
						mat.clippingPlanes.push(cp);
						mat.side=THREE.DoubleSide;
						mat.clipIntersection=clipIntersection;
					} 
				}				
			});
		}else{
			if(!defined(obj.material.clippingPlanes))obj.material.clippingPlanes=[];
			var mat=obj.material;
			for (var i = 0; i < clipPlanes.length; i++) {
				var cp=clipPlanes[i];
				var bAdd=true;
				for (var i = 0; i < mat.clippingPlanes.length; i++) {
					if(cp===mat.clippingPlanes[i]){
						bAdd=false;
						break;
					}
				}
				if (bAdd){
					mat.clippingPlanes.push(cp);
					mat.side=THREE.DoubleSide;
					mat.clipIntersection=clipIntersection;
				} 
			}		
		}

	}else{
		var children=obj.children;
		for (var i = 0; i < children.length; i++) {
			this.addObjClipPlanes(children[i],clipPlanes,clipIntersection);
		}
	}	
}
baseScene.prototype.removeObjClipPlanes = function(obj,clipPlanes){
	if(typeof obj === 'string' ){
		if(!this._objList.has(obj)) return false;
		var o=this._objList.get(obj);
		obj=o.scene;
	}
	if(obj instanceof THREE.Mesh){
		//设置材质透明度
		if (Array.isArray(obj.material)) {
			obj.material.forEach(function(mat){
				for (var i = 0; i < clipPlanes.length; i++) {
					var cp=clipPlanes[i];
					for (var j = 0; j < mat.clippingPlanes.length; i++) {
						if(cp===mat.clippingPlanes[j]) 
						{	
							mat.clippingPlanes.splice(j,1);
							break;
						}
					}
				}
				//没有裁剪面了
				if(mat.clippingPlanes==0){
					mat.side=THREE.FrontSide;
					mat.clipIntersection=false;
				}	
				
			});
		}else{
			var mat=obj.material;
			for (var i = 0; i < clipPlanes.length; i++) {
				var cp=clipPlanes[i];
				for (var j = 0; j < mat.clippingPlanes.length; j++) {
					if(cp===mat.clippingPlanes[j]) 
					{
						mat.clippingPlanes.splice(j,1);
						break;
					}
				}
			}
			//没有裁剪面了
			if(mat.clippingPlanes==0){
				mat.side=THREE.FrontSide;
				mat.clipIntersection=false;
			}					
		}

	}else{
		var children=obj.children;
		for (var i = 0; i < children.length; i++) {
			this.removeObjClipPlanes(children[i],clipPlanes);
		}
	}	
}
//对某个Object增加裁剪面
//裁剪面和材质有关
baseScene.prototype.setClipPlaneIntersection = function(obj,clipIntersection){
	if(typeof obj === 'string' ){
		if(!this._objList.has(obj)) return false;
		var o=this._objList.get(obj);
		obj=o.scene;
	}
	if(obj instanceof THREE.Mesh){
		if (Array.isArray(obj.material)) {
			obj.material.forEach(function(mat){
				//material.clippingPlanes.push(clipPlane);
				mat.clipIntersection=clipIntersection;
				
			});
		}else{
			//material.clippingPlanes.push(clipPlane);
			obj.material.clipIntersection=clipIntersection;		
		}

	}else{
		var children=obj.children;
		for (var i = 0; i < children.length; i++) {
			this.setClipPlaneIntersection(children[i],clipIntersection);
		}
	}	
}

baseScene.prototype.changeClipConstant = function(constant,clipPlane=undefined){
	for (var i = 0; i < this._clipPlanes.length; i++) 
	{
		if(defined(clipPlane)&&clipPlane===this._clipPlanes[i])
		{
			this._clipPlanes[i].constant=constant;
			break;
		}else
			this._clipPlanes[i].constant=constant;
		
	}
}

baseScene.prototype.addClipControl = function(planeConstant=0,showHelpers=true){
	this._gui.clearControl();
		// gui
	var params = {
		clipIntersection: true,
		planeConstant: planeConstant,
		showHelpers: showHelpers
	};
	var clipPlanes=this._clipPlanes;
	this._helpers = new THREE.Group();
	var helpers=this._helpers;
	helpers.add( new THREE.AxesHelper( 20 ) );
	helpers.add( new THREE.PlaneHelper( clipPlanes[ 0 ], 50, 0xff0000 ) );
	helpers.add( new THREE.PlaneHelper( clipPlanes[ 1 ], 50, 0x00ff00 ) );
	helpers.add( new THREE.PlaneHelper( clipPlanes[ 2 ], 50, 0x0000ff ) );
	helpers.visible = true;
	this.scene.add( helpers );
	this._renderer.localClippingEnabled = true;
	var bs=this;
	this._sceneObjLst.forEach(function(so){
		bs.addObjClipPlanes(so,clipPlanes,true);
	});
	
	var gui=this._gui;
	gui.dat.add( params, 'clipIntersection' ).name( 'clip intersection' ).onChange( function ( value ) {

		var children = bs._sceneObjLst;

		for ( var i = 0; i < children.length; i ++ ) {

			bs.setClipPlaneIntersection(children[i],value);
		}

	} );

	gui.dat.add( params, 'planeConstant', - 16, 16 ).step( 1 ).name( 'plane constant' ).onChange( function ( value ) {

		for ( var j = 0; j < clipPlanes.length; j ++ ) {

			clipPlanes[ j ].constant = value;

		}

	} );

	gui.dat.add( params, 'showHelpers' ).name( 'show helpers' ).onChange( function ( value ) {

		helpers.visible = value;

	} );
}

baseScene.prototype.removeClipControl = function(){
	this._gui.clearControl();
	this._helpers.visible = false;
	this._renderer.localClippingEnabled = false;
	var bs=this;
	this._sceneObjLst.forEach(function(so){
		bs.removeObjClipPlanes(so,bs._clipPlanes);
	});
}

//添加操作控制
baseScene.prototype.ShowOperateControl=function(bShow){
	return this.operateUI.showAllControl(bShow);
	if(this._gui){
		this._gui.setVisible(bShow);
		return true;
	}else if(!defined(this._gui)&&!bShow)
	{
		return false;
	}
	//为场景添加界面
	this._gui = new GUICtrls({
		div : "control-panel",
		showControl : true,
	});
	//this._gui.clearControl();
	var gui=this._gui;
	var bs=this;
	var params={
		//controlMode:[0,1,2],
		get 'controlMode'() {
			for(var [k,v] of bs._control.controlList){
				if(bs.controls===v)
					return k;
			}			
			return null;

		},
		set 'controlMode'( value ) {

			bs.changeControlMode(Number(value));

		},
		click:true,
		alpha:1,
	}
	
	gui.dat.add( params, 'controlMode',{"正常模式":1,"飞行模式":2,"跟踪模式":3}).name( '操作模式' );
	gui.dat.add( params, 'click' ).name( '点击事件' ).onChange( function ( value ) {
		bs._bLeftClick=value;
	} );
	gui.dat.add( params, 'alpha' ,0, 1).step( 0.1 ).name( '透明度' ).onChange( function ( value ) {
		bs._sceneObjLst.forEach(function(so){
			bs.setModelAlphaColor(so,value);
		});
	} );
	//动画
	var bAddAnimation=false;
	for(var [k,v] of bs._objList){
		if (v.animations&&v.animations.length>0) {
			bAddAnimation=true;break;
		}
	}
	if(bAddAnimation){
		var animationFloder = gui.dat.addFolder( "动画");
		var animationParams= {
			loop: false,
			timescale: 1
		};
		animationFloder.add( animationParams, 'loop' ).name( '循环' ).onChange( function ( value ) {
			bs._objList.forEach(function(o){
				bs.playAnimations(o,value,9999);
			});
		});
		animationFloder.add( animationParams, 'timescale',0,5 ).name( '速度' ).onChange( function ( value ) {
			bs._objList.forEach(function(o){
				bs.playAnimations(o,true,9999,value);
			});
		});
	}
	//添加旋转
	// bs._sceneObjLst.forEach(function(so){
	// 	bs.addRotationObj(so,false);
	// });
	var rotationFolder = gui.dat.addFolder( "旋转控制");
	var rotationParams= {
		rotation:false,
		rotationSpeed:1
	};
	rotationFolder.add( rotationParams, 'rotation').name( '旋转' ).onChange( function ( value ) {
		bs._sceneObjLst.forEach(function(so){
			bs.setRotationObjState(so,value);
		});
	});
	rotationFolder.add( rotationParams, 'rotationSpeed',0.5,10).step(0.5).name( '旋转速度' ).onChange( function ( value ) {
		//设置该value为每分钟转多少圈
		var rad=value/60.0*Math.PI*2;
		bs._sceneObjLst.forEach(function(so){
			bs.setRotationObjState(so,true,rad);
		});
	});
	//添加巡游
	// bs._sceneObjLst.forEach(function(so){
	// 	bs.addRotationObj(so,false);
	// });
	var patrolFolder = gui.dat.addFolder( "巡游控制");
	var patrolParams= {
		bPatrol:false,
		rotationSpeed:1
	};
	patrolFolder.add( patrolParams, 'bPatrol').name( '巡游' ).onChange( function ( value ) {
		bs._selSceneObj=bs._selSceneObj||bs._sceneObjLst[0];
		bs.patrolObject(bs._selSceneObj,value);
	});
	patrolFolder.add( patrolParams, 'rotationSpeed',0.5,10).step(0.5).name( '巡游速度' ).onChange( function ( value ) {
		//设置该value为每分钟转多少圈
		var rad=value/60.0*Math.PI*2;
		bs.setPatrolState(true,rad);
	});



//裁剪面 begin
	var clipPlanes=this._clipPlanes;
	this._helpers = new THREE.Group();
	var helpers=this._helpers;
	helpers.add( new THREE.AxesHelper( 20 ) );
	// helpers.add(this._planeHelps[0]);
	// helpers.add(this._planeHelps[1]);
	// helpers.add(this._planeHelps[2]);
	helpers.visible = false;
	this.scene.add( helpers );
	this._renderer.localClippingEnabled = true;

	var clipFolder = gui.dat.addFolder( "剖面分析");
	var clipParams= {
		clipIntersection: true,
		planeConstant: 0,
		showHelpers: false
	};
	clipFolder.add( clipParams, 'clipIntersection' ).name( '相交裁剪' ).onChange( function ( value ) {

		var children = bs._sceneObjLst;

		for ( var i = 0; i < children.length; i ++ ) {

			bs.setClipPlaneIntersection(children[i],value);
		}

	} );
	clipFolder.add( clipParams, 'planeConstant', - 80, 80).step( 1 ).name( '裁剪面距离' ).onChange( function ( value ) {

		for ( var j = 0; j < clipPlanes.length; j ++ ) {

			clipPlanes[ j ].constant = value;

		}

	} );

	clipFolder.add( clipParams, 'showHelpers' ).name( '显示裁剪面' ).onChange( function ( value ) {

		helpers.visible = value;

	} );
	var clipPlaneFolder = clipFolder.addFolder( "裁剪面");
	var planeParams={
		YZ:false,
		XZ:false,
		XY:false
	}
	//避免裁剪失效，copy一下材质
	bs._objList.forEach(function(obj){
		if(!defined(obj.materials)) {
			obj.materials=new Set;
			bs.copyMaterials(obj.materials,obj.scene);
		}
	});
	clipPlaneFolder.add( planeParams, 'YZ' ).name( '竖切' ).onChange( function ( value ) {
		var x=[];
		x.push(clipPlanes[0]);
		if(value){
			bs._sceneObjLst.forEach(function(so){
				bs.addObjClipPlanes(so,x,true);
			});
			helpers.add(bs._planeHelps[0]);
		}else{
			bs._sceneObjLst.forEach(function(so){
				bs.removeObjClipPlanes(so,x);
			});
			helpers.remove(bs._planeHelps[0]);
		}
		
	} );
	clipPlaneFolder.add( planeParams, 'XZ' ).name( '平切' ).onChange( function ( value ) {
		var y=[];
		y.push(clipPlanes[1]);
		if(value){
			bs._sceneObjLst.forEach(function(so){
				bs.addObjClipPlanes(so,y,true);
			});
			helpers.add(bs._planeHelps[1]);
		}else{
			bs._sceneObjLst.forEach(function(so){
				bs.removeObjClipPlanes(so,y);
			});
			helpers.remove(bs._planeHelps[1]);
		}

	} );
	clipPlaneFolder.add( planeParams, 'XY' ).name( '横切' ).onChange( function ( value ) {
		var z=[];
		z.push(clipPlanes[2]);
		if(value){
			bs._sceneObjLst.forEach(function(so){
				bs.addObjClipPlanes(so,z,true);
			});
			helpers.add(bs._planeHelps[2]);
		}else{
			bs._sceneObjLst.forEach(function(so){
				bs.removeObjClipPlanes(so,z);
			});
			helpers.remove(bs._planeHelps[2]);
		}

	} );
//裁剪面 end
	//炸裂模型 begin
	var PongFolder = gui.dat.addFolder( "炸裂模式");
	var PongParams= {
		bingBong: false,
		vectX:2,
		vectY:2,
		vectZ:2,
		depth:5
	};
	bs._Pong={
		obj:undefined,
		Vector:new THREE.Vector3(2,2,2),
		depth:5
	};
	PongFolder.add( PongParams, 'depth',1,10 ).step(1).name( '拆解深度' ).onChange( function ( value ) {
		bs._Pong.depth=value;
	});

	var vectFolder=PongFolder.addFolder("拆解方向");
//因为存在节点深度问题，暂时不能实时改变位置
	vectFolder.add( PongParams, 'vectX',1,10 ).step(1).name( 'X方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);		
		bs._Pong.Vector.x=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
		//bs.bingBongChange(bs._Pong.obj,bs._Pong.Vector);
	});
	vectFolder.add( PongParams, 'vectY',1,10).step(1).name( 'Y方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);
		bs._Pong.Vector.y=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
		//bs.bingBongChange(bs._Pong.obj,bs._Pong.Vector);
	});
	vectFolder.add( PongParams, 'vectZ',1,10 ).step(1).name( 'Z方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);
		bs._Pong.Vector.z=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
	});	
	PongFolder.add( PongParams, 'bingBong').name( '拆解' ).onChange( function ( value ) {
		if(value){
			bs._Pong.obj=bs._selSceneObj;
			if(!defined(bs._Pong.obj)&&bs._sceneObjLst.length==1)bs._Pong.obj=bs._sceneObjLst[0];
			if(bs._Pong.obj)				
				bs.bingBong(bs._Pong.obj,bs._Pong.depth,bs._Pong.Vector);
			else{
				alert("请选择一个模型！");
				this.object[this.property]=!value;
			}
			
		}else{
			if(bs._Pong.obj)bs.bingBongRestore(bs._Pong.obj);
			bs._Pong.obj=undefined;
		}	
			
	});
	//炸裂模型 end
}


//释放Mesh内存
baseScene.prototype.dispose=function(obj){
	if(obj instanceof THREE.Mesh){
		//1、释放geometry
		obj.geometry.dispose();
		//2、释放material
		if (Array.isArray(obj.material)) {
			while(obj.material.length>0){
				var mat=obj.material.pop();
				//释放texture
				if(mat.map instanceof THREE.Texture)
				{
					mat.map.dispose();
				}
				mat.dispose();
			}				
		}else{
			var mat=obj.material;
				//释放texture
			if(mat.map instanceof THREE.Texture)
			{
				mat.map.dispose();
			}
			mat.dispose();
		}
	}else{
		var children=obj.children;
		for (var i = 0; i < children.length; i++) {
			var o=children[i];
			this.dispose(o);
		}
	}	
}


//屏幕坐标转世界坐标
baseScene.prototype.windowPos2worldPos = function(windowsPoint){
	coords=this.client2mouse(windowsPoint);
	var projectPos=new THREE.Vector3(coords.x,coords.y,0);
	projectPos.unproject( this.camera );
	return projectPos;
}

//注册事件
baseScene.prototype.addListener=function(type,func){
	if(!this._listener.has(type)){
		this._listener.set(type,func);
	}
}


//获取脚本编辑管理器
baseScene.prototype.getScriptManager=function(){
	if(!this.scriptManager)
	{
		this.scriptManager=new ScriptManager(this);
	}
	return this.scriptManager;
}