var _pageObject = _pageObject || {};

(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

//入口
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.getColors = function(){
		return [
			"255,51,0","38,169,38","30,159,255",
			"255,87,34","255,184,0","255,140,0","255,155,0","144,238,144",
			"0,206,209","199,21,133","0,186,189","255,120,0"
		];
	}
	
	module.getColorByIndex = function(index){
		let _color = this.getColors()[index];
		return "rgba("+_color+",0.75)";
	}
	
	module.init = function(){
		parent.SHIXUTU_ECHARTS.init();
		parent.CAIHONGTU.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 时序图
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	let _classEcharts0;
	let _SHOUDUAN_DRAW;
	
	module.httpGetDataById = function(option){
		let _moduleName = "http.zhts.ssts.mubiao.shixutu.getById",
			_url = getModuleURL(_moduleName);
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						option.success(result.data);
					}
				}else{
					console.info(result.msg);
				}
			}
		});
	}
	
	module.initPanel = function(data,date){
		
		let $ul = $("#shixutu-echarts");
		$ul.empty();
		
		let _newMap = new Map();
		let _newData = {
			date : {
				startTime : new Date(date.startTime),
				endTime : new Date(date.endTime)
			},
			dataX : [],
		};
		$.each(data, function(index,el) {
			for(let i in el){
				let $li = $("<li class='clearfix'></li>");
				$ul.append($li);
				let $liX = $("<div class='li-x'></div>");
				$liX.html(i);
				
				$li.append($liX);
				let $liY = $("<div class='li-y'></div>");
				$li.append($liY);
				
				let _id = WebLoader.createUUID();
				let $canvas = $("<canvas id='"+_id+"'></canvas>");
				$canvas.attr({width:$liY.outerWidth(),height:$liY.outerHeight()});
				$liY.append($canvas);
				
				let _key = [];
				$.each(el[i], function(index,el) {
					_key.push(el.wzsj);
				});
				
				_newData.dataX.push({
					elem : $canvas,
					width : $liY.outerWidth(),
					height : $liY.outerHeight(),
					id : _id,
					name:i,
					data : _key
				});
				
			}
		});
		
		let $li = $("<li class='clearfix'></li>");
		$li.append("<div class='li-x'></div>");
		let _slideId = WebLoader.createUUID();
		$li.append("<div class='li-y'><div class='slide-test' id='"+_slideId+"'><div></div></div></div>");
		$ul.append($li);
		
		layui.use(["slider"],function(){
			let $d = layui.slider.render({
			  elem: '#'+_slideId,
			  range: true,
			  min : _newData.date.startTime.getTime(),
			  max : _newData.date.endTime.getTime(),
			  value : _newData.date.endTime.getTime(),
//			  tips : false,
			  change: function(value){
			  	let _startDate = new Date(value[0]),
			  		_endDate = new Date(value[1]);
			  		setSliderDateInfo(getDate(_startDate,_endDate));
			    _classEcharts0.setDate({
			    	startTime : _startDate,
			    	endTime : _endDate
			    }).update();
			  },
			  setTips: function(value){ //自定义提示文本
				return WebLoader.classDate.responseDate(new Date(value),"yyyy-mm-dd hh:mm:ss");
			  }
			});
			
			let _mouseMoveClock;
			function onMouseMove(event){
				_mouseMoveClock = event.timeStamp;
				let _offsetX = event.offsetX,
					_thisTime = _newData.date.startTime.getTime()+(
						_offsetX/$slider0.outerWidth()*100*(
							(_newData.date.endTime.getTime()-_newData.date.startTime.getTime())/100
						)
					);
				let _tipsTime = WebLoader.classDate.responseDate(new Date(_thisTime),"yyyy-mm-dd hh:mm:ss");
				setTimeout(function(){
		            if(_mouseMoveClock-event.timeStamp==0){
		            	console.info(_tipsTime);
		            }
				},100);
			}
			
			function onMouseout(event){
				console.info(event);
			}
			
			let $slider0 = $("#"+_slideId+" .layui-slider");
			let $tips = $("<div class='layui-slider-tips-date'></div>");
			$tips.html(getDate(_newData.date.startTime,_newData.date.endTime));
			$slider0.append($tips);
//			$slider0.hover(onMouseMove,onMouseout);
//			$slider0.on("mousemove",onMouseMove);

			function getDate(startDate,endDate){
				return WebLoader.classDate.responseDate(startDate,"yyyy-mm-dd hh:mm:ss") + "&nbsp;&nbsp;至&nbsp;&nbsp;" + WebLoader.classDate.responseDate(endDate,"yyyy-mm-dd hh:mm:ss")
			}
			function setSliderDateInfo(html){
				$tips.html(html);
			}
			
			//设定窗口自动大小
			let _moduleWin = getModuleWindowByName("system.main");
			let $layer = _moduleWin.$(".layui-layer.layui-layer-iframe.mubiao-shixutu");
			$layer.css({"opacity":"0","transition": "opacity 0.3s ease-in-out 0s;"});
			$layer.find("iframe").css({"height":($doc.outerHeight())+"px"});
			$layer.css({"height":"auto"});
			$layer.css({"height":($layer.outerHeight())+"px"});
			$layer.css({
				"top":(_moduleWin.$("#x-hidden-window").outerHeight()-$layer.outerHeight())+"px",
				"opacity":"1"
			});
		})
		this.initEcharts(_newData);
	}
	
	module.initEcharts = function(data){
		_classEcharts0 = new ClassEchartsLine();
		_classEcharts0.create(data);
	}
	
	module.init = function(){
		let _iframeMain = getModuleWindowPageObjectByName("system.main");
		_SHOUDUAN_DRAW = _iframeMain.SHOUDUAN_DRAW;
		_SHOUDUAN_DRAW.init({
			map : _iframeMain.MAP.getMap(),
			ol : top.ol
		})
		.clearLayer()
		.changeInteractionActive(["select"])
		.setCallback("draw.select",function(feature){
			
		});
		
		$doc = $("#x-view-content");
		
		let _parmas = location.search.replace(/^\?+/,"");
		try{
			_parmas = JSON.parse(decodeURIComponent(_parmas));
		}catch(e){
			_parmas = {};
		}
		
		parent.HTTP.httpGetSXTById({
			data : _parmas,
			success : function(result){
				_this.initPanel(result,_parmas);
				parent.CAIHONGTU.initPanel(result);
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.SHIXUTU_ECHARTS={});

/**
 * 彩虹图
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	let _SHOUDUAN_DRAW;
	
	module.setDrawPolygon = function(data){
		if(data.length<1){
			return this;
		}
		_SHOUDUAN_DRAW.setDrawLine(data)
			.layerFitExtent();
		return this;
	}
	
	module.initPanel = function(data){
		if(_SHOUDUAN_DRAW){
			//调试模式，客户要求同时显示多条彩虹图，不能进行清空
//			_SHOUDUAN_DRAW.clearLayer();
			let _pointArray = [];
			$.each(data, function(index,el) {
				$.each(el, function(i,e) {
					let _id = WebLoader.createUUID();
					let _d = {
						id : "shouduan_"+i+"_"+_id,
						name : _id,
						color : parent.MAIN.getColorByIndex(index),
						lineString : (function(){
							let _array = [];
							$.each(e, function(p,d) {
								_array.push([d.jd,d.wd]);
							});
							return _array.toLINESTRING();
						})(),
					};
					_pointArray.push(_d);
				});
			});
			_SHOUDUAN_DRAW.setDrawLinePoint(_pointArray);
		}
	}
	
	module.close = function(){
		if(_SHOUDUAN_DRAW){
			_SHOUDUAN_DRAW.clearLayer();
		};
	}
	
	module.init = function(){
		let _winMain = getModuleWindowPageObjectByName("system.main");
		_SHOUDUAN_DRAW = _winMain.SHOUDUAN_DRAW;
		
		$doc = $("#x-view-content");
	};
	
})(jQuery,_pageObject,_pageObject.CAIHONGTU={});

/**
 * http请求逻辑
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	/**
	 * 获取时序图
	 * @param {Object} option
	 */
	module.httpGetSXTById = function(option){
		let _moduleName = "http.zhts.ssts.mubiao.shixutu.getById",
			_url = getModuleURL(_moduleName);
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						option.success(result.data);
					}
				}else{
					layui.layer.msg("数据请求失败",{time:5000});
				}
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.HTTP={});
