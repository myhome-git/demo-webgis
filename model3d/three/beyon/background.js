function sceneBackground(sceneBackgroundModel,basescene,param){
	this.basescene = basescene;
	this.renderer = basescene._renderer;
	this.scene = basescene.scene;
	this.camera = basescene.camera;
	this.sceneBackgroundModel = sceneBackgroundModel;
	this.backGroundType = sceneBackgroundModel;
	this.updateBackground=[];
	this.init(sceneBackgroundModel,param);
}

sceneBackground.prototype.init = function(sceneBackgroundModel,param){
	//添加新的平行光源
	this.light = this.basescene.addDirectionalLight("direction-light-background-" + sceneBackgroundModel,{
		color : 0xffffff,
		intensity : 0.8
	});
	var renderer = this.renderer;
	var scene = this.scene;
	switch(sceneBackgroundModel){
		case SceneBackgroundModel.WATER :
			this.waterParams = {
				waterSize:1,
				waterAlpha:1,
				waterDistortionScale:3.7,
				skyInclination:0.2,
				skyAzimuth:0.25,
				distance : 400,
			}
			this.beforeParams = {
				waterSize:undefined,
				waterAlpha:undefined,
				waterDistortionScale:undefined,
				skyInclination:undefined,
				skyAzimuth:undefined,
				distance : undefined,
			}
			this.initWater(renderer,scene);
			break;
		case SceneBackgroundModel.OCEAN :
			this.ocean2Params = {
				oceanSize : 4096,
				oceanWind : 6,
				choppiness : 3.1,//波纹精细度,
				sunDirection : [-1.0, 1.0, 1.0],
				// geometrySize : 512,
				// geometry_origin : -256,
				// ocean_color : new THREE.Vector3(0.004, 0.016, 0.047),
				// distance : 400,
				// sky_color : new THREE.Vector3(3.2, 9.6, 12.8),
				// geometry_resolution : 512,
				// resolution : 1024,
				// exposure : 0.35
				geometrySize : 10000,
				geometry_origin : -512,
				ocean_color : new THREE.Vector3(0.004, 0.016, 0.047),
				distance : 400,
				sky_color : new THREE.Vector3(3.2, 9.6, 12.8),
				geometry_resolution : 1024,
				resolution : 1024,
				exposure : 0.35
			}
			this.beforeParams = {
				oceanSize : 1,
				oceanWind : 10,
				choppiness : 1.5,//波纹精细度,
				sunDirection : [-1.0, 1.0, 1.0],
				geometrySize : 512,
				geometry_origin : -256,
				ocean_color : new THREE.Vector3(0.004, 0.016, 0.047),
				distance : 400,
				sky_color : new THREE.Vector3(3.2, 9.6, 12.8),
				geometry_resolution : 512,
				resolution : 1024,
				exposure : 0.35
			}
			this.initOcean2(renderer,scene);
			break;
		case SceneBackgroundModel.SKY :
			this.skyParams  = {
				distance : 40000,
				turbidity: 10,
				rayleigh: 2,
				mieCoefficient: 0.005,
				mieDirectionalG: 0.8,
				luminance: 1,
				inclination: 0.49, // elevation / inclination
				azimuth: 0.25, // Facing front,
				sun: ! true //无需控制
			};
			this.beforeParams  = {
				distance : 40000,
				turbidity: 10,
				rayleigh: 2,
				mieCoefficient: 0.005,
				mieDirectionalG: 0.8,
				luminance: 1,
				inclination: 0.49, // elevation / inclination
				azimuth: 0.25, // Facing front,
				sun: ! true //无需控制
			};
			this.initSky(renderer,scene);
			break;
		case SceneBackgroundModel.BOX :
			this.initBox(param);
			break;
		case SceneBackgroundModel.COLOR :
			this.initColor(param);
			break;
		case SceneBackgroundModel.PICTURE :
			this.initPicture(param);
			break;
	}
}

//切换背景环境的配置参数
sceneBackground.prototype.backgroundSetting={
	water : {
		textures : "/model3d/three/textures/waternormals.jpg",
		water_alpha : 0.9,//水的透明度
		distance: 40000,//太阳的距离
		inclination: 0.2,//太阳的高度角度
		azimuth: 0.205 //太阳的圆角
	},
	ocean : "",
	sky : "",
	box : {
		path:'/model3d/three/textures/cube/',
		files:[
			'px.jpg', 'nx.jpg',
			'py.jpg', 'ny.jpg',
			'pz.jpg', 'nz.jpg'],
	},
	color: new THREE.Color( 0xffffff )
}

