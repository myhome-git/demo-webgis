/**
 *  地图操作封装，用于简化地图开发 <p>
 *  默认集成了：热力图，动态聚合图，标记图层，量算图层，普通标绘图层，动态标绘图层，态势回放，二三维一体化；
 * 
 * @param {any} mapdiv id 
 * @param {any} options 
 * @author guanml <guanminglin@beyondb.com.cn>
 */
var BeyonMap = function(mapdiv, options) {
	var m = this._init(mapdiv, options);
	this.lastSelectedFeature = null;
	this.map = m;
	if(options) {
		var _enable3DMap = options.enable3DMap || false;
		var _enableLighting = options.enableLighting || false;
		if(_enable3DMap == true) {
			this.init3DMap();
			this.ol3d.setEnabled(true);
			if(_enableLighting == true) {
				this.enableLighting(true);
			}
		}
	}
}

/**
 * 初始化地图
 * 
 * @param {element} mapdiv id 
 * @param {any} options 
 */
BeyonMap.prototype._init = function(mapdiv, options) {
	var _zoom = 3;
	var _maxZoom = 18;
	var _minZoom = 2;
	var _center = ol.proj.fromLonLat([101.4173, 37.9204]);
	var _rotation = 0;

	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(6),
		projection: 'EPSG:4326',
		undefinedHTML: '&nbsp;'
	});

	//定义弹出窗口
	var _popup = new ol.Overlay.Popup({
		popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
		closeBox: true,
		//onclose: function(){ console.log("You close the box"); },
		// onshow: function() { console.log("You opened the box"); },
		positioning: 'bottom-center',
		autoPan: true,
		offset: [1.2, -20],
		autoPanAnimation: {
			duration: 100
		}
	});

	var projection = ol.proj.get('EPSG:3857');
	var projectionExtent = projection.getExtent();
	var size = ol.extent.getWidth(projectionExtent) / 256;
	var resolutions = new Array(19);
	var matrixIds = new Array(19);
	for(var z = 0; z < 19; ++z) {
		// generate resolutions and matrixIds arrays for this WMTS
		resolutions[z] = size / Math.pow(2, z);
		matrixIds[z] = z;
		//            matrixIds[z] = "EPSG:900913:" + z;
	}

	//添加阴影
	_popup.addPopupClass('shadow');

	//定义默认标记图层
	var _markersLayer = new ol.layer.Vector({
		title: '标记图层',
                displayInLayerSwitcher: false,
		source: new ol.source.Vector({
			wrapX: false
		})
	});

	var _vectorLayer = new ol.layer.Vector({
		title: '矢量图层',
		displayInLayerSwitcher: false,
		source: new ol.source.Vector({
			wrapX: false
		})
	});

	//态势回放图层
	var _tshfLayer = new ol.layer.Vector({
		title: '态势回放图层',
		renderMode: 'image',
		declutter: false,
		source: new ol.source.Vector({
			wrapX: false
		})
	});

	//定义默认量算图层
	var _mesureLayer = new ol.layer.Vector({
		title: '量算图层',
		displayInLayerSwitcher: false,
		source: new ol.source.Vector(),
		style: new ol.style.Style({
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
					color: '#ffcc33'
				})
			})
		})
	});

	//定义默认热力图层
	var _heatmapLayer = new ol.layer.Heatmap({
		title: '热力图层',
		source: new ol.source.Vector({
			wrapX: false
		}),
		blur: parseInt(20, 10),
		radius: parseInt(4, 10),
		visible: false
	});

	
	var tdtRGroup = new ol.layer.Group({
		'title': '天地图影像',
		visible: false,
		baseLayer: true,
                displayInLayerSwitcher:false,
		openInLayerSwitcher: false,
		layers: [
			new ol.layer.Tile({
				title: '天地图影像-网络',
				type: 'base',
				visible: true,
				source: new ol.source.XYZ({
					attributions: "天地图影像",
					url: CONFIG.TDT_RasterUrl
				})
			}),
			new ol.layer.Tile({
				title: '天地图影像注记-网络',
				type: 'overlay',
				visible: true,
				source: new ol.source.XYZ({
					url: CONFIG.TDT_RasterAnoUrl
				})
			}),

		]
	});

	var tdtVGroup = new ol.layer.Group({
		'title': '天地图',
		visible: false,
		baseLayer: true,
                 displayInLayerSwitcher:false,
		openInLayerSwitcher: false,
		layers: [
			new ol.layer.Tile({
				title: '天地图电子地图',
				type: 'base',
				visible: true,
				source: new ol.source.XYZ({
					attributions: "天地图",
					url: CONFIG.TDT_VectorUrl
				})
			}),
			new ol.layer.Tile({
				title: '天地图电子地图-注记',
				type: 'overlay',
				visible: true,
				source: new ol.source.XYZ({
					url: CONFIG.TDT_VectorAnoUrl
				})
			}),

		]
	});

	var gdGroup = new ol.layer.Group({
		'title': '高德影像',
		visible: false,
		baseLayer: true,
		openInLayerSwitcher: false,
		layers: [
			new ol.layer.Tile({
				title: '高德影像',
				type: 'base',
				visible: true,
				source: new ol.source.XYZ({
					attributions: "高德影像",
					url: CONFIG.GAODE_Online_RasterUrl
				})
			}),
			new ol.layer.Tile({
				title: '高德影像注记',
				type: 'overlay',
				visible: true,
				source: new ol.source.XYZ({
					url: CONFIG.GAODE_Online_RasterAnoUrl
				})
			}),

		]
	});

	var googleMap = new ol.layer.Tile({
		title: 'Google电子地图',
		baseLayer: true,
		type: 'base',
		visible: false,
		source: new ol.source.XYZ({
			attributions: "Google电子地图",
			url: CONFIG.Google_Url
		})
	});
	var googleTrain = new ol.layer.Tile({
		title: 'Google地形图',
		baseLayer: true,
		type: 'base',
		visible: false,
		source: new ol.source.XYZ({
			attributions: "Google地形图",
			url: CONFIG.Google_Terrain
		})
	});
	
	var googleGroup = new ol.layer.Group({
		'title': 'Google影像',
		visible: true,
		baseLayer: true,
		openInLayerSwitcher: false,
		layers: [
			new ol.layer.Tile({
				title: 'Google影像',
				type: 'base',
				visible: true,
				source: new ol.source.XYZ({
					attributions: "Google影像",
					url: CONFIG.Google_RasterUrl
				})
			}),
			new ol.layer.Tile({
				title: 'Google影像注记',
				type: 'overlay',
				visible: true,
				source: new ol.source.XYZ({
					url: CONFIG.Google_RasterAnoUrl
				})
			})
		]
	});
	

	var _baseLayerGroup = new ol.layer.Group({
		'title': '基础底图',
		openInLayerSwitcher: true,
		layers: [
			tdtRGroup,
			tdtVGroup,
			googleGroup,
			googleMap,
			googleTrain,
			gdGroup,
			new ol.layer.Tile({
				title: '高德地图',
				baseLayer: true,
				type: 'base',
				visible: false,
				source: new ol.source.XYZ({
					attributions: "高德地图",
					url: CONFIG.GAODE_VECTOR
				})
			}),
			new ol.layer.Tile({
				title: '中国海图',
				type: 'base',
                                displayInLayerSwitcher:false,
				baseLayer: true,
				visible: false,
				source: new ol.source.WMTS({
					url: 'http://www.ais.msa.gov.cn/MapService',
					layer: 'default',
					matrixSet: 'advsea',
					format: "image/png",
					projection: 'EPSG:3857',
					tileLoadFunction: function(imageTile, src) {
						imageTile.getImage().src = src.replace("%2F", "/");
					},
					tileGrid: new ol.tilegrid.WMTS({
						origin: ol.extent.getTopLeft(projectionExtent),
						resolutions: resolutions,
						matrixIds: matrixIds
					}),
					style: 'default'
				})
			}),
			new ol.layer.Tile({
				title: '全球海图-偏移',
				type: 'base',
                                 displayInLayerSwitcher:false,
				baseLayer: true,
				visible: false,
				source: new ol.source.XYZ({
					url: CONFIG.HAITU
				})
			}),

			new ol.layer.Tile({
				title: '世界地图-午夜蓝',
                                displayInLayerSwitcher:false,
				baseLayer: true,
				type: 'base',
				visible: false,
				source: new ol.source.XYZ({
					url: CONFIG.ChinaOnlineStreetPurplishBlue_Url
				})
			})
		]
	});

	var _overlayersGroup = new ol.layer.Group({
		'title': '叠加图层',
		openInLayerSwitcher: true,
		layers: []
	});

	if(options) {
		_zoom = options.zoom || 3;
		_center = options.center || ol.proj.fromLonLat([101.4173, 37.9204]);
		_rotation = options.rotation || 0;
		_maxZoom = options.maxZoom || 18;
		_minZoom = options.minZoom || 2;

		//如果options中有定义图层组则使用options中提供的
		if(options.baseLayerGroup) {
			_baseLayerGroup = options.baseLayerGroup;
		}

		if(options.overlayersGroup) {
			_overlayersGroup = options.overlayersGroup;
		}
	}

	this.popup = _popup;
	this.popups = new ol.Collection([]);
	this.baseLayerGroup = _baseLayerGroup;
	this.overlayersGroup = _overlayersGroup;
	this.markersLayer = _markersLayer;
	this.heatmapLayer = _heatmapLayer;
	this.mesureLayer = _mesureLayer;
	this.vectorLayer = _vectorLayer;
	this.tshfLayer = _tshfLayer;
	this.zoom = _zoom;
	this.center = _center;
	this.rotation = _rotation;
	this.maxZoom = _maxZoom;
	this.minZoom = _minZoom;
	this.googleMap = googleMap;
	this.googleTrain = googleTrain;
	this.googleRaster = googleGroup;

	//添加默认图层
	this.overlayersGroup.getLayers().push(_mesureLayer);
	this.overlayersGroup.getLayers().push(_heatmapLayer);
	this.overlayersGroup.getLayers().push(_vectorLayer);
	this.overlayersGroup.getLayers().push(_markersLayer);
	this.overlayersGroup.getLayers().push(_tshfLayer);

	this._initClusterLayer(this.overlayersGroup);

	//定义地图对象
	var _map = new ol.Map({
		layers: [
			_baseLayerGroup,
			_overlayersGroup
		],
		// interactions: new ol.interaction.defaults({
		// 	doubleClickZoom: false, //屏蔽双击放大事件
		// }),
		controls: ol.control.defaults({
			attributionOptions: ({
				collapsible: false
			}),
		}).extend([]),
		target: document.getElementById(mapdiv),
		view: new ol.View({
			zoom: _zoom,
			center: _center,
			rotation: _rotation,
			maxZoom: _maxZoom,
			minZoom: _minZoom
		}),
		loadTilesWhileInteracting: true,
		logo: false
	});

	// 添加图层管理器
	var layerSwitcher = new ol.control.LayerSwitcher({
		tipLabel: '图层管理' // Optional label for button
	});
