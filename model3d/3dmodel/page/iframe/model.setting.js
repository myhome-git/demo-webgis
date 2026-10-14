var _FunctionObject = _FunctionObject|| {};

(function($,xUtilBase,module){
	
	$(document).ready(documentReady);
	
	function documentReady(){
		
		module.init();
		
	}
	
	//定义dom
	var _iframeModelViewWindow,
		$sceneGamma,
		$sliderToneMappingExposure,
		$slideAmbientIntensity,
		$colorpickerAmbientColor,
		$inputColorpickerAmbientColor;
	
	//数据回显
	module.SetPanelValue = function(_data){
		
		if(_data.sceneGamma){
			$sceneGamma.attr("checked",true);
		}else{
			$sceneGamma.removeAttr("checked",true);
		}
		
		var _rgbColor = new _iframeModelViewWindow.THREE.Color(_data.sceneAmbientColor).getStyle();
		$inputColorpickerAmbientColor.val(_rgbColor);
		$inputColorpickerAmbientColor.prev().css({"background-color":_rgbColor});
		
	}
	
	//打开颜色选择器
	module.OpenColorpicker = function(_id){
		
		var _threeColor = _iframeModelViewWindow._classSceneControl.GetAmbientColor();
		var _rgbColor = new _iframeModelViewWindow.THREE.Color(_threeColor).getStyle();
		
		top.layui.layer.open({
			id : "layer-open-colorpicker",
	        type: 2,
	        anim : -1,
	        title: "颜色选择器",
	        shade : 0.1,
	        area: ['280px', '380px'],
	        shadeClose: false,
	        isOutAnim : false,
	        content: "/WebFrame/library/beyon/layuiColorpicker.html?alpha=false&color="+_rgbColor,
	        success: function(layero, index){
	        	
	        	var $input = $('#INPUT-colorpicker-'+_id);
	        	var $button = $('#BUTTON-colorpicker-'+_id);
	        	
	        	var _iframeWindow = xUtilBase.GetIframeContentWindowById("/WebFrame/library/beyon/layuiColorpicker.html");
            	_iframeWindow._FunctionObject.layuiColorpickerEvent("done",function(color){
            		$input.val(color);
            		$button.parent().css({"background-color":color});
            		_iframeModelViewWindow._classSceneControl.SetAmbientColor(color);
            		top.layui.layer.close(index);
            	});
            	
            	_iframeWindow._FunctionObject.layuiColorpickerEvent("change",function(color){
            		$button.parent().css({"background-color":color});
            		$input.val(color);
            	});
	        	
			}
	    });
		
	}
	
	module.init  = function(){
		
		//获取模型窗口
		var _iframeWindow = xUtilBase.GetIframeContentWindowById("/model3d/3dmodel/3d.model.html");
		_iframeModelViewWindow = _iframeWindow;
		
		//获取dom
		$sceneGamma = $("#sceneGamma");
		$sliderToneMappingExposure = $('#sliderToneMappingExposure');
		$slideAmbientIntensity = $("#slideAmbientIntensity");
		$colorpickerAmbientColor = $('#BUTTON-colorpicker-ambientColor');
		$inputColorpickerAmbientColor = $("#INPUT-colorpicker-ambientColor");
		
		var _default = {
			sceneGamma : _iframeWindow._classSceneControl.GetSceneGamma(),
			sceneToneMappingExposure : _iframeWindow._classSceneControl.GetToneMappingExposure(),
			sceneAmbientIntensity : _iframeWindow._classSceneControl.GetAmbientIntensity(),
			sceneAmbientColor : _iframeWindow._classSceneControl.GetAmbientColor()
		};
		this.SetPanelValue(_default);
		
		
		$colorpickerAmbientColor.on("click",function(){
			module.OpenColorpicker("ambientColor");
		});
		
		layui.use(['form','slider','colorpicker'], function(){
			layui.form.render();
			
			layui.form.on('switch(switchGamma)', function(data){
				_iframeWindow._classSceneControl.SetSceneGamma(data.elem.checked);
			});
			
			
			
			$sliderToneMappingExposure.utilSlider({
			    elem: $sliderToneMappingExposure
			    ,input: true //输入框
			    ,theme:"#5FB878"
			    ,min:0
			    ,max:2
			    ,step:0.1
			    ,tips : false
			    ,value : _default.sceneToneMappingExposure
			    ,change: function(value){
//			    	value = value.toString().match(/^\d+\.{0,1}\d{0,1}/);
//			    	$sliderToneMappingExposure.find(".layui-input").val(value);
//			    	$sliderToneMappingExposure.find(".layui-slider-tips").html(value);
				    _iframeWindow._classSceneControl.SetToneMappingExposure(value);
				}
			  });
			
			 $slideAmbientIntensity.utilSlider({
			    elem: $slideAmbientIntensity
			    ,input: true //输入框
			    ,theme:"#5FB878"
			    ,min:0
			    ,max:2
			    ,step:0.1
			    ,tips : false
			    ,value : _default.sceneAmbientIntensity
			    ,change: function(value){
//			    	value = value.toString().match(/^\d+\.{0,1}\d{0,1}/);
//			    	 $slideAmbientIntensity.find(".layui-input").val(value);
//			    	 $slideAmbientIntensity.find(".layui-slider-tips").html(value);
				    _iframeWindow._classSceneControl.SetAmbientIntensity(value);
				}
			  });
			  
		});
		
	}
	
})(jQuery,xUtilBase=x,_FunctionObject);