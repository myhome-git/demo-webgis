(function($,xyd,layer){
	if(xyd===undefined){
		xyd = {};
	}
	xyd.pjax = {
		defaultIndex : "/page/welcome"
	};
	
	if('onhashchange' in window){
		window.onhashchange=function(){
			xyd.pjax.load(location.hash);
		}
	}
	
	$(document).ready(function(){
		//xyd.pjax.load(location.hash);
	});
	
	xyd.pjax.goHome = function(){
		xyd.pjax.setHash("page/welcome");
	}
	
	xyd.pjax.setHash = function(h){
		h = (h===undefined || h=="") ? xyd.pjax.defaultIndex : h,
		h = h.replace(/^(\#\!)?\#/, "");
		h = "#"+h;
	
		if(h!==xyd.pjax.defaultIndex){
			if (!!(window.history && history.pushState)){
			  // 支持History API
			  window.history.pushState(null, null, h);
			  window.history.replaceState({state:1,url:h},"title",h);
			} else {
			  // 不支持
			  window.location.hash = h;
			}
			xyd.pjax.defaultIndex = h;
		}		
		xyd.pjax.load();
	}
	
	xyd.pjax.load = function(){
		var hash = location.hash;
		if(hash===undefined || hash==null || hash==""){
			hash = xyd.pjax.defaultIndex;
		}
		var _go_url = hash.replace(/^(\#\!)?\#/, "");
		var animate = {
			loading : function(){
				var str = "<div class=\"loading\">"
						+ "<center>"
						+ "<table></tr><td>"
						+ "<img src=\""+window.XYDCONFIG.PROBJECT_PATH+"/page/images/load.gif\"/>"
						+ "</td><td>"
						+ "<span>&nbsp;&nbsp;正在加载...</span>"
						+ "</tr></table>"
						+ "</center>"
						+ "</div>";
				return str;
			}
		};
		var dom = $("#xyd-right-content-element");
		dom.empty();
		_go_url = window.XYDCONFIG.PROBJECT_PATH+"/page/"+_go_url+".html";
		var _index = layer.load(1, {
			shade: [0.1,'#000'] //0.1透明度的白色背景
		});
		
		setTimeout(function(){
			$.ajax({
				url : _go_url,
				data : {
					date : new Date().getTime()
				},
				success : function(data, status, xhr){
					dom.html(data);
					$("#html-code > *").each(function(index,element){
						var _this = $(element);			
						var _code = _this.outerHTML();
						var _html = $("<textarea class=\"xyd-code\" readonly>"+_code+"</textarea><br/><br/><br/>");
						_this.after(_html);
						
						var _button = $("<a class=\"xyd-btn btn-blue\" id=\"button-copy"+index+"\" href=\"javascript:void(0)\" style=\"float:right\">复制代码</a>");
						_this.after(_button);
						
						//绑定复制组件
						var _copyClient = new ZeroClipboard(_button,{
							moviePath: window.pageObject.response.swf("ZeroClipboardSwf"),
							trustedDomains: ['*']
						});
						_copyClient.on('load', function(client,args){
							if(args=='undefined' || args.flashVersion=='undefined' || args.flashVersion=='' || args.flashVersion==null){
								layer.msg("组件加载失败，无法使用复制功能");
								return;
							}
							
							_copyClient.on('datarequested', function(client){
								if(_html.text()==''){
									layer.msg("没有可复制的内容");
									return;
								}
								client.setText(_html.text());
							});
				
							_copyClient.on('complete', function(client, args) {
								if(_html.text()==''){return;}
								layer.tips('内容已经复制成功，请用Ctrl+V键进行粘贴！', "#"+$(this).attr("id"), {
									tips: [1, '#78BA32']
								});
							});
						});
				
						_copyClient.on('wrongflash noflash', function() {
							ZeroClipboard.destroy();
						});
						
					});
				},
				error : function(jqXHR, textStatus, errorThrown){
					
					var _iframe_box = $("<iframe></iframe>");
					_iframe_box.attr("frameborder","0")
						.attr("name","_iframe_error")
						.attr("width","100%")
						.attr("height","100%")
						.attr("src",window.XYDCONFIG.PROBJECT_PATH+"/error-page/error_index.html"+"?error="+jqXHR.status+"&date="+new Date().getTime());
					dom.empty().append(_iframe_box);
				},
				complete : function(){
					layer.close(_index);
				}
			});
		},800);
		
	
	}
})(jQuery,xyd,layer);

