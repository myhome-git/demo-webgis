


function ModelManager(baseScene) {
	BeyonManager.call(this);

	this._baseScene=baseScene;
	this.camera=baseScene.camera;
	this._objLoader=new THREE.OBJLoader(baseScene.loadManager);
	this._gltfLoader=new THREE.GLTFLoader(baseScene.loadManager);
	//相对与html文件的路径
	THREE.DRACOLoader.setDecoderPath( '../../../js/libs/draco/gltf/' );
	this._gltfLoader.setDRACOLoader( new THREE.DRACOLoader() );

	this._loader={
		gltf:this._gltfLoader,
		obj:this._objLoader,
	}
	var scope=this;
	loadJs(["/model3d/three/js/libs/inflate.min.js","/model3d/three/js/loaders/FBXLoader.js"],"FBXLoader_script",function(){
		scope._loader.fbx=new THREE.FBXLoader(baseScene.loadManager);
	});
	this._selectObj=undefined;

	this._rotationList=new Map;
//高亮的mesh列表
	this._highLights=[];

	//清理资源列表
	this.clears=new Map;

	//一个scene目前只显示一个模型
	this.currentShowModel=undefined;

	this.getModel=function(id){
		//如果参数为id，则使用这个id进行获取模型，否则直接获取当前加载的模型
		if(!id){
			id = this.__modelId;
		}
		if(!this.has(id)) return null;
		return this.getObject(id).scene;
	};

	this.castShadow=baseScene.castShadow;
}

//原型继承
ModelManager.prototype = new BeyonManager();
//将自身指针指向自己的构造函数
ModelManager.prototype.constructor = ModelManager;

//巡视更新参数
ModelManager.prototype.patrolUpdate=function(delta){
	//相机巡游物件
	if(this.patrolEntity&&this.patrolEntity.bPatrol){
		//this.camera.lookAt(this.patrolEntity.model);
		var camCurPos=this.camera.position.clone();
		var speed=this.patrolEntity.patrolSpeed;
		const model=this.patrolEntity.model.scene;
		var baseScene=this._baseScene;
		//如果有展示信息则判断一下挂接的节点离相机距离
		if(this.patrolEntity.infoList.length>0){
			var infoList=this.patrolEntity.infoList;
			var currentInfoNode=undefined;
			var currentInfo=undefined;
			var minDisObj=undefined;
			
			var disCenter=new THREE.Vector3().subVectors(camCurPos,model.position).length();
			var minDis=model.boundingSphere.radius+disCenter;
			var nodePos=new THREE.Vector3();
			var minIndex=0;
			for(var i=0;i<infoList.length;i++){
				var info=infoList[i];
				if(info.show)currentInfo=info;
				var node=model.getObjectByName(info.nodeName);
				if(node&&node!=currentInfoNode){
					var node_bs=new THREE.Sphere();
					if(node instanceof THREE.Mesh){
						if(!node.geometry.boundingSphere){
							node.geometry.computeBoundingSphere();
						}						
						node_bs=node.geometry.boundingSphere.clone();
						node_bs.applyMatrix4(node.matrixWorld);
					}else{
						node_bs.copy(this.calculateBoundingSphere(node));
					}					
					
					//node.getWorldPosition(pos);
					var nodeDis=new THREE.Vector3().subVectors(camCurPos,node_bs.center).length();
					if(minDis>nodeDis){
						minDis=nodeDis;
						minDisObj=node;
						minIndex=i;
						currentInfoNode=node;
						nodePos.copy(node_bs.center);
					}
				}
			}
			//得到需要展示的信息节点
			var nextInfo=infoList[minIndex];
			//当前展示的与需要展示的相同，不做什么
			if(!nextInfo.show){
				//if(currentInfo)currentInfo.show=false;
				//弹信息标牌
				var nodeBoundingSphere=this.calculateBoundingSphere(currentInfoNode);
				var node_modelVec=new THREE.Vector3().subVectors(nodePos,model.position);
				var camera_modelVec=new THREE.Vector3().subVectors(camCurPos,model.position);
				var side=node_modelVec.dot(camera_modelVec);
				var labelVec=new THREE.Vector3().crossVectors(node_modelVec,camera_modelVec);
				if(side<0)labelVec.multiplyScalar(-1);
				labelVec.normalize();
				labelVec.multiplyScalar(model.boundingSphere.radius/4);
				var scope=this;
				if(currentInfo&&currentInfo.time&&currentInfo.time<2){
					baseScene.labelManager.addPopLabel(nextInfo.nodeName,nextInfo.info,nodePos,labelVec,new THREE.Matrix4(),1500,false,function(){
						nextInfo.time=0;
						scope.setObjectAlphaColor(scope.patrolEntity.model.id,0.2,new THREE.Color(0x84c98),undefined,undefined,[currentInfoNode]);
						nextInfo.alphaEffect=true;
					});
				}else{
					baseScene.labelManager.addPopLabel(nextInfo.nodeName,nextInfo.info,nodePos,labelVec,new THREE.Matrix4(),1500,true,function(){
						nextInfo.time=0;
						scope.setObjectAlphaColor(scope.patrolEntity.model.id,0.2,new THREE.Color(0x84c98),undefined,undefined,[currentInfoNode]);
						nextInfo.alphaEffect=true;
						
					});
				}
				if(currentInfo)currentInfo.show=false;
				//节点闪烁
				if(!defined(baseScene._outlinePass)){
					baseScene.enableOutline(true);
				}
				baseScene._selectedMeshes=[];
				baseScene._selectedMeshes.push(currentInfoNode);
				baseScene._postprocess=true;
				baseScene._outlinePass.selectedObjects=baseScene._selectedMeshes;	
				nextInfo.show=true;
				
				currentInfo=nextInfo
			}else{
				nextInfo.time+=delta;
				if(nextInfo.alphaEffect&&nextInfo.time>1.5){
					this.restoreObjectAlphaColor(this.patrolEntity.model.id);
					nextInfo.alphaEffect=false;
				}
			}



		}
		//需要转动的弧度
		speed*=delta;
		var curVec2=new THREE.Vector2(camCurPos.x,camCurPos.z);

		var nextVec2=new THREE.Vector2();

		var radius=curVec2.length();

		var vecLen=radius*Math.sin(speed/2)*2;

		var x_unit=new THREE.Vector2(1,0);
		var curPosUint=curVec2.clone().normalize();

		//外积
		var crossRs=x_unit.cross(curPosUint)

		//内积
		var dotRs=x_unit.dot(curPosUint)

		var angle=Math.acos(dotRs);
		//计算当前真实角度
		if(crossRs<0){
			angle=Math.PI*2-angle;
			if(curPosUint.x==1.0){
				angle=0;
			}
		}			

		//方向向量
		var vAngle=angle+Math.PI/2+speed/2;
		if(vAngle>=Math.PI*2)vAngle-=Math.PI*2;
		var vVec=new THREE.Vector2(Math.cos(vAngle),Math.sin(vAngle));
		vVec.multiplyScalar(vecLen);
		nextVec2.addVectors(curVec2,vVec);
		this.camera.position.x=nextVec2.x;
		this.camera.position.z=nextVec2.y;

		//同时控制器目标应该是模型中心,
		baseScene.controls.target.copy(model.position);
	}
}

