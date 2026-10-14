//对比场景

var base_scene;
var _webObject = {
};
var options={
	size:{
		width:1920,
		height:1024
	},                         //need
	background : {
		SceneBackgroundModel:SceneBackgroundModel.BOX,
		param : 'skybox',
	},
	lights:{
		ambient:{
			color:0x404040,
			intensity:4.65
		},
		// direction:{
		// 	color:0xffffff,
		// 	intensity:2,
		// 	position:new THREE.Vector3(0, 50, 0)
		// },
		// spot:{
		// 	color:0xffffff,
		// 	intensity:2,
		// 	position:new THREE.Vector3(0, 0, 100),  //This is set equal to Object3D.DefaultUp (0, 1, 0), so that the light shines from the top down.
		// 	distance:0.0,			//If non-zero, light will attenuate linearly from maximum intensity at the light's position down to zero at this distance from the light. Default is 0.0.
		// 	angle:0,		//Maximum extent of the spotlight, in radians, from its direction. Should be no more than Math.PI/2. The default is Math.PI/3.
		// 	penumbra:0.0,     //Percent of the spotlight cone that is attenuated due to penumbra. Takes values between zero and 1. The default is 0.0.                 
		// 	decay:1,		//The amount the light dims along the distance of the light.In physically correct mode, decay = 2 leads to physically realistic light falloff. The default is 1.
		// 	castShadow:false
		// }
	},
	camera:{                                   //option
		fov:75,
		//aspect:750/600,
		near:0.1,
		far:10000,
		initPos:new THREE.Vector3(0,50,100)
	},
	controls:{
		mode:1,
		//针对flycontrols
		moveSpeed:50, 
		maxMoveSpeed:100,
		rollSpeed:0.1,
		dragToLook:true,//
		autoForward:false,
		//other
		rotateSpeed:1,
		zoomSpeed : 1.2,
		panSpeed : 0.8,
		noZoom : false,
		noPan : false,
		staticMoving : true,
		dynamicDampingFactor : 0.3
	}
};

