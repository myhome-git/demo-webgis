//取对象类型
function typeOf(object){
	var s = Object.prototype.toString.call(object).toLocaleLowerCase();
	return s.replace(/(^\[object\s*)(.*)(\]$)/,"$2");
}
//重置对象指针
function resetThis(_this,object){
	return _this = object;
}

window.formatArguments = function(arrayArguments){
	var params = {};
	for(var i=0;i<arrayArguments.length;i++){
		var d = arrayArguments[i],
			name = typeOf(d);
			if(params[name]===undefined){
				params[name] = d;
			}else{
				var y = 0;
				while(params[name+y]!=undefined){
					y += 1;
				}
				params[name+y] = d;
			}
	}
	return params;
};
window.ResponseHtmlHead = function(){
	var head = ""
		+ "<!--[if IE 6 ]><html lang=\"cn\" class=\"ie6\"><![endif]-->"
		+ "<!--[if IE 7 ]><html lang=\"cn\" class=\"ie7\"><![endif]-->"
		+ "<!--[if IE 8 ]><html lang=\"cn\" class=\"ie8\"><![endif]-->"
		+ "<!--[if IE 9 ]><html lang=\"cn\" class=\"ie9\"><![endif]-->"
		+ "<!--[if IE 10 ]><html lang=\"cn\" class=\"ie10\"><![endif]-->"
		+ "<!--[if IE 11 ]><html lang=\"cn\" class=\"ie11\"><![endif]-->"
		+ "<!--[if !IE]><!-->"
		+ "<html lang=\"cn\" class=\"noIE\">"
		+ "<!--<![endif]-->";
	document.write(head);
}