//每帧更新参数
ModelManager.prototype.update = function(delta) {
	var baseScene=this._baseScene;
	//自动旋转

	this._rotationList.forEach(function(ro){
		var o3d=ro.o3d;//object3d;
		var rVect=ro.rotationAxies;//旋转方向；
		var rRad=ro.rollSpeed;  //单位每秒旋转弧度
		rRad*=delta;
		if(o3d instanceof THREE.Object3D&&ro.bRotation){
			o3d.rotateOnAxis(rVect,rRad);
		}
	});	

	//相机巡游物件
	this.patrolUpdate(delta);
	/*
	//第一人称漫游
	if(this.visitMode){
		var camera=baseScene.camera;
		var camPos=new THREE.Vector3();
		var camVec=new THREE.Vector3();
		function updateCamera(){
			camera.updateMatrixWorld();
			camera.getWorldPosition(camPos);
			camera.getWorldDirection(camVec);
		}
		updateCamera();
		//创建前后左右下  5条射线
		var flyCtrl=baseScene.controls;
		//向下发射，自动调整相机高度
		var downVec=new THREE.Vector3(0,-1,0);
		//downVec=camera.localToWorld(downVec);
		var downRaycaster = new THREE.Raycaster(camPos,downVec,0,1.6);
		var intersects = downRaycaster.intersectObjects(this.currentShowModel.scene.children,true);
		if(intersects[0]){
			camPos.y+=1.6-intersects[0].distance;
			camera.worldToLocal(camPos);
			camera.position.copy(camPos);
			updateCamera();
			bAdjust=false;
		}else{
			camPos.y-=1;
			camera.worldToLocal(camPos);
			camera.position.copy(camPos);
			updateCamera();
		}
		//前
		intersects=[];
		var forwardRaycaster = new THREE.Raycaster(camPos,camVec,0,0.2);
		intersects = forwardRaycaster.intersectObjects(this.currentShowModel.scene.children,true);
		if(intersects[0]){
			//不能往前移动
			flyCtrl.moveState.forward=0;
		}
		//后
		intersects=[];
		var backVec=camVec.clone();
		var backRaycaster = new THREE.Raycaster(camPos,backVec.negate(),0,0.2);
		intersects = backRaycaster.intersectObjects(this.currentShowModel.scene.children,true);
		if(intersects[0]){
			//不能往后移动
			flyCtrl.moveState.back=0;
		}
		//右
		intersects=[];
		var rightVec=new THREE.Vector3(1,0,0);
		camera.localToWorld(rightVec);		
		var rightRaycaster = new THREE.Raycaster(camPos,rightVec,0,0.2);
		intersects = rightRaycaster.intersectObjects(this.currentShowModel.scene.children,true);
		if(intersects[0]){
			//不能往后移动
			flyCtrl.moveState.right=0;
		}
		//左
		intersects=[];
		var leftVec=new THREE.Vector3(1,0,0);
		camera.localToWorld(leftVec);		
		var leftRaycaster = new THREE.Raycaster(camPos,leftVec,0,0.2);
		intersects = leftRaycaster.intersectObjects(this.currentShowModel.scene.children,true);
		if(intersects[0]){
			//不能往后移动
			flyCtrl.moveState.left=0;
		}
	}
	*/
}

