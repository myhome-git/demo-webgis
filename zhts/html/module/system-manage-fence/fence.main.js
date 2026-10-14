var _FunctionObject = _FunctionObject || {};
var _pageObject = _FunctionObject;
var _iframeMain;
//告警设置
(function($,_FunctionObject) {
	
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='gaojingshezhi']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-QUYUGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		let $doc;
		let module = {};
		/**
		 * 提交表单数据
		 */
		module.httpSubmitForm = function(option){
			
			let _data = {},
				_url="/data-server/api/warningtype/update",
				layui = top.layui;
				
			$.extend(true, _data, $doc.getFormValue());
			let _newDate = _data;
			$.each(_data.tixingfangshi, function(index,el) {
				_newDate[el] = true;
			});
			
			let _sendData = JSON.stringify(_newDate);
			xUtilBase.ajax({
				url : _url,
				data : _sendData,
				success : function(result){
					if(result["code"]=="0"){
						layui.layer.msg("保存成功");
						
						let _module = getModuleWindowPageObjectByName("system.main");
						if(_module){
							let _ZHTS_SSTS_MESSAGE_HTTP = _module.ZHTS_SSTS_MESSAGE_HTTP;
							_ZHTS_SSTS_MESSAGE_HTTP.init({
								callback : function(result0){
									_module.ZHTS_SSTS_MESSAGE.setFilterData(result0);
								}
							});
						}
						
						if(option && option.callback){
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
		
		/**
		 * 根据id获取数据
		 * @param {Object} id
		 */
		module.httpGetDataAll = function(){
			xUtilBase.ajax({
				url : "/data-server/api/warningtype/queryAll",
				success : function(result){
					if(result["code"]=="0"){
						if(!result.data){
							layui.layer.msg("数据格式不正确");
							return false;
						}
						let _d = result.data[0];
						
						let _array = [];
						if(_d.flag){
							_array.push("flag");
						}
						if(_d.message){
							_array.push("message");
						}
						if(_d.pause){
							_array.push("pause");
						}
						let _data = {
							tixingfangshi : _array
						};
						$.extend(true, _d, _data);
						$doc.setElValue(_d);
						$doc.layuiFormRender();
					}else{
						layui.layer.msg(result["message"],{time:5000});
					}
				}
			});
		}
		
		module.bindEvent = function(){
			layui.form.on("checkbox(tixingfangshi)",function(data){
				module.httpSubmitForm();
				top.PAGEOBJECT.ZHTS_SSTS_MESSAGE_HTTP.init({
					callback : function(result){
						top.PAGEOBJECT.ZHTS_SSTS_MESSAGE.setFilterData(result);
					}
				});
			});
		}
		
		_FunctionObject.init = function(){
			$doc = _FunctionObject.$body;
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			layui.use(['table','form'], function(){
				layui.form.render();
				module.httpGetDataAll();
				module.bindEvent();
			});
		}
		
	}
})(jQuery,_FunctionObject.GAOJINGSHEZHI = {});
//区域管理
(function($,_FunctionObject) {
	
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='quyuguanli']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-QUYUGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		
		//复写方法，浏览器缩放时可以动态设置
		_xUtilLayuiTable.GetTableAutoHeight = function(){
			return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiTableSearchData.offset().top - 10;
		}
		
		_FunctionObject.InitTable = function(){
			
			var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
			
			//判断结束时间是否小于开始时间
			if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
				layui.layer.msg("结束时间不能小于开始时间");
				return false;
			}
			
			_xUtilLayuiTable.init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				cellMinWidth: 1,
				height: _xUtilLayuiTable.GetTableAutoHeight(),	//采用美化版滚动条，不再layui内部进行滚动条
				page : true,
				toolbar : "#TemplateTableToolbar",
				isLoadScrollbar : true,
				cols: _layuiTableHeader.data["tableQUYUGUANLI"].header || [],
				url: GetPROBJECT_PATH()+"/api/fenceRegion/getFenceRegionPagerData",
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
					var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
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
							_FunctionObject.RemoveTableById([data.id]);
						}else if(layEvent === 'update'){
							_FunctionObject.openLayerEditPage("update",data.areaType,data.id);
						}else if(layEvent === 'select'){
							//先关闭由edit弹出的层
							layui.layer.close(_FunctionObject.__layerOpenIndex);
							_FunctionObject.httpGetPageById(data.id);
						}
					},
					onToolbar : function(layEvent,checkStatus){
						switch (layEvent){
							case "table-refresh":
								_xUtilLayuiTable.reload();
								break;
							case "table-delete-multiple":
								let _ids = [];
								$.each(checkStatus.data, function(index,el) {
									_ids.push(el.id);
								});
								if(_ids.length<1){
									layui.layer.msg("未选中任何数据");
									return;
								}
								_FunctionObject.httpRemoveTableMultipleById(_ids);
								break;	
							default:
								break;
						}
					},
				}
			});
		}
		
		//获取单个数据，用来反显地图元素
		_FunctionObject.httpGetPageById = function(id){
			let _this = this;
			let _data = {
				id : id
			};
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : GetPROBJECT_PATH()+"/api/fenceRegion/getFenceRegionById",
				contentType : "application/json;charset=UTF-8",
				type : "post",
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						if(!data.data){
							layui.layer.msg("数据格式不正确");
							return false;
						}
						var _d = data.data;
						
						//反显图形
						let _module = _iframeMain.FENCE_DRAW;
						var _quyu = _this;
						_module.clearLayer()
							.clearInteractionActive();
						
						if(_d.areaType=="1"){
							_module.setDrawCircle({
								_wktString : _d.area,
								centerX : _d.centerX,
								centerY : _d.centerY,
								radius : _d.radius
							});
						}else if(_d.areaType=="2"){
							
						}else if(_d.areaType=="3"){
							_module.setDrawPolygon({
								_wktString : _d.area
							});
						}
						
						_module.setFeatureColor(_d.color);
					}else{
						layui.layer.msg(data["message"],{time:5000});
					}
				}
			});
		}
		
		//打开编辑或新增页面
		_FunctionObject.openLayerEditPage = function(_action,_type,_id){
			layui.layer.close(this.__layerOpenIndex);
			
			function clearMapDraw(){
				try{
        			let _module = _iframeMain.FENCE_DRAW;
            		//清除本次绘制
            		_module.clearInteractionActive()
            			.clearLayer();
            	}catch(e){
            		//TODO handle the exception
            	}
			}
			
			var _this=this,_title;
			switch (_action){
				case "update":
					_title = "更新区域";
					break;
				case "select":
					_title = "查看区域";
					break;	
				default:
					_title = "新增区域";
					break;
			}
			let _url = getModuleURL("module.fence.quyu.add");
			layui.layer.openWin({
				id : "layer-open-quyu-add",
                type: 2,
                title: _title,
                shade : false,
                offset : "l",
                isOutAnim : false, 
                area: ['385px', '450px'],
                content: _url+"?action="+_action+(_type?"&type="+_type:"")+(_id?"&id="+_id:""),
                btn: (function(){
                	if(_action=="select"){
                		return false;
                	}else{
                		return ['保存', '取消'];
                	}
                })(),
                yes: function (index) {
                	let _win = getModuleWindowByURL(_url);
                	_win._FunctionObject.httpSubmitPage(function(){
                		clearMapDraw();
                		_xUtilLayuiTable.reload();
                		layui.layer.close(index);
                	});
                },
                end : function(){
                	clearMapDraw();
                },
                success: function(layero, index){
                	_this.__layerOpenIndex = index;
				}
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = id;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : GetPROBJECT_PATH()+"/api/fenceRegion/deleteData",
					contentType : "application/json;charset=UTF-8",
					type : "post",
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
			});
		}
		
		//删除多个数据
		_FunctionObject.httpRemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				  var _data = id;
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : GetPROBJECT_PATH()+"/api/fenceRegion/deleteData",
						type : "post",
						contentType : "application/json;charset=UTF-8",
						data : _data,
						success : function(data){
							if(data["code"]=="0"){
								layer.msg("删除成功");
								_xUtilLayuiTable.reload({
									isLastPageIndex : true
								});
							}else{
								layer.msg(data["message"],{time:5000});
							}
						}
					});
				
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			//初始化表单
			layui.use('form', function(){
				_FunctionObject.layuiForm.render();
				_FunctionObject.$layuiSearchInputBox.find("[x-btn-name]").on("click",function(){
					var $this = $(this),
						_val = $this.attr("x-btn-name");
					switch (_val){
						case "button-search":
							_this.InitTable();
							break;
						case "button-clear":
							let _module = _iframeMain.FENCE_DRAW;
							
							if(_module.getSelectFeatures().length>0){
								_module.clearSelectFeatures();
							}
							
							if(_module.getFeatures().length<1){
								_module.clearLayer();
								_module.clearInteractionActive();
							}
							
							break;
						case "button-add-circle":
							layui.layer.close(_FunctionObject.__layerOpenIndex);
							function eventCallback(){
								_this.openLayerEditPage("add","Circle");
							}
							_iframeMain.FENCE_DRAW.clearLayer()
								.setCallback("draw.Circle.drawend",eventCallback)
								.changeInteractionActive(["select","draw.Circle"]);
							break;
						case "button-add-polygon":
							layui.layer.close(_FunctionObject.__layerOpenIndex);
							function eventCallback(){
								_this.openLayerEditPage("add","Polygon");
							}
							_iframeMain.FENCE_DRAW.clearLayer()
								.setCallback("draw.Polygon.drawend",eventCallback)
								.changeInteractionActive(["select","draw.Polygon"]);
							break;
						case "button-add-polygon-hole":
							_iframeMain.FENCE_DRAW.changeInteractionActive(["select","draw.PolygonHole"]);
							break;	
						default:
							break;
					}
				});
				
				//绑定回车键
				_this.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
					if(event.keyCode==13){
						_this.InitTable();
					}
				});
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			var _className = "tableQUYUGUANLI".toUpperCase();
			var _html = template("TemplateTableSearch"+_className,{isRun : true});
			_FunctionObject.$layuiSearchInputBox.empty().html(_html);
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.InitTable(layui.table);
			});
		}
		
	}
})(jQuery,_FunctionObject.QUYUGUANLI = {});



