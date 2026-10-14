var SceneBackgroundModel = {
	WATER : 0,
	OCEAN : 1,
	SKY : 2,
	BOX : 3,
	COLOR : 4,
	PICTURE : 5,
};

var SceneBackground_BOX = {
	SKY_CLOUD : "skybox",
	SKY_DESERT : "skyboxsun25deg",
	STREET : "pisa",
	PARK2 : "park2",
	PARK3 : "Park3Med",
	SKYLINE : "MilkyWay",
	// SKYLINE2 : "spacebook",

	getFiles:function(model){
		switch(model){
			case SceneBackground_BOX.SKY_CLOUD:
			case SceneBackground_BOX.SKY_DESERT:
			case SceneBackground_BOX.PARK3:
				return [
					'px.jpg', 'nx.jpg',
					'py.jpg', 'ny.jpg',
					'pz.jpg', 'nz.jpg'
				];
			case SceneBackground_BOX.STREET:
				return [
					'px.png', 'nx.png',
					'py.png', 'ny.png',
					'pz.png', 'nz.png'
				];
			case SceneBackground_BOX.PARK2:
				return [
					'posx.jpg' , 'negx.jpg' ,
					'posy.jpg' , 'negy.jpg' ,
					'posz.jpg' , 'negz.jpg' ,
				];
			case SceneBackground_BOX.SKY_CLOUD:
				return [
					'posx.jpg' , 'negx.jpg' ,
					'posy.jpg' , 'neg.jpgy' ,
					'posz.jpg' , 'negz.jpg' ,
				];
			// case SceneBackground_BOX.SKYLINE2:
			// 	return[
			// 		'Version2_dark_px.jpg', 'Version2_dark_mx.jpg',
			// 		'Version2_dark_py.jpg', 'Version2_dark_my.jpg',
			// 		'Version2_dark_pz.jpg', 'Version2_dark_mz.jpg',
					
			// 	];
		}
		return [
			'dark-s_px.jpg', 'dark-s_nx.jpg',
			'dark-s_py.jpg', 'dark-s_ny.jpg',
			'dark-s_pz.jpg', 'dark-s_nz.jpg'
		];
	},

	getPath:function(){
		return "/model3d/three/textures/cube/";
	}
};

// const PAI = 3.141592653;
// const LOW_LINE ="_";