ModelManager.prototype._getLoader = function(modelFormat) {
	var ext=modelFormat.toLowerCase();
	if(ext==="gltf"||ext==="glb"){
		return this._loader.gltf;
	}else if(ext==="obj"){
		return this._loader.obj;
	}else if(ext==="fbx"){
		return this._loader.fbx;
	}
}
function getExtension(url){
	return url.substring(url.lastIndexOf('.')+1);
}
// 添加一个模型
ModelManager.prototype.addModel = function(obj,initEffectParams,onProgress,onFinish,onError){
	
	var _this = this;
	
	if (!defined(obj.url))return undefined;
	
	//替换\为/
	obj.url.replace(/\?/g,"/");
	//将URL转绝对路径
	if(obj.url.indexOf('http')!=0&&origin.indexOf('http')===0){
		obj.url=origin+obj.url;		
	}
	var scope=this;	
	if(scope.has(obj.id))return scope.getObject(obj.id);
	var loader=scope._getLoader(getExtension(obj.url));
	if(!defined(loader))return undefined;	
	var baseScene=scope._baseScene;
	
	loader.load(obj.url, function( data ) {		
		if(loader instanceof THREE.GLTFLoader){
			obj.scene=data.scene;
		}else{
			obj.scene=data;
		}	

		_this.__modelId  = obj.id;
		//scope.reSetModelScale(obj.scene);			
		if (data.animations && data.animations.length) {
			
			if(!baseScene.animationCtrlMap.has(obj.id)){
				var ac=new animationCtrl(obj.scene);								
				baseScene.animationCtrlMap.set(obj.id,ac);
				scope.clears.set(obj.id,baseScene.animationCtrlMap);
			}
			for ( var i = 0; i < data.animations.length; i ++ ) {
				var animation = data.animations[ i ];
				ac.addAnimationClip(animation);
			}
		}
		var initParams=initEffectParams||{};
		
		//产生阴影
		if(scope.castShadow){
			scope.setMeshShadow(obj.scene,true,true);
		}

		//设置模型材质效果
		if(initParams.materialEffect){
			scope.setModelMaterialEffect(obj.scene,initParams.materialEffect);
		}

		//切换背景
		if(defined(initParams.backGroundType)){
			scope._baseScene.sceneBackground.changedBG(initParams.backGroundType);
			bgManager.update();
		}

			//更换模型时恢复视角
		if(!baseScene.oldCameraRotation){
			baseScene.oldCameraRotation=baseScene.camera.rotation.clone();
		}else{
			//切换到oritcontrol
			baseScene.changeControlMode(1);
			baseScene.controls.reset();
			baseScene.camera.rotation.copy(baseScene.oldCameraRotation);		
		}
		
		//根据模型大小设置相机视角
		obj.scene.boundingSphere=new THREE.Sphere(obj.scene.position.clone(),0.0);
		var bs=obj.scene.boundingSphere.copy(scope.calculateBoundingSphere(obj.scene));
		var pos=new THREE.Vector3();
		baseScene.camera.position.copy(obj.scene.getWorldPosition(pos));
		baseScene.camera.position.y+=(bs.radius+9)*Math.sin(Math.PI/4);
		baseScene.camera.position.z+=(bs.radius+10)*Math.cos(Math.PI/4);
		
		//设置初始位置
		var initPos=initParams.position;
		if(initPos){
//			obj.scene.position.copy(initPos);
			baseScene.camera.position.copy(initPos);
		}
			
		obj.baseScene=baseScene;
		scope.add(obj.id,obj);
		baseScene.scene.add(obj.scene);
		scope.currentShowModel=obj;

		


		//处理一些模型透明纹理丢失问题
		if(initParams.transparentNode){
			const transparentNode=initParams.transparentNode;
			scope.setObjectAlphaColor(obj.id,transparentNode.transparent?transparentNode.transparent:0.2,
										undefined,undefined,transparentNode.nodes,undefined,false);
		}
		//baseScene.operateUI.bInitCurentUI=false;

		//obj添加释放函数
		obj.removeSelf=function(){
			function disposeScene(o3d){
				if(o3d instanceof THREE.Mesh){
					//1、释放geometry
					o3d.geometry.dispose();
					//2、释放material
					if (Array.isArray(o3d.material)) {
						while(o3d.material.length>0){
							var mat=o3d.material.pop();
							//释放texture
							if(mat.map instanceof THREE.Texture)
							{
								mat.map.dispose();
							}
							mat.dispose();
						}				
					}else{
						var mat=o3d.material;
							//释放texture
						if(mat.map instanceof THREE.Texture)
						{
							mat.map.dispose();
						}
						mat.dispose();
					}
				}else{
					var children=o3d.children;
					for (var i = 0; i < children.length; i++) {
						var o=children[i];
						disposeScene(o);
					}
				}
			}
			disposeScene(this.scene);
			
			if(this.modelInfo){
				this.modelInfo=[];
			}
			if(this.baseScene)
				this.baseScene=undefined;
			if(this.nodeNameMap)
				this.nodeNameMap.clear();	
		}

		//从文件中请求配置信息

		var dataUrl=obj.url.substring(0,obj.url.lastIndexOf('.'))+"_info.json";

		scope.loadModelInfo(obj,dataUrl,onFinish);
		
	},onProgress,onError);
}

// 移除一个模型
ModelManager.prototype.removeModel = function(id,onFinish,onError){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	var model=obj.scene;
	this._baseScene.scene.remove(model);
	//处理相关资源
	if(this.clears.has(obj.id)){
		var clear=this.clears.get(obj.id);
		if(clear instanceof Function){
			clear(obj);
		}else if(clear instanceof Map){
			var clearObj=clear.get(obj.id);
			clearObj.dispose(obj);
			clearObj=undefined;
			clear.delete(obj.id);
		}else if(clear instanceof Object){
			clear.dispose(obj);
			clear=undefined;
		}
	}
	if(this.currentShowModel===obj)
		this.currentShowModel=undefined;	
	this.remove(obj.id);	
	model=undefined;
}
// 设置模型节点中文名称
ModelManager.prototype.setModelNodeProperty=function(id,PropertyArray){
	if(!this.has(id)){
		return;
	}
	var modelObj = this.getObject(id);
	//处理一下PropertyArray
	modelObj.nodeNameMap=new Map();
	for(var i=0;i<PropertyArray.length;i++){
		modelObj.nodeNameMap.set(PropertyArray[i].src,PropertyArray[i].new);
	}
}
// 模型、节点显影
ModelManager.prototype.showModel = function(id,bShow,nodeNames=undefined){
	var obj=this.getObject(id);
	if(!obj)return false;
	if(nodeNames&&nodeNames.length>0){
		for (var i = 0; i < nodeNames.length; i++) {
			var nodeName = nodeNames[i];
			var node=obj.scene.getObjectByName(nodeName);
			node.visible = bShow;
		}
	}else{
		obj.scene.visible = bShow;
	}
	
}



ModelManager.prototype.setModelMaterialEffect =function(model,materialParams){
	if (model instanceof THREE.Mesh){
		if ( Array.isArray( model.material)) {
			for (var j = 0; j < model.material.length; j++) {
				var mat=model.material[j];
				//修改材质中支持的参数
				for ( var property in materialParams) {
					if(defined(mat[property])){
						mat[property]=materialParams[property];
					}					
	
				}
			}				
		}else{
			//修改材质中支持的参数
			for ( var property in materialParams) {
				if(defined(model.material[property])){
					model.material[property]=materialParams[property];
				}					

			}
		}
	}else{
		var children=model.children;
		for (var i = 0; i < children.length; i++) {
			var o=children[i];
			this.setModelMaterialEffect(o,materialParams);
		}
	}	
	//修改材质的渲染模式为sRGB
	const encoding = materialParams.textureEncoding === 'sRGB'? THREE.sRGBEncoding: THREE.LinearEncoding;
 	 traverseMaterials(model, (material) => {
		if (material.map) material.map.encoding = encoding;
		if (material.emissiveMap) material.emissiveMap.encoding = encoding;
		if (material.map || material.emissiveMap) material.needsUpdate = true;
 	 });

}

function traverseMaterials (object, callback) {
	object.traverse((node) => {
	  if (!node.isMesh) return;
	  const materials = Array.isArray(node.material)
		? node.material
		: [node.material];
	  materials.forEach(callback);
	});
  }

