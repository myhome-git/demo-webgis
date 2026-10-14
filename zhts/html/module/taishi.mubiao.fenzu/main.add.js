var _FunctionObject = _FunctionObject || {};
var _pageObject = _FunctionObject;
var _iframeMain;

/**
 * form表单
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,_pageAction;
	let _winMain = getModuleWindowPageObjectByName("system.main");
	
	module.getDoc = function(){
		return $doc;
	}
	
	/**
	 * 提交表单数据
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url = getModuleURL("http.zhts.ssts.mubiaofenzu.add");
			
		$.extend(true, _data, $doc.getFormValue());
		if(_data["pId"].length<1){
			layui.layer.msg("pId不能为空");
			return;
		}
		_data.mbs = _FunctionObject.FENZUGUANLI.getLayuiTable().getDataAll();
		if(_data["mbs"].length<1){
			layui.layer.msg("目标数据不能为空");
			return;
		}
		
		let _moduleMain = getModuleWindowPageObjectByName("system.main");
		_data["username"] = _moduleMain.USER_MAIN.getUserInfo()["username"];
		
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					layui.layer.msg("操作成功");
					if(option && option.callback){
						option.callback();
					}
				}else{
					layui.layer.msg(result["message"] || "保存失败");
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
			group_name : id
		};
		_sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiaofenzu.getById"),
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
		$doc = $("#form");
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

//区域管理
(function($,_FunctionObject) {
	
	let _xUtilLayuiTable;
	
	_FunctionObject.getLayuiTable = function(){
		return _xUtilLayuiTable;
	}
	
	$(document).ready(documentReady);
	function documentReady() {
		
		_pageObject.FORM.init();
		
		//基础document
		_FunctionObject.$body = $(".layui-tab-content .layui-tab-item[module-tab-item-name='fenzuguanli']");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		_FunctionObject.$layuiTableSearchData = _FunctionObject.$body.find("#layui-table-search-data-QUYUGUANLI");
		_FunctionObject.$layuiTableTopToolbar = _FunctionObject.$body.find("#layui-table-top-toolbar");
		
		//声明表格对象
		_xUtilLayuiTable = new xUtilLayuiTable();
		
		//复写方法，浏览器缩放时可以动态设置
		_xUtilLayuiTable.GetTableAutoHeight = function(){
			return _FunctionObject.$xHiddenWindow.outerHeight() - _FunctionObject.$layuiTableSearchData.offset().top - 10;
		}
		
		_FunctionObject.InitTable = function(data){
			_xUtilLayuiTable.init({
				elem: "#"+_FunctionObject.$layuiTableSearchData.attr("id"),
				height: _xUtilLayuiTable.GetTableAutoHeight(),	//采用美化版滚动条，不再layui内部进行滚动条
				page : false,
				toolbar : false,
				cols: _layuiTableHeader.data["tableQUYUGUANLI"].header || [],
				data : data || [],
				callback : {
					onToolbar : function(layEvent,checkStatus){
						switch (layEvent){
							case "table-refresh":
								_xUtilLayuiTable.reload();
								break;
							case "table-delete-multiple":
								let _ids = [];
								$.each(checkStatus.data, function(index,el) {
									_ids.push(el.id);
								});
								if(_ids.length<1){
									layui.layer.msg("未选中任何数据");
									return;
								}
								_FunctionObject.httpRemoveTableMultipleById(_ids);
								break;	
							default:
								break;
						}
					},
					onRowTool : function(obj){
						var data = obj.data,
							layEvent = obj.event;
						if(layEvent === 'delete') {
							obj.del();
						}
					},
				}
			});
		}
		
		_FunctionObject.BindSearchInputEvent = function(){
			var _this = this;
			//初始化表单
			layui.use('form', function(){
				_FunctionObject.layuiForm.render();
			});
		}
		
		_FunctionObject.init = function(){
			
			layui.use('form', function(){
				_FunctionObject.layuiForm = layui.form;
			});
			
			_FunctionObject.BindSearchInputEvent();
			layui.use('table', function(){
				_FunctionObject.InitTable(layui.table);
			});
		}
		
	}
})(jQuery,_FunctionObject.FENZUGUANLI = {});


(function($) {
	$(document).ready(documentReady);
	function documentReady() {
		
		//基础document
		_FunctionObject.$body = $("body");
		_FunctionObject.$xHiddenWindow = $("#x-hidden-window");
		_FunctionObject.$layuiSearchInputBox = _FunctionObject.$body.find("#ElementTemplateMainDataSearchINPUT");
		layui.use('element', function(){
			var element = layui.element;
			element.on('tab(docDemoTabBrief)', function(data){
				let $context = $(data.elem.context);
			    switch ($context.attr("module-tab-title-name")){
			    	case "fenzuguanli":
			    		_FunctionObject.FENZUGUANLI.init();
			    		break;
			    	default:
			    		break;
			    }
			});
			
			var _id = xUtilBase.getUrlParam("id");
			$(".layui-tab .layui-tab-title >li[module-tab-title-name='"+_id+"']").trigger("click");
		});
	}
})(jQuery);