sceneBackground.prototype.initWater = function(renderer,scene){
	// Water
	var light = this.light;
	var controls = this.basescene.controls;
	var camera = this.basescene.camera;

	var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var water = new THREE.Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load( this.backgroundSetting.water.textures, function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			alpha: 0.9,
			sunDirection: light.position.clone().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale:  3.7,
			// fog: scene.fog !== undefined
		}
	);
	water.rotation.x = - Math.PI / 2;
	scene.add( water );
	this.water = water;

	var sky = new THREE.Sky();
	sky.scale.setScalar( 10000 );
	scene.add( sky );
	this.sky = sky;

	var uniforms = sky.material.uniforms;
	uniforms.turbidity.value = 10;
	uniforms.rayleigh.value = 2;
	uniforms.luminance.value = 1;
	uniforms.mieCoefficient.value = 0.005;
	uniforms.mieDirectionalG.value = 0.8;

	var cubeCamera = new THREE.CubeCamera( 1, 20000, 256 );
	cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
	this.cubeCamera = cubeCamera;
	//更新参数
	this.updateWaterSceneParam();
	
	//camera.lookAt( controls.target )

	//渲染函数
	this.updateBackground.push({
		func: function(){
			//	var time = performance.now() * 0.001;
				water.material.uniforms.time.value += 1.0 / 60.0;
				water.material.side = THREE.FrontSide;
				renderer.render(scene,camera);
			},
		args:undefined,
	});
}

sceneBackground.prototype.updateWaterSceneParam = function(){
	if(this.backGroundType!=SceneBackgroundModel.WATER)
		return;
	var water = this.water;
	if(this.waterParams.waterSize!=this.beforeParams.waterSize){
		water.material.uniforms.size.value = this.waterParams.waterSize;
		this.beforeParams.waterSize = this.waterParams.waterSize;
	}
	if(this.waterParams.waterAlpha !=this.beforeParams.waterAlpha){
		water.material.uniforms.alpha.value =  this.waterParams.waterAlpha;
		this.beforeParams.waterAlpha = this.waterParams.waterAlpha;
	}

	if(this.waterParams.waterDistortionScale !=this.beforeParams.waterDistortionScale){
		water.material.uniforms.distortionScale.value =  this.waterParams.waterDistortionScale;
		this.beforeParams.waterDistortionScale = this.waterParams.waterDistortionScale;
	}

	if(this.waterParams.skyInclination!=this.beforeParams.skyInclination||this.waterParams.skyAzimuth!=this.beforeParams.skyAzimuth||this.waterParams.distance!=this.beforeParams.distance){
		var light = this.light;
		var inclination = this.waterParams.skyInclination;
		var azimuth = this.waterParams.skyAzimuth;
		var distance = this.waterParams.distance;

		var theta = Math.PI * ( inclination - 0.5 );
		var phi = 2 * Math.PI * ( azimuth - 0.5 );

		light.position.x = distance * Math.cos( phi );
		light.position.y = distance * Math.sin( phi ) * Math.sin( theta );
		light.position.z = distance * Math.sin( phi ) * Math.cos( theta );

		this.sky.material.uniforms.sunPosition.value = light.position.copy( light.position );
		this.water.material.uniforms.sunDirection.value.copy( light.position ).normalize();
		this.beforeParams.skyInclination = this.waterParams.skyInclination;
		this.beforeParams.skyAzimuth = this.waterParams.skyAzimuth;
		this.beforeParams.distance = this.waterParams.distance;

		this.cubeCamera.update( this.renderer, this.scene );
	}
}

sceneBackground.prototype.remove = function(){
	var light = this.light;
	var scene = this.scene;
	if(light){
		this.basescene.lightCollection.DirectionalLight.delete(light.name);
		this.scene.remove(light);
	}
	switch(this.backGroundType){
		case SceneBackgroundModel.WATER :
			scene.remove(this.water);
			scene.remove(this.sky);
			scene.remove(this.cubeCamera);
			this.waterParams = undefined;
			break;
		case SceneBackgroundModel.OCEAN :
			scene.remove(this.ocean2.oceanMesh);
			this.ocean2 = null;
			this.ocean2Params = undefined;
			break;
		case SceneBackgroundModel.SKY :
			scene.remove(this.sky);
			scene.remove(this.sunSphere);
			this.skyParams = undefined;
			break;
		case SceneBackgroundModel.BOX :
			scene.background = undefined;
			break;
		case SceneBackgroundModel.COLOR :
			scene.background = undefined;
			break;
		case SceneBackgroundModel.PICTURE :
			scene.background = undefined;
			break;
	}
	this.updateBackground=[];
	this.beforeParams = undefined;
	this.backGroundType = undefined;
}

