function dataPoint(swmx){
	var that = this;
	this.mx = {
		nm:swmx.nm,
		tip:swmx.tip,
		alt:swmx.alt,
		view:swmx.view,
		res:swmx.res,
		pos:swmx.pos,
		was:swmx.was,
		tcfw:Array(),
		data:null
	};
	//点击探测范围列表时触发
	this.clickTcfw = function(obj){
		var tclass = $(obj).attr('bj_class');
		$(obj).toggleClass(tclass,!($(obj).is('.'+tclass)));
	};
	//判断以tcfwid为id的探测范围是否存在
	this.isExitTcfw = function(tcfwid){
		for(var i = 0; i < this.mx.tcfw.length; i++){
			var tf = this.mx.tcfw[i];
			if(tf.fwid == tcfwid){
				return {id:i};
			}
		}
		return false;
	};
	//清除探测范围
	this.clearTcfw = function(){
		for(var i = 0; i < this.mx.tcfw.length; i++){
			var tf = this.mx.tcfw[i];
			BIGMap.getOL3d().getDataSourceDisplay().defaultDataSource.entities.removeById(tf.fwid);
		}
		this.mx.tcfw.splice(0,this.mx.tcfw.length);
		var obj = this.mx.tip.zzxn.get(0).childNodes;//探测范围
		for(var i = 0; i < obj.length; i++){
			$(obj[i]).removeClass($(obj[i]).attr('bj_class'));
		}
		return false;
	};
	//显示探测范围
	this.showTcfw = function(id,xnlxcode,zylxcode, text, center, alt, r, color, outlinecolor){
		var isExit = this.isExitTcfw(id);
		if(isExit){
			BIGMap.getOL3d().getDataSourceDisplay().defaultDataSource.entities.removeById(id);
			this.mx.tcfw.splice(isExit.id,1);
		}else{
			if(zylxcode==4){
				drawArea(id, text, center, alt, r, color, outlinecolor);
				this.mx.tcfw.push({fwid:id});
				return ;
			}else if(xnlxcode == 1){
				if(zylxcode == 1 || zylxcode==2){
					drawCoverage(id, text, center, alt, r, color, outlinecolor,4,12);
				}
				else{
					drawCoverage(id, text, center, alt, r, color, outlinecolor,1,12);
				}
			}
			else if(xnlxcode == 2){
				drawCoverage(id, text, center, alt, r, color, outlinecolor,1,36);
			}
			this.mx.tcfw.push({fwid:id});
		}
	};
	//关闭该模型下的  jquery_window
	this.closeWindow = function(){
		var act = 'close';
		this.mx.tip.txsj.window(act);
		this.mx.tip.ldcs.window(act);
		this.mx.tip.txxh.window(act);
		this.mx.tip.mxbox.window(act);
		this.mx.tip.zbxx.window(act);
		
	};
	this.clearStyle = function(){
		this.closeWindow();
		var o = this.mx.tip.y;
		for(var i = 0; i < o.length; i++){
			o[i].removeClass(o[i].attr('t_class'));
		}
		this.mx.tip.jbxx.css('display','none');
		this.mx.tip.zzxn.css('display','none');
	};
	//隐藏该三维模型的圆圈
	this.hide = function(){
		this.closeWindow();
		this.mx.tip.t.css('display','none');
		this.mx.tip.isShow = false;
	};
	//显示作战战法
	this.showZzzf=function(o,mx){
		$.ajax({
			type:"POST",
			dataType:"json",
			url:basePath+"/page/webgis/swmx/getZZZF",
			data:{ZBNM:that.mx.data.zbnm},
			success:function(data){
				var zbxx = data.zzzf;
				mx.tip.zzhzj.empty();
			    $('<div>',{
			    	text:"作战战法",
			    	class:"box_list_title"
			    }).appendTo(mx.tip.zzhzj);
			    $('<div>',{
			    	class:"swmx_zbxx",
			    	html:zbxx
			    }).appendTo(mx.tip.zzhzj);
			    mx.tip.zbxx.window({title:"作战战法",closed:false});
			    Undo(mx.tip.mxjb,mx.tip.zzhzj);
			},
			error:function(data){}
		});
//		var zbxx = mx.data.entityZBXX;
//		mx.tip.zzhzj.empty();
//	    $('<div>',{
//	    	text:"作战战法",
//	    	class:"box_list_title"
//	    }).appendTo(mx.tip.zzhzj);
//	    $('<div>',{
//	    	class:"swmx_zbxx",
//	    	html:zbxx.zzzf_TEXT
//	    }).appendTo(mx.tip.zzhzj);
//	    mx.tip.zbxx.window({title:"作战战法",closed:false});
//	    Undo(mx.tip.mxjb,mx.tip.zzhzj);
	};
	//显示活动规律
	this.showHdgl=function(o,mx){
		$.ajax({
			type:"POST",
			dataType:"json",
			url:basePath+"/page/webgis/swmx/getHDGL",
			data:{ZBNM:that.mx.data.zbnm},
			success:function(data){
				//var zbxx = data.entityZBXX;
				mx.tip.zzhzj.empty();
				mx.tip.zbxx.window({title:"活动规律",closed:false});
				var imgbox = $('<div>',{
					style:"position:relative;opacity: 0;width:100%;height:100%;overflow:hidden;"
				}).appendTo($('<div>',{
					style:"position:relative;width:100%;height:340px;overflow:hidden;"
				}).appendTo(mx.tip.zzhzj));
				var pic = data.hdglt;//zbxx.arrHDGLT;
			   for(var i = 0; i < pic.length; i++){
				   $("<img>",{
					   src:basePath + "/page/jcqb/showPicHDGLT/"+pic[i].zbnm+"_"+pic[i].mtnm
				   }).appendTo(imgbox);
			   }
			   showPic_mx(imgbox);
			    $('<div>',{
			    	class:"swmx_zbxx",
			    	html:data.hdgl
			    }).appendTo(mx.tip.zzhzj);
			    Undo(mx.tip.mxjb,mx.tip.zzhzj);
			},
			error:function(data){}
		});
		
	};
	//显示指挥员信息
	this.showZhg=function(o,mx){
		//var zbxx = mx.data.entityZBXX;
		//var drawinfo = mx.data.drawInfo;
		$.ajax({
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getJzInfo",
	       data:"ZBNM="+mx.data.zbnm,
	       success:function(data)
	       {
	    	   var box = mx.tip.zzhzj;
	    	   box.empty();
	    	   mx.tip.zbxx.window({title:"指挥员信息",closed:false});
			   Undo(mx.tip.mxjb,mx.tip.zzhzj);
			   if(!data.entityRW){
				   return false;
			   }
	    	   var line = $('<div>',{
		   	    	class:"box_info_list_img"
		   	    }).appendTo(box);
	    	   var img_box = $('<div>',{
		   	    	class:"box_img"
		   	    }).appendTo(line);
	    	   $('<img>',{
		   	    	src:basePath+"/page/jcqb/showPicRWQK/"+data.entityRW.rwnm+"_"+data.entityRW.arrPic[0].mtnm,
		   	    }).appendTo(img_box);
	    	   line = $('<div>',{ class:"box_info_list" }).appendTo(line);
	    	   $('<div>',{ text:"姓名", title:"姓名", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.xmforOrg, title:data.entityRW.xmforOrg, class:"box_info_content" }).appendTo(line);
		   	   var xbmc = "";
		   	   if(data.entityRW.xb.mc != null)
		   		   xbmc = data.entityRW.xb.mc;
		   	   $('<div>',{ text:"姓别", title:"姓别", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:xbmc, title:xbmc, class:"box_info_content" }).appendTo(line);
	    	   //国家地区
		   	   $('<div>',{ text:"国家", title:"国家", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.gjdq.mc?data.entityRW.gjdq.mc:"", title:data.entityRW.gjdq.mc?data.entityRW.gjdq.mc:"", class:"box_info_content" }).appendTo(line);

			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	$('<div>',{ text:"出生地", title:"出生地", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.csd, title:data.entityRW.csd, class:"box_info_content" }).appendTo(line);
			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	$('<div>',{ text:"文化程度", title:"文化程度", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.whcd, title:data.entityRW.whcd, class:"box_info_content" }).appendTo(line);
			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	$('<div>',{ text:"任职单位", title:"任职单位", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.rzdwforOrg, title:data.entityRW.rzdwforOrg, class:"box_info_content" }).appendTo(line);
			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	$('<div>',{ text:"任职时间", title:"任职时间", class:"box_info_title"}).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.rzsj?data.entityRW.rzsj:"", title:data.entityRW.rzsj?data.entityRW.rzsj:"", class:"box_info_content"}).appendTo(line);
			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	var zwmc = "";
			   	if(data.entityRW.zw.mc != null)
			   		zwmc = data.entityRW.zw.mc;
			   	$('<div>',{ text:"职务", title:"职务", class:"box_info_title" }).appendTo(line);
		   	   $('<div>',{ html:zwmc, title:zwmc, class:"box_info_content" }).appendTo(line);
			   	line = $('<div>',{ class:"box_info_list" }).appendTo(box);
			   	$('<div>',{ text:"军衔", title:"军衔", class:"box_info_title"}).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.jx.mc?data.entityRW.jx.mc:"", title:data.entityRW.jx.mc?data.entityRW.jx.mc:"", class:"box_info_content"}).appendTo(line);
		   	   
			   	line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
			   	$('<div>',{ text:"简述", title:"简述", class:"box_info_title"}).appendTo(line);
		   	   $('<div>',{ html:data.entityRW.jsforOrg, class:"box_info_content"}).appendTo(line);

			    
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
	};
	//显示作战强弱点
	this.showZzqrd=function(o,mx){
		$.ajax({
			type:"POST",
			dataType:"json",
			url:basePath+"/page/webgis/swmx/getZZQRD",
			data:{ZBNM:that.mx.data.zbnm},
			success:function(data){
				var zbxx = data.zzqrd;
				mx.tip.zzhzj.empty();
			    $('<div>',{
			    	class:"swmx_zbxx",
			    	html:zbxx
			    }).appendTo(mx.tip.zzhzj);
			    mx.tip.zbxx.window({title:"作战强弱点",closed:false});
			    Undo(mx.tip.mxjb,mx.tip.zzhzj);
			},
			error:function(data){}
		});
//		var zbxx = mx.data.entityZBXX;
//		mx.tip.zzhzj.empty();
//	    $('<div>',{
//	    	class:"swmx_zbxx",
//	    	html:zbxx.zzqrd_TEXT
//	    }).appendTo(mx.tip.zzhzj);
//	    mx.tip.zbxx.window({title:"作战强弱点",closed:false});
//	    Undo(mx.tip.mxjb,mx.tip.zzhzj);
	};
	//显示基地信息
	this.showJd=function(o,mx){
	//	var zbxx = mx.data.entityZBXX;
	//	var drawinfo = mx.data.drawInfo;
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getSsmbInfo",    
	       data:"ZBNM="+mx.data.zbnm,
	       success:function(data)
	       {
				var box = mx.tip.zzhzj;
				box.empty();
				var line = $('<div>',{ class:"box_info_list" }).appendTo(box);
				$('<div>',{ text:"目标名称", title:"目标名称", class:"box_info_title" }).appendTo(line);
				$('<div>',{ html:data.entitySSMB.mbmcforOrg, title:data.entitySSMB.mbmcforOrg, class:"box_info_content" }).appendTo(line);
				line = $('<div>',{ class:"box_info_list" }).appendTo(box);
				$('<div>',{ text:"目标种类", title:"目标种类", class:"box_info_title" }).appendTo(line);
				$('<div>',{ html:data.entitySSMB.mbqk.mbzl.mcforOrg == null ? "" : data.entitySSMB.mbqk.mbzl.mcforOrg, 
						title:data.entitySSMB.mbqk.mbzl.mcforOrg, class:"box_info_content" }).appendTo(line);
				
				line = $('<div>',{ class:"box_info_list" }).appendTo(box);
				$('<div>',{ text:"国家地区", title:"国家地区", class:"box_info_title"}).appendTo(line);
				$('<div>',{ html:data.entitySSMB.mbqk.gjdq.mcforOrg, title:data.entitySSMB.mbqk.gjdq.mcforOrg, class:"box_info_content"}).appendTo(line);
				line = $('<div>',{ class:"box_info_list" }).appendTo(box);
				$('<div>',{ text:"敏感属性", title:"敏感属性", class:"box_info_title" }).appendTo(line);
				$('<div>',{ html:data.entitySSMB.mbqk.mgsx.mcforOrg == null ? "" : data.entitySSMB.mbqk.mgsx.mcforOrg, 
				   title:data.entitySSMB.mbqk.mgsx.mcforOrg, class:"box_info_content" }).appendTo(line);
				line = $('<div>',{ class:"box_info_list" }).appendTo(box);
				if(data.entitySSMB.mbqk.mbdj.mcforOrg && data.entitySSMB.mbqk.mbmj){
					$('<div>',{ text:"目标等级", title:"目标等级", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.mbdj.mcforOrg == null ? "" : data.entitySSMB.mbqk.mbdj.mcforOrg, 
							title:data.entitySSMB.mbqk.mbdj.mcforOrg, class:"box_info_content"}).appendTo(line);
					line = $('<div>',{ class:"box_info_list" }).appendTo(box);
					$('<div>',{ text:"目标面积", title:"目标面积", class:"box_info_title" }).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.mbmj == null ? "" : data.entitySSMB.mbqk.mbmj, 
							title:data.entitySSMB.mbqk.mbmj, class:"box_info_content" }).appendTo(line);
				}
				if(data.entitySSMB.mbqk.mbgkforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"目标概况", title:"目标概况", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.mbgkforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.ssmbqforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"所属目标区", title:"所属目标区", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.ssmbqforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.zyqkforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"主要情况", title:"主要情况", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.zyqkforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.dwzyforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"地位作用", title:"地位作用", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.dwzyforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.zcfbforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"组成分布", title:"组成分布", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.zcfbforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.mbgkforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"结构性质", title:"结构性质", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.mbgkforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.yhbwforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"要害部位", title:"要害部位", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.yhbwforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.dxhjforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"地形环境", title:"地形环境", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.dxhjforOrg, class:"box_info_content"}).appendTo(line);
				}
				if(data.entitySSMB.mbqk.fyssforOrg){
					line = $('<div>',{ class:"box_info_cw" }).appendTo(box);
					$('<div>',{ text:"防御设施", title:"防御设施", class:"box_info_title"}).appendTo(line);
					$('<div>',{ html:data.entitySSMB.mbqk.fyssforOrg, class:"box_info_content"}).appendTo(line);
				}
				mx.tip.zbxx.window({title:"基地信息",closed:false});
			    Undo(mx.tip.mxjb,mx.tip.zzhzj);  
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
	};
	//显示搭载装备的信息
	this.showZbxx=function(o,mx){
		var zb = mx.data;
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getJbxx",    
	       data:"ZBNM="+zb.zbnm,
	       success:function(data)
	       {
	    	  that.clearStyle();
	    	  $(o).addClass($(o).attr('t_class'));
	    	  var box = mx.tip.mxjb;
	    	   box.empty();
	    	   //装备名称
	    	   var line = $('<div>',{
		   	    	class:"box_info_list_img"
		   	    }).appendTo(box);
	    	   var img_box = $('<div>',{
		   	    	class:"box_img"
		   	    }).appendTo(line);
	    	   $('<img>',{
		   	    	src:data.entityZB.arrPic[0]?basePath+"/page/jcqb/showPicPTMB/"+data.entityZB.nm+"_"+data.entityZB.arrPic[0].mtnm:"",
		   	    }).appendTo(img_box);
	    	   line = $('<div>',{
		   	    	class:"box_info_list"
		   	    }).appendTo(line);
	    	   $('<div>',{
		   	    	text:"装备名称",
		   	    	title:"装备名称",
		   	    	class:"box_info_title"
		   	    }).appendTo(line);
		   	   $('<div>',{
		   	    	html:data.entityZB.mc,
		   	    	title:data.entityZB.mc,
		   	    	class:"box_info_content"
		   	    }).appendTo(line);
	    	   //国家地区
		   	   $('<div>',{
		   	    	text:"国家地区",
		   	    	title:"国家地区",
		   	    	class:"box_info_title"
		   	    }).appendTo(line);
		   	   $('<div>',{
		   	    	html:data.entityZB.gjdq,
		   	    	title:data.entityZB.gjdq,
		   	    	class:"box_info_content"
		   	    }).appendTo(line);
			   	$('<div>',{
		   	    	text:"数据时间",
		   	    	title:"数据时间",
		   	    	class:"box_info_title"
		   	    }).appendTo(line);
		   	   $('<div>',{
		   	    	html:data.entityZB.info.sjsj,
		   	    	title:data.entityZB.info.sjsj,
		   	    	class:"box_info_content"
		   	    }).appendTo(line);
		   	   //xncs_b_10
		   	   var xncs_b_10 = data.entityZB.arrXNCS_B_10;
		   	   for(var i = 0; i < xncs_b_10.length; i++){
			   		line = $('<div>',{
			   	    	class:"box_info_list"
			   	    }).appendTo(box);
			   	   $('<div>',{
			   	    	html:xncs_b_10[i].jgmc,
			   	    	title:xncs_b_10[i].jgmc,
			   	    	class:"box_info_title"
			   	    }).appendTo(line);
			   	   $('<div>',{
			   	    	html:xncs_b_10[i].sjzforOrg+(xncs_b_10[i].jldw!=null ? (xncs_b_10[i].jldw) : ""),
			   	    	title:xncs_b_10[i].sjzforOrg,
			   	    	class:"box_info_content"
			   	    }).appendTo(line);
		   	   }
		   	//xncs_a
		   	   var xncs_a = data.entityZB.arrXNCS_A;
		   	   for(var i = 0; i < xncs_a.length; i++){
		   	//	[#if xncs.JGMC != '生产厂家' && xncs.JGMC != '装备国家' && xncs.JGMC != '批量生产时间' && xncs.JGMC != '装备部队时间']
		   		var jgmc = ['生产厂家','装备国家','批量生产时间','装备部队时间'];
		   		if($.inArray(xncs_a[i].jgmc,jgmc) >= 0){
			   		line = $('<div>',{
			   	    	class:"box_info_list"
			   	    }).appendTo(box);
			   	   $('<div>',{
			   	    	html:xncs_a[i].jgmc,
			   	    	title:xncs_a[i].jgmc,
			   	    	class:"box_info_title"
			   	    }).appendTo(line);
			   	   $('<div>',{
			   	    	html:xncs_a[i].sjzforOrg,//+xncs_a[i].jldw ? (xncs_a[i].jldw) : "",
			   	    	title:xncs_a[i].sjzforOrg,
			   	    	class:"box_info_content"
			   	    }).appendTo(line);
		   		}
		   	   }
		   	//xncs_b_other
		   	   var xncs_b_other = data.entityZB.arrXNCS_B_other;
		   	   for(var i = 0; i < xncs_b_other.length; i++){
			   		line = $('<div>',{
			   	    	class:"box_info_list"
			   	    }).appendTo(box);
			   	   $('<div>',{
			   	    	html:xncs_b_other[i].jgmc,
			   	    	title:xncs_b_other[i].jgmc,
			   	    	class:"box_info_title"
			   	    }).appendTo(line);
			   	   $('<div>',{
			   	    	html:xncs_b_other[i].sjzforOrg+(xncs_b_other[i].jldw == null ? "" : xncs_b_other[i].jldw),
			   	    	title:xncs_b_other[i].sjzforOrg,
			   	    	class:"box_info_content"
			   	    }).appendTo(line);
		   	   }
		   	   mx.tip.zbxx.window('open');
	    	   box = mx.tip.jbxx;
	    	   box.empty();
				$('<div>',{ 
					class:"zzxn_tcjl1",//0,0,255,0.4 border:48,127,127
					click:function(){
						that.showZzzf(this,that.mx);
					},
					'bj_class':"zzxn_tcjl1_bk",
					html:"作战战法"
				}).appendTo(box);
				$('<div>',{ 
					class:"zzxn_tcjl2",//0,255,255,0.4 b :25,109,109
					click:function(){
						that.showZzqrd(this,that.mx);
					},
					'bj_class':"zzxn_tcjl2_bk",
					html:"作战强弱点"
				}).appendTo(box);
				$('<div>',{ 
					class:"zzxn_tcjl3",//54,60,119,0.5/border:255...
					click:function(){
						that.showHdgl(this,that.mx);
					},
					'bj_class':"zzxn_tcjl3_bk",
					html:"活动规律"
				}).appendTo(box);
				$('<div>',{ 
					class:"zzxn_tcjl4",//255,0,0,0.4 b:154,30,30
					click:function(){
						that.showZhg(this,that.mx);
					},
					'bj_class':"zzxn_tcjl4_bk",
					html:"指挥员信息"
				}).appendTo(box);
				$('<div>',{ 
					class:"zzxn_tcjl5",//255,186,0,0.4 b:152,120,32
					click:function(){
						that.showJd(this,that.mx);
					},
					'bj_class':"zzxn_tcjl5_bk",
					html:"基地信息"
				}).appendTo(box);
				$('<div>',{ 
					class:"zzxn_tcjl6",//255,186,0,0.4 b:152,120,32
					click:function(){
						callSZBB(this);
					},
					'bj_class':"zzxn_tcjl6_bk",
					html:'三维数据'
				}).appendTo(box);
				box.css('display','block');
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
	};
	//显示作战性能
	this.showZzxn=function(o,mx){
		var drawinfo = mx.data.drawInfo;
		$.ajax({
			type:"POST",
			dataType:"json",
			url:basePath+"/page/webgis/swmx/getZZXN",    
		    data:{ZBNM:mx.data.zbnm},//"ZBNM="+mx.nm,
			success:function(data){
				var arrFW = Array();
	    	   var arrColor = Array();
	    	   for(var i = 0; i < data.entityZZXN.length; i++){
	    		   arrFW.push(data.entityZZXN[i]);
	    	   }
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(0,0,255,102),
    			   line:Cesium.Color.fromBytes(48,127,127,255)
    		   });
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(0,255,255,102),
    			   line:Cesium.Color.fromBytes(25,109,109,255)
    		   });
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(54,60,119,128),
    			   line:Cesium.Color.WHITE.withAlpha(1)
    		   });
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(255,0,0,102),
    			   line:Cesium.Color.fromBytes(154,30,30,255)
    		   });
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(255,186,0,102),
    			   line:Cesium.Color.fromBytes(152,120,32,255)
    		   });
    		   arrColor.push({
    			   color:Cesium.Color.fromBytes(186,0,255,102),
    			   line:Cesium.Color.fromBytes(152,120,32,255)
    		   });
    		   that.clearStyle();
    		   mx.data.subZB = data.subZB;
				that.insertTCFW(arrFW,arrColor);
		 	    that.insertDZWQZB();
		 	    
		 	   
				$(o).addClass($(o).attr('t_class'));
				mx.tip.zzxn.css('display','block');
				mx.tip.mxbox.window('open');
			},
			error:function(data){
				var i = 0;
			}
		});
		
	};
	//显示通信信号
	this.showTxxh = function(o,mx){
		var zb = mx.data;
		$.ajax({    
			   type:"POST",
		       url:basePath+"/page/webgis/swmx/getJbxx",    
		       data:"ZBNM="+zb.zbnm,
		       success:function(data)
		       {
			   		window.open("http://10.17.112.64:8080/datacenter/zsk/index?main="+data.entityZB.mc);
		       },  
		       error:function(data){
		    	   var i = 0;
		       },
		       beforSend:function(data){
		    	   var i = 0;
		       },
		       async:true,
			   dataType:'json'
		 	});
		 
	};
	this.showTxxh1=function(o,mx){
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/queryDXQB",    
	       data:"dxqbnm="+mx.data.dxqbnm,
	       success:function(data)
	       {
	    	   that.clearStyle();
	    	   $(o).addClass($(o).attr('t_class'));
//	    	   var arrtxxh = data.arrTXXH;
//	    	   if(arrtxxh.length <= 0){
//	    		   return ;
//	    	   }
	    	   
	    	   mx.tip.txxh.empty();
	    	   
//	    	   mx.tip.txxh.html("<div id='tab_txxh' class='tab_diy'><div class='tabhead'></div><div class='tabpanl'></div></div>");
//	    	   var tabdiy = new newTabDIY("tab_txxh");
//	    	   for(var i = 0; i < arrtxxh.length; i++){
//	    		   var txxh = arrtxxh[i];
//	    		   var tabpanlc = tabdiy.inertTab({
//		    			id:"txxh"+txxh.txxhnm,
//		    			text:txxh.qbbt,
//		    			title:txxh.qbbt
//		    		});
//	    		   txxh = txxh.txxh;
//	    		   var line;
//	    		   if(txxh.txxhmc){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号名称", title:"通信信号名称", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhmc, title:txxh.txxhmc, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhfl.mc){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号分类", title:"通信信号分类", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhfl.mc, title:txxh.txxhfl.mc, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhcsjz.mc){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号传输介质", title:"信号传输介质", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhcsjz.mc, title:txxh.xhcsjz.mc, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhyyfx.mc){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号应用方向", title:"信号应用方向", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhyyfx.mc, title:txxh.xhyyfx.mc, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhpl){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号频率", title:"通信信号频率", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhpl, title:txxh.txxhpl, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhdk){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号带宽", title:"通信信号带宽", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhdk, title:txxh.txxhdk, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txtzfs){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号带宽", title:"通信信号带宽", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txtzfs, title:txxh.txtzfs, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhsl){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信息速率", title:"通信信息速率", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhsl, title:txxh.txxhsl, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhzt.mc){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号状态", title:"信号状态", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhzt.mc, title:txxh.xhzt.mc, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhyh){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号用户", title:"通信信号用户", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhyh, title:txxh.txxhyh, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.txxhxz){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"通信信号性质", title:"通信信号性质", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.txxhxz, title:txxh.txxhxz, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhcsnr){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号传输内容", title:"信号传输内容", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhcsnr, title:txxh.xhcsnr, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhclqk){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号出联情况", title:"信号出联情况", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhclqk, title:txxh.xhclqk, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhqbjz){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号情报价值", title:"信号情报价值", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhqbjz, title:txxh.xhqbjz, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.xhzhsj){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"信号侦获时间", title:"信号侦获时间", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.xhzhsj, title:txxh.xhzhsj, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   
//	    		   if(txxh.sjsj){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"数据时间", title:"数据时间", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.sjsj, title:txxh.sjsj, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   if(txxh.bz){
//		    		   line = $('<div>',{ class:"txxh_line" }).appendTo(tabpanlc);
//		    		   $('<div>',{ text:"备注", title:"备注", class:"txxh_title" }).appendTo(line);
//		    		   $('<div>',{ text:txxh.bz, title:txxh.bz, class:"txxh_content" }).appendTo(line);
//	    		   }
//	    		   
//	    	   }
	    	   mx.tip.txxh.window('open');
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
		
	};
	//显示图像数据
	this.showTxsj=function(o,mx){
		$.ajax({
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getTxsjInfo",    
	       data:"ZBNM="+mx.data.zbnm,
	       success:function(data)
	       {
	    	   var txsj = mx.tip.txsj;
	    	   that.clearStyle();
	    	   $(o).addClass($(o).attr('t_class'));
	    	   txsj.window("open");
	    	   if(!data.entity){
	    		   return false;
	    	   }
	    	   var pic = data.entity.arrPic;
	    	   if(pic.length <= 0){
	    		   return ;
	    	   }
	    	   
	    	   txsj.empty();
	    	   
	    	   var imgbox = $('<div>',{id:"txsj_imgs"}).appendTo(txsj);
	    	   for(var i = 0; i < pic.length; i++){
	    		   $("<img>",{
	    			   src:basePath + "/page/jcqb/showPicPTMB/"+mx.data.zbnm+"_"+pic[i].mtnm
	    		   }).appendTo(imgbox);
	    	   }
	    	   
	    	   showPic("txsj_imgs");
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
		
	};
	//显示雷达参数
	this.showLdcs=function(o,mx){
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getLdcsInfo",    
	       data:"ZBNM="+mx.data.zbnm,
	       success:function(data)
	       {
	    	   that.clearStyle();
	    	   $(o).addClass($(o).attr('t_class'));
	    	   var arrldcs = data.arrLDCS;
	    	   if(arrldcs.length <= 0){
	    		   return ;
	    	   }
	    	   
	    	   mx.tip.ldcs.empty();
	    	   mx.tip.ldcs.html("<div id='tab_ldcs' class='tab_diy'><div class='tabhead'></div><div class='tabpanl'></div></div>");
	    	   var tabdiy = new newTabDIY("tab_ldcs");
	    	   tabdiy.tabCtrl.css('height','100%');
	    	   for(var i = 0; i < arrldcs.length; i++){
	    		   var ldcs = arrldcs[i];
	    		   var tab = {
			    			id:"ldcs"+ldcs.nm,
			    			html:ldcs.mcforOrg,
			    			title:ldcs.mcforOrg
			    		};
	    		   if(i == 0){
	    			   tab.select = true;
	    		   }
	    		   var tabpanlc = tabdiy.inertTab(tab);
	    		   var arrldgztz = ldcs.arrLDGZTZ;
	    		   var line;
	    		   for(var j = 0; j < arrldgztz.length; j++){
	    			   var ldcs = arrldgztz[j];
		    		   if(ldcs.sptzlx.mcforOrg){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"射频特征类型", title:"射频特征类型", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.sptzlx.mcforOrg, title:ldcs.sptzlx.mcforOrg, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   if(ldcs.txsmlx.mcforOrg){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"天线扫描类型", title:"天线扫描类型", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.txsmlx.mcforOrg, title:ldcs.txsmlx.mcforOrg, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   if(ldcs.cfjglx.mcforOrg){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"重复间隔类型", title:"重复间隔类型", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.cfjglx.mcforOrg, title:ldcs.cfjglx.mcforOrg, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   if(ldcs.mktzlx.mcforOrg){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"脉宽特征类型", title:"脉宽特征类型", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.mktzlx.mcforOrg, title:ldcs.mktzlx.mcforOrg, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   if(ldcs.mntzlx.mcforOrg){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"脉内特征类型", title:"脉内特征类型", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.mntzlx.mcforOrg, title:ldcs.mntzlx.mcforOrg, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   if(ldcs.sjsj){
			    		   line = $('<div>',{ class:"ldcs_line" }).appendTo(tabpanlc);
			    		   $('<div>',{ text:"数据时间", title:"数据时间", class:"ldcs_title" }).appendTo(line);
			    		   $('<div>',{ html:ldcs.sjsj, title:ldcs.sjsj, class:"ldcs_content" }).appendTo(line);
		    		   }
		    		   var ni = 0;
		    		   var arrcfjgcs = ldcs.arrCFJGCS;
		    		   var model;
		    		   if(arrcfjgcs.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"重复间隔参数"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrcfjgcs.length; ni++){
		    			   var obj = arrcfjgcs[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.cfjgzxz){
		    				   $('<td>',{html:obj.cfjgzxz}).appendTo(tr);
			    		   }
		    			   if(obj.cfjgzdz){
		    				   $('<td>',{html:obj.cfjgzdz}).appendTo(tr);
			    		   }
		    		   }
		    		   
		    		   var arrmkcs = ldcs.arrMKCS;
		    		   if(arrmkcs.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"脉宽参数"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrmkcs.length; ni++){
		    			   var obj = arrmkcs[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.mkzxz){
		    				   $('<td>',{html:obj.mkzxz}).appendTo(tr);
			    		   }
		    			   if(obj.mkzdz){
		    				   $('<td>',{html:obj.mkzdz}).appendTo(tr);
			    		   }
		    		   }
		    		   
		    		   var arrmntz = ldcs.arrMNTZ;
		    		   if(arrmntz.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"脉内参数"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrmntz.length; ni++){
		    			   var obj = arrmntz[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.mnzxz){
		    				   $('<td>',{html:obj.mnzxz}).appendTo(tr);
			    		   }
		    			   if(obj.mnzdz){
		    				   $('<td>',{html:obj.mnzdz}).appendTo(tr);
			    		   }
		    		   }
		    		   
		    		   var arrspcs = ldcs.arrSPCS;
		    		   if(arrspcs.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"射频参数"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrspcs.length; ni++){
		    			   var obj = arrspcs[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.spzxz){
		    				   $('<td>',{html:obj.spzxz}).appendTo(tr);
			    		   }
		    			   if(obj.spzdz){
		    				   $('<td>',{html:obj.spzdz}).appendTo(tr);
			    		   }
		    		   }
		    		   
		    		   var arrtxbssmzq = ldcs.arrTXBSSMZQ;
		    		   if(arrtxbssmzq.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"天线扫描周期"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrtxbssmzq.length; ni++){
		    			   var obj = arrtxbssmzq[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.smzqzxz){
		    				   $('<td>',{html:obj.smzqzxz}).appendTo(tr);
			    		   }
		    			   if(obj.smzqzdz){
		    				   $('<td>',{html:obj.smzqzdz}).appendTo(tr);
			    		   }
		    		   }
		    		   
		    		   var arrzpcs = ldcs.arrZPCS;
		    		   if(arrzpcs.length > 0){
		    			   model = $('<table>',{ class:"ldcs_model" }).appendTo(tabpanlc);
		    			   $('<th>',{class:'model_th',text:"载频参数"}).appendTo(model);
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   $('<td>',{text:'最小值'}).appendTo(tr);
		    			   $('<td>',{text:'最大值'}).appendTo(tr);
		    			   $('<td>',{text:'组号'}).appendTo(tr);
		    		   }
		    		   for(ni = 0; ni < arrzpcs.length; ni++){
		    			   var obj = arrzpcs[ni];
		    			   tr = $('<tr>',{class:'model_tr'}).appendTo(model);
		    			   if(obj.spzxz){
		    				   $('<td>',{html:obj.spzxz}).appendTo(tr);
			    		   }
		    			   if(obj.spzdz){
		    				   $('<td>',{html:obj.spzdz}).appendTo(tr);
			    		   }
		    		   }
	    		   }
	    	   }mx.tip.ldcs.window('open');
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       async:true,
		   dataType:'json'
	 	});
		
	};
	//插入探测范围列表
	this.insertTCFW = function(arrFW,arrColor){
		var box = this.mx.tip.zzxn;
		if(box.get(0).children.length > 0){
			return true;
		}
		for(var i = 0; i < arrFW.length; i++){
			$('<div>',{
				class:"zzxn_tcjl"+(i+1),//0,0,255,0.4 border:48,127,127
				'fwid':"id:"+i+",fwid:"+(this.mx.id+""+i),
				click:function(){
					var fwid = eval("({"+$(this).attr('fwid')+"})");
					var center = that.mx.pos;
					if(!isER){//判断是三维还是二位  false 三维 true 二维，此为全局变量，定义在webgis/index.html 482行
						that.showTcfw(fwid.fwid,arrFW[fwid.id].xnlxcode,arrFW[fwid.id].zylxcode, arrFW[fwid.id].zdxn.mc, 
							center, 0, arrFW[fwid.id].zdzyjl,arrColor[fwid.id].color,arrColor[fwid.id].line);
						that.clickTcfw(this);
					}else{
						drawZYMBTCFW(fwid.fwid,arrFW[fwid.id].xnlxcode,arrFW[fwid.id].zylxcode, arrFW[fwid.id].zdxn.mc, 
								center, 0, arrFW[fwid.id].zdzyjl,arrColor[fwid.id].color,arrColor[fwid.id].line);
						that.clickTcfw(this);
					}
				},
				'bj_class':"zzxn_tcjl"+(i+1)+"_bk",
				html:arrFW[i].zdxn.mc+"：<span>" + (arrFW[i].zdzyjlshow) + "</span>&nbsp;"+arrFW[i].xsjldw// + data.entityZZXN.fw1.valueforUnit
			}).appendTo(box);
		}
	};
	//插入搭载武器装备的详细内容
	this.insertDZWQZB = function(){
		this.mx.tip.mxwq.empty();
		var drawinfo = this.mx.data.subZB;
	    $('<div>',{
	    	html:drawinfo.zbmc,
	    	class:"box_list_title"
	    }).appendTo(this.mx.tip.mxwq);
	    var lb = Array();
	    for(var i = 0; i < drawinfo.arrZBLB.length; i++){
	    	var box_list_lb_box = $('<div>',{
	        	class:"box_list_lb_box"
	        }).appendTo(this.mx.tip.mxwq);
	    	var box_list_lb = $('<div>',{
	        	html:drawinfo.arrZBLB[i],
	        	class:"box_list_lb"
	        }).appendTo(box_list_lb_box);
	    	lb.push(box_list_lb_box);
	    }
	    var zb = drawinfo.arrPBZB;
	    for(var i = 0; i < zb.length; i++){
	    	var lb_zb = null;
	    	for(var j = 0; j < lb.length; j++){
	    		if(zb[i].zblb == lb[j].get(0).firstChild.innerHTML){
	    			lb_zb = lb[j].get(0);
	    			break;
	    		}
	    	}
	    	$('<div>',{
	        	html:drawinfo.arrPBZB[i].zbmc,
	        	'zbnm':drawinfo.arrPBZB[i].zbnm,
	        	'zb-index':i,
	        	class:"box_list_li",
	        	click:function(){
	        		getXncs($(this).attr('zbnm'),that.mx.tip.wqxq,that.mx.tip.mxwq);
	        	}
	        }).appendTo($(lb_zb));
	    }
	};
	//显示三维模型时，获取该三维模型的相关数据
	this.getData = function(){
		var that = this;
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/swmx/getSWMXInfo",    
	       data:"SWMXNM="+this.mx.nm,
	       success:function(data)
	       {
	    	   that.mx.data = data;
//	    	   that.arrFW = Array();
//	    	   that.arrColor = Array();
//	    	   for(var i = 0; i < data.entityZZXN.length; i++){
//	    		   that.arrFW.push(data.entityZZXN[i]);
//	    	   }
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(0,0,255,102),
//    			   line:Cesium.Color.fromBytes(48,127,127,255)
//    		   });
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(0,255,255,102),
//    			   line:Cesium.Color.fromBytes(25,109,109,255)
//    		   });
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(54,60,119,128),
//    			   line:Cesium.Color.WHITE.withAlpha(1)
//    		   });
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(255,0,0,102),
//    			   line:Cesium.Color.fromBytes(154,30,30,255)
//    		   });
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(255,186,0,102),
//    			   line:Cesium.Color.fromBytes(152,120,32,255)
//    		   });
//    		   that.arrColor.push({
//    			   color:Cesium.Color.fromBytes(186,0,255,102),
//    			   line:Cesium.Color.fromBytes(152,120,32,255)
//    		   });
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       complete:function(data){
	    	   console.log(data.responseText);
	       },
	       async:true,
		   dataType:'json'
		});
	};
	this.getZBData = function(){
		var that = this;
		$.ajax({    
		   type:"POST",
	       url:basePath+"/page/webgis/ptmb/getMbInfo",    
	       data:"ZBNM="+this.mx.nm,
	       success:function(data)
	       {
	    	   that.mx.data = data;
	       },  
	       error:function(data){
	    	   var i = 0;
	       },
	       beforSend:function(data){
	    	   var i = 0;
	       },
	       complete:function(data){
	    	   console.log(data.responseText);
	       },
	       async:true,
		   dataType:'json'
		});
	};
//	this.getData();
}

var dxqbDataInfo = {
	/*
	 * 点击确定按钮后，调用SWMX的方法即可上图，创建自己的对象
	 * 统计三维模型数量
	 * 可对三维模型进行编队
	 * 三维模型上的圆圈可显示多个，探测范围可同时上图
	 * 
	 * 
	 * */
	/*
	 * arrMX 存放三维模型对象的数组，对象：
	 * {
	 * 		nm - 三维模型的nm
	 * 		tip - 三维模型圆圈的对象
	 * 		alt - 三维模型高程
	 * 		view - 视野高度
	 * 		res - 模型资源路径
	 * 		pos - 三维模型地理位置
	 * 		was - 该模型是否被处理过（点击过模型，就是处理过），默认false
	 * }
	 * 
	 * */
	arrMX: Array(),
	prepare: null,//准备要显示的模型内码
	curSelect:null,//当前选中的的三维模型内码
	curSelectMx:null,//当前选中的三维模型
	/*
	 * 显示三维模型之前要先验证此三维模型是否已经被加载过
	 * 显示三维模型后，要将此三维模型push到arr变量中，以便做验证
	 * 创建此三维模型的圆圈
	 * 返回三维模型对象
	 * 
	 * */
	isExist: function(nm){
		for(var i = 0; i < dxqbDataInfo.arrMX.length; i++){
			if(dxqbDataInfo.arrMX[i].mx.nm == nm){
				return dxqbDataInfo.arrMX[i];
			}
		}
		return false;
	},
	add: function(){
		
	},
	//为该三维模型创建一个tip（圆圈）
	createTip:function(mx){
		if(!mx.mx.data){
			return false;
		}
		var cel = function(c,t_class,t,f,m){//createElement appendTo
			return $("<div>",{
				class:c,
				title:t,
				't_class':t_class,
				click:function(){
					if(typeof(f) == "function")
						f(this,m);
				}
			});
		};
		var setWindow = function(jQ,title,position,size,sc=true){
			var w = jQ.window({
				iconCls:'icon-wjx',
				minimizable:false,
				maximizable:false,
				collapsible:false,
				title:title,
				closed:true,
				left:position.left,
		    	top:position.top,
				width:size.w,
				height:size.h,
			});
			if(sc){
				objScroll(jQ.get(0));
			}
			return w;
		};
		var tip = $("<div>",{
			class:'tip gbox',
			style:'display:block'
		})
		var jbxx = cel('yuan_content_box').appendTo(tip); //基本信息
		var zzxn = cel('yuan_content_box').appendTo(tip); //作战效能
		var yuan = Array();
		yuan.push(cel('yuan yuan_jbxx','yuan_jbxx_active','基本信息',mx.showZbxx,mx.mx).appendTo(tip));
		yuan.push(cel('yuan yuan_zzxn','yuan_zzxn_active','作战效能',mx.showZzxn,mx.mx).appendTo(tip));
		yuan.push(cel('yuan yuan_txxh','yuan_txxh_active','通信信号',mx.showTxxh,mx.mx).appendTo(tip));
		yuan.push(cel('yuan yuan_txsj','yuan_txsj_active','图像数据',mx.showTxsj,mx.mx).appendTo(tip));
		yuan.push(cel('yuan yuan_ldcs','yuan_ldcs_active','雷达参数',mx.showLdcs,mx.mx).appendTo(tip));
		//圆圈上边写三维模型的名称
		var bj = cel('swmx_name_bj').appendTo(
			cel('swmx_name').appendTo(tip).html(mx.mx.data.zbmc)
		);
		//bj.attr("title","点击关闭");
		tip.appendTo($(document.body));
		var position = getPosition(tip.get(0));//$('#swmx_mx_yuan').position();
		position.left += 56;
		position.top += 135;
		var swmx_window = Array();
		var txsj = cel().appendTo(tip);
		setWindow(txsj,"图像数据",position,{w:334,h:350});
		var ldcs = cel('ldcs').appendTo(tip);
		setWindow(ldcs,"雷达参数",position,{w:334,h:478},false);
		var txxh = cel('txxh').appendTo(tip);
		setWindow(txxh,"通信信号",position,{w:334,h:478});
		var hdgl = cel('hdgl').appendTo(tip);
		var zzqrd = cel('zzqrd').appendTo(tip);
		var zzzf = cel('zzzf').appendTo(tip);
		var mxbox = cel('mxbox').appendTo(tip);
		setWindow(mxbox,"搭载武器装备情况",position,{w:334,h:478});
		
		var mxwq = cel('mxwq').appendTo(mxbox);
		var wqxq = cel('wqxq').appendTo(mxbox);
		mxbox.window({tools:[{
    		iconCls:'icon-back',
    		handler:function(){
    			Undo(wqxq,mxwq);
    			mxbox.window({title:"搭载武器装备情况",closed:false});
    		}
    	}]});
		var zbxx = cel('zbxx').appendTo(tip);
		setWindow(zbxx,"基本信息",position,{w:334,h:478});
		var mxjb = cel('mxjb').appendTo(zbxx);
		var zzhzj = cel('zzhzj').appendTo(zbxx);
		zbxx.window({tools:[{
    		iconCls:'icon-back',
    		handler:function(){
    			Undo(zzhzj,mxjb);
    			zbxx.window({title:"基本信息",closed:false});
    		}
    	}]});
		
		var box = tip.get(0);
		var drag = new glxDragCtrl();
		drag.startDrag(box, box, drag.vh, function(dx, dy) {
			
		});
		mx.mx.tip = {
			t:tip,		y:yuan,		jbxx:jbxx,		zzxn:zzxn,	txsj:txsj,
			ldcs:ldcs,	txxh:txxh,	mxbox:mxbox,	mxwq:mxwq,	wqxq:wqxq,
			zbxx:zbxx,	mxjb:mxjb,	zzhzj:zzhzj,	bj:bj,
			remove:function(){
				this.t.remove();
				this.mxbox.window('destroy');
				this.txsj.window('destroy');
				this.ldcs.window('destroy');
				this.txxh.window('destroy');
				this.zbxx.window('destroy');
			},
			isShow:true
		};
		mx.mx.was = true;
		mx.mx.id = new Date().getTime();
		
		
	},
	showTip:function(){
		dxqbDataInfo.hideTip();
		var swmx = dxqbDataInfo.isExist(dxqbDataInfo.curSelect);
		if(swmx === false){
			return false;
		}
		if(swmx.mx.was){
			swmx.mx.tip.t.css('display','block');
			swmx.mx.tip.isShow = true;
		}else{
			dxqbDataInfo.createTip(swmx);
		}
		dxqbDataInfo.curSelectMx = swmx.mx;
		return swmx;
	},
	//加载三维模型
	show: function(swmx){
		if(!dxqbDataInfo.isExist(swmx.nm)){
			//alert(swmx.nm);
			var mx = new dataPoint(swmx);
		//	if(!swmx.unload)
			mx.getData();
//			else{
//				mx.getZBData();
//			}
			dxqbDataInfo.arrMX.push(mx);
			//if(!swmx.unload)
		//	Load3DMode.load(swmx.nm,swmx.pos,swmx.alt,swmx.view,swmx.res);
		}
		return true;
	},
	clear:function(){
		dxqbDataInfo.clearTcfw();
		for(var i = 0; i < dxqbDataInfo.arrMX.length; i++){
			dxqbDataInfo.arrMX[i].hide();
			dxqbDataInfo.arrMX[i].mx.tip.remove();
			dxqbDataInfo.arrMX[i].mx = null;
			//dxqbDataInfo.arrMX.splice(i,1);
		}
		dxqbDataInfo.arrMX.splice(0,dxqbDataInfo.arrMX.length);
		//arrMX = new Array();
		return false;
	},
	clearTcfw:function(){
		for(var i = 0; i < dxqbDataInfo.arrMX.length; i++){
			dxqbDataInfo.arrMX[i].clearTcfw();
		}
		return false;
	},
	hideTip:function(){
		for(var i = 0; i < dxqbDataInfo.arrMX.length; i++){
			if(dxqbDataInfo.arrMX[i].mx.tip){
				if(dxqbDataInfo.arrMX[i].mx.tip.isShow){
					dxqbDataInfo.arrMX[i].hide();
				}
			}
		}
	}
}