window.Common.ResourcesArray = {
	"ico" : {
		"ico.logo" : ["/page/images/logo.ico"]
	},
	"css" : {
		//"iconfont" : ["/library/iconfont/font_842054_r8klv62efsm/iconfont.css"],
		"iconfont" : ["/library/iconfont/font_1129890_ebyztblc80a/iconfont.css"],
		"common" : ["/library/beyon/css/common.css"],
		
		//layui
		"layui" : ["/library/layui/layui-v2.4.3/css/layui.css"],
		"layui.230" : ["/library/layui/layui-v2.3.0/css/layui.css"],
		"layui.243" : ["/library/layui/layui-v2.4.3/css/layui.css"],
		"layui.245" : ["/library/layui/layui-v2.4.5/dist/css/layui.css"],
		
		//easyui
		"easyui" : ["/library/easyui/jquery-easyui-1.5.2/themes/black/easyui.css"],
		"easyui.1.3.2" : ["/library/easyui/jquery-easyui-1.3.2/themes/default/easyui.css"],
		"easyui.1.7.0" : ["/library/easyui/jquery-easyui-1.7.0/themes/default/easyui.css"],
		
		//bootstrap
		"bootstrap.335" : ["/library/bootstrap-3.3.5/css/bootstrap.min.css"],
		"bootstrap.treeview" : ["/library/bootstrap-treeview/css/bootstrap-treeview.min.css"],
		
		"fontAwesome" : ["/library/font-awesome/font-awesome-4.7.0/css/font-awesome.css"],
		"fontAwesome5" : ["/library/font-awesome/fontawesome-free-5.9.0-web/css/all.min.css"],
		
		"mCustomScrollbar" : ["/library/jquery-mCustom-Scrollbar/jquery.mCustomScrollbar.css"],
		
		//地图类
		"ol" : ["/library/ol/4.6.5/ol.css"],
		"olext" : ["/library/ol/4.6.5/ol-ext-2.0.6/ol-ext.css"],
		"olextent" : ["/library/ol/ol-extent/ol-extent.css"],
		
		"ol.4" : ["/library/ol/4.6.5/ol.css"],
		"olext.4" : ["/library/ol/4.6.5/ol-ext-2.0.6/ol-ext.css"],
		
		//通知插件
		"toastr":["/library/toastr/toastr.min.css"],
		"ztreev3":["/library/zTree_v3/css/zTreeStyle/zTreeStyle.css"],
		
		//图像预览
		"viewer":["/library/imageView/viewer.css"],
		
		//文本编辑
		"mackdown" : ["/library/mackdown/editormd/css/editormd.min.css"],
		
		//自定义工具类
		"x.accordion.menu" : ["/library/beyon/css/x.accordion.menu.css"],
		"x.ztree" : ["/library/bootstrap-ztree-style/bootstrapStyle.css"]
	},
	"js" : {
		//jquery183 : [window.jQuery ? "" : "https://libs.baidu.com/jquery/1.8.3/jquery.min.js","http"],
		"jquery.183" : ["/library/beyon/js/jquery-1.8.3.js"],
		"jquery.191" : ["/library/beyon/js/jquery-1.9.1.min.js"],
		"_cdn.jquery.191" : ["//code.jquery.com/jquery-1.9.1.min.js"],
		
		"jquery.2" : ["/library/beyon/js/jquery-2.0.0.js"],
		//ie8 支持json
		"ie8json2" : ["/library/beyon/js/json2.js"],
		//ie8 支持html5标签
		"ie8html5shiv" : ["/library/beyon/js/html5shiv.js"],
		//ie8 支持html5部分css
		"ie8Css3MediaQuery" : ["/library/beyon/js/respond.js"],
		//ie8 支持焦点
		"ie8placeholder" : ["/library/beyon/js/jquery.placeholder.js"],
		//unslider
		"unslider" : ["/library/unslider-150203225543/unslider.min.js"],
		"md5" : ["/library/beyon/js/md5.js"],
		//滚动条
		"mCustomScrollbar" : ["/library/jquery-mCustom-Scrollbar/jquery.mCustomScrollbar.concat.min.js"],
		//cookie
		"cookie" : ["/library/treeview/lib/jquery.cookie.js"],
		
		//复制组件
		"ZeroClipboard" : ["/library/ZeroClipboard/ZeroClipboard.min.js"],
		
		//WdatePicker，日期
		"WdatePicker" : ["/library/DatePicker/WdatePicker.js"],
		
		//echarts
		"baidu.echarts.4" : ["/library/baidu.echarts/echarts4/echarts.js"],
		
		//easyui
		"easyui" : ["/easyui/library/jquery-easyui-1.5.2/jquery.easyui.min.js"],
		"easyui.1.5.2" : ["/library/easyui/jquery-easyui-1.5.2/jquery.easyui.min.js"],
		"easyui.1.3.2" : ["/library/easyui/jquery-easyui-1.3.2/jquery.easyui.min.js","/library/beyon/js/x.util.easyui.js"],
		"easyui.1.7.0" : ["/library/easyui/jquery-easyui-1.7.0/jquery.easyui.min.js","/library/beyon/js/x.util.easyui.js"],
		
		//bootstrap
		"bootstrap.335" : ["/library/bootstrap-3.3.5/js/bootstrap.min.js"],
		"bootstrap.treeview" : ["/library/bootstrap-treeview/js/bootstrap-treeview.min.js"],
		
		//layui
		"layui" : ["/library/layui/layui-v2.4.3/layui.all.js"],
		"layui.230" : ["/library/layui/layui-v2.3.0/layui.all.js"],
		"layui.243" : ["/library/layui/layui-v2.4.3/layui.all.js"],
		"layui.245" : ["/library/layui/layui-v2.4.5/dist/layui.all.js"],
		
		//图片预览
		"viewer":["/library/imageView/viewer-jquery.js"],
		
		//文本编辑
		"mackdown" : ["/library/mackdown/editormd/editormd.js"],
		
		//消息插件
		"toastr":["/library/toastr/toastr.min.js"],
		
		//GIS
		"ol" : ["/library/ol/4.6.5/ol.js"],
		"olext":["/library/ol/4.6.5/ol-ext-2.0.6/ol-ext.js"],
		
		"ol.4" : ["/library/ol/4.6.5/ol.js"],
		"olext.4":["/library/ol/4.6.5/ol-ext-2.0.6/ol-ext.js"],
		"olextent":["/library/ol/ol-extent/ol-extent.js"],
		
		//自定义工具类
		"x.util.base" : ["/library/beyon/js/x.util.base.js"],
		"x.loading" : ["/library/beyon/js/x.loading.js"],
		"x.plus.in" : ["/library/beyon/js/x.plus.in.js"],
		"x.template" : ["/library/beyon/js/artTemplate.js"],
		"x.table" : ["/library/beyon/x-table/x.table.js"],
		"x.accordion.menu" : ["/library/beyon/js/x.accordion.menu.js"],
		"x.tree.menu" : ["/library/beyon/js/x.tree.menu.js"],
		"x.ztree" : ["/library/zTree_v3/js/jquery.ztree.all.min.js","/library/beyon/js/x.ztree.js"],
		"x.file.upload" : ["/library/plupload-2.1.0/js/plupload.full.min.js","/library/plupload-2.1.0/js/x-plupload-template.js"],
		"x.video" : ["/library/ckplayerX/ckplayer/ckplayer.js"],
		"x.animatelo" : ["/library/animatelo/web-animations.min.js","/library/animatelo/animatelo.min.js"],
		"x.http.download" : ["/library/beyon/js/x.http.download.js"],
		"x.util.dragDiv" : ["/library/beyon/js/Tdrag.js","/library/beyon/js/x.util.dragDiv.js"],
		"x.util.window.message" : ["/library/beyon/js/x.util.window.message.js"],
		"x.util.layui.table" : ["/library/beyon/js/x.util.layui.table.js"]
	},
	"flash" : {
		"ZeroClipboardSwf" : "/library/ZeroClipboard/ZeroClipboard.swf"
	}
};

