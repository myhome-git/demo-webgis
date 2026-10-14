var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

/**
 * 模块入口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.FORM.init();
		parent.WUQIIMAGE.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * FORM模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,_pageAction;
	let _winMain = getModuleWindowPageObjectByName("system.main");
	
	/**
	 * 获取from内容
	 */
	module.getFormValue = function(){
		return $doc.getFormValue();
	}
	
	/**
	 * 提交表单数据
	 * @param {Object} option
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url,
			layui = top.layui;

		$.extend(true, _data, $doc.getFormValue());
		_data.action = _pageAction || "add";

		if(_data.action=="update"){
			_url = getModuleURL("http.system.manage.config.ts.mb.media.update");
		}else{
			_url = getModuleURL("http.system.manage.config.ts.mb.media.insert");
		}
		
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(_pageAction=="update"){
						layui.layer.msg("更新成功");
					}else{
						layui.layer.msg("添加成功");
					}
					if(option.callback){
						option.callback();
					}
				}else{
					layui.layer.msg(result["message"]);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
	}
	
	module.init = function(){
		$doc = $("#form-add");
//		this.bindEvent();

		layui.use(["form"],function(){
			layui.form.render();
			
			layui.form.on('submit(formSubmit)', function(data){
				_this.httpSubmitForm();
				return false;
			});
			
			_pageAction = xUtilBase.getUrlParam("action");
			if(_pageAction=="update" || _pageAction=="select"){
				let _id = xUtilBase.getUrlParam("id");
				_this.httpGetDataById(_id);
				$doc.addClass("action-update");
				parent.WUQIIMAGE.init(_id);
			}
		});
	}
	
})(jQuery,_pageObject,_pageObject.FORM={});

/**
 * 图像模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,$btnFileUplaod;
	let _pageSearch;
	
	/**
	 * 打开文件上传
	 * @param {Object} _id
	 */
	module.openFileUpload = function(){
		let _url = getModuleURL("module.file.upload"),
			layui = top.layui,
			_openLayerIndex;
		
    	let _classFileUpdateControlMain = new ClassFileUpdateControlMain();
    		_classFileUpdateControlMain.SetUploadURL(getModuleURL("http.file.uplaod"))
    			.SetWindowURL(_url)
    			.SetUploadFileMultiSelection(true)
    			.SetUplaodType("all")
    			.SetUplaodSize("50mb");
		
		let _module,
			_moduleUpload;
		
		/**
		 * 文件上传成功后点击确定函数
		 */
		function onFileUploadSuccess(data){
			if(!data || data.length<1){
				return;
			}
			
			let _result = [];
			$.each(data, function(index,el) {
				let _httpResult = el["__httpUploadRetrun"];
				_result.push({
					action : "upload",
					id : el.id,
					name : el.name,
					mime : _httpResult.mime,
					filePath : _httpResult.filePath,
					src : getModuleURL("http.file.getById")+"?filePath="+_httpResult.filePath
				});
			});
			
//			_this.initImageList(_result);
			
			//提交数据
			let _newList = [];
			$.each(_result, function(index,el) {
				let _default = {
					name:el.name,
					mime:el.mime,
					filePath:el.filePath,
				};
				$.extend(true, _default, _pageSearch);
				_newList.push(JSON.stringify(_default));
			});
			xUtilBase.ajaxQueuePromise({
				ajaxDefault : {
					url : getModuleURL("http.system.manage.config.ts.mb.media.insert")
				},
				ajaxData : _newList,
				callback : {
					success : function(result){
						if(result["code"]!=0){
							layui.layer.msg(result["message"]);
						}
					},
					error : function(xhr,type,text){
						console.warn(xhr,type,text);
					},
					complete : function(){
						layui.layer.msg("操作完成");
						_this.httpRefreshImageList();
					}
				}
			});
			
		}
		
        let _default = {
            id: "layer-open-file-upload",
            type: 2,
            title: "<i class='iconfont fa fa-cloud-upload'></i>文件上传",
            area: ['650px', '478px'],
            content: _classFileUpdateControlMain.GetLoadURL(),
            btn: ['确定', '取消'],
            yes: function(index){
            	
				var _data = _moduleUpload.getFileUploadControl().GetLinkInterfaceUploadSuccessData();
		    	if(_data.uploadErrorFiles.length>0){
		    		layui.layer.msg("窗口中有待处理的文件");
		    		return;
		    	}
		    	
		    	if(_data.uploadFiles.length<1){
		    		layui.layer.msg("窗口中未发现文件");
		    		return;
		    	}
		    	
		    	onFileUploadSuccess(_data.uploadFiles);
		    	layui.layer.close(_openLayerIndex);
			},
			success : function(layero,index){
				_openLayerIndex = index;
				_module = getModuleWindowPageObjectByURL(_url);
				_moduleUpload = _module.UPLOAD;
			}
        }
        layui.layer.openWin(_default);
	}
	
	/**
	 * 根据武器id获取图像列表
	 * @param {Object} option
	 */
	module.httpGetImageList = function(option){
		let _url = getModuleURL("http.system.manage.config.ts.mb.media.getIconsByMbId"),
			_data = {};
		$.extend(true, _data, option);
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
	 * 删除多个数据
	 * @param {Object} idArray
	 */
	module.httpRemoveTableMultipleById = function(idArray,callback){
		layui.layer.confirm('您确认删除选中数据吗？删除后不可进行恢复！', {icon: -1, title:'提示'}, function(index){
			let _data = idArray;
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : getModuleURL("http.system.manage.config.ts.mb.media.delete"),
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						layui.layer.msg("删除成功");
						if(callback){
							callback();
						}
					}else{
						layui.layer.msg(data["message"],{time:5000});
					}
				}
			});
			
		});
	}
	
	/**
	 * 根据数据生成图像列表
	 * @param {Object} data
	 */
	module.initImageList = function(data){
		let $parent = $doc.find(".layui-tab-body");
		$parent.empty();
		let _html = [];
		_html.push("<ul class='wuqi-image-ul x-clearfix'>");
		$.each(data, function(index,el) {
			_html.push("<li class='wuqi-image-li'>");
			_html.push("<input type=\"checkbox\" x-input-name=\"wuqi-image-value\" value=\""+(function(){
				if(el.action=="getIconById"){
					return el.id
				}
			})()+"\" name=\"wuqi-image-value\" "+(function(){
				return " action='"+el.action+"' ";
			})()+" lay-skin=\"primary\" />");
			_html.push("<img src='"+el.src+"' alt='none' />");
			_html.push("</li>");
		});
		_html.push("</ul");
		$parent.append(_html.join(""));
		$doc.layuiFormRender("checkbox");
		
		let $lis = $parent.find(".wuqi-image-li");
		$lis.on("click",onImageEvent);
		
		let $inputs = $lis.find(">input");
		$inputs.on("click",function(event){
			event.stopPropagation();
		});
		
		$(document).on("click",function(){
			_this.initImageControlMenu();
		});
		
		function onImageEvent(event){
//			console.info("触发事件",event.type);
			let $this = $(this);
			let $input = $this.find(">input[type='checkbox']");
			let _isSelected = $input.prop("checked")||false;
			$input.prop("checked",!_isSelected);
			$doc.layuiFormRender("checkbox");
			_this.initImageControlMenu();
		}
	}
	
	/**
	 * 刷新图像区域
	 * @param {Object} id
	 */
	module.httpRefreshImageList = function(){
		let $parent = $doc.find(".layui-tab-body");
		$parent.empty();
		
		let _default = {
			callback : function(result){
				let _list = [];
				$.each(result, function(index,el) {
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
				_this.initImageList(_list);
			}
		};
		$.extend(true, _default, _pageSearch);
		this.httpGetImageList(_default);
	}
	
	/**
	 * 取出图像区域内的数据
	 */
	module.getImageFormValue = function(){
		let $ul = $doc.find(".wuqi-image-ul");
		return $ul.getFormValue();
	}
	
	/**
	 * 初始化图像控制菜单
	 */
	module.initImageControlMenu = function(){
		let $ul = $doc.find(".wuqi-image-ul");
		let $menu = $doc.find(".image-control-menu"),
			_className = "x-show";
		
		let _value = this.getImageFormValue(),
			_field = _value["wuqi-image-value"];
		if(!_field || _field.length<1){
			$menu.removeClass(_className);
			return;
		}
		$menu.addClass(_className);
	}
	
	/**
	 * 绑定事件
	 */
	module.bindEvent = function(){
		//工具栏
		$doc.find(".image-control-menu").find("[x-btn-name]").unbind().on("click",function(){
			var $this = $(this),
				_val = $this.attr("x-btn-name");
			switch (_val){
				case "delete-multiple":
					(function(){
						let $ul = $doc.find(".wuqi-image-ul"),
							_data = _this.getImageFormValue(),
							_field = _data["wuqi-image-value"];
						if(!_field || _field.length<1){
							return;
						}
						
						_this.httpRemoveTableMultipleById(_field,function(){
							_this.httpRefreshImageList();
							_this.initImageControlMenu();
						});
					})();
					break;	
				default:
					break;
			}
		});
	}
	
	module.init = function(id){
		_pageSearch = WebLoader.getLocationSearchToObject();
		
		$doc = $("#wuqi-data-image");
		this.bindEvent();
		
		$btnFileUplaod = $("#wuqi-file-upload");
		$btnFileUplaod.on("click",function(){
			_this.openFileUpload();
		});
		this.httpRefreshImageList(id);
	}
	
})(jQuery,_pageObject,_pageObject.WUQIIMAGE={});