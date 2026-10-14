var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

//入口
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.IFRAME_MAIN = getModuleWindowPageObjectByName("system.main");
		parent.SET.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

//set
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	let $doc,_moduleMain,_moduleSSTS,_moduleSSTS_TREE,_moduleControl;
	let $layuiSlider0,$layuiSlider1;
	
		/**
	 * 绑定事件
	 */
	module.bindEvent = function(){
		$(".temp444444444444 > .gjsz-title").on("click", function () {
			var _this = $(this);
			var _p = _this.parent();
			var _index = 0;
			_p.find(".gjsz-content").hide();
			_p.find(".gjsz-content:eq(" + _this.attr("value") + ")").show();
			_p.find(".gjsz-title").removeClass("this-show");
			_p.find(".gjsz-title:eq(" + _this.attr("value") + ")").addClass("this-show");
		});
		
		//getFormButton("")
		$doc.bindFormButtonClick(function(value,$this){
			switch (value){
				case "xiaoshi_kongzhong":
					(function(){
						let $input = $doc.getFormInput(value),
							_v = $input.val();
						_moduleControl.setLayerFeatureHide("kongzhong",_v);
					})();
					break;
				case "xiaoshi_shuimian":
					(function(){
						let $input = $doc.getFormInput(value),
							_v = $input.val();
						_moduleControl.setLayerFeatureHide("shuimian",_v);
					})();
					break;
					case "xiaoshi_ludi":
					(function(){
						let $input = $doc.getFormInput(value),
							_v = $input.val();
						_moduleControl.setLayerFeatureHide("ludi",_v);
					})();
					break;
				default:
					break;
			}
		});
		
		//通用设置
		layui.form.on("checkbox(zhts_jslx)",function(data){
			_moduleControl.clearLayers();
			let _nodes = _moduleSSTS_TREE.getTreeObj().getNodes();
			for(let i=_nodes.length;i>-1;i--){
				_moduleSSTS_TREE.getTreeObj().removeNode(_nodes[i]);
			}
			if(data.othis.prev().prop("checked")){
				_moduleSSTS.addSocketQueue(data.value);
			}else{
				_moduleSSTS.removeSocketQueue(data.value);
			}
		});
		layui.form.on("checkbox(mubiaoshow-diwoshuxing)",function(data){
			_moduleControl.setLayerFeatureShowDW(data.value,data.othis.prev().prop("checked"));
		});
		layui.form.on("checkbox(mubiaoleibie)",function(data){
			_moduleControl.setLayerFeatureShowMBLB(data.value,data.othis.prev().prop("checked"));
		});
		layui.form.on("checkbox(junminshuxing)",function(data){
			_moduleControl.setLayerFeatureShowJMSX(data.value,data.othis.prev().prop("checked"));
		});
		layui.form.on("radio(zhts-bpsz)",function(data){
			if(data.value==="false"){
				_moduleControl.setLayerFeatureLabelsShow(false);
			}else if(data.value==="true"){
				_moduleControl.setLayerFeatureLabelsShow(true);
			}
		});
		layui.form.on("radio(zhts_mbdx)",function(data){
			_moduleControl.setLayerFeatureSize(data.value);
		});
		
		//敌方设置
		layui.form.on("radio(difang_zhts_hjleibie)",function(data){
			_moduleControl.setLayerHJLEIBIE("difang",data.value);
		});
		
		layui.form.on("radio(difang_zhts_hjleixing)",function(data){
			$("#point_df_countInpt").val(Number(data.value)||"显示全部");
			_moduleControl.setLayerHJLEIXING("difang",data.value);
		});
		
		layui.form.on("radio(difang_zhts_hjyanse)",function(data){
			_moduleControl.setLayerHJLineColor("difang",data.value);
		});
		
		layui.form.on("radio(difang_zhts_mbzihaodaxiao)",function(data){
			_moduleControl.setLayerFeatureFontSize("difang",data.value);
		});
		
		//我方设置
		layui.form.on("radio(wofang_zhts_hjleibie)",function(data){
			_moduleControl.setLayerHJLEIBIE("wofang",data.value);
		});
		
		layui.form.on("radio(wofang_zhts_hjleixing)",function(data){
			$("#point_wf_countInpt").val(Number(data.value)||"显示全部");
			_moduleControl.setLayerHJLEIXING("wofang",data.value);
		});
		
		layui.form.on("radio(wofang_zhts_hjyanse)",function(data){
			_moduleControl.setLayerHJLineColor("wofang",data.value);
		});
		
		layui.form.on("radio(wofang_zhts_mbzihaodaxiao)",function(data){
			_moduleControl.setLayerFeatureFontSize("wofang",data.value);
		});
		
		this.setConfigValue(_SSTS_DEFAULT);
	}
	/**
	 * 反显设置
	 */
	module.setConfigValue = function(option){
//		let $item0 = $doc.find(".layui-tab-content .layui-tab-item:eq(0)");
//		$item0.find("input").prop("checked",false);
//		$.each(option.QUEUE_MQ, function(index,el) {
//			$item0.find("input[value='"+el+"']").prop("checked",true)
//		});
		
		let $item1 = $doc.find(".layui-tab-content .layui-tab-item:eq(1)");
		$item1.find("input").prop("checked",false);
		$.each(option.MUBIAOSHOW.DIWOSHUXING, function(key,value) {
			let $input = $item1.find("input[lay-filter='mubiaoshow-diwoshuxing'][value='"+key.toString().toLowerCase()+"']");
			$input.prop("checked",value);
		});
		$.each(option.MUBIAOSHOW.MUBIAOLEIBIE, function(key,value) {
			let $input = $item1.find("input[lay-filter='mubiaoleibie'][value='"+key.toString().toLowerCase()+"']");
			$input.prop("checked",value);
		});
		$.each(option.MUBIAOSHOW.JUNMINSHUXING, function(key,value) {
			let $input = $item1.find("input[lay-filter='junminshuxing'][value='"+key.toString().toLowerCase()+"']");
			$input.prop("checked",value);
		});
		$item1.find("input[lay-filter='zhts-bpsz'][value='"+option.MUBIAOSHOW.BIAOPAISHEZHI.toString().toLowerCase()+"']")
			.prop("checked",true);
		$item1.find("input[lay-filter='zhts_mbdx'][value='"+option.MUBIAOSHOW.MUBIAODAXIAO.toString().toLowerCase()+"']")
			.prop("checked",true);
		
		let $item2 = $doc.find(".layui-tab-content .layui-tab-item:eq(2)");
		$item2.find("input").prop("checked",false);
		let $difang = $item2.find(".gjsz-content.difang");
		$difang.find("input[lay-filter='difang_zhts_hjleibie'][value='"+option.GUIJI.DIFANG.HANGJILEIBIE.toString()+"']")
			.prop("checked",true);
		$difang.find("input[lay-filter='difang_zhts_hjleixing'][value='"+option.GUIJI.DIFANG.HANGJILEIXING.toString()+"']")
			.prop("checked",true).attr("checked","true");
		$difang.find("input[lay-filter='difang_zhts_hjyanse'][value='"+option.GUIJI.DIFANG.HANGJIYANSE.toString()+"']")
			.prop("checked",true);
		$difang.find("input[lay-filter='difang_zhts_mbzihaodaxiao'][value='"+option.GUIJI.DIFANG.ZIHAODAXIAO.toString()+"']")
			.prop("checked",true);
		$difang.find("#point_df_countInpt")
			.val(Number(option.GUIJI.DIFANG.HANGJILEIXING)||"显示全部");
		
		let $wofang = $item2.find(".gjsz-content.wofang");
		$wofang.find("input[lay-filter='wofang_zhts_hjleibie'][value='"+option.GUIJI.WOFANG.HANGJILEIBIE.toString()+"']")
			.prop("checked",true);
		$wofang.find("input[lay-filter='wofang_zhts_hjleixing'][value='"+option.GUIJI.WOFANG.HANGJILEIXING.toString()+"']")
			.prop("checked",true);
		$wofang.find("input[lay-filter='wofang_zhts_hjyanse'][value='"+option.GUIJI.WOFANG.HANGJIYANSE.toString()+"']")
			.prop("checked",true);
		$wofang.find("input[lay-filter='wofang_zhts_mbzihaodaxiao'][value='"+option.GUIJI.WOFANG.ZIHAODAXIAO.toString()+"']")
			.prop("checked",true);
		$wofang.find("#point_df_countInpt")
			.val(Number(option.GUIJI.WOFANG.HANGJILEIXING)||"显示全部");
		
		//消失设置
		let $item3 = $doc.find(".layui-tab-content .layui-tab-item:eq(3)");
		if(option.XIAOSHI){
			$item3.setFormValue({
				"xiaoshi_kongzhong" : option.XIAOSHI.KONGZHONG,
				"xiaoshi_shuimian" : option.XIAOSHI.SHUIMIAN,
				"xiaoshi_ludi" : option.XIAOSHI.LUDI,
			});
		}
		
		layui.form.render();
	}
	
	module.init = function(){
		_moduleMain = getModuleWindowPageObjectByName("system.main");
		_moduleControl = _moduleMain.ZHTS_SSTS_MUBIAO_CONTROL,
			_SSTS_DEFAULT = _moduleControl.getSSTSDefault();
		if(!_moduleControl.getIsQueryServerConfig()){
			layui.layer.msg("还未获取服务器配置信息，请稍后再试");
			return false;
		}
		
		_moduleSSTS = _moduleMain.ZHTS_SSTS,
		_moduleSSTS_TREE = _moduleMain.ZHTS_SSTS_TREE;
		
		$doc = $("#window-tstc-tabs");
		
		layui.use(["form","slider"],function(){
			layui.form.render();
			
			//渲染,绑定元素
			let _changeClock0;
			$layuiSlider0 = layui.slider.render({
				elem: '#slide_difang',
				type: "default",
				min　: 1,
				max: 5,
				//range : true,
				value: _SSTS_DEFAULT.GUIJI.DIFANG.HANGJICUXI,
				step: 1,
				showstep: true,
				change: function (value) {
					_changeClock0 = new Date().getTime();
					setTimeout(function(){
						if(new Date().getTime()-_changeClock0>=1000){
							console.info("执行保存动作");
							_moduleControl.setLayerHJLineWidth("difang",value);
						}
					},1000);
				}
			});

			//绑定元素
			let _changeClock1;
			$layuiSlider1 = layui.slider.render({
				elem: '#slide_wofang',
				type: "default",
				min　: 1,
				max: 5,
				//range : true,
				value: _SSTS_DEFAULT.GUIJI.WOFANG.HANGJICUXI,
				step: 1,
				showstep: true,
				change: function (value) {
					_changeClock0 = new Date().getTime();
					setTimeout(function(){
						if(new Date().getTime()-_changeClock0>=1000){
							console.info("执行保存动作");
							_moduleControl.setLayerHJLineWidth("wofang",value);
						}
					},1000);
				}
			});
			_this.bindEvent();
		});
	}
	
})(jQuery,_pageObject,_pageObject.SET={});