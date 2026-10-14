/**
 * 打开窗口模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($, parent, module) {
	module.parent = parent;
	let _this = module,
		$doc, _map;

	/**
	 * 打开标绘面板
	 */
	module.openPlotWin = function() {
		let _win = $("#x-hidden-window"),
			_url = getModuleURL("module.plot.main"),
			_onSelect = parent.MAPEVENT.PLOT_ONSELECT;

		_map.removeInteraction(_onSelect);
		_map.addInteraction(_onSelect);
		
		//添加title按钮
		function addTitleButtn($dom,option){
			let $title = $dom.find(".layui-layer-title");
			let $btn = $("<button></button>");
				$btn.addClass("layui-btn layui-btn-xs layui-btn-normal")
					.html(option.font)
					.addClass(option.className)
					.on("mousedown",function(e){
						e.stopPropagation();
						if(option.callback && option.callback.mousedown){
							option.callback.mousedown();
						}
					});
			$title.append(option.nbsp)
				.append($btn);
		}

		var _default = {
			id: "layer-open-plot-win",
			type: 2,
			shade: false,
			title: "<i class='iconfont fa fa-edit'></i>标绘面板",
			area: ['350px', (_win.outerHeight() - 170) + 'px'],
			offset: ["125px", "30px"],
			content: _url,
			cancel: function(index, layero) {
				let _module = getModuleWindowPageObjectByURL(_url);
				if (_module) {
					_module.LEFTPANEL.close();
				}
			},
			end: function(index, layero) {
				//移除select事件removeInteraction
				_map.removeInteraction(_onSelect);
			},
			success: function(layero, index) {
				addTitleButtn(layero,{
					nbsp : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
					font : "<i class='iconfont fa fa-trash'></i>清除",
					className : "layui-btn-danger",
					callback : {
						mousedown : function(e){
							let _module = getModuleWindowPageObjectByURL(_url);
							if (_module) {
								_module.LEFTPANEL.clearLayer();
								_module.LEFTPANEL.closeDrawAttribute();
							}
						}
					}
				});
				addTitleButtn(layero,{
					nbsp : "&nbsp;&nbsp;&nbsp;",
					font : "<i class='iconfont fa fa-trash'></i>删除",
					className : "",
					callback : {
						mousedown : function(e){
							let _module = getModuleWindowPageObjectByURL(_url);
							if (_module) {
								_module.LEFTPANEL.removeSelectedFeatures(function(result){
									if(result){
										_module.LEFTPANEL.closeDrawAttribute();
									}
								});
							}
						}
					}
				});
			}
		}
		layui.layer.openWin(_default);
	}
	
	module.plotToImage = function(option){
		function exportMap(){
		    var dom = document.getElementById("map");
		    var type = "png";
		    var name = "系统截图"
		    html2canvas(dom).then(function (canvas) {
		        var image_png = canvas.toDataURL("image/png")
		        var link = document.createElement("a");
		        if (type == "png") {
		            blob = dataURLtoBlob(image_png);
		            link.download = name + ".png";
		        } else {
		            blob = dataURLtoBlob(image_jpg);
		            link.download = name + ".jpg";
		        }
		        objurl = URL.createObjectURL(blob);
		        link.href = objurl;
		        link.click();
		        URL.revokeObjectURL(objurl)
		        function dataURLtoBlob(dataurl) {
		            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
		                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		            while (n--) {
		                u8arr[n] = bstr.charCodeAt(n);
		            }
		            return new Blob([u8arr], { type: mime });
		        }
		    })
		}
		exportMap();
		return;
		
		if(option && option.callback && option.callback.before){
			option.callback.before();
		}
		
		//预留二次绘制逻辑
		let _tempId = "canvasToImage";
		let _doc1 = $("#"+_tempId);
		if(_doc1.length<1){
			_doc1 = $("<div style='width:0;height:0;overflow:hidden;'><canvas id='"+_tempId+"' style='margin:0;'></canvas></div>");
			$("body").append(_doc1);
			_doc1 = $("#"+_tempId).get(0);
		}else{
			_doc1 = _doc1.get(0);
		}
		
		let $map =  $(_map.getTargetElement());
		let $canvas = $map.find("canvas");

		//测试是否跨域
		try{
			$canvas.get(0).toDataURL();
		}catch(e){
//			throw new Error("image url is not localhost");
//			throw new Error(e.message);
//			return;
		}
		
		html2canvas(_map.getTargetElement()).then(function(canvas){
			canvasOutImage({
				imageBase64 : canvas.toDataURL(),
				width : canvas.width,
				height : canvas.height,
				callback : option.callback
			});
		});
		
		
		function canvasOutImage(option){
			
			let $a = $("<a style='display:none'></a>")
				.attr("href",option.imageBase64)
				.attr("download",(new Date)+".png");
			$("body").append($a);
			$a[0].click();
			$a.remove();
			
			if(option.callback && option.callback.after){
				option.callback.after();
			}
			
//			let _cxt = _doc1.getContext("2d");
//			
//			let _image = new Image();
//			_image.src = option.imageBase64;
//			_image.setAttribute("crossOrigin",'Anonymous')
//			_image.onload = function(){
//				let $doc1 = $(_doc1);
//				$doc1.attr("width",option.width)
//					.attr("height",option.height);
//				_cxt.drawImage(this,0,0);
//			}
		}
	}

	/**
	 * 打开百科
	 */
	module.openBAIKE = function(option) {
		let _win = $("#x-hidden-window"),
			_url = getModuleURL("module.baike.main")+"?"+WebLoader.toJsonValue(option);
		
		if(option.openType=="blank"){
			WSynchro.open(_url);
			return;
		}
		
		let $icon = $("<i class='iconfont fa '></i>");
		if(option.mblb=="02" ||option.mblb=="04"){
			$icon.addClass("fa-ship");
		}else if(option.mblb=="03"){
			$icon.addClass("fa-plane");
		}
		var _default = {
			id: "layer-open-baike",
			type: 2,
			shade: false,
			maxmin: true,
			title: $icon.outerHTML()+"目标详情（"+option.mbmc+"）",
			area: ['1000px', (_win.outerHeight() - 200) + 'px'],
			content: _url,
			end: function(index, layero) {
				
			},
			success: function(layero, index) {

			}
		}
		layui.layer.openWin(_default);
	}

	/**
	 * 坐标定位
	 */
	module.openMapFlyCoordinate = function() {
		let _win = $("#x-hidden-window"),
			_url = getModuleURL("module.map.fly.coordinate");
		let _default = {
			id: "layer-open-map-flight-coordinate",
			type: 2,
			title: "<i class='iconfont fa fa-map-marker'></i>坐标定位",
			area: ['400px', '210px'],
			content: _url,
			btn: ['确定', '取消'],
			yes: function(index, el) {
				//定位位置
				let _module = getModuleWindowPageObjectByURL(_url).MAPFLIGHTCOORDINATE;
				_module.setPosition(_module.getFormCoordinate());
				layui.layer.close(index);
			},
		}
		layui.layer.openWin(_default);
	}

	/*
	 * 系统基础管理配置
	 */
	module.openBaseSystemManageConfig = function() {
		let _win = $("#x-hidden-window"),
			_url = getModuleURL("module.system.manage.config");
		let _default = {
			id: "layer-open-map-flight-coordinate",
			type: 2,
			title: "<i class='iconfont fa fa-cog'></i>基础设置",
			area: ['1000px', '600px'],
			content: _url,
		}
		layui.layer.openWin(_default);
	}
	
	/**
	 * 打开态势设置
	 */
	module.openTSSZ = function(){
		//判断态势是否已经获取配置
		if(!parent.ZHTS_SSTS_MUBIAO_CONTROL.getIsQueryServerConfig()){
			layui.layer.msg("还未获取服务器配置信息，请稍后再试");
			return false;
		}
		
		let _url = getModuleURL("module.taishi.system.set");
		let _default = {
			id : "layer-open-taishi-set",
			type: 2,
			title: "<i class=\"iconfont fa fa-gears\"></i><font>态势设置</font>",
			shade: false,
			scrollbar: true,
			content: _url,
			area: ["560px", "325px"]
		};
		layui.layer.openWin(_default);
	}
	
	/**
	 * 态势分组
	 */
	module.openTSFZSZ = function(){
		let _moduleName = "module.taishi.mubiao.fenzu.main",
			_id = _moduleName.replace(/\./,"-"),
			_url = getModuleURL(_moduleName);
		let _default = {
			id : _id,
			type: 2,
			title: "<i class=\"iconfont fa fa-sitemap\"></i><font>态势分组</font>",
			shade: false,
			scrollbar: true,
			content: _url+"?id=fenzuguanli",
			area: ['650px', '500px'],
		};
		layui.layer.openWin(_default);
	}
	
	/**
	 * 打开态势分组tree
	 */
	module.openTSFZTREE = function(option){
		let _moduleName = "module.taishi.mubiao.fenzu.tree",
			_id = _moduleName.replace(/\./,"-"),
			_url = getModuleURL(_moduleName);
		let _default = {
			id : _id,
			type: 2,
			title: "<i class=\"iconfont fa fa-sitemap\"></i><font>自定义分组</font>",
			shade: false,
			scrollbar: true,
			content: _url+"?id=fenzuguanli",
			area: ['300px', '400px'],
		};
		
		$.extend(true, _default, option);
		layui.layer.openWin(_default);
	}
	
	/**
	 * 打开告警设置
	 */
	module.openGJSZ = function(_id){
		let _url = getModuleURL("module.fence.main");
        let _default = {
            id: "layer-open-fence",
            type: 2,
            shade : false,
//          title: "<i class='iconfont fa fa-object-group'></i>告警设置",
            title: "<i class='iconfont fa fa-bell'></i>告警设置",
            area: ['650px', '500px'],
            content: _url+"?id="+_id,
            end: function(){
				let _module = parent.FENCE_DRAW;
				_module.close();
			}  
        }
        layui.layer.openWin(_default);
	}
	
	/**
	 * 通信态势
	 */
	module.openTONGXINTAISHI_ECHARTS = function(option){
		layui.layer.close(_this.__openLayerIndex_TONGXINTAISHI);
		let _moduleName = "module.zhts.mubiao.tongxintaishi.echarts";
		let _url = getModuleURL(_moduleName);
        let _default = {
            id: _moduleName.replace(/\./g,"-"),
            type: 2,
            shade : false,
//          title: "<i class='iconfont fa fa-object-group'></i>告警设置",
            title: "<i class='iconfont fa fa-podcast'></i>通信态势（"+option.mbmc+"["+option.mbbh+"]）",
            area: ['600px', '400px'],
            offset : "l",
            maxmin : true,
            anim: -1,
            isOutAnim: false,
            content: _url+"?"+WebLoader.toJsonValue(option),
            callback : {
				onSuccess : function(layero,index){
					_this.__openLayerIndex_TONGXINTAISHI = index;
				}
			}
        }
        layui.layer.openWin(_default);
	}
	
	/**
	 * 网络分析
	 * @param {Object} option
	 */
	module.openNETWORK_ECHARTS = function(option){
		let _moduleName = "module.zhts.mubiao.network.echarts";
		let _url = getModuleURL(_moduleName);
        let _default = {
            id: _moduleName.replace(/\./g,"-"),
            type: 2,
            shade : false,
//          title: "<i class='iconfont fa fa-object-group'></i>告警设置",
            title: "<i class='iconfont fa fa-bar-chart'></i>网络分析",
            area: ['80%', '80%'],
            maxmin : true,
            content: _url,
            btn : false,
            end: function(){
				
			},
        }
        layui.layer.openWin(_default);
	}
	
	/**
	 * 武器攻击效能
	 * @param {Object} option
	 */
	module.openWUQIGONGJIXIAONENG = function(option){
		this.closeWUQIGONGJIXIAONENG();
		let _moduleName = "module.zhts.wuqi.xiaoneng.main";
		let _url = getModuleURL(_moduleName);
        let _default = {
            id: _moduleName.replace(/\./g,"-"),
            type: 2,
            shade : false,
            title: "<i class='iconfont fa fa-bolt'></i>武器攻击效能评估",
            area: ['600px', '400px'],
            offset : ["132px","30px"],
            content: _url,
            btn : false,
			anim: -1,
            isOutAnim: false,
			callback : {
				onSuccess : function(layero,index){
					_this.__openLayerIndex_WUQIGONGJIXIAONENG = index;
					let _module = getModuleWindowPageObjectByURL(_url).FORM;
					_module.setTableReload(option);
				}
			}
        }
        layui.layer.openWin(_default);
	}
	module.closeWUQIGONGJIXIAONENG = function(){
		layui.layer.close(this.__openLayerIndex_WUQIGONGJIXIAONENG);
	}
	
	/**
	 * 目标时序彩虹图
	 * @param {Object} option
	 */
	module.openMUBIAOSHIXUTU = function(option){
		option = option || {};
		let _moduleName = "module.zhts.mubiao.shixutu.main",
			_module = getModuleWindowPageObjectByName(_moduleName),
			_url = getModuleURL(_moduleName),
			_id = _moduleName.replace(/\./g,"-");
		
		if(_module){
			let $doc = WebLoader.layer.getLayerByClassName(_id);
			let $title = $doc.find(">.layui-layer-title");
			$title.html("<i class='iconfont fa fa-bar-chart'></i>手段时序彩虹图"+option.title);
			
			_module.HTTP.httpGetSXTById({
				data : option.data,
				success : function(result){
					_module.SHIXUTU_ECHARTS.initPanel(result,option.data);
					_module.CAIHONGTU.initPanel(result);
				}
			});
			return;
		}
		
		layui.layer.close(_this.__openLayerIndex_SHIXUTU);
        let _default = {
            id: _id,
            type: 2,
            shade : false,
            title: "<i class='iconfont fa fa-bar-chart'></i>手段时序彩虹图"+option.title,
            area: ['100%', '0px'],
            offset : "b",
            content: _url+"?"+WebLoader.toJsonValue(option.data),
            btn : false,
			anim: -1,
            isOutAnim: false,
            skin : " mubiao-shixutu",
			callback : {
				onSuccess : function(layero,index){
					_this.__openLayerIndex_SHIXUTU = index;
				}
			},
			cancel : function(index, layero){
				
				let _module = getModuleWindowPageObjectByName(_moduleName);
				if(_module.CAIHONGTU){
					_module.CAIHONGTU.close();
				}
			}
        }
        layui.layer.openWin(_default);
	}
	
	module.init = function() {
		_map = parent.MAP.getMap();
//		this.openFileUpload();
//		this.openBaseSystemManageConfig();
//		this.openPlotWin();
		//		this.openBAIKE();
		//		this.openMapFlightCoordinate();
		
	}
})(jQuery, _pageObject, _pageObject.OPENWINDOW = {});