//	_map.addControl(layerSwitcher);

	//设置popup显示的地图
	_popup.setMap(_map);

	return _map;
};

/**
 * 经纬度转换成 度分秒
 * @param {*} value 度
 * @param {*} type  lon 或 lat
 */
BeyonMap.prototype._formatDegree = function(value, type) {

	var d = Math.floor(value);
	var f = Math.floor((value - d) * 60);
	var m = Math.round((value - d) * 360 % 60);
	var dstr = "E";
	if(type === 'lon') {
		if(d < 0) {
			dstr = "W";
		}
	}
	if(type === 'lat') {
		if(d < 0) {
			dstr = "S";
		} else {
			dstr = "N";
		}
	}
	return dstr + d + '°' + f + "′" + m + '″';
}

/**
 * 度分秒转换成经纬度
 * @param {*} value 
 */
BeyonMap.prototype._strToDegree = function(value) {
	var d = value.split("°")[0];
	var f = value.split("°")[1].split("′")[0];
	var m = value.split("°")[1].split("′")[1].split("″")[0];
	return Math.abs(d) + (Math.abs(f) / 60 + Math.abs(m) / 3600);
}

/**
 * 初始化聚合图层
 * 
 * @param {any} overlayersGroup 
 */
BeyonMap.prototype._initClusterLayer = function(overlayersGroup) {

	// Style for the clusters
	var styleCache = {};
	// Cluster Source
	var _clusterSource = new ol.source.Cluster({
		distance: 40,
		source: new ol.source.Vector()
	});
	// Animated cluster layer
	var _clusterLayer = new ol.layer.AnimatedCluster({
		name: '动态聚合图',
		source: _clusterSource,
                displayInLayerSwitcher: false,
		animationDuration: 700,
		// Cluster style
		style: function(feature, resolution) {
			var size = feature.get('features').length;
			var style = styleCache[size];
			if(!style) {
				var color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
				var radius = Math.max(8, Math.min(size * 0.75, 20));
				var dash = 2 * Math.PI * radius / 6;
				dash = [0, dash, dash, dash, dash, dash, dash];
				style = styleCache[size] = [new ol.style.Style({
					image: new ol.style.Circle({
						radius: radius,
						stroke: new ol.style.Stroke({
							color: "rgba(" + color + ",0.5)",
							width: 15,
							lineDash: dash
						}),
						fill: new ol.style.Fill({
							color: "rgba(" + color + ",1)"
						})
					}),
					text: new ol.style.Text({
						text: size.toString(),
						fill: new ol.style.Fill({
							color: '#fff'
						})
					})
				})];
			}
			return style;
		}
	});
	this.clusterLayer = _clusterLayer;
	overlayersGroup.getLayers().push(this.clusterLayer);
};

