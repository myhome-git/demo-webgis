/**
 * 提供实时综合态势分析功能，主要做告警分析。
 * 默认的空间参考使用EPSG:3857
 * @auth guanml 
 */
var ZhtsAnalyse = function (options) {
    if (!options) {
        throw "必须设置参数，至少需要一个 options.map 对象";
        return;
    }
    if (options.map) {
        this.map = options.map;
    } else {
        throw "必须设置 options.map 对象";
        return;
    }
    var _layer = options.layer;

    this.manager = options.manager;
    this.layer = _layer;
    this.useAudio = false;
    this.useFlag  = false;
    this.circles = [];
    this.arrMblb = [];
    this._init();
    
    this.qygz;
};

/**
 * 暂时使用
 */
ZhtsAnalyse.prototype._initQy = function () {
    this.circles = [];
	//1海里=1852米
    var hl = 1852;
    //华阳焦
    this.addCircle(ol.proj.fromLonLat([112.81444444444445, 8.865]), 6 * hl, "华阳焦");
    //赤爪礁 1
    this.addCircle(ol.proj.fromLonLat([114.28555555555555, 9.714722222222221]), 6 * hl, "赤爪礁1");
    //美济礁
    this.addCircle(ol.proj.fromLonLat([115.53833333333333, 9.901666666666667]), 12 * hl, "美济礁");

    //渚碧礁
    this.addCircle(ol.proj.fromLonLat([114.06, 10.913611111111111]), 12 * hl, "渚碧礁");

    //永暑礁 1
    this.addCircle(ol.proj.fromLonLat([112.86722222222221, 9.539722222222222]), 12 * hl, "永暑礁1");

    //永暑礁 2
    this.addCircle(ol.proj.fromLonLat([112.9, 9.3600]), 12 * hl, "永暑礁2");
}

/**
 * 默认初始化部分警戒区域
 */
ZhtsAnalyse.prototype._init = function () {
    this.reload();
    //5秒检查一次
    this.starCheck(5000);
}

/**
 * 重载入
 */
ZhtsAnalyse.prototype.reload =function(){
	this.stopCheck();
	this.layer.getSource().clear();
	this._initQy();
	var _zhtsany = this;
	var self = this;
	$.ajax({
		type:"post",
    	url:basePath + "/page/ssts/callGJ",
		dataType:"json",
		async:false,
		success:function(data){
			console.log("GJ",data);
			self.qygz = data.qygz;
		}
	});
	
	if(self.qygz.qyqypz === 1){
		 $.ajax({
				type:"post",
		    	url:basePath + "/page/ssts/callQYPZ?rows=500&page=1",
				dataType:"json",
				success:function(data){
					data.rows = data.qypz;
					//console.log("qy",data);
					//地图上初始化告警区域
					var qy;

					var format = new ol.format.WKT();	
						for(var i = 0 ; i < data.qypz.length; i++){
							qy = data.qypz[i].qy;
							if(qy != null){
								//var format = new ol.format.WKT();
								var g = format.readGeometry(qy);
								var f = new ol.Feature();
								f.setGeometry(g);
//								f.setId(data.qypz[i].qynm);
								f.set("qyname",data.qypz[i].qymc);							
								self.circles.push(f);
							}
					}
					self.layer.getSource().addFeatures(self.circles);

				}
			});
	}
   
    $.ajax({
		type:"post",
    	url:basePath + "/page/ssts/callZDMB?rows=500&page=1",
		dataType:"json",
		success:function(data){
			//console.log("ZDMB",data);
			for(var i = 0;i < data.zdmb.length;i++){
				self.arrMblb.push(data.zdmb[i].mblxmc);
			}
			console.log(self.arrMblb);
		}
	});
    //5秒检查一次
    this.starCheck(5000);
    
}

/**
 * 创建圆形区域要素 
 * @param {float} center  中心点
 * @param {float} r  半径
 * @param {string} sname  区域名称
 */
ZhtsAnalyse.prototype.addCircle = function (center, r, sname) {
    var cir = new ol.geom.Circle(center, r);
    var feature = new ol.Feature({
        geometry: cir,
        qyname: sname
    });
    this.circles.push(feature);
    //this.layer.getSource().addFeature(feature);
}

/**
 * 开始检查
 */
ZhtsAnalyse.prototype.starCheck = function(timeout){
	var manager = this.manager;
	var _zhtsAnalyse = this;
	  this._timeInternalId = setInterval(function (){		    
		  var tracks = manager.mbLayer.getSource().getFeatures();
		  _zhtsAnalyse.Analyse(tracks);	  
	  },timeout);

}