var scenes=[],renderer, container_src,container_new;
var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();
var rendererManager;
var processes;
var onProgress = function (xhr) {
	if (xhr.lengthComputable) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		processes.update(Math.round(percentComplete, 2) + "%", "正在下载模型...");
		// console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};

var onfinish = function () {
	processes.setVisible(false);
	var obj = _webObject.lastLoadObj;
	obj.state = _webObject.loadState.loadSuccess;
}

var onError = function (xhr) {
	var obj = _webObject.lastLoadObj;
	obj.state = _webObject.loadState.downloadError;
	_webObject.loadedMap.delete(obj.id+obj.sceneIndex);
	_webObject.curModel.delete(obj.sceneIndex);
	processes.update("出错", "下载模型失败,请检查网络！");
	setTimeout(function () {
		processes.setVisible(false);
	}, 3000);
};
function docMouse2containerMouse(pos){
	pos.x-=container.offsetLeft;
	pos.y-=container.offsetTop;
}
function onClick( event ) {

	event.preventDefault();
	// var pos=new THREE.Vector2(event.clientX,event.clientY);
	if(rendererManager.mouseState.bClick){
		var pos=new THREE.Vector2(event.offsetX,event.offsetY);
		if(event.target===rendererManager.renderObj._renderer.domElement){
			rendererManager.onLeftClick(pos);	
		}else{
			var dom=event.target;
			if(dom.className==="css2drenderDom"){
				pos.x+=dom.offsetLeft;
				pos.y+=dom.offsetTop;
				rendererManager.onLeftClick(pos);
			}
		}
	}

	
	//docMouse2containerMouse(pos);
	//rendererManager.onLeftClick(pos);	
}
function mouseDown(event) {

	event.preventDefault();
	// var pos=new THREE.Vector2(event.clientX,event.clientY);
	var pos = new THREE.Vector2(event.offsetX, event.offsetY);
	rendererManager.mouseState.lastPosition.x=pos.x;
	rendererManager.mouseState.lastPosition.y=pos.y;
	rendererManager.mouseState.bClick=true;
}
function mouseUp(event) {

	event.preventDefault();
	// var pos=new THREE.Vector2(event.clientX,event.clientY);
	var pos = new THREE.Vector2(event.offsetX, event.offsetY);
	rendererManager.mouseState.position.x=pos.x;
	rendererManager.mouseState.position.y=pos.y;
	var lastPos=rendererManager.mouseState.lastPosition;
	if(Math.abs(pos.x-lastPos.x)>5||Math.abs(pos.y-lastPos.y)>5)
	{
		rendererManager.mouseState.bClick=false;
	}
}


function onDocumentMouseMove( event ) {
	event.preventDefault();
	var pos=new THREE.Vector2(event.clientX,event.clientY);
	docMouse2containerMouse(pos);
	rendererManager.onMouseMove(pos);		

}
var onWindowResize= function() {
	rendererManager.onWindowResize(container.offsetLeft,container.offsetTop,container.offsetWidth, container.offsetHeight);
};

function animate() {
	rendererManager.render();
	requestAnimationFrame( animate );
}

function Processwindow(){
	var win = document.getElementById("process-window");
	if(!win){
		var html = '<div id = "process-window" class="Absolute-Center"><div id = "animition"><div id = "percent"> 30%</div><div id ="round-picture"></div></div><div id = "text" style="padding: 10px;">正在加载 拉森号 </div></div>';
		document.body.insertAdjacentHTML("beforeend", html);
		win = document.getElementById("process-window");
	}
	this.win = win;
	this.percent = document.getElementById("percent");
	this.text = document.getElementById("text");
	this.update = function(percent,text){
		this.percent.innerText = percent;
		if(text){
			this.text.innerText = text;
		}
		this.setVisible(true);
	};
	this.setVisible = function(bVisible){
		this.win.style.display = bVisible ? "" :"none";
	};
	this.setVisible(false);
}



function init3D(){

	container= document.getElementById("src-model-box");

	//添加render
	//0、渲染
	rendererManager=new rendererManager();
	var renderParams={
		width:container.clientWidth,
		height:container.clientHeight,
		antialias:true,
		postprocess:false,
		domElement:container,
	};
	var renderObj=rendererManager.addRender(renderParams);
	rendererManager.renderObj=renderObj;

	//构造一个scene
	options.size.left=container.clientLeft; 
	options.size.top=container.clientTop;
	options.size.width=container.clientWidth/2; 
	options.size.height=container.clientHeight;
	options.id="left";
	options.outline=false;
	var scene_left=renderObj.addBaseScene(options);
	scenes.push(scene_left);

	//再添加一个scene
	options.size.left=container.clientLeft+container.clientWidth/2; 
	options.size.top=container.clientTop;
	options.size.width=container.clientWidth/2; 
	options.size.height=container.clientHeight;
	options.id="right";
	options.outline=false;
	var scene_right=renderObj.addBaseScene(options);
	scenes.push(scene_right);

	renderObj.setDomElement(container);


	

	window.addEventListener( 'resize', onWindowResize, false );
	// $(container).on('click',onClick);
	// $($(container).children()[0]).on("click",onClick);
	$(container).on('click',onClick);
	$(container).on('mousemove',onDocumentMouseMove);
	$(container).on('mousedown', mouseDown);
	$(container).on('mouseup', mouseUp);


	//添加一个加载数据管理器
	var loadManager = new THREE.LoadingManager();
	loadManager.onProgress = function ( item, loaded, total ) {
		// console.log( item, loaded, total );
		var percent = Math.round( loaded / total * 100 , 2);
		if( percent==100 && total != 1 ){
			percent = 99;
			// processes.setVisible(false);
		}
		processes.update( percent +"%","正在加载模型...");
	};

	loadManager.onError = function ( item, loaded, total ) {
		processes.update( "出错","请联系管理员！");
		setTimeout(function(){
			processes.setVisible(false);
		},3000);
	};

	var loader = new THREE.GLTFLoader(loadManager);

	THREE.DRACOLoader.setDecoderPath( '/model3d/three/js/libs/draco/gltf/' );
	loader.setDRACOLoader( new THREE.DRACOLoader() );
	
	animate();

	//添加模型
	var url = "/model3d/data/model/f22-new/f22.gltf";

	var obj={
		url:url,
		id:"aliboke"
	}

	var loaded = false;
	// $(".t-info").click(function(){
	// 	if(!loaded){
	// 		scenes[0].addModel(loader,obj,onProgress,onError,onfinish);
	// 		scenes[0].enableOutline(true);
	// 	}
	// 	else
	// 		scenes[0].removeModel(obj.id);
	// 	loaded = !loaded;
	// });

	var show = true;
	$(".t-logo").click(function(){
		scenes[0].setModelVisible(obj.id,!show);
		show = !show;
	});

	//场景正在加载的模型集合，键是场景id，值是模型id
	_webObject.loadedMap = new Map();
	_webObject.curModel = new Map();
	_webObject.lastLoadObj = {};

	_webObject.create = function (sceneIndex, url, modelId) {
		var obj = {
			sceneIndex:sceneIndex,
			url: url,
			id: modelId
		}
		scenes[sceneIndex].addModel(loader, obj, onProgress, onError, onfinish);
		this.loadedMap.set(modelId + sceneIndex, true);
		_webObject.curModel.set(sceneIndex, modelId);
		_webObject.lastLoadObj = {
			sceneIndex:sceneIndex,
			id: modelId,
			state: _webObject.loadState.loading
		};
	}

	_webObject.remove = function (sceneIndex, modelId) {
		scenes[sceneIndex].removeModel(modelId);
		this.loadedMap.delete(modelId + sceneIndex, true);
		if (_webObject.curModel.get(sceneIndex) == modelId) {
			_webObject.curModel.delete(sceneIndex);
		}
	}

	_webObject.isLoad = function (sceneIndex, modelId) {
		return this.loadedMap.has(modelId + sceneIndex);
	}

	_webObject.setShow = function (sceneIndex, modelId, visible) {
		scenes[sceneIndex].setModelVisible(modelId, visible, true);
	}
	_webObject.showOperateCtrl = function (sceneIndex, visible) {
		// if(visible){
		// 	var obj ={
		// 		url:url,
		// 		id:"test"
		// 	}
		// 	scenes[sceneIndex].addModel(loader,obj,onProgress,onError,onfinish);
		// 	this.loadedMap.set("test"+sceneIndex,true);
		// 	_webObject.curModel.set(sceneIndex,"test");
		// }
		scenes[sceneIndex].ShowOperateControl(visible);

	}
	_webObject.showLabel=function(sceneIndex,modelId,nodeName,bShow,divDom,offset){
		var base_scene=scenes[sceneIndex];
		var labelManager=base_scene.labelManager;

		var model=base_scene.getModel(modelId);
		var node=model.getChildByName(nodeName);
		if(!defined(nodeName))return;
		var nodeWP=new THREE.Vector3();
		node.getWorldPosition(nodeWP);
		var offset=offset||new THREE.Vector3(0.4,0.4,0.5);
		var info=divDom||nodeName;
		labelManager.addInfoLabel(0,info,nodeWP,offset);

		// if(!defined(this.label)){
		// 	this.label=base_scene.addLabel();
		// }
		// if(!bShow) 
		// 	this.label.show(bShow);
		// else{
		// 	base_scene.clearClickLabel();
		// 	var pos=base_scene.getNodePositionByName(modelId,nodeName);
		// 	if(pos){
		// 		var model=base_scene.getModel(modelId);
		// 		var offset=new THREE.Vector3(15,15,0)
		// 		if(pos.x<model.position.x)offset.x=-15;
		// 		this.label.setPosition(pos,offset);
		// 		this.label.setContent(nodeName);
		// 		this.label.show(bShow)
		// 	}
		// }	

	}
	_webObject.hideAllLabel=function(sceneIndex){
		scenes[sceneIndex].labelManager.clearAllLabel()
	}
	_webObject.highlight=function(sceneIndex, modelId,nodeName,bNew=true){
		scenes[sceneIndex].highlight(modelId,nodeName,bNew);
	}
	_webObject.locateNode = function (sceneIndex, modelId, time, nodeName,bHighlight,cb) {
		scenes[sceneIndex].locateByName(modelId, time, nodeName,bHighlight,cb)
	}
	//播放节点动画
	/*
	sceneIndex：场景索引
	modelID：添加模型时给的模型ID
	node：节点名称/三维节点对象
	play：播放或者停止
	loop：播放次数
	*/
	_webObject.playNodeAction = function(sceneIndex,modelId,nodeName, startTime, endTime, play = true, loop = 2,timeIsFrameNums=false){
		var bs=scenes[sceneIndex];
		if(bs&&bs.animationCtrlMap.has(modelId)){
			var animationCtrl=bs.animationCtrlMap.get(modelId);
			animationCtrl.playNodeAction(nodeName,play,loop,startTime, endTime,timeIsFrameNums);
		}
		
	}
	_webObject.playAction = function (sceneIndex, modelId, actionName, startTime, endTime, play = true, loop = 2) {
		var bs = scenes[sceneIndex];
		if (bs && bs.animationCtrlMap.has(modelId)) {
			var animationCtrl = bs.animationCtrlMap.get(modelId);
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
	_webObject.addDrawObject = function (sceneIndex,modelId,meshName,drawID,drawOptions) {
		var baseScene=scenes[sceneIndex];
		var model=baseScene.getModel(modelId);
		if(model==null) return;
		var mesh=model.getChildByName(meshName);
		if(!mesh)mesh=model;
		var dM=baseScene.drawManager;
		if(dM){
			dM.addDrawObject(drawID,drawOptions.type,drawOptions.name,mesh,drawOptions);
		}
	}

	_webObject.removeDrawObject = function (sceneIndex,drawID) {
		var baseScene=scenes[sceneIndex];
		var dM=baseScene.drawManager;
		if(dM){
			dM.removeDrawObject(drawID);
		}
	}
	//dM.animateDraw(2,true,'scan',18)
	_webObject.animateDraw = function (sceneIndex,drawID,bPlay,type,duration) {
		var baseScene=scenes[sceneIndex];
		var dM=baseScene.drawManager;
		if(dM){
			dM.animateDraw(drawID,bPlay,type,duration);
		}
	}

	//type:回调类型 type:"click"
	_webObject.addBaseSceneCallBack = function (sceneIndex,type,cb) {
		scenes[sceneIndex].addCallBack(type,cb);
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
	_webObject.addBaseSceneListener = function (sceneIndex,type,func) {
		scenes[sceneIndex].addListener(type,func);
	}
	_webObject.loadState = {
		loading: 0,
		loadSuccess: 1,
		downloadError: 2,
		loadError: 3,
	}
}


$(document).ready(function(){
	$(function(){

		//初始化进度条框
		processes = new Processwindow();
		//初始化三维
		init3D();
	});
});



function BGManager(scenes){
	this.scenes = scenes;
	this.collection = new Map();
	this.init = function(){
		for (var i = 0; i < scenes.length; i++) {
			var manager = this.createBgParams(scenes[i]);
			manager.setVisible(false);
			this.collection.set(scenes[i],manager);

		}
	};
	this.update = function(){
		var me =this;
		this.collection.forEach(function(value,key){
			if(value.type == key.sceneBackground.backGroundType){
				return;
			}
			value.dispose();
			value = me.createBgParams(key);
			me.collection.set(key,value);
		});
	};
	this.createBgParams = function(scene){
		var bgObject = scene.sceneBackground;
		var sceneBackgroundModel = scene.sceneBackground.backGroundType;
		var params,items;
		var name = scene.id;
		var gui = new GUICtrls({
			div : "background-setting-panel",
			showControl : false,
		});

		gui.type = sceneBackgroundModel;
		var ambientLight = scene.lightCollection.AmbientLight;
		gui.dat.add(ambientLight,"intensity",0,10,"场景亮度").step( 0.05 ).onChange( function( value ) { 
			
		} );

		switch(sceneBackgroundModel){
			case SceneBackgroundModel.WATER:
				params = bgObject.waterParams;
				gui.dat.add(params,"waterSize",1,10,"水面大小").step( 1 ).onChange( function( value ) { 
					bgObject.updateWaterSceneParam();
				} );
				gui.dat.add(params,"waterAlpha",0.7,1,"水透明度").step( 0.01 ).onChange( function( value ) { 
					bgObject.updateWaterSceneParam();
				} );
				// gui.dat.add(params,"waterDistortionScale",1,10,"再议").step( 0.1 ).onChange( function( value ) { 
				// 	bgObject.updateWaterSceneParam();
				// } );
				gui.dat.add(params,"skyInclination",0,0.5,"太阳高度角").step( 0.01 ).onChange( function( value ) { 
					bgObject.updateWaterSceneParam();
				} );
				gui.dat.add(params,"skyAzimuth",0,1,"太阳水平角").step( 0.01 ).onChange( function( value ) {  
					bgObject.updateWaterSceneParam();
				} );

				// gui.dat.add(params,"distance",400,2000,"太阳距离").step( 10 ).onChange( function( value ) { 
				// 	bgObject.updateWaterSceneParam();
				// } );
				break;
			case SceneBackgroundModel.OCEAN:
				params = bgObject.ocean2Params;
				gui.dat.add(params,"oceanSize",100,10000,"海面大小").step( 10 ).onChange( function( value ) {  
					bgObject.updateOcean2Params();
				} );
				gui.dat.add(params,"oceanWind",-15, 15,"波浪大小").step( 1 ).onChange( function( value ) {  
					bgObject.updateOcean2Params();
				} );
				gui.dat.add(params,"choppiness",0.1,4,"波纹精细度").step( 0.1 ).onChange( function( value ) {
					bgObject.updateOcean2Params();  
				} );
				gui.dat.add(params,"geometrySize",1,10000,"水面大小").step( 1 ).onChange( function( value ) {  
					bgObject.updateOcean2Params();
				} );
				gui.dat.add(params,"exposure",0,0.5,"材质亮度").step( 0.01 ).onChange( function( value ) {  
					bgObject.updateOcean2Params();
				} );
				// gui.dat.addColor(params,"ocean_color","海水颜色").onChange( function( value ) {  
					
				// } );
				break;
			case SceneBackgroundModel.SKY:
				params = bgObject.skyParams;
				gui.dat.add(params,"turbidity",1,20,"turbidity").step( 0.1 ).onChange( function( value ) { 
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"rayleigh",0,4,"rayleigh").step( 0.01 ).onChange( function( value ) { 
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"mieCoefficient",0,0.1,"mieCoefficient").step( 0.001 ).onChange( function( value ) {  
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"mieDirectionalG",0,1,"mieDirectionalG").step( 0.001 ).onChange( function( value ) { 
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"luminance",0,2,"luminance").step( 0.0001 ).onChange( function( value ) { 
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"inclination",0,1,"inclination").step( 0.0001 ).onChange( function( value ) {  
					bgObject.updateSkyParam();
				} );
				gui.dat.add(params,"azimuth",0,1,"azimuth").step( 0.0001 ).onChange( function( value ) {  
					bgObject.updateSkyParam();
				} );
				break;
		}
		gui.showTogge(false);

		return gui;
	}
	this.showMenu = function(id=undefined,visible=false){
		if(!defined(id)){
			if(this.scenes.length==1)
				this.collection.values().next().value.setVisible(visible);
		}
		else{
			this.collection.forEach(function(value){
				value.setVisible(visible);
			});
		}
	}

	this.toggleShow = function(id=undefined){
		if(!defined(id)){
			if(this.scenes.length==1)
				this.collection.values().next().value.toggleShow();
		}
		else{
			this.collection.forEach(function(value){
				value.toggleShow();
			});
		}
	}

	this.init();
}

function GUICtrls(params){
	this._params = params;
	var parent = defaultValue(params.div,"data-gui-panel");
	var showTogge = defaultValue(params.showControl,true);

	this.domElement = document.getElementById(parent);
	this.dat =  new dat.GUI(/*{parent:document.getElementById("data-gui-panel")}*/{
		closeOnTop: false,
		hideable:true,
		autoPlace:false,
	});
	this.showTogge =function(showTogge){
		var display = showTogge?"":"none";
		$(".close-button.close-bottom").css("display",display);
	};
	if(!showTogge){
		this.showTogge(false);
	}
	this.domElement.appendChild(this.dat.domElement);

	this.controlers = dat.__controllers;
	this.dispose = function(){
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
	this.setVisible=function(visible){
		this.dat.domElement.style.display = visible?"":"none";
	};
	this.toggleShow=function(){
		var bShow = this.dat.domElement.style.display;
		this.dat.domElement.style.display = bShow == "none"?"":"none";
	};
	this.clearControl=function(){
		for (var i = this.dat.__controllers.length-1;i>=0; i--) {
			var cl=this.dat.__controllers[i];
			this.dat.remove(cl);
		}
	};

}


// 界面操作--背景改变按钮事件，界面背景参数配置
var bgManager;
// $(function(){
// 	bgManager = new BGManager(scenes);
	

// 	// var header = `<li class="layui-this"><i class="iconfont fa fa-list-ul"></i>&nbsp;${name}</li>`;
// 	// var content = `<div class="layui-tab-item layui-show">
// 	// 			    	${items}
// 	// 			   </div>
// 	// 			   <div class="layui-tab-item">
// 	// 			    	我是保留区域<hr/>武器范围
// 	// 			   </div>`;

// 	// var showBgMenu = false;
// 	$("#background-changed").on("change",function(e){
// 		var bg = parseInt($(e.target).children(":selected").attr("value"));
// 		if(scenes.length<1 || !defined(bg)){
// 			return;
// 		}
// 		for (var i = 0; i < scenes.length; i++) {
// 			var scene = scenes[i];
// 			scene.sceneBackground.changedBG(bg);
// 			bgManager.update();
// 			bgManager.showMenu(scene,false);
// 		}


// 	});

// 	$("#background-setting-button").on("click",function(){
// 	    // var display = $("#background-setting-panel").css("display");
// 	    // display = display == "block" ? "none" : "block";
// 	    // $("#background-setting-panel").css("display",display);
// 	    bgManager.toggleShow();
// 	});
// })