/**
 * 初始化三维地图
 * @returns {undefined}
 */
BeyonMap.prototype.init3DMap = function() {
	var _self = this;
	var clock = new Cesium.Clock();
	var ol3dmap = new olcs.OLCesium({
		map: this.map,
		time : function(){
			if(clock.currentTime) {
				return clock.currentTime
			} else {
				return Cesium.JulianDate.now();
			}
		}
	});
	this.ol3d = ol3dmap;
	var scene = this.ol3d.getCesiumScene();
	scene.sun = new Cesium.Sun();
	scene.requestRenderMode = true;
	scene.globe.enableLighting = true;
	scene.globe.depthTestAgainstTerrain = false;

	// const terrainProvider = new Cesium.CesiumTerrainProvider({
	//     url: '//assets.agi.com/stk-terrain/world',
	//     requestVertexNormals: false
	//   });
	//scene.terrainProvider = Cesium.createWorldTerrain();

	var camera = scene.camera;
	var pivot = olcs.core.pickBottomPoint(scene);
	if(pivot) {
		var options = {};
		var transform = Cesium.Matrix4.fromTranslation(pivot);
		var axis = camera.right;
		var rotateAroundAxis = olcs.core.rotateAroundAxis;
		rotateAroundAxis(camera, -Math.PI / 4, axis, transform, options);
	}
	// this.ol3d.enableAutoRenderLoop();
	scene.skyBox = new Cesium.SkyBox({
		sources: {
			positiveX: '../resources/common/images/spacebook/Version2_dark_px.jpg',
			negativeX: '../resources/common/images/spacebook/Version2_dark_mx.jpg',
			positiveY: '../resources/common/images/spacebook/Version2_dark_py.jpg',
			negativeY: '../resources/common/images/spacebook/Version2_dark_my.jpg',
			positiveZ: '../resources/common/images/spacebook/Version2_dark_pz.jpg',
			negativeZ: '../resources/common/images/spacebook/Version2_dark_mz.jpg'
		}
	});

	function onTimelineScrubfunction(e) {
		var clock = e.clock;
		clock.currentTime = e.timeJulian;
		clock.shouldAnimate = true;
	}

	// Date formatting to a global form
	function localeDateTimeFormatter(datetime, viewModel, ignoredate) {
		var julianDT = new Cesium.JulianDate();
		Cesium.JulianDate.addHours(datetime, 8, julianDT)
		var gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT)
		var objDT;
		if(ignoredate)
			objDT = '';
		else {
			objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
			objDT = gregorianDT.year + '年' + objDT.toLocaleString("zh-cn", {
				month: "short"
			}) + gregorianDT.day + '日';
			if(viewModel || gregorianDT.hour + gregorianDT.minute === 0)
				return objDT;
			objDT += ' ';
		}
		return objDT + Cesium.sprintf("%02d:%02d:%02d", gregorianDT.hour, gregorianDT.minute, gregorianDT.second);
	}

	function localeTimeFormatter(time, viewModel) {
		return localeDateTimeFormatter(time, viewModel, true);
	}

	//构建时间轴动画控制器
	var timeControlsContainer = document.getElementById('timeControlsContainer');
	var clockViewModel = new Cesium.ClockViewModel(clock);
	var animationContainer = document.createElement('div');
	animationContainer.className = 'cesium-viewer-animationContainer';
	timeControlsContainer.appendChild(animationContainer);
	var animationviewModel = new Cesium.AnimationViewModel(clockViewModel);
	animationviewModel.dateFormatter = localeDateTimeFormatter;
	animationviewModel.timeFormatter = localeTimeFormatter;
	var animation = new Cesium.Animation(animationContainer, animationviewModel);

	var timelineContainer = document.createElement('div');
	timelineContainer.className = 'cesium-viewer-timelineContainer';
	timeControlsContainer.appendChild(timelineContainer);

	// //构建全屏按钮
	var fullscreenContainer = document.createElement("div");
	fullscreenContainer.className = "cesium-viewer-fullscreenContainer";
	timeControlsContainer.appendChild(fullscreenContainer);
	var fullscreenBv = new Cesium.FullscreenButtonViewModel(fullscreenContainer);
	var fullscreenButton = new Cesium.FullscreenButton(fullscreenContainer);
	fullscreenButton.viewModel = fullscreenBv;
	// //时间轴
	var timeline = new Cesium.Timeline(timelineContainer, clock);
	timeline.addEventListener('settime', onTimelineScrubfunction, false);
	timeline.makeLabel = function(time) {
		return localeDateTimeFormatter(time)
	};
	timeline.zoomTo(clock.startTime, clock.stopTime);

	// //时刻
	var tck = function() {

		var currentTime = Cesium.JulianDate.clone(clock.currentTime);
		if(Cesium.JulianDate.greaterThan(currentTime, clock.stopTime)) {
			var st = Cesium.JulianDate.addDays(startTime, 1.0, startTime);
			var ed = Cesium.JulianDate.addDays(stopTime, 1.0, stopTime);
			timeline.zoomTo(st, ed);
		}

		requestAnimationFrame(tck);
		clock.tick();
		scene.requestRender();
	};
	tck();

	this.clock = clock;
	this.timeline = timeline;
	this.cesiumCamera = camera;
	$("#timeControlsContainer").hide();
	// Show off 3D feature picking
	var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	var lastPicked;
	handler.setInputAction(function(movement) {
		var pickedObjects = ol3dmap.getCesiumScene().drillPick(movement.position);
		if(Cesium.defined(pickedObjects)) {
			for(i = 0; i < pickedObjects.length; ++i) {
				var picked = pickedObjects[i];
				if(Cesium.defined(picked) && Cesium.defined(picked.node) && Cesium.defined(picked.mesh)) {
					console.log('node: ' + picked.node.name + '. mesh: ' + picked.mesh.name);
					// alert("选中模型节点：" + picked.mesh.name);
					console.log("选中模型节点：" + picked.mesh.name);
				}
				// var primitive = picked.primitive;
				// if (primitive) {
				//     alert("选中：" + primitive.olFeature.get("mbmc"));
				// }
			}
			//只做一次显示
			var picked = pickedObjects[0];
			if(Cesium.defined(picked)) {
				var primitive = picked.primitive;
				if(primitive.olFeature) {
					InfoTool.showInfo(primitive.olFeature);
				} else {
					var id = primitive.id;
					// var layer = _self.getOverlayLayerById("ssmb");
					// var f = layer.getSource().getFeatureById(id);
					// InfoTool.showInfo(f);
					InfoTool._showStationInfo(id._name, id.description.getValue());
				}

			}

		} else {
			lastPicked = undefined;

		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	function pickEntity(scene, e) {
		var picked = scene.pick(e.position);
		if(Cesium.defined(picked)) {
			var id = Cesium.defaultValue(picked.id, picked.primitive.id);
			if(id instanceof Cesium.Entity) {
				return id;
			}
		}

		// No regular entity picked.  Try picking features from imagery layers.
		if(Cesium.defined(scene.globe)) {
			// return pickImageryLayerFeature(viewer, e.position);
		}
	}

	function pickAndTrackObject(e) {
		var entity = pickEntity(scene, e);
		if(Cesium.defined(entity)) {
			//Only track the entity if it has a valid position at the current time.
			if(Cesium.Property.getValueOrUndefined(entity.position, clock.currentTime)) {
				scene.trackedEntity = entity;
				ol3dmap.trackedEntity_ = entity;
				ol3dmap.needTrackedEntityUpdate_ = true;
			} else {
				// viewer.zoomTo(entity);
			}
		} else if(Cesium.defined(scene.trackedEntity)) {
			scene.trackedEntity = undefined;
			ol3dmap.trackedEntity_ = undefined;
			ol3dmap.needTrackedEntityUpdate_ = false;
			ol3dmap.entityView_ = undefined;
			scene.screenSpaceCameraController.enableTilt = true;
			scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		}
	}

	function pickAndSelectObject(e) {
		var entity = pickEntity(scene, e);
		if(Cesium.defined(entity)) {
			scene.selectedEntity = entity;
			ol3dmap.trackedEntity_ = entity;
		}

	}

	function trackDataSourceClock(timeline, clock, dataSource) {
		if(Cesium.defined(dataSource)) {
			var dataSourceClock = dataSource.clock;
			if(Cesium.defined(dataSourceClock)) {
				dataSourceClock.getValue(clock);
				if(Cesium.defined(timeline)) {
					timeline.updateFromClock();
					timeline.zoomTo(dataSourceClock.startTime, dataSourceClock.stopTime);
				}
			}
		}
	}
	// handler.setInputAction(pickAndSelectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	handler.setInputAction(pickAndTrackObject, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

};

BeyonMap.prototype.getCesiumCamera = function() {
	return this.cesiumCamera;
}

/**
 * 获取 动画时钟
 */
BeyonMap.prototype.getClock = function() {
	return this.clock;
}

/**
 * 获取时间轴
 */
BeyonMap.prototype.getTimeLine = function() {
	return this.timeline;
}

/**
 * 启用或关闭三维日照光线视图
 * @returns {undefined}
 */
BeyonMap.prototype.enableLighting = function(enable) {
	var _ol3d = this.ol3d;
	if(enable) {
		if(_ol3d.getEnabled()) {
			_ol3d.getCesiumScene().globe.enableLighting = true;
		} else {
			alert("请先切换到三维视图！");
			$('#lightningview').prop("checked", "false");
			return;
		}
	} else {
		if(_ol3d.getEnabled()) {
			_ol3d.getCesiumScene().globe.enableLighting = false;
		} else {
			alert("请先切换到三维视图！");
			return;
		}

	}
};

/**
 * 启用三维贴地模式
 */
BeyonMap.prototype.toggleClampToGround = function(vectorLayer) {
	var altitudeMode;
	if(!vectorLayer.get('altitudeMode')) {
		altitudeMode = 'clampToGround';
	}
	vectorLayer.set('altitudeMode', altitudeMode);
	// this.map.removeLayer(vectorLayer);
	// this.map.addLayer(vectorLayer);
	this.ol3d.getAutoRenderLoop().restartRenderLoop();
}

/**
 * 添加基础底图
 * 
 * @param {array} baselayers 
 */
BeyonMap.prototype.addBaseLayer = function(baselayer) {
	this.baseLayerGroup.getLayers().push(baselayer);
};

/**
 * 添加叠加图层
 * 
 * @param {any} overlayer 
 */
BeyonMap.prototype.addOverLayLayer = function(overlayer) {
	this.overlayersGroup.getLayers().push(overlayer);
};

/**
 * 添加overlay图层组
 * 
 * @param {any} group 
 */
BeyonMap.prototype.addOverlayersGroup = function(group) {
	this.map.addLayer(group);
};

/** 
 * 添加marker
 * 
 * @param {ol.Coordinate} lonlat 经纬度坐标
 * @param {ol.style.Style} style  样式
 * @returns {ol.feature}  要素对象
 */
BeyonMap.prototype.addMarker = function(lonlat, alt, style, content, transform) {

	var coordinate = [];
	if(transform) {
		coordinate = ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857');
	} else {
		coordinate = lonlat;
	}

	//高程不为null时，添加高程坐标
	if(alt) {
		coordinate.push(alt);
	}

	var feature = new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(coordinate),
		content: content
	});

	if(style) {
		feature.setStyle(style);
	} else {
		//设置默认的style
		feature.setStyle(new ol.style.Style({
			image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 40],
				anchorXUnits: 'fraction',
				anchorYUnits: 'pixels',
				scale: 0.8,
				src: '../resouces/common/images/marker-gold.png'
			}))
		}));

	}

	//添加feature
	this.markersLayer.getSource().addFeature(feature);

	return feature;
};

