//初始化地图对象
var _beyonmap = ZKMap.getInstance('openlayers', {
	mapdiv: 'map',
	view: {
		projection: 'EPSG:3857',
		center:[104.293175,35.7],
		zoom:4,
		maxZoom : 18
	},
	interactions:["dragrotate", "dragpan", "pinchrotate", "pinchzoom","keyboard", "mousewheelzoom", "dragzoom"]
});

var _pageObject = _pageObject || {};
(function($, module) {
	// module.MAIN.init();
	$(document).ready(documentReady);

	function documentReady() {
		module.MAIN.init();
	}
	
})(jQuery, _pageObject);

/**
 * 模块入口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($, parent, module) {
	module.parent = parent;
	let _this = module;

	module.init = function() {
		parent.VIEWHEADER.init();
		parent.VIEWFOOT.init();
		parent.MENUACCORDION.init();
		parent.MAP.init({
			callback: {
				pointermove: this.parent.VIEWFOOT.showJWD
			}
		});
		parent.SEARCH.init();
		parent.LOADMODULE.init();
		parent.DICT.init();
		parent.OPENWINDOW.init();
		parent.SATELLITE.init();
		setTimeout(function(){
			parent.ZHTS_SSTS.init();
			parent.ZHTS_SSTS_MESSAGE.init();
			parent.ZHTS_GJWQ_HTTP.init();
		},1500);
		
	}

})(jQuery, _pageObject, _pageObject.MAIN = {});

/**
 * view-map
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($, parent, module) {
	module.parent = parent;
	let _this = module,
		// $map, _map, _beyonmap, _plot;
		$map, _map, _plot;

	/**
	 * 获取map对象
	 */
	module.getMap = function() {
		return _map;
	}

	module.getBeyonMap = function() {
		return _beyonmap;
	}
	module.getPlot = function() {
		return _plot;
	}

	//创建地图
	module.initMap = function(option) {
		//获取原始地图对象
		_map = _beyonmap.getMap();
		
		//添加鼠标移动事件监听
		_map.on('pointermove', function(evt) {
			if (evt.dragging) {
				return;
			}

			if (evt && evt.coordinate) {
				option.callback.pointermove(evt.coordinate);
			}
		});

		//初始化地图控制
		parent.MAPCONTROL.init(_map);

		//调整按钮位置
		let $control = $map.find(".ol-zoom.ol-unselectable.ol-control");
		$.each($control.find(">button"), function(index, el) {
			let $this = $(this);
			let _v = $this.text();
			let $span = $("<span></span>");
			$span.html(_v);
			$this.addClass("ol-control-btn").empty().append($span);
		});

		//增加定位按钮
		let $button = $("<button><span class='iconfont fa fa-crosshairs'></span></button>");
		$button.addClass("ol-control-btn x-icon-potion");
		$control.prepend($button);

		//复位地图中心点
		$button.on("click",function(evt){
			_map.getView().animate({
				center: ol.proj.fromLonLat([104.293175,35.7]),
				projection: 'EPSG:3857',
			},{
				zoom : 4
			});
		})
		
		return this;
	}

	/**
	 * 添加标绘功能
	 */
	module.addPlot = function() {
		
		//解析feature属性
		function getDrawFeatureAttribute(_feature){
			let _featureTypeName = _feature.get("plotType");
			
			let _default = {};
			
			let _font = _feature.getStyle() ? _feature.getStyle().getText() : {} || {};
			
			_default["TYPE"] = "DRAW_"+_featureTypeName;
			_default["ICON"] = {};
			_default["FONT"] = {};
			_default["MIAOSHU"] = {}
			try{
				let _style = _feature.getStyle();
				//如果没有style则向layer中查找
				if(!_style){
					let _plot = _this.getPlot();
					_style = _plot.plotDraw.drawLayer.getStyle();
				}
				
				let _stroke = _style.getStroke();
				_default["ICON"] = {
					"stroke-color" : (function(){
						let _color = _stroke.getColor();
						if(_color=="red"){
							_color = "rgba(255,0,0,1)";
						}
						return _color;
					})(),
					"stroke-width" : _stroke.getWidth(),
					"fill-color" : _style.getFill().getColor(),
					"feature" : {
						"type" : _featureTypeName,
						"getGeometry().getPoints()" : _feature.getGeometry().getPoints()
					}
					
				};
			}catch(e){
				//TODO handle the exception
			}
			return _default;
		}
		
		//获取类型名称
		function onDrawEndCallbackGetPlotTypeName(feature){
			let _title,_featureType = "null",
				_module = getModuleWindowPageObjectByName("module.plot.main");
			
			if(feature.get("plotType")){
				_featureType = feature.get("plotType").replace(/^DRAW\_/,""); 
			}
			
			let $li = _module.LEFTPANEL.$windowDrawGraph.find("li[data-iconname='"+_featureType+"']");
			if($li.length<1){
				console.info("未找到绘制类型"+_featureType);
			}
			_title = $li.attr("title");
			return _title;
		}
		
		//绘制完成回调函数
		function onDrawEndCallback(event){
			let _feature = event.feature;
			
			let _attr = getDrawFeatureAttribute(_feature),
				_icon = _attr["ICON"] || {};
			let _style = new ol.style.Style({
				fill: new ol.style.Fill({
					color: _icon["fill-color"]
				}), 
				stroke : new ol.style.Stroke({
			        color: _icon["stroke-color"],
			        width: _icon["stroke-width"]
			    }),
				text: new ol.style.Text({
					font: '12px Calibri,sans-serif',
					fill: new ol.style.Fill({
						color: "rgba(0,0,0,1)" || _icon["fill-color"]
					}),
					stroke: new ol.style.Stroke({
						color: 'rgba(255,255,255,1)',
						width: 3
					}),
					text: onDrawEndCallbackGetPlotTypeName(_feature),
					offsetY: 0,
				})
			});
			_feature.setStyle(_style);
		}

		// 绘制结束后，添加到FeatureOverlay显示。
		function onDrawEnd(event) {
			if (event.feature) {
				_plot.plotEdit.activate(event.feature);
				onDrawEndCallback(event);
			}
		}
		
		//创建对象
		_plot = new P(_beyonmap.getMap(), {
			zoomToExtent: true
		});

		_plot.plotDraw.on('drawEnd', onDrawEnd)
		_plot.plotDraw.on('active_textArea', function(event) {
			let _style = _plot.plotUtils.getPlotTextStyleCode(event.overlay)
		});
		
		_plot.plotDraw.drawLayer.set("moduleName","module.MAP.LAYER.GROUP.DJ.BIAOHUI");
		
		_map.on('click', function(event) {
			//			console.log(event);
			let _feature = _map.forEachFeatureAtPixel(event.pixel, function(feature) {
				return feature;
			})

			//如果是标绘状态
			if (_plot) {
				if (_feature && _feature.get('isPlot') && !_plot.plotDraw.isDrawing()) {
					_plot.plotEdit.activate(_feature);
				} else {
					_plot.plotEdit.deactivate();
				}
			}
		})
	}


	/**
	 * 获取标绘动态类型数组
	 */
	module.getPlotTypeArray = function(){
		return _plot.plotDraw._plotChineseType;
	}
	
	/**
	 * 添加比例尺
	 */
	module.addScaleLine = function() {
		let scaleLineControl = new ol.control.ScaleLine({
			//	      className: 'my-scale-line'
		});
		scaleLineControl.setUnits('metric');
		_map.addControl(scaleLineControl);
	}

	module.init = function(option) {
		$map = $("#map");
		this.initMap(option)
			.addPlot();
			
	}

})(jQuery, _pageObject, _pageObject.MAP = {});

