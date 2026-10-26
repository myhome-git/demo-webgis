(function($){
	$(document).ready(main_documentReady);
	
	function main_documentReady(){
		$.get("userNavLoading.html",function(data){
			$("body").append($(data));
		});
		
		var unslider04 = $('#b03').unslider({
			dots: false
		}),				
		data04 = unslider04.data('unslider');
		$('#b03').css({"width":"100%"});
		 
		$("#xyd-header").setElementFixed();
		
		$("#xyd-send").click(function(){
			var _baidu_content = $("#newBridge"),
				_baidu_send = _baidu_content.find("#nb_nodeboard_send"),
				_xyd_content = $("#contact-address");
			
			$(".xyd-nb-nodeboard-tips").empty();

			_baidu_send.trigger("click");
			
			var _error = _baidu_content.find(".nb-nodeboard-err");
			if(_error.length>0){
				var _value = _error.find(".nb-nodeboard-tips").html();
				var _o = _error.find("[name]");
				var _name = _o.attr("name");
				_xyd_content.find("[data-out-name='"+_name+"']").next().html(_value);
			}else{

				setTimeout(function(){
					var _div = "<div style=\"text-align:center;color:#333;line-height:100px;\">正在发送，请稍后...</div>";
					if(_baidu_send.hasClass("message-disable")){
						var layerIndex = layer.open({
							type: 1,
							title: "留言",
							closeBtn: 1,
							area: ['400px','auto'],
							shadeClose: false,
							skin: 'yourclass',
							content: _div,
							scrollbar: false,
							success: function (layero) {
								var _interval = setInterval(function(){
									if(_baidu_send.hasClass("message-disable")===false){
										_xyd_content.find("input,textarea").val("");
										_baidu_content.find("input,textarea").val("");
										layer.close(layerIndex);
										window.clearInterval(_interval);
										alert("留言成功，请等待专员与您联系");
									}
								},1500);
						 	}
						});
						
					}else{
						_xyd_content.find("input,textarea").val("");
						_baidu_content.find("input,textarea").val("");
						alert("留言成功，请等待专员与您联系");
					}
				},2000);
				
				
						
			}
			
			
		});
		
		$(document).on("keyup","input,textarea",function(){
			var _this = $(this),_name = _this.attr("data-out-name");
			_this.next().empty();
			$("#nb_nodeboard_set [name='"+_name+"']").val(this.value);
		});
		
	}
	
	
})(jQuery);