/**
 * 添加弹出窗口
 * @param {*} popup 
 */
BeyonMap.prototype.addPopup = function(popup) {
	var _overlay = null;
	var _map = this.map;
	if(popup) {
		var p = this.popups.push(popup);
		if(p) {
			_overlay = _map.addOverlay(popup);
		}
	} else {
		console.error("popup 不能为空！");
	}
	return _overlay;
}

/**
 * 添加热力图数据
 * 
 * @param {any} feature 
 */
BeyonMap.prototype.addHeatmapData = function(feature) {
	this.heatmapLayer.getSource().addFeature(feature);
};

/**
 * 添加热力图数据数组
 * 
 * @param {any} features 
 */
BeyonMap.prototype.addHeatmapDatas = function(features) {
	this.heatmapLayer.getSource().addFeatures(features);
};

/**
 * 添加聚合数据
 * 
 * @param {any} feature 
 */
BeyonMap.prototype.addClusterData = function(feature) {
	this.clusterLayer.getSource().getSource().addFeature(feature);
};

/**
 * 添加聚合数据数组
 * 
 * @param [] features 
 */
BeyonMap.prototype.addClusterDatas = function(features) {
	this.clusterLayer.getSource().getSource().addFeatures(features);
};

/**
 * 删除 信息框,如果删除成功则返回被删除的popup
 * @param {*} popup 
 */
