var _FunctionObject = _FunctionObject || {};
(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		var _xUtilLayuiTable = new xUtilLayuiTable();
		_FunctionObject._xUtilLayuiTable = _xUtilLayuiTable;
		
		_FunctionObject.InitTable = function(){
			
			var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
			
			//判断结束时间是否小于开始时间
			if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
				layui.layer.msg("结束时间不能小于开始时间");
				return false;
			}
			
			//复写方法，浏览器缩放时可以动态设置
			_xUtilLayuiTable.GetTableAutoHeight = function(){
				return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiSearchInputBox.outerHeight() - 45;
			}
			
			//初始化layer表格对象
			_xUtilLayuiTable.SetLayuitable(_FunctionObject.layuiTable);
			
			_xUtilLayuiTable.Init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				cellMinWidth: 1,
				height: _xUtilLayuiTable.GetTableAutoHeight(),
				page : true,
				limit:20,
				cols: _layuiTableHeader.data["table"].header || [],
				url: "/model_3d/model/pageList",
				method : "post",
				parseData:function (result) {
					result.data = result.data || {};
					
//					var _newList = [];
//					
//					$.each(result.data.rows,function(index,el){
//						
//						var _model = el.model,
//						
//							_scene = el.scene,
//							
//							_newObject = {};
//						
//						for(var i in _model){
//							_newObject[i] = _model[i];
//						}
//						
//						for(var i in _scene){
//							_newObject["__scene_"+i] = _scene[i];
//						}
//						
//						_newList.push(_newObject);
//						
//					});
					
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
				onRowClick : function(obj){
					
				},
				onRowTool : function(obj){
					var data = obj.data,
						layEvent = obj.event;
					if(layEvent === 'delete') {
						
						var _option = {
							
							identifiers : [data.identifier],
							
							dmts : (function(){
								
								var _array = [];
								
								var _dmt;
								
								try{
									_dmt = JSON.parse(data.dmt);
									
								}catch(e){
									
									//TODO handle the exception
								}
								
								if(!_dmt){
									
									_dmt = [];
									
								}
								
								$.each(_dmt, function(index,el) {
									
									_array.push(el.identifier);
									
								});
								
								return _array;
								
							})()
							
						};
						
						_FunctionObject.RemoveTableById(_option);
					}else if(layEvent === 'update'){
						_FunctionObject.OpenLayerEditPage("update",data.id);
					}
				},
				onSelected : function(selectedArray,obj){
					console.info(selectedArray,obj);
				}
			});
		}
		
		//绑定表格工具栏
		_FunctionObject.$layuiTableTopToolbar.find("[x-btn-name]").on("click",function(){
			var $this = $(this),
				_val = $this.attr("x-btn-name");
			switch (_val){
				case "personnel-add":
					_FunctionObject.OpenLayerEditPage('add');
					break;
				case "table-refresh":
					_xUtilLayuiTable.reload();
					break;
				case "personnel-delete-multiple":
				
					var _data = _xUtilLayuiTable.layuitable.checkStatus("layui-table-search-data");
					
					var _option = {
							
						identifiers : [],
						
						dmts : []
						
					};

					$.each(_data.data, function(index,el) {
						
						_option.identifiers.push(el.identifier);
						
						var _dmt;
							
						try{
							_dmt = JSON.parse(el.dmt);
							
						}catch(e){
							
							//TODO handle the exception
						}
						
						if(_dmt){
							
							$.each(_dmt, function(index,el) {
								
								_option.dmts.push(el.identifier);
								
							});
							
						}
						
					});
					
					_FunctionObject.RemoveTableMultipleById(_option);
					
					break;	
					
				default:
					break;
			}
		});
		
		//打开编辑或新增页面
		_FunctionObject.OpenLayerEditPage = function(_action,_id){
			var _title = _action == "update" ? "更新" : "新增";
			layui.layer.open({
				id : "layer-open-model",
                type: 2,
                anim : -1,
                title: "<i class='iconfont fa fa-cube' style='margin-right:3px'></i>"+_title,
                shade : 0.2,
                area: ['700px', '580px'],
                shadeClose: false,
                isOutAnim : false,
                content: "model.add.html?action="+_action+(_id?"&id="+_id:""),
                btn: ['保存', '取消'],
                yes: function (index) {
                	
                	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/model-manage/model.add.html");
                	
                	_iframeWindow._FunctionObject.httpSubmitPage(function(){
                		_FunctionObject._xUtilLayuiTable.reload();
                		layui.layer.close(index);
                	});
                	
                },
                cancel: function(index, layero){
					$("#deptLayer").css({"display":"none"});
				}, 
				end : function(index, layero){
                	$("#deptLayer").css({"display":"none"});
                },
                success: function(layero, index){
				   
				}
            });
		}
		
		//删除单个数据
		_FunctionObject.RemoveTableById = function(id){
			layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
				var _data = id;
				_data = JSON.stringify(_data);
				xUtilBase.ajax({
					url : "/model_3d/model/delete",
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
		_FunctionObject.RemoveTableMultipleById = function(id){
			layer.confirm('您确认删除选中数据吗？', {icon: 3, title:'提示'}, function(index){
				  var _data = id;
					_data = JSON.stringify(_data);
					xUtilBase.ajax({
						url : "/model_3d/model/delete",
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
				layui.form.render();
				_FunctionObject.$layuiSearchInputBox.find("[x-btn-name='button-search']").on("click",function(){
					_FunctionObject.InitTable();
				});
				//绑定回车键
				_this.$layuiSearchInputBox.find("[x-out-name='searchText']").on("keyup",function(event){
					if(event.keyCode==13){
						_this.InitTable();
					}
				});
			});
			layui.use('laydate', function(){
				
				_FunctionObject.layerDate = layui.laydate;
				
				//获取搜索表单对象
				var _data = _FunctionObject.$layuiSearchInputBox.getElValue();
				
				//定义时间格式，如果是航班数据，则显示时分秒
				var _dateFormat,
					_startTime,
					_endTime;
				
				_dateFormat = "yyyy-mm-dd";
				_startTime = xUtilBase.classDate.responseDate(new Date(),_dateFormat);
				_endTime = xUtilBase.classDate.responseDate(new Date(),_dateFormat);
				
				//定义开始时间插件
				var _default = {
					elem: '#layui-date-start',
//					value: _startTime,
//					isInitValue: true
				};
				if(_dateFormat=="yyyy-mm-dd hh:mm:ss"){
					$.extend(true, _default, {type:'datetime'});
				}
				_FunctionObject.layuiDate.render(_default);
				
				//定义结束时间插件
				_default = {
					elem: '#layui-date-end',
//					value: _endTime,
//					isInitValue: true
				};
				if(_dateFormat=="yyyy-mm-dd hh:mm:ss"){
					$.extend(true, _default, {type:'datetime'});
				}
				_FunctionObject.layuiDate.render(_default);
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			layui.use('laydate', function(){
				_FunctionObject.layuiDate = layui.laydate;
			});
			
			var _className = "table".toUpperCase();
			var _html = template("TemplateTableSearch"+_className,{isRun : true});
			_FunctionObject.$layuiSearchInputBox.empty().html(_html);
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.layuiTable = layui.table;
				_FunctionObject.InitTable();
			});
			
		}
		
		_FunctionObject.init();
	}
})(jQuery);