/*********************************************************
*	jquery xyd plug in
*********************************************************/
(function($){
	$.fn.extend({
		setElementFixed : function(){
			/*
			*	设置div根据滚动条自动跟随
			*	需要提前设置css，分别制定top和left属性
			* 	xydAutoFixed class是预留做div阴影效果
			*/
			var $this = $(this),
				parent = $this.parent(),
				elementIsFixed = "none";			
			
			
			//设置元素尺寸
			function setPX(){
				//设置宽度和高度
				$this.css({
					"width":(parent.outerWidth())+"px",
					"top":"0",
					"left":parent.offset().left+"px"
				});
				
				//设置父层的宽度和高度
				parent.css({"height":$this.outerHeight()+"px"});
			}
			
			
			$(window).scroll(function (){
				setScrollTop();
			});
			
			$(window).resize(function(){
				setPX();
				setScrollTop();
			});
			
			$(document).ready(function(){
				setPX();
				setScrollTop();
			});
			function setScrollTop(){
				
				if($(window).scrollTop()>(parent.offset().top+$this.outerHeight()+30)){
					if(elementIsFixed!="fixed"){						
						elementIsFixed = "fixed";						
			
						$this
							.addClass("xydAutoFixed")
							.css({
								"position":"fixed",
								"top":"0",
								"left":parent.offset().left+"px",
								"display":"none"
							})
							.stop()
							.slideDown(300);
					}
					
				}else{
					elementIsFixed = "none";
					$this.css({"top":"0","left":"0"});
					$this.removeClass("xydAutoFixed");
				}
			}
			
		},
		hoverDelay : function(options) {
			/**
			 * 鼠标延迟
			 */
			var defaults = {
				hoverDuring: 200,
				outDuring: 200,
				hoverEvent: function() {
					$.noop();
				},
				outEvent: function() {
					$.noop();
				}
			};
			var sets = $.extend(defaults, options || {});
			var hoverTimer, outTimer;
			return $(this).each(function() {
				$(this).hover(function() {
					clearTimeout(outTimer);
					hoverTimer = setTimeout(sets.hoverEvent, sets.hoverDuring);
				}, function() {
					clearTimeout(hoverTimer);
					outTimer = setTimeout(sets.outEvent, sets.outDuring);
				});
			});
		}
		
	});
})(jQuery);