BeyonMap.prototype.removePopup = function(popup) {
	var p = this.popups.remove(popup);
	return this.map.removeOverlay(p);
}

/**
 *  删除地图上的marker
 * @param {ol.Feature} marker
 */
BeyonMap.prototype.removeMarker = function(marker) {
	if(marker) {
		this.markersLayer.getSource().removeFeature(marker);
	}
};

/**
 * 清除所有popup
 */
BeyonMap.prototype.cleanPopups = function() {
	var _popups = this.popups;
	var _m = this.map;
	_popups.forEach(function(elem, index, arr) {
		_m.removeOverlay(elem);
	});
	_popups.clear();
}

/**
 * 清理标记图层
 * 
 */
BeyonMap.prototype.cleanMarkers = function() {
	this.markersLayer.getSource().clear();
};

/**
 * 清理热力图层
 * 
 */
BeyonMap.prototype.cleanHeatmapLayer = function() {
	this.heatmapLayer.getSource().clear();
};

/**
 * 清理动态聚合图层
 * 
 */
BeyonMap.prototype.cleanClusterLayer = function() {
	this.clusterLayer.getSource().clear();
};

/**
 * 清理矢量绘制图层数据
 */
BeyonMap.prototype.cleanVectorLayer = function() {
	this.vectorLayer.getSource().clear();
}

