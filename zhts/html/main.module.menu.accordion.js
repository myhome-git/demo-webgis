//手风琴
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module;
	
	/**
	 * 显示
	 */
	module.show = function(){
		$doc.show();
	}
	
	/**
	 * 隐藏
	 */
	module.hide = function(){
		$doc.hide();
	}
	
	/**
	 * 创建
	 */
	module.create = function(){
		//初始化数据
		var datalist = [{
			"id" : "zhts",
			"icon" : "fa fa-list-ul",
			"text" : "综合态势",
		}];
		
		if(parent.USER_CONTROL.checkUserControl("zhts:zzzy:wuqi")){
			datalist.push({
				"id" : "gjwq",
				"icon" : "fa fa-bolt",
				"text" : "&nbsp;作战资源",
			});
		}
		
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:tshf-123456")){
			datalist.push({
				"id" : "fpts",
				"icon" : "fa fa-history",
				"text" : "态势回放",
			});
		}
			
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:wxgl")){
			datalist.push({
				"id" : "tqts",
				"icon" : "fa fa-fire",
				"text" : "天情态势",
			});
		}
		
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:tcgl")){
			datalist.push({
				"id" : "tckz",
				"icon" : "fa fa-map",
				"text" : "图层控制",
			});
		}
		
		var panel = $("<div class='my-accordion-panel'></div>");
		$doc.append(panel);
		panel.xAccordionMenu({
			skin : "skin-black-accordion",
//			titleIcon : "fa fa-list-ul",
			chlidrenOpenIcon : "fa fa-minus-circle",
			chlidrenCloseIcon : "fa fa-plus-circle",
			datalist : datalist
		});
		
		//添加点击效果
		panel.find(".x-accordion-panel .x-accordion-title").addClickEffect();
		
		var _btn_shrink = $doc.find(".x-button-shrink");
		_btn_shrink.unbind().on("click", function () {
			if ($doc.hasClass("panel-shrink")) {
				_this.open();
			} else {
				_this.close();
			}
			return false;
		});
		
		//综合态势
		let $zhts = panel.getElementContentById("zhts");
		let _html = template("TemplateWindowZHTS", {});
		$zhts.html(_html);
		$zhts.css({"padding":"0"});
		
		//态势回放
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:tshf-123456")){
			let $fptsItem = panel.getElementContentById("fpts");
			_html = template("TemplateWindowFPTSTAB", {});
			$fptsItem.html(_html);
			$fptsItem.attr("lay-filter","test1").css({"padding":"0"});
			layui.use(["form"],function(){
				layui.form.render();
			});
		}
		
		//攻击武器
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:gjwq")){
			let $gjwq = panel.getElementContentById("gjwq");
			_html = template("TemplateWindowGJWQ", {});
			$gjwq.html(_html);
			$gjwq.css({"padding":"0"});
		}
		
		//天情态势
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:wxgl")){
			let $tckz = panel.getElementContentById("tqts");
			_html = template("TemplateWindowTQTS", {});
			$tckz.html(_html);
		}
		
		//图层控制
		if(parent.USER_CONTROL.checkUserControl("zhts:jcsz:tcgl")){
			let $tqts = panel.getElementContentById("tckz");
			_html = template("TemplateWindowTCKZ", {});
			$tqts.html(_html);
		}
//		var layerManager = new LayerManager(parent.MAP.getBeyonMap(), { tree_id: "tree2d_baseMap" });
	}
	
	/**
	 * 打开
	 */
	module.open = function(){
		$doc.removeClass("panel-shrink");
		var _btn_shrink = $doc.find(".x-button-shrink");
		_btn_shrink.find(".iconfont").removeClass("fa-angle-double-left").addClass("fa-angle-double-right");
	}
	
	/**
	 * 关闭
	 */
	module.close = function(){
		$doc.addClass("panel-shrink");
		var _btn_shrink = $doc.find(".x-button-shrink");
		_btn_shrink.find(".iconfont").removeClass("fa-angle-double-right").addClass("fa-angle-double-left");
	}
	
	module.init = function(){
		$doc = $("#window-accordion-panel");
		this.create();
	}
	
})(jQuery,_pageObject,_pageObject.MENUACCORDION={});