//s1 合并s2
function combineSpere(s1,s2){

	var c1=s1.center,c2=s2.center;
	var r1=s1.radius,r2=s2.radius;
	var dis=c1.distanceTo(c2);
	if(dis<r1||dis<r2){
		if (r1<r2) 	s1.copy(s2);
	}else{
		var direction=new THREE.Vector3().subVectors(c2,c1).normalize();
		s1.center=new THREE.Vector3().addVectors(c1,direction.multiplyScalar((r1+r2+dis)/2-r1));
		s1.radius=(r1+r2+dis)/2;
	}
}
// obj必须是Object3D
ModelManager.prototype.calculateBoundingSphere=function(obj){
	if (!(obj instanceof THREE.Object3D)) return undefined;
	var bs=new THREE.Sphere(obj.position.clone(),0.0);
	obj.getWorldPosition(bs.center);

	if (obj instanceof THREE.Mesh) {
		if(!defined(obj.geometry.boundingSphere)){
			obj.geometry.computeBoundingSphere();
		}
		var matrixWorld = obj.matrixWorld;		
		bs.copy(obj.geometry.boundingSphere);
		bs.applyMatrix4( matrixWorld );
		//取世界坐标
		//bs.center=obj.localToWorld(bs.center);
	}else{
		var children = obj.children;
		for ( var i = 0, l = children.length; i < l; i ++ ) {
			var s=this.calculateBoundingSphere(children[i]);
			if(i==0){
				bs.copy(s);
			}else
				combineSpere(bs,s);
		}
	}
	return bs;
}

//内部调用 将obj中所有mesh push进meshArray
ModelManager.prototype._getMeshArray=function(meshArray,obj){
	if(obj instanceof THREE.Mesh){
		meshArray.push(obj);
	}else{
		var children=obj.children;
		for(var i=0;i<children.length;i++){
			this._getMeshArray(meshArray,children[i]);
		}
	}
}


ModelManager.prototype.setMeshShadow=function(o3d,castShadow,receiveShadow){
	if(o3d instanceof THREE.Mesh){
		var matNeedUpdate=false;
		if(castShadow!=o3d.castShadow){
			matNeedUpdate=true;
			o3d.castShadow = castShadow;
		}			
		if(receiveShadow!=o3d.receiveShadow){
			o3d.receiveShadow = receiveShadow;
			matNeedUpdate=true;
		}
		if ( Array.isArray( o3d.material)) {
			for (var j = 0; j < o3d.material.length; j++) {
				var mat=o3d.material[j];
				mat.needsUpdate=matNeedUpdate;				
			}				
		}else{
			o3d.material.needsUpdate=matNeedUpdate;				
		}
	}else{
		var children=o3d.children;
		for(var i=0;i<children.length;i++){
			this.setMeshShadow(children[i],castShadow,receiveShadow);
		}
	}
}

//重置一下geometry的scale
ModelManager.prototype.reSetModelScale=function(o3d,parentScale=new THREE.Vector3(1,1,1)){
	if(o3d instanceof THREE.Mesh){
		if(o3d.name==="A_舱室11")
		{
			console.dir(o3d);
		}
		var position = o3d.geometry.attributes.position;
		var scale=o3d.scale;
		scale.multiply(parentScale);
		if(Math.abs(scale.x-1)<0.0001&&Math.abs(scale.y-1)<0.0001&&Math.abs(scale.z-1)<0.0001)return;
		var vector=new THREE.Vector3();
		for ( var i = 0, il = position.count; i < il; i ++ ) {
			vector.x = position.getX( i );
			position.setX(i,vector.x*scale.x);
			vector.y = position.getY( i );
			position.setY(i,vector.y*scale.y);
			vector.z = position.getZ( i );
			position.setZ(i,vector.z*scale.z);
		}
		o3d.scale.set(1,1,1);
	}else{
		var children=o3d.children;
		var pScale=o3d.scale.clone();
		for(var i=0;i<children.length;i++){
			var selfScale=pScale.clone();
			selfScale.multiply(parentScale);
			this.reSetModelScale(children[i],selfScale);
		}
		o3d.scale.set(1,1,1);
	}
}


ModelManager.prototype._setMeshOutLine=function(obj,bNew=true){
	if(bNew) this._highLights=[];
	//开启场景postprocess模式
	var baseScene=this._baseScene;
	baseScene._postprocess=true;
	if(!defined(baseScene._outlinePass)){
		baseScene.enableOutline(true);
	}
	this._getMeshArray(this._highLights,obj);
	baseScene._outlinePass.selectedObjects=this._highLights;
}

//内部调用 设置mesh边框高亮 ，bNew是否重新创建高亮列表
ModelManager.prototype._setMeshOutLine=function(obj,bNew=true){
	if(bNew) this._highLights=[];
	//开启场景postprocess模式
	var baseScene=this._baseScene;
	baseScene._postprocess=true;
	if(!defined(baseScene._outlinePass)){
		baseScene.enableOutline(true);
	}
	this._getMeshArray(this._highLights,obj);
	baseScene._outlinePass.selectedObjects=this._highLights;
}
ModelManager.prototype.highlight=function(id,nodeName,bNew=true){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	var sceneObj=obj.scene;
	var scope=this;
	if (Array.isArray(nodeName)) {
		if(bNew) this._highLights=[];
		nodeName.forEach(function(name){
			var meshObj=sceneObj.getObjectByName(name);
			if(meshObj)scope._setMeshOutLine(meshObj,false);
		});		
	}else{
		var meshObj=sceneObj.getObjectByName(mesh);
		if(meshObj)scope._setMeshOutLine(meshObj,bNew);
	}	
}
ModelManager.prototype.clearHighlight=function(){
	this._highLights=[];
	var baseScene=this._baseScene;
	if(defined(baseScene._outlinePass)){
		baseScene._outlinePass.selectedObjects=[];
		baseScene.enableOutline(false);
	}	
}

//定位
ModelManager.prototype.locateNode=function(node,duration=3000,highlight=true,callback=undefined){
	var sceneObj=this.getObj3dFromNode(node);
	var baseScene=this._baseScene;
	if(baseScene.controls instanceof THREE.OrbitControls){
		this.Orbitlocate(sceneObj,node,{duration:duration,highlight:highlight,cb:callback});
	}else
		this.locate(node,undefined,{duration:duration,highlight:highlight,cb:callback});
}
//定位
//支持节点-暂时必须节点--旧方法
ModelManager.prototype.locateByName = function(id,nodeName,duration=3000,highlight=true,callback=undefined){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	var sceneObj=obj.scene;
	var locateNode;
	if (nodeName) {
		locateNode=sceneObj.getObjectByName(nodeName);
		_webObject.currentSelectedNode = locateNode
	}
	if(!defined(locateNode))	{
		var errorINfo='节点为空或者指定模型找不到节点！'
		return errorINfo;
	}
	var baseScene=this._baseScene;
	if(baseScene.controls instanceof THREE.OrbitControls){
		this.Orbitlocate(sceneObj,locateNode,{duration:duration,highlight:highlight,cb:callback});
	}else
		this.locate(locateNode,undefined,{duration:duration,highlight:highlight,cb:callback});
}