//logo.ico
window.ResponseIco = function(name){
	var _array = window.Common.ResourcesArray["ico"];
	if(_array[name]){
		var o = window.Common[window.Common.ServerModel];
		var url = o.PROBJECT_IP + o.PROBJECT_PATH + _array[name] + "?" + new Date().getTime();
		var html = "<link href=\""+url+"\" rel=\"shortcut icon\" />";
		document.write(html);
	}
}
//css
window.ResponseCSS = function(name){
	var _array = window.Common.ResourcesArray["css"];
	var src,
		timeStamp = window.Common.ModelType=="DEBUG" ? "" : "?" + new Date().getTime() ;
	if(_array[name]){
		var o = window.Common[window.Common.ServerModel],
			_path = o.PROBJECT_IP + o.PROBJECT_PATH;
		_array[name].forEach(function(el,index){
			src =  _path + el + timeStamp;
			document.writeln("<link rel=\"stylesheet\" href='"+src+"' />");
		});
	}else{
		src = name + timeStamp;
		document.writeln("<link rel=\"stylesheet\" href='"+src+"' />");
	}
}
//javascript
window.ResponseJavaScript = function(name){
	var _array = window.Common.ResourcesArray["js"];
	var src = "",
		timeStamp = window.Common.ModelType=="DEBUG" ? "" : "?" + new Date().getTime();
	if(_array[name]){
		var o = window.Common[window.Common.ServerModel],
			_path = o.PROBJECT_IP + o.PROBJECT_PATH;
		_array[name].forEach(function(el,index){
			src =  _path + el + timeStamp;
			document.writeln("<script type='text/javascript' src='"+src+"'></script>");
		});
	}else{
		src = name + timeStamp;
		document.writeln("<script type='text/javascript' src='"+src+"'></script>");
	}
}
//flash
window.ResponseFlash = function(name){
	var _array = window.Common.ResourcesArray["flash"];
	if(_array[name]){
		var o = window.Common[window.Common.ServerModel];
		return o.PROBJECT_IP + o.PROBJECT_PATH+_array[name];
	}else{
		console.warn("flash not error");
	}
}

//本地存储
window.SetStorage = function(object){
	if(!localStorage) return null;
	try{
		localStorage.setItem(window.Common.Config.PROBJECT_NAME,JSON.stringify(object));
	}catch(e){
		console.warn(e.message);
	}	
	return true;
}

window.GetStorage = function(object){
	if(!localStorage) return null;
	try{
		var _a;	
		try{
			_a = JSON.parse(localStorage.getItem(window.Common.Config.PROBJECT_NAME));
			if(_a==null){_a= {};}
		}catch(e){
			_a= {};
			localStorage.setItem(window.Common.Config.PROBJECT_NAME,JSON.stringify(_a));
		}
		return _a;
	}catch(e){
		console.warn(e.message);
	}
}

