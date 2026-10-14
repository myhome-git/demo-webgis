/**
 * 通用模块加载
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module;
	
	module.load = function(){
		
		//加载通用工具栏
		$.get("module/window.toolbar/index.html",function(html){
			$doc.append(html);
			parent.WINDOWTOOLBAR.init();
		});
		
	}
	
	module.init = function(){
		$doc = $("#x-view-content");
		this.load();
	}
	
})(jQuery,_pageObject,_pageObject.LOADMODULE={});