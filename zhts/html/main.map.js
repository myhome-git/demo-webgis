var _pageObject = _pageObject || {};
/**
 * 地图控制模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module,mapAPI){
	module.parent = parent;
	let _this=module,
		_moduleName = "module.map",
		$map,_map,
		$doc;
	
	/**
	 * 获取初始化后的map对象
	 */
	module.getMap = function(){
		return _map;
	}
	
	/**
	 * 恢复地图默认
	 */
	module.setReset = function(){
		let _view = _map.getView();
		_view.animate(this._default);
	}
	
	/**
	 * 获取map视图中心点,返回格式[12266122.109752484, 4146102.532393503]
	 */
	module.getViewCenterCoordinates = function(){
		return _map.getView().getCenter();
	}
	
	/**
	 * 锁定地图图层，防止拖动和点击
	 * @param {Object} _lock
	 */
	module.setMapLayerLock = function(_lock){
		if(_lock===undefined){
			_lock = true;
		}
		var _controlClassName = "map-layer-lock";
		if(_lock){
			$map.addClass(_controlClassName);
		}else{
			$map.removeClass(_controlClassName);
		}
	}
	
	/**
	 * 获取地图是否锁定
	 */
	module.getMapLayerLock = function(){
		var _controlClassName = "map-layer-lock";
		return $map.hasClass(_controlClassName);
	}
	
	/**
	 * 设置地图缩放
	 * @param {Object} _actionName
	 * @param {Object} _level
	 */
	module.setZoom = function(_actionName,_level){
		var _view = _map.getView();
		if(!_level){
			if(_actionName=="max"){
				_level = _view.getZoom() + 1;
			}else if(_actionName=="min"){
				_level = _view.getZoom() - 1;
			}
			if(_level>_view.getMaxZoom()){
				_level = _view.getMaxZoom();
			}else if(_level<0){
				_level = 0;
			}
		}
		
		//_view.setZoom(_level);
		_view.animate({zoom: _level});
	}
	
	/**
	 * 旋转地图
	 * @param {Object} _actionName
	 * @param {Object} _func
	 */
	module.setMapRotate = function(_actionName,callback){
		var _this = this;
		var _view = _map.getView();
		if(_this.getMapLayerLock() == true){
			return false;
		}
		_this.setMapLayerLock(true);
		
		//获取角度
		var _angle = _view.getRotation();
		//旋转方向
		if(_actionName=="left"){
			_angle -= Math.PI / 2;
		}else if(_actionName=="right"){
			_angle += Math.PI / 2;
		}
//			console.info(_angle);
		_view.animate({rotation: _angle},function(){
			_this.SetMapLayerLock(false);
			if(callback){
				callback();
			}
		});
	}
	
	/**
	 * 定位地图
	 * @param {Object} option
	 * @param {Object} callback
	 */
	module.animate = function(){
		_map.getView().animate(arguments);
	}
	
	/**
	 * 经纬度转换，例如：[37.41, 8.82] 转换成[12266122.109752484, 4146102.532393503]
	 * @param {Object} lon
	 * @param {Object} lat
	 */
	module.formatLonLat = function(coordinates,start,end){
		//两种效果一致
		//经纬度转至xy(EPSG:4326->EPSG:3857)
		//ol.proj.transform(coordinates,'EPSG:4326','EPSG:3857');
		//xy转至经纬度(EPSG:3857->EPSG:4326)
		//ol.proj.transform(coordinates,'EPSG:3857','EPSG:4326')
		return ol.proj.transform(coordinates, start,end);
//		return ol.proj.fromLonLat([lon, lat]);
	}
	
	/**
	 * 添加基础图层
	 */
	module.addBaseLayer = function(){
		
		let _url = getModuleURL("http.system.manage.config.layer.getEnabledLayers");
		xUtilBase.ajax({
			url : _url,
			success : function(result){
				if(result["code"]=="0"){
					onSuccessCallback(result.data);
				}
			}
		});
		
		let $ztree = $("#tree2d_baseMap");
		function onRadioChange(event,treeId, treeNode){
			let $this = $(event.target),
				$a = $this.siblings("a[treenode_a]"),
				$btn = $this.siblings(".button.chk");
			
			$btn.closest("li").siblings().find(".button.chk")
				.removeClass("radio_true_full radio_false_full checkbox_true_full checkbox_false_full")
				.addClass("radio_false_full");
			
			let _parentNode = treeNode.getParentNode() || [];
			$.each(_parentNode.children||[], function(index,el) {
				let _maplayer = _this.getModuleLayerByName(el.id);
                if(treeNode.id!=el.id && _maplayer && _maplayer.setVisible){
                	_maplayer.setVisible(false);
                }
			});
				
			if($this.prop("checked")){
				$btn.addClass("radio_true_full");
			}
			
			let _maplayer = _this.getModuleLayerByName(treeNode.id);
			if(_maplayer && _maplayer.setVisible){
            	_maplayer.setVisible($this.prop("checked"));
            }
		}
		
		function addDiyDom(treeId, treeNode) {
			var $a = $("#" + treeNode.tId + "_a");
			if (treeNode.level == 1) {
				var $radio = $("<input type='radio' name='"+treeNode.pId+"' onfocus='this.blur();' style='display:none;' />");
				$a.before($radio);
				$radio.on("change",function(e){
					onRadioChange(e,treeId,treeNode);
				});
				
				let $btn = $a.siblings(".button.chk");
				$btn.removeClass("checkbox_false_full checkbox_true_full radio_true_full")
					.addClass("radio_false_full")
					.unbind()
					.on("mouseover mouseout mousemove mousedown mouseup click",function(e){
						e.stopPropagation();
					})
					.on("click",function(e){
						$radio.trigger("click");
					});

				$a.on("click",function(e){
					$(this).removeClass("curSelectedNode");
					$radio.trigger("click");
				});
				
				$.each([treeNode], function(index,el) {
	            	let _id = el.id.toString().replace(/\./g,"-");
	            	let html = `<div class = 'layer-opacity-slider' style='display: inline-block;width: 100px;'> 
			            <div id = 'layer-opacity-slider-${_id}'>
			            </div>
			        </div>`;
			        
			        $a.after(html);
	            	layui.slider.render({
		                elem: `#layer-opacity-slider-${_id}`,
		                input: false, //输入框
		                value: 100,
		                tips: false,
		                change: (value) => {
		                    let _maplayer = _this.getModuleLayerByName(el.id);
		                    if(_maplayer && _maplayer.setOpacity){
		                    	_maplayer.setOpacity(value/100);
		                    }
		                },
		            });
	            });
			}
		}
		
		function onSuccessCallback(data){
			
			if(!data || data.length<1){
				return;
			}
			
			let _rootNodes = [{
				pId : 0,
				name : "基础图层",
				id : "module.MAP.LAYER.GROUP.JCTC",
				type : ZKMap.LayerType.VECTOR,
				open : true,
				nocheck : true
			}];
			let _root0 = _rootNodes[0];
			let _children = [];
			let _defaultlayerIndex;
			$.each(data, function(index,el) {
				if(el.defaultlayer){
					_defaultlayerIndex = index;
				}
				
				let _node = {
					pId : _root0.id,
					name : el.layerName,
					id : _root0.id+"."+el.id,
					type:ZKMap.LayerType[el.layerType]
				};
				_children.push(_node);
				try{
					_beyonmap.getLayerManager().addLayer({
						type:_node.type,
						crossOrigin: 'Anonymous',
						url:el.layerUrl,
						name : el.layerName,
						moduleName : _node.id,
						visible : false
					});
				}catch(e){
					console.error("图层添加失败，请核对相关参数，具体错误信息："+e.message);
				}
				
			});
			_root0.children = _children;
			
			let treeObj = $.fn.zTree.getZTreeObj($ztree.attr("id"));
			$.extend(true, treeObj.setting, {
				view : {
					addDiyDom : addDiyDom
				}
			});
			treeObj.addNodes(null,0,_rootNodes);
			
			//默认选中第一个
			let _c0 = treeObj.getNodeByParam("id", _root0.children[_defaultlayerIndex].id, null);
			let $li = $ztree.find("#"+_c0.tId);
			$li.find(">.button.chk").trigger("click");

			setTimeout(function(){
				//关闭之前加载的默认图层
				let _maplayer = _this.getModuleLayerByName("module.MAP.LAYER.GROUP.JCTC.default");
		        if(_maplayer && _maplayer.setVisible){
		        	_maplayer.setVisible(false);
		        }
			},1000);
		}
	}
	
	/**
	 * 添加叠加图层
	 */
	module.addDJLayer = function(){
		
		let _rootNodes = [{
			pId : 0,
			name : "叠加图层",
			id : "module.MAP.LAYER.GROUP.DJ",
			type : ZKMap.LayerType.VECTOR,
			checked : true,
			open : true
		}];
		
		let _root0 = _rootNodes[0];
		let _children = [];
		_children.push({name : "量算图层",id : _root0.id+".LIANGSUAN",type:ZKMap.LayerType.VECTOR});
		_children.push({name : "标绘图层",id : _root0.id+".BIAOHUI",type:ZKMap.LayerType.VECTOR});
		_children.push({name : "栅格图层",id : _root0.id+".GRID",type:ZKMap.LayerType.VECTOR});
		_children.push({name : "晨昏图层",id : _root0.id+".CHENHUN",type:ZKMap.LayerType.VECTOR});
		_children.push({name : "卫星图层",id : _root0.id+".SATELLITE",type:ZKMap.LayerType.VECTOR});
		_children.push({name : "波束图层",id : "module.weixing.draw",type:ZKMap.LayerType.VECTOR});
		_root0.children = _children;
		
		let _group = mapAPI.getLayerManager().addLayerGroup({
			name : _root0.id,
			type : _root0.type,
			moduleName : _root0.id
		});
		$.each(_children,function(index,el){
			el.pId = _root0.id;
			el.checked = _root0.checked;
			if(/LIANGSUAN$/.test(el.id)){
				$.each(_this.getLayerArray(), function(i,e) {
					if(e.get("title")=="量算图层"){
						e.set("moduleName",el.id);
					}
				});
			}else if(/CHENHUN$/.test(el.id)){
				let daynightLy = _group.addDayNightLayer({
					id:el.id,
					type:el.type,
					visible:false,
					moduleName:el.id,wrapX:true,
					name: '晨昏图层',
					style: {
						fill: {
							color: [0, 0, 0, .5]
						}
					}
				});
				el.checked =false;
			}else if(/module.weixing.draw$/gi.test(el.id)){
				el.checked =false;
			}else{
				_group.addLayer({id:el.id,name:el.id,type:el.type,visible:true,moduleName:el.id,wrapX:true});
			}
		});
		
//		this.addTestFeature();
		
		//复选框事件
        function onCheck(event, treeId, treeNode) {
//          let treeObj = $.fn.zTree.getZTreeObj(treeId);
//          let nodes = treeObj.getCheckedNodes(true);
            let _maplayer = _this.getModuleLayerByName(treeNode.id);;
            if(_maplayer){
            	_maplayer.setVisible(treeNode.checked);
            	//_maplayer instanceof ol.layer.Group
            }
        }

        let _setting = {
            check: {
                enable: true,
                chkStyle: "checkbox",
//              chkStyle: "radio",
                autoCheckTrigger : true
            },
            data: {
                simpleData: {
					enable: true
				}
            },
            callback: {
                onCheck: onCheck,
            }
        };
        
        let _classZTree = new ClassZTree();
        let $ztree = $("#tree2d_baseMap");
        _classZTree.init({
            element: $ztree,
            setting: _setting,
            zNodes: _rootNodes,
        });
        $ztree.parent().addMCustomScrollbar();
        
        //增加滑块条
        layui.use('slider', () => {
            $.each(_children, function(index,el) {
            	let _id = el.id.toString().replace(/\./g,"-");
            	let html = `<div class = 'layer-opacity-slider' style='display: inline-block;width: 100px;'> 
		            <div id = 'layer-opacity-slider-${_id}'>
		            </div>
		        </div>`;
		        
		        let $a = $ztree.find(".level1 > a:eq("+index+")");
		        $a.after(html);
            	layui.slider.render({
	                elem: `#layer-opacity-slider-${_id}`,
	                input: false, //输入框
	                value: 100,
	                tips: false,
	                change: (value) => {
	                    let _maplayer = _this.getModuleLayerByName(el.id);
	                    if(_maplayer && _maplayer.setOpacity){
	                    	_maplayer.setOpacity(value/100);
	                    }
	                },
	            });
            });
        });
	}
	
	module.addTestFeature = function(){
		let _tLayer = this.getModuleLayerByName("module.MAP.LAYER.GROUP.DJ.LIANGSUAN");
		let _tData = {"_wktString":"POLYGON((113.781150476284 16.671272942687,113.76040046938 16.8729889119461,113.698947859798 17.0667501529587,113.599154236861 17.2451436371221,113.464854613533 17.4013652306975,113.301210049022 17.5294733766958,113.114509312171 17.6246077975063,112.911927207592 17.6831663465509,112.701248851957 17.702934843781,112.490570496321 17.6831663465509,112.287988391743 17.6246077975063,112.101287654891 17.5294733766958,111.937643090381 17.4013652306975,111.803343467053 17.2451436371221,111.703549844115 17.0667501529587,111.642097234533 16.8729889119461,111.62134722763 16.671272942687,111.642097234533 16.4693440781877,111.703549844115 16.2749765746684,111.803343467053 16.0956757872952,111.937643090381 15.9383840070855,112.101287654891 15.8092057290811,112.287988391743 15.7131641369452,112.490570496321 15.6539994572784,112.701248851957 15.6340181194362,112.911927207592 15.6539994572784,113.114509312171 15.7131641369452,113.301210049022 15.8092057290811,113.464854613533 15.9383840070855,113.599154236861 16.0956757872952,113.698947859798 16.2749765746684,113.76040046938 16.4693440781877,113.781150476284 16.671272942687))","centerX":12545845.63396583,"centerY":1882592.5921300102,"radius":120214.09892691486};
		try{
			_tData = JSON.parse(_tData);
		}catch(e){
			//TODO handle the exception
		}
		var format = new ol.format.WKT();
		var feature = format.readFeature(_tData._wktString,{
	        dataProjection: 'EPSG:4326',
	        featureProjection: 'EPSG:3857'
	    });
	    let geometry = new ol.geom.Circle([_tData.centerX,_tData.centerY],_tData.radius);
		feature.setGeometry(geometry);
		let fill = new ol.style.Fill({
            color: 'rgba(255,255,255,0.3)',
        });
        let stroke = new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25,
        });
     	let _style =  new ol.style.Style({
            fill: fill,
            stroke: stroke,
        });
        feature.setStyle(_style);
	    
