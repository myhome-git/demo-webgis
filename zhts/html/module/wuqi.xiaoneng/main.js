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
		parent.FORM.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * FORM
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,
		$doc,$win,$tableSearchInputBox,$tableSearchData,$tableTopToolbar,
		_classLayuiTable = new ClassLayuiTable();
	
	/**
	 * 初始化表格
	 */
	module.initTable = function(){
		let _data = $tableSearchInputBox.getElValue();
		_classLayuiTable.init({
			elem: "#"+$tableSearchData.attr("id"),
			height : $win.outerHeight(),
			page : true,
			toolbar: '#TemplateTableToolbar',
			isLoadScrollbar : false,
			cols: _layuiTableHeader.data["table-0"].header || [],
			data : [],
			parseData:function (result) {
				result.data = result.data || {};
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
							_classLayuiTable.reload();
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
						case "table-websocket":
							(function(){
								let _moduleName = "system.connection";
								let _url = getModuleURL(_moduleName);
								var _default = {
									id: _moduleName.replace(/\./g,"-"),
									type: 2,
									shade: 0.2,
									maxmin: true,
									title: "访问远程资源",
									area: ['1024px', '768px'],
									content: _url,
								}
								top.layui.layer.openWin(_default);
							})();
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
								var _rows = _classLayuiTable._data.rows;
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
					}
				}
			}
		});
	}
	
	module.setTableReload = function(option){
		_classLayuiTable.reload(option);
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
	
	module.init = function(){
		$doc = $("#x-view-content");
		$win = $("#x-hidden-window");
		$tableSearchInputBox = $doc.find("#ElementTemplateMainDataSearchINPUT");
		$tableSearchData = $doc.find("#search-wuqi-xiaoneng-table");
		$tableTopToolbar = $doc.find("#layui-table-top-toolbar");
		
//		let _className = "tableTUCENGPEIZHI".toUpperCase();
//		let _html = template("TemplateTableSearch"+_className,{isRun : true});
//		$tableSearchInputBox.empty().html(_html);
		
		this.bindSearchInputEvent();
		layui.use('table', function(){
			_this.initTable();
		});
			
	}
	
})(jQuery,_pageObject,_pageObject.FORM={});