/**
 * 停止检查
 */
ZhtsAnalyse.prototype.stopCheck = function(){
	 if(this._timeInternalId){
	        window.clearInterval(this._timeInternalId);
	}
}


/**
 *  分析这些点是否进入了警戒区域，根据不同类型的目标做不同的分析。
 * @param {Array} points 目标某时刻所在位置点
 */
ZhtsAnalyse.prototype.Analyse = function (points) {
	//1海里=1852米
    var hl = 1852;
	var check = false;
    var circles = this.getCircles();
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        //如果是我方的数据就不做检查了
        var prop = p.getProperties();
        if(prop.dwsx=='我'){
        	continue;
        }
        
      //如果区域不显示，那么也就不做区域告警了
    	if(this.qygz.qyqypz === 0&&this.qygz.qyzdmb===0){
    		this.audioStop();
    		var p = points[i];
    		p.set("showFlag",false);
    		var lv = p.get("showInfoLevel");
           	if(lv>0){
           		lv =lv-1;
             }
           	p.changeTagContent(lv);
			//为了检查所有目标是否有国旗采用continue
    		continue;
    	}
    	
 
        for (var j = 0; j < circles.length; j++) {
            var c = circles[j];
            var intersects = false;
            if(this.qygz.qyqypz === 1){
            	 intersects = c.getGeometry().intersectsCoordinate(p.getGeometry().getCoordinates());
            } 
             
            //重点目标检查
            if((this.arrMblb.indexOf(prop.mbtypename) >= 0)&&this.qygz.qyzdmb===1){
		            if(prop.gjnm && this.qygz.qygqpz === 1){
		           		 p.set("showFlag",true);
		           		 var lv = p.get("showInfoLevel");
		           		 if(lv>0){
		           			 lv =lv-1;
		           		 }
		           		 p.changeTagContent(lv);
		           	 }else if(this.qygz.qygqpz === 0){
						 p.set("showFlag",false);
						 var lv = p.get("showInfoLevel");
						 if(lv>0){
							 lv =lv-1;
						 }
						 p.changeTagContent(lv);
					} 	 
		           	
		           	var f = new ol.Feature({geometry:p.getGeometry()});
		             
		           	if(this.qygz.qysspz === 1){
		           		this.pulseFeature(f);
		           	}
		           	
		           	if(this.qygz.qysypz === 1){
		           		this.audioPlay();
		           	}else{
		           		this.audioStop();
		           	}
		           	
		           	//已经进入12海里或6海里范围
		           	if(intersects === true){
		           		this.sendDangerMsg(f, "警告！" + prop.mbmc+" 进入 <a id='"+p.getId()+"' onclick='zoomToQy("+p.getId()+")'>"+c.get("qyname")+"</a>");
		           	}else if(this.qygz.qyzdmb === 1){
		           		this.sendDangerMsg(f, "警告！" + prop.mbmc+" 出动");
		           	}
					check= true;
		           	//放弃检查，开始下一个
		           	continue;           	
            }
            
            //区域检查
            if (intersects === true&&this.qygz.qyqypz === 1) {
 
            	if(prop.gjnm && this.qygz.qygqpz === 1){
	           		 p.set("showFlag",true);
	           		 var lv = p.get("showInfoLevel");
	           		 if(lv>0){
	           			 lv =lv-1;
	           		 }
					 p.changeTagContent(lv);
	           		
	           	 }else if(this.qygz.qygqpz === 0){	
					
						 p.set("showFlag",false);
						 var lv = p.get("showInfoLevel");
						 if(lv>0){
							 lv =lv-1;
						 }
					    p.changeTagContent(lv);
	           	 } 	 
            	
            	var f = new ol.Feature({geometry:p.getGeometry()});
              
            	if(this.qygz.qysspz === 1){
            		this.pulseFeature(f);
            	}
            	
            	if(this.qygz.qysypz === 1){
            		this.audioPlay();
            	}else{
            		this.audioStop();
            	}
            	
            	//已经进入12海里或6海里范围
            	if(intersects === true){
            		this.sendDangerMsg(f, "警告！" + prop.mbmc+" 进入 <a id='"+p.getId()+"' onclick='zoomToQy("+p.getId()+")'>"+c.get("qyname")+"</a>");
            	}else if(this.qygz.qyzdmb === 1){
            		this.sendDangerMsg(f, "警告！" + prop.mbmc+" 出动");
            	}
				check = true;
				continue;
            }
			

        }
		if(!check){
			if(this.qygz.qyzdmb===0||this.qygz.qyqypz === 0){
				p.set("showFlag",false);
				var lv = p.get("showInfoLevel");
				if(lv>0){
					lv =lv-1;
				}
				p.changeTagContent(lv);
			}
		}
		if(this.qygz.qygqpz === 0){	
			p.set("showFlag",false);
				var lv = p.get("showInfoLevel");
				if(lv>0){
					lv =lv-1;
				}
				p.changeTagContent(lv);
		}
		
    }

}

