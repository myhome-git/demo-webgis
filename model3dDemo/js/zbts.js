var dblx = [///周边态势的临时数据
		"zjdls",
		"zls",
		"sjld",
		"zys",
		"zjdys"
	]
	var lldb = {
		title:"中美力量对比",
		dbmc:["台海冲突","南海群岛冲突"],
		year:[1993,2003,2010,2017],
		lllb:[{
			name:"中国打击美国空军基地的能力",
			lx:[
				["zjdls","zjdls","sjld","zys"],
				["zjdls","zjdls","zjdls","sjld"]
			]
		},
		{
			name:"美中空中优势对比",
			lx:[
				["zjdls","zls","zls","sjld"],
				["zjdls","zjdls","zls","zls"]
			]
		},
		{
			name:"美军的空域突防能力",
			lx:[
				["zls","sjld","sjld","sjld"],
				["zjdls","zjdls","zjdls","zls"]
			]
		},
		{
			name:"美军打击中国空军基地的能力",
			lx:[
				["sjld","zjdls","zls","zls"],
				["zjdls","zjdls","zjdls","zjdls"]
			]
		},
		{
			name:"中国军队的反水面战能力",
			lx:[
				["zjdls","zls","sjld","zys"],
				["zjdls","zjdls","zls","sjld"]
			]
		},
		{
			name:"美军的反水面战能力",
			lx:[
				["zjdls","zjdls","zls","zls"],
				["zjdls","zjdls","zjdls","zjdls"]
			]
		},
		{
			name:"美军的反太空战能力",
			lx:[
				["zys","zys","sjld","sjld"],
				["zys","zys","sjld","sjld"]
			]
		},
		{
			name:"中国军队的反太空战能力",
			lx:[
				["zjdls","zls","sjld","sjld"],
				["zjdls","zls","sjld","sjld"]
			]
		},
		{
			name:"美中网络战能力对比",
			lx:[
				["zjdls","zjdls","zls","zls"],
				["zjdls","zjdls","zls","zls"]
			]
		}],
		hwdnl : {
			name:"核稳定能力",
			ms:"（对二次核打击能力的信心）",
			year:[1993,2003,2010,2017],
			gj:[{
				gjmc:"中国",
				value:["初等自信","初等自信","初等自信","中度自信"]
			},{
				gjmc:"美国",
				value:["高度自信","高度自信","高度自信","高度自信"]
			}]
		}
	}
