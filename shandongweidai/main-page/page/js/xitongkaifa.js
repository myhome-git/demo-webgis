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
		
		$(".one>a").mouseover(function(){
				
				var ins=$(this).index();
				$(this).addClass("animated bounce");
				$(".one1").find("img").hide();
				$(".one1").find("img:eq("+ins+")").show();
				
			})
		$(".one>a").mouseout(function(){
				
				$(this).removeClass("animated bounce");
			})
			
		$(".two>a").mouseover(function(){
				
				var ins=$(this).index();
				$(this).addClass("animated bounce");
				$(".two2").find("img").hide();
				$(".two2").find("img:eq("+ins+")").show();
			})
		$(".two>a").mouseout(function(){
				
				$(this).removeClass("animated bounce");
			})
		$(".three>a").mouseover(function(){
				
				var ins=$(this).index();
				$(this).addClass("animated bounce");
				$(".three3").find("img").hide();
				$(".three3").find("img:eq("+ins+")").show();
			})
		$(".three>a").mouseout(function(){
				
				$(this).removeClass("animated bounce");
			})
		$(".four>a").mouseover(function(){
				
				var ins=$(this).index();
				$(this).addClass("animated bounce");
				$(".four4").find("img").hide();
				$(".four4").find("img:eq("+ins+")").show();
			})
		$(".four>a").mouseout(function(){
				
				$(this).removeClass("animated bounce");
			})
		
		
		$(".five>a").mouseover(function(){
				var ins=$(this).index();
				$(this).addClass("animated bounce");
				$(".five5").find("img").hide();
				$(".five5").find("img:eq("+ins+")").show();
			})
		$(".five>a").mouseout(function(){
				
				$(this).removeClass("animated bounce");
			})
	}
	
	
})(jQuery);