function zoomToQy(obj){
	var id = obj;
	var f =  zhtsAnalyse.layer.getSource().getFeatureById(id);
	var extent = f.getGeometry().getExtent();
	BIGMap.getMap().getView().fit(extent);
}


/**
 * 获取所有添加的圆形要素
 */
ZhtsAnalyse.prototype.getCircles = function () {
    return this.circles;
}

/**
 * 清除所有圆形要素
 */
ZhtsAnalyse.prototype.clearCircles = function(){
    this.circles = [];
}


/**
 * 发送告警信号
 * @param {*} point 
 * @param {string} message 
 */
ZhtsAnalyse.prototype.sendWarningMsg = function (point, message) {
    this.addMsgToDOM(message,"warnning");
//    console.log(message);
    var  zhts = this;
//    for (var i = 0; i < 5; i++) {
//        setTimeout(function () {
//            zhts.pulseFeature(point);
//        }, i * 200);
//    };

}

/**
 * 发送危险信号
 * @param {*} point 
 * @param {string} message 
 */
ZhtsAnalyse.prototype.sendDangerMsg = function (point, message) {
    this.addMsgToDOM(message,"danger");
   // console.log(message);
    var  zhts = this;
//    for (var i = 0; i < 5; i++) {
//        setTimeout(function () {
//            zhts.pulseFeature(point);
//        }, i * 200);
//    };
}

/**
 * 对点坐标做动画显示
 * @param {Array} coord 点坐标
 */
ZhtsAnalyse.prototype.pulsePoint = function (coord) {
    var f = new ol.Feature(new ol.geom.Point(coord));
    f.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 20,
            points: 4,
            stroke: new ol.style.Stroke({
                color: "red",
                width: 2
            })
        })
    }));
    this.map.animateFeature(f, new ol.featureAnimation.Zoom({
        fade: ol.easing.easeOut,
        duration: 3000,
        easing: ol.easing.easeOut
    }));
}

/**
 * 对点要素做动画显示
 * @param {Array}  点坐标
 */
ZhtsAnalyse.prototype.pulseFeature = function (point) {
    var f = point;
    f.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 20,
            points: 4,
            stroke: new ol.style.Stroke({
                color: "red",
                width: 3
            })
        })
    }));
    this.map.animateFeature(f, new ol.featureAnimation.Zoom({
        fade: ol.easing.linear,
        duration: 3000,
        easing: ol.easing.easeOut
    }));
}

/**
 * 添加告警信息到DIV
 * @param {JQuery Dom} dom jquery对象
 * @param {string} message 告警信息
 * @param {string} type 告警类型
 */
ZhtsAnalyse.prototype.addMsgToDOM = function(message,type){
    var color = "";
    switch (type) {
        case 'warnning':
            color = "orange";
            break;
        case 'danger':
            color = "red";
            break;
        default:
            break;
    }
    
    //判断内容是否需要清空
    var childCount = $("#gj_msg").children().length;
    if(childCount>=100){
    	 $("#gj_msg").html("");
    }
    //添加消息
    var html = '<p style="color:'+color+';font-size:14px;">'+message+'</p>';
    $("#gj_msg").append(html);
    
    //滚动消息显示位置
    var msgboxDiv = document.getElementById("gj_msg_box");
    msgboxDiv.scrollTop = msgboxDiv.scrollHeight;
    $("#gj_msg_box").mCustomScrollbar("scrollTo",msgboxDiv.scrollHeight,{});
    
}

/**
 * 播放告警声音
 * //TODO
 */
ZhtsAnalyse.prototype.audioPlay = function(){
    document.getElementById("audio1").play();
}

/**
 * 关闭告警声音
 * //TODO
 */
ZhtsAnalyse.prototype.audioStop = function(){
    document.getElementById("audio1").pause();
}