sceneBackground.prototype.initOcean2 = function(renderer,scene){
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.context.getExtension('OES_texture_float');
	renderer.context.getExtension('OES_texture_float_linear');

	var ocean2Params = this.ocean2Params;

	var hash = 'half-float';
	var gsize = 512;
	var res = 1024;
	var gres = res / 2;
	var origx = -gsize / 2;
	var origz = -gsize / 2;
	this.lastTime  = (new Date()).getTime();
	lastTime = this.lastTime;
	var camera = this.camera;
	this.ocean2 = new THREE.Ocean(renderer, camera, scene,
	{
		USE_HALF_FLOAT : hash === 'half-float',
		INITIAL_SIZE : ocean2Params.oceanSize,
		INITIAL_WIND : [ocean2Params.oceanWind,ocean2Params.oceanWind],
		INITIAL_CHOPPINESS :ocean2Params.choppiness,
		CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
		GEOMETRY_ORIGIN : [ocean2Params.geometry_origin,ocean2Params.geometry_origin],
		SUN_DIRECTION : ocean2Params.sunDirection,
		OCEAN_COLOR: ocean2Params.ocean_color,
		SKY_COLOR: ocean2Params.sky_color,
		EXPOSURE : ocean2Params.exposure,
		GEOMETRY_RESOLUTION: ocean2Params.geometry_resolution,
		GEOMETRY_SIZE : ocean2Params.geometrySize,
		RESOLUTION : ocean2Params.resolution
	});
	var ocean2 = this.ocean2;
	var camera= this.camera;

	this.ocean2.materialOcean.uniforms.u_projectionMatrix = { value: camera.projectionMatrix };
	this.ocean2.materialOcean.uniforms.u_viewMatrix = { value: camera.matrixWorldInverse };
	this.ocean2.materialOcean.uniforms.u_cameraPosition = { value: camera.position };
	scene.add(this.ocean2.oceanMesh);

	//渲染函数
	this.updateBackground.push({
		func: function(){
				var currentTime = new Date().getTime();
				ocean2.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
				lastTime = currentTime;
				ocean2.render(ocean2.deltaTime);
				ocean2.overrideMaterial = ocean2.materialOcean;

				if (!ocean2.doOne) {
					ocean2.materialOcean.uniforms.u_size.value = ocean2.size;
					ocean2.materialOcean.uniforms.u_geometrySize.value = ocean2.geometrySize;
					ocean2.materialOcean.uniforms.u_sunDirection.value.set( ocean2.sunDirectionX, ocean2.sunDirectionY, ocean2.sunDirectionZ );
					ocean2.materialOcean.uniforms.u_exposure.value = ocean2.exposure;
					ocean2.doOne = true;
				}

				ocean2.materialOcean.uniforms.u_normalMap.value = ocean2.normalMapFramebuffer.texture;
				ocean2.materialOcean.uniforms.u_displacementMap.value = ocean2.displacementMapFramebuffer.texture;
				ocean2.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix;
				ocean2.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse;
				ocean2.materialOcean.uniforms.u_cameraPosition.value = camera.position;
				ocean2.materialOcean.depthTest = true;
			},
		args:undefined,
	});
}

sceneBackground.prototype.updateOcean2Params = function(){
	var params = this.ocean2Params;
	var beforeParams = this.beforeParams; 
	var ocean2 = this.ocean2;
	if(params.oceanSize != beforeParams.oceanSize){
		ocean2.size = this.ocean2Params.oceanSize;
		beforeParams.oceanSize = params.oceanSize;
	}

	if(params.sunDirection != beforeParams.sunDirection){
		ocean2.sunDirectionX = params.sunDirection[0];
		ocean2.sunDirectionY = params.sunDirection[1];
		ocean2.sunDirectionZ = params.sunDirection[2];
		beforeParams.sunDirection = params.sunDirection;
	}

	if(params.exposure != beforeParams.exposure){
		ocean2.exposure = params.exposure;
		beforeParams.exposure = params.exposure;
	}

	if(params.oceanWind != beforeParams.oceanWind){
		ocean2.windX = params.oceanWind;
		ocean2.windY = params.oceanWind;
		beforeParams.oceanWind = params.oceanWind;
	}

	if(params.choppiness != beforeParams.choppiness){
		ocean2.choppiness = params.choppiness;
		beforeParams.choppiness = params.choppiness;
	}

	if(params.geometrySize != beforeParams.geometrySize){
		ocean2.geometrySize = params.geometrySize;
		beforeParams.geometrySize = params.geometrySize;
		params.geometry_origin = [ 0-ocean2.geometrySize/2 , 0-ocean2.geometrySize/2 ]
	}

	if(params.geometry_origin != beforeParams.geometry_origin){
		ocean2.geometryOrigin = params.geometry_origin;
		beforeParams.geometry_origin = params.geometry_origin;
	}

	if(params.ocean_color != beforeParams.ocean_color){
		ocean2.oceanColor = params.ocean_color;
		beforeParams.ocean_color = params.ocean_color;
	}

	if(params.sky_color != beforeParams.sky_color){
		ocean2.skyColor = params.sky_color;
		beforeParams.sky_color = params.sky_color;
	}

	if(params.resolution != beforeParams.resolution){
		ocean2.resolution = params.resolution;
		beforeParams.resolution = params.resolution;
	}

	if(params.geometry_resolution != beforeParams.geometry_resolution){
		ocean2.geometryResolution = params.geometry_resolution;
		beforeParams.geometry_resolution = params.geometry_resolution;
	}
	this.ocean2.doOne = false;
	// this.renderer.render(this.scene, this.camera);
}

