var _pageObject = _pageObject || {};
(function(parent,module){
	module.parent = parent;
	let _this = module,
		_moduleName = "module.shouduan.chaxun.draw",
		_moduleNameMB = _moduleName+".feature.mubiao",
		_moduleNameMBLine = _moduleNameMB+".line",
		_moduleNameZHANDIAN = _moduleName+".feature.zhandian";
	
	/**
	 * 声明对象
	 */
	let _option,
		_map,_layer,_layerSource,
		ol,
		
		_interaction,
		_interactionFeatureDragEnd,
		
		_callback = {
			"draw.Circle.drawend" : undefined
		};
		
	let _moduleRegexp = new RegExp(_moduleName);
	
	module.getModuleName = function(){
		return _moduleName;
	}
	
	/**
	 * 初始化事件
	 */
	module.initInteraction = function(){
		//绘制接口
		_interaction = {
			select : new ol.interaction.Select({
				filter : function(feature){
					if(!_moduleRegexp.test(feature.get("__module"))){
						return false;
					}
					
					feature.draggable = false;
					return true;
				}
			}),
			draw : {
				Circle: new ol.interaction.Draw({
					source: _layerSource,
					type: 'Circle'
				}),
				Polygon : new ol.interaction.Draw({
					source: _layerSource,
					type:'Polygon'
				}),
			},
			modify: new ol.interaction.Modify ({
		        source: _layerSource,
		        // insertVertexCondition: function(){ return false; }
		    }),
		};
		
		function onInteractionSelect(e){
			e.stopPropagation();
			if(e.selected.length<1){
				return false;
			}
			
			let _feature = e.selected[0];
			if(_callback["draw.select"]){
        		_callback["draw.select"](_feature);
        	}
			
			this.getFeatures().clear();
			this.changed();
		}
		_interaction.select.on("select",onInteractionSelect);
		
		function onInteractionDrawCircleDrawEnd(e){
			let _feature = e.feature;
        	if(!_feature){
        		return;
        	}
        	
        	_this.setFeatureAttribute(_feature)
        		.changeInteractionActive(["select","modify"]);
        	
        	if(_callback["draw.Circle.drawend"]){
        		_callback["draw.Circle.drawend"](e);
        	}
		}
		_interaction.draw.Circle.on('drawend', onInteractionDrawCircleDrawEnd);
        
        function onInteractionDrawPolygonDrawEnd(e){
        	let _feature = e.feature;
        	if(!_feature){
        		return;
        	}
        	
        	_this.setFeatureAttribute(_feature)
        		.changeInteractionActive(["select","modify"]);
        	
        	if(_callback["draw.Polygon.drawend"]){
        		_callback["draw.Polygon.drawend"](e);
        	}
        }
        _interaction.draw.Polygon.on('drawend', onInteractionDrawPolygonDrawEnd);
        
        function onInteractionModifyModifyEnd(e){
        	if(!e.features || e.features.getArray().length<1){
        		return;
        	}

        	if(_callback["modify.modifyend"]){
        		_callback["modify.modifyend"](e);
        	}
        }
        _interaction.modify.on('modifyend',onInteractionModifyModifyEnd);
		this.clearInteractionActive()
			.addInteraction();
			
		_map.on('pointermove', function (e) {
	        let f = _map.forEachFeatureAtPixel(e.pixel, function (feature) {
                return feature;
            });
			
			if(_callback["map.pointermove"]){
        		_callback["map.pointermove"](e,f);
        	}
	    });
	}
	
	/**
	 * 取事件列表
	 */
	module.getInteractionArray = function() {
		return [
			_interaction.select,
			_interaction.draw.Circle,
			_interaction.draw.Polygon,
			_interaction.modify
		];
	}
	
	module.getInteractionActive = function(){
		let _array = [];
		this.getInteractionArray().forEach(function(el,index){
			_array.push(el.getActive());
		});
		return _array;
	}
	
	/**
	 * 注册事件
	 */
	module.addInteraction = function(){
		this.getInteractionArray().forEach(function(el,index){
			_map.addInteraction(el);
		});
		return this;
	}
	
	/**
	 * 移除事件
	 */
	module.removeInteraction = function () {
		this.getInteractionArray().forEach(function(el,index){
			_map.removeInteraction(el);
		});
		return this;
	}
	
	module.changeInteractionActive = function(option){
		this.clearInteractionActive();
		$.each(option || [], function(index,el) {
			if(/^select/.test(el)){
				_interaction.select.setActive(true);
			}else if(/^modify/.test(el)){
				_interaction.modify.setActive(true);
			}else if(/^draw\./.test(el)){
				let _k = el.match(/[a-z]+$/i).toString();
				_interaction.draw[_k].setActive(true);
			}
		});
		return this;
	}
	
	module.clearInteractionActive = function(){
		this.getInteractionArray().forEach(function(el,index){
			el.setActive(false);
		});
		return this;
	}
	
	/**
	 * 取出事件
	 */
	module.getInteraction = function () {
	    return _interaction;
	}
	
	/**
	 * 设置回调函数
	 * @param {Object} type
	 * @param {Object} callback
	 */
	module.setCallback = function(type,callback){
		_callback[type] = callback;
		return this;
	}
	
	module.setFeatureAttribute = function(feature){
		feature.set("__module",_moduleName);
		return this;
	}
	
	/**
	 * 取出选中Features
	 */
	module.getSelectFeatures = function(){
		return _interaction.select.getFeatures().getArray();
	}
	
	module.getFeatures = function(){
		return _layerSource.getFeatures().getArray();
	}
	
	/**
	 * 取出图层
	 */
	module.getLayer = function(){
		return _layer;
	}
	
	module.clearLayer = function(){
		_layerSource.clear();
		return this;
	}
	module.removeLayer = function(){
		_map.removeLayer(_layer);
		return this;
	}
	module.layerFitExtent = function(){
		
		try{
			let _extent = _layerSource.getExtent();
			_map.getView().fit(_extent);
		}catch(e){
			//TODO handle the exception
		}
		
		WebLoader.classGIS.animateLayerCenter(_map,_layer,ol);
		return this;
	}
	module.layerFitFeature = function(feature){
		try{
			let _extent = feature.getGeometry().getExtent();
//			_map.getView().fit(_extent);
			
			let _center = ol.extent.getCenter(_extent);
				_center = ol.proj.transform(_center,"EPSG:3857","EPSG:4326");
			WebLoader.classGIS.animateFitLayerPoint(_map,_layer,_center);
		}catch(e){
			//TODO handle the exception
		}
		return this;
	}
	
	/**
	 * 默认style
	 */
	let _styleStroke;
	module.setDefaultStyleStroke = function(stroke){
		_styleStroke = stroke;
		return this;
	}
	module.getDefaultStyle = function(){
		let fill = new ol.style.Fill({
            color: 'rgba(255,255,255,0.3)',
        });
        let stroke = new ol.style.Stroke({
            color: '#3399CC',
            width: 3,
        });
        let _text = new ol.style.Text({
			font: '12px Calibri,sans-serif',
			fill: new ol.style.Fill({
				color: "rgba(0,0,0,1)"
			}),
			stroke: new ol.style.Stroke({
				color: 'rgba(255,255,255,1)',
				width: 3
			}),
			text: "",
			offsetY: 0,
			placement : "line"
		});
		
     	return new ol.style.Style({
            fill: fill,
            stroke: _styleStroke || stroke,
            text : _text
        });
	}
	
	module.formatFeatureDefault = function(feature){
		let _style = feature.getStyle();
		if(!_style){
			return;
		}
		if(!_style.getStroke()){
			return;
		}
		return {
			width : _style.getStroke().getWidth(),
			color : _style.getStroke().getColor()
		};
	}
	
	/**
	 * 设置Feature width
	 */
	module.setFeatureStyleStrokeWidth = function(feature,width){
		try{
			let _style = feature.getStyle();
			_style.getStroke().setWidth(width);
		}catch(e){
			//TODO handle the exception
		}
		feature.changed();
		return this;
	}
	
	/**
	 * 设置Feature color
	 * @param {Object} feature
	 * @param {Object} color
	 */
	module.setFeatureStyleStrokeColor = function(feature,color){
		try{
			let _style = feature.getStyle();
			_style.getStroke().setColor(color);
			_style.getText().getFill().setColor(color);
		}catch(e){
			//TODO handle the exception
		}
		feature.changed();
		return this;
	}
	
	/**
	 * 创建目标
	 * @param {Object} obj
	 */
	module.addFeaturesMB = function(option){
		$.each(option || [], function(index,obj) {
			
			let _feature = new ol.Feature();
			if(obj.coordinates[0]<-180 || obj.coordinates[0]>180 || obj.coordinates[1]<-90 || obj.coordinates[1]>90){
				return;
			}
			
			let _point = new ol.geom.Point(ol.proj.transform(obj.coordinates,"EPSG:4326","EPSG:3857")|| [0,0]);
	        _feature.setGeometry(_point);
	        
	        let image = new ol.style.Icon({
	            rotation: 0,
	            scale : 1,
	            src: getModuleURL("system.static.map.point.image"),
	            anchor : [0.5,1]
	        });
	        let style = new ol.style.Style({
	            image: image,
	            text: new ol.style.Text({
				    font: '12px Calibri,sans-serif',
				    fill: new ol.style.Fill({
				      color: '#0033cc'
				    }),
				    stroke: new ol.style.Stroke({
				      color: '#fff',
				      width: 3
				    }),
				    text : obj.name,
				    offsetY:8,
				})
	        });
	        _feature.setStyle(style);
	        _feature.set("id", obj.id);
	        _feature.set("__module",_moduleName);
	        _feature.set("__type",_moduleNameMB);
	        _layerSource.addFeature(_feature);
		});
		return this;
	}
	module.getFeaturesMBById = function(id){
		let _f;
		let _features = _layerSource.getFeatures();
		for(let i=_features.length-1;i>-1;i--){
			let _feature = _features[i];
			if(_feature.get("__module")==_moduleName && _feature.get("__type")==_moduleNameMB && _feature.get("id")==id){
				_f = _feature;
			}
		}
		return _f;
	}
	module.clearFeaturesMB = function(){
		let _features = _layerSource.getFeatures();
		for(let i=_features.length-1;i>-1;i--){
			let _feature = _features[i];
			if(_feature.get("__module")==_moduleName && _feature.get("__type")==_moduleNameMB){
				_layerSource.removeFeature(_feature);
			}
		}
		return this;
	}
	
	/**
	 * 绘制LINE
	 * @param {Object} option
	 */
	module.getDrawColors = function(){
		return [
			"255,51,0","95,184,120","30,159,255",
			"255,87,34","255,184,0","255,140,0","255,155,0","144,238,144",
			"0,206,209","199,21,133","0,186,189","255,120,0"
		];
	}
	module.setDrawLine = function(option){
		//设定颜色和颜色队列
		let _colors = this.getDrawColors();
		$.each(_colors, function(index,el) {
			_colors[index] = "rgba("+el+",0.75)";
		});
		
		$.each(option, function(index,el) {
        	drawFeatureLine(el);
        });
        
		function drawFeatureLine(obj){
			if(!obj.lineString){
				return;
			}
			let _coordinates = WebLoader.toGeometryMultiPoint(obj.lineString);
			let _newCoordinates = _classLineStringUtil.transformMultiLineString(_coordinates);
			let _newLineString = _newCoordinates.toMULTILINESTRING();
			let _format = new ol.format.WKT();
			let _feature;
			try{
				_feature = _format.readFeature(_newLineString, {
			        dataProjection: 'EPSG:4326',
			        featureProjection: 'EPSG:3857',
			    });
			}catch(e){
				console.warn(e.message);
				return;
			}
		    
		    //设置样式
		    _feature.set("id",obj.id);
		    _feature.set("__module",_moduleName);
	        _feature.set("__type",_moduleNameMBLine);
	        _feature.set("__cache",obj);
	        
	        let _fill = new ol.style.Fill({
	            color: 'rgba(255,255,255,0.3)',
	        });
	        let _stroke = new ol.style.Stroke({
	            color: '#3399CC',
	            width: 3,
	        });
	        let _text = new ol.style.Text({
				font: '12px Calibri,sans-serif',
				fill: new ol.style.Fill({
					color: "rgba(0,0,0,1)"
				}),
				stroke: new ol.style.Stroke({
					color: 'rgba(255,255,255,1)',
					width: 3
				}),
				text: obj.name,
				offsetY: 10,
				placement : "line",
				textAlign : "right"
			});
			
	     	let _style = new ol.style.Style({
	            fill: _fill,
	            stroke: _stroke,
	            text : _text
	        });
        
		    _feature.setStyle(_style);
			try{
				if(obj.color){
					_text.getFill().setColor(obj.color);
					_stroke.setColor(obj.color);
					
					if(obj.width){
						_stroke.setWidth(obj.width);
					}
				}
				
			}catch(e){
				console.warn(e.message);
			}
//			if(obj.color=="rgba(95,184,120,0.35)"){
//				_layerSource.addFeature(_feature);
//			}
		    _layerSource.addFeature(_feature);
		}
		return this;
	}
	module.clearFeaturesLine = function(){
		let _features = _layerSource.getFeatures();
		for(let i=_features.length-1;i>-1;i--){
			let _feature = _features[i];
			if(_feature.get("__module")==_moduleName && _feature.get("__type")==_moduleNameMBLine){
				_layerSource.removeFeature(_feature);
			}
		}
		return this;
	}
	module.setDrawLinePoint = function(option){
		//设定颜色和颜色队列
		let _colors = this.getDrawColors();
		$.each(_colors, function(index,el) {
			_colors[index] = "rgba("+el+",0.75)";
		});
		$.each(option||[], function(index,el) {
			drawFeaturePoint(el);
		});
		function drawFeaturePoint(obj){
			if(!obj.lineString){
				return;
			}
			
			let _feature = new ol.Feature();
			let _geometry;
			let _format = new ol.format.WKT();
			let _tempF;
			try{
				_tempF = _format.readFeature(obj.lineString, {
			        dataProjection: 'EPSG:4326',
			        featureProjection: 'EPSG:3857',
			    });
			    _geometry = new ol.geom.MultiPoint(_tempF.getGeometry().getCoordinates());
			}catch(e){
				console.warn(e.message);
				return;
			}
			
		    //设置样式
		    _feature.setGeometry(_geometry);
		    _feature.set("id",obj.id);
		    _feature.set("__module",_moduleName);
	        _feature.set("__type",_moduleNameMBLine);
	        _feature.set("__cache",obj);
	        
	     	let _style = new ol.style.Style({
	     		image: new ol.style.Circle({
                    radius:  obj.radius || 2,
                    fill: new ol.style.Fill({
                        color: obj.color || "rgba(255,255,255,0.3)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: obj.color || "red",
                        width: obj.width || 1
                    })
                }),
                fill: new ol.style.Fill({
                    color: "rgba(255,255,255,0.3)"
                }),
                stroke: new ol.style.Stroke({
                    color: obj.color || "red",
                    width: obj.width || 1
                })
	        });
		    _feature.setStyle(_style);
			
//			try{
//				let _style = _layer.getStyle()()[0].clone();
//				
//				try{
//					let _stroke = _style.getStroke();
//					if(_stroke){
//						if(obj.color){
//							_stroke.setColor(obj.color);
//						}
//						if(obj.width){
//							_stroke.setWidth(obj.width);
//						}
//					}
//					
//					let _image = _style.getImage();
//					if(_image){
//						if(obj.color){
//							_image.getStroke().setColor("rgba(0,0,0,1)"||obj.color);
//						}
//					}
//				}catch(e){
//					//TODO handle the exception
//				}
//		    	
////				_feature.setStyle(_style);
//				
//			}catch(e){
//				console.warn(e.message);
//			}
		    
	        _layerSource.addFeature(_feature);
		}
		
		return this;
	}
	module.transformLinePoint = function(type){
		let _features = _layerSource.getFeatures();
		for(let i=_features.length-1;i>-1;i--){
			let el = _features[i];
			if(el.get("__module")==_moduleName && el.get("__type")==_moduleNameMBLine){
				if(type=="point"){
					let _cache = el.get("__cache");
					_this.setDrawLinePoint([_cache]);
					_layerSource.removeFeature(el);
				}else if(type=="line"){
					let _cache = el.get("__cache");
					_this.setDrawLine([_cache]);
					_layerSource.removeFeature(el);
				}
			}
		}
		return this;
	}
	
	module.addFeaturesZHANDIAN = function(option){
		$.each(option || [], function(index,obj) {
			let _feature = new ol.Feature();
			let _point = new ol.geom.Point(ol.proj.transform(obj.coordinate,"EPSG:4326","EPSG:3857")|| [0,0]);
	        _feature.setGeometry(_point);
	        
	        let _url = "/plot-service/plot/api/getJB?JBKH=32&JBDH=13304&CC=64&JBYS=B";
	        
	        if(/^02/.test(obj.mblb)){
	        	//水面6100
	        	_url = _url.replace(/JBDH=\d+/g,"JBDH=6100");
	        }else if(/^03/.test(obj.mblb)){
	        	//空中7200
	        	_url = _url.replace(/JBDH=\d+/g,"JBDH=7200");
	        }
	        
	        let image = new ol.style.Icon({
	            rotation: 0,
	            scale : 0.5,
	            anchor : [0.5,0.6],
	            src: _url
	        });
	        let style = new ol.style.Style({
	            image: image,
	            text: new ol.style.Text({
				    font: '12px Calibri,sans-serif',
				    fill: new ol.style.Fill({
				      color: '#0033cc'
				    }),
				    stroke: new ol.style.Stroke({
				      color: '#fff',
				      width: 3
				    }),
				    text : obj.name,
				    offsetX : 10,
				    textAlign : "left"
				})
	        });
	        _feature.setStyle(style);
	        _feature.set("id", obj.id);
	        _feature.set("__module",_moduleName);
	        _feature.set("__type",_moduleNameZHANDIAN);
	        _layerSource.addFeature(_feature);
		});
	}
	module.celarFeaturesZHANDIAN = function(){
		let _features = _layerSource.getFeatures();
		for(let i=_features.length-1;i>-1;i--){
			let _feature = _features[i];
			if(_feature.get("__module")==_moduleName && _feature.get("__type")==_moduleNameZHANDIAN){
				_layerSource.removeFeature(_feature);
			}
		}
		return this;
	}
	
	/**
	 * 关闭模块
	 */
	module.close = function(){
		if(_map){
			this.removeInteraction()
				.clearLayer()
				.removeLayer();
		}
	}
	
	module.init = function(option){
		_option = option;
		_map = _option.map;
		ol = option.ol;
		
		_layer = parent.MAPCONTROL.getModuleLayerByName(_moduleName);
		if(!_layer){
			_layer = (function(){
				return new ol.layer.VectorImage({
					name: _moduleName,
					layerName : _moduleName,
					moduleName : _moduleName,
					source: new ol.source.Vector()
				})
			})();
			_map.addLayer(_layer);
			_layerSource = _layer.getSource();
			this.initInteraction(option);
		}
		
		return this;
	}
	
})(_pageObject,_pageObject.SHOUDUAN_DRAW={});