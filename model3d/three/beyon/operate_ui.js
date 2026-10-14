function OperateUI(baseScene) {	
	this._baseScene=baseScene;
	//为场景添加界面
	this._gui = new GUICtrls({
		div : "control-panel_"+baseScene._id,
		showControl : false,
	});
	var _control = document.getElementById("control-panel");
	if(_control){
		_control.appendChild(this._gui.domElement);
	}
	
	this.bInitCurentUI=false;

	
}

OperateUI.prototype.constructor = OperateUI;


OperateUI.prototype.initCurentUI=function(){
	var scope=this;
	var gui=scope._gui;
	var baseScene=scope._baseScene;
	var modelManager=baseScene.modelManager;
	var params={
		//controlMode:[0,1,2],
		get 'controlMode'() {
			for(var [k,v] of baseScene._control.controlList){
				if(baseScene.controls===v)
					return k;
			}			
			return null;

		},
		set 'controlMode'( value ) {

			baseScene.changeControlMode(Number(value));

		},
		click:true,
		alpha:1,
	}
	
	gui.dat.add( params, 'controlMode',{"正常模式":1,"飞行模式":2,"跟踪模式":3}).name( '操作模式' );
	gui.dat.add( params, 'click' ).name( '点击事件' ).onChange( function ( value ) {
		baseScene._bLeftClick=value;
	} );
	gui.dat.add( params, 'alpha' ,0, 1).step( 0.1 ).name( '透明度' ).onChange( function ( value ) {
		modelManager.setObjectAlphaColor(modelManager.currentShowModel.id,value);
	} );
	
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
		modelManager.setRotationObjState(modelManager.currentShowModel,value);
	});
	rotationFolder.add( rotationParams, 'rotationSpeed',0.5,10).step(0.5).name( '旋转速度' ).onChange( function ( value ) {
		//设置该value为每分钟转多少圈
		var rad=value/60.0*Math.PI*2;
		modelManager.setRotationObjState(modelManager.currentShowModel,true,rad);		
		rotationParams.rotation=true;
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
		modelManager.patrolObject(modelManager.currentShowModel,value);
	});
	patrolFolder.add( patrolParams, 'rotationSpeed',0.5,10).step(0.5).name( '巡游速度' ).onChange( function ( value ) {
		//设置该value为每分钟转多少圈
		var rad=value/60.0*Math.PI*2;
		modelManager.setPatrolState(true,rad);
	});



