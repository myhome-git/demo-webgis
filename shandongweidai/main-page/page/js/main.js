(function($){
	$(document).ready(main_documentReady);
	
	function main_documentReady(){
					
		var unslider04 = $('#b03').unslider({
			dots: true
		}),				
		data04 = unslider04.data('unslider');
		 $('#b03').css({"width":"100%"});
		 
		 $("#xyd-header").setElementFixed();
	
		$(".kh-font").css("visibility","hidden");
		$("#whxz").css("visibility","hidden");
		var _w = $(window);
		_w.scroll(function(){
			var top = _w.scrollTop();
			if(top>332 && top < 1080){
				$(".kh-font").css("visibility","visible");
				$(".kh-font:eq(0)").setAnimate("left");
				$(".kh-font:eq(1)").setAnimate("down");
				$(".kh-font:eq(2)").setAnimate("up");
				$(".kh-font:eq(3)").setAnimate("up");
				$(".kh-font:eq(4)").setAnimate("right");
				$(".kh-font:eq(5)").setAnimate("down");
			}else if(top>=1080){
				$("#whxz").css("visibility","visible").setAnimate("left");
			}
		});
		
		$.get("userNavLoading.html",function(data){
			$("body").append($(data));
		})
		
		
	}
	
	
})(jQuery);