var _FunctionObject = _FunctionObject|| {};
(function($,xUtilBase){
	$(document).ready(documentReady);
	function documentReady(){
		
		//如果是ifrmae嵌套则取出顶层窗口
		if($("body").hasClass("iframe-body")){
			
			var _parentWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/index.html");
			
			if(!_parentWindow){
				
				_parentWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/") || window.top;
				
				if(!_parentWindow){
					
					top.layui.layer.msg("未初始化主窗口");
					
					return;
					
				}
			}
			
		}
		
	
		var $fromdom = $("#blog-add"),
			_btn = $fromdom.find("#submit"),
			_pageAction = xUtilBase.getUrlParam("action");
		
		_FunctionObject.$fromdom = $fromdom;
		
		$fromdom.get(0).BookSubmit = function(){
			_FunctionObject.httpSubmitPage();
		};
		
		//提交
		_FunctionObject.httpSubmitPage = function(_func){
			
			var _this = this;
			
			var _data = {};
			$.extend(true, _data, $fromdom.getElValue());
			
			_data.action = _pageAction || "add";
			
			var _newData = new Object();
			
			for(var i in _data){
				
				xUtilBase.setStringFormatObject(_newData,i,_data[i]);
			
			}
			
			var _fileDmt = formatUploadFileToJSON(_this.__cache);
			
			_newData.model.dmt = _fileDmt.dmtArrayString;
			
			//scene转换为字符串
			if(_this.__cacheModel && _this.__cacheModel.model && _this.__cacheModel.model.scene){
				
				_newData.scene = _this.__cacheModel.model.scene;
				
				//如果不是字符串
				try{
					
					_newData.scene = JSON.stringify(_newData.scene);
					
				}catch(e){
					//TODO handle the exception
				}
				
			}
			
			_newData.useDmt = _fileDmt.useDmt;
			
			_newData.oldDmt = _fileDmt.oldDmt;
			
			//定义提交地址
			var _url;
			
			if(_data.action=="update"){
				
				_url = "/model_3d/model/update";
				
			}else{
				
				_url = "/model_3d/model/add";
				
				delete _newData["model"]["id"];
				
			}
			
			//使用JSON方式
			_newData = JSON.stringify(_newData);
			
			xUtilBase.ajax({
				url : _url,
				contentType : "application/json;charset=UTF-8",
				data : _newData,
				success : function(result){
					if(result["code"]=="0"){
						if(_data.action=="add"){
							top.layui.layer.msg("添加成功");
						}else{
							top.layui.layer.msg("更新成功");
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
		
		//弹出模型分类窗口
		$fromdom.find("#modelClassName").on("click",function(){
			
			_FunctionObject.OpenPageModelTree();
			
			var _id = $fromdom.find("#modelClassId").val();
			
			if(_id){
				
				function setModelTreeSelected(_id){
					
					var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/iframe/model.tree.html");
					
			    	if(!_iframeWindow || !_iframeWindow._FunctionObject){
			    		
			    		setTimeout(function(){
			    			
			    			setModelTreeSelected(_id);
			    			
			    		},200);
			    		
			    	}else{
						
						_iframeWindow._FunctionObject.SetTreeSelectedById(_id);
						
					}
					
				}
				
				setModelTreeSelected([_id]);
				
			}
			
		});
		
		//弹出多媒体窗口
		$fromdom.find("#button-model-dmt").on("click",function(){
	        		
    		var _this = this,
    		
    			$this = $(this);
    		
    		var _classFileUpdateControlMain = new ClassFileUpdateControlMain();
    		
    		_classFileUpdateControlMain.SetUplaodType("image");
        		
        	_classFileUpdateControlMain.SetUplaodSize("100kb");
    		
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
			    	
			    	$this.html("图片管理");
			    	
			    	_FunctionObject.__cache = _data;
			    	
			    	top.layui.layer.close(_this.__openPanelIndex);
	            	
	            },
	            cancel: function(index, layero){
					
				}, 
				end : function(index, layero){
	            	
	            },
	            success: function(layero, index){
				   
					_this.__openPanelIndex = index;
				   
				   //如果有缓存则反显
					if(_FunctionObject.__cache){
	        			
	        			var _iframeUpload = xUtilBase.GetIframeContentWindowById(_classFileUpdateControlMain.GetWindowURL());
	        			
				    	if(!_iframeUpload){
				    		
				    		top.layui.layer.msg("未初始化上传窗口");
				    		
				    		return;
				    		
				    	}
				    	
				    	var _data = _FunctionObject.__cache;
				    	
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
		
		
		//根据ID获取数据
		_FunctionObject.GetPageById = function(id){
			
			var _this = this;
			
			var _data = {
				id : id
			};
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : "/model_3d/model/getById",
				type : "post",
				data : _data,
				contentType : "application/json;charset=UTF-8",
				success : function(data){
					if(data["code"]=="0"){
						if(!data.data){
							layer.msg("数据格式不正确");
							return false;
						}
						
						_this.__cacheModel = data.data;
						
						console.info(_this);
						
						var _d = data.data;
						
						try{
							
							_d.dmt = JSON.parse(_d.dmt);
							
						}catch(e){
							//TODO handle the exception
						}
						
						var _temp = {};
						$.extend(true, _temp, $fromdom.getElValue());
						
						for(var i in _temp){
							
							var _value = xUtilBase.getStringFormatObject(_d,i.replace(/^model\./,""));
							
//							console.info(i,_value);
							
							_temp[i] = _value;
						}
						
						$fromdom.setElValue(_temp);
						
						layui.form.render();
						
						//反显多媒体
						var _uploadData = {
							
							uploadFiles : (function(){
								
								//模拟成文件
								var _array = [];
								
								$.each(_d.dmt, function(index,el) {
									
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
						
						var $dmt = $fromdom.find("#button-model-dmt");
	        		
						$dmt.next().html("共有["+_uploadData.uploadFiles.length+"]个文件");
			    	
				    	$dmt.html("图片管理");
				    	
				    	_FunctionObject.__cache = _uploadData;
						
					}else{
						
						layui.layer.msg(data["message"],{time:5000});
						
					}
					
				}
				
			});
			
		}
		
		//打开模型树
		_FunctionObject.OpenPageModelTree = function(){
			
			var _this = this;
			
			var _default = {
				id : "layer-open-modelTree",
	            type: 2,
	            anim : -1,
	            title: "模型列表",
	            shade : 0.3,
	            area: ['300px', '360px'],
	            shadeClose: false,
	            isOutAnim : false,
	            content: "/model3d/3dmodel/page/iframe/model.tree.html",
	            btn: ['保存', '取消'],
	            end : function(index, layero){
	            	
	            },
	            success: function(layero, index){
	            	
				   layero.find(".layui-layer-content").css({"padding":"0"});
				   
				},
	            yes: function (index) {
	            	
	            	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/page/iframe/model.tree.html");
			    	if(!_iframeWindow){
			    		top.layui.layer.msg("未初始化窗口");
			    		return;
			    	}
			    	
			    	var _ztree = _iframeWindow._FunctionObject.GetTreeObject();
	            	
	            	var _nodes = _ztree.getCheckedNodes(true);
	            	
	            	if(_nodes.length<1){
	            		
	            		top.layui.layer.msg("未选择模型");
	            		
	            		return false;
	            		
	            	}else if(_nodes.length>1){
	            		
	            		top.layui.layer.msg("不能选择多个模型");
	            		
	            		return false;
	            		
	            	}
	            	
	            	var _data = {
	            		
	            		"model.classId" : _nodes[0].id,
	            		
	            		"model.className" : _nodes[0].name
	            		
	            	};
	            	
	            	$fromdom.setElValue(_data);
	            	
	            	top.layui.layer.close(index);
	            }
			};
			
			top.layui.layer.open(_default);
		}
		
		_FunctionObject.init  = function(){
			
			var _this = this;
			
			var form,
				layer = layui.layer;
			
			layui.use(['form','laydate'], function(){
				
			  	form = layui.form;
			  	
			  	form.render();
			  	
				//监听提交
				form.on('submit(formSubmit)', function(data){
					$fromdom.get(0).BookSubmit();
					return false;
				});
				
				//通用代码，获取字典
				var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/index.html");
		    	if(!_iframeWindow){
		    		_iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/");
		    		if(!_iframeWindow){
	//	    			top.layui.layer.msg("未初始化主窗口");
	//	    			return;
		    		}
		    	}
		    	
		    	var DICT = _iframeWindow._FunctionObject.moduleControl.DICT;
				
				if(_pageAction=="update"){
					
		        	$fromdom.setElValue({
		        		
		        		page_action : "编辑"
		        		
		        	});
		        	
		        	DICT.GetGUOJIADIQU(function(result){
		        		
		        		$fromdom.find("[x-input-name='model.country']").setSelect(result);
		        		
		        		_this.GetPageById(xUtilBase.getUrlParam("id"));
		        		
		        		form.render();
		        		
		        	});
		        	
		        }else{
		        	
		        	$fromdom.setElValue({
		        		
		        		page_action : "新增"
		        		
		        	});
		        	
		        	DICT.GetGUOJIADIQU(function(result){
		        		
		        		$fromdom.find("[x-input-name='model.country']").setSelect(result);
		        		
		        		form.render();
		        		
		        	});
		        	
		        }
			});
			
		}
		
		_FunctionObject.init();
		
	}
	
})(jQuery,xUtilBase=x);