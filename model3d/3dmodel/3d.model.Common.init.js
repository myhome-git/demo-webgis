//系统配置
window.Common = {
	Config : {
		//服务器协议、域名(或IP)、端口号
		PROBJECT_IP : "",
		PROBJECT_NAME : "",
		PROBJECT_NAME_ANOHTER : "",
		PROBJECT_PATH : "/model3d/3dmodel",
		PROBJECT_VERSION : "1.1",
		COMPANY_NAME : "",
		COMPANY_ADDRESS : "",
		COMPANY_EMAIL : "",
		COMPANY_TELEPHONE : "",
		COMPANY_WEBSITE : ""
	},
	CDN : {
		//cdn模式，用来分解服务器静态资源压力
		PROBJECT_IP : "",
		PROBJECT_NAME : "静态资源调用系统",
		PROBJECT_PATH : "//cdn1.myhome.top/WebFrame"
	},
	//这个配置决定了静态资源模式，CDN和Config
	ServerModel : "CDN"
};

//默认加载
document.writeln("<script src='"+window.Common.CDN.PROBJECT_IP + window.Common.CDN.PROBJECT_PATH +"/Common.Config.js?"+new Date().getTime()+"'><\/script>");
