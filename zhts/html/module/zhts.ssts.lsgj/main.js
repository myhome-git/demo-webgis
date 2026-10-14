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
	
	
	module.getFormDoc = function(){
		return $doc;
	}
	/**
	 * 提交表单数据
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url;
			
		$.extend(true, _data, $doc.getFormValue());
		_data.action = _pageAction || "add";

		if(_data.action=="update"){
			_url = getModuleURL("http.zhts.ssts.shijianjilu.update");
		}else{
			_url = getModuleURL("http.zhts.ssts.shijianjilu.add");
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
						setTimeout(function(){
							option.callback();
						},1500)
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
			url : getModuleURL("http.zhts.ssts.shijianjilu"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					$doc.setFormValue(result.data);
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
			
			$doc.find("[x-input-name='title']").focus();
			
			_pageAction = xUtilBase.getUrlParam("action");
			if(_pageAction=="update" || _pageAction=="select"){
				let _id = xUtilBase.getUrlParam("id");
				_this.httpGetDataById(_id);
			}
		});
	}
	
})(jQuery,_pageObject,_pageObject.FORM={});