//规则管理
(function($,_FunctionObject) {
	
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='guizeguanli']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-GUIZEGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		
		_FunctionObject.InitTable = function(){
			
			var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
			
			//判断结束时间是否小于开始时间
			if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
				layui.layer.msg("结束时间不能小于开始时间");
				return false;
			}
			
			//复写方法，浏览器缩放时可以动态设置
			_xUtilLayuiTable.GetTableAutoHeight = function(){
				return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiTableSearchData.offset().top - 10;
			}
			
			_xUtilLayuiTable.init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				cellMinWidth: 1,
				height: _xUtilLayuiTable.GetTableAutoHeight(),
				page : true,
				toolbar : "#TemplateTableToolbar1",
				isLoadScrollbar : true,
				cols: _layuiTableHeader.data["tableGUIZEGUANLI"].header || [],
				url: GetPROBJECT_PATH()+"/api/fenceRule/getFenceRulePagerData",
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
					var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
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
					onRowTool : function(obj){
						var data = obj.data,
							layEvent = obj.event;
						if(layEvent === 'delete') {
							_FunctionObject.RemoveTableById([data.id]);
						}else if(layEvent === 'update'){
							_FunctionObject.openLayerEditPage("update",data.id);
						}else if(layEvent === 'select'){
							_FunctionObject.openLayerEditPage("select",data.id);
						}
					},
					onToolbar : function(layEvent,checkStatus){
						switch (layEvent){
							case "table-refresh":
								_xUtilLayuiTable.reload();
								break;
							case "table-add":
								_FunctionObject.openLayerEditPage('add');
								break;
							case "table-delete-multiple":
								let _ids = [];
								$.each(checkStatus.data, function(index,el) {
									_ids.push(el.id);
								});
								if(_ids.length<1){
									layui.layer.msg("未选中任何数据");
									return;
								}
								_FunctionObject.httpRemoveTableMultipleById(_ids);
								break;	
							default:
								break;
						}
					},
					on : {
						"switch(enableSwitch)" : function(obj){
//							console.info(this,obj);
							var $this = $(obj.elem),
								_id = $this.attr("x-bind-id"),
								_data = (function(){
									var _rows = _xUtilLayuiTable._data.rows;
									for(var i=0;i<_rows.length;i++){
										if(_rows[i].id.toString()===_id){
											return _rows[i];
										}
									}
								})(_id);
							if(!_data){
								top.layui.layer.msg("未找到有效数据");
								return;
							}
							
							_data.enable = obj.elem.checked;
							
							_pageObject.QUYUGUANLI.httpGetPageById(_data.regionId);
									
							_tempData = JSON.stringify(_data);
							xUtilBase.ajax({
								url : GetPROBJECT_PATH()+"/api/fenceRule/updateData",
								contentType : "application/json;charset=UTF-8",
								data : _tempData,
								success : function(result){
									if(result["code"]=="0"){
										if(_data.enable){
											top.layui.layer.msg("启用成功");
										}else{
											top.layui.layer.msg("禁用成功");
										}
									}else{
										top.layui.layer.msg(result["message"]);
									}
								},
								error : function(a,b,c){
									top.layui.layer.msg(b);
								}
							});
						}
					}
				}
			});
		}
		
		//打开编辑或新增页面
		_FunctionObject.openLayerEditPage = function(_action,_id){
			let _layui = top.layui,_title,
				_url=getModuleURL("module.fence.guize.add");
			switch (_action){
				case "update":
					_title = "更新规则";
					break;
				case "select":
					_title = "查看规则";
					break;	
				default:
					_title = "新增规则";
					break;
			}
			_layui.layer.openWin({
				id : "layer-open-guize-add",
                type: 2,
                title: _title,
                area: ['500px', '520px'],
                content: _url+"?action="+_action+(_id?"&id="+_id:""),
                btn: (function(){
                	if(_action=="select"){
                		return false;
                	}else{
                		return ['保存', '取消'];
                	}
                })(),
                yes: function (index) {
                	var _iframeWindow = getModuleWindowByURL(_url);
                	_iframeWindow._FunctionObject.httpSubmitPage(function(){
                		_xUtilLayuiTable.reload();
                		top.layui.layer.close(index);
                	});
                }
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = id;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : GetPROBJECT_PATH()+"/api/fenceRule/deleteData",
					contentType : "application/json;charset=UTF-8",
					type : "post",
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
			});
		}
		
		//删除多个数据
		_FunctionObject.httpRemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				  var _data = id;
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : GetPROBJECT_PATH()+"/api/fenceRule/deleteData",
						type : "post",
						contentType : "application/json;charset=UTF-8",
						data : _data,
						success : function(data){
							if(data["code"]=="0"){
								layer.msg("删除成功");
								_xUtilLayuiTable.reload({
									isLastPageIndex : true
								});
							}else{
								layer.msg(data["message"],{time:5000});
							}
						}
					});
				
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			//初始化表单
			layui.use('form', function(){
				_FunctionObject.layuiForm.render();
				_FunctionObject.$layuiSearchInputBox.find("[x-btn-name]").on("click",function(){
					var $this = $(this),
						_val = $this.attr("x-btn-name");
					switch (_val){
						case "button-search":
							_this.InitTable();
							break;
						case "button-guize-all":
							$this.siblings().removeClass("action");
							$this.addClass("action");
							_FunctionObject.$layuiSearchInputBox.setElValue({"type":$this.attr("x-out-text")});
							_this.InitTable();
							break;
						case "button-guize-input":
							$this.siblings().removeClass("action");
							$this.addClass("action");
							_FunctionObject.$layuiSearchInputBox.setElValue({"type":$this.attr("x-out-text")});
							_this.InitTable();
							break;
						case "button-guize-out":
							$this.siblings().removeClass("action");
							$this.addClass("action");
							_FunctionObject.$layuiSearchInputBox.setElValue({"type":$this.attr("x-out-text")});
							_this.InitTable();
							break;
						default:
							break;
					}
				});
				
				//绑定回车键
				_FunctionObject.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
					if(event.keyCode==13){
						_this.InitTable();
					}
				});
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			var _className = "tableGUIZEGUANLI".toUpperCase();
			var _html = template("TemplateTableSearch"+_className,{isRun : true});
			_FunctionObject.$layuiSearchInputBox.empty().html(_html);
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.layuiTable = layui.table;
				_FunctionObject.InitTable(layui.table);
			});
			
		}
	}
})(jQuery,_FunctionObject.GUIZEGUANLI = {});



