var _pageObject = _pageObject || {};
(function($, module) {
	$(document).ready(documentReady);

	function documentReady() {
		module.MAIN.init();
	}
})(jQuery, _pageObject);

//入口
(function($, parent, module) {
	module.parent = parent;
	let _this = module;

	module.init = function() {
		parent.LEFTPANEL.init();
	}

})(jQuery, _pageObject, _pageObject.MAIN = {});

//PANEL
(function($, parent, module) {
	module.parent = parent;
	let _this = module,
		_moduleName = "module.plot",
		ol,
		_map,_layer,_layerName="ol-plot-vector-layer",
		_draw = parent.DRAWIMAGE,
		$ztree,
		$windowDrawGraph;
		
	//移除静态绘制转换事件
	let _win = getModuleWindowPageObjectByName("system.main");
	let _transform = _win.MAPEVENT.PLOT_ONSELECT_TRANSFORMINTERACT;

	/**
	 * 初始化tree
	 */
	module.initTree = function() {

		$('#treeDiv').mCustomScrollbar({
			theme: 'minimal-dark',
			scrollInertia: 100,
			axis: 'yx',
			mouseWheel: {
				enable: true,
				axis: 'y',
				preventDefault: true
			}
		});
		$('#imgDiv').mCustomScrollbar({
			theme: 'minimal-dark',
			scrollInertia: 100,
			axis: 'yx',
			mouseWheel: {
				enable: true,
				axis: 'y',
				preventDefault: true
			}
		});
		//手动设置
		$('#treeDiv').css({
			"height": "100%"
		});
		$('#imgDiv').css({
			"height": "100%"
		});

		//拖动窗口面板
		_this.$windowDrawGraph = $("#templateImgDiv");

		let _httpURL = "/plot-service/plot/api/getAsyncTreeData";

		//ztree事件
		function onClick(event, treeId, treeNode) {
			var treeObj = $ztree;
			//常用标绘
			if (treeNode.type == "CommonUse") {
				_this.httpGetPlotCommonUseList();
			} else {
				//非常用标绘，层级和结构基本固定，早期同事使用等级进行判断
				if (treeNode.level != 1) {
					//展开节点
					treeObj.expandNode(treeNode, true, false);
				} else {
					//手动加载一次
					//首先清空内容
					_this.$windowDrawGraph.empty();
					if (treeNode.otherParam == null) { //节点当中没有数据,需要请求
						$.ajax({
							type: "POST",
							dataType: "json",
							url: _httpURL,
							data: {
								pid: treeNode.pId,
								name: treeNode.name,
								level: treeNode.level,
								other: treeNode.other
							},
							success: function(data) {
								//更新节点数据
								treeNode.otherParam = data;
								treeObj.updateNode(treeNode);

								//生成html模板
								var html = _this.getHtml(treeNode, treeNode.type);
								_this.$windowDrawGraph.append(html);

								//绑定事件
								_this.bindPlotTreeListEvent();

								//进行绘制
								if (treeNode.type == "DB") {
									_this.bindPlotCommonUseEvent();
								} else {
									//注册事件,单击时把动态图形进行临时绑定
									_this.$windowDrawGraph.find("li").click(function() {
										var $this = $(this),
											_val = $this.data("iconname");
											
										//当前选中放入缓存
										_this.$windowDrawGraph.data("_actionObject", _val);

										//激活动态元素
										_this.activate(_val);
									});
								}

							},
							error: function(req, status, error) {
								if (status == "timeout") {
									console.log("请求超时，请稍后再试!!!");
								} else if (status == "error") {
									console.log("后台程序报错，请联系管理员...");
								}
							}
						});
					} else {
						//节点当中有数据
						var html = _this.getHtml(treeNode, treeNode.type);
						_this.$windowDrawGraph.append(html);

						//进行绘制
						if (treeNode.type == "DB") {
							//拖动面板事件重新绑定
							_this.bindPlotCommonUseEvent();
						} else {
							//注册事件
							_this.$windowDrawGraph.find("li").click(function() {
								var $this = $(this);
								
								_val = $this.data("iconname");
								//激活动态元素
								_this.activate(_val);
								
							});
						}
					}
				}
			}
		}

		//异步调用tree的过滤功能
		function dataFilter(treeId, parentNode, childNodes) {
			if (!childNodes) return null;
			for (var i = 0, l = childNodes.length; i < l; i++) {
				if (childNodes[i].name != null) {
					childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
				}
			}
			return childNodes;
		}

		//如果首次加载，则触发常用标绘
		function onAsyncSuccess(event, treeId, treeNode, msg) {
			if (!treeNode) {
				_this.httpGetPlotCommonUseList();
			}
		}

		//初始化树形
		var setting = {
			view: {
				selectedMulti: false
			},
			async: {
				enable: true,
				url: _httpURL,
				autoParam: ["pId=pid", "name=name", "level=level", "other=other"],
				dataFilter: dataFilter
			},
			check: {
				enable: true,
				chkStyle: "radio",
				radioType: "level"
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: onClick,
				onAsyncSuccess: onAsyncSuccess
			}
		};

		$ztree = $.fn.zTree.init($("#treeDemo"), setting);
	}
	
	// 指定标绘类型，开始绘制。
	module.activate = function(type){
		top._pageObject.MAP.getPlot().plotEdit.deactivate()
		top._pageObject.MAP.getPlot().plotDraw.active(type);
	}

	/**
	 * 调用标绘接口-常用图标-获取列表
	 */
	module.httpGetPlotCommonUseList = function() {

		//参数
		var _data = {};

		xUtilBase.ajax({
			url: "/plot-service/plot/api/queryCommonUseJb",
			data: _data,
			success: function(result) {
				if (result.code == "0") {
					var treeObj = $ztree;

					if (treeObj) {
						var _parentId = "CommonUseTree";
						//先处理子节点
						var _nodes = [];
						$.each(result.data, function(index, el) {
							_nodes.push({
								id: el["jbkh"] + "_" + el["jbdh"] + "_" + el["cc"] + "_" + el["jbys"],
								name: el["mc"],
								pId: _parentId,
								other: el,
								jbkh: el["jbkh"],
								jbdh: el["jbdh"],
								cc: el["cc"],
								jbys: el["jbys"]
							});
						});

						var _parentNode = treeObj.getNodeByParam("id", _parentId);
						if (_parentNode) {
							_parentNode.otherParam = _nodes;
						} else {
							//添加分类层
							var _parentNode = {
								id: _parentId,
								name: "常用标绘",
								pId: "0",
								type: "CommonUse",
								isParent: true,
								open: true,
								nocheck: true,
								children: [],
								otherParam: _nodes
							};

							treeObj.addNodes(null, 0, [_parentNode]);
						}

						var html = _this.getHtml(_parentNode, "DB");
						var $ele = _this.$windowDrawGraph;
						$ele.empty().append(html);
						_this.bindPlotTreeListEvent();
						_this.bindPlotCommonUseEvent();
					}
				} else {
					layui.layer.msg(result.msg);
				}
			}
		});
	}

	/**
	 * 获取标绘内容
	 */
	module.getHtml = function(treeNode, type) {
		var html = "";
		var arr = treeNode.otherParam;

		//常用标绘
		if (treeNode.type == "CommonUse") {
			if (type == "DB") {
				//从数据库获取图标
				for (var i = 0; i < arr.length; i++) {
					var jbkh = arr[i].jbkh;
					var jbdh = arr[i].jbdh;
					var title = arr[i].name;
					var plot = jbkh + "-" + jbdh;
					html += "<li class=\"x-clearfix\" title=" + title + " data-iconname=" + plot + ">" +
						"<div class=\"draw-iconfont\">" +
						"<img src='/plot-service/plot/api/getJB?JBKH=" + jbkh + "&JBDH=" + jbdh + "&CC=64&JBYS=R" + "'/></div>" +
						"<div class=\"draw-font\">" + title + "</div>" +
						"<div class=\"draw-btn\" title='移除' x-btn-name='delete'><i class='iconfont fa fa-trash-o'></i></div>" +
						"</li>";
				}
			}
		} else {
			if (type == "DB") {
				//从数据库获取图标
				for (var i = 0; i < arr.length; i++) {
					var jbkh = arr[i].jbkh;
					var jbdh = arr[i].jbdh;
					var title = arr[i].name;
					var plot = jbkh + "-" + jbdh;
					html += "<li class=\"x-clearfix\" title=" + title + " data-iconname=" + plot + ">" +
						"<div class=\"draw-iconfont\">" +
						"<img src='/plot-service/plot/api/getJB?JBKH=" + jbkh + "&JBDH=" + jbdh + "&CC=64&JBYS=R" + "'/></div>" +
						"<div class=\"draw-font\">" + title + "</div>" +
						"<div class=\"draw-btn\" title='添加到常用标绘列表' x-btn-name='add'><i class='iconfont fa fa-plus'></i></div>" +
						"</li>";
				}
			} else {
				//直接获取静态图标
				for (var i = 0; i < arr.length; i++) {
					var title = arr[i].name;
					var imgname = arr[i].imgName;
					var src = "../../static/images/plot/48/" + imgname + ".png";
					var plot = arr[i].other;
					html += "<li class=\"x-clearfix\" title=" + title + " data-iconname=" + plot + ">" +
						"<div class=\"draw-iconfont\">" +
						"<img src=" + src + "></div>" +
						"<div class=\"draw-font\">" + title + "</div>" +
						"</li>";
				}
			}
		}

		return html;
	}

	/**
	 * 绑定事件-常用标绘单击
	 */
	module.bindPlotCommonUseEvent = function() {
		//ele
		var $element = $windowDrawGraph;

		//注册事件
		$element.find("li").unbind("click").on("click", function() {
			let $this = $(this);
			let _data = $this.data("iconname");

			//由于服务器数据没有提供尺寸和颜色，默认64*64和红色
			let _URL = "/plot-service/plot/api/getJB?JBKH=" + (
				("" + _data.match(/^[0-9]+/))
			) + "&JBDH=" + (
				("" + _data.match(/[0-9]+$/))
			) + "&CC=64&JBYS=R";
			
			//获取尺寸
			let _px = {
				width : (function(){
					let _int;
					try {
						_int = _URL.match(/CC=([0-9]+)/)[1];
						_int = Number(_int);
					} catch (e) {
						_int = 64;
					}
					return _int;
				})(),
			};
			_px.height = _px.width;
			
			//缩放
			let _scale = 0.7;
			
			let _style = new ol.style.Style({
				image: new ol.style.Icon({
					rotation: 0,
					scale: _scale,
					src: _URL
				}),
				text: new ol.style.Text({
					font: '12px Calibri,sans-serif',
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: 'rgba(255,255,255,1)',
						width: 3
					}),
					text: $this.find(".draw-font").html(),
					offsetY: _px.height/2,
				})
			});
			
			parent.DRAWIMAGE.drawImage({
				set: {
					id: "draw-image-" + xUtilBase.createUUID(),
					type: "DBFeature",
					isPlot:true,
					angle : 0,
					px : _px 
				},
				style: _style,
				callback: {
					complete: function(feature) {
						if(!feature){
							return;
						}
						
						//移除静态绘制事件
//						_map.removeInteraction(draw);
						
						//保持窗口开启
						_this.openDrawAttribute({
							callback: {
								complete: function() {
									//设置属性
									let _iframe = getModuleWindowByName("module.plot.draw.attribute");
									if (_iframe) {
										let _default = _iframe._ClassDrawAttributeMain.GetFeatureAttribute(feature);
										_iframe._ClassDrawAttributeMain.SetPanel(_default);
									}
								}
							}
						});
					}
				}
			});
		});
		_this.bindPlotTreeListEvent();
	}

	/**
	 * 绑定事件-常用标绘单击
	 */
	module.bindPlotTreeListEvent = function() {
		//ele
		var $element = _this.$windowDrawGraph;

		$element.find("[x-btn-name]").unbind("click").on("click", function() {
			var $this = $(this),
				_val = $this.attr("x-btn-name"),
				$p = $this.closest("li"),
				_temp_val = $p.attr("data-iconname");
			switch (_val) {
				case "add":
					layui.layer.confirm('您确定要将<font color=red style="margin:0px 5px 0px 5px;">' + $p.find(".draw-font").html() +
						'</font>添加到常用标绘吗？', {
							btn: ['确定', '取消'], //按钮
							isOutAnim: true,
							shade: [0.3]
						},
						function() {
							_this.httpAddPlotCommonUse({
								"jbkh": _temp_val.replace(/-\d+$/g, ""),
								"jbdh": _temp_val.replace(/^\d+-/g, ""),
								"cc": 64,
								"jbys": "R",
								"mc": $p.find(".draw-font").html()
							});
						},
						function() {

						});

					break;
				case "delete":
					layui.layer.confirm('您确定移除<font color=red style="margin:0px 5px 0px 5px;">' + $p.find(".draw-font").html() +
						'</font>这个图标吗？', {
							btn: ['确定', '取消'], //按钮
							isOutAnim: true,
							shade: [0.3]
						},
						function() {
							_this.httpRemovePlotCommonUse({
								"jbkh": _temp_val.replace(/-\d+$/g, ""),
								"jbdh": _temp_val.replace(/^\d+-/g, ""),
								"cc": 64,
								"jbys": "R"
							});
						},
						function() {

						});

					break;
				default:
					break;
			}
			return false;
		});
	}

	/**
	 * 常用图标-新增
	 * @param {Object} _data
	 */
	module.httpAddPlotCommonUse = function(_data) {
		//参数
		//	var _data = {"jbkh":32,"jbdh":22900,"cc":64,"jbys":"R","mc":"班长"};
		_data = JSON.stringify(_data);
		xUtilBase.ajax({
			url: "/plot-service/plot/api/addCommonUseJb",
			data: _data,
			contentType: "application/json;charset=UTF-8",
			success: function(result) {
				if (result.code == "0") {
					layui.layer.msg("添加成功");
				} else {
					layui.layer.msg(result.msg);
				}
			}
		});
	}

	/**
	 * 常用图标-删除
	 * @param {Object} _data
	 */
	module.httpRemovePlotCommonUse = function(_data) {
		var _tempData = $.extend(true, {}, _data);

		//参数
		//	var _data = {"jbkh":32,"jbdh":22900,"cc":64,"jbys":"R"};
		_data = JSON.stringify(_data);

		xUtilBase.ajax({
			url: "/plot-service/plot/api/delCommonUseJb",
			data: _data,
			contentType: "application/json;charset=UTF-8",
			success: function(result) {
				if (result.code == "0") {
					layui.layer.msg("删除成功");
					var $ele = _this.$windowDrawGraph;
					$ele.find("[data-iconname='" + _tempData["jbkh"] + "-" + _tempData["jbdh"] + "']").remove();
				} else {
					layui.layer.msg(result.msg);
				}
			}
		});
	}

	module.bindMoveWindowSizeEvent = function() {
		var box = $("#demo");
		var line = $(".drag-line");
		var el = line.get(0);

		//获取鼠标位置
		function getMousePos(event) {
			event = event || window.event;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			var x = event.pageX || event.clientX + scrollX;
			var y = event.pageY || event.clientY + scrollY;
			return {
				x: x,
				y: y
			};
		}

		//鼠标按下事件
		el.onmousedown = function(e) {
			var _position = getMousePos(e);
			box.get(0)._position = _position;
			box.get(0).onmousemove = mousemove;
			//cons.html(JSON.stringify(_position));
			e.preventDefault();
		}

		//鼠标弹起
		el.onmouseup = function(e) {
			//cons.html("停止移动<br/>");
			box.get(0).onmousemove = null;
		}

		box.get(0).onmouseup = el.onmouseup;
		box.hover(function() {}, function() {
			box.get(0).onmousemove = null;
		});

		//开始移动
		function mousemove(e) {
			var _position = getMousePos(e);
			directionMove(_position);
			//cons.html("正在移动<br/>" + JSON.stringify(_position));
		}

		function directionMove(_position) {
			var f = box;
			var _top = f.offset().top;
			var b = (_position.y - f.offset().top) / f.outerHeight() * 100;
			var p = line.prev();
			var n = line.next();
			//line.css({"top" : (b) + "%"});
			p.css({
				"height": (b) + "%"
			});
			n.css({
				"height": (100 - b) + "%"
			});
		}
	}

	/**
	 * 图标设置面板
	 */
	module.openDrawAttribute = function(option) {
		//判断是否已经弹出
		if (_this.__layerOpenIndex_attibute) {
			if (option && option.callback && option.callback.complete) {
				option.callback.complete();
			}
			return;
		}

		let _win = top.window;
		$(_win).unbind("resize.windowResize");
		$(_win).on("resize.windowResize", windowResize);

		//弹出窗口
		let _default = {
			id: "layer-open-draw-attibute",
			type: 2,
			shade: false,
			title: option.title || "图标设置面板",
			area: ['300px', getHeight() + 'px'],
			offset: ["125px", getLeft() + "px"],
			fixed: false,
			content: "module/plot/main.draw.attribute.html",
			end: function(index, layero) {
				_this.__layerOpenIndex_attibute = null;
			},
			success: function(layero, index) {
				if (option && option.callback && option.callback.complete) {
					option.callback.complete();
				}
			}
		}
		let _index = top.layui.layer.openWin(_default);
		_this.__layerOpenIndex_attibute = _index;

		let _keyupClock;

		function windowResize(event) {
			keyupClock = event.timeStamp;
			setTimeout(function() {
				if (keyupClock - event.timeStamp == 0) {
					layuiLayerResize();
				}
			}, 100);
		}

		function getLeft() {
			return _win.$("#x-hidden-window").outerWidth() - 300 - 10;
		}

		function getHeight() {
			return _win.$("#x-hidden-window").outerHeight() - 160;
		}

		function layuiLayerResize() {
			top.layui.layer.style(_index, {
				left: getLeft() + "px"
			});
		}
	}

	module.closeDrawAttribute = function() {
		top.layui.layer.close(_this.__layerOpenIndex_attibute);
	}
	
	/**
	 * 取出标绘图层
	 */
	module.getLayer = function(){
		let _layer;
		_map.getLayers().getArray().forEach(function(el,index){
			if(el.get("layerName")=="ol-plot-vector-layer"){
				_layer = el;
			}
		});
		return _layer;
	}
	
	/**
	 * 清除图层
	 */
	module.clearLayer = function(callback){
		this.getLayer().getSource().clear();
		if(callback){
			callback();
		}
	}
	
	module.removeLayer = function(){
		_map.removeLayer(this.getLayer());
		return this;
	}
	
	/**
	 * 清除选中Features
	 */
	module.removeSelectedFeatures = function(callback){
		let _winMain = getModuleWindowPageObjectByName("system.main");
		let _interactionSelect = _winMain.MAPEVENT.PLOT_ONSELECT;
		if (!_interactionSelect){
			callback(false);
			return;
		}
		
		let _featureArray = _interactionSelect.getFeatures().getArray();
		if(_featureArray.length<1){
			callback(false);
			return;
		}
		
		try{
			$.each(_featureArray, function(index,el) {
				_this.getLayer().getSource().removeFeature(el);
			});
		}catch(e){
			console.warn(e.message);
		}
		
		_interactionSelect.getFeatures().clear();
		_interactionSelect.changed();
		
		if(callback){
			callback(true);
		}
	}
	
	/**
	 * 关闭
	 */
	module.close = function(){
		if(_map){
			this.closeDrawAttribute();
			this.clearLayer();
//			this.removeLayer();
		}
	}

	module.init = function() {
		let _winMain = getModuleWindowByName("system.main");
		ol = _winMain.ol;
		_map = _winMain._pageObject.MAP.getMap();
		
		$windowDrawGraph = $("#x-window-draw-graph");
		this.initTree();
		this.bindMoveWindowSizeEvent();
		
		_layer = (function(){
			let _l;
			_map.getLayers().getArray().forEach(function(el,index){
				if(el.get("layerName")==_layerName){
					_l = el;
				}
			});
			return _l;
		})();
		
		if(!_layer){
			_layer = (function(){
				return new ol.layer.Vector({
					layerName : _layerName,
					name: 'Vecteur',
					moduleName : _moduleName,
					source: new ol.source.Vector()
				})
			})();
			_map.addLayer(_layer);
		}

		//		this.openDrawAttribute();
	}

})(jQuery, _pageObject, _pageObject.LEFTPANEL = {});


