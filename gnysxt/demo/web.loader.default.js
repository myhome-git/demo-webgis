//默认加载配置
WebLoader.Response([
	"jquery",
	"bootstrap.335",
	"layui",
	"jquery.toastr",
	"x.template",
	"webloader"
]);

/*
//下面方法如果有闪动，可以手动使用CommonResponse([{"c":"common"}]);
function DocumentLoadCommon(){
	var _array = window.Common.ResourcesArray["css"];
	var o = window.Common[window.Common.ServerModel];
	var src = o.PROBJECT_IP + o.PROBJECT_PATH + _array["common"] + "?" + new Date().getTime();
	var doc=document; 
    var link=doc.createElement("link"); 
    link.setAttribute("rel", "stylesheet"); 
    link.setAttribute("type", "text/css"); 
    link.setAttribute("href", src); 
    var heads = doc.getElementsByTagName("head"); 
    if(heads.length){
    	heads[0].appendChild(link); 
    }else{
    	doc.documentElement.appendChild(link); 
    }
}
if(document.addEventListener){
	document.addEventListener('DOMContentLoaded',function() {
		document.removeEventListener("DOMContentLoaded", arguments.callee, false); 
		DocumentLoadCommon();
	},false); 
	
}else if(document.attachEvent){
	document.attachEvent("onreadystatechange", function(){  
	    if ( document.readyState === "complete" ) {  
	        document.detachEvent( "onreadystatechange", arguments.callee );  
	        DocumentLoadCommon();
	    }
  });
}
*/

/*
//修改platform关键字
try{
	//Object.defineProperty(navigator,'platform',{get:function(){return "window10"}});
}catch(e){
	
}
*/

/*
//判断平台、设备和操作系统  
(function(){
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
		//window.location.href="http://www.baidu.com";
	}else{
		//window.location.protocol //http:(带冒号)
		//window.location.href="http://m.baidu.com";
	}
})();
*/
/*
//利用navigator.userAgent字符串判断
if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
    window.location.href = "http://m.baidu.com";
} else {
    window.location.href = "http://www.baidu.com";
}
*/