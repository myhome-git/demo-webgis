/***************************************测试代码*******************************************************/
var _iframeWindow,
	_XModelArray = [],
	_classSceneControl,
	_classModelControl,
	_ModelTest,
	_FunctionObject = _functionObject = new Object();
	_FunctionObject.moduleControl = {};

(function($){
	
	//等待3dmodel页面创建
	function load3dModelPage(){
		
		_iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/3d.model.html");
		
		if(!_iframeWindow || !_iframeWindow._classSceneControl){
			
			setTimeout(function(){
				
				load3dModelPage();
				
			},200);
			
		}else{
			
			_classSceneControl = _iframeWindow._classSceneControl;
			
			_classModelControl = _iframeWindow._classModelControl;
			
			_ModelTest = _iframeWindow._ModelTest;
			
			$(document).ready(documentReady);
			
		}
		
	}
	
	load3dModelPage();
	
	//载入页面逻辑
	function documentReady(){
		
		_FunctionObject.$body = $("body");
        _FunctionObject.$mainWindow = $("#x-view-window");
        
		_FunctionObject.$mainHeader = _FunctionObject.$mainWindow.find("#x-main-header");
        _FunctionObject.$headerPositionMarker = _FunctionObject.$mainHeader.find("#x-positionMarker");
        _FunctionObject.$headerMoveMenu = _FunctionObject.$mainHeader.find("#x-header-move-menu");
        
        _FunctionObject.$headerSettingsNav = _FunctionObject.$mainHeader.find("#x-header-settings");
        _FunctionObject.$headerSettingsPositionMarker = _FunctionObject.$mainHeader.find("#x-header-settings-positionMarker");
        _FunctionObject.$headerSettingsMoveMenu = _FunctionObject.$mainHeader.find("#x-header-settings-move-menu");
        
        _FunctionObject.$viewIframe = _FunctionObject.$body.find("#x-view-iframe");
        
        //绑定顶部非悬停按钮
        _FunctionObject.$headerSettingsNav.find("[x-btn-name]").on("click", function () {
            var $this = $(this),
                _val = $this.attr("x-btn-name");
       		_FunctionObject.mainHeaderButtonInterface(_val,$this);
        });

        //绑定按钮
        _FunctionObject._BindMenuClickEvent = function () {
            _FunctionObject.$headerMoveMenu.find("[x-btn-name]").unbind().on("click", function () {
                var $this = $(this),
                        $key = $this.attr("x-btn-name");
                //AnimateProgress();
                $("body #script-progress").remove();
//              $("body").append("<script src='http://www.baidu.com/1.js'><\/script>");
                _FunctionObject.$headerMoveMenu.empty();
                _FunctionObject.$headerPositionMarker.css({"width": "0"});
            });
        }

        _FunctionObject.$headerMoveMenu.hover(function () {
            var m = _FunctionObject.$headerMoveMenu;
            m.data("isopen", "true");
        }, function () {
            var m = _FunctionObject.$headerMoveMenu;
            m.data("isopen", "false");
            setTimeout(function () {
                var c = m.data("isopen");
                if (c == "false") {
                    m.empty();
                    _FunctionObject.$headerPositionMarker.css({"width": "0"});
                }
            }, 100);
        });
        
        //顶部菜单悬停-右侧导航
        _FunctionObject.$headerSettingsNav.find(".main-nav-bean > a").hover(function () {
            var $this = $(this);
            var m = _FunctionObject.$headerSettingsMoveMenu;
            m.data("isopen", "true");
            m.data("openIndex", $this.parent().index());
            m.empty();
            m.append($this.next().prop("outerHTML"));
            m.css({"left": ($this.parent().offset().left + $this.parent().outerWidth() - $this.next().outerWidth()) + "px"});

            var p = _FunctionObject.$headerSettingsPositionMarker;
            p.css({"left": ($this.parent().offset().left) + "px", "width": ($this.parent().outerWidth()) + "px"});

            //绑定切换背景按钮
            _FunctionObject.$headerSettingsMoveMenu.find("[x-skin-button]").on("click", function () {
            	
                var $this = $(this);
                
                _FunctionObject.SetBodySkin($this.attr("x-skin-button"));
                
            });

            //绑定按钮
            _FunctionObject.$headerSettingsMoveMenu.find("[x-btn-name]").on("click", function () {
            	
                var $this = $(this),
                
                    _val = $this.attr("x-btn-name");
                        
                _FunctionObject.mainHeaderButtonInterface(_val,$this);
                
                _FunctionObject.$headerSettingsMoveMenu.empty();
                
                _FunctionObject.$headerSettingsPositionMarker.css({"width": "0"});
                
            });
            
            _FunctionObject._BindMenuClickEvent();
            
        }, function () {
            var m = _FunctionObject.$headerSettingsMoveMenu;
            m.data("isopen", "false");
            setTimeout(function () {
                var c = m.data("isopen");
                if (c == "false") {
                    m.empty();
                    _FunctionObject.$headerSettingsPositionMarker.css({"width": "0"});
                }
            }, 100);
            //_FunctionObject.$headerMoveMenu.empty();
        });
        
        _FunctionObject.$headerSettingsMoveMenu.hover(function () {
            var m = _FunctionObject.$headerSettingsMoveMenu;
            m.data("isopen", "true");
        }, function () {
            var m = _FunctionObject.$headerSettingsMoveMenu;
            m.data("isopen", "false");
            setTimeout(function () {
                var c = m.data("isopen");
                if (c == "false") {
                    m.empty();
                    _FunctionObject.$headerSettingsPositionMarker.css({"width": "0"});
                }
            }, 100);
        });
        
        //关闭载入提示窗口
        _FunctionObject.CloseLoadingPanel = function(){
        	
        	$("#x-view-iframe > .x-loading").hide();
        	
        }
        
        //退出登录
        _FunctionObject.httpOutSystem = function(){
        	
        	$.ajax({
				url : "/by-service/apilogout",
				success : function(result){
					console.log(result);
					if(result.code==0){
						top.location.href = "/model3d/login/";
					}else{
						layui.layer.msg("退出失败！");
					}
				},
				error : function(a,b,c){
					layui.layer.msg(b);
				}
			});
        	
        }
        
		//初始化
		_functionObject.Init = function(){
			
			layui.use('layer', function(){
				
			});
			
		}
		
		_functionObject.Init();
		
	}
	
})(jQuery);





