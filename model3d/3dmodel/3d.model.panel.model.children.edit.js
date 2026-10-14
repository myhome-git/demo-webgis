/**
 * 面板控制-模型节点信息编辑
 */
function ClassPanelModelChildrenEdit(){
	
	//定义变量
	var _this = this,
	
		$panelMain;
		
	this.__ClassLinkObject = new Object();
	
	
	
	
	//初始化外部类
	this.InitLinkClass = function(_name,_class){
		
		this.__ClassLinkObject[_name] = _class;
		
	}
	
	//获取外部类
	this.GetLinkClass = function(_name){
		
		if(!_name){
			
			return this.__ClassLinkObject;
			
		}
		
		return this.__ClassLinkObject[_name];
		
	}
	
	//打开面板
	this.OpenPanel = function(){
		
		$panelMain.removeClass("panel-hidden");
		
	}
	
	//关闭面板
	this.ClosePanel = function(){
		
		$panelMain.addClass("panel-hidden");
		
		$panelMain.find(".layui-tab-title > li").addClass("panel-hidden");
		
		$panelMain.find(".layui-tab-title > li[x-tab-name='nodeInfo']").removeClass("panel-hidden");
		
//		$panelMain.find(".layui-tab-content > .layui-tab-item:nth-of-type(n+2)").addClass("panel-hidden");
		
	}
	
	//设置默认显示节点信息
	this.ResetTabDefault = function(){
		
		$panelMain.find(".layui-tab-title > li").removeClass("layui-this");
				
		$panelMain.find(".layui-tab-title > li:eq(0)").trigger("click");
		
	}
	
	//节点反显
	this.SetModelNodeInfo = function(_data){
		
		this.ClearModelNodeInfo();
		
		var $form = $panelMain.find("#form-model-children-node-edit");
		
		$form.setElValue(_data);
		
		var _view;
		
		try{
			
			_view = JSON.parse(_data.view);
			
		}catch(e){
			//TODO handle the exception
		}
		
	}
	
	//节点清除
	this.ClearModelNodeInfo = function(){
		
		var $form = $panelMain.find("#form-model-children-node-edit");
		
		$form.clearElValue();
		
	}
	
	//提交服务器-节点信息
	this.httpSaveModelNodeInfo = function(_func){
		
		var $form = $panelMain.find("#form-model-children-node-edit");
		
		var _data = $form.getElValue();
		
		var _classPanelModelChildrenMenu = _classPanelModelChildrenEdit.GetLinkClass("ClassPanelModelChildrenMenu");
		
		//判断是否走删除逻辑
		if(_data.id && !_data.chName){
			
			_this.httpRemoveModelNodeInfo(Number(_data.id),function(){
				
				layui.layer.msg("删除成功");
				
				//将本次对象绑定到节点树上
				var _classPanelModelChildrenList = _this.GetLinkClass("ClassPanelModelChildrenList");
				
				_classPanelModelChildrenList.UpdateTreeNodeInfo(_data);
				
				//反显模型内的节点名称
				var _classModelControl = _classPanelModelChildrenEdit.GetLinkClass("ClassModelControl");
				
				_classModelControl.SetModelNodeLabel(_data.name);
				
			});
			
			return;
			
		}
		
		//增加辅助参数
		var _classModelControl = _this.GetLinkClass("ClassModelControl");
		
		_data.__tempView = {
			
			cameraPosition: _classModelControl.GetModelView()
			
		};
		
		_data.view = JSON.stringify(_data.__tempView);
		
		//使用JSON方式
		var _sendData = JSON.stringify(_data);
		
		//定义提交地址
		var _url;
		
		if(_data.action=="update"){
			
			_url = "/model_3d/model/node/update";
			
		}else{
			
			_url = "/model_3d/model/node/add";
			
		}
		
		xUtilBase.ajax({
			url : _url,
			contentType : "application/json;charset=UTF-8",
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					
					if(_data.action=="add"){
						top.layui.layer.msg("添加成功");
					}else{
						top.layui.layer.msg("更新成功");
					}
					
					//将本次对象绑定到节点树上
					var _classPanelModelChildrenList = _this.GetLinkClass("ClassPanelModelChildrenList");
					
					_classPanelModelChildrenList.UpdateTreeNodeInfo(_data);
					
					//反显模型内的节点名称
					if(_data.chName){
						
						_classModelControl.SetModelNodeLabel(_data.name,_data.chName);
						
					}else{
						
						_classModelControl.SetModelNodeLabel(_data.name);
						
					}
					
					if(_func){
						_func();
					}
					
				}else{
					
					layui.layer.msg(result["msg"]);
					
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//删除节点信息
	this.httpRemoveModelNodeInfo = function(_id,_func){
		
		var _data = {
			
			ids : [_id]
			
		};
		
		//使用JSON方式
		var _sendData = JSON.stringify(_data);
		
		//定义提交地址
		var _url = "/model_3d/model/node/delete";
		
		xUtilBase.ajax({
			url : _url,
			contentType : "application/json;charset=UTF-8",
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(_func){
						_func();
					}
				}
			},
			error : function(a,b,c){
				
			}
		});
		
	}
	
	//标牌反显
	this.SetModelNodeLabelInfo = function(_data){
		
		this.ClearModelNodeLabelInfo();
		
		$panelMain.find(".layui-tab-title > li[x-tab-name='nodeLabel']").removeClass("panel-hidden");
		
		var $form = $panelMain.find("#form-model-children-node-label-edit");
		
		$form.setElValue(_data);
		
		var _view;
		
		try{
			
			_view = JSON.parse(_data.view);
			
		}catch(e){
			//TODO handle the exception
		}
		
		try{
			_data.__image = JSON.parse(_data.image);
		}catch(e){
			//TODO handle the exception
		}
		
		//反显图标
		if(_data.__image){
			
			var $btn = $form.find("#button-model-children-node-label-image");
			
			var _uploadData = {
			
				uploadFiles : (function(){
					
					//模拟成文件
					var _array = [];
						
					$.each(_data.__image, function(index,el) {
						
						_array.push({
							
							id : el.identifier,
							
							name : el.name,
							
							status : 5,
							
							type : el.type,
							
							__httpUploadRetrun : el.identifier
	
						});
						
					});
						
					return _array;
					
				})(),
				
				uploadErrorFiles : []
				
			};
			
			
		
			$btn.next().html("共有["+_uploadData.uploadFiles.length+"]个文件");
		
	    	$btn.html("图标管理");
	    	
	    	$btn.get(0).__cache = _uploadData;
	    	
		}
		
	}
	
	//标牌清除
	this.ClearModelNodeLabelInfo = function(){
		
		var $form = $panelMain.find("#form-model-children-node-label-edit");
		
		$form.clearElValue();
		
		var $btn = $form.find("#button-model-children-node-label-image");
		$btn.get(0).__cache = null;
		$btn.next().html("");
	    $btn.html("配置");
		
	}
	
	//提交服务器-标牌
	this.httpSaveModelNodeLabelInfo = function(_func){
		
		var $nodeForm = $panelMain.find("#form-model-children-node-edit");
		
		var _nodeValue = $nodeForm.getElValue();
		
		var $form = $panelMain.find("#form-model-children-node-label-edit");
		
		var _data = $form.getElValue();
		
		_data.modelNodeIdentifier = _nodeValue.identifier;
		
		_data.view = (function(){
			
			return "";
			
		})();
		
		//开始解析文件
		var $btn = $("#button-model-children-node-label-image"),
		
			_cache = $btn.get(0).__cache,
			
			_fileJSON = formatUploadFileToJSON(_cache);
		
		_data.image = _fileJSON.dmtArrayString;
		
		if(_data.action=="add"){
			
			delete _data.id;
			
		}
		
		_data = {
			
			action : _data.action,
			
			lable : _data,
			
			useDmt : _fileJSON.useDmt,
			
			oldDmt : _fileJSON.oldDmt
			
		};
		
		//使用JSON方式
		var _sendData = JSON.stringify(_data);
		
		//定义提交地址
		var _url;
		
		if(_data.action=="update"){
			
			_url = "/model_3d/model/node/lable/update";
			
		}else{
			
			_url = "/model_3d/model/node/lable/add";
			
		}
		
		xUtilBase.ajax({
			url : _url,
			contentType : "application/json;charset=UTF-8",
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					
					if(_data.action=="add"){
						top.layui.layer.msg("添加成功");
					}else{
						top.layui.layer.msg("更新成功");
					}
					
					if(_func){
						_func();
					}
				}else{
					layui.layer.msg(result["msg"]);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//动画反显
	this.SetModelNodeAnimateInfo = function(_data){
		
		this.ClearModelNodeAnimateInfo();
		
		$panelMain.find(".layui-tab-title > li[x-tab-name='nodeAnimate']").removeClass("panel-hidden");
		
		var $form = $panelMain.find("#form-model-children-node-animate-edit");
		
		var _newData = $.extend(true, {}, _data);
		
		var _view;
		
		try{
			
			_view = JSON.parse(_data.view);
			
			_newData.startTime = _view.startTime;
			
			_newData.endTime = _view.endTime;
			
		}catch(e){
			//TODO handle the exception
		}
		
		$form.setElValue(_newData);
		
	}
	
	//动画清除
	this.ClearModelNodeAnimateInfo = function(){
		
		var $form = $panelMain.find("#form-model-children-node-animate-edit");
		
		$form.clearElValue();
		
	}
	
	//提交服务器-标牌
	this.httpSaveModelNodeAnimateInfo = function(_func){
		
		var $form = $panelMain.find("#form-model-children-node-animate-edit");
		
		var _data = $form.getElValue();
		
		_data.view = (function(){
			
			var _view = {
				
				startTime : _data["startTime"],
				
				endTime : _data["endTime"],
				
			};
			
			delete _data["startTime"];
			delete _data["endTime"];
			
			return JSON.stringify(_view);
			
		})();
		
		if(_data.action=="add"){
			
			delete _data.id;
			
		}
		
		//使用JSON方式
		var _sendData = JSON.stringify(_data);
		
		//定义提交地址
		var _url;
		
		if(_data.action=="update"){
			
			_url = "/model_3d/model/node/animate/update";
			
		}else{
			
			_url = "/model_3d/model/node/animate/add";
			
		}
		
		xUtilBase.ajax({
			url : _url,
			contentType : "application/json;charset=UTF-8",
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					
					if(_data.action=="add"){
						top.layui.layer.msg("添加成功");
					}else{
						top.layui.layer.msg("更新成功");
					}
					
					if(_func){
						_func();
					}
				}else{
					layui.layer.msg(result["msg"]);
				}
			},
			error : function(a,b,c){
				layui.layer.msg(b);
			}
		});
		
	}
	
	//类初始化
	this.Init = function(){
		
		function isLoad(){
			
			if(!$panelMain){
				
				$panelMain = $("#x-view-model-children-edit-panel");
				
				setTimeout(function(){
					
					isLoad();
					
				},100);
				
			}else{
				
				var $btn = $panelMain.find(".x-panel-title .btn-close");
			
				if($btn && $btn.length>0){
					
					//绑定关闭按钮
					$btn.unbind().on("click",function(){
						
						_this.ClosePanel();
						
					});
					
					//保存节点信息
					$panelMain.find("[x-button-name]").unbind().on("click",function(){
			
						var $this = $(this),
			
							_val = $this.attr("x-button-name");
							
							
						var _classModelControl = _classPanelModelChildrenEdit.GetLinkClass("ClassModelControl");
						
						switch (_val){
							
							case "httpSaveModelNodeInfo":
							
								_this.httpSaveModelNodeInfo(function(){
									
									var _classPanelModelChildrenMenu = _classPanelModelChildrenEdit.GetLinkClass("ClassPanelModelChildrenMenu");
									
									_classPanelModelChildrenMenu.LoadModelNodeEditPanel();
									
								});
								
								break;
								
							case "showModelNodeLabelInfo":
							
								var $nodeForm = $panelMain.find("#form-model-children-node-edit"),
		
									_nodeValue = $nodeForm.getElValue(),
								
									$form = $panelMain.find("#form-model-children-node-label-edit"),
		
									_data = $form.getElValue();
									
								var _html = template("TemplatePanelModelNodeLabel",{
									
									title : _data.name,
									
									content : _data.describe
									
								});
									
								_classModelControl.SetModelNodeLabel(_nodeValue.name,$(_html).get(0),true);
								
								break;	
								
							case "httpSaveModelNodeLabelInfo":
							
								_this.httpSaveModelNodeLabelInfo();
								
								break;
							
							case "showModelNodeAnimateInfo":
							
								var $nodeForm = $panelMain.find("#form-model-children-node-edit"),
		
									_nodeValue = $nodeForm.getElValue(),
								
									$form = $panelMain.find("#form-model-children-node-animate-edit"),
		
									_data = $form.getElValue();
								
								var _node = _classModelControl.GetModelNodeByName(_nodeValue.name);
								
								if(_node){
									
									_classModelControl.PlayModelNodeAction(_node,1,Number(_data.startTime),Number(_data.endTime),true);
									
								}
								
								break;	
								
							case "httpSaveModelNodeAnimateInfo":
					
								_this.httpSaveModelNodeAnimateInfo();
								
								break;	
								
							default:
								break;
						}
					
					});
					
					
					//弹出多媒体窗口
					$("#form-model-children-node-label-edit").find("#button-model-children-node-label-image").on("click",function(){
				        		
			    		var _this = this,
			    		
			    			$this = $(this);
			    		
			    		var _classFileUpdateControlMain = new ClassFileUpdateControlMain();
			    		
			    		_classFileUpdateControlMain.SetUplaodType("image");
			        		
			        	_classFileUpdateControlMain.SetUplaodSize("100kb");
			        	
//			        	_classFileUpdateControlMain.SetUploadFileMultiSelection(false);
			    		
			    		var _default = {
							id : "layer-open-update",
				            type: 2,
				            anim : -1,
				            title: "图片上传",
				            shade : 0.2,
				            area: ['694px', '500px'],
				            shadeClose: false,
				            isOutAnim : false,
				            content: _classFileUpdateControlMain.GetLoadURL(),
				            btn: ['确定', '取消'],
				            yes: function (index) {
				            	
				            	var _iframeUpload = xUtilBase.GetIframeContentWindowById(_classFileUpdateControlMain.GetWindowURL());
						    	if(!_iframeUpload){
						    		top.layui.layer.msg("未初始化上传窗口");
						    		return;
						    	}
						    	
						    	var _data = _iframeUpload._classFileUpdateControl.GetLinkInterfaceUploadSuccessData();
						    	
						    	if(_data.uploadFiles.length<1){
						    		
						    		top.layui.layer.msg("窗口中没有文件");
						    		
						    		return;
						    		
						    	}
						    	
						    	if(_data.uploadErrorFiles.length>0){
						    		
						    		top.layui.layer.msg("窗口中有待处理的文件");
						    		
						    		return;
						    		
						    	}
						    	
						    	$this.next().html("共有["+_data.uploadFiles.length+"]个文件");
						    	
						    	$this.html("图标管理");
						    	
						    	_this.__cache = _data;
						    	
						    	top.layui.layer.close(_this.__openPanelIndex);
				            	
				            },
				            cancel: function(index, layero){
								
							}, 
							end : function(index, layero){
				            	
				            },
				            success: function(layero, index){
							   
								_this.__openPanelIndex = index;
							   
							   //如果有缓存则反显
								if(_this.__cache){
				        			
				        			var _iframeUpload = xUtilBase.GetIframeContentWindowById(_classFileUpdateControlMain.GetWindowURL());
				        			
							    	if(!_iframeUpload){
							    		
							    		top.layui.layer.msg("未初始化上传窗口");
							    		
							    		return;
							    		
							    	}
							    	
							    	var _data = _this.__cache;
							    	
							    	var _classFileUpdateControl = _iframeUpload._classFileUpdateControl;
				        			
				        			$.each(_data.uploadFiles, function(index,el) {
				        				
				        				el.httpURL = "/model_3d/dmt/getStreamByIdentifier?identifier="+el.__httpUploadRetrun;
				        				
				        				_classFileUpdateControl.AddUploadFile(el);
				        				
				        			});
				        			
				        		}
							   
							}
				        };
				        
						top.layui.layer.open(_default);
						
			    	});
					
				}else{
					
					setTimeout(function(){
						
						isLoad();
						
					},100);
					
				}
				
			}
			
		}
		
		isLoad();
		
	}
	
}