//初始化专题图图层
var zttLayer = null;
function initZTTOverlay(){

    if(!zttLayer){
		zttLayer = new ol.layer.Vector({
	        source: new ol.source.Vector(),
	        style: styleFunction
	      });
		BIGMap.getMap().addLayer(zttLayer);
    }
}
function newFeatureToMap(jb,point){
	var style = null;
	var JBKH = parseInt(jb.jbkh);
	var JBDH = parseInt(jb.jbdh);
	var JBCC = parseInt(jb.jbdx);
	var JBYS = jb.jbys;
	var src = basePath+'/resources/beyon/images/marker-gold.png';
	// var point = [parseFloat(node.jcqb.value.mb.jwd.jd),parseFloat(node.jcqb.value.mb.jwd.wd)];
	if (JBKH){
		src = basePath + '/page/webgis/jb/getJB?JBKH='+JBKH+'&JBDH='+JBDH+'&CC='+JBCC+'&JBYS='+JBYS
	}
	style = new ol.style.Style({
		image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
			anchor: [0.65, 21],
			anchorXUnits: 'fraction',
			anchorYUnits: 'pixels',
			scale: 0.7,
			src: src
		}))
	});
	return BIGMap.newMarker(point,0,style,null);
	 //return style;
}
//冲突
function addCTtoMap(node){
	var ele = $("<div>",{
		class:"zbts_box"
	})
	var zbts = $("<div class='zbts'>"
        +"<div class='zbts_tr'>"
        +"    <div class='zbts_td zbts_title zbts_lb'></div>"
        +"</div>"
        +"<div class='zbts_tr'>"
        +"</div>"
        +"</div>").appendTo(ele);
	var title = zbts.find('.zbts_tr').get(0);//$('.zbts .zbts_tr').get(0);
	var td = zbts.find('.zbts_tr').get(1);//$('.zbts .zbts_tr').get(1);
	$("<div>",{
		class:"zbts_td zbts_title zbts_mc",
		html:lldb.title
	}).appendTo(td);
	
	for(var i = 0; i < lldb.dbmc.length; i++){
		$("<div>",{
			class:"zbts_td zbts_title zbts_lb",
			html:lldb.dbmc[i]
		}).appendTo($(title));
		var year = $("<div>",{
			class:"zbts_td zbts_td_year",
			html:""
		}).appendTo(td);
		for(var j = 0; j < lldb.year.length; j++){
			$("<div>",{
				class:"zbts_td_cols",
				html:lldb.year[j]
			}).appendTo(year);
		}
	}

	for(var i = 0; i < lldb.lllb.length; i++){
		var tr = $("<div>",{
			class:"zbts_tr",
			html:""
		}).appendTo(zbts);
		$("<div>",{
			class:"zbts_td zbts_list",
			html:(i+1)+"."+lldb.lllb[i].name
		}).appendTo(tr);
		for(var j = 0; j < lldb.lllb[i].lx.length; j++){
			var color = $("<div>",{
				class:"zbts_td",
				html:""
			}).appendTo(tr);
			for(var k = 0; k < lldb.lllb[i].lx[j].length; k++){
				$("<div>",{
					class:"zbts_td_cols " + lldb.lllb[i].lx[j][k],
					html:""
				}).appendTo(color);
			}
		}
	}

	$('<table style="width: 100%; height:20px; float:left;"></table>').appendTo(zbts);

	var table_hdb = $("<table>",{
		'width':'500px',
		rules:'rows',
		class:"zbts_tr_hdb",
		html:""
	}).appendTo(zbts);
	var tr_hdb = $("<tr>",{

	}).appendTo(table_hdb);
	var rowspan = lldb.hwdnl.gj.length;
	var td_hdb = $("<td>",{
		rowspan:rowspan + 1,
		width:155,
		html:(lldb.lllb.length+1)+"."+lldb.hwdnl.name + "<br>" + lldb.hwdnl.ms
	}).appendTo(tr_hdb);
	$("<td>",{
		html:"国家"
	}).appendTo(tr_hdb);
	for(var i = 0; i < lldb.hwdnl.year.length; i++){
		$("<td>",{
			html:lldb.hwdnl.year[i]
		}).appendTo(tr_hdb);
	}
	for(var i = 0; i < lldb.hwdnl.gj.length; i++){
		tr_hdb = $("<tr>",{
			
		}).appendTo(table_hdb);
		td_hdb = $("<td>",{
			html:lldb.hwdnl.gj[i].gjmc
		}).appendTo(tr_hdb);
		for(var j = 0; j < lldb.hwdnl.gj[i].value.length; j++){
			 $("<td>",{
				html:lldb.hwdnl.gj[i].value[j]
			}).appendTo(tr_hdb);
		}
	}
	var dblx = [
		{
			lms:"巨大优势",
			c:"zjdls",
			rms:"巨大劣势"
		},
		{
			lms:"优势",
			c:"zls",
			rms:"劣势"
		},
		{
			lms:"势均力敌",
			c:"sjld",
			rms:"势均力敌"
		},
		{
			lms:"劣势",
			c:"zys",
			rms:"优势"
		},
		{
			lms:"巨大劣势",
			c:"zjdys",
			rms:"巨大优势"
		}
	];
	$('<table style="width: 100%; height:5px; float:left;"></table>').appendTo(zbts);
	var table_tlsm = $("<table>",{
		rules:'rows',
		class:"zbts_tr_tlsm",//width:169px;
		html:""
	}).appendTo(zbts);
	$('<th>',{
		html:"图例说明"
	}).appendTo(table_tlsm);
	var tr_tlsm = $('<tr>').appendTo(table_tlsm);
	$('<td>',{
		html:"美国军队能力"
	}).appendTo(tr_tlsm);
	$('<td>',{
		html:""
	}).appendTo(tr_tlsm);
	$('<td>',{
		html:"中国军队能力"
	}).appendTo(tr_tlsm);

	for(var i = 0; i < dblx.length; i++){
		tr_tlsm = $('<tr>').appendTo(table_tlsm);
		$('<td>',{
			html:dblx[i].lms,
			class:"zbts_lms"
		}).appendTo(tr_tlsm);
		var td_tlsm = $('<td>',{
			html:""
		}).appendTo(tr_tlsm);
		$('<div>',{
			class:"zbts_td_tlsm "+dblx[i].c
		}).appendTo(td_tlsm);
		$('<td>',{
			html:dblx[i].rms,
			class:"zbts_rms"
		}).appendTo(tr_tlsm);
	}
	var overlay = BIGMap.createOverLayZBTS();
	overlay.setElement(ele.get(0));
	var position = ol.proj.fromLonLat(
		[46.309878,39.055483]
	);
	overlay.setPosition(position);
	BIGMap.getMap().addOverlay(overlay);
	var drag = new glxDragCtrl();
	drag.startDrag(ele.get(0), ele.get(0), drag.vh);
	return overlay;
}
//驻军
function addZJToMap(node){
	var ele = $("<div>",{
		class:"zbts_box"
	})
	var zbts = $("<div class='zbts'></div>").appendTo(ele);
	var table = $("<table class='zbts_bdll' rules='rows'></table>").appendTo(zbts);
	var zj = node.jcqb;
	var tr = $("<tr>").appendTo(table);
	var td = $("<td>",{
		class:"zbts_bdll zbts_bdll_title"
	}).appendTo(tr);
	$("<div>",{
		html:zj.text
	}).appendTo(td);
	/*tr = $("<tr>").appendTo(table);
	td = $("<td>",{
		class:"zbts_bdll zbts_bdll_ms"
	}).appendTo(tr);
	$("<div>",{
		html:"总人数："+'zj.value.jlzs'
	}).appendTo(td);*/
	var zjlb = zj.value.arrSL;
	for(var i = 0; i < zjlb.length; i++){
		tr = $("<tr>").appendTo(table);
		td = $("<td>",{
			class:"zbts_bdll zbts_bdll_ms"
		}).appendTo(tr);
		/*$("<div>",{
			html:zjlb[i].jz
		}).appendTo(td);
		tr = $("<tr>").appendTo(table);
		td = $("<td>",{
			class:"zbts_bdll zbts_bdll_list"
		}).appendTo(tr);*/
		var html = "";
		if(zjlb[i].xysl){
			html = "现役："+zjlb[i].xysl;
		}else if(zjlb[i].zbzl){
			html = zjlb[i].zbzl;
		}
		if(zjlb[i].ybysl){
			html += "，预备役："+zjlb[i].ybysl;
		}else if(zjlb[i].sl){
			html += "：" + zjlb[i].sl;
		}
		if(zjlb[i].jz){
			html = zjlb[i].jz + " ( " + html + " ) ";
		}
		$("<div>",{
			html:html
		}).appendTo(td);
	} 
	var overlay = BIGMap.createOverLayZBTS();
	overlay.setElement(ele.get(0));
	var position = ol.proj.fromLonLat(
		[parseFloat(zj.value.jwd.jd),parseFloat(zj.value.jwd.wd)]
	);
	overlay.setPosition(position);
	BIGMap.getMap().addOverlay(overlay);
	var drag = new glxDragCtrl();
	drag.startDrag(zbts.get(0), zbts.get(0), drag.vh);
	node.overlay = [overlay];
	return overlay;
}

