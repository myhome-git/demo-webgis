window.XYDCONFIG = {
	PROBJECT_LOCATION : "",		//服务器协议、域名(或IP)、端口号
	PROBJECT_NAME : "shandongweidai",						//工程名
	PROBJECT_PATH : "/shandongweidai/main-page",						//工程路径
	PROBJECT_NAMECHINA : "小雨点WEB框架设计",		//工程别名
	PROBJECT_VERSIONS : "2.0",					//版本
};

window.pageObject = {
	response : {
		htmlHead : function(){
			var head = ""
				+ "<!--[if IE 6 ]><html lang=\"en\" class=\"ie6\"><![endif]-->"
				+ "<!--[if IE 7 ]><html lang=\"en\" class=\"ie7\"><![endif]-->"
				+ "<!--[if IE 8 ]><html lang=\"en\" class=\"ie8\"><![endif]-->"
				+ "<!--[if IE 9 ]><html lang=\"en\" class=\"ie9\"><![endif]-->"
				+ "<!--[if IE 10 ]><html lang=\"en\" class=\"ie10\"><![endif]-->"
				+ "<!--[if IE 11 ]><html lang=\"en\" class=\"ie11\"><![endif]-->"
				+ "<!--[if !IE]><!-->"
				+ "<html lang=\"en\" class=\"noIE\">"
				+ "<!--<![endif]-->";
			document.write(head);
		},
		css : function(name){
			/**
			 * http
			 */
			var cssArray = {
				iconlogo : ["/page/images/logo.ico","shortcut icon"],
				iconfont : ["/webFrame/iconfont/iconfont.css","stylesheet"],
				common : ["/css/common.css","stylesheet"],
				xydStyleBlue : ["/page/css/xyd-style-blue.css","stylesheet"],
				easyui : ["/webFrame/jquery-easyui-1.5.2/themes/black/easyui.css","stylesheet"],
				layer : ["/webFrame/layer-v.0.3/skin/default/layer.css","stylesheet"],
				bootstrap335 : ["/webFrame/bootstrap-3.3.5/css/bootstrap.min.css","stylesheet"],
				animate : ["/css/animate.css","stylesheet"]
			};
			
			if(cssArray[name]){
				var url = cssArray[name][2]!="http" ? window.XYDCONFIG["PROBJECT_PATH"] + cssArray[name][0] : cssArray[name][0];
				var type = cssArray[name][1];
				var cssPath = "<link href=\""+url+"?TIME="+new Date().getTime()+"\" rel=\""+type+"\" />";
				document.write(cssPath);
			}
			
		},
		javascript : function(name){
			var jsArray = {
				//JQuery
				//jquery183 : [window.jQuery ? "" : "https://libs.baidu.com/jquery/1.8.3/jquery.min.js","http"],
				jquery183 : [window.jQuery ? "" : "/js/jquery-1.8.3.js"],
				jquery191 : [window.jQuery ? "" : "/js/jquery-1.9.1.min.js"],
				//ie8 bug
				json2 : ["/js/json2.js"],
				//ie8
				html5shiv : ["/js/html5shiv.js"],
				//ie8
				ieCss3MediaQuery : ["/js/respond.js"],
				//ie8
				placeholder : ["/js/jquery.placeholder.js"],
				//unslider
				unslider : ["/webFrame/unslider-150203225543/unslider.min.js"],
				//md5
				md5 : ["/js/md5.js"],
				//easyui
				easyui : ["/webFrame/jquery-easyui-1.5.2/jquery.easyui.min.js"],
				//layer
				layer : ["/webFrame/layer-v.0.3/layer.js"],
				//xydPlus
				xydPlus : ["/js/xyd.plus.js"],
				//xydPlus-in
				xydPlusIn : ["/js/xyd.plus.in.js"],
				//template
				artTemplate : ["/js/artTemplate.js"],
				//xyd-table
				xydTable : ["/js/xyd.table.js"],
				//xyd-xydWebFunction
				xydWebFunction : ["/include/xyd.webFunction.js"],
				//xyd-menu-template
				xydMenuTemplate : ["/include/xyd.menu.template.js"],
				//xyd-menu-template
				xydPjax : ["/js/xyd.pjax.js"],
				//bootstrap335
				bootstrap335 : ["/webFrame/bootstrap-3.3.5/js/bootstrap.min.js"],
				//nicescroll
				nicescroll : ["/webFrame/jquery.nicescroll-3.7.6/jquery.nicescroll.min.js"],
				//ZeroClipboard
				ZeroClipboard : ["/webFrame/ZeroClipboard/ZeroClipboard.min.js"],
				//WdatePicker
				WdatePicker : ["/webFrame/DatePicker/WdatePicker.js"]
			};

			if(jsArray[name]){
				var data = jsArray[name],p;
				if(data.length<1){
					return undefined;
				}else if(data.length==1){
					p = window.XYDCONFIG["PROBJECT_PATH"]+data[0];
				}else if(data.length==2){
					p = data[0];
				}
				
				var jsPath = "<script src=\""+p+"\"><\/script>";
				document.write(jsPath);				
			}else{
				throw new Error("js nonexistence error");
			}
		},
		swf : function(name){
			var _array = {
				//ZeroClipboardSwf
				ZeroClipboardSwf : "/webFrame/ZeroClipboard/ZeroClipboard.swf"
			};
			return window.XYDCONFIG["PROBJECT_PATH"]+_array[name];
		}
	},
	setLocalStorage : function(object){
		if(!localStorage) return null;
		try{
			localStorage.setItem(window.XYDCONFIG.PROBJECT_NAME,JSON.stringify(object));
		}catch(e){
			throw new Error(e.message);
		}	
		return true;
	},
	getLocalStorage : function(){
		if(!localStorage) return null;
		try{
			var _a;	
			try{
				_a = JSON.parse(localStorage.getItem(window.XYDCONFIG.PROBJECT_NAME));
				if(_a==null){_a= {};}
			}catch(e){
				_a= {};
				localStorage.setItem(window.XYDCONFIG.PROBJECT_NAME,JSON.stringify(_a));
			}
			return _a;
		}catch(e){
			throw new Error(e.message);
		}
	},
	clearLocalStorage : function(){
		localStorage.setItem(window.XYDCONFIG.PROBJECT_NAME,JSON.stringify({}));
	},
	setHTMLTitle : function(name){
		document.title =  name || window.XYDCONFIG.PROBJECT_NAMECHINA;
	}
};

