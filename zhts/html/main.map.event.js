var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
    	/**
    	 * 标绘，转换事件
    	 */
        module.MAPEVENT.PLOT_ONSELECT_TRANSFORMINTERACT = (function(){
			function onEvent(e){
				let _iframe = getModuleWindowByName("module.plot.draw.attribute");
	        	if(_iframe && _iframe._ClassDrawAttributeMain && e.feature){
	        		//清空
	        		if(_iframe._ClassDrawAttributeMain.feature){
	        			_iframe._ClassDrawAttributeMain.feature = null;
	        		}
					
					//解析feature
					let _default = _iframe._ClassDrawAttributeMain.GetFeatureAttribute(e.feature);
					_iframe._ClassDrawAttributeMain.SetPanel(_default);
	        	}
			}
			
			let _ref = new transformInteraction({
				map: _pageObject.MAP.getMap(),
				callback : {
					onSelect : onEvent,
					onChangeFeature : onEvent
				}
			})
			return _ref;
		})();
		
    }
})(jQuery,_pageObject);


/**
 * 地图控制模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module;
	
	/**
	 * 标绘onSelect
	 */
	module.PLOT_ONSELECT = (function(){
		let module = new ol.interaction.Select({style:null});
		module.set("__type","plot-draw-select");
		module.on('select', function(e) {
			console.info("图层被选择 select",e);
			if(e.selected.length>0){
				let _feature = e.selected[0];
				
				//判断如果是plot模块
				if(_feature.get("isPlot")){
					//保持窗口开启
					let _module = getModuleWindowPageObjectByName("module.plot.main");
					_module.LEFTPANEL.openDrawAttribute({
						callback : {
							complete : function(){
								let _iframe = getModuleWindowByName("module.plot.draw.attribute");
					        	if(_iframe && _iframe._ClassDrawAttributeMain){
					        		let _default = _iframe._ClassDrawAttributeMain.GetFeatureAttribute(_feature);
									_iframe._ClassDrawAttributeMain.SetPanel(_default);
					        	}
							}
						}
					});
					
//					var a = _this.PLOT_ONSELECT_TRANSFORMINTERACT;
//					var b = a.getInteraction();
//					b.setActive(true);
				}
			}
			
//	        this.getFeatures().clear();
//			this.changed();
		});
		return module;
	})();
	
})(jQuery,_pageObject,_pageObject.MAPEVENT={});