(function($,_FunctionObject){
	
	//顶部按钮通用处理
	_FunctionObject.mainHeaderButtonInterface = function (_name,$this) {
		
		switch (_name) {
			
	    	case "model-manage":
	    	
				_FunctionObject.OpenLayerPageManage("/model3d/3dmodel/page/model-manage/model.main.html", $this.html());
				
	    		break;
	    		
	    	case "model-data-manage":
	    	
				_FunctionObject.OpenLayerPageManage("/model3d/3dmodel/page/model-data-manage/model.data.main.html", $this.html());
				
	    		break;
	    		
	    	case "system-manage-dict":
	    	
				_FunctionObject.OpenLayerPageManage("/model3d/3dmodel/page/system-manage-dict/dict.main.html", $this.html());
				
	    		break;
	    		
	    	case "model-transition-animate-manage":
	    	
				_FunctionObject.OpenLayerPageManage("/model3d/3dmodel/page/model-transition-animate-manage/main.html", $this.html());
				
	    		break;	
	    		
	        default:
	        
	            break;
	            
	    }
		
	}
	
	//弹出layer层。例如员工管理、设备管理,personnel.main.html
	_FunctionObject.OpenLayerPageManage = function (_url, _title) {
		
		var _this = this;
	
	    var $title = _FunctionObject.$viewIframe.find(".x-panel-title");
	    
	    $title.find("font").html(_title);
	
	    $title.unbind("click").find(".btn-close").on("click", function () {
	    	
	        _FunctionObject.$viewIframe.removeClass("open");
	        
	        _ModelTest.ShowPanelModelLeftMenu(true);
	        
	    });
	    
	    $("#x-view-iframe > .x-loading").show();
	    
	    //设置iframe宽度
	//  _FunctionObject.$viewIframe.css({"width":"calc(100% - "+_ModelTest.GetModelTreeWidth()+"px)","left":"auto","right":"0"});
		_ModelTest.ShowPanelModelLeftMenu(false);
	    
	    var $iframe = _FunctionObject.$viewIframe.find("iframe");
	    
	    $iframe.attr("src", _url);
	    
	    _FunctionObject.$viewIframe.addClass("open");
	    
	    function closeOpenWindow(){
	    	
	    	var _iframeWindow = xUtilBase.GetIframeContentWindowById(_url);
			
			if(_iframeWindow){
				
				_this.CloseLoadingPanel();
				
			}else{
				
				setTimeout(function(){
					
					closeOpenWindow();
					
				},500);
				
			}
					
	    }
	    
	    closeOpenWindow();
	    
	}
	
})(jQuery,_FunctionObject);



//获取字典KEY
(function($,moduleControl){
	
	$(document).ready(documentReady);
	
	function documentReady(){
		
		//获取树公共方法
		moduleControl.GetSystemDictTypeList = function(_option,_func){
			
			var _this = this;
			
			var _data = JSON.stringify(_option);
			
			xUtilBase.ajax({
				url : "/model_3d/api/model3dDictType/getSubTreeById",
				type : "post",
				data : _data,
				contentType : "application/json;charset=UTF-8",
				success : function(result){
					if(result["code"]=="0"){
						if(!result.data){
							return false;
						}
						if(_func){
							_func(result.data);
						}
					}else{
						
						top.layui.layer.msg("获取树失败");
						
					}
					
				}
			});
			
		}
		
		//获取系统字典公共方法
		moduleControl.GetSystemDictList = function(_option,_func){
			
			var _this = this;
			
//			var _data = JSON.stringify(_option);
			
			var _data = _option;
			
			xUtilBase.ajax({
				url : "/model_3d/api/model3dDict/getModel3dDictPagerData",
				type : "post",
				data : _data,
//				contentType : "application/json;charset=UTF-8",
				success : function(result){
					if(result["code"]=="0"){
						if(!result.data){
							return false;
						}
						if(_func){
							
							var _array = [];
							
							_array.push({
								
								key : "",
								
								value : "请选择"
								
							});
							
							$.each(result.data.rows,function(index,el){
								
								_array.push({
									
									key : el.key,
									
									value : el.value
									
								});
								
							});
							
							_func(_array);
							
						}
						
					}else{
						top.layui.layer.msg("获取字典内容失败");
					}
				}
			});
			
		}
		
		
		
		
		//模型类型
		moduleControl.GetMOXINGLEIXING = function(_func){
			
			var _option = {
				
				id : "F"
				
			};
			
			this.GetSystemDictTypeList(_option,_func);
			
		}
		
		//国家地区
		moduleControl.GetGUOJIADIQU = function(_func){
			
			var _option = {
				
				type : "guojialiebiao",
				
				page : 1,
				
				rows : 1000
				
			};
			
			this.GetSystemDictList(_option,_func);
		}
		
		moduleControl.init = function(){
			
		}
		
	}
	
})(jQuery,_FunctionObject.moduleControl.DICT = {});