//支持节点-暂时必须节点---新方法,可能传入参数有视角
ModelManager.prototype.locateModelNodeByName = function(id,nodeName,duration=3000,highlight=true,callback=undefined,threeVector3=undefined){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	var sceneObj=obj.scene;
	var locateNode;
	if (nodeName) {
		locateNode=sceneObj.getObjectByName(nodeName);
		_webObject.currentSelectedNode = locateNode
	}
	if(!defined(locateNode))	{
		var errorINfo='节点为空或者指定模型找不到节点！'
		return errorINfo;
	}
	var baseScene=this._baseScene;
	if(baseScene.controls instanceof THREE.OrbitControls){
		this.Orbitlocate(sceneObj,locateNode,{duration:duration,highlight:highlight,cb:callback,threeVector3:threeVector3});
	}else
		this.locate(locateNode,undefined,{duration:duration,highlight:highlight,cb:callback});
}
//修改定位时，移动相机不改变物件position
ModelManager.prototype.Orbitlocate = function(sceneObj,dstObj,options){
	options||(options={duration:300});
	var baseScene=this._baseScene;
	if (dstObj instanceof THREE.Object3D){
		//highlight
		if(options.highlight){
			this._setMeshOutLine(dstObj);
			var obj=this.getObjectFromObj3D(sceneObj);
			this.setObjectAlphaColor(obj.id,0.2,new THREE.Color(0x84c98),undefined,[],[dstObj]);
		}
		var bs=this.calculateBoundingSphere(dstObj);
		
		var target=bs.center.clone();
		var cp=target.clone();
		cp.y+=(bs.radius+16)*Math.sin(Math.PI/4);
		cp.z+=(bs.radius+15)*Math.cos(Math.PI/4);
		
		var _threeVector3 = options.threeVector3 || cp;
		
		var aaa = new TWEEN.Tween(this.camera.position)
//			.to({x:cp.x,y:cp.y,z:cp.z},options.duration)
			.to({x:_threeVector3.x,y:_threeVector3.y,z:_threeVector3.z},options.duration)
			//.to({x:-71.42823109775757,y:90.04616988215855,z:64.48849982034218},options.duration)
			.onComplete(defaultValue(options.cb,()=>{console.log("第一个动画")}))
			// .onComplete(function(){
			// 	//物件分离
			// 	new TWEEN.Tween(dstObj.position)
			// 	.to({x:localVectPos.x,
			// 		y:localVectPos.y,
			// 		z:localVectPos.z},options.duration)
			// 	.onComplete(defaultValue(options.cb,()=>{}))
			// 	.easing( TWEEN.Easing.Sinusoidal.InOut).start();
			// })
			.easing( TWEEN.Easing.Sinusoidal.InOut).start();

 		//变换控制插件
		var bbb= new TWEEN.Tween(baseScene.controls.target)
					.to({x:target.x,
						y:target.y,
						z:target.z},options.duration)
						.onComplete(function(){
							console.log("第er个动画")
						})
					.easing( TWEEN.Easing.Sinusoidal.InOut).start();

		
	}


}
//适合控制插件不设置相机盯向原点  适用于flycontrol
ModelManager.prototype.locate = function(dst,dstlookAt,options){
	options||(options={duration:300});
	var position=new THREE.Vector3();
	var bValid=false;
	if (dstlookAt==undefined) dstlookAt=new THREE.Vector3();
	if (dst instanceof THREE.Object3D){
		//highlight
		if(options.highlight){
			this._setMeshOutLine(dst);
		}
		var bs=this.calculateBoundingSphere(dst);
				//BoundingSphere
		// var group = new THREE.Group();
		// var geometry = new THREE.SphereBufferGeometry(bs.radius,25,25);
		// var material = new THREE.MeshBasicMaterial( {color:0xff0000,wireframeLinewidth:1,opacity:1,transparent:false} );
		// material.wireframe=true;
		// var sphere = new THREE.Mesh( geometry, material ) ;
		// group.add(sphere);
		// group.position.copy(bs.center);
		// this.scene.add(group);
		//position.copy(bs.center);
		
		position.copy(dst.getWorldPosition());
		position.y+=bs.radius*16*Math.sin(Math.PI/4);
		position.z+=bs.radius*16*Math.cos(Math.PI/4);
		//定位物件时，应该看向物件中心
		dstlookAt.copy(bs.center);
		bValid=true;
	}else if(dst instanceof THREE.Vector3){
		position.copy(position);
		bValid=true;
	}
	if(!bValid) return false;
	var camera=this.camera;
	var origPos=new THREE.Vector3().copy(camera.position);
	var origRot=new THREE.Euler().copy(camera.rotation);
	camera.position.set(position.x,position.y,position.z);
	camera.lookAt(dstlookAt);
	var dstRot=new THREE.Euler().copy(camera.rotation);
	camera.position.set(origPos.x,origPos.y,origPos.z)
	camera.rotation.set(origRot.x,origRot.y,origRot.z);
	new TWEEN.Tween(camera.position)
					.to({x:position.x,y:position.y,z:position.z},options.duration)
					.onComplete(defaultValue(options.cb,()=>{}))
					.easing( TWEEN.Easing.Sinusoidal.InOut).start();
	new TWEEN.Tween(camera.rotation)
					.to({x:dstRot.x,y:dstRot.y,z:dstRot.z},options.duration)
					.easing( TWEEN.Easing.Sinusoidal.InOut).start();

//	console.info("开始定位");
//	new TWEEN.Tween(camera.rotation)
//					.to({x: 14.677972081937018, y: 7.831171639747482, z: -13.317123713055137},options.duration)
//					.easing( TWEEN.Easing.Sinusoidal.InOut).start();
}
function ascSort( a, b ) {

	return a.distance - b.distance;

}
ModelManager.prototype.rayPick= function(mouse) {
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( mouse, this.camera );
	var intersectObj=[];
	var intersects=[];
	for(var [id,obj] of this._collection){
		var model=obj.scene;
		if((model instanceof THREE.Object3D)&&model.visible==true){
			var intersect=raycaster.intersectObjects(model.children,true);
			if(intersect.length>0){
				//intersects.push(intersect);
				obj.distance=intersect[0].distance;
				intersects=intersects.concat(intersect);					
				intersectObj.push(obj);				
			}				
		}
	}
	intersects.sort(ascSort);
	intersectObj.sort(ascSort);
	this._selectObj=intersectObj[0];
	intersectObj=[];
	return intersects[0];
}

