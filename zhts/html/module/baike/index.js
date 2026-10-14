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
	
	module.init = function(){
		parent.BAIKE.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 系统百科模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	let _pageSearch;
	
	/**
	 * 初始化面板
	 * @param {Object} data
	 */
	module.initPanel = function(data){
		let _html = template("TemplateTableSearchTABLEQUYUGUANLI",data);
		$doc.html(_html);
	}
	
	/**
	 * 初始化图像
	 * @param {Object} data
	 */
	module.initImage = function(data){
		let $mbImage = $doc.find("#mb-image");
		$mbImage.addClass("layui-carousel");
		
		let $item = $("<div carousel-item></div>");
		$item.addClass("carousel-item");
		$mbImage.append($item);
		
		let $imageHidden = $("<div></div>");
		$imageHidden.addClass("image-hidden").attr("id","image-hidden");
		$mbImage.append($imageHidden);
		
		$.each(data || [], function(index,el) {
			let $li = $("<div></div>");
			let $img = $("<img></img>");
			$img.attr("src",el.src);
			$li.append($img);
			$item.append($li);
			
			let $hideLi = $("<div></div>");
			$hideLi.attr("index",index);
			$hideLi.html("<img src='"+el.src+"' index='"+index+"' />");
			$imageHidden.append($hideLi);
		});

		//建造实例
		layui.carousel.render({
			elem: '#'+$mbImage.attr("id"),
		    width: '100%', //设置容器宽度
		    height : "100%",
		    arrow: 'always', //始终显示箭头
		    autoplay : true,
		    //,anim: 'updown' //切换动画方式
		});
		
		
		//绑定图像隐藏事件
		function enentView(){}
		
		$imageHidden.viewer({
			transition:false,
			zoomRatio:0.3,
			viewed : enentView
		});
		
		$item.find(">div").on("click",function(){
			let $this = $(this);
			$imageHidden.find(">div:eq("+$this.index()+") img").trigger("click");
		});
		
	}
	/**
	 * 根据id和lb获取图像列表
	 * @param {Object} option
	 */
	module.httpGetImageList = function(option){
		let _url = getModuleURL("http.system.manage.config.ts.mb.media.getIconsByMbId"),
			_data = {};
		$.extend(true, _data, option.data);
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0" && result.data){
					if(option.callback){
						option.callback(result.data);
					}
				}else{
					layui.layer.msg(result["message"]);
				}
			}
		});
	}
	
	/**
	 * 图像管理
	 */
	module.openImageFileManage = function(option){
		option = option || {};
		let _moduleName = "module.baike.image.add",
			_id = _moduleName.replace(/\./g,"-"),
			_url = getModuleURL(_moduleName),
			_title = "图像管理",
			layui = top.layui;
			
		layui.layer.openWin({
			id : _id,
            type: 2,
            title: _title,
            isOutAnim : false,
            area: ['540px', '470px'],
            content: _url+"?"+WebLoader.toJsonValue(option),
            btn: (function(){
            	return false;
            	return ['保存', '取消'];
            })(),
        });
	}
	
	module.bindEvent = function(){
		$doc.find("#wuqi-file-upload").on("click",function(){
			let _default = {action : "select"};
			$.extend(true, _default, $("#layui-tab-media").getFormValue());
			_this.openImageFileManage(_default);
		});
	}
	
	module.init = function(){
		$doc = $("#x-view-content");
		let _search = WebLoader.getLocationSearchToObject();
		_pageSearch = _search;
		if(_search.openType && _search.openType=="blank"){
			$("body").addClass("skin-transparent-not");
		}
		
		layui.use(["carousel"], function(){
			parent.BAIKEHTTP.httpGetInfoById({
				data : _search,
				success : function(result){
					_this.initPanel(result);
					
					_this.httpGetImageList({
						data : result.mbinfo,
						callback : function(data){
							
							let _list = [];
							$.each(data, function(index,el) {
								_list.push({
									action : "getIconById",
									id : el.id,
									name : el.filename,
									mime : el.mime,
									src : getModuleURL("http.system.manage.config.ts.mb.media.getIconById")+"?id="+el.id,
									mbid : el.mbid,
									mblb : el.mblb
								});
							});
				
							_this.initImage(_list);
						}
					});
					_this.bindEvent();
				}
			});
		});
		
		
	};
	
})(jQuery,_pageObject,_pageObject.BAIKE={});

