var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

/**
 * 模块入口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.FORM.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 地图定位模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,_pageAction;
	let _winMain = getModuleWindowPageObjectByName("system.main");
	
	/**
	 * 提交表单数据
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url,
			layui = top.layui;
			
		$.extend(true, _data, $doc.getElValue());
		_data.enabled = _data.enabled[0]? true : false;
		_data.defaultlayer = _data.defaultlayer[0]? true : false;
		_data.baselayer = _data.baselayer=="0"?true:false;
		_data.action = _pageAction || "add";

		if(_data.action=="update"){
			_url = getModuleURL("http.system.manage.config.layer.update");
		}else{
			_url = getModuleURL("http.system.manage.config.layer.insert");
		}
		
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(_pageAction=="update"){
						layui.layer.msg("更新成功");
					}else{
						layui.layer.msg("添加成功");
					}
					if(option.callback){
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
	module.httpGetDataById = function(id){
		let _data = {
			id : id
		};
		_sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : getModuleURL("http.system.manage.config.layer.getById"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					var _d = result.data;
					_d.baselayer = _d.baselayer==true?"0":"1";
					$doc.setElValue(_d);
					$doc.layuiFormRender();
				}else{
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.init = function(){
		$doc = $("#form-add");
//		this.bindEvent();

		layui.use(["form"],function(){
			layui.form.render();
			
			layui.form.on('submit(formSubmit)', function(data){
				_this.httpSubmitForm();
				return false;
			});
			
			_winMain.DICT.httpGetDictList({
				keys : ["lbs_equipment_type"],
				success : function(results){
					_pageAction = xUtilBase.getUrlParam("action");
					if(_pageAction=="update" || _pageAction=="select"){
						let _id = xUtilBase.getUrlParam("id");
						_this.httpGetDataById(_id);
					}
				},
				error : function(){
					layui.layer.msg("获取字典失败");
				}
			});
		});
	}
	
})(jQuery,_pageObject,_pageObject.FORM={});