window.ClearLocalStorage = function(){
	localStorage.setItem(window.Common.Config.PROBJECT_NAME,JSON.stringify({}));
}

//简易方法
window.Response = function(){
	var _params = window.formatArguments(arguments),		
		_type = _params["string"],
		_name = _params["string0"],
		_object = _params["array"];
	if(_object){
		for (var i in _object) {
			var o = _object[i];
			for(var x in o){
				GetStaticResources(x,o[x]);
			}
		}
	}else{
		GetStaticResources(_type,_name);
	}
	
	function GetStaticResources(type,name){
		var Common = window;
		switch (type){
			case "ico":
				Common.ResponseIco(name);
				break;
			case "i":
				Common.ResponseIco(name);
				break;
			case "c":
				Common.ResponseCSS(name);
				break;
			case "css":
				Common.ResponseCSS(name);
				break;
			case "javascript":
				Common.ResponseJavaScript(name);
				break;
			case "js":
				Common.ResponseJavaScript(name);
				break;
			case "j":
				Common.ResponseJavaScript(name);
				break;
			case "flash":
				Common.ResponseFlash(name);
				break;
			case "f":
				Common.ResponseFlash(name);
				break;
			default:
				break;
		}
	}
}

//预留冲突解决对象
!(function(window,x){
	x.ResponseHtmlHead = window.ResponseHtmlHead;
	x.ResourceArray = window.ResourcesArray;
	x.ResponseCss = window.ResponseCSS;
	x.ResponseJs = window.ResponseJavaScript;
	x.ResponseFlash = window.ResponseFlash;
})(window,window);


window.Responseie8service = function(){
	window.CommonResponse("js","ie8json2");
	window.CommonResponse("js","ie8html5shiv");
	window.CommonResponse("js","ie8Css3MediaQuery");
	window.jQuery || window.CommonResponse("js","jquery.183");
	window.CommonResponse("js","ie8placeholder");
}

//判断用户是否登陆
window.UserIsLogin = function(callback){
	x.ajax({
		type:"post",
		url:"/SCXM/sys/islogin",
		contentType:"application/json",
		success : function(data){
			var code = data["code"];
			if(code=="0"){
				if(callback){
					callback();
				}
			}else{
				top.location.href = "/SCXMWEB/html/login2/";
			}
		},
		error : function(a,b,c){
			document.write(c);
		}
	});
}

//判断对象被嵌套跳转
window.DocumentIframeLoadRedirect = function(){
	if(top != self){
		if(top.location.hostname == self.location.hostname){
			//console.warn("本站内嵌套");
			//location.href = "about:blank";
		}else{
			//console.warn("跨域嵌套");
			location.href = "about:blank";
		}
	}
}

//判断对象是否跨域或者被嵌套
window.DocumentIframeLoad = function(){
	if(top != self){
		if(top.location.hostname == self.location.hostname){
			//console.warn("被嵌套框架，"+self.location.pathname,top.location.pathname);
			$("body").addClass("iframe-body");
		}else{
			//console.warn("Cross domain，"+self.location.href);
			location.href = "about:blank";
		}
	}
}

//全局初始化，document载入之前执行，等同于立即执行
window.DocumentReadyBeforesend = function(){
	window.DocumentIframeLoadRedirect();
}

//全局初始化，document载入之后执行
window.DocumentReadySuccess = function(){
	//window.UserIsLogin();
	window.DocumentIframeLoad();
}

//立即执行的函数
window.ResponseInit = function(){
	//window.DocumentReadyBeforesend();
	
	//开始注册document加载之后的程序
	if(document.addEventListener){
		document.addEventListener('DOMContentLoaded',function() {
			document.removeEventListener("DOMContentLoaded", arguments.callee, false); 
			window.DocumentReadySuccess();
		},false); 
	}else if(document.attachEvent){
		document.attachEvent("onreadystatechange", function(){  
		    if (document.readyState === "complete" ) {  
		        document.detachEvent("onreadystatechange", arguments.callee );  
		        window.DocumentReadySuccess();
		    }
	  });
	}
}
window.ResponseInit();

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
		//window.location.href="http://www.onlinehome.top/MyBook/main";
	}else{
		//window.location.protocol //http:(带冒号)
		//window.location.href="http://www.onlinehome.top/MyBook/app";
	}
})();