/**
 * http请求逻辑
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	
	module.httpGetInfoById = function(option){
		_sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiaoxiangqing.getById"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						let _newData = initPanel(option.data.mblb,result.data);
						option.success(_newData);
					}
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
		
		function initPanel(type,data){
			let _func;
			if(type=="02"||type=="04"){
				_func = "transformFieldJIANCHUAN";
			}else if(type=="03"){
				_func = "transformFieldFEIJI";
			}else{
				return;
			}
			let _transformData = parent.BAIKE_FIELD_TEMPLATE[_func](data);
			let _data = {
				mbinfo : {
					mblb : data.mbjbqk.mblb,
					mbid : data.mbjbqk.id
				},
				isRun : true,
				name : "里根号航空母舰",
				datalist : _transformData.datalist || [
					{
						type : "baseInfo",
						name : "基本信息",
						list : [{
							itemName:"中文名称",
							itemValue : "里根号航空母舰"
						},{
							itemName:"舰船类型",
							itemValue : "核动力航空母舰"
						},{
							itemName:"英文名",
							itemValue : "USS Ronald Reagan（CVN-76）"
						},{
							itemName:"建造公司",
							itemValue : "纽波特纽斯船厂"
						},{
							itemName:"服役时间",
							itemValue : "2003年7月12日"
						}],
						
					}
				],
				mediaImage : [{
					type : "image",
					src : "test.jpg"
				}],
				mediaVideo : [{
					type : "video",
					src : "1.mp4"
				}]
			};
			return _data;
		}
	};
	
})(jQuery,_pageObject,_pageObject.BAIKEHTTP={});

/**
 * 字段对照模板
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	/**
	 * 对数据进行纠正
	 * @param {Object} value
	 */
	module.toFilterHTML = function(value){
		if(value){
			return value.replace(/\\n/g,"<br/>").replace(/\\"/g,"&#34;");
		}
	}
	
	/**
	 * 舰船
	 * @param {Object} key
	 */
	module.transformFieldJIANCHUAN = function(data){
  		let _keys = {
  			mbmc : "目标名称",
  			gjdq : "国家地区",
			jz : "军种",
			ywmc : "英文名称",
			jx : "舰型",
			mbzl : "目标种类",
			jj : "舰级",
			xh : "弦号",
			mg : "母港",
			mbfl : "目标分类",
  		};
  		
  		let _data = {
  			datalist : [
  				{
	  				type : "baseInfo",
					name : "基本信息",
	  				data : (function(){
	  					let _array = [],
	  						_mbjbqk = data.mbjbqk;
	  					for(let i in _keys){
	  						_array.push({
	  							itemName:_keys[i],
								itemValue : _mbjbqk[i]
	  						});
	  					}
	  					return _array;
	  				})()
	  			},
	  			{
	  				type : "baseTabs",
					name : "基本参数",
					data : (function(){
						let _array = [],
	  						_mbjbcs = data.mbjbcs;
	  					for(let i in _mbjbcs){
	  						_array.push({
	  							title : i,
	  							hash : WebLoader.createUUID(),
	  							data : (function(){
	  								let _arr = [];
	  								$.each(_mbjbcs[i], function(index,el) {
	  									_arr.push({
	  										itemName:el["csm"],
											itemValue : _this.toFilterHTML(el["csnr"])
	  									});
	  								});
	  								return _arr;
	  							})()
	  						});
	  					}
	  					return _array;
					})()
	  			}
  			]
  		};
  		
  		return _data;
	}
	
	/**
	 * 飞机
	 * @param {Object} key
	 */
	module.transformFieldFEIJI = function(data){
  		let _keys = {
  			mbmc : "目标名称",
			gjdq : "国家地区",
			mbxh : "目标型号",
			ch : "中文名称",
			jz : "军种",
			mblb : "目标类别",
			mbfl : "目标分类",
  		};
  		let _data = {
  			datalist : [
  				{
	  				type : "baseInfo",
					name : "基本信息",
	  				data : (function(){
	  					let _array = [],
	  						_mbjbqk = data.mbjbqk;
	  					for(let i in _keys){
	  						_array.push({
	  							itemName:_keys[i],
								itemValue : _mbjbqk[i]
	  						});
	  					}
	  					return _array;
	  				})()
	  			},
	  			{
	  				type : "baseTabs",
					name : "基本参数",
					data : (function(){
						let _array = [],
	  						_mbjbcs = data.mbjbcs;
	  					for(let i in _mbjbcs){
	  						_array.push({
	  							title : i,
	  							hash : WebLoader.createUUID(),
	  							data : (function(){
	  								let _arr = [];
	  								$.each(_mbjbcs[i], function(index,el) {
	  									_arr.push({
	  										itemName:el["csm"],
											itemValue : _this.toFilterHTML(el["csnr"])
	  									});
	  								});
	  								return _arr;
	  							})()
	  						});
	  					}
	  					return _array;
					})()
	  			}
  			]
  		};
  		
  		return _data;
	}
	
	
})(jQuery,_pageObject,_pageObject.BAIKE_FIELD_TEMPLATE={});