var _pageObject = _pageObject || {};
(function(parent,module){
	module.parent = parent;
	let _this = module,
		_moduleName = "module.weixing.draw",
		_moduleNameMB = _moduleName+".feature.mubiao",
		_moduleNameMBLine = _moduleNameMB+".line";
	
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
	module.setDrawLine = function(option){

		$.each(option, function(index,el) {
        	drawFeatureLine(el);
        });
        
		function drawFeatureLine(obj){
			if(!obj.lineString){
				return;
			}
			let _format = new ol.format.WKT();
			let _feature;
			try{
				_feature = _format.readFeature(obj.lineString, {
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
	            color: 'rgba(255,0,0,0.1)',
	        });
	        let _stroke = new ol.style.Stroke({
	            color: '#3399CC',
	            width: 1,
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
				placement : "point",
				textAlign : "center"
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
	
	module.testDraw = function(center,name){
		let _geometry = new ol.geom.Circle(center,1000000);
		let _geometryPolygon = ol.geom.Polygon.fromCircle(_geometry);
		let _feature = new ol.Feature();
		_feature.setGeometry(_geometryPolygon);
//		
//		//["a","b","c"].splice(0,1);
//		
//		var format = new ol.format.WKT();
//		let _wktString = format.writeFeature(_feature,{
//			dataProjection: 'EPSG:4326',
//	        featureProjection: 'EPSG:3857'
//		});
//	    
////		console.info(_wktString);
//		
//		let _newArray = [];
//		$.each(_geometryPolygon.getCoordinates(), function(index,el) {
//			$.each(el, function(i,e) {
//				let _point = ol.proj.transform(e,'EPSG:3857','EPSG:4326');
//				_newArray.push(_point);
//			});
//		});
//		
//		let _drawArray = [];
//		_drawArray.push({
//			id : WebLoader.createUUID(),
//			color : "red",
//			name : "测试",
//			lineString : _newArray.toLINESTRING()
//		});
//		this.setDrawLine(_drawArray);
		
//		 let _image = new ol.style.Icon({
//          rotation: 0,
//          scale : 0.5,
//          offsetY : -120,
//          src: "/zhts/html/static/images/satellite/other.png"
//      });
//      let _pointFeature = new ol.Feature({
//      	geometry : new ol.geom.Point(center),
//      });
//      _pointFeature.setStyle([
//      	new ol.style.Style({
//  			image : _image
//  		})
//      ]);
//      _layerSource.addFeature(_pointFeature);
		
		let _lineFeature = new ol.Feature();
		let _lineGeom = new ol.geom.LineString([center,_geometryPolygon.getCoordinates()[0][0]]);
			_lineFeature.setGeometry(_lineGeom);
		
		//a.getGeometry().rotate(90,[13358338.89519283, 3503549.843504374])
		let _lineArray = [];
		let _int = 6;
		let _agl = 360/_int
		let _geom = _lineFeature.getGeometry();
		while (_int--){
			let _coordinate = _geom.getCoordinates();
			_lineArray.push(ol.proj.transform(_coordinate[1],'EPSG:3857','EPSG:4326'));
			_geom.rotate(_agl * Math.PI / 180,_coordinate[0]);
		}
		_lineArray.push(_lineArray[0]);
		_lineArray = [_lineArray];
		
		let _drawLineArray= [];
		_drawLineArray.push({
			id : WebLoader.createUUID(),
			color : "red",
			name : name,
			lineString : _lineArray.toPOLYGON()
		});
		this.setDrawLine(_drawLineArray);
	}
	
	module.init = function(option){
		_option = option;
		_map = _option.map;
		ol = option.ol;
		
		if(!this.__isInit){
			_layer = parent.MAPCONTROL.getModuleLayerByName(_moduleName);
			if(_layer){
				_map.removeLayer(_layer);
			}
			_layer = (function(){
				return new ol.layer.VectorImage({
					name: _moduleName,
					layerName : _moduleName,
					moduleName : _moduleName,
					source: new ol.source.Vector()
				})
			})();
			_layer.setVisible(false);
			_map.addLayer(_layer);
			_layerSource = _layer.getSource();
			this.initInteraction(option);
			this.__isInit = true;
		}
		
		let _fs = _layerSource.getFeatures();
		let _sourceF = null;
		let _center = ol.proj.transform([120,30],'EPSG:4326','EPSG:3857');
		this.testDraw(_center,"卫星波束-1");
		_fs = _layerSource.getFeatures();
		_sourceF = _fs[_fs.length-1];
		
		//画一条指向线
		let _lineFeature = new ol.Feature();
		let _lineGeom = new ol.geom.LineString([_center,[
				_sourceF.getGeometry().getCoordinates()[0][0][0]+1000000,
				_sourceF.getGeometry().getCoordinates()[0][0][1]
			]]);
			_lineFeature.setGeometry(_lineGeom);
			_layerSource.addFeature(_lineFeature);
		
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-2");
		_fs = _layerSource.getFeatures();
		let _f = _fs[_fs.length-1];
		_f.getGeometry().rotate(360/6*Math.PI/180,_f.getGeometry().getCoordinates()[0][3%6]);
		
		//旋转线
		let _agl = 360/6*Math.PI/180;
		_lineFeature.getGeometry().rotate(_agl,_lineFeature.getGeometry().getCoordinates()[0]);
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-3");
		_fs = _layerSource.getFeatures();
		_f = _fs[_fs.length-1];
		_f.getGeometry().rotate(_agl,_f.getGeometry().getCoordinates()[0][4%6]);
		
		//旋转线
		_lineFeature.getGeometry().rotate(_agl,_lineFeature.getGeometry().getCoordinates()[0]);
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-4");
		_fs = _layerSource.getFeatures();
		_f = _fs[_fs.length-1];
		_f.getGeometry().rotate(_agl,_f.getGeometry().getCoordinates()[0][5%6]);
		
		//旋转线
		_lineFeature.getGeometry().rotate(_agl,_lineFeature.getGeometry().getCoordinates()[0]);
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-5");
		_fs = _layerSource.getFeatures();
		_f = _fs[_fs.length-1];
		_f.getGeometry().rotate(_agl,_f.getGeometry().getCoordinates()[0][6%6]);
		
		//旋转线
		_lineFeature.getGeometry().rotate(_agl,_lineFeature.getGeometry().getCoordinates()[0]);
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-6");
		_fs = _layerSource.getFeatures();
		_f = _fs[_fs.length-1];
		_f.getGeometry().rotate(_agl,_f.getGeometry().getCoordinates()[0][7%6]);
		
		//旋转线
		_lineFeature.getGeometry().rotate(_agl,_lineFeature.getGeometry().getCoordinates()[0]);
		this.testDraw(_lineFeature.getGeometry().getCoordinates()[1],"卫星波束-7");
		_fs = _layerSource.getFeatures();
		_f = _fs[_fs.length-1];
		_f.getGeometry().rotate(_agl,_f.getGeometry().getCoordinates()[0][8%6]);
		
		//删除指向线
		_layerSource.removeFeature(_lineFeature);
		
		return this;
	}
	
})(_pageObject,_pageObject.WEIXING_DRAW={});