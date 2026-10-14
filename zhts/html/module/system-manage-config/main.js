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
		layui.use('element', function(){
			layui.element.on('tab(docDemoTabBrief)', function(data){
				let $context = $(data.elem.context);
			    switch ($context.attr("module-tab-title-name")){
			    	case "tucengguanli":
			    		parent.TUCENGPEIZHI.init();
			    		break;
			    	case "gongjiwuqi":
			    		parent.GONGJIWUQI.init();
			    		break;
			    	default:
			    		break;
			    }
			});
			
			let _id = xUtilBase.getUrlParam("id");
			if(!_id){
				_id = "tucengguanli";
			}
			$(".layui-tab .layui-tab-title >li[module-tab-title-name='"+_id+"']").trigger("click");
		});
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 图层配置
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,
		$doc,$win,$tableSearchInputBox,$tableSearchData,$tableTopToolbar,
		_xUtilLayuiTable = new xUtilLayuiTable();
		
	//复写方法，浏览器缩放时可以动态设置
	function getTableAutoHeight(){
		return $win.outerHeight() - $tableSearchData.offset().top - 10;
	}
	
	/**
	 * 初始化表格
	 */
	module.initTable = function(){
		
		let _data = $tableSearchInputBox.getElValue();
		
		//判断结束时间是否小于开始时间
		if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
			layui.layer.msg("结束时间不能小于开始时间");
			return false;
		}
		
		_xUtilLayuiTable.init({
			elem: "#"+$tableSearchData.attr("id"),
			cellMinWidth: 1,
			height: getTableAutoHeight(),	//采用美化版滚动条，不再layui内部进行滚动条
			page : true,
			toolbar: '#TemplateTableToolbar',
			isLoadScrollbar : true,
			cols: _layuiTableHeader.data["tableTUCENGPEIZHI"].header || [],
			url: getModuleURL("http.system.manage.config.layer.pager"),
			method : "post",
			parseData:function (result) {
				result.data = result.data || {};
				_xUtilLayuiTable._data = result.data;
				return {
					code:0,
					count: result.data.total ? result.data.total : 0,
					data:result.data.rows
				}
			},
			request:{
				pageName:'page',
				limitName:'rows'
			},
			where : (function(){
				var _data = $tableSearchInputBox.getElValue();
				for(var i in _data){
					if(!_data[i]){
						delete _data[i];
					}
				}
				_data["TIMESTAMP"] = new Date().getTime();
				return _data;
			})(),
			autoHeight : true,
			callback : {
				onRowClick : function(obj){
					
				},
				onRowTool : function(obj){
					var data = obj.data,
						layEvent = obj.event;
					if(layEvent === 'delete') {
						_this.httpRemoveTableById([data.id]);
					}else if(layEvent === 'update'){
						_this.openLayerEditPage("update",data.id);
					}else if(layEvent === 'select'){
						_this.openLayerEditPage("select",data.id);
					}
				},
				onSelected : function(selectedArray,obj){
//					console.info(selectedArray,obj);
				},
				onSuccess : function(a,b,c){
					
				},
				onToolbar : function(layEvent,checkStatus){
					switch (layEvent){
						case "table-refresh":
							_xUtilLayuiTable.reload();
							break;
						case "table-add":
							_this.openLayerEditPage('add');
							break;
						case "table-delete-multiple":
							$.each(checkStatus.data, function(index,el) {
								_ids.push(el.id);
							});
							if(_ids.length<1){
								layui.layer.msg("未选中任何数据");
								return;
							}
							_this.httpRemoveTableMultipleById(_ids);
							break;	
						default:
							break;
					}
				},
				on : {
					"switch(enableSwitch)" : function(obj){
						let layui = top.layui;
//						console.info(this,obj);
						var $this = $(obj.elem),
							_id = $this.attr("x-data-id"),
							_data = (function(){
								var _rows = _xUtilLayuiTable._data.rows;
								for(var i=0;i<_rows.length;i++){
									if(_rows[i].id.toString()===_id){
										return _rows[i];
									}
								}
							})(_id);
						if(!_data){
							layui.layer.msg("未找到有效数据");
							return;
						}
						
						_data.enabled = obj.elem.checked;
						_this.httpUpdateById({
							data : _data,
							callback : function(result){
								if(result){
									layui.layer.msg("启用成功");
								}else{
									layui.layer.msg("启用失败");
								}
							}
						});
					}
				}
			}
		});
	}
	
	/**
	 * 绑定搜索表单
	 */
	module.bindSearchInputEvent = function(){
		//初始化表单
		layui.use('form', function(){
			layui.form.render();
			$tableSearchInputBox.find("[x-btn-name]").on("click",function(){
				var $this = $(this),
					_val = $this.attr("x-btn-name");
				switch (_val){
					case "button-search":
						_this.initTable();
						break;
					default:
						break;
				}
			});
			
			//绑定回车键
			$tableSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
				if(event.keyCode==13){
					_this.initTable();
				}
			});
		});
	}
	
	/**
	 * 打开编辑或新增页面
	 * @param {Object} action
	 * @param {Object} type
	 * @param {Object} id
	 */
	module.openLayerEditPage = function(action,id){
		let _url = getModuleURL("module.system.manage.config.layer.add"),
			_title,
			layui = top.layui;

		switch (action){
			case "update":
				_title = "修改";
				break;
			case "select":
				_title = "查看";
				break;	
			default:
				_title = "新增";
				break;
		}
		
		layui.layer.openWin({
			id : "layer-open-tuceng-add",
            type: 2,
            title: _title,
            area: ['600px', '380px'],
            content: _url+"?action="+action+(id?"&id="+id:""),
            btn: (function(){
            	if(action=="select"){
            		return false;
            	}else{
            		return ['保存', '取消'];
            	}
            })(),
            yes: function (index,el) {
            	getModuleWindowPageObjectByURL(_url).FORM.httpSubmitForm({
            		callback : function(){
	            		_xUtilLayuiTable.reload();
	            		layui.layer.close(index);
	            	}
            	});
            },
        });
	}
	
	/**
	 * 更新数据
	 * @param {Object} option
	 */
	module.httpUpdateById = function(option){
		let _data = option.data,
			_url = getModuleURL("http.system.manage.config.layer.update"),
			layui = top.layui;
			
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(option.callback){
						option.callback(true);
					}
				}else{
					if(option.callback){
						option.callback(false);
					}
				}
			},
			error : function(a,b,c){
//				layui.layer.msg(b);
				if(option.callback){
					option.callback(false);
				}
			}
		});
	}
	
	/**
	 * 删除单个数据
	 * @param {Object} id
	 */
	module.httpRemoveTableById = function(id){
		layui.layer.confirm('您确认删除这条数据吗？', {icon: -1, title:'提示'}, function(index){
			var _data = id;
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : getModuleURL("http.system.manage.config.layer.delete"),
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						layui.layer.msg("删除成功");
						_xUtilLayuiTable.reload({
							isLastPageIndex : true
						});
					}else{
						layui.layer.msg(data["message"],{time:5000});
					}
				}
			});
		});
	}
	
	/**
	 * 删除多个数据
	 * @param {Object} idArray
	 */
	module.httpRemoveTableMultipleById = function(idArray){
		layui.layer.confirm('您确认删除选中数据吗？', {icon: -1, title:'提示'}, function(index){
			  var _data = idArray;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : getModuleURL("http.system.manage.config.layer.delete"),
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layui.layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layui.layer.msg(data["message"],{time:5000});
						}
					}
				});
			
		});
	}
	
	module.init = function(){
		
		$doc = $(".layui-tab-content .layui-tab-item[module-tab-item-name='tucengguanli']");
		$win = $("#x-hidden-window");
		$tableSearchInputBox = $doc.find("#ElementTemplateMainDataSearchINPUT");
		$tableSearchData = $doc.find("#layui-table-search-data-TUCENGPEIZHI");
		$tableTopToolbar = $doc.find("#layui-table-top-toolbar");
		
		let _className = "tableTUCENGPEIZHI".toUpperCase();
		let _html = template("TemplateTableSearch"+_className,{isRun : true});
		$tableSearchInputBox.empty().html(_html);
		
		this.bindSearchInputEvent();
		layui.use('table', function(){
			_this.initTable();
		});
			
	}
	
})(jQuery,_pageObject,_pageObject.TUCENGPEIZHI={});


