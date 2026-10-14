var _pageObject = _pageObject || {};
(function(parent,module){
	module.parent = parent;
	let _this = module,
		_moduleName = "module.wuqi.xiaoneng.draw.show",
		toastr;
	
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
	
	/**
	 * 取出模块名称
	 */
	module.getModuleName = function(){
		return _moduleName;
	}
	
	module.getMap = function(){
		return _map;
	}
	
	/**
	 * 初始化事件
	 */
	module.initInteraction = function(){
		//绘制接口
		_interaction = {
			select : new ol.interaction.Select({
				filter : function(feature){
					if(feature.get("__module")!=_moduleName){
						return false;
					}
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
				PolygonHole : new ol.interaction.DrawHole({
					layers: [ _layer ]
				})
			},
			modify: new ol.interaction.Modify ({
		        source: _layerSource,
		        // insertVertexCondition: function(){ return false; }
		    }),
//		    modifyfeature: new ol.interaction.ModifyFeature ({ 
//		        sources: _layerSource,
//		        // insertVertexCondition: function(){ return false; }
//		        // style: getStyle
//		    })
		};
		
		function onFeatureDragEnd(event){
			if(!event.target){
				return;
			}
			let _feature = event.target; 
			let _thisType = _feature.getGeometry().getType();
        	_this.setFeatureToWKT(_feature,_thisType);
		};
		
		function onInteractionSelect(e){
			if(e.selected.length<1){
				return false;
			}
			
			let _feature = e.selected[0];
			_feature.on("featuredragend",onFeatureDragEnd);
			
			let _id = _feature.getId() || _feature.get("id") || _feature.id_;
			this.getFeatures().clear();
			this.changed();
			
			if(_callback["event.select"]){
        		_callback["event.select"](_this.getFeatureById(_id));
        	}
		}
		_interaction.select.on("select",onInteractionSelect);
		
		function onInteractionDrawCircleDrawEnd(e){
			let _feature = e.feature;
        	if(!_feature){
        		return;
        	}
        	
        	_this.changeInteractionActive(["select","modify"]);
        	
        	let _thisType = _feature.getGeometry().getType();
    		
    		//处理feature，包含wkt等其它属性
        	_this.setFeatureToWKT(_feature,_thisType);
        	
        	if(_callback["draw.Circle.drawend"]){
        		_callback["draw.Circle.drawend"](_feature);
        	}
		}
		_interaction.draw.Circle.on('drawend', onInteractionDrawCircleDrawEnd);
        
        function onInteractionDrawPolygonDrawEnd(e){
        	let _feature = e.feature;
        	if(!_feature){
        		return;
        	}
        	
        	_this.changeInteractionActive(["select","modify"]);
        	
        	let _thisType = _feature.getGeometry().getType();
    		
    		//处理feature，包含wkt等其它属性
        	_this.setFeatureToWKT(_feature,_thisType);
        	
        	if(_callback["draw.Polygon.drawend"]){
        		_callback["draw.Polygon.drawend"](e);
        	}
        }
        _interaction.draw.Polygon.on('drawend', onInteractionDrawPolygonDrawEnd);
        
        function onInteractionDrawPolygonHoleDrawEnd(e){
        	let _feature = e.feature;
        	if(!_feature){
        		return;
        	}
        	
        	_this.changeInteractionActive(["select","modify"]);
        	
        	let _thisType = _feature.getGeometry().getType();
    		
    		//处理feature，包含wkt等其它属性
        	_this.setFeatureToWKT(_feature,_thisType);
        	
        	if(_callback["draw.PolygonHole.drawend"]){
        		_callback["draw.PolygonHole.drawend"](e);
        	}
        }
        _interaction.draw.PolygonHole.on('drawend', onInteractionDrawPolygonHoleDrawEnd);
        
        function onInteractionModifyModifyEnd(e){
        	if(!e.features || e.features.getArray().length<1){
        		return;
        	}

        	let _feature = e.features.getArray()[0];
        	let _thisType = _feature.getGeometry().getType();
    		
    		//处理feature，包含wkt等其它属性
        	_this.setFeatureToWKT(_feature,_thisType);
        	
        	if(_callback["event.modify.modifyend"]){
        		_callback["event.modify.modifyend"](e.features.getArray());
        	}
        }
        _interaction.modify.on('modifyend',onInteractionModifyModifyEnd);
        
        
		this.clearInteractionActive()
			.addInteraction();
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
	
	/**
	 * 取事件列表
	 */
	module.getInteractionArray = function() {
		return [
			_interaction.select,
			_interaction.draw.Circle,
			_interaction.draw.Polygon,
			_interaction.draw.PolygonHole,
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
	 * 处理feature，包含wkt等其它属性
	 * @param {Object} feature
	 * @param {Object} type
	 */
	module.setFeatureToWKT = function(feature,type){
		try{
//			let _cloneStyle = $.extend(true,{},_this.getDefaultStyle());
//			feature.setStyle(_cloneStyle);
		}catch(e){
			//TODO handle the exception
		}
		
		return this;
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
	
	module.getFeatureById = function(id){
		let _feature;
		$.each(_layerSource.getFeatures(), function(index,el) {
			let _id = el.getId() || el.get("id") ||  el.id_;
			if(_id==id){
				_feature = el;
			}
		});
		return _feature;
	}
	
	/**
	 * 取出选中Features
	 */
	module.getSelectFeatures = function(){
		return _interaction.select.getFeatures().getArray();
	}
	
	module.getFeaturesArray = function(){
		return _layerSource.getFeatures();
	}
	
	module.setFeaturePositionAnimateById = function(id){
		let _feature = this.getFeatureById(id);
    	if(!_feature){
    		console.warn("目标不存在");
    		return;
    	}
    	
    	let _view = _map.getView();
    	let _viewAnimate0 = {};
    	if(_view.getZoom()>5){
    		_viewAnimate0 = {
    			zoom : 5
    		};
    	}
    	
    	_view.animate(_viewAnimate0,{
    		center: ol.extent.getCenter(_feature.getGeometry().getExtent()),
    		projection: 'EPSG:3857',
    	},{
    		zoom : 8
    	},function(){
//	    		_view.animate({
//	    			zoom : _view.getZoom()-1
//	    		});
    	});
	}
	
	/**
	 * 清除选中Features
	 */
	module.clearSelectFeatures = function(){
		let _inter = _interaction.select;
		let _features = _inter.getFeatures();
		let _featuresArray = _features.getArray();
		for(let i=_featuresArray.length-1;i>-1;i--){
			if(_featuresArray[i].get("__module")==_moduleName){
				try{
					_layerSource.removeFeature(_featuresArray[i]);
				}catch(e){
					//TODO handle the exception
				}
			}
		}
		_features.clear();
		_inter.changed();
		return this;
	}
	
	/**
	 * 返回PolygonHole上一次绘制
	 */
	module.resetFeaturePolygonHole = function(feature){
		let _geometry = feature.getGeometry();
		
		//如果不是Polygon或者没有coordinates
		if(!_geometry.getCoordinates || !_geometry.getCoordinates()){
			return;
		}
		
		let _coordinates = _geometry.getCoordinates();
		if(_coordinates.length>0){
			_coordinates.splice(_coordinates.length-1,1);
			feature.getGeometry().setCoordinates(_coordinates);
			//判断如果空数组则清空选择
			if(_coordinates.length<1){
				this.clearInteractionSelectFeatures();
			}
		}
		return this;
	}
	
	module.getDefaultStyle = function(){
	    let fill = new ol.style.Fill({
            color: 'rgba(255,0,0,0.5)',
        });
        let stroke = new ol.style.Stroke({
            color: 'red',
            width: 1,
//          lineDash : [6]
        });
     	return new ol.style.Style({
            fill: fill,
            stroke: stroke,
        });
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
	
	/**
	 * 反显数据
	 */
	module.setDrawCircle = function(option){
		if(!option){
			return;
		}
		let format = new ol.format.WKT();
		let feature = format.readFeature(option._wktString, {
	        dataProjection: 'EPSG:4326',
	        featureProjection: 'EPSG:3857'
	    });
		
		let geometry = new ol.geom.Circle([option.centerX,option.centerY],option.radius);
		feature.setGeometry(geometry);
		
		this.setFeatureToWKT(feature,"Circle");
        _layerSource.addFeature(feature);
		return this;
	}
	
	/**
	 * 绘制矩形
	 * @param {Object} option
	 */
	module.setDrawRectangle = function(option){
		
	}
	
	//绘制多边形
	module.setDrawPolygon = function(option){
		if(!option){
			return;
		}
		var format = new ol.format.WKT();
		var feature = format.readFeature(option._wktString, {
	        dataProjection: 'EPSG:4326',
	        featureProjection: 'EPSG:3857'
	    });
	    
        this.setFeatureToWKT(feature,"Polygon");
        _layerSource.addFeature(feature);
		return feature;
	}
	
	/**
	 * 设置画笔线
	 * @param {Object} feature
	 * @param {Object} color
	 */
	module.setFeatureStroke = function(feature,color){
		if(feature.getStyle() instanceof Function){
			return this;
		}
		
		if(!color){
			return this;
		}
		
		if(!feature.getStyle()){
        	try{
				let _cloneStyle = $.extend(true,{},_layer.getStyle()()[0]);
				feature.setStyle(_cloneStyle);
			}catch(e){
				//TODO handle the exception
			}
        }
		
		let _stroke = _this.getDefaultStyle().getStroke();
		let _newStroke = new ol.style.Stroke({
			color: color || _stroke.getColor(),
            width: _stroke.getWidth(),
		});
		feature.getStyle().setStroke(_newStroke);
		feature.changed();
		return this;
	}
	
	/**
	 * 设置feature填充颜色
	 * @param {Object} feature
	 * @param {Object} color
	 */
	module.setFeatureFillColor = function(feature,color){
		if(feature.getStyle() instanceof Function){
			return this;
		}
		
		if(!color){
			return this;
		}
		
		if(!feature.getStyle()){
        	try{
				let _cloneStyle = $.extend(true,{},_layer.getStyle()()[0]);
				feature.setStyle(_cloneStyle);
			}catch(e){
				//TODO handle the exception
			}
        }
		
		feature.getStyle().setFill(new ol.style.Fill({
			color: "rgba(255,255,255,0.2)"
		}))
		feature.changed();
		return this;
	}
	/**
	 * 根据id，查找范围内的目标
	 * @param {Object} id
	 */
	module.getExtentFeaturesById = function(id,layer){
		let _array = [];
		let _feature = this.getFeatureById(id);
		if(!_feature){
			return _array;
		}
		
		//取出范围进行判断
		let _fgbj = _feature.get("__fgbj");
		let _geometry = new ol.geom.Circle(_feature.getGeometry().getCoordinates(),_fgbj);
		$.each(layer.getSource().getFeatures(), function(index,el) {
			if(_geometry.intersectsCoordinate(el.getGeometry().getCoordinates())){
				_array.push(el);
			}
		});
		return _array;
	}
	/**
	 * 添加武器
	 * @param {Object} obj
	 */
	module.addFeatureWUQI = function(obj){
//		let _geometry = new ol.geom.Point(ol.proj.fromLonLat([120,26],"EPSG:3857","EPSG:4326"));
		let _id = obj.id;
		let _feature = this.getFeatureById(_id);
		if(_feature){
			return this;
		}
		
		_feature = new ol.Feature();
		let _geometryPoint = new ol.geom.Point(ol.proj.fromLonLat([obj.jd,obj.wd]));
		_feature.setGeometry(_geometryPoint);
		_feature.setStyle(new ol.style.Style({
//			image : new ol.style.Circle({
//	            radius: 4,
//	            fill: new ol.style.Fill({
//	                color: "red"
//	            }),
//	            stroke : new ol.style.Stroke({
//		            color: 'white',
//		            width: 2,
//		        }),
//	        }),
	        image : new ol.style.Icon({
				rotation: 0,
                scale : 0.5,
                src: "/plot-service/plot/api/getJB?JBKH="+obj.jbkh+"&JBDH="+obj.jbdh+"&CC=64&JBYS=R"
	        }),
	        text : new ol.style.Text({
			    font: '12px Calibri,sans-serif',
			    fill: new ol.style.Fill({
					color: 'red'
			    }),
			    stroke: new ol.style.Stroke({
					color: 'white',
					width: 3
			    }),
			    text : obj.mc||"",
			    offsetX : 10,
			    textAlign : "left"
			})
		}));
		
        _feature.set("id",_id);
        _feature.set("__name",obj.name);
        _feature.set("__module",this.getModuleName());
        
        let _type = this.getModuleName()+".feature.wuqi";
        _feature.set("__type",_type);
        _feature.set("__fgbj",obj.fgbj);
        _feature.set("mbType",_type);
        this.getLayer().getSource().addFeature(_feature);
        this.changeInteractionActive(["select"]);
        
        this.setCallback("event.select",function(feature){
//      	console.info(feature);
        });
        
        this.setCallback("event.modify.modifyend",function(features){
//      	console.info(features);
        	try{
        		$.each(features, function(index,el) {
	        		if(el.get("__type")==_type){
	        			_this.getExtentFeaturesById(el.get("id"),parent.ZHTS_SSTS_MUBIAO_CONTROL.getLayerMuBiao());
	        		}
	        	});
        	}catch(e){
        		//TODO handle the exception
        	}
        });
	}
	module.removeFeatureWUQI = function(id){
		let _feature = this.getFeatureById(id);
		if(!_feature){
			return this;
		}
		this.clearDrawLines(_feature);
		this.clearFeatureFANWEI(_feature);
		_layerSource.removeFeature(_feature);
	}
	module.removeFeature = function(id){
		let _feature = this.getFeatureById(id);
		if(!_feature){
			return this;
		}
		_layerSource.removeFeature(_feature);
	}
	/**
	 * 绘制连接线
	 * @param {Object} feature
	 * @param {Object} features
	 */
	module.setDrawLine = function(feature,features){
		this.clearDrawLines(feature);
		
		let _mName = _this.getModuleName(),
			_WQLineType = _mName+".feature.wuqi.line";
		
		let _parentId = feature.get("id");
		let _fx,_rotation,_coordinates=[];
		$.each(features, function(index,el) {
			let _array = [feature.getGeometry().getCoordinates(),el.getGeometry().getCoordinates()];
			let _format = new ol.format.WKT();
			try{
				let _feature = _format.readFeature(_array.toLINESTRING(), {
//			        dataProjection: 'EPSG:4326',
//			        featureProjection: 'EPSG:3857',
			    });
	//		    _rotation = _rotation * Math.PI / 180;
	//		   	_feature.getGeometry().rotate(_rotation,ol.extent.getCenter(_feature.getGeometry().getExtent()));
			    _feature.setStyle(new ol.style.Style({
			    	fill : new ol.style.Fill({
			            color: 'rgba(255,0,0,1)',
			        }),
			        stroke : new ol.style.Stroke({
			            color: 'rgba(255,0,0,1)',
			            width: 1,
			        	lineDash : [2]
			        })
			    }));
			    _feature.set("__parentId",_parentId);
			    _feature.set("__module",_mName);
		        _feature.set("__type",_WQLineType);
		        _feature.set("mbType",_WQLineType);
			    _layerSource.addFeature(_feature);
			}catch(e){
				console.warn(e.message);
			}
		});
		return this;
	}
	module.clearDrawLines = function(feature){
		let _mName = _this.getModuleName(),
			_WQLineType = _mName+".feature.wuqi.line";
			
		let _parentId = feature.get("__parentId");
		if(!_parentId){
			_parentId = feature.get("id");
		}
		let _fs = _layerSource.getFeatures();
		for(let i=_fs.length-1;i>-1;i--){
			let _f = _fs[i];
			if(_f.get("__parentId")==_parentId && _f.get("__type")==_WQLineType){
				_layerSource.removeFeature(_f);
			}
		}
	}
	/**
	 * 添加feature攻击范围
	 * @param {Object} feature
	 */
	module.addFeatureFANWEI = function(feature){
		this.clearFeatureFANWEI(feature);
		
		let _parentId = feature.get("id");
		let _feature = new ol.Feature();
		
		let _fgbj = feature.get("__fgbj");
		let _geometry = new ol.geom.Circle(feature.getGeometry().getCoordinates(),_fgbj);
		_feature.setGeometry(_geometry);
		_feature.setStyle(new ol.style.Style({
			fill : new ol.style.Fill({
	            color: 'rgba(255,0,0,0.15)',
	        }),
	        stroke : new ol.style.Stroke({
	            color: 'rgba(255,0,0,0.9)',
	            width: 1,
	            lineDash : [2],
	        }),
//			text : new ol.style.Text({
//			    font: '12px Calibri,sans-serif',
//			    fill: new ol.style.Fill({
//					color: 'red'
//			    }),
//			    stroke: new ol.style.Stroke({
//					color: 'white',
//					width: 3
//			    }),
//			    text : "攻击范围",
//			    offsetX : 10,
//			    offsetY : 10,
//			    textAlign : "left",
//			})
		}));
        _feature.set("id",WebLoader.createUUID());
        _feature.set("__name","AK-47-FW");
        _feature.set("__module",this.getModuleName());
        _feature.set("__parentId",_parentId);
        
        let _type = feature.get("__type")+".fanwei";
        _feature.set("__type",_type);
        _feature.set("mbType",_type);
        this.getLayer().getSource().addFeature(_feature);
        
        _feature.__autoRadius = function(lineDashNumber){
        	lineDashNumber += 1;
        	if(lineDashNumber<2){
        		lineDashNumber = 2;
        	}else if(lineDashNumber>=10){
        		lineDashNumber = 2;
        	}
        	
        	_feature.getStyle().getStroke().setLineDash([lineDashNumber]);
        	setTimeout(function(){
        		_feature.__autoRadius(lineDashNumber);
        		_feature.changed();
        	},100);
        }
        _feature.__autoRadius(0);
	}
	module.clearFeatureFANWEI = function(feature){
		let _parentId = feature.get("__parentId");
		let _WQFWType = feature.get("__type");
		if(!_parentId){
			_parentId = feature.get("id");
			_WQFWType += ".fanwei";
		}
		let _fs = _layerSource.getFeatures();
		for(let i=_fs.length-1;i>-1;i--){
			let _f = _fs[i];
			if(_f.get("__parentId")==_parentId && _f.get("__type")==_WQFWType){
				_layerSource.removeFeature(_f);
			}
		}
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
		toastr = top.toastr;
		
		_layer = parent.MAPCONTROL.getModuleLayerByName(_moduleName);
		if(!_layer){
			_layer = (function(){
				return new ol.layer.Vector({
					name: 'Vecteur',
					moduleName : _moduleName,
					source: new ol.source.Vector()
				})
			})();
			_map.addLayer(_layer);
		}
		
		_layerSource = _layer.getSource();
		this.initInteraction(option);
		parent.WUQI_XIAONENG_DRAW_SHOW_CONTEXTMENU.init();
//		this.testWUQI();
		return this;
	}
	
})(_pageObject,_pageObject.WUQI_XIAONENG_DRAW_SHOW={});


/**
 * 实时态势右键菜单
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module,
		_callback = {},
		_cacheDblclickFeature;
	
	let _WUQI_XIAONENG_DRAW_SHOW,
		_mapAPI=top._beyonmap,
		_map;
		
	/**
	 * set get callback
	 */
	module.setCallback = function(type,callback){
		_callback[type] = callback;
		return this;
	}
	module.getCallback = function(type){
		return _callback[type];
	}
	
	module.setCacheDblclickFeature = function(feature){
//		console.info("准备缓存feature",feature);
		_cacheDblclickFeature = feature;
		return this;
	}
	module.getCacheDblclickFeature = function(){
//		console.info("取出缓存feature",_cacheDblclickFeature);
		return _cacheDblclickFeature;
	}
	
		function randomGJPD(){
			return parseInt(Math.random()*10+1);
		}
		
		function randomGJBC(){
			return parseInt(Math.random()*10+1);
		}
		
		function randomGJSC(){
			return parseInt(Math.random()*40+10);
		}
		
		function randomGJXG(){
			let _array = ["普通","好","最佳"];
			let _index = parseInt(Math.random()*2+1);
			return _array[_index];
		}
		
	module.bindClickRightCallback = function(eventName,obj,map){
		let _mName = _WUQI_XIAONENG_DRAW_SHOW.getModuleName().toLowerCase(),
			_regExpMuBiao = new RegExp("^"+_mName+".mubiao"+"$","i"),
			_regExpMuBiaoChildren = new RegExp("^"+_mName+".mubiao","i");
		
		let _feature = this.getCacheDblclickFeature();
		if(!_feature){
			return;
		}
		
    	switch (eventName){
        	case "gongjixiaoneng":
        		let _array = _WUQI_XIAONENG_DRAW_SHOW.getExtentFeaturesById(_feature.get("id"),PAGEOBJECT.ZHTS_SSTS_MUBIAO_CONTROL.getLayerMuBiao());
        		_WUQI_XIAONENG_DRAW_SHOW.setDrawLine(_feature,_array);
				_WUQI_XIAONENG_DRAW_SHOW.addFeatureFANWEI(_feature);
				
        		let _arrayData = [];
				$.each(_array, function(index,el) {
					_arrayData.push({
						name : el.get("__name"),
						gjpd : randomGJPD(),
						gjbc : randomGJBC(),
						gjsc : randomGJSC()+"秒",
						gjxg : randomGJXG()
					});
				});
				parent.OPENWINDOW.openWUQIGONGJIXIAONENG({
					name : _feature.get("__name"),
					data : _arrayData
				});
        		break;
        	case "quxiaogongjixiaoneng":
        		_WUQI_XIAONENG_DRAW_SHOW.clearFeatureFANWEI(_feature);
        		_WUQI_XIAONENG_DRAW_SHOW.clearDrawLines(_feature);
        		parent.OPENWINDOW.closeWUQIGONGJIXIAONENG();
        		break;
        	default:
        		break;
        }
		return this;
	}
	
	/**
	 * 弹出原始报文
	 * @param {Object} data
	 */
	module.openLayerMBXQ = function(data){
		WebLoader.layer.openWin({
			type : 1,
			title : "<i class='iconfont fa fa-bookmark-o'></i>态势点信息（"+data.mbmc+"）",
			shade : false,
			area : ["600px","660px"],
			skin : " webloader-layer webloader-layer-sm",
			content : _conetnt.join(""),
			success : function(layero,index){
				let $item0 = layero.find(".layui-tab-item:eq(0)");
				$item0.addMCustomScrollbar();
			}
		});
	}
	
	module.bindContextmenu = function(){
		if(this.__isContentMenuReg){
			return;
		}
		
		this.__isContentMenuReg = true;
		
		_mapAPI.getContextMenu().setActive(true);

		let _mName = _WUQI_XIAONENG_DRAW_SHOW.getModuleName();
			_moduleFeatureName = _mName+".feature.wuqi";
        _mapAPI.getContextMenu().menuReg([
            	{
                    text: '<i class="iconfnot fa fa-ticket"></i>&nbsp;&nbsp;攻击效能',
                    classname: 'bold',
                    type:_moduleFeatureName,
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("gongjixiaoneng",a,b);
                    }
                },
                {
                    text: '<i class="iconfnot fa fa-ticket"></i>&nbsp;&nbsp;取消攻击效能',
                    classname: 'bold',
                    type:[_moduleFeatureName+".fanwei",_moduleFeatureName+".line"],
                    filter:function (feature) {
                    	_this.setCacheDblclickFeature(feature);
                        return true;
                    },
                    callback : function(a,b){
                    	_this.bindClickRightCallback("quxiaogongjixiaoneng",a,b);
                    }
                },
            ]);
	}
	
	module.init = function(){
		_WUQI_XIAONENG_DRAW_SHOW = parent.WUQI_XIAONENG_DRAW_SHOW;
		_map = _WUQI_XIAONENG_DRAW_SHOW.getMap();
		this.bindContextmenu();
	}
	
})(jQuery,_pageObject,_pageObject.WUQI_XIAONENG_DRAW_SHOW_CONTEXTMENU={});