//军力对比/统计图表
function addJLDBToMap(node)
{
	var ele = $("<div>",{
		class:"zbts_box"
	});
	var zbts = $("<div class='zbts'></div>")
	.css('border-radius','60px')
	.css('padding','0')
	.appendTo(ele);
	var compare = $("<div id='compare'></div>").appendTo(zbts);
	var table = $("<table id='show' cellpadding='5' rules='rows' frame=below></table>").appendTo(compare);
	var arrJLDB = node.jcqb.value.b.arrZBT;//军力对比数据
	node.overlay = [];
	for(var ii = 0;ii < arrJLDB.length;ii++){
		var jldb = arrJLDB[ii];
		if(jldb.zbtmc == "中美冲突"){
			addCTtoMap();
			return 0;
		}
		var caption = $("<caption>",{
			html:jldb.zbtmc
		}).appendTo(table);
		
		//创建表头
		var tr = $("<tr>",{
			class:"jldb_tr_th",
			cellpadding:"3"
		}).appendTo(table);
		$("<th>",{
			html:""
		}).appendTo(tr);
		
		for(var i = 0;i < jldb.arrBT[0].arrZBT.length;i++)
		{	
			$("<th>",{
				html:jldb.arrBT[0].arrZBT[i].zbtmc
			}).appendTo(tr);
		}
		//添加数据
		for(var i = 0;i < jldb.arrBT.length;i++)
		{
			var tr = $("<tr>").appendTo(table);
			var jldblb = jldb.arrBT[i].arrZBT;
			$("<td>",{
				class:"jldb_tr_td_first",
				html:jldb.arrBT[i].btmc
			}).appendTo(tr);
			for(var j = 0;j < jldblb.length;j++)
			{
				$("<td>",{
					class:"jldb_tr_td_context",
					html:jldblb[j].sjz
				}).appendTo(tr);
			}
		}
		//实现拖拽功能
		var overlay = BIGMap.createOverLayZBTS();
		overlay.setElement(ele.get(0));
		var position = ol.proj.fromLonLat(
				[88.475405,36.326223]
		);
		overlay.setPosition(position);
		BIGMap.getMap().addOverlay(overlay);
		var drag = new glxDragCtrl();
		drag.startDrag(ele.get(0), ele.get(0), drag.vh);
		node.overlay.push(overlay);
	}
	
	
	return overlay;
}
//雷达导弹基地
function addLDJToMap(node){
	var dLayer = zttLayer;
	var point = [parseFloat(node.jcqb.value.mb.jwd.jd),parseFloat(node.jcqb.value.mb.jwd.wd)];
	var marker = newFeatureToMap(node.jcqb.value.jb,point);
	//marker.fdata = node.jcqb;
	//marker.fdata.point = point;
	
	BIGMap.addMarkerA(marker,dLayer);

	 var trackTooltipElement = document.createElement('div');
     trackTooltipElement.className = 'zbts_tooltip';
     trackTooltipElement.innerHTML=node.jcqb.text;
     trackTooltipElement.style.display = "none";
     

	var overlay = BIGMap.createOverLayZBTS([14,8],'center-left');
	overlay.setElement(trackTooltipElement);
	var position = ol.proj.fromLonLat(
		point
	);
	overlay.setPosition(position);
	BIGMap.getMap().addOverlay(overlay);
	marker.overlay = overlay;
	//node.overlay = overlay;
	//node.layer = dLayer;
	node.mapdata = Array();
	node.mapdata.push({marker:[marker],layer:dLayer});
	return {marker:[marker],layer:dLayer};
}
var ddFeature = [];
var chinaLine = null;
var isCL = true;	//是否画中国边界
function addFWCircleToMap(node){
	//addLDJToMap(node);
	//var dd = node.jcqb;
	var text = "";
	var point = {
		name:"",
		points:[]
	}
	var style;
	if(node){
		isCL = false;
		var childNodes = node.children;
		for(var i = 0; i < childNodes.length; i++){
			var child = childNodes[i];
			if(child.checked){
				if(child.jcqb.value.zybj && child.jcqb.value.zybj.bj != ""){//没有作用半径，就不画圈
					point.points.push({
						x:parseFloat(child.jcqb.value.mb.jwd.jd),
						y:parseFloat(child.jcqb.value.mb.jwd.wd),
						r:parseInt(child.jcqb.value.zybj.bj)*1000
					});
				}
			}
		}
		style = new ol.style.Style({
		  stroke: new ol.style.Stroke({
		    width: node.jcqb.value.line.xk,
		    color: node.jcqb.value.line.xys
		  }),
		  fill: new ol.style.Fill({
		    color: [255, 255, 255, 0]
		  })
		});
	}else{
		//ddNode = null;
		point.points.push({
			x:106.339175,
			y:34.045866,
			r:1
		});
		style = new ol.style.Style({
		  stroke: new ol.style.Stroke({
		    width: 2,
		    color: [255, 0, 0, 1]
		  }),
		  fill: new ol.style.Fill({
		    color: [255, 255, 255, 0]
		  })
		});
	}

	mergeCircle(point,style);
}
//mergeCircle(p,style);
function mergeCircle(p,style,node) {
	var url = CONFIG.ZTTCHINA + JSON.stringify(p);
	if(!isCL){
		url = CONFIG.ZTTSFWRH + JSON.stringify(p);
	}
    $.ajax({
        type: "POST",
        //url: CONFIG.ZTTSFWRH + JSON.stringify(p),
        url: CONFIG.ZTTSFWRH + JSON.stringify(p),
        dataType: "json",
        processData: true,
        error: function (req, status, error) {

            if (status == "timeout") {

                alert("请求超时，请稍后再试!！");
                return;
            } else if (status === "error") {

                alert("数据请求失败，请稍后再试!如果还未解决，请联系管理员！");
                return;
            }
            return;
        },
        success: function (obj) {
            //无区域坐标时不绘制
            if (!obj.polys || obj.polys.length < 1) {
              //  alert("该区域无polygon数据！");
                return;
            }
            var wkt = new ol.format.WKT();
            var feature = wkt.readFeature(obj.polys[0]);
            
            //ddNode.feature = feature;
            if(style){
               feature.setStyle(style);
            }
            //feature.tId = ddNode.tId;
            zttLayer.getSource().addFeature(feature);
            //if()
            
            if(isCL){
            	chinaLine = {marker:feature,layer:zttLayer};
            }else{
            	ddFeature.push({marker:feature,layer:zttLayer});
            }
           // if(ddNode){
            //	ddNode.circledata = fDate;
            //}
        },
        async:false
    });
}

