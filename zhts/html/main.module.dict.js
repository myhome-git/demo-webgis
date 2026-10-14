/**
 * 字典模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module;
	
	//获取系统字典公共方法
	module.GetSystemDictList = function(typeCode,callback){
		var _data = {
			typeCode : typeCode
		};
		
		_data = JSON.stringify(_data);
		xUtilBase.ajax({
			url : getModuleURL("http.dist.getById"),
			data : _data,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						return false;
					}
					if(callback){
						callback(result.data);
					}
				}else{
					top.layui.layer.msg("获取字典内容失败");
				}
			}
		});
	}
	
	/**
	 * 批量获取，新接口
	 * @param {Object} option
	 */
	module.httpGetDictList = function(option){
		let _obj = {};
		$.each(option.keys, function(index,el) {
			_this.GetSystemDictList(el,function(result){
				_obj[el] = result;
			});
		});
		
		//检测是否完成
		let _startTime = new Date().getTime(),
			_outTime = _startTime+(option.timeout||1000*5);
			
		function isSuccess(){
			if(new Date().getTime()>_outTime){
				if(option && option.error){
					option.error(_obj);
				}
				return;
			}
			let _isP = true;
			$.each(option.keys, function(index,el) {
				if(_obj[el]===undefined){
					_isP = false;
				}
			});
			if(!_isP){
				setTimeout(isSuccess,100);
			}else{
				if(option && option.success){
					option.success(_obj);
				}
			}
		}
		isSuccess();
	}
	
	/**
	 * 设备类型
	 */
	module.GetSHEBEILEIXING = function(){
		var _key = "lbs_equipment_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 电子围栏-区域-面积类型
	 */
	module.GetQUYUMIANJILEIXING = function(){
		var _key = "lbs_fence_region_area_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 电子围栏-区域-区域类型
	 */
	module.GetQUYUQUYULEIXING = function(){
		var _key = "lbs_fence_region_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 电子围栏-规则-规则类型
	 */
	module.GetGUIZEGUIZELEIXING = function(){
		var _key = "lbs_fence_rules_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 电子围栏-规则-规则区域
	 */
	module.GetGUIZEGUIZEQUYU = function(){
		var _key = "lbs_fence_rules_region_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 船舶-船舶类型
	 */
	module.GetCHUANBOLEIXING = function(){
		var _key = "lbs_ship_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	/**
	 * 车辆-车辆类型
	 */
	module.GetCHELIANGLEIXING = function(){
		var _key = "lbs_car_type";
		this.GetSystemDictList(_key,arguments[0]);
	}
	
	module.init = function(){
		
	}
	
})(jQuery,_pageObject,_pageObject.DICT={});