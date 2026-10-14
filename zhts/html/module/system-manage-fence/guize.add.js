var _FunctionObject = _FunctionObject|| {};
(function($,xUtilBase){
	$(document).ready(documentReady);
	function documentReady(){
		
		var $fromdom = $("#blog-add"),
			_btn = $fromdom.find("#submit"),
			_pageAction = xUtilBase.getUrlParam("action"),
			_pageType = xUtilBase.getUrlParam("type");
		
		_FunctionObject.$fromdom = $fromdom;
		
		$fromdom.get(0).BookSubmit = function(){
			_FunctionObject.httpSubmitPage();
		};
		
		//提交
		_FunctionObject.httpSubmitPage = function(_func){
			var _this = this;
			var _data = {};
			$.extend(true, _data, $fromdom.getElValue());
			
			//_data.blogContent = _FunctionObject.blogEditor.getMarkdown();
			
			_data.action = _pageAction || "add";
			
			var _url = "";
			if(_data.action=="update"){
				_url = GetPROBJECT_PATH()+"/api/fenceRule/updateData";
			}else{
				_url = GetPROBJECT_PATH()+"/api/fenceRule/insertData";
			}
			
			if(_data.share){
				_data.target = {};
				for(var i in _this._targetData){
					var _name = i;
					var _d = _this._targetData[_name];
					if(_d.length>0){
						_data.target[_name] = (function(){
							var _array = [];
							$.each(_d, function(index,el) {
								//如果有value证明是对象，否则为数字ID
								if(el.value){
            						_array.push(el.value);
            					}else{
            						_array.push(el);
            					}
							});
							return _array;
						})();
					}
				}
			}
			try{
				delete _data["targetName"];
			}catch(e){
				//TODO handle the exception
			}
			
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : _url,
				contentType : "application/json;charset=UTF-8",
				data : _data,
				success : function(result){
					if(result["code"]=="0"){
						if(_pageAction=="update"){
							top.layui.layer.msg("更新成功");
						}else{
							top.layui.layer.msg("添加成功");
						}
						$fromdom.clearElValue("x-out-name");
						if(_func){
							_func();
						}
					}else{
						layer.msg(result["message"]);
					}
				},
				error : function(a,b,c){
					layer.msg(b);
				}
			});
		}
		
		//获取分类Class
		_FunctionObject.GetPageClassListQUYU = function(func){
			xUtilBase.ajax({
				url : GetPROBJECT_PATH()+"/api/fenceRegion/getFenceRegionPagerData",
				type : "post",
				success : function(result){
					if(result["code"]=="0"){
						var _data = result.data;
						var $select = $fromdom.find("[x-input-name='regionId']");
						$select.empty();
						$select.append($("<option value=''>请选择</option>"));
						$.each(_data.rows || [], function(index,el) {
							var $option = $("<option></option>");
							$option.attr("value",el.id).html(el.name);
							$select.append($option);
						});
						$fromdom.layuiFormRender();
						if(func){
							func();
						}
					}else{
						layer.msg(data["message"],{time:5000});
					}
				}
			});
		}

		//获取blog
		_FunctionObject.GetPageById = function(id){
			var _this = this;
			var _data = {
				id : id
			};
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : GetPROBJECT_PATH()+"/api/fenceRule/getFenceRuleById",
				contentType : "application/json;charset=UTF-8",
				type : "post",
				data : _data,
				success : function(data){
					if(data["code"]=="0"){
						if(!data.data){
							layer.msg("数据格式不正确");
							return false;
						}
						var _d = data.data;
						_d.share += "";
						_this._targetData = _d.target;
						
						//计算数量
						var _targetName = "";
	                	for(var i in _this._targetData){
	                		var name;
	                		switch (i){
								case "person":
									name = "人员";
									break;
								case "ship":
									name = "船舶";
									break;
								case "vehicle":
									name = "车辆";
									break;
								default:
									name = "未知";
									break;
							}
	                		if(_this._targetData[i].length>0){
	                			_targetName += name+"["+_this._targetData[i].length+"]";
	                		}
	                	}
	                	_d.targetName = _targetName;
	                	if(_d.share=="true"){
	                		$fromdom.find("[x-input-name='targetName']").attr("disabled","true");
	                	}else{
	                		$fromdom.find("[x-input-name='targetName']").removeAttr("disabled");
	                	}
	                	
						$fromdom.setElValue(_d);
						$fromdom.layuiFormRender();
						
					}else{
						layer.msg(data["message"],{time:5000});
					}
				}
			});
		}
		
		$fromdom.find("[x-btn-name]").on("click",function(){
			var $this = $(this),
                _val = $this.attr("x-btn-name");
            switch (_val) {
                case "ButtonFileDelete":
                	var _data = $fromdom.getElValue();
                	_data.filePath = _data["filePath"];
                	_FunctionObject.RemoveImageById(_data["filePath"]);
                    break;
                case "button-open-layui-colorpicker":
                	_FunctionObject.OpenLayerColorpickerPage();
                    break; 
                case "button-open-layui-date-select":
                	_FunctionObject.OpenLayerDateSelectPage();
                    break; 
                default:
                    break;
            }
		});
		
		//打开颜色选择器
		_FunctionObject.OpenLayerColorpickerPage = function(){
			let _url = getModuleURL("module.layui.colorpicker");
			top.layui.layer.openWin({
				id : "layer-open-colorpicker",
                type: 2,
                title: "颜色选择器",
                area: ['280px', '380px'],
                content: _url,
                success: function(layero, index){
                	var _iframeWindow = getModuleWindowByURL(_url);
                	_iframeWindow._FunctionObject.layuiColorpickerEvent("done",function(color){
                		$fromdom.find("[x-input-name='color']").val(color);
                		top.layui.layer.close(index);
                	});
                	_iframeWindow._FunctionObject.layuiColorpickerEvent("change",function(color){
                		$fromdom.find("[x-input-name='color']").val(color);
                	});
				}
            });
		}
		
		//打开时间选择器
		_FunctionObject.OpenLayerDateSelectPage = function(){
			let _url = getModuleURL("module.layui.datetime");
			top.layui.layer.openWin({
				id : "layer-open-date-select",
                type: 2,
                title: "选择时间",
                area: ['550px', '380px'],
                content: _url+"?time=00:00:00 - 23:59:59",
                success: function(layero, index){
                	var _iframeWindow = getModuleWindowByURL(_url);
                	_iframeWindow._FunctionObject.layuiDateEvent("done",function(value, date, endDate){
                		$fromdom.find("[x-input-name='timeRange']").val(value);
                		top.layui.layer.close(index);
                	});
                	_iframeWindow._FunctionObject.layuiDateEvent("change",function(value, date, endDate){
                		$fromdom.find("[x-input-name='timeRange']").val(value);
                	});
				}
            });
		}
		
		$fromdom.find("[x-input-name='targetName']").on("click",function(){
			_FunctionObject.OpenPageGUIZE();
		});
		
		//打开规则选取
		_FunctionObject.OpenPageGUIZE = function(){
			var _this = this,
				_url = getModuleURL("module.layui.laytransfer");
			top.layui.layer.openWin({
				id : "layer-open-layTransfer",
                type: 2,
                title: "请选择",
                area: ['503px', '520px'],
                content: _url,
                btn: ['确定', '取消'],
                yes: function (index) {
                	var _iframeWindow = getModuleWindowByName("module.layui.layTransfer");
                	_this._targetData = _iframeWindow._FunctionObject.GetTransferData();
                	var _targetName = "";
                	for(var i in _this._targetData){
                		var name;
                		switch (i){
							case "person":
								name = "人员";
								break;
							case "ship":
								name = "船舶";
								break;
							case "vehicle":
								name = "车辆";
								break;
							default:
								name = "未知";
								break;
						}
                		if(_this._targetData[i].length>0){
                			_targetName += name+"["+_this._targetData[i].length+"]";
                		}
                	}
                	$fromdom.setElValue({
                		targetName : _targetName
                	})
                	top.layui.layer.close(index);
                },
                success: function(layero, index){
                	if(_this._targetData){
                		var _NewTargetData = {};
                		for(var i in _this._targetData){
                			var _d = _this._targetData[i];
                			if(_d.length>0){
                				_NewTargetData[i] = (function(){
	                				var _array = [];
	                				$.each(_d, function(index,el) {
	                					if(el.value){
	                						_array.push(el.value);
	                					}else{
	                						_array.push(el);
	                					}
	                				});
	                				return _array;
	                			})();
                			}
                		}
                		
                		function isLoading(){
							var _iframeWindow =getModuleWindowByName("module.layui.layTransfer");
							
                			if(_iframeWindow && _iframeWindow._FunctionObject && _iframeWindow._FunctionObject.isTransferInit){
                				var _data = _iframeWindow._FunctionObject._data;
                				for(var i in _NewTargetData){
                					var _name = i;
                					var _default = {
                						data: _data[_name],
									    value : _NewTargetData[_name]
									};
	                				_iframeWindow.layui.transfer.reload(_name,_default);
                				}
                			}else{
                				setTimeout(function(){
                					isLoading();
                				},500);
                			}
                		}
                		isLoading();
                	}
				}
            });
		}
		
		_FunctionObject.init  = function(){
			var _this = this;
			var form,
				layer = layui.layer;
			
			//通用代码，获取字典
			var _iframeWindow = getModuleWindowByName("system.main");
	    	if(!_iframeWindow){
	    		top.layui.layer.msg("未初始化主窗口");
	    		return;
	    	}
	    	var DICT = _iframeWindow._pageObject.DICT;
	    	
			layui.use('form', function(){
			  	form = layui.form;
			  	$fromdom.layuiFormRender();
				//监听提交
				form.on('submit(formSubmit)', function(data){
					$fromdom.get(0).BookSubmit();
					return false;
				});
				
				form.on('radio(share)', function(data){
					var $input = $fromdom.find("[x-input-name='targetName']");
					if(data.value=="true"){
						$input.attr("disabled","");
					}else{
						$input.removeAttr("disabled");
					}
				}); 
				
				if(_pageAction=="update" || _pageAction=="select"){
		        	DICT.GetGUIZEGUIZELEIXING(function(result){
		        		$fromdom.find("#temp_guizeleixing").setRadio({
		        			name : "type"
		        		},result);
		        		$fromdom.layuiFormRender();
		        		
		        		DICT.GetGUIZEGUIZEQUYU(function(result){
			        		$fromdom.find("#temp_quyuleixing").setRadio({
			        			name : "regionType",
			        			onChange : function(data){
			        				var $select = $fromdom.find("[x-input-name='regionId']");
									$select.empty();
									switch (data.value){
										case "lbs_fence_rules_region_type__xingzheng":
											break;
										case "lbs_fence_rules_region_type__custom_region":
											_this.GetPageClassListQUYU();
											break;
										default:
											break;
									}
									$fromdom.layuiFormRender();
			        			}
			        		},result);
			        		
			        		$fromdom.layuiFormRender();
			        		_FunctionObject.GetPageClassListQUYU(function(){
				        		_FunctionObject.GetPageById(xUtilBase.getUrlParam("id"));
				        	});
			        	});
		        	});
		        }else{
		        	DICT.GetGUIZEGUIZELEIXING(function(result){
		        		if(result){
		        			result[0].checked = true;
		        		}
		        		$fromdom.find("#temp_guizeleixing").setRadio({
		        			name : "type"
		        		},result);
		        		$fromdom.layuiFormRender();
		        		DICT.GetGUIZEGUIZEQUYU(function(result){
		        			if(result){
			        			result[0].checked = true;
			        		}
			        		$fromdom.find("#temp_quyuleixing").setRadio({
			        			name : "regionType",
			        			onChange : function(data){
			        				var $select = $fromdom.find("[x-input-name='regionId']");
									$select.empty();
									switch (data.value){
										case "lbs_fence_rules_region_type__xingzheng":
											break;
										case "lbs_fence_rules_region_type__custom_region":
											_this.GetPageClassListQUYU();
											break;
										default:
											break;
									}
									layui.form.render();
			        			},
			        		},result);
			        		$fromdom.layuiFormRender();
			        		_FunctionObject.GetPageClassListQUYU(function(){
				        		
				        	});
			        	});
		        	});
		        }
			});
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);