/**
 * 清理量算图层
 * 
 */
BeyonMap.prototype.cleanMesureLayer = function() {
	this.mesureLayer.getSource().clear();
};

//TODO 清理地图
BeyonMap.prototype.cleanMap = function() {
	//TODO 清除所有矢量图层的数据
};

/**
 * 获取标记图层
 * 
 * @returns {ol.layer.Vector} 矢量图层
 */
BeyonMap.prototype.getMarkersLayer = function() {
	return this.markersLayer;
};

/**
 * 获取热力图层
 * 
 * @returns {ol.layer.Vector} 矢量图层
 */
BeyonMap.prototype.getHeatmapLayer = function() {
	return this.heatmapLayer;
};

/**
 * 获取动态聚合图层
 * 
 * @returns 
 */
BeyonMap.prototype.getClusterLayer = function() {
	return this.clusterLayer;
};

/**
 * 获取量算图层
 * 
 * @returns {ol.layer.Vector} 矢量图层
 */
BeyonMap.prototype.getMeasureLayer = function() {
	return this.mesureLayer;
};

/**
 * 获取矢量绘制图层
 */
BeyonMap.prototype.getVectorLayer = function() {
	return this.vectorLayer;
}

/**
 * 获取态势回放图层
 */
BeyonMap.prototype.getTshfLayer = function() {
	return this.tshfLayer;
};

