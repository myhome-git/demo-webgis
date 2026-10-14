//卫星管理
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	var _satellite={};

	module.init = function(){
	   let layer = parent.MAP.getBeyonMap().getLayerManager()
	   .getLayerGroupByName("module.MAP.LAYER.GROUP.DJ")
	   .getLayerById("module.MAP.LAYER.GROUP.DJ.SATELLITE");
	   let map = parent.MAP.getMap();
	   let dayNightLayer = parent.MAPCONTROL.getModuleLayerByName("module.MAP.LAYER.GROUP.DJ.CHENHUN");
		_satellite = new satellite(map,layer,dayNightLayer);
		$("#satelliteTree").parent().addMCustomScrollbar();
	}
	
})(jQuery,_pageObject,_pageObject.SATELLITE={});