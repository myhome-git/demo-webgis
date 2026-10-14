var _pageObject = _pageObject || {};
(function(parent,module){
	module.parent = parent;
	let _this = module,
		_moduleName = "module.fence.draw";
	
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
					feature.draggable = true;
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
//			this.getFeatures().clear();
//			this.changed();
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
        		_callback["draw.Circle.drawend"](e);
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
        	
        	if(_callback["modify.modifyend"]){
        		_callback["modify.modifyend"](e);
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
//			console.info("当前feature类型："+type);
		var _this = this;
		_this._wktOther = {};
		_this._wktString = undefined;
		
		let _newFeature;
		if(type=="Circle"){
			if(feature.getGeometry().getCenter){
				var center = feature.getGeometry().getCenter();
				_this._wktOther = {
    				areaType : 1,
    				centerX : center[0],
    				centerY : center[1],
    				radius : feature.getGeometry().getRadius() || null
    			};
    			
    			//使用新的feature
    			_newFeature = new ol.Feature({
    				geometry : ol.geom.Polygon.fromCircle(feature.getGeometry())
    			});
			}
		}else if(type=="Polygon"){
			_this._wktOther.areaType = 3;
		}
		
		feature.set("__module",_moduleName);
		feature.set("__type",type);
		feature.set("__other",_this._wktOther);
		
		try{
			let _cloneStyle = $.extend(true,{},_layer.getStyle()()[0]);
			feature.setStyle(_cloneStyle);
		}catch(e){
			//TODO handle the exception
		}
		
		var format = new ol.format.WKT();
		_this._wktString = format.writeFeature(_newFeature || feature,{
	        dataProjection: 'EPSG:4326',
	        featureProjection: 'EPSG:3857'
	    });
	    
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
	
	/**
	 * 取出选中Features
	 */
	module.getSelectFeatures = function(){
		try{
			return _interaction.select.getFeatures().getArray()
		}catch(e){
			return _interaction.select.getFeatures();
		}
	}
	module.getFeatures = function(){
		try{
			return _layerSource.getFeatures().getArray();
		}catch(e){
			return _layerSource.getFeatures();
		}
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
            color: 'rgba(255,255,255,0.3)',
        });
        let stroke = new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25,
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
		_map.getView().fit(feature.getGeometry());
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
		_map.getView().fit(feature.getGeometry());
		return this;
	}
	
	/**
	 * 设置填充颜色
	 * @param {Object} feature
	 * @param {Object} color
	 */
	module.setFeatureFillColor = function(feature,color){
		return this;
		if(feature.getStyle() instanceof Function){
			return this;
		}
		if(!feature.getStyle()){
        	feature.setStyle(new ol.style.Style());
        }
		let _fill = _this.getDefaultStyle().getFill();
		let _newFill = new ol.style.Fill({
			color: color || _fill.getColor(),
		});
		feature.getStyle().setFill(_newFill);
		feature.changed();
		return this;
	}
	
	/**
	 * 设置画笔线
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
				feature.setStyle(_layer.getStyle()()[0]);
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
	 * 设置feature颜色
	 * @param {Object} color
	 */
	module.setFeatureColor = function(color){
		let _features = _layerSource.getFeatures();
		$.each(_features, function(index,el) {
	        _this.setFeatureStroke(el,color);
		});
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
				return new ol.layer.Vector({
					name: 'Vecteur',
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
	
})(_pageObject,_pageObject.FENCE_DRAW={});