function lineTo(start, end,name) {
   
    var line = new ol.geom.LineString();
    line.appendCoordinate(start);
    line.appendCoordinate(end);
    var finalLine = line.transform("EPSG:4326","EPSG:3857");
    var feature = new ol.Feature({
    	geometry:finalLine,
    	name:name
    });
    
    BIGMap.getDydLayer().getSource().addFeature(feature);
  }
function drawLineString(node){
	var qdjwd = node.jcqb.value.qdjwd;
	var start = [parseFloat(qdjwd.jd),parseFloat(qdjwd.wd)];
	var zdjwd = node.jcqb.value.zdjwd;
	var end = [parseFloat(zdjwd.jd),parseFloat(zdjwd.wd)];
	var name = node.jcqb.text;
	var dx = end[0] - start[0];
	var dy = end[1] - start[1];
	var rotation = Math.atan2(dy,dx);
	var linegeom = new ol.geom.LineString();
	linegeom.appendCoordinate(ol.proj.fromLonLat(start));
	linegeom.appendCoordinate(ol.proj.fromLonLat(end));
	var length = linegeom.getLength();
	var linefeature = new ol.Feature({
		geometry:linegeom,
		name:name + length + "米"
	});
	var style = {
			jt:true,
	    	image:null,
	    	stroke:{
	    		color:node.jcqb.value.line.xys,
	    		width:parseInt(node.jcqb.value.line.xk)
	    	},
	    	fill:{
	    		color:'rgba(0,0,0,0)'
	    	},
	    	text:{
	    		fcolor:'white',
	    		color:node.jcqb.value.line.xys,
	    		font:"bold 10px Verdana"
	    	},
	    	res:length/150
	    }
	linefeature.style = style;
	zttLayer.getSource().addFeature(linefeature);
	node.mapdata = Array();
	node.mapdata.push({marker:[linefeature],layer:zttLayer});
}
var color = [
	{
		fill:"#aaa",
		color:"#fff"
	},
	{
		fill:"#fff",
		color:"#aaa"
	},
	{
		fill:"#eee",
		color:"#f0f"
	}
];
var colorid = 0;
function drawDaoLian(node){
	var datas = node.jcqb.value.arrJWD;
	var dline = new ol.geom.LineString();
	var point;
	for(i in datas){
		point = [parseFloat(datas[i].jd),parseFloat(datas[i].wd)];
		dline.appendCoordinate(ol.proj.fromLonLat(point));
	}
	var dlineFeature = new ol.Feature({
		geometry:dline,
		name:node.jcqb.text
	});
	dlineFeature.fillcolor = "#fff";
	dlineFeature.storkcolor = node.jcqb.value.line.xys;
	dlineFeature.linedash = node.jcqb.value.line.xx;
	dlineFeature.linewidth = parseInt(node.jcqb.value.line.xk);
	dashLine.getSource().addFeature(dlineFeature);
	node.mapdata = Array();
	node.mapdata.push({marker:[dlineFeature],layer:dashLine});
	//colorid++;
	//if(colorid > 2){
	//	colorid = 0;
	//}
}
function drawXJFX(node){
	var points = [];
	for(var i = 0;i < node.jcqb.value.arrWZD.length;i++){
		points.push(ol.proj.fromLonLat([
			parseFloat(node.jcqb.value.arrWZD[i].jd), 
			parseFloat(node.jcqb.value.arrWZD[i].wd)
		]));
	}
    //创建进攻队尾符号
     var attackpoly = P.PlotFactory.createPlot(P.PlotTypes.TAILED_ATTACK_ARROW,points);
     var attackFeature = new ol.Feature({
    	 name:node.jcqb.value.text,
         geometry:attackpoly
     });
     
     //设置样式
     attackFeature.setStyle(
         new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(128,128,128,0.4)',
                    width: 0
                }),
                fill:new ol.style.Fill({
                    color: 'rgba(128,128,128,0.4)'
                })
            })
        );
     var style = {
    		 text:{
    			 color:'black',
    			 fcolor:'white',
    			 font:"bold 10px Verdana"
    		 }
     };
    attackFeature.style = style;
    zttLayer.getSource().addFeature(attackFeature);
    node.mapdata = Array();
	node.mapdata.push({marker:[attackFeature],layer:zttLayer});
}
function addPolygonToMap(node){
	
	var datas = [];
	var jwd = node.jcqb.value.arrJWD;
	for(var i = 0;i < jwd.length;i++){
		datas.push([
			parseFloat(jwd[i].jd),
			parseFloat(jwd[i].wd)
		]);
	}
    var gemo = new ol.geom.Polygon();
    for (i in datas) {
        datas[i] = ol.proj.fromLonLat(datas[i]);
    }
    gemo.setCoordinates([datas]);
    var gFeature = new ol.Feature({
        geometry: gemo,
        name: node.jcqb.text
    });//dashLine
    var style = {
    	image:null,
    	stroke:{
    		color:node.jcqb.value.line.xys,
    		width:node.jcqb.value.line.xk
    	},
    	fill:{
    		color:'rgba(0,0,0,0)'
    	},
    	text:{
    		fcolor:'white',
    		color:node.jcqb.value.line.xys,
    		font:"bold 10px Verdana"
    	}
    }
    gFeature.style = style;
    zttLayer.getSource().addFeature(gFeature);
    //dashLine.getSource().addFeature(gFeature);
    node.mapdata = Array();
	node.mapdata.push({marker:[gFeature],layer:zttLayer});
};
//画一个圈，圈内标出半径的直线,机动部署
function addCircleLineToMap(center, randius, style,mc){
	 var maxCircle = new ol.geom.Circle(center,randius);
	 var feature = [];
	 var feature1 = new ol.Feature({
		 geometry:maxCircle
	 });
	 var linecolor = style.color.line;
	 var fillcolor = style.color.fill;
	 var s = {
    	image:null,
    	stroke:{
    		color:linecolor,
    		width:2
    	},
    	fill:{
    		color:fillcolor
    	},
    	text:{
    		fcolor:'white',
    		color:linecolor,
    		font:"bold 10px Verdana"
    	}
    }
	 feature1.style = s;
	 feature.push(feature1);
	 if(style.haveline){
		 var x = center[0]+randius * Math.cos(degreeToRadian(style.degree));
		 var y = center[1]+randius * Math.sin(degreeToRadian(style.degree));
		 var line = new ol.geom.LineString();
		 line.appendCoordinate(center);
		 line.appendCoordinate([x,y]);
		 var feature2 = new ol.Feature({
			 geometry:line,
			 name:mc+"的打击范围："+randius+"m"
		 });
		 feature2.style = s;
		 feature.push(feature2);
	 }
	 //BIGMap.getZBTSLayer().getSource().addFeatures(feature);
	 zttLayer.getSource().addFeatures(feature);
	// node.mapdata = Array();
	//node.mapdata.push({marker:feature,layer:BIGMap.getZBTSLayer()});
	 return {marker:feature,layer:zttLayer};
}
function addCircleToMap(node, style){
	var center = ol.proj.fromLonLat([parseFloat(node.jcqb.value.jwd.jd),parseFloat(node.jcqb.value.jwd.wd)]);
	var randius = parseInt(node.jcqb.value.bj)*1000;
	var style = {
			color:{
				line:node.jcqb.value.tcs,
				fill:node.jcqb.value.tcs
			},
			haveline:false,
			degree:0
		}
	 node.mapdata = Array();//为什么用array？肯定有原因，不记得当时考虑的是什么了
	node.mapdata.push(addCircleLineToMap(center, randius, style));
}//机动部署
// var wlt = new WLT(BIGMap.getWltLayer());
function addZCTXToMap(opt){//侦查体系
	
    //wlt.createJJQ(); 
    var center = opt.center;
    //扇形方位角初始为0
    var azimuth = 0;
    //扇形覆盖角度为30
    var covdegree = 30;
    //覆盖半径
    var randius = opt.randius;
    var marker = [];
    
    var radarScan = function(event)
    {
   	 //获取事件的上下文环境
   	// var vectorContext = event.vectorContext;
   	 var m = [];
   	 azimuth++;
   	 azimuth = azimuth % 360;
   	 var f= wlt.createSectorFW(center,azimuth,covdegree,randius,null);
   
   	BIGMap.getWltLayer().getSource().clear();
     
   	BIGMap.getWltLayer().getSource().addFeature(f);
   	 m.push(f);
   	 //wlt.createCircle(center,randius);
   	 marker=m;
   	// BIGMap.getMap().render();
    };
    //BIGMap绑定postcompose事件，该事件在feature改变时自动触发页面重绘功能
    BIGMap.getMap().getView().setCenter(center);
    var en = window.setInterval(radarScan, 10);
    //BIGMap.getMap().on('postcompose', radarScan);
  //  BIGMap.getMap().render();
    return {marker:marker,layer:BIGMap.getWltLayer(),en:en};
}
function addJDBSTXToMap(node, style){
	node.mapdata = Array();
	if(node.jcqb.value.djtx){
		var center = ol.proj.fromLonLat([
			parseFloat(node.jcqb.value.djtx.tcbj.qdjwd.jd),
			parseFloat(node.jcqb.value.djtx.tcbj.qdjwd.wd)
		]);
		var randius = parseInt(node.jcqb.value.djtx.tcbj.bj)*1000;
		var jiaodu = parseInt(node.jcqb.value.djtx.tcbj.mctag.mcjiaoDu);
		if(!jiaodu) jiaodu = 0;
		var style = {
			color:{
				line:node.jcqb.value.djtx.line.xys,
				fill:'rgba(0,0,0,0)'
			},
			haveline:true,
			degree:jiaodu
		}
		var opt = {
			center:center,
			randius:randius
		}
		//addZCTXToMap(opt);
		
		node.mapdata.push(addCircleLineToMap(center, randius, style,node.jcqb.value.djtx.zbmc));
		//node.mapdata.push(addZCTXToMap(opt));
	}
	
	var point = [parseFloat(node.jcqb.value.mb.jwd.jd),parseFloat(node.jcqb.value.mb.jwd.wd)];
	var marker = newFeatureToMap(node.jcqb.value.jb,point);
	//marker.fdata = node.jcqb;
	//marker.fdata.point = point;
	
	BIGMap.addMarkerA(marker,zttLayer);

	 var trackTooltipElement = document.createElement('div');
     trackTooltipElement.className = 'zbts_tooltip';
     trackTooltipElement.innerHTML=node.jcqb.text;
     trackTooltipElement.style.display = "none";
     

	var overlay = BIGMap.createOverLayZBTS([14,8],'center-left');
	overlay.setElement(trackTooltipElement);
	var position = ol.proj.fromLonLat(
		point
	);
	overlay.setPosition(position);
	BIGMap.getMap().addOverlay(overlay);
	marker.overlay = overlay;
	node.mapdata.push({marker:[marker],layer:zttLayer});
	
}
function removeCircleMap(){
	if(ddFeature){
		for(var i = 0;i < ddFeature.length;i++){
			BIGMap.removeMarker(ddFeature[i].marker,ddFeature[i].layer);
		}
		ddFeature = [];
	}
}
function removeChinaMap(){
	if(chinaLine){
		BIGMap.removeMarker(chinaLine.marker,chinaLine.layer);
	}
}
function addChinaMap(){
	if(chinaLine){
		BIGMap.addMarkerA(chinaLine.marker,chinaLine.layer);
	}
}
function drawQXToMap(node){
	if(!node.checked){
		return 0;
	}
	var children = [];// = node.children;
	var geoCoord = {};
	var lineData = [];
	var pointData = [];
	var i = 0;
	for(i = 0;i < node.children.length;i++){
		if(node.children[i].point){
			children.push(node.children[i]);
			geoCoord[node.children[i].name] = node.children[i].point;
			lineData.push([
				{name:children[0].name},
				{
					name:node.children[i].name,
					value:100
				}
			]);
			pointData.push(
				{
					name:node.children[i].name,
					value:100
				}
			);
		}
	}
	var option = {
            color: ['gold', 'aqua', 'lime'],
            /*dataRange: {
                min: 0,
                max: 100,
                range: {
                    start: 10,
                    end: 90
                },
                x: 'right',
                calculable: true,
                color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
                textStyle: {
                    color: '#fff'
                }
            },*/
            series: [
                {
                    name: '北京',
                    type: 'map',
                    mapType: 'none',
                    data: [],
                    geoCoord: geoCoord,

                    markLine: {
                        smooth: true,
                        effect: {
                            show: true,
                            scaleSize: 1,
                            period: 30,
                            color: '#fff',
                            shadowBlur: 10
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                lineStyle: {
                                    type: 'solid',
                                    shadowBlur: 10,
                                    color:'red'
                                }
                            }
                        },
                        data: lineData
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 10 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0,
                            color:'blue'
                        },
                        itemStyle: {
                            normal: {
                                label: {show: false}
                            }
                        },
                        data: pointData
                    }

                }
            ]
        };
	var olMapExt;
    BIGMap.getMap().once('postrender', function (e) {
        console.log('aa');
        if (olMapExt !== undefined)
            return;
        olMapExt = new OpenLayer3Ext(map, echarts);
        var container = olMapExt.getEchartsContainer();
        var myChart = olMapExt.initECharts(container);
        window.onresize = myChart.resize;
        olMapExt.setOption(option, true);
    });
    BIGMap.getMap().render();
		                    
	          
}
function zttstTable() {
    $("#zttst_table").datagrid({
        width: 450, //宽度
        height: 162, //高度
        selectOnCheck: false,
        checkOnSelect: false,
        url: "page/ztt/getAllZT", //请求路径
        method:"post",
        showHeader:false,
        loadMsg:"正在加载，请稍候...",
        checkbox:false,
        columns: [[
        { field: "MC", title: "文件名称", width: 140 },
        { field: "WJCD", title: "文件大小", width: 70 },
        //态势介绍
        { field: "JS", title: "态势介绍", width: 258}
        ]],
        onClickRow:function(index, row){
        	$('#zttst_table').datagrid('unselectRow',index);
        },
        onDblClickRow :function(index, row ){
        	$('.btn_pro').css("display","none");
        	showZTTTree("ztt_tree",row.CPID);
        },
        onLoadError: function () {
            var i = 0;
        },
        loadFilter:function(data){
        	//return data.allZT;
        	var list = [];
        	var zt = data.jsonTree.allZT;
        	for(var i = 0;i < zt.length; i++){
        		list.push({
        			CPID:zt[i].CPID,
        			JS:zt[i].JS,
        			MC:zt[i].MC,
        			WJCD:zt[i].WJCD
        		});
        	}
        	return list;
        },
        //传输参数
        pagination: true,
        pageSize: 5,
        pageList: [5, 10, 15, 20, 30]
    });
    $("#zttst_table").datagrid('getPager').pagination({
        beforePageText: "第",
        afterPageText: "页",
        displayMsg: "共 {total} 条数据, 当前为{from} - {to} 条数据"
    });
}