ModelManager.prototype._getParentNode= function(node) {
	//节点名称后带有_1  _2，认为是转换时自动添加上的，找其父节点
	var name =node.name;
	if(name.indexOf('_',name.length-2)==-1){
		return node;
	}else{
		return this._getParentNode(node.parent);
	}
}
ModelManager.prototype.onLeftClick=function(mouse){
	if(!defined(this.currentShowModel))return null;
	this.restoreObjectAlphaColor(this.currentShowModel.id);
	if (this._bLeftClick==false){
		return null;
	}
	var baseScene=this._baseScene;

	var intersectobj=this.rayPick(mouse);
	//处理一下自动划分的子节点
	if(intersectobj&&intersectobj.object){		
		intersectobj.object=this._getParentNode(intersectobj.object);
		intersectobj.userObj=this._selectObj;	
	}		
	return intersectobj;
}

ModelManager.prototype.getObjectFromObj3D = function(o3d){
	if (o3d instanceof THREE.Scene) {
		for (var [id,obj] of this._collection) {
			if(obj.scene===o3d) return obj;
		}
	}else{
		if(!defined(o3d.parent)) return null;
		var mp=o3d.parent;
		return this.getObjectFromObj3D(mp);
	}

}

ModelManager.prototype.getObj3dFromNode= function(node){
	if (node instanceof THREE.Scene) {
		return node;
	}else{
		if(!defined(node.parent)) return null;
		var mp=node.parent;
		return this.getObj3dFromNode(mp);
	}
}

//获取节点世界坐标
ModelManager.prototype.getNodePositionByName=function(id,nodeName){
	if(!this.has(id)) return false;
	var obj=this.getObject(id);
	var sceneObj=obj.scene;
	var meshObj=sceneObj.getObjectByName(nodeName);
	if(meshObj)
		return meshObj.getWorldPosition();
	else	
		return null;

}
/****************************************************************************** */
//设置模型节点颜色效果
//获取一下模型材质引用，为后续对节点材质更改做准备
ModelManager.prototype.getNodeMaterial=function(obj,node,materials,bCopy=true){
	if(!obj.materialCount){
		obj.materialCount=new Map;
		function getAllMaterial(materialCount,mesh){
			if (mesh instanceof THREE.Mesh){
				if ( Array.isArray( mesh.material)) {
					for (var j = 0; j < mesh.material.length; j++) {
						var mat=mesh.material[j];
						if(!materialCount.has(mat)){
							materialCount.set(mat,1);
						}else{
							var count=materialCount.get(mat);
							count+=1;
							materialCount.set(mat,count);
						}						
					}				
				}else{
					if(!materialCount.has(mesh.material)){
						materialCount.set(mesh.material,1);
					}else{
						var count=materialCount.get(mesh.material);
						count+=1;
						materialCount.set(mesh.material,count);
					}					
				}
			}else{
				var children=mesh.children;
				for (var i = 0; i < children.length; i++) {
					var o=children[i];
					getAllMaterial(materialCount,o);
				}
			}	
		}
		getAllMaterial(obj.materialCount,obj.scene);
	}
	if (node instanceof THREE.Mesh){
		if ( Array.isArray( node.material)) {
			for (var j = 0; j < node.material.length; j++) {
				var mat=node.material[j];
				var count=obj.materialCount.get(mat);
				//材质引用次数大于1  则复制一下材质
				if(count>1&&bCopy){					
					obj.materialCount.set(mat,count-1);
					node.material[j]=mat.clone();
					obj.materialCount.set(node.material[j],1);
				}
				materials.push(node.material[j]);		
			}				
		}else{
			var count=obj.materialCount.get(node.material);
			//引用计数大于1
			if(count>1&&bCopy){
				obj.materialCount.set(node.material,count-1);
				node.material=node.material.clone();
				obj.materialCount.set(node.material,1);
			}
			materials.push(node.material);				
		}
	}else{
		var children=node.children;
		for (var i = 0; i < children.length; i++) {
			var o=children[i];
			if(typeof(o)=="string"){
				o=obj.scene.getObjectByName(o);
			}
			if(defined(o))
				this.getNodeMaterial(obj,o,materials);
		}
	}
}

