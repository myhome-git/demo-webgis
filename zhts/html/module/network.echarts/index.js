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
		parent.NETWORK_ECHARTS.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 网络分析
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	
	let _dataMap = new Map(),
		_dataMapNodes = new Map();
	/**
	 * 获取参数
	 */
	module.httpGetSearchSelectOption = function(option){
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiao.wangluofenxi.table.getById"),
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
					console.info(result.message);
				}
			}
		});
	}
	
	/**
	 * 根据表名取key
	 */
	module.httpGetSearchSelectOption1 = function(option){
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiao.wangluofenxi.table.key.getById"),
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
					
				}
			}
		});
	}
	
	
	/**
	 * 根据参数查询网络通信频率
	 * @param {Object} option
	 */
	module.httpGetDataById = function(option){
		let _sendData = JSON.stringify(option.data);
		let _index;
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiao.wangluofenxi.getById"),
			data : _sendData,
			beforeSend : function(xhr,event){
				_index = layui.layer.load(0);
			},
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
					console.info(result.message);
				}
			},
			complete : function(){
				layui.layer.close(_index);
			}
		});
	}
	
	/**
	 * 取时间线
	 * @param {Object} option
	 */
	module.httpGetSHIJIANXIAN = function(option){
		/**
		 * 
			"table": "ts_link_event",
			"sources":[62651, 10578, 111, 222],
			"keytype": ""
			
		 */
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : getModuleURL("http.zhts.ssts.mubiao.wangluofenxi.shijianxian"),
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
					layui.layer.msg(result["message"],{time:5000});
				}
			}
		});
	}
	
	module.getBody = function(){
		return $("#x-view-content");
	}
	
	module.initPanelSHIJIANXIAN = function(data){
		let $temp = $("#shijianxian-content");
		$temp.empty();
		let _data = {
			isRun : true,
			datalist : (function(){
				let _array = [];
				$.each(data, function(index,el) {
					_array.push({
						datetime : el.connTime,
						source : el.source,
						destination : el.destination,
						relate_name : el.relate_name
					});
				});
				return _array;
			})()
		};
		let _html = template("TemplateTableSHIJIANXIAN-0",_data);
		$temp.html(_html);
	}
	
	/**
	 * 初始化图表面板
	 * @param {Object} data
	 */
	module.initPanel = function(data){
		// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/
		function getTypeLovel(num){
			let _type;
			if(num>10){
				_type = "1";
			}else if(num>5){
				_type = "2";
			}else if(num>2){
				_type = "3";
			}else if(num>0){
				_type = "4";
			}else{
				_type = "5";
			}
			return _type;
		}
		
		function getTypeColor(type){
			let color;
			switch (type){
        		case "1":
//	        			color="rgba(192,57,57,1)"; 
					color = "red";
        			break;
        		case "2":
//	        			color="rgba(255,153,0,1)"; 
					color = "orange";
        			break;
        		case "3":
//	        			color="rgba(80,149,255,1)"; 
        			color = "blue";
        			break;
        		case "4":
//	        			color="rgba(0,178,102,1)";
        			color = "green";
        			break;
        		case "5":
//	        			color="rgba(0,178,102,1)";
        			color = "black";
        			break;
        		default:
//	        			color="rgba(214,200,200,1)"; 
					color = "black";
        			break;
        	}
			return color;
		}
		
		var links = [];
		_dataMap = new Map();
		_dataMapNodes = new Map(),
		_tempFilterMap = new Map();

		$.each(data, function(index,el) {
			el.source = el.source.toString();
			el.target = el.destination.toString();
			el.rela = el.count;
			el.type = getTypeLovel(el.sourcecount);
			el.color = getTypeColor(el.type);
			links.push(el);
			
			if(!_dataMapNodes.get(el.source)){
				_dataMapNodes.set(el.source,true);
			}
			
			if(!_dataMapNodes.get(el.target)){
				_dataMapNodes.set(el.target,true);
			}
		});
		
		
		_dataMapNodes.forEach(function(value,key){
			let _name = key;
			if(_dataMap.get(_name)){
				return;
			}
			
			let _obj = {
				pId : _name,
				name : _name,
				count : 0,
				sourceCount : 0,
				destinationCount : 0,
				type : 0,
				color : null
			};
			
			_obj.source = (function(){
				let _map = new Map();
				$.each(data, function(i,e) {
					if(e.source==_name){
						_obj.sourceCount += e.count;
						_obj.count += e.count;
						_map.set(e.destination,e.count);
					}
				});
				return _map;
			})();
			
			_obj.destination = (function(){
				let _map = new Map();
				$.each(data, function(i,e) {
					if(e.destination==_name){
						_obj.destinationCount += e.count;
						_obj.count += e.count;
						_map.set(e.source,e.count);
					}
				});
				return _map;
			})();
			
			_obj.type = getTypeLovel(_obj.count);
			_obj.color = getTypeColor(_obj.type);
			_dataMap.set(_name,_obj);
		});
		
//		console.info(links);
		
		let $win = $("#svg-panel");
		let $body = $("#x-view-content"),
			$svgBox = $("#svg-box");
		let width = $win.outerWidth(),
		    height = $win.outerHeight();
		
		var nodes = {};
		links.forEach(function(link) {
		  link.source = nodes[link.source.toString()] || (nodes[link.source] = {name: link.source.toString(),color : link.color,type :link.type});
		  link.target = nodes[link.target.toString()] || (nodes[link.target] = {name: link.target.toString(),color : link.color,type :link.type});
		  link.pId = link.source;
		});
		
		var corpname = "xxx";
		var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
		    .nodes(d3.values(nodes))//设定节点数组
		    .links(links)//设定连线数组
		    .size([width, height])//作用域的大小
		    .linkDistance(250)//连接线长度
		    .charge(-4000)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
		    .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
		    .start();//开始转换
		 
		    var zoom = d3.behavior.zoom()//缩放配置，
		    .scaleExtent([0.1, 10])//缩放比例
		    .on("zoom", zoomed);
		    
		var svg = d3.select("#"+$svgBox.attr("id")).append("svg")
		    .attr("width", "100%"||width)
		    .attr("height", "100%"||height)
		    .call(zoom);
		
		
		function zoomed(){//缩放函数
		    svg.selectAll("g").attr("transform",//svg下的g标签移动大小
		        "translate("  +d3.event.translate + ")scale(" +d3.event.scale + ")");
		    /*console.log(d3.event.translate+"/"+d3.event.scale);*/
		}
		
		// .call(zoom);
		 
		//箭头
		var marker=
		    svg.append("marker")
		    //.attr("id", function(d) { return d; })
		    .attr("id", "resolved")
		    //.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
		    .attr("markerUnits","userSpaceOnUse")
		    .attr("viewBox", "0 -5 10 10")//坐标系的区域
		    .attr("refX",33)//箭头坐标
		    .attr("refY", 0)
		    .attr("markerWidth", 16)//标识的大小
		    .attr("markerHeight", 16)
		    .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
		    .attr("stroke-width",2)//箭头宽度
		    .append("path")
		    .attr("d", "M0,-5L10,0L0,5")//箭头的路径
		    .attr('fill','#fff');	//箭头颜色
		    
		 
		//  将连接线设置为曲线
		// var path = svg.append("g").selectAll("path")
		//     .data(force.links())
		//     .enter().append("path")
		//     .attr("class", function(d) { return "link " + d.type; })
		//     .style("stroke",function(d){
		//         //console.log(d);
		//        return "#A254A2";//连接线的颜色
		//     })
		//     .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
		 
		 
		// 设置连接线    
		var edges_line =  svg.append("g").selectAll("path")
		    .data(force.links())
		    .enter()
			.append("path")
		    .attr({
		 
	        	'd': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
	        	'class':'edgepath',
	        	//'fill-opacity':0,
	        	//'stroke-opacity':0,
	        	//'fill':'blue',
	        	//'stroke':'red',
	        	'id':function(d,i) {
					return "edgepath"+i;
				}
		    })
		    .attr("pid",function(d,i){
		    	let $this = $(this);
		    	$this.attr("set-color","#ffffff")
		    		.attr("source",d.source.name)
		    		.attr("destination",d.target.name)
		    		.attr("id","edgepath"+i);
		    	return d.pId;
		    })
		    .style("stroke",'#ffffff')
//		    .style("pointer-events", "none")	//屏蔽element事件开关
		    .style("stroke-width",4)//线条粗细
		    .attr("marker-end", function(d){
		        if(d.rela=='自身'){
		            return ''
		        }else{
		            return 'url(#resolved)'
		        }
		    })
//		    .on("click",onEdgesLineClick)
//		    .on("pointerdown",onEdgesLineClick)
//		    .on("select",onEdgesLineClick)
		    .on("mousedown",onEdgesLineClick);
		
		//连接线单击事件
		function onEdgesLineClick(node){
			event.stopPropagation();
			let $this = $(this);
			let _nodeMap = new Map();
			_nodeMap.set("id",node.pId);
			_nodeMap.set("source",node.source.name);
			_nodeMap.set("destination",node.target.name);
			
			_this.showNodeAll(false)
				.showNode(_nodeMap.get("source"))
				.showNodeExtendDestinations(_nodeMap.get("source"),[_nodeMap.get("destination")]);
			
//		    //单击时让连接线加粗
	        edges_line.style("stroke-width",function(line){
	            if(
	            	line.source.name==_nodeMap.get("source") && line.target.name==_nodeMap.get("destination")
	            )
	            {
	                return 8;
	            }else{
	                return 4;
	            }
	        });
	        
	        //请求接口
	        let _data = $("#input-search-from").getFormValue();
	        $.extend(true, _data, {
	        	"sources":(function(){
	        		let _array = [];
	        		_array.push(_nodeMap.get("source"));
	        		_array.push(_nodeMap.get("destination"));
	        		return _array;
	        	})(),
	        });
	        _this.httpGetSHIJIANXIAN({
	        	data : _data,
				success : function(data){
					_this.initPanelSHIJIANXIAN(data);
				}
	        });
		}
		
		var edges_text = svg.append("g").selectAll(".edgelabel")
		.data(force.links())
		.enter()
		.append("text")
		.style("pointer-events", "none")
		//.attr("class","linetext")
		.attr({
			'class':'edgelabel',
           'id':function(d,i){return 'edgepath'+i;},
           'dx':60,
           'dy':-5
           //'font-size':10,
           //'fill':'#aaa'
        });
		 
		//设置线条上的文字
		edges_text.append('textPath')
		.attr('xlink:href',function(d,i) {
			let $this = $(this);
			$this.attr("pid",d.pId)
				.attr("source",d.source.name)
		    	.attr("destination",d.target.name);
			return '#edgepath'+i;
		})
		.style("pointer-events", "none")
		.style("fill",'#ffffff')
		.text(function(d){return d.rela;});
		
		function drag(){//拖拽函数
		    return force.drag()
		        .on("dragstart",function(d){
		            d3.event.sourceEvent.stopPropagation(); //取消默认事件
		            d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
		        });
		}
		
		//圆圈的提示文字 根据需要到数据库中进行读取数据
		var tooltip = d3.select("#"+$svgBox.attr("id"))
		.append("div")//添加div并设置成透明
		.attr("class","tooltip")
		.style("opacity",0.0);
		
		
		function set_tooltip(name){//设置提示内容
			return;
		    var r;
		    for(var i=0;i<links.length;i++){
		        if(name == links[i].source.name || name == links[i].target.name){
		            r=links[i].rela;
		            break;
		        }
		    }
		    tooltip.html(name + "【总次数：" + r + "】")
		        .style("left", (d3.event.pageX) + "px")
		        .style("top", (d3.event.pageY + 20) + "px")
		        .style("opacity",1.0);
		}
		
		//圆圈
		var circle = svg.append("g").selectAll("circle")
		    .data(force.nodes())//表示使用force.nodes数据
		    .enter().append("circle")
//		    .style("fill",function(node){
//		        var color;//圆圈背景色
//		        var link=links[node.index];
//		        // console.log(link.name)
//		        if(link){
//		        	color = getTypeColor(link.type)
//		        	if(link.target.name=='410'){
//		        		console.info(color);
//		        	}
//		        	return color;
//		        }
//		    })
//		    .style('stroke',function(node){ 
//		        var link=links[node.index];
//		        if(link){
//		        	return link.type;
//		        }
//		    })
		    .attr("r", 40)//设置圆圈半径
		    .attr("id",function(node){
		    	let _obj = _dataMap.get(node.name);
		    	if(_obj){
		    		let $this = $(this);
			    	$this.attr("type",_obj.type)
		        		.attr("set-color",_obj.color)
		        		.css({"fill":_obj.color});
		    	}
		        return "circle-"+node.name;
		    })
		    .on("click",function(node){
		    	event.stopPropagation();
		    	_this.showNodeAll(false)
					.showNode(node.name)
					.showNodeExtendAll(node.name);
					
//		        //单击时让连接线加粗
		        edges_line.style("stroke-width",function(line){
		            // console.log(line);
		            if(line.source.name==node.name || line.target.name==node.name){
		                return 8;
		            }else{
		                return 4;
		            }
		        });
		        circle.style('stroke-width',1);//所有的圆圈边框
		        d3.select(this).style('stroke-width',4);//被选中的圆圈边框
		    })
		    // .call(force.drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动
		    
		    .on("dblclick",function(node){
		        //双击节点时节点恢复拖拽
		        node.fixed = false;
		        event.stopPropagation();
		    })
		    .on("mouseover",function(d){
		        set_tooltip(d.name);
		    })
		    .on("mousemove",function(d){
		        tooltip.style("left", (d3.event.pageX) + "px")
		            .style("top", (d3.event.pageY + 20) + "px");
		    })
		    .on("mouseout",function(d){
		        tooltip.style("opacity",0.0);
		    })
		    .call(drag());//使顶点可以被拖动
		
		svg.selectAll("g").call(drag());//为svg下的所有g标签添加拖拽事件
		svg.on("dblclick.zoom", null);//取消svg和圆圈的双击放大事件（d3中默认开启7个事件，关闭防止与上面的双击事件冲突）
		circle.on("dblclick.zoom", null);
		
		//显示所有元素
		$("#svg-box > svg").on("mousedown",function(event){
			_this.showNodeAll(true);
		});
		
		//圆圈中文字
		var text = svg.append("g").selectAll("text")
		    .data(force.nodes())
		    //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
		    .enter()
		    .append("text")
		    .attr("dy", ".35em")  
		    .attr("text-anchor", "middle")//在圆圈中加上数据  
		    .attr("id",function(node){
		    	let $this = $(this);
		        $this.attr("pid",node.name)
		        	.attr("source",node.name);
		        return "circle-center-text-"+node.name;
		    })
		    .style('fill',function(node){
		        //var color;//文字颜色
		        //var link=links[node.index];
		        // if(node.name==link.source.name && link.rela=="主营产品"){
		        //     color="#B43232";
		        // }else{
		        //     color="#A254A2";
		        // }
		        return '#ffffff';
		    })
		    .on("click",function(node){
		    	event.stopPropagation();
		    	_this.showNodeAll(false)
					.showNode(node.name)
					.showNodeExtendAll(node.name);
		    })
//		    .on("dblclick",function(node){
//		    	event.stopPropagation();
//		        //双击节点时节点恢复拖拽
//		        node.fixed = false;
//				_this.clearAll();
//				_this.setNodeShow(node);
//		    })
		    .on("mouseover",function(d){
		        set_tooltip(d.name);
		    })
		    .on("mousemove",function(d){
		        tooltip.style("left", (d3.event.pageX) + "px")
		            .style("top", (d3.event.pageY + 20) + "px");
		    })
		    .on("mouseout",function(d){
		        tooltip.style("opacity",0.0);
		    })
		    .call(drag())
		    
		    .attr('x',function(d){
		        // console.log(d.name+"---"+ d.name.length);
		        var re_en = /[a-zA-Z]+/g;
		        //如果是全英文，不换行
		        try{
		        	d.name.match(re_en);
		        }catch(e){
		        	d.name = "";
		        }
		        
		        if(d.name.match(re_en)){
		             d3.select(this).append('tspan')
		             .attr('x',0)
		             .attr('y',2)
		             .text(function(){return d.name;});
		        }
		        //如果小于四个字符，不换行
		        else if(d.name.length<=4){
		             d3.select(this).append('tspan')
		            .attr('x',-2)
		            .attr('y',2)
		            .text(function(){return d.name;});
		        }else if(d.name.length>4&&d.name.length<=8) {//大于4  这两行
		            var top=d.name.substring(0,4);
		            var bot=d.name.substring(4,d.name.length);
		 
		            d3.select(this).text(function(){return '';});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-7)
		                .text(function(){return top;});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',10)
		                .text(function(){return bot;});
		 
		 
		        }else if(d.name.length>8&&d.name.length<=12){// 文字长度大于8 折三行
		            var top=d.name.substring(0,4);
		            var bot=d.name.substring(4,8);
		            var bot1=d.name.substring(8,d.name.length);
		 
		            d3.select(this).text(function(){return '';});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-15)
		                .text(function(){return top;});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',2)
		                .text(function(){return bot;});
		                
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',16)
		                .text(function(){return bot1;});
		 
		        }else if(d.name.length>12 && d.name.length<=16){//文字长度大于12 折四行'
		 
		            var top=d.name.substring(0,4);
		            var bot=d.name.substring(4,8);
		            var bot1=d.name.substring(8,12);
		            var bot2=d.name.substring(12,d.name.length);
		 
		            d3.select(this).text(function(){return '';});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-20)
		                .text(function(){return top;});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-3)
		                .text(function(){return bot;});
		                
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',10)
		                .text(function(){return bot1;});
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',23)
		                .text(function(){return bot2;});
		 
		 
		        }else if(d.name.length>16 ){//文字长度大于16  方案
		            var top=d.name.substring(0,4);
		            var bot=d.name.substring(4,8);
		            var bot1=d.name.substring(8,12);
		            var bot2=d.name.substring(12,14);
		 
		                bot2 += '...'
		            d3.select(this).text(function(){return '';});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-22)
		                .text(function(){return top;});
		 
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',-7)
		                .text(function(){return bot;});
		                
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',10)
		                .text(function(){return bot1;});
		            d3.select(this).append('tspan')
		                .attr('x',0)
		                .attr('y',25)
		                .text(function(){return bot2;});
		        }
		        //直接显示文字    
		        /*.text(function(d) { 
		        return d.name; */
		    })
		 
		/*  将文字显示在圆圈的外面 
		var text2 = svg.append("g").selectAll("text")
		     .data(force.links())
		    //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
		    .enter()
		    .append("text")
		    .attr("x", 150)//设置文字坐标
		    .attr("y", ".50em")
		    .text(function(d) { 
		        //console.log(d);
		        //return d.name; 
		        //return d.rela;
		        console.log(d);
		        return  '1111';
		    });*/
		
		function tick() {
		  //path.attr("d", linkArc);//连接线
		  circle.attr("transform", transform1);//圆圈
		  text.attr("transform", transform2);//顶点文字
		  //edges_text.attr("transform", transform3);
		  //text2.attr("d", linkArc);//连接线文字
		  //console.log("text2...................");
		  //console.log(text2);
		  //edges_line.attr("x1",function(d){ return d.source.x; });
		  //edges_line.attr("y1",function(d){ return d.source.y; });
		  //edges_line.attr("x2",function(d){ return d.target.x; });
		  //edges_line.attr("y2",function(d){ return d.target.y; });
		    
		  //edges_line.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; });
		  //edges_line.attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
		 
		 
		  edges_line.attr('d', function(d) { 
		      var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
		      return path;
		  });  
		    
		  edges_text.attr('transform',function(d,i){
		        if (d.target.x<d.source.x){
		            bbox = this.getBBox();
		            rx = bbox.x+bbox.width/2;
		            ry = bbox.y+bbox.height/2;
		            return 'rotate(180 '+rx+' '+ry+')';
		        }
		        else {
		            return 'rotate(0)';
		        }
		   });
		}
		//设置连接线的坐标,使用椭圆弧路径段双向编码
		function linkArc(d) {
		    //var dx = d.target.x - d.source.x,
		  // dy = d.target.y - d.source.y,
		     // dr = Math.sqrt(dx * dx + dy * dy);
		  //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		  //打点path格式是：Msource.x,source.yArr00,1target.x,target.y  
		  
		  return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y
		}
		//设置圆圈和文字的坐标
		function transform1(d) {
		  return "translate(" + d.x + "," + d.y + ")";
		}
		function transform2(d) {
		      return "translate(" + (d.x) + "," + d.y + ")";
		}
	}
	
	module.httpSubmitSearchInput = function(){
		let $temp = $("#shijianxian-content");
		$temp.empty();
		
		let _data = $tableSearchInputBox.getFormValue();
		let _parmas = {
			"table": _data["table"],
			"opt": {
				"keytype": _data["keytype"]
			}
		};
		$("#svg-box").empty();
		_this.httpGetDataById({
			data : _parmas,
			success : function(data){
				_this.initPanel(data);
			}
		});
	}
	
	module.bindEvent = function(){
		layui.use(["form"],function(){
			layui.form.render();
			
			let $select0 = $tableSearchInputBox.find("[x-input-name='table']"),
				$select1 = $tableSearchInputBox.find("[x-input-name='keytype']");
			layui.form.on("select(table)",function(obj){
				$select1.empty();
				layui.form.render();
				if(obj.value){
					let _cache = $select0.data("__cache");
					let _d;
					$.each(_cache, function(index,el) {
						if(el.tableName==obj.value){
							_d = el;
						}
					});
					
					_this.httpGetSearchSelectOption1({
						data : {
							"tableName": _d["tableName"],
							"keyType": _d["keyType"]
						},
						success : function(data){
							$.each(data || [], function(index,el) {
								let $option1 = $('<option value="'+el.key+'">'+el.key+'</option>');
								$select1.append($option1);
							});
							layui.form.render();
						}
					});
					
				}
			});
		});
				
		$tableSearchInputBox.find("[x-btn-name='button-search']").on("click",_this.httpSubmitSearchInput);
	}
	
	/**
	 * 显示或隐藏所有
	 * @param {Object} boolean
	 */
	module.showNodeAll = function(boolean){
		let $body = this.getBody();
		if(boolean){
			$body.find("circle").css({"opacity":"1"});
			$body.find("[pid]").css({"opacity":"1"});
			$body.find("path[pid]").css({"stroke-width":"4"});
		}else{
			$body.find("circle").css({"opacity":"0.1"});
			$body.find("[pid]").css({"opacity":"0.1"});
			$body.find("path[pid]").css({"stroke-width":"4"});
			_dataMap.forEach(function(value,key){
	    		$.each(value.source, function(index,el) {
					$doc = $("#circle-"+el);
					$doc.css({"opacity":"0.2"});
				});
	    		
	    		$.each(value.destination, function(index,el) {
    				$doc = $("#circle-"+el);
    				$doc.css({"opacity":"0.2"});
    			});
			});
		}
		return this;	
	}
	
	/**
	 * 显示自身
	 * @param {Object} node
	 */
	module.showNode = function(name){
		if(!name){
			return this;
		}
		
		let $body = this.getBody();
		
		$doc = $body.find("#circle-"+name);
		$doc.css({"opacity":"1"});
		
		$doc = $body.find("#circle-center-text-"+name);
		$doc.css({"opacity":"1"});
		return this;
	}
	
	/**
	 * 显示关联所有
	 * @param {Object} name
	 */
	module.showNodeExtendAll = function(name){
		let $body = this.getBody();
		let _obj = _dataMap.get(name);
		if(_obj){
			_obj.source.forEach(function(index,el){
				$doc = $body.find("#circle-"+el);
				$doc.css({"opacity":"1"});
				$doc = $body.find("#circle-center-text-"+el);
				$doc.css({"opacity":"1"});
			});
			
			$doc = $body.find("g > path[source='"+name+"']");
			$doc.css({"opacity":"1"});
			
			_obj.destination.forEach(function(index,el){
				$doc = $body.find("#circle-"+el);
				$doc.css({"opacity":"1"});
				$doc = $body.find("#circle-center-text-"+el);
				$doc.css({"opacity":"1"});
			});
			
			$doc = $body.find("g > path[destination='"+name+"']");
			$doc.css({"opacity":"1"});
		}
		return this;
	}
	
	/**
	 * 显示两个节点之间的关联
	 * @param {Object} name
	 * @param {Object} destinations
	 */
	module.showNodeExtendDestinations = function(name,destinations){
		let $body = this.getBody();
		let _obj = _dataMapNodes.get(name);
		if(_obj){
			$.each(destinations, function(index,el) {
				$doc = $body.find("#circle-"+el);
				$doc.css({"opacity":"1"});
				$doc = $body.find("#circle-center-text-"+el);
				$doc.css({"opacity":"1"});
				
				$doc = $body.find("g > path[source='"+name+"'][destination='"+el+"']");
				$doc.css({"opacity":"1"});
				
				$doc = $body.find("g > path[source='"+el+"'][destination='"+name+"']");
				$doc.css({"opacity":"1"});
			});
		}
		return this;
	}
	
	module.init = function(){
		$doc = $("#x-view-content");
		
		$tableSearchInputBox = $doc.find("#ElementTemplateTableSearchInput-0");
		$tableSearchData = $doc.find("#svg-box");
		
		let _html = template("TemplateTableSearchTableInput-0",{isRun : true});
		$tableSearchInputBox.empty().html(_html);
		
		let _selectMap = new Map();
		this.httpGetSearchSelectOption({
			success : function(data){
				
				let $select0 = $tableSearchInputBox.find("[x-input-name='table']"),
					$select1 = $tableSearchInputBox.find("[x-input-name='keytype']");
				
				$select0.data("__cache",data);
				$select0.empty();
//				$select0.append('<option value="">请选择</option>');
				
				$.each(data, function(index,el) {
					let $option0 = $('<option value="'+el.tableName+'">'+el.dataName+'</option>');
					$select0.append($option0);
				});
				
				_this.bindEvent();
				$select0.next().find("dl dd:eq(0)").trigger("click");
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.NETWORK_ECHARTS={});