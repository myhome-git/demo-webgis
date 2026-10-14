//态势设置
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	/**
	 * 获取所有融合图层
	 */
	module.getVectorLayerArray = function(){
		return this.parent.MAP.getMap().getHJLayerArr();
	}
	
	/**
	 * 判断我方
	 * @param {Object} dwsx
	 */
	module.isWoFang = function(dwsx){
		if(dwsx && (dwsx === "我" || dwsx === "友")){
			return true;
		}
		return false;
	}
	
	/**
	 * 判断敌方
	 * @param {Object} dwsx
	 */
	module.isDiFang = function(dwsx){
		return !this.isWoFang(dwsx);
	}
	
	/**
	 * 我方航迹粗细设置
	 * @param {Object} value
	 */
	module.setWoFangHangJiSize = function(value){
		var arr = this.getVectorLayerArray();
	    for (var j = 0; j < arr.length; j++) {
	        //获取我方所有航迹
	        //获取对应数据源
	        if (!(arr[j] instanceof ol.layer.Vector)) {
	            continue;
	        }
	        var s = arr[j].getSource();
	        //获取数据源包含的所有要素
	        var f = s.getFeatures();
	        if (f.length > 0) {
	            for (var i = 0; i < f.length; i++) {
	                var feature = f[i];
	                var dwsx = feature.getProperties().dwsx;
	                var fid = feature.getId();
	                var geom = feature.getGeometry();
	                var pro = feature.getProperties();
	                
					if(this.isWoFang(dwsx)){
						//var ph = feature.getProperties().ph;
	
	                    //拼接对象
	                    hjconfigObj.wf.pointCount = Number(pro.point_count);
	                    hjconfigObj.wf.hjtype = pro.hjtype;
	                    hjconfigObj.wf.hjsize = Number(value);
	                    hjconfigObj.wf.hjcolor = pro.color;
	                    manager.setwfHJSize(hjconfigObj.wf.hjsize);
	                    feature.setProperties({
	                        "ph": pro.ph,
	                        "hjtype": pro.hjtype,
	                        "point_count": Number(pro.point_count),
	                        "color": pro.color,
	                        "dwsx": pro.dwsx,
	                        "size": Number(value)
	                    });
	                    if (geom instanceof ol.geom.LineString) {
	                        //根据属性设置对应样式
	                        feature.setStyle( // linestring
	                            new ol.style.Style({
	                                stroke: new ol.style.Stroke({
	                                    color: pro.color,
	                                    width: Number(value)
	                                })
	                            }));
	                    } else if (geom instanceof ol.geom.MultiPoint) {
	                        feature.setStyle(new ol.style.Style({
	                            image: new ol.style.Circle({
	                                radius: value,
	                                fill: new ol.style.Fill({
	                                    color: pro.color
	                                }),
	                                stroke: new ol.style.Stroke({
	                                    color: pro.color,
	                                    width: Number(value)
	                                })
	                            })
	                        }));
	                    }
					}
	            }
	        }
	    }
	}
	
	/**
	 * 敌方航迹粗细设置
	 * @param {Object} value
	 */
	module.setDiFangHangJiSize = function(value){
		var arr = this.getVectorLayerArray();
	    for (var j = 0; j < arr.length; j++) {
	        //获取敌方所有航迹
	        //获取对应数据源
	        if (!(arr[j] instanceof ol.layer.Vector)) {
	            continue;
	        }
	        var s = arr[j].getSource();
	        //获取数据源包含的所有要素
	        var f = s.getFeatures();
	        if (f.length > 0) {
	            for (var i = 0; i < f.length; i++) {
	                var feature = f[i];
	                var dwsx = feature.getProperties().dwsx;
	                var fid = feature.getId();
	                var geom = feature.getGeometry();
	                var pro = feature.getProperties();
	                if (dwsx === "敌" || dwsx === "中立" || dwsx === "不明") {
	                    //var ph = feature.getProperties().ph;
	                    //拼接对象
	                    hjconfigObj.df.pointCount = Number(pro.point_count);
	                    hjconfigObj.df.hjtype = pro.hjtype;
	                    hjconfigObj.df.hjsize = Number(value);
	                    hjconfigObj.df.hjcolor = pro.color;
	                    manager.setdfHJSize(hjconfigObj.df.hjsize);
	                    feature.setProperties({
	                        "ph": pro.ph,
	                        "hjtype": pro.hjtype,
	                        "point_count": Number(pro.point_count),
	                        "color": pro.color,
	                        "dwsx": pro.dwsx,
	                        "size": Number(value)
	                    });
	                    if (geom instanceof ol.geom.LineString) {
	                        //根据属性设置对应样式
	                        feature.setStyle( // linestring
	                            new ol.style.Style({
	                                stroke: new ol.style.Stroke({
	                                    color: pro.color,
	                                    width: Number(value)
	                                })
	                            }));
	                    } else if (geom instanceof ol.geom.MultiPoint) {
	                        feature.setStyle(new ol.style.Style({
	                            image: new ol.style.Circle({
	                                radius: value,
	                                fill: new ol.style.Fill({
	                                    color: pro.color
	                                }),
	                                stroke: new ol.style.Stroke({
	                                    color: pro.color,
	                                    width: Number(value)
	                                })
	                            })
	                        }));
	                    }
	                }
	            }
	        }
	    }
	}
	
})(jQuery,_pageObject,_pageObject.TAISHISET={});