sceneBackground.prototype.Resize = function(){
	var camera = this.camera;
	var renderer = this.renderer;
	var scene = this
	camera.aspect = inWidth / inHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(inWidth, inHeight);
	//renderer.render( scene, camera);
}

sceneBackground.prototype.initSky = function(renderer,scene){
	var camera = this.camera;
	this.sky = new THREE.Sky();
	var sky = this.sky;
	sky.scale.setScalar( 450000 );
	scene.add( sky );
	// Add Sun Helper
	this.sunSphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 20000, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff } )
	);
	var sunSphere = this.sunSphere;
	sunSphere.position.y = - 700000;
	sunSphere.visible = false;
	scene.add( sunSphere );

	var effectController  = this.skyParams;
	this.updateSkyParam();

	this.updateBackground.push({
		func:function(){

		},
		args:undefined,
	});
}

sceneBackground.prototype.updateSkyParam = function(){
	var uniforms = this.sky.material.uniforms;
	var param = this.skyParams;
	var effectController = param;
	var sunSphere = this.sunSphere;
	var renderer = this.renderer;
	var camera = this.camera;
	var scene = this.scene;
	var distance = effectController.distance;
	uniforms.turbidity.value = effectController.turbidity;
	uniforms.rayleigh.value = effectController.rayleigh;
	uniforms.luminance.value = effectController.luminance;
	uniforms.mieCoefficient.value = effectController.mieCoefficient;
	uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

	var theta = Math.PI * ( effectController.inclination - 0.5 );
	var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

	sunSphere.position.x = distance * Math.cos( phi );
	sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
	sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

	sunSphere.visible = effectController.sun;
	uniforms.sunPosition.value.copy( sunSphere.position );
	// renderer.render( scene, camera );
}

sceneBackground.prototype.initBox = function(sceneBackground_BOX="skybox"){

	var renderer = this.renderer;
	var camera = this.camera;
	var scene = this.scene;
	var boxSetting = this.backgroundSetting.box;

	var cubeTextureLoader = new THREE.CubeTextureLoader();
	var path = SceneBackground_BOX.getPath() + sceneBackground_BOX + "/";
	var files = SceneBackground_BOX.getFiles(sceneBackground_BOX);
	cubeTextureLoader.setPath(path);
	var cubeTexture = cubeTextureLoader.load(files);
	
	scene.background = cubeTexture;

	//renderer.render( scene, camera );
}

sceneBackground.prototype.initColor = function(color = new THREE.Color( "rgba(0,0,0,0.5)" )){

	var renderer = this.renderer;
	var camera = this.camera;
	var scene = this.scene;
	// var boxSetting = this.backgroundSetting.box;
	scene.background = color;
	//renderer.render( scene, camera );
}

sceneBackground.prototype.initPicture = function(param = {}){
	var renderer = this.renderer;
	var camera = this.camera;
	var scene = this.scene;

	var loader = new THREE.TextureLoader();

	// load a resource
	loader.load(
		// resource URL
		'/model3d/three/textures/body-background.jpg',

		// onLoad callback
		function ( texture ) {
			scene.background = texture;
			//renderer.render( scene, camera );
		},

		// onProgress callback currently not supported
		undefined,

		// onError callback
		function ( err ) {
			console.error( 'An error happened.' );
		}
	);
}

sceneBackground.prototype.changedBG = function(sceneBackgroundModel,param){
	this.remove();
	this.backGroundType = sceneBackgroundModel;
	this.init(sceneBackgroundModel,param);

}


