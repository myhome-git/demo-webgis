(function ($,parent,module) {
    module.parent = parent;
	let _this = module,
		$form;
	
	let _moduleMain = getModuleWindowPageObjectByName("system.main");
	let _username = _moduleMain.USER_MAIN.getUserInfo()["username"];
	let _MAPCONTROL;
	
	/**
	 * 获取搜索数据
	 * @param {Object} name
	 */
	module.httpGetSearchInputData = function(value){
//		console.info("准备搜索"+value);
		let $searchListBox = $form.find(".search-list-box"),
			$searchCount = $searchListBox.find("#search-count"),
			$searchList = $searchListBox.find("#search-list");
			
		$searchListBox.addClass("layui-hide");
		$searchList.empty();
		
		let result = {
			data : [],
		};
		
		//转换成小写
		let _valueLowerCase = value.toLowerCase();
		let jsSpecialChars = ["\\", "^", "$", "*", "?", ".", "+", "(", ")", "[","]", "|", "{", "}"];
		for (var i = 0; i < jsSpecialChars.length; i++) {
	        _valueLowerCase = _valueLowerCase.replace(new RegExp("\\"
	                + jsSpecialChars[i], "g"), "\\"
	                + jsSpecialChars[i]);
		}
		
		_regExp = new RegExp(_valueLowerCase,"i");
		$.each(parent.ZHTS_SSTS_MUBIAO_CONTROL.getLayerFeaturesMB(), function(index,el) {
			let _name = el.get("__name"),
				_cache = el.get("__cache"),
				_id = el.get("id") || el.id_;
			if(_regExp.test(_name) || _regExp.test(_cache.mbflmc)){
				
				if(!/(\[|\])/g.test(_name) && _cache.jxh){
					_name += "["+_cache.jxh+"]";
				}
				
				result.data.push({
					index : _name.toLowerCase().indexOf(_valueLowerCase),
					id : _id,
					name : _name+(_cache.mbflmc?"（"+_cache.mbflmc+"）":""),
					dw : el.get("__dw"),
					cache : _cache
				});
			}
		});
		
		$searchListBox.removeClass("layui-hide");
		$searchCount.html("检索到 [ <font style='color:red'>"+result.data.length+"</font> ] 条数据！");
		if(result.data.length<1){
			return;
		}
		
		result.data = WebLoader.sort(result.data,"index");
		
		let _html;
		$.each(result.data, function(index,el) {
			let $li = $("<li class='search-bean x-clearfix'></li>");
			_html = [];
			_html.push(el.name.replace(_regExp,"<font style='color:red'>"+(el.name.match(_regExp).toString())+"</font>"));
//			_html.push("（"+el.id.replace(new RegExp(_regExp,"i"),"<font style='color:red'>"+name+"</font>")+"）");
			_html.push("<button class='layui-btn layui-btn-xs'>加入分组</button>");
			$li.html(_html.join(""));
			$li.data("__cache",el);
			$li.on("click",function(){
				event.stopPropagation();
				let $this = $(this),
					_data = $this.data("__cache");
				$form.setFormValue({
					mbbm : _data.id,
					searchValue : _data.name
				});
				$searchListBox.addClass("layui-hide");
				
				//控制目标
				_MAPCONTROL.setFeaturePositionAnimateById(_data.id);
			});
			
			let $btn = $li.find(".layui-btn");
			$btn.on("click",function(){
				event.stopPropagation();
				let $this = $(this),
					_data = $this.parent().data("__cache");
				
				top.PAGEOBJECT.OPENWINDOW.openTSFZTREE({
					data : _data,
					btn: ['保存', '取消'],
	                yes: function (index) {
	                	//判断是否选中
	                	let _moduleURLtrre = "module.taishi.mubiao.fenzu.tree";
	                		_moduleTree = getModuleWindowPageObjectByName(_moduleURLtrre);
	                	
	                	let _selectNdoes = _moduleTree.TREE.getSelectedNodes();
	                	if(_selectNdoes.length<1){
	                		layui.layer.msg("未选中分组");
	                		return false;
	                	}
	                	
	                	let _opData = {
	                		username : _username,
	                		pId : _selectNdoes[0].id,
	                		mbs : [
	                			{
	                				mbbh : _data.cache.mbbh,
			                		mbmc : _data.cache.mbmc,
			                		mbjxh : _data.cache.mbjxh,
			                		mbph : _data.cache.mbph,
	                			}
	                		]
	                	};

	                	_this.httpSubmitForm({
	                		data : _opData,
	                		callback : function(){
	                			_moduleMain.ZHTS_SSTS_TREE_GROUP.httpGetMBGroupList();
		                		layui.layer.close(index);
		                	}
	                	});
	                },
				});
				
				$searchListBox.addClass("layui-hide");
			});
			$searchList.append($li);
		});
	}
	
	/**
	 * 提交表单数据
	 */
	module.httpSubmitForm = function(option){
		
		let _data = {},
			_url = getModuleURL("http.zhts.ssts.mubiaofenzu.add");
		
		$.extend(true, _data, option.data);
		if(_data["pId"].length<1){
			layui.layer.msg("pId不能为空");
			return;
		}
		if(_data["mbs"].length<1){
			layui.layer.msg("目标数据不能为空");
			return;
		}
		
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
	 * 绑定事件
	 */
	module.bindEvent = function(){
		let $input0 = $form.find("input[x-input-name='searchValue']"),
			$searchListBox = $form.find(".search-list-box"),
			$searchList = $form.find("#search-list"),
			$searchCount = $form.find("#search-count"),
			$searchBtn = $form.find("#ButtonSearchAll"),
			_keyupClock;
		$input0.on("keyup input",function(event){
			event.stopPropagation();
			_keyupClock = event.timeStamp,
				$this = $(this),
				_value = $this.val();
			
			if(!_value){
				$searchListBox.addClass("layui-hide");
				$searchCount.empty().html("请在上方输入目标名称进行检索！");
				return false;
			}
			
			if(event.keyCode==13){
				_this.httpGetSearchInputData(_value);
				return;
			}
			
			setTimeout(function(){
	            if(_keyupClock-event.timeStamp==0){
	            	$this.data("__value",_value);
	            	_this.httpGetSearchInputData(_value);
	            }
			},500);
		});
		
		$input0.on("click",function(event){
			event.stopPropagation();
			let $this = $(this),
				_value = $this.val();
			if(!_value){
				return false;
			}
//			$this.select();
			$searchListBox.removeClass("layui-hide");
		});
		
		$searchBtn.on("click",function(event){
			event.stopPropagation();
			_this.httpGetSearchInputData($input0.val());
		});
		
		$searchListBox.on("click",function(event){
			event.stopPropagation();
		});
		
		$(document).on("click",function(){
			$searchListBox.addClass("layui-hide");
		});
		
	}
	
	module.init = function(){
		_MAPCONTROL = PAGEOBJECT.MAPCONTROL;
		
		$form = $("#window-search");
		this.bindEvent();
	}
	
})(jQuery,_pageObject,_pageObject.SEARCH={});