/**
 * 获取目前，临时用
 * this.googleMap = googleMap;
	this.googleTrain = googleTrain;
	this.googleRaster = googleGroup;
 */
BeyonMap.prototype.showBaseLayer = function(_key) {
	var layer = this[_key];
	var layers =this.baseLayerGroup.getLayers().getArray();
	for (var i=0;i<layers.length;i++) {
		layers[i].setVisible(false);	
	}
	layer.setVisible(true);
};


/**
 * 根据id获取图层
 */
BeyonMap.prototype.getOverlayLayerById = function(id) {
	var layers = this.overlayersGroup.getLayers().array_;
	for(var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		if(layer.get("id") == id) {
			return layer;
		}
	}
}

/**
 * 获取地图对象
 * @return {ol.Map} 地图对象
 */
BeyonMap.prototype.getMap = function() {
	return this.map;
};

/**
 * 获取3D 地图对象
 * @returns {olcs.OLCesium}
 */
BeyonMap.prototype.getOL3D = function() {
	return this.ol3d;
};

/**
 * 设置缩放层级
 * 
 * @param {any} zoom 
 */
BeyonMap.prototype.setZoom = function(zoom) {
	this.map.getView().setZoom(zoom);
};

/**
 * 设置地图中心点
 * 
 * @param {any} center 
 */
BeyonMap.prototype.setCenter = function(center) {
	this.map.getView().setCenter(center);
};

/**
 * 设置一个最后一次选中的要素
 * 
 * @param {any} feature 
 */
BeyonMap.prototype.setLastSelectedFeature = function(feature) {
	this.lastSelectedFeature = feature;
};

/**
 * 获取地图当前的缩放层级
 */
BeyonMap.prototype.getCurrentZoom = function() {
	return this.map.getView().getZoom();
};