//设置一个节点的透明 颜色
ModelManager.prototype.setNodeAlphaColor = function(obj,node,alpha=undefined,color=undefined,emissiveColor=undefined,bStroe=true){
	if (alpha==undefined&&color==undefined&&emissiveColor==undefined) return false;
	var nodeMaterials=[];
	this.getNodeMaterial(obj,node,nodeMaterials);

	for(var i=0;i<nodeMaterials.length;i++){
		var mat=nodeMaterials[i];
		//设置材质透明度
		if (alpha) {
			mat.transparent=true;
			//首次时备份一下
			if(!mat.opacity_origin){
				if(bStroe)
					mat.opacity_origin=mat.opacity;
				else{
					mat.opacity_origin=alpha;
					mat.transparent_all=true;
				}
					
			}				
			mat.opacity=alpha;
		}
		//设置颜色
		if(color){
			//首次时备份一下
			if(!mat.color_origin){
				if(bStroe)
					mat.color_origin=mat.color;
				else
					mat.color_origin=color;
			}				
			mat.color=color;
		}
		//设置蒙版色
		if(emissiveColor){
			//首次时备份一下
			if(!mat.emissive_origin){
				if(bStroe)
					mat.emissive_origin=mat.emissive;
				else
					mat.emissive_origin=emissiveColor;
			}				
			mat.emissive=emissiveColor;
		}
	}
}
ModelManager.prototype.restoreObjectAlphaColor=function(id,nodeName){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	var o3d;
	if(defined(nodeName)){
		o3d=obj.scene.getObjectByName(nodeName);
		if(!defined(o3d))return false;
	}else{
		o3d=obj.scene;
	}
	var nodeMaterials=[];
	this.getNodeMaterial(obj,o3d,nodeMaterials,false);
	for(var i=0;i<nodeMaterials.length;i++){
		var mat=nodeMaterials[i];
		//设置材质透明度
		if (mat.opacity_origin) {			
			mat.transparent=mat.transparent_all?true:false;
			mat.opacity=mat.opacity_origin;
		}
		//设置颜色
		if(mat.color_origin){
			mat.color=mat.color_origin;
		}
		//设置蒙版色
		if(mat.emissive_origin){
			mat.emissive=mat.emissive_origin;
		}
	}

	
}
ModelManager.prototype.setObjectAlphaColor=function(id,alpha=undefined,color=undefined,emissive=undefined,
													specialNodes=[],exceptNodes=[],bStroe=true){
	var obj=this.getObject(id);
	if(!defined(obj))return false;
	//指定mesh数组的话，只设置指定的，这时不考虑排除的
	if(specialNodes.length>0){
		for (var k = 0; k <specialNodes.length; k++) {
			//include数组大于0时默认所有不设置，匹配一个设置一个
			var n=specialNodes[k];
			var node=obj.scene.getObjectByName(n);
			if(node)
				this.setNodeAlphaColor(obj,node,alpha,color,emissive,bStroe);
		}	
	}else{
		var scope=this;
		function setAllNodeEffect(o3d,alpha,color,emissive,bStroe=true){
			if(o3d instanceof THREE.Mesh){
				scope.setNodeAlphaColor(obj,o3d,alpha,color,emissive,bStroe)
			}else{
				var children=o3d.children;
				for (var i = 0; i < children.length; i++) {
					setAllNodeEffect(children[i],alpha,color,emissive,bStroe);
				}
			}			
		}
		setAllNodeEffect(obj.scene,alpha,color,emissive,bStroe);		
		if(exceptNodes.length>0){
			var exceptGroup={};exceptGroup.children=[];
			for (var j = 0; j < exceptNodes.length; j++) {
				var nExcep=exceptNodes[j];
				exceptGroup.children.push(nExcep);
			}
			var exceptMaterials=[];
			scope.getNodeMaterial(obj,exceptGroup,exceptMaterials);
			for(var i = 0; i < exceptMaterials.length; i++) {
				var mat=exceptMaterials[i];
				//设置材质透明度
				if (mat.opacity_origin&&alpha) {
					mat.transparent=false;
					mat.opacity=mat.opacity_origin;
				}
				//设置颜色
				if(mat.color_origin&&color){
					mat.color=mat.color_origin;
				}
				//设置蒙版色
				if(mat.emissive_origin&&emissive){
					mat.emissive=mat.emissive_origin;
				}
			}
		}
	}

}
/****************************************************************************** */


/***********************************************************************************************************/
//物件自传 begin
ModelManager.prototype.addRotationObj= function(obj,rotation=true,rotationAxies=new THREE.Vector3(0,1,0),
												rotationSpeed=Math.PI/30,nodeName=undefined){
	var o3d=obj.scene;														
	if(typeof obj === 'string'){
		if(!this.has(obj)) return false;
		o3d=this.getObject(obj).scene;
		if (nodeName) {
			o3d=o3d.getObjectByName(nodeName);
		}
	}
	if(!this._rotationList.has(o3d.id)){
		var ro={};
		ro.o3d=o3d;
		ro.rotationAxies=rotationAxies;
		ro.rollSpeed=rotationSpeed;
		ro.bRotation=rotation;
		ro.originRotation=o3d.rotation;//保存初始旋转角度
		this._rotationList.set(o3d.id,ro);
	}
}

ModelManager.prototype.setRotationObjState= function(obj,rotation=true,rotationSpeed=Math.PI/30){
	var o3d=obj.scene;													
	if(typeof obj === 'string'){
		if(!this.has(obj)) return false;
		o3d=this.getObject(obj).scene;
		if (nodeName) {
			o3d=o3d.getObjectByName(nodeName);
		}
	}
	if(this._rotationList.has(o3d.id)){
		var ro=this._rotationList.get(o3d.id);
		ro.bRotation=rotation;
		ro.rollSpeed=rotationSpeed;
	}else{
		this.addRotationObj(obj);
	}
}
//
ModelManager.prototype.removeRotationObj= function(obj,nodeName=undefined){
	var o3d=obj.scene;													
	if(typeof obj === 'string'){
		if(!this.has(obj)) return false;
		o3d=this.getObject(obj).scene;
		if (nodeName) {
			o3d=o3d.getObjectByName(nodeName);
		}
	}
	if(this._rotationList.has(o3d.id)){
		var ro=this._rotationList.get(o3d.id);
		o3d.rotation.copy(ro.originRotation);
		this._rotationList.delete(o3d.id);
	}
}
//物件自传 end
/***********************************************************************************************************/

/***********************************************************************************************************/
//相机巡视物件 begin
ModelManager.prototype.patrolObject= function(obj,bPatrol,rotationSpeed=Math.PI/30){
	var _this = this;
	this.patrolEntity=undefined;
	var modelId=undefined;
	if(typeof obj === 'string'){
		if(!this.has(obj)) return false;
		modelId=obj;
		obj=this.getObject(obj);
	}
	if(!modelId){
		var modelId=this.getId(obj);
	}	
	this.patrolEntity={
		model:obj,
		bPatrol:bPatrol,
		patrolSpeed:rotationSpeed,
		infoList : []
	}
	//请求巡视数据
	if(this.patrolEntity.lastModel!=obj){
		if(obj.modelInfo){
			this.patrolEntity.infoList = obj.modelInfo.node_list;
		}
		// !(function(){
		// 	$.ajax({
		// 		type : "get",
		// 		url : "/model3d/data/patrol/"+modelId+".json",
		// 		success : function(data){
		// 			_this.patrolEntity.infoList = data;
		// 		}
		// 	});
		// })();
	}
	this.patrolEntity.lastModel=obj;
	
}

ModelManager.prototype.setPatrolState= function(bPatrol,rotationSpeed){

	if(this.patrolEntity){
		this.patrolEntity.bPatrol=bPatrol;
		this.patrolEntity.patrolSpeed=rotationSpeed;
	}
}
//
ModelManager.prototype.removePatrol= function(){
	this.patrolEntity=undefined;
}

//相机巡视物件 end
/***********************************************************************************************************/

