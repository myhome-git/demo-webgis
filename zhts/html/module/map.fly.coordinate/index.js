var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

/**
 * 模块入口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.MAPFLIGHTCOORDINATE.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 地图定位模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,
		ol;
	
	/**
	 * 取出表单数据
	 */
	module.getFormCoordinate = function(){
		return $doc.getElValue();
	}
	
	/**
	 * 定位位置
	 */
	module.setPosition = function(data){
    	let _control = getModuleWindowPageObjectByName("system.main").MAPCONTROL;
    	let _coordinates = _control.formatLonLat([Number(data.x),Number(data.y)],'EPSG:4326','EPSG:3857');
    	_control.getMap().getView().animate({
    		center: _coordinates,
    		projection: 'EPSG:3857',
    	},{
    		zoom : 10
    	});
	}
	
	module.bindEvent = function(){
		$doc.find("input[x-input-name]").on("keyup",function(event){
			if(event.keyCode==13){
				let _data = _this.getFormCoordinate();
				_this.setPosition(_data);
				
				//关闭父层
				xUtilBase.closeLayuiLayerWindow();
			}
		});
	}
	
	module.init = function(){
		$doc = $("#blog-add");
		this.bindEvent();
	}
	
})(jQuery,_pageObject,_pageObject.MAPFLIGHTCOORDINATE={});