window.pageResponse = function(type,name){
	switch (type){
		case "css":
			window.pageObject.response.css(name);
			break;
		case "javascript":
			window.pageObject.response.javascript(name);
			break;
		case "html":
			window.pageObject.response.htmlHead();
			break;
		case "swf":
			window.pageObject.response.swf(name);
			break;
		default:
			break;
	}
}

window.pageResponseie8service = function(){
	pageResponse("javascript","json2");
	pageResponse("javascript","html5shiv");
	pageResponse("javascript","ieCss3MediaQuery");
	window.jQuery || pageResponse("javascript","jquery183");
	pageResponse("javascript","placeholder");
}

pageResponse("html");

(function(){
	//平台、设备和操作系统  
	var system ={  
		win : false,  
		mac : false,  
		xll : false  
	};  
	//检测平台  
	var p = navigator.platform;
	system.win = p.indexOf("Win") == 0;  
	system.mac = p.indexOf("Mac") == 0;  
	system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
	if(system.win||system.mac||system.xll){  
		//window.location.href="http://www.sdjnrcb.com/";
	}else{
		//window.location.protocol //http:(带冒号)
		window.location.href="http://m.sdjnrcb.com/";
	}
})();


var _hmt = _hmt || [];
(function() { 
	var hm = document.createElement("script");
	hm.src = "https://hm.baidu.com/hm.js?85a70c54338d88952afe68d1adb6e07f"; 
	var s = document.getElementsByTagName("script")[0]; 
	s.parentNode.insertBefore(hm, s); 
})();