//消息管理
(function($,_FunctionObject) {
	
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='xiaoxiguanli']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-XIAOXIGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		
		_FunctionObject.InitTable = function(_layuiTable){
			
			var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
			
			//判断结束时间是否小于开始时间
			if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
				layui.layer.msg("结束时间不能小于开始时间");
				return false;
			}
			
			//复写方法，浏览器缩放时可以动态设置
			_xUtilLayuiTable.GetTableAutoHeight = function(){
				return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiTableSearchData.offset().top - 10;
			}
			
			_xUtilLayuiTable.init({
				layuiTable : _layuiTable,
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				cellMinWidth: 1,
				height: _xUtilLayuiTable.GetTableAutoHeight(),
				page : true,
				toolbar : "#TemplateTableToolbar2",
				isLoadScrollbar : true,
				cols: _layuiTableHeader.data["tableXIAOXIGUANLI"].header || [],
				url: GetPROBJECT_PATH()+"/api/fenceMsg/getFenceMsgPagerData",
				method : "post",
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
					var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
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
					onRowTool : function(obj){
						var data = obj.data,
							layEvent = obj.event;
						if(layEvent === 'delete') {
							_FunctionObject.RemoveTableById([data.id]);
						}else if(layEvent === 'select'){
							_FunctionObject.openLayerEditPage("select",data);
						}
					},
					onToolbar : function(layEvent,checkStatus){
						switch (layEvent){
							case "table-refresh":
								_xUtilLayuiTable.reload();
								break;
							default:
								break;
						}
					},
				},
			});
		}
		
		//打开编辑或新增页面
		_FunctionObject.openLayerEditPage = function(_action,_data){
			var _title;
			switch (_action){
				case "select":
					_title = "查看消息";
					break;	
				default:
					_title = "error";
					break;
			}
			var _this = this;
			
			var _html = template("TemplateModuleXIAOXICHAKAN",{data:_data});
			layui.layer.openWin({
				id : "layer-open-xiaoxi-add",
                type: 1,
                title: _title,
                area: ['80%', '310px'],
//                shadeClose: false,
                content: _html,
                btn: (function(){
                	if(_action=="select"){
                		return false;
                	}else{
                		return ['保存', '取消'];
                	}
                })(),
                yes: function (index) {
                	
                },
                cancel: function(index, layero){
					
				}, 
				end : function(index, layero){
					
                },
                success: function(layero, index){
                	if(!_data.alreadyRead){
                		_this.httpSetFenceMessageHaveRead(_data.id);
                	}
//              	layero.find(".layui-layer-content").css({""});
				}
            });
		}
		
		//设置消息为已读
		_FunctionObject.httpSetFenceMessageHaveRead = function(id){
			var _data = {
				id : id,
				flag : true
			};
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : GetPROBJECT_PATH()+"/api/fenceMsg/flagHaveRead",
				contentType : "application/json;charset=UTF-8",
				type : "post",
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						
					}else{
						layer.msg(data["message"],{time:5000});
					}
				}
			});
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = id;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : GetPROBJECT_PATH()+"/api/fenceMsg/delete",
					contentType : "application/json;charset=UTF-8",
					type : "post",
					data : _data,
					success : function(data){
						if(data["code"]=="0"){
							layer.msg("删除成功");
							_xUtilLayuiTable.reload({
								isLastPageIndex : true
							});
						}else{
							layer.msg(data["message"],{time:5000});
						}
					}
				});
			});
		}
		
		//删除多个数据
		_FunctionObject.httpRemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				  var _data = id;
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : GetPROBJECT_PATH()+"/api/fenceMsg/delete",
						type : "post",
						contentType : "application/json;charset=UTF-8",
						data : _data,
						success : function(data){
							if(data["code"]=="0"){
								layer.msg("删除成功");
								_xUtilLayuiTable.reload({
									isLastPageIndex : true
								});
							}else{
								layer.msg(data["message"],{time:5000});
							}
						}
					});
				
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			//初始化表单
			layui.use('form', function(){
				_FunctionObject.layuiForm.render();
				_FunctionObject.$layuiSearchInputBox.find("[x-btn-name]").on("click",function(){
					var $this = $(this),
						_val = $this.attr("x-btn-name");
					switch (_val){
						case "button-search":
							_this.InitTable();
							break;
						default:
							break;
					}
				});
				//绑定回车键
				_FunctionObject.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
					if(event.keyCode==13){
						_this.InitTable();
					}
				});
			
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			var _className = "tableXIAOXIGUANLI".toUpperCase();
			var _html = template("TemplateTableSearch"+_className,{isRun : true});
			_FunctionObject.$layuiSearchInputBox.empty().html(_html);
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.layuiTable = layui.table;
				_FunctionObject.InitTable(layui.table);
			});
			
		}
	}
})(jQuery,_FunctionObject.XIAOXIGUANLI = {});

(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		layui.use('element', function(){
			var element = layui.element;
			element.on('tab(docDemoTabBrief)', function(data){
				let $context = $(data.elem.context);
			    switch ($context.attr("module-tab-title-name")){
			    	case "gaojingshezhi":
			    		_FunctionObject.GAOJINGSHEZHI.init();
			    		break;
			    	case "quyuguanli":
			    		_FunctionObject.QUYUGUANLI.init();
			    		break;
			    	case "guizeguanli":
			    		_FunctionObject.GUIZEGUANLI.init();
			    		break;
			    	case "xiaoxiguanli":
			    		_FunctionObject.XIAOXIGUANLI.init();
			    		break;
			    	default:
			    		break;
			    }
			});
			
			var _id = xUtilBase.getUrlParam("id");
			$(".layui-tab .layui-tab-title >li[module-tab-title-name='"+_id+"']").trigger("click");
		});
		
		_FunctionObject.init = function(){
			_iframeMain = getModuleWindowPageObjectByName("system.main");
			_iframeMain.FENCE_DRAW.init({
				map : _iframeMain.MAP.getMap(),
				ol : top.ol
			});
		}
		
		_FunctionObject.init();
	}
})(jQuery);