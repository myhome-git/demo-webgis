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
		
		$(".cgal-li").css("visibility","hidden");
		var _w = $(window);
		_w.scroll(function(){
			var top = _w.scrollTop();
			if(top>=540 && top < 1080){
				$(".cgal-li:eq(0)").css("visibility","visible");
				$(".cgal-li:eq(0) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(0) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=1080 && top < 1400){
				$(".cgal-li:eq(1)").css("visibility","visible");
				$(".cgal-li:eq(1) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(1) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=1400){
				$(".cgal-li:eq(2)").css("visibility","visible");
				$(".cgal-li:eq(2) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(2) .li-bean:eq(1)").setAnimate("right");
			}
			
			
		});
	}
	
	
})(jQuery);