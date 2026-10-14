/**
 * 通用工具栏
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let $doc,_this=module;
	
	module.bindEvent = function(){
		
		$(document).on("mousedown",function(e){
			$doc.find("dd")
            	.removeClass("open")
            	.find("[x-btn-name]").removeClass("action");
		});
		
		let $btn = $doc.find("[x-btn-name]");
			
		$btn.on("mousedown", function (event) {
			
            var $this = $(this),
                _val = $this.attr("x-btn-name");
            
            var $f = $this.closest("dd");
            
            //关闭兄弟节点
            $this.closest("dd").siblings()
            	.removeClass("open")
            	.find("[x-btn-name]").removeClass("action");
            	
            if ($f.hasClass("open")) {
                $f.removeClass("open");
            } else { 	
                $f.addClass("open");
            }
            
            switch (_val){
            	case "open-this-children-menu":
            		SetWindowPanelDIMING(true);
            		break;
            	case "open-tssz":  //态势设置
            		parent.OPENWINDOW.openTSSZ();
            		break;
            	case "open-ts-group":  //态势分组
            		parent.OPENWINDOW.openTSFZSZ();
            		break;	
            	case "open-gjsz": //告警规则管理
            		parent.OPENWINDOW.openGJSZ("guizeguanli");
					break;
				case "gongju-ceju":	//测距		
					parent.MAP.getBeyonMap().measureTool.Length.draw();
					break;
				case "gongju-mianji"://面积
					parent.MAP.getBeyonMap().measureTool.AREA.draw();
					break;
				case "gongju-qingchu"://清除
					parent.MAP.getBeyonMap().measureTool.clear();
					break;
				case "network-info":  //网络分析
            		parent.OPENWINDOW.openNETWORK_ECHARTS();
            		break;
            	case "open-map-flight-coordinate":  //坐标定位
            		parent.OPENWINDOW.openMapFlyCoordinate();
            		break;	
            	case "open-plot-win":  //打开标绘面板
            		parent.OPENWINDOW.openPlotWin();
            		break;
            	case "save-window-screen":  //打开标绘面板
            		parent.OPENWINDOW.plotToImage({
            			callback : {}
            		});
            		break;	
            	case "full-screen":  //全屏显示
            		$f.hasClass("open")?$.HTML5FullScreen(true):$.HTML5FullScreen(false);
            		return false;
            		break;
            	case "open-jcss":  //打开基础设置
            		parent.OPENWINDOW.openBaseSystemManageConfig();
            		break;
            	default:
            		break;
            }
        });

        //控制地名ifrmae显隐
        function SetWindowPanelDIMING(_isOpen) {
            var _xzqh = {
                show: function () {},
                hide: function () {}
            };
            try {
                //针对地名窗口
                _xzqh = $("#iframe-diming").get(0).contentWindow._FunctionObject.xzqh;
            } catch (e) {
            }

            if (_isOpen == true) {
                _xzqh.show();
            } else {
                _xzqh.hide();
            }
        }

//          _FunctionObject.$viewContentGeneralToolbar.find(".shade-layer").addClickEffect();
        $doc.css({"left": ($("body").outerWidth()-500) + "px"});
        $doc.dragDiv($doc.parent());
	}
	
	module.init = function(){
		$doc = $("#temp-general-toolbar");
		this.bindEvent();
//		this.openDZWL("gaojingguanli");
	}
	
})(jQuery,_pageObject,_pageObject.WINDOWTOOLBAR={});