//裁剪面 begin
	var clipPlanes=baseScene._clipPlanes;
	baseScene._helpers = new THREE.Group();
	var helpers=baseScene._helpers;
	helpers.add( new THREE.AxesHelper( 20 ) );
	// helpers.add(this._planeHelps[0]);
	// helpers.add(this._planeHelps[1]);
	// helpers.add(this._planeHelps[2]);
	helpers.visible = false;
	baseScene.scene.add( helpers );
	baseScene._renderer.localClippingEnabled = true;

	var clipFolder = gui.dat.addFolder( "剖面分析");
	var clipParams= {
		clipIntersection: true,
		planeConstant: 0,
		showHelpers: false
	};
	clipFolder.add( clipParams, 'clipIntersection' ).name( '相交裁剪' ).onChange( function ( value ) {
		modelManager.setClipPlaneIntersection(modelManager.currentShowModel,value);
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
	// //避免裁剪失效，copy一下材质
	// bs._objList.forEach(function(obj){
	// 	if(!defined(obj.materials)) {
	// 		obj.materials=new Set;
	// 		bs.copyMaterials(obj.materials,obj.scene);
	// 	}
	// });
	clipPlaneFolder.add( planeParams, 'YZ' ).name( '竖切' ).onChange( function ( value ) {
		var x=[];
		x.push(clipPlanes[0]);
		if(value){
			modelManager.addObjClipPlanes(modelManager.currentShowModel,x,true);			
			helpers.add(baseScene._planeHelps[0]);
		}else{
			modelManager.removeObjClipPlanes(modelManager.currentShowModel,x);
			helpers.remove(baseScene._planeHelps[0]);
		}
		
	} );
	clipPlaneFolder.add( planeParams, 'XZ' ).name( '平切' ).onChange( function ( value ) {
		var y=[];
		y.push(clipPlanes[1]);
		if(value){
			modelManager.addObjClipPlanes(modelManager.currentShowModel,y,true);			
			helpers.add(baseScene._planeHelps[1]);		
		}else{
			modelManager.removeObjClipPlanes(modelManager.currentShowModel,y);
			helpers.remove(baseScene._planeHelps[1]);
		}

	} );
	clipPlaneFolder.add( planeParams, 'XY' ).name( '横切' ).onChange( function ( value ) {
		var z=[];
		z.push(clipPlanes[2]);
		if(value){
			modelManager.addObjClipPlanes(modelManager.currentShowModel,z,true);			
			helpers.add(baseScene._planeHelps[2]);		
		}else{
			modelManager.removeObjClipPlanes(modelManager.currentShowModel,z);
			helpers.remove(baseScene._planeHelps[2]);
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
	scope._Pong={
		obj:undefined,
		Vector:new THREE.Vector3(2,2,2),
		depth:5
	};
	PongFolder.add( PongParams, 'depth',1,10 ).step(1).name( '拆解深度' ).onChange( function ( value ) {
		scope._Pong.depth=value;
	});

	var vectFolder=PongFolder.addFolder("拆解方向");
//因为存在节点深度问题，暂时不能实时改变位置
	vectFolder.add( PongParams, 'vectX',1,10 ).step(1).name( 'X方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);		
		scope._Pong.Vector.x=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
		//bs.bingBongChange(bs._Pong.obj,bs._Pong.Vector);
	});
	vectFolder.add( PongParams, 'vectY',1,10).step(1).name( 'Y方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);
		scope._Pong.Vector.y=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
		//bs.bingBongChange(bs._Pong.obj,bs._Pong.Vector);
	});
	vectFolder.add( PongParams, 'vectZ',1,10 ).step(1).name( 'Z方向' ).onChange( function ( value ) {
		//var last_v=new THREE.Vector3().copy(bs._Pong.Vector);
		scope._Pong.Vector.z=value;
		//if(defined(bs._Pong.obj))bs.bingBongChange(bs._Pong.obj,last_v,bs._Pong.Vector);
	});	
	PongFolder.add( PongParams, 'bingBong').name( '拆解' ).onChange( function ( value ) {
		if(value){
			scope._Pong.obj=modelManager.currentShowModel;			
			if(scope._Pong.obj)				
				modelManager.bingBong(scope._Pong.obj,scope._Pong.depth,scope._Pong.Vector);
			else{
				alert("请选择一个模型！");
				this.object[this.property]=!value;
			}
			
		}else{
			if(scope._Pong.obj)modelManager.bingBongRestore(scope._Pong.obj.scene);
			scope._Pong.obj=undefined;
		}	
			
	});
	//炸裂模型 end
	this.bInitCurentUI=true;
}

OperateUI.prototype.showAllControl=function(bShow){
	if(!this.bInitCurentUI)this.initCurentUI();
	if(this._gui){
		this._gui.setVisible(bShow);
		return true;
	}else if(!defined(this._gui)&&!bShow)
	{
		return false;
	}

	// //动画
	// var bAddAnimation=false;
	// for(var [k,v] of baseScene.animationCtrlMap){
	// 	if (v.animations&&v.animations.length>0) {
	// 		bAddAnimation=true;break;
	// 	}
	// }
	// if(bAddAnimation){
	// 	var animationFloder = gui.dat.addFolder( "动画");
	// 	var animationParams= {
	// 		loop: false,
	// 		timescale: 1
	// 	};
	// 	animationFloder.add( animationParams, 'loop' ).name( '循环' ).onChange( function ( value ) {
	// 		bs._objList.forEach(function(o){
	// 			bs.playAnimations(o,value,9999);
	// 		});
	// 	});
	// 	animationFloder.add( animationParams, 'timescale',0,5 ).name( '速度' ).onChange( function ( value ) {
	// 		bs._objList.forEach(function(o){
	// 			bs.playAnimations(o,true,9999,value);
	// 		});
	// 	});
	// }
}


