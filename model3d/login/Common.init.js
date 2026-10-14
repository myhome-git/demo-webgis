//系统配置
window.Common = {
	Config : {
		//服务器协议、域名(或IP)、端口号
		PROBJECT_IP : "",
		PROBJECT_NAME : "时空位置服务系统",
		PROBJECT_NAME_ANOHTER : "",
		PROBJECT_PATH : "/model3d/3dmodel",
		COMPANY_NAME : "北京博阳世通技术有限公司",
		COMPANY_ADDRESS : "北京市海淀区1号院26号楼领智中心B座8层(公司总部)",
		COMPANY_EMAIL : "support@beyondb.com.cn",
		COMPANY_TELEPHONE : "010-82306380",
		COMPANY_WEBSITE : "www.beyondb.com.cn"
	},
	CDN : {
		//cdn模式，用来分解服务器静态资源压力
		PROBJECT_IP : "",
		PROBJECT_NAME : "静态资源调用系统",
		PROBJECT_PATH : "/WebFrame"
	},
	//这个配置决定了静态资源模式，CDN和Config
	ServerModel : "CDN",
	//DEBUG
	ModelType : "DEBUG"
};

//默认加载
document.writeln("<script src='"+window.Common.CDN.PROBJECT_IP + window.Common.CDN.PROBJECT_PATH +"/Common.Config.js?"+new Date().getTime()+"'><\/script>");
document.writeln("<script src='"+window.Common.Config.PROBJECT_IP+window.Common.Config.PROBJECT_PATH+"/Common.DefaultLoad.js?"+new Date().getTime()+"'><\/script>");