/**
 * 攻击武器
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,
		$doc,$win,$tableSearchInputBox,$tableSearchData,$tableTopToolbar,
		_xUtilLayuiTable = new xUtilLayuiTable();
		
	//复写方法，浏览器缩放时可以动态设置
	function getTableAutoHeight(){
		return $win.outerHeight() - $tableSearchData.offset().top - 10;
	}
	
	/**
	 * 初始化表格
	 */
	module.initTable = function(){
		
		let _data = $tableSearchInputBox.getElValue();
		
		//判断结束时间是否小于开始时间
		if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
			layui.layer.msg("结束时间不能小于开始时间");
			return false;
		}
		
		_xUtilLayuiTable.init({
			elem: "#"+$tableSearchData.attr("id"),
			cellMinWidth: 1,
			height: getTableAutoHeight(),	//采用美化版滚动条，不再layui内部进行滚动条
			page : true,
			toolbar: '#TemplateTableToolbar1',
			isLoadScrollbar : true,
			cols: _layuiTableHeader.data["tableGONGJIWUQI"].header || [],
			url: getModuleURL("http.system.manage.config.ts.wuqi.pager"),
			method : "post",
			parseData:function (result) {
				result.data = result.data || {};
				_xUtilLayuiTable._data = result.data;
				return {
					code:0,
					count: result.data.total ? result.data.total : 0,
					data:result.data.rows
				}
			},
			request:{
				pageName:'page',
				limitName:'rows'
			},
			where : (function(){
				var _data = $tableSearchInputBox.getElValue();
				for(var i in _data){
					if(!_data[i]){
						delete _data[i];
					}
				}
				_data["TIMESTAMP"] = new Date().getTime();
				return _data;
			})(),
			autoHeight : true,
			callback : {
				onRowClick : function(obj){
					
				},
				onRowTool : function(obj){
					var data = obj.data,
						layEvent = obj.event;
					if(layEvent === 'delete') {
						_this.httpRemoveTableById([data.id]);
					}else if(layEvent === 'update'){
						_this.openLayerEditPage("update",data.id);
					}else if(layEvent === 'select'){
						_this.openLayerEditPage("select",data.id);
					}
				},
				onSelected : function(selectedArray,obj){
//					console.info(selectedArray,obj);
				},
				onToolbar : function(layEvent,checkStatus){
					switch (layEvent){
						case "table-refresh":
							_xUtilLayuiTable.reload();
							break;
						case "table-add":
							_this.openLayerEditPage('add');
							break;
						case "table-delete-multiple":
							(function(){
								let _ids = [];
								$.each(checkStatus.data, function(index,el) {
									_ids.push(el.id);
								});
								if(_ids.length<1){
									layui.layer.msg("未选中任何数据");
									return;
								}
								_this.httpRemoveTableMultipleById(_ids);
							})();
							break;
						default:
							break;
					}
				},
			}
		});
	}
	
	/**
	 * 绑定搜索表单
	 */
	module.bindSearchInputEvent = function(){
		//初始化表单
		layui.use('form', function(){
			layui.form.render();
			$tableSearchInputBox.find("[x-btn-name]").on("click",function(){
				var $this = $(this),
					_val = $this.attr("x-btn-name");
				switch (_val){
					case "button-search":
						_this.initTable();
						break;
					default:
						break;
				}
			});
			
			//绑定回车键
			$tableSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
				if(event.keyCode==13){
					_this.initTable();
				}
			});
		});
	}
	
	/**
	 * 打开编辑或新增页面
	 * @param {Object} action
	 * @param {Object} type
	 * @param {Object} id
	 */
	module.openLayerEditPage = function(action,id){
		let _url = getModuleURL("module.system.manage.config.ts.wuqi.add"),
			_title,_winSize={
				"add" : ['540px', '550px'],
				"select" : ['1000px', '550px'],
				"update" : ['1000px', '550px']
			},
			layui = top.layui;
			
		switch (action){
			case "update":
				_title = "修改";
				break;
			case "select":
				_title = "查看";
				break;	
			default:
				_title = "新增";
				break;
		}
		
		layui.layer.openWin({
			id : "layer-open-gongjiwuqi-add",
            type: 2,
            title: _title,
            isOutAnim : false,
            area: _winSize[action],
            content: _url+"?action="+action+(id?"&id="+id:""),
            btn: (function(){
            	if(action=="select"){
            		return false;
            	}else{
            		return ['保存', '取消'];
            	}
            })(),
            yes: function (index,el) {
            	getModuleWindowPageObjectByURL(_url).FORM.httpSubmitForm({
            		callback : function(){
	            		_xUtilLayuiTable.reload();
	            		
	            		let _moduleMain = getModuleWindowPageObjectByName("system.main");
	            		if(_moduleMain && _moduleMain.ZHTS_GJWQ_HTTP){
	            			_moduleMain.ZHTS_GJWQ_HTTP.init();
	            		}
	            		layui.layer.close(index);
	            	}
            	});
            },
        });
	}
	
	/**
	 * 删除单个数据
	 * @param {Object} id
	 */
	module.httpRemoveTableById = function(id){
		layui.layer.confirm('您确认删除这条数据吗？', {icon: -1, title:'提示'}, function(index){
			var _data = id;
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : getModuleURL("http.system.manage.config.ts.wuqi.delete"),
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						layui.layer.msg("删除成功");
						_xUtilLayuiTable.reload({
							isLastPageIndex : true
						});
					}else{
						layui.layer.msg(data["message"],{time:5000});
					}
				}
			});
		});
	}
	
	/**
	 * 删除多个数据
	 * @param {Object} idArray
	 */
	module.httpRemoveTableMultipleById = function(idArray){
		layui.layer.confirm('您确认删除选中数据吗？', {icon: -1, title:'提示'}, function(index){
			  var _data = idArray;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : getModuleURL("http.system.manage.config.ts.wuqi.delete"),
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layui.layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layui.layer.msg(data["message"],{time:5000});
						}
					}
				});
			
		});
	}
	
	module.init = function(){
		
		$doc = $(".layui-tab-content .layui-tab-item[module-tab-item-name='gongjiwuqi']");
		$win = $("#x-hidden-window");
		$tableSearchInputBox = $doc.find("#ElementTemplateMainDataSearchINPUT");
		$tableSearchData = $doc.find("#layui-table-search-data-GONGJIWUQI");
		$tableTopToolbar = $doc.find("#layui-table-top-toolbar");
		
		let _className = "tableGONGJIWUQI".toUpperCase();
		let _html = template("TemplateTableSearch"+_className,{isRun : true});
		$tableSearchInputBox.empty().html(_html);
		
		this.bindSearchInputEvent();
		layui.use('table', function(){
			_this.initTable();
		});
	}
	
})(jQuery,_pageObject,_pageObject.GONGJIWUQI={});