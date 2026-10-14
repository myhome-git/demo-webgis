/**
 * 系统配置
 */
var SYSTEM = {
	PROBJECT_PATH : "/zhts",
	PROBJECT_NAME_EN : "zhts"
};

/**
 * 工程最新调用方法
 */
function getProbjectPath(){
	return SYSTEM.PROBJECT_PATH;
}

/**
 * 取工程路径，为了兼容电子围栏旧版本代码
 */
function GetPROBJECT_PATH(){
	return  "/data-server";
}

/**
 * WebLoader系统配置
 */
var WebLoader = WebLoader||{};
WebLoader.Config = {
	PROBJECT_PATH : "//cdn1.myhome.top/WebLoader",
	VERSION : "0.1",
	DEBUG : true,
	LOADDING : function(_url,localhost){
		if(!this.DEBUG){
			_url += "?"+new Date().getTime();
		}
		if(localhost){
			document.writeln("<script type=\"text/javascript\" src='" +_url+"'><\/script>");
		}else{
			document.writeln("<script type=\"text/javascript\" src='"+ this.PROBJECT_PATH +_url+"'><\/script>");
		}
	}
};

WebLoader.getImageURL = function(id){
	let _url = getModuleURL("system.guojia.image.getById");
	return _url.replace(/\{\d+\}/g,id.toString());
}

/**
 * 默认加载，请勿删除
 */
WebLoader.Config.LOADDING("/web.loader.js");
WebLoader.Config.LOADDING("/web.loader.resource.js");
WebLoader.Config.LOADDING("/web.loader.event.key.js");
WebLoader.Config.LOADDING(getProbjectPath()+"/web.loader.default.js",true);
WebLoader.Config.LOADDING(getProbjectPath()+"/html/plus/xUtil.layui.layer.js",true);
