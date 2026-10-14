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
	
	module.httpGetDataById = function(option){
		let _data = {
			"table": "ts_poyi",
			"opt": {
				"keytype": "0014"
			}
		};
		let _sendData = JSON.stringify(_data);
		xUtilBase.ajax({
			url : "/data-server/graph/layout",
			contentType : "application/json;charset=UTF-8",
			type : "post",
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
					console.info(result.msg);
				}
			}
		});
	}
	
	module.initPanel = function(data){
		// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/
		var links = [];
		$.each(data.data, function(index,el) {
			links.push({
				source: el.source,
				target: el.destination, 
				type: (function(){
					let _type;
					if(el.count<100){
						_type = "1";
					}else if(el.count<200){
						_type = "2";
					}else if(el.count<300){
						_type = "3";
					}else if(el.count<400){
						_type = "4";
					}else{
						_type = "5";
					}
					return _type;
				})(),
				rela:el.count
			});
		});
//		var links = [
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "3", rela:"自身"},
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "1", rela:"股东(机构)"},
//		    {source: "[企业名已脱敏]", target: "[人名已脱敏]", type: "2", rela:"法人(自然人)"},
//		    {source: "[人名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"相关公司"},
//		    // {source: "[人名已脱敏]", target: "[企业名已脱敏]", type: "3", rela:"股东"},
//		    // {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"股东(机构)"},
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"对外投资"},
//		    // {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"股东"},
//		    // {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"股东"},
//		 
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"股东(机构)"},
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"对外投资"},
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"相同地址,相同法人"},
//		    {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"相同地址,相同法人"},
//		 
//		    // {source: "[人名已脱敏]", target: "[企业名已脱敏]", type: "2", rela:"相关公司"},
//		    // {source: "[企业名已脱敏]", target: "[企业名已脱敏]", type: "resolved", },
//		];
		 
		var nodes = {};
		 
		links.forEach(function(link) {
		  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});
		
		let $body = $("#x-hidden-window");
		var width = $body.outerWidth(),
		    height = $body.outerHeight();
		var corpname = "xxx";
		var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
		    .nodes(d3.values(nodes))//设定节点数组
		    .links(links)//设定连线数组
		    .size([width, height])//作用域的大小
		    .linkDistance(50)//连接线长度
		    .charge(-4000)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
		    .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
		    .start();//开始转换
		
		let _d3_zoom = d3.behavior.zoom();
		_d3_zoom.scaleExtent([0.2,10])
			.on("zoom",function(){
//				svg.selectAll("g").attr("transform","scale("+d3.event.scale+")");
				svg.selectAll("g").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");
//				$box.css({
//					"transform":"scale("+d3.event.scale+")"
//				});
//				let $svg = $box.find(">svg"),
//					_width = $svg.attr("width"),
//					_height = $svg.attr("height");
//					
//				_width = Number(_width)*d3.event.scale;
//				_height = Number(_height)*d3.event.scale;
//				
//				console.info($svg,_width,_height,d3.event.scale);
//				svg.attr("width",$svg.outerWidth());
//				svg.attr("height",$svg.outerHeight());
//				svg.selectAll("g").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");
//				svg.selectAll("path").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");
//				svg.selectAll("textPath").attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");
			});
		
		function onDrag(){//拖拽函数
		    return force.drag()
		        .on("dragstart",function(d){
		            d3.event.sourceEvent.stopPropagation(); //取消默认事件
		            d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
		        });
		}
		
		let $box = $("#svg-box");
			$box.css({"width":width+"px","height":height+"px"});
			
		var svg = d3.select("#svg-box").append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .call(_d3_zoom);
		
		
		//箭头
		var marker=
		    svg.append("g").append("marker")
		    //.attr("id", function(d) { return d; })
		    .attr("id", "resolved")
		    //.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
		    .attr("markerUnits","userSpaceOnUse")
		    .attr("viewBox", "0 -5 10 10")//坐标系的区域
		    .attr("refX",39)//箭头坐标
		    .attr("refY", 0)
		    .attr("markerWidth", 8)//标识的大小
		    .attr("markerHeight", 8)
		    .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
		    .attr("stroke-width",2)//箭头宽度
		    .append("path")
		    .attr("d", "M0,-5L10,0L0,5")//箭头的路径
		    .attr('fill','#595D68');//箭头颜色
		 
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
		var edges_line = svg.append("g").selectAll(".edgepath")
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
		          'id':function(d,i) {return 'edgepath'+i;}})
		    .style("stroke",'#ffffff')
		    .style("pointer-events", "none")
		    .style("stroke-width",1)//线条粗细
		    .attr("marker-end", function(d){
		        if(d.rela=='自身'){
		            return ''
		        }else{
		            return 'url(#resolved)'
		        }
		    } );//根据箭头标记的id号标记箭头
		 
		var edges_text = svg.append("g").selectAll(".edgelabel")
		.data(force.links())
		.enter()
		.append("text")
		.style("pointer-events", "none")
		//.attr("class","linetext")
		.attr({  'class':'edgelabel',
		               'id':function(d,i){return 'edgepath'+i;},
		               'dx':60,
		               'dy':-5
		               //'font-size':10,
		               //'fill':'#aaa'
		               });
		 
		//设置线条上的文字
		edges_text.append('textPath')
		.attr('xlink:href',function(d,i) {return '#edgepath'+i})
		.style("pointer-events", "none")
		.text(function(d){return d.rela;});
		 
		//圆圈

		//圆圈的提示文字 根据需要到数据库中进行读取数据
		var tooltip = d3.select("body")
		.append("div")//添加div并设置成透明
		.attr("class","tooltip")
		.style("opacity",0.0);
		
		
		function set_tooltip(name){//设置提示内容
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

		var circle = svg.append("g").selectAll("circle")
		    .data(force.nodes())//表示使用force.nodes数据
		    .enter().append("circle")
		    .style("fill",function(node){
		        var color;//圆圈背景色
		        var link=links[node.index];
		        // console.log(link.name)
		        if(link){
		              console.log(link.rela)
		            if(link.type == "1"){ //p2p
		                return color="#C03939"; 
		            }else if(link.type == "3"){
		                return color="#5095FF"; 
		            }else if(link.source.name.length <= 4){//人
		                return color="#CD994C"; 
		            }else { 
		                return color = '#1943AC'
		            }
		        }
		    })
		    .style('stroke',function(node){ 
		        var color;//圆圈线条的颜色
		        var link=links[node.index];
		        if(link){
		              console.log(link.rela)
		            if(link.type == "1"){ //p2p
		                return color="#C03939"; 
		            }else if(link.type == "3"){
		                return color="#5095FF"; 
		            }else if(link.source.name.length <= 4){//人
		                return color="#CD994C"; 
		            }else { 
		                return color = '#1943AC'
		            }
		        }
		        // return color;
		    })
		    .attr("r", 20)//设置圆圈半径
		    .on("click",function(node){
		        //单击时让连接线加粗
		        edges_line.style("stroke-width",function(line){
		            // console.log(line);
		            if(line.source.name==node.name || line.target.name==node.name){
		                return 4;
		            }else{
		                return 0.5;
		            }
		        });
		        circle.style('stroke-width',1);//所有的圆圈边框
		        d3.select(this).style('stroke-width',4);//被选中的圆圈边框
		
		    })
		    .on("dblclick",function(d){
		        //双击节点时节点恢复拖拽
		        d.fixed = false;
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
		    .call(onDrag);
		
			svg.selectAll("g").call(onDrag);//为svg下的所有g标签添加拖拽事件
			svg.on("dblclick.zoom", null);//取消svg和圆圈的双击放大事件（d3中默认开启7个事件，关闭防止与上面的双击事件冲突）
			circle.on("dblclick.zoom", null);
		 
		  //圆圈的提示文字
		   circle.append("svg:title")  
		         .text(function(node) { 
		             var link=links[node.index];
		             // if(node.name==link.source.name && link.rela=="主营产品"){
		             //     return "双击可查看详情"
		             // }
		          });  
		var text = svg.append("g").selectAll("text")
		    .data(force.nodes())
		    //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
		    .enter()
		    .append("text")
		    .attr("dy", ".35em")  
		    .attr("text-anchor", "middle")//在圆圈中加上数据  
		    .style('fill',function(node){
		        var color;//文字颜色
		        var link=links[node.index];
		        // if(node.name==link.source.name && link.rela=="主营产品"){
		        //     color="#B43232";
		        // }else{
		        //     color="#A254A2";
		        // }
		        return color =  '#ffffff';
		    }).attr('x',function(d){
		        // console.log(d.name+"---"+ d.name.length);
		        var re_en = /[a-zA-Z]+/g;
		        //如果是全英文，不换行
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
	
	module.init = function(){
		$doc = $("#x-view-content");
		this.httpGetDataById({
			data : {},
			success : function(data){
				_this.initPanel(data);
			}
		});
		
	};
	
})(jQuery,_pageObject,_pageObject.NETWORK_ECHARTS={});