/**
 * 获取地图上的覆盖物
 * @returns {ol.Overlay}
 */
BeyonMap.prototype.getOverlays = function() {
	return this.map.getOverlays();
};

/**
 * 获取基层图层数组
 */
BeyonMap.prototype.getDefaultBaseGroup = function() {
	return this.baseLayerGroup;
};

/**
 * 获取叠加图层数组
 */
BeyonMap.prototype.getDefaultOverlayGroup = function() {
	return this.overlayersGroup;
};

/**
 * 获取所有基础图层
 */
BeyonMap.prototype.getBaseLayers = function() {
	return this.baseLayerGroup.getLayers();
};

/**
 * 获取所有叠加图层
 */
BeyonMap.prototype.getOverlayLayers = function() {
	return this.overlayersGroup.getLayers();
};

/**
 * 获取默认的弹出框popup
 */
BeyonMap.prototype.getDefaultPopup = function() {
	return this.popup;
};

/**
 * 获取最后一次选中的要素
 * 
 * @returns {ol.feature} 要素
 */
BeyonMap.prototype.getLastSelectedFeature = function() {
	return this.lastSelectedFeature;
};

/**
 * 启用marker和弹出框
 * 
 */
BeyonMap.prototype.enableMarkerPopup = function() {
	var _map = this.map;
	var _popup = this.popup;
	var _lastSelectedFeature = this.lastSelectedFeature;
	this.map.on('pointermove', function(e) {
		var pixel = _map.getEventPixel(e.originalEvent);
		var hit = _map.hasFeatureAtPixel(pixel);
		_map.getTarget().style.cursor = hit ? 'pointer' : '';
		//如果最后一次选择的marker不为空，则变回原样
		if(_lastSelectedFeature) {
			_lastSelectedFeature.getStyle().getImage().setScale(0.8);
			_lastSelectedFeature.changed();
		}

		if(hit) {
			var f = _map.forEachFeatureAtPixel(e.pixel, function(feature) {
				return feature;
			});

			if(f.get("type") === 'icon') {
				f.getStyle().getImage().setScale(1);
				f.changed();
				_lastSelectedFeature = f;
			}

		}

	});

	this.map.on('click', function(e) {
		var feature = _map.forEachFeatureAtPixel(e.pixel, function(feature) {
			return feature;
		});

		if(feature) {
			var geom = feature.getGeometry();
			var coordinates;
			if(geom instanceof ol.geom.Circle) {
				coordinates = geom.getCenter();
				_popup.setOffset([0, 0]);
			} else if(geom instanceof ol.geom.Point) {
				coordinates = geom.getCoordinates();
				_popup.setOffset([1.2, -20]);
			} else {
				coordinates = e.coordinate;
				_popup.setOffset([0, 0]);
			}

			var content = feature.get("content");
			if(content) {
				_popup.show(coordinates, content);
			}

		} else {
			_popup.hide();
		}

	});
};

/**
 * 飞行
 * @param {ol.Coordinate} lonlat 经纬度坐标
 * @param {int} duration  飞行时间
 * @param {int} zoomRange 缩放的级别
 * @param {Function} done 回调函数
 */
BeyonMap.prototype.flyTo = function(coordinate, duration, zoomRange, done, backfunc) {

	if(backfunc instanceof Function) {
		var duration = 2000;
		var view = this.map.getView();
		var zoom = view.getZoom();
		var parts = 2;
		var called = false;

		function callback(complete) {
			--parts;
			if(called) {
				return;
			}
			if(parts === 0 || !complete) {
				called = true;
				done(complete);
			}
		}
		view.animate({
			center: coordinate,
			duration: duration
		}, callback);
		view.animate({
			zoom: 8,
			duration: duration / 2
		}, {
			zoom: 8,
			duration: duration / 2
		}, callback);
	} else {
		var view = this.map.getView();
		duration = duration || 2000;
		var zoom = view.getZoom();
		// if (zoom >= 12) {
		//     zoom = 10;
		// }

		zoomRange = zoomRange || 1;
		var parts = 2;
		var called = false;

		function callback(complete) {
			--parts;
			if(called) {
				return;
			}
			if(parts === 0 || !complete) {
				called = true;
				if(done instanceof Function)
					done(complete);
			}
		}
		view.animate({
			center: coordinate,
			duration: duration / 4
		}, callback);
		view.animate({
			zoom: zoom - zoomRange,
			duration: duration / 4
		}, {
			zoom: zoom > 12 ? zoom : 15,
			duration: duration / 4
		}, callback);
	}

};