//      this.setFeatureToWKT(feature,"Polygon");
        _tLayer.getSource().addFeature(feature);
        setTimeout(function(){
        	_map.getView().fit(feature.getGeometry());
        },1000);
	}
	
	/**
	 * 根据名称取出module layer
	 * @param {Object} name
	 */
	module.getModuleLayerByName = function(name){
		let _lay;
		$.each(this.getLayerArray(), function(index,el) {
			if(el.get("moduleName")==name){
				_lay = el;
			}
		});
		return _lay;
	}
	
	/**
	 * 获取所有图层
	 * @param {Object} layers
	 */
	module.getLayerArray = function(){
		let _layers=[];
		function getArray(layers){
			$.each(layers, function(index,el) {
				if(el instanceof ol.layer.Group){
					_layers.push(el);
					getArray(el.getLayers().getArray());
				}else{
					_layers.push(el);
				}
			});
		}
		getArray(_map.getLayers().getArray());
		return _layers;
	}
	
	/**
	 * 坐标点转换为px
	 * @param {Object} coordinate
	 */
	module.transformCoordinateToPixel = function(coordinate){
		return _map.getPixelFromCoordinate(coordinate);
	}
	
	/**
	 * 根据屏幕坐标点返回feature
	 * @param {Object} pixel
	 */
	module.getFeatureByPixel = function(pixel){
		return _map.forEachFeatureAtPixel(pixel, function (feature) {
			return feature;
        });
	}
	
	module.setFeaturePositionAnimateById = function(id){
		let _ZHTS_SSTS_MUBIAO_CONTROL = parent.ZHTS_SSTS_MUBIAO_CONTROL;
		if(!_ZHTS_SSTS_MUBIAO_CONTROL){
			console.warn("模块不存在");
			return;
		}
		let _feature = _ZHTS_SSTS_MUBIAO_CONTROL.getFeatureById(id);
    	if(!_feature){
    		console.warn("目标不存在");
    		return;
    	}
    	
    	if(!_feature.visible){
    		console.warn("目标被隐藏");
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
			_feature.changed();
		});
	}
	
	module.getTest = function(){
		$.each(this.getLayerArray(), function(index,el) {
			if(el.get("title") && el.get("title")=="量算图层"){
				let _moduleName = "module.MAP.LAYER.GROUP.DJ.LIANGSUAN";
            	let _mapLayer = _this.getModuleLayerByName(_moduleName);
            	_mapLayer.set("moduleName","module_temp");
            	_mapLayer = el;
            	_mapLayer.set("moduleName",_moduleName);
			}
		});
	}
	
	module.init = function(map){
		_map = map;
		$map = $(_map.getTarget());
		this.addDJLayer();
		this.addBaseLayer();
		
		//map2d.layerManager.getLayersByWhere([{key:'title',value:'量算图层'}])
		
		//设置默认
		function getMapDefault(){
			let _view = _map.getView();
			if(_view.getZoom()){
				_this._default = {
					center : _map.getView().getCenter(),
					zoom : _map.getView().getZoom()
				};
			}else{
				setTimeout(getMapDefault,500);
			}
		}
		// getMapDefault();
		
		parent.FENCE_DRAW_SHOW.init({
			map : _map,
			ol : ol
		});
		
		parent.WUQI_XIAONENG_DRAW_SHOW.init({
			map : _map,
			ol : ol
		});
		
		parent.WEIXING_DRAW.init({
			map : _map,
			ol : ol
		});
	}
	
})(jQuery,_pageObject,_pageObject.MAPCONTROL={},_beyonmap);