//对某个Object增加裁剪面
//裁剪面和材质有关
ModelManager.prototype.addObjClipPlanes = function(obj,clipPlanes,clipIntersection){
	if(typeof obj === 'string' ){
		if(!this.has(obj)) return false;
		obj=this.getObject(obj);
	}
	var scope=this;
	function addObjectClipPlanes(o3d,clipPlanes,clipIntersection){
		if(o3d instanceof THREE.Mesh){
			var materials=[];
			scope.getNodeMaterial(obj,o3d,materials);
			materials.forEach(function(mat){
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
				mat.clipIntersection=clipIntersection;				
			});	
		}else{
			var children=o3d.children;
			for (var i = 0; i < children.length; i++) {
				addObjectClipPlanes(children[i],clipPlanes,clipIntersection);
			}
		}	
	}
	addObjectClipPlanes(obj.scene,clipPlanes,clipIntersection);	
}
ModelManager.prototype.removeObjClipPlanes = function(obj,clipPlanes){
	if(typeof obj === 'string' ){
		if(!this.has(obj)) return false;
		obj=this.getObject(obj);
	}
	var scope=this;
	function removeObjectClipPlanes(o3d,clipPlanes){
		if(o3d instanceof THREE.Mesh){
			var materials=[];
			scope.getNodeMaterial(obj,o3d,materials);
			materials.forEach(function(mat){
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
			var children=o3d.children;
			for (var i = 0; i < children.length; i++) {
				removeObjectClipPlanes(children[i],clipPlanes);
			}
		}	
	}
	removeObjectClipPlanes(obj.scene,clipPlanes);	
}

//对某个Object增加裁剪面
//裁剪面和材质有关
ModelManager.prototype.setClipPlaneIntersection = function(obj,clipIntersection){
	if(typeof obj === 'string' ){
		if(!this.has(obj)) return false;
		obj=this.getObject(obj);
	}
	var scope=this;
	function setObjectClipIntersection(o3d,clipIntersection){
		if(o3d instanceof THREE.Mesh){
			var materials=[];
			scope.getNodeMaterial(obj,o3d,materials);
			materials.forEach(function(mat){
				mat.clipIntersection=clipIntersection;				
			});	
		}else{
			var children=o3d.children;
			for (var i = 0; i < children.length; i++) {
				setObjectClipIntersection(children[i],clipIntersection);
			}
		}	
	}
	setObjectClipIntersection(obj.scene,clipIntersection);	
}




ModelManager.prototype.bingBong=function(obj,sonDepth,v=new THREE.Vector3(2,2,2),type=undefined){
	if(typeof obj === 'string' ){
		if(!this.has(obj)) return false;
		obj=this.getObject(obj);
	}
	function bingBongObject(o3d,depth,valuse){
		if(depth===0||o3d.children.length===0){
			var wp=o3d.getWorldPosition();
			wp.x*=v.x;
			wp.y*=v.y;
			wp.z*=v.z;
			if(!defined(o3d.orginPositon)){
				o3d.orginPositon=new THREE.Vector3();
				o3d.orginPositon.copy(o3d.position);
			}
			o3d.position.copy(o3d.worldToLocal(wp));
			//obj.updateMatrixWorld();
		}else {
			var children=o3d.children;
			for(var i=0;i<children.length;i++){
				var o=children[i];
				depth--;
				bingBongObject(o,depth,v);
			}
		}
	}
	bingBongObject(obj.scene,sonDepth,v);
	
}

// baseScene.prototype.bingBong=function(obj,sonDepth,v=new THREE.Vector3(2,2,2),type=undefined){
// 	if(sonDepth===0||obj.children.length===0){
// 		var wp=obj.getWorldPosition();
// 		//第一次保存一下原始世界坐标
// 		if(!defined(obj.orginPositon))obj.orginPositon=new THREE.Vector3().copy(wp);
// 		wp.x*=v.x;
// 		wp.y*=v.y;
// 		wp.z*=v.z;
// 		obj.position.copy(obj.worldToLocal(wp));
// 		obj.updateMatrixWorld();
// 	}else {
// 		var children=obj.children;
// 		for(var i=0;i<children.length;i++){
// 			var o=children[i];
// 			sonDepth--;
// 			this.bingBong(o,sonDepth,v);
// 		}
// 	}
// }
// baseScene.prototype.bingBongChange=function(obj,last_v,new_v,type=undefined){
// 	if(!defined(last_v)||!defined(new_v))return false;
// 	if(defined(obj.orginPositon)){
// 		var origP=new THREE.Vector3().copy(obj.orginPositon)
// 		obj.localToWorld(origP);
// 		new_v.divide(last_v);
// 		origP.x*=new_v.x;
// 		origP.y*=new_v.y;
// 		origP.z*=new_v.z;
// 		obj.position.copy(obj.worldToLocal(origP));
// 		//obj.updateMatrixWorld();
// 	}else{
// 		var children=obj.children;
// 		for(var i=0;i<children.length;i++){
// 			var o=children[i];
// 			this.bingBongChange(o,last_v,new_v);
// 		}
// 	}
	

// }
ModelManager.prototype.bingBongRestore=function(obj){
	if(defined(obj.orginPositon)){
			obj.position.copy(obj.orginPositon);
			obj.orginPositon=undefined;
			obj.updateMatrixWorld();
	}else{
		var children=obj.children;
		for(var i=0;i<children.length;i++){
			var o=children[i];
			this.bingBongRestore(o);
		}
	}
}
/*
ModelManager.prototype.visitModel=function(obj,position,lookVect){
	var baseScene=this._baseScene;
	baseScene.changeControlMode(2);
	lookVect.normalize();
	var lookAt=new THREE.Vector3().addVectors(position,lookVect);
	var scope=this;
	this.locate(position,lookAt,{duration:3000,cb:function(){scope.visitMode=false;}});
}
*/

ModelManager.prototype.loadModelInfo=function(obj,dataUrl,finish){
	var loader = new THREE.FileLoader();

	loader.setResponseType( 'json' );

	loader.load( dataUrl, function ( data ) {

		obj.modelInfo=data;

		if(finish !== undefined){
			finish(obj);
		}

	},undefined,function(e){
		finish(obj);
	});
}


ModelManager.prototype.autoOffset=function(o3d,position){
	var offset=new THREE.Vector3();
		//获取模型轴原点
	var modelOrigin=new THREE.Vector3();
	o3d.getWorldPosition(modelOrigin);
	//var vec=new THREE.Vector3();
	var direction=new THREE.Vector3().subVectors(position,modelOrigin).normalize();
	var offsetVec=direction.multiplyScalar(o3d.boundingSphere.radius/4);
	offset.addVectors(position,offsetVec);
	var matrix=new THREE.Matrix4().setPosition(position);
	var m1 = new THREE.Matrix4();
	m1.getInverse(matrix)
	return offset.applyMatrix4(m1 );
}