/**
 * view-header
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($, parent, module) {
	module.parent = parent;
	let _this = module,
		$doc,
		$headerRightMenu;

	//显示时间
	module.showTime = function() {
		try {
			let _baseUtli = xUtilBase;
			var today = xUtilBase.classDate.newDate(new Date());
			var weekday = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
			var _data = {
				y: xUtilBase.getStringRight("0000" + today.year, 4) + "",
				month: xUtilBase.getStringRight("00" + (today.month), 2) + "",
				td: xUtilBase.getStringRight("00" + today.date, 2) + "",
				d: weekday[today.day],
				h: xUtilBase.getStringRight("00" + today.hour, 2) + "",
				m: xUtilBase.getStringRight("00" + today.minute, 2) + "",
				s: xUtilBase.getStringRight("00" + today.seconds, 2) + ""
			};

			_data["time"] = _data["h"] + ":" + _data["m"] + ":" + _data["s"];
			_data["date"] = _data["y"] + "年" + _data["month"] + "月" + _data["td"] + "日";
			_data["week"] = _data["d"];

			var _s = "";
			for (var i in _data["week"]) {
				_s += _data["week"][i] + "&nbsp;&nbsp;";
			}
			//			_s = _s.replace(/(&nbsp;&nbsp;*$)/g, "");
			_data["week"] = _s;
			var _html = template("TemplateWindowFootRightTimes", _data);
			$("#system-times").html(_html);
		} catch (e) {
			//TODO handle the exception
		}

		setTimeout(_this.showTime, 1000);
	}
	
	module.httpSystemLogout = function(option){
		let _url = "/by-service/apilogout";
		xUtilBase.ajax({
			url : _url,
			type : "get",
			success : function(result){
				if(result["code"]=="0"){
					if(option.callback){
						option.callback();
					}
				}else{
					layui.layer.msg(result["message"]);
					top.location.href = getModuleURL("system.logout");
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
				top.location.href = getModuleURL("system.logout");
			}
		});
	}
	
	module.bindEvent = function(){
		$headerRightMenu.find("[x-btn-name]").on("click",function(){
			let $this = $(this),
				_value = $this.attr("x-btn-name");
			switch (_value){
				case "logout":
					_this.httpSystemLogout({
						callback : function(){
							top.location.href = getModuleURL("system.logout");
						}
					});
					break;
				default:
					break;
			}
		});
	}

	module.init = function() {
		$doc = $("#x-view-header");
		$headerRightMenu = $doc.find("#x-header-right-menu");
		let _user = _pageObject.USER_MAIN.getUserInfo();
		$headerRightMenu.setFormValue({
			nickname : _user.nickname
		});

		let $span = $doc.find("span[x-input-name='PROBJECT_NAME']");
		let _value = "综合态势可视化系统";
		$span.empty();
		for (let i in _value) {
			$span.append("<b>" + _value[i] + "</b>");
		}

		let _text = ["Union","Situation", "Visualization", "System"];
		$span = $doc.find("span[x-input-name='PROBJECT_NAME_EN']");
		$span.empty();
		$.each(_text, function(index, el) {
			$span.append("<i>" + el + "</i>");
		});
		
		this.bindEvent();
		this.showTime();
	}

})(jQuery, _pageObject, _pageObject.VIEWHEADER = {});

/**
 * view-foot
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($, parent, module) {
	module.parent = parent;
	let $doc;

	//显示坐标
	module.showJWD = function(coordinate) {
		//使用toLonLat显示经纬度，不会出现大于180度的情况
		let _loat = ol.proj.toLonLat(coordinate);
		$doc.setElValue({
			// JD: /^\d+\.\d{6}/.test(_loat[0].toString()) ? _loat[0].toString().match(/^\d+\.\d{6}/)[0] : 0,
			// WD: /^\d+\.\d{6}/.test(_loat[1].toString()) ? _loat[1].toString().match(/^\d+\.\d{6}/)[0] : 0
			JD: _loat[0].toFixed(6),
			WD: _loat[1].toFixed(6)
		});
	}

	module.init = function() {
		$doc = $("#x-view-foot");
	}

})(jQuery, _pageObject, _pageObject.VIEWFOOT = {});