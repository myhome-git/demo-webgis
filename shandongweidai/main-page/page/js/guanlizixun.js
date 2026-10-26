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
		$(".cgal-li:eq(0)").css("visibility","visible");
		var _w = $(window);
		_w.scroll(function(){
			var top = _w.scrollTop();
			if(top>=0 && top < 324){
				$(".cgal-li:eq(0)").css("visibility","visible");
				$(".cgal-li:eq(0) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(0) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=324 && top < 972){
				$(".cgal-li:eq(1)").css("visibility","visible");
				$(".cgal-li:eq(1) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(1) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=972 && top < 1400){
				$(".cgal-li:eq(2)").css("visibility","visible");
				$(".cgal-li:eq(2) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(2) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=1400 && top < 1600){
				$(".cgal-li:eq(3)").css("visibility","visible");
				$(".cgal-li:eq(3) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(3) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=1600 && top < 2300){
				$(".cgal-li:eq(4)").css("visibility","visible");
				$(".cgal-li:eq(4) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(4) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=2300 && top < 2800){
				$(".cgal-li:eq(5)").css("visibility","visible");
				$(".cgal-li:eq(5) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(5) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=2800 && top < 3200){
				$(".cgal-li:eq(6)").css("visibility","visible");
				$(".cgal-li:eq(6) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(6) .li-bean:eq(1)").setAnimate("right");
			}else if(top>=3200 && top < 3300){
				$(".cgal-li:eq(7)").css("visibility","visible");
				$(".cgal-li:eq(7) .li-bean:eq(0)").setAnimate("left");
				$(".cgal-li:eq(7) .li-bean:eq(1)").setAnimate("right");
			}
		});
	}
	
	
})(jQuery);