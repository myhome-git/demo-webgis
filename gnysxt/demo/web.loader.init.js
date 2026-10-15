//系统配置
var WebLoader = WebLoader||{};

WebLoader.Config = {
	PROBJECT_NAME : "静态资源调用",
	PROBJECT_PATH : "//cdn1.myhome.top/WebLoader",
	VERSION : "0.1",
	LOADING : function(_url,localhost){
		if(!localhost){
			document.writeln("<script src='"+ this.PROBJECT_PATH +_url+"?v="+this.VERSION+"'><\/script>");
		}else{
			document.writeln("<script src='"+_url+"?v="+this.VERSION+"'><\/script>");
		}
	}
};

//默认加载，请勿删除
WebLoader.Config.LOADING("/web.loader.js");
WebLoader.Config.LOADING("/web.loader.resource.js");
WebLoader.Config.LOADING("/gnysxt/demo/web.loader.default.js",true);
WebLoader.Config.LOADING("/gnysxt/demo/web.system.config.js",true);
