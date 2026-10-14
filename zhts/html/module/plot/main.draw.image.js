var _pageObject = _pageObject || {};
/**
 * draw绘制模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,
		draw,
		ol,
		_map,
		_olLayer;
	
	//调试开关
	let _consoleSwitch = false;
	
	/**
	 * 默认样式
	 */
	module.getFeatureDefaultStyle = function(){
		return new ol.style.Style({
		    fill: new ol.style.Fill({
		        color: 'rgba(255, 255, 255, 0.2)'
		    }),
		    stroke: new ol.style.Stroke({
		        color: '#ffcc33',
		        width: 2
		    }),
		    image: new ol.style.Circle({
		        radius: 7,
		        fill: new ol.style.Fill({
		            color: 'rgba(255,204,51,0)'
		        })
		    })
		})
	}
	
	/**
	 * 取出选中
	 */
	module.getSelectedFeature = function(){
//		let _features = _olLayer.getSource().getFeatures();
//		return _features[0];
	}
	
	/**
	 * 绘制图像
	 * @param {Object} option
	 */
	module.drawImage = function(option){
        if (draw) {
			//移除上次draw事件
            _map.removeInteraction(draw);
        }
        draw = new ol.interaction.Draw({
            source: _olLayer.getSource(),
            type: "Point"
        });
        _map.addInteraction(draw);
        draw.on('drawend', function (e) {
        	
        	if(_consoleSwitch){
	    		console.info('事件被触发：drawend',e);
	    	}
        	
            // var coordinatres = e.feature.getGeometry().getCoordinates();
            // var source = _olLayer.getSource();
           // e.feature.setStyle(_this.getFeatureDefaultStyle());
			
            // var point = new ol.geom.Point(coordinatres);
            // var feature = new ol.Feature();
            // feature.setGeometry(point);
            
            //自定义数据
            for(let i in option.set){
            	e.feature.set(i,option.set[i]);
            }
            
             e.feature.setStyle(option.style);
            // source.addFeature(feature);
            _map.removeInteraction(draw);
            
            if(option.callback && option.callback.complete){
            	option.callback.complete(e.feature);
            }
        });
	}
	
	module.init = function(){
		let _winMain = getModuleWindowByName("system.main");
		ol = _winMain.ol;
		_map = _winMain._pageObject.MAP.getMap();
		
		_map.getLayers().getArray().forEach(function(el,index){
			if(el.get("layerName")=="ol-plot-vector-layer"){
				_olLayer = el;
			}
		});
		if(!_olLayer){
			_olLayer = new ol.layer.Vector({
				layerName : "ol-plot-vector-layer",
			    source:new ol.source.Vector()
			});
			_map.addLayer(_olLayer);
		}
	}
	
	module.init();
	
})(jQuery,_pageObject,_pageObject.DRAWIMAGE={});