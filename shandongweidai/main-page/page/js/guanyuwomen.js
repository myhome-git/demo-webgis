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
		$(".i-img-list").css("visibility","hidden");
		var _w = $(window);
		_w.scroll(function(){
			var top = _w.scrollTop();
			if(top>=0 && top < 324){
				$(".i-img-list").css("visibility","visible");
				$(".i-title").setAnimate("left");
				$(".i-content").setAnimate("right");
				
				$(".i-img-bean:eq(0)").setAnimate("left");
				$(".i-img-bean:eq(1)").setAnimate("up");
				$(".i-img-bean:eq(2)").setAnimate("right");
			}else if(top>=324){
				
			}
		});
	}
	
	
})(jQuery);