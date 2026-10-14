var _FunctionObject = _FunctionObject|| {};
(function($,xUtilBase){
	$(document).ready(documentReady);
	function documentReady(){
		
		let layui = top.layui;
		
		var $fromdom = $("#blog-add"),
			_btn = $fromdom.find("#submit"),
			_pageAction = xUtilBase.getUrlParam("action"),
			_pageType = xUtilBase.getUrlParam("type");
		
		_FunctionObject.$fromdom = $fromdom;
		
		$fromdom.get(0).BookSubmit = function(){
			_FunctionObject.httpSubmitPage();
		};
		
		let _iframeMain = getModuleWindowPageObjectByName("system.main");
		let _iframeWindowFenceMain = getModuleWindowByName("module.fence.main");
		
		if(!_iframeWindowFenceMain){
			top.layui.layer.msg("管理窗口不存在");
			return;
		}
		
		//提交
		_FunctionObject.httpSubmitPage = function(_func){
			var _data = {};
			$.extend(true, _data, $fromdom.getElValue());
			
			//_data.blogContent = _FunctionObject.blogEditor.getMarkdown();
			
			_data.action = _pageAction || "add";
			
			var _url = "";
			if(_data.action=="update"){
				_url = GetPROBJECT_PATH()+"/api/fenceRegion/updateData";
			}else{
				_url = GetPROBJECT_PATH()+"/api/fenceRegion/insertData";
			}
			
			var moduleControl = _iframeWindowFenceMain._FunctionObject.QUYUGUANLI;
			let _module = _iframeMain.FENCE_DRAW;
			
			if(!_module._wktString){
				top.layui.layer.msg("没有发现绘制区域");
				return;
			}
			
			$.extend(true, _data, _module._wktOther);
			_data.area = _module._wktString;
			
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : _url,
				contentType : "application/json;charset=UTF-8",
				data : _data,
				success : function(result){
					if(result["code"]=="0"){
						if(_pageAction=="update"){
							layui.layer.msg("更新成功");
						}else{
							layui.layer.msg("添加成功");
						}
						$fromdom.clearElValue("x-out-name");
						if(_func){
							_func();
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
		
		//获取blog
		_FunctionObject.GetPageById = function(id){
			var _data = {
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
						_d.imageViewURL = GetPROBJECT_PATH()+"/api/fenceRegion/getImageById?id="+_d["id"];
						if(_pageAction!="select"){
							$fromdom.find(".bind-upload-group").css({"opacity":"1"});
						}else{
                            $fromdom.find(".bind-upload-group").css({"display":"none"});
                        }
						
						$fromdom.setElValue(_d);
						$fromdom.find("[x-btn-name='button-open-layui-colorpicker']").css({"background-color":_d.color});
						$fromdom.layuiFormRender();
						
						//反显图形
						let _module = _iframeMain.FENCE_DRAW;
						var _quyu = _iframeWindowFenceMain._FunctionObject.QUYUGUANLI;
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
							_module.DrawRectangle({
								_wktString : _d.area
							});
						}else if(_d.areaType=="3"){
							_module.setDrawPolygon({
								_wktString : _d.area
							});
						}
						
						if(_pageAction=="update"){
							_module.changeInteractionActive(["select","modify"]);
						}
						_module.setFeatureColor(_d.color);
					}else{
						layui.layer.msg(data["message"],{time:5000});
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
                default:
                    break;
            }
		});
		
		//上传图片
		_FunctionObject.CreateLogoDocument = function(){
			var _UploadBox = $("#upload-group-1"),
				_NodeBox = _UploadBox.find(".bind-node-box"),
				_ButtonFileUpload = _UploadBox.find("button[x-btn-name='ButtonFileUpload']"),
				_ButtonHiddenBox = _UploadBox.find(".button-hidden-box"),
				_ButtonFileView = _ButtonHiddenBox.find("button[x-btn-name='ButtonFileView']"),
				_ButtonFileDelete = _ButtonHiddenBox.find("button[x-btn-name='ButtonFileDelete']");
			try{
				var upload = new xUpload();//x-plupload-template.js
			}catch(e){
				throw new Error("object xUpload undefined");
				return;
			}
			var _Upload = new xUpload();
	
			_Upload.settings = {
				url : GetPROBJECT_PATH()+"/api/uploadFile/upload",			//服务器端的上传页面地址
				type : "all",		//文件类型,如果为空则不允许上传
				size : "50mb",				//文件大小
				swf : WebLoader.Config.PROBJECT_PATH+"/library/plupload-2.1.0/js/Moxie.swf",			//swf文件，当需要使用swf方式进行上传时需要配置该参数
				xap : WebLoader.Config.PROBJECT_PATH+"/library/plupload-2.1.0/js/Moxie.xap",			//silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
				btn_openFileId : _ButtonFileUpload.attr("id"),	//触发文件选择对话框的按钮，为那个元素id
				node_box : _NodeBox.get(0)						//节点容器，用于创建结构
			};
			
			_Upload.init(_Upload.settings);
			
			/*************************************************************************
			*	事件控制区
			*************************************************************************/
			
			//选择文件
			_Upload.bindEvent("FilesAdded",function(){
				_Upload.setFileAllState(_Upload.getFiles());
				_Upload.start();
			});
			
			//文件队列变化，增加和删除文件均能触发
			_Upload.bindEvent("QueueChanged",function(){
				
			});
			
			//单个文件开始上传
			_Upload.bindEvent("UploadFile",function(up,file){
				//upload.getPlupUploadObject().setOption({multipart_params:{uuid:file.id}});
			});
			
			//单个文件上传前动作
			_Upload.bindEvent("BeforeUpload",function(up,file){
				_Upload.plupload.setOption({multipart_params:{uuid:file.id+file.name}});
			});
			
			
			//单文件进度条
			_Upload.bindEvent("uploadProgress",function(up,file){
				
			});
			
			//单个文件上传完成
			_Upload.bindEvent("FileUploaded",function(up,file,responseObject){
				if(file["status"]===5 && responseObject["status"]=="200"){
					layer.msg("文件上传完成");
					var _object = {};
					try{
						_object = JSON.parse(responseObject.response);
					}catch(e){
						layer.msg(e.message);
						return false;
					}
					if(_object["code"]=="0"){
						
						//删除旧图片
						var _data = $fromdom.getElValue();
						if(_data["filePath"]){
							_FunctionObject.RemoveImageById(_data["filePath"],fanxian);
						}else{
							fanxian();
						}
						
						function fanxian(){
							var _filePath = _object["data"]["filePath"];
							$fromdom.setElValuePlus("x-input-name",{
								filePath : _filePath,
								imageViewURL : GetPROBJECT_PATH()+"/api/uploadFile/preview?filePath="+encodeURIComponent(_filePath)
							})
							$fromdom.find("[x-btn-name='ButtonFileDelete']").css({"display":"inline-block"});
							$fromdom.find("[x-btn-name='ButtonFileUpload']").html("重新上传");
						}
						
					}else{
						layui.layer.msg(_object["message"]);
					}
					
					//_serverReturn.html(responseObject["response"]+_serverReturn.html());
					
	//				var _view = target.find(".image-view");
	//				_view.find("img").attr("src",_object["data"]["NewFileName"]);
	//				_view.next().find(".viewer-canvas img").attr("src",_object["data"]["NewFileName"]);
	//				_view.viewer({transition:false,zoomRatio:0.2,keyboard:true});
				}else{
					layui.layer.msg(responseObject["message"]);
				}
			});
			
			//全部文件上传完成，其中包含失败的文件
			_Upload.bindEvent("UploadComplete",function(up,files){
				_Upload.removeFileAll();
			});
			
			//发生错误
			_Upload.bindEvent("Error",function(up,err){
				var _code = err.code + "";
				_code = _code.replace(/-/g,"");
				layui.layer.msg(_Upload.UploadError["CODE"+_code]);
			});
		}
		
		//删除图片
		_FunctionObject.RemoveImageById = function(id,_func){
			var _data = {
				filePath : id
			};
			_data = JSON.stringify(_data);
			xUtilBase.ajax({
				url : GetPROBJECT_PATH()+"/api/uploadFile/delete",
				contentType : "application/json;charset=UTF-8",
				type : "post",
				data : _data,
				success : function(result){
					if(result["code"]=="0"){
						$fromdom.find("#ImageView-company").attr("src","");
					}else{
						
					}
					if(_func){
						_func();
					}
				}
			});	
		}
		
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
                	let _module = _iframeMain.FENCE_DRAW;
                	
                	var _iframeWindow = getModuleWindowByURL(_url);
                	_iframeWindow._FunctionObject.layuiColorpickerEvent("done",function(color){
                		$fromdom.find("[x-input-name='color']").val(color);
                		$fromdom.find("[x-btn-name='button-open-layui-colorpicker']").css({"background-color":color});
                		_module.setFeatureColor(color);
                		layui.layer.close(index);
                	});
                	_iframeWindow._FunctionObject.layuiColorpickerEvent("change",function(color){
//              		$fromdom.find("[x-input-name='color']").val(color);
                		_module.setFeatureColor(color);
                	});
				}
            });
		}
		
		_FunctionObject.init  = function(){
			let _this = this;
			
			//通用代码，获取字典
			var _iframeWindow = getModuleWindowPageObjectByName("system.main");
	    	if(!_iframeWindow){
	    		top.layui.layer.msg("未初始化主窗口");
	    		return;
	    	}
	    	
			layui.use(["form","laydate"], function(){
				//监听提交
				layui.form.on('submit(formSubmit)', function(data){
					$fromdom.get(0).BookSubmit();
					return false;
				});
				
				if(_pageAction!="update"){
					$fromdom.setElValue({type:_pageType});
	        		$fromdom.layuiFormRender();
				}
				
				//定义时间格式，如果是航班数据，则显示时分秒
				var _dateFormat = "yyyy-mm-dd";
				
				//定义开始时间插件
				var _default = {
					elem: '#enterWaterTime',
					value: xUtilBase.classDate.responseDate(new Date(),_dateFormat),
					isInitValue: true,
					anim : -1
				};
				
				layui.laydate.render(_default);
				
				_this.CreateLogoDocument();
			
		    	let DICT = _iframeWindow.DICT;
		    	
				if(_pageAction=="update" || _pageAction=="select"){
					DICT.GetQUYUQUYULEIXING(function(data){
						let _array = [];
						$.each(data, function(index,el) {
							_array.push({
								id : el.key,
								name : el.value
							});
						});
		        		$fromdom.getFormInput("type").setSelect(_array);
		        		_FunctionObject.GetPageById(xUtilBase.getUrlParam("id"));
		        		$fromdom.layuiFormRender();
		        	});
		        }else{
		        	DICT.GetQUYUQUYULEIXING(function(data){
		        		let _array = [];
						$.each(data, function(index,el) {
							_array.push({
								id : el.key,
								name : el.value
							});
						});
		        		$fromdom.getFormInput("type").setSelect(_array);
		        		$fromdom.layuiFormRender();
		        	});
		        }
		        
		        $fromdom.layuiFormRender();
			});
		}
		
		_FunctionObject.init();
	}
	
})(jQuery,xUtilBase=x);