var _pageObject = _pageObject || {};

(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

//入口
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.TONGXINTAISHI_ECHARTS.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 通信态势
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	
	let _jm;
	
	module.initPanel = function(data){
		var _data = {
	        meta:{
                name:'demo',
            },
            format:'node_array',
            data:(function(){
            	let _array = [],
            		_root = {
            			id : "root",
            			isroot : true,
            			topic : data.mbmc
            		},
            		_dqsd = data.dq.zdHqsdb,
            		_lssd = data.ls;
            		
            	_array.push(_root);
            	$.each(_dqsd, function(index,el) {
            		let _id = el.hqsdmc+"("+el.hqsd+")";
            		_array.push({
            			id : _id,
            			parentid : "root",
            			topic : _id,
            			direction : "left",
            			groupName : "dqsd"
            		});
            	});
            	$.each(_lssd, function(index,el) {
            		let _id = index;
            		_array.push({
            			id : _id,
            			parentid : "root",
            			topic : _id,
            			direction : "right",
            			groupName : "lssd",
            			expanded:false
            		});
            		$.each(el, function(i,e) {
            			let _tempId = e.res_type+"("+e.id+")";
            			_array.push({
	            			id : _tempId,
	            			parentid : _id,
	            			topic : _tempId,
	            			direction : "right",
	            			groupName : "lssd",
	            			__cache : e
	            		});
            		});
            	});
            	return _array;
            })()
		};
        var options = {
            container:"jsmind_container",
            editable:false,
            theme:'primary',
            view: {
	            line_color: '#fff'
	        },
            shortcut:{
                handles:{
                    test:function(j,e){
                        console.info(j);
                    }
                },
                mapping:{
                    test:10
                }
            }
        }
        _jm = jsMind.show(options,_data);
//      _jm.view.setZoom(1);
        _jm.view.setZoom(0.8);
        _jm.view.add_event(_jm, 'click', function(e){
        	let $target = $(e.target),
        		_id = $target.attr("nodeid");
        	
        	let _cache;
        	$.each(_data.data, function(index,el) {
        		if(el.id==_id && el.__cache){
        			_cache = el.__cache;
        		}
        	});
        	if(_cache){
        		let _html = [];
        		function getHtml(obj,t){
        			_html.push(t);
        			if(obj instanceof Object){
        				for(let i in obj){
        					_html.push("<br/>");
        					if(obj[i] instanceof Object){
        						_html.push(t+i+"");
        						getHtml(obj[i],t+"&nbsp;&nbsp;&nbsp;");
        					}else{
        						_html.push(t+i+"："+obj[i]);
        					}
	        			}
        			}
        		}
        		try{
        			_cache.format_para = JSON.parse(_cache.format_para);
//      			console.info(_cache.format_para);
        		}catch(e){
        			//TODO handle the exception
        		}
        		getHtml(_cache.format_para,"");
        		_html = _html.join("");
        		_html = _html.replace(/^\<br\/>/,"");
        		
        		let _default = {
		            anim : 0,
		            isOutAnim: true,
		            shade: 0.3,
		            shadeClose: false,
		            btn: false,
		            title : _cache.format_name+"（"+_cache.res_type+"["+_cache.id+"]）",
		            content : '<pre lay-skin="notepad" id="mb-code" style="margin:0;height:100%;padding:10px;border-radius:0;">'+_html+'</pre>',
		            success : function(layero,index){
		            	let $content = layero.find(".layui-layer-content");
		            	$content.css({"padding":"0"});
//		            	layui.use('code', function(){ //加载code模块
//							layui.code({
//						  		elem : "#mb-code",
//								title: false,
//								height : ($content.outerHeight())+"px"
//							});
//							$content.find(".layui-code-h3").remove();
//						});
		            }
		        }
        		layui.layer.open(_default);
        	}else{
        		
        	}
        });
        
        let $jsmind = $("#jsmind_container");
        
        function onFuncWinResize(){
        	_jm.show(_data);
        	$.each(_data.data, function(index,el) {
	        	let $d = $jsmind.find("jmnode[nodeid='"+el.id+"']"),
	        		_groupName = el.groupName;
	        	$d.addClass(_groupName);
	        });
	        $doc.setMCustomScrollbar("update");
        }
        onFuncWinResize();
        $(window).on("resize",onFuncWinResize);
	}
	
	module.init = function(){
		$doc = $("#x-view-content");
//		$doc.addMCustomScrollbar();
		
		let _parmas = location.search.replace(/^\?+/,"");
		try{
			_parmas = JSON.parse(decodeURIComponent(_parmas));
		}catch(e){
			_parmas = {};
		}
		parent.HTTP.httpGetLSTXTSById({
			data : _parmas,
			success : function(result){
				let _newResult = $.extend(true,_parmas, result);
				_this.initPanel(_newResult);
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.TONGXINTAISHI_ECHARTS={});

/**
 * http请求逻辑
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	/**
	 * 获取历史通信态势
	 * @param {Object} option
	 */
	module.httpGetLSTXTSById = function(option){
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.lstxts.getById"),
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						option.success(result.data);
					}
				}else{
					layui.layer.msg("数据请求失败",{time:5000});
				}
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.HTTP={});
