/*
 * 功能： 方向态势上图 —— FXTSST
 * 方向 ：
 *  ① 东 部 方向  
 *  ② 南 部 方向 
 *  ③ 西 部 方向   
 *  ④ 北 中 方向
 * 
 * 方向目标点数据  来自于 军事部署目标编组   
 * 数据库表为 ： 
 *  ① jsbs      军事部署表
 *  ② jsbs_bssl 军事部署实例表
 */



var FXTSST = function () {   // FXTSST  

    this.baseUrl = {
         bsslUrl : "/BsController/getBSSLList",    // 获取部署实力信息  参数  BSID
         bdmbPointUrl : "/bdmb/queryZDZBBynms",    // 根据部署实力对象 nm 查询 部队目标点  参数 bdnms nm数组转换为 字符串
         ssmbPointUrl : "/ssmb/queryZXDZBBynms",   // 根据部署实力对象 nm 查询 设施目标点  参数 ssnms nm数组转换为 字符串
         targetJbUrl: "/jb/getJB"                  // 获取军标
    }

    this.fxMark = { // 方向标记  此标记用于标识 4个方向的目标点是否上图 true 为上图  false 为取消上图
        east : true,    // 东
        south : true,   // 南
        western : true, // 西
        north : true,   // 北
        center : true   // 中
    };
    this.map ;             // map 对象

    this.layers = {

        dongLayer : new ol.layer.Vector({   // 东部要素 图层 
                        source: new ol.source.Vector(),
                        zIndex: 3
                    }),
        nanLayer : new ol.layer.Vector({    // 南部要素 图层 
                        source: new ol.source.Vector(),
                        zIndex: 3
                    }),
        xiLayer : new ol.layer.Vector({     //西部要素 图层 
                        source: new ol.source.Vector(),
                        zIndex: 3
                    }),
        beiLayer : new ol.layer.Vector({      //北部要素 图层  
                        source: new ol.source.Vector(),
                        zIndex: 3
                    }),
        zhongLayer : new ol.layer.Vector({      //中部要素 图层  
                        source: new ol.source.Vector(),
                        zIndex: 3
                    }),
    };               // 目标点 设施 部队  图层

    //this.mbnmFeatureMap = {};   // 目标点 根据内码   存储 所有选中的  矢量要素
    this.targetType = {         // 目标 类型
        ssmb:"ssmb",
        bdmb:"bdmb"
    };
}


FXTSST.prototype = {
    
    // 获取 地图当前缩放级别
    getZoom: function(){    
        return this.map.getView().getZoom();
    },

    init: function(map){
        this.map = map;
        //坐标点目标(设施  部队) 要素 用到的  layer
        this.vLayer = new ol.layer.Vector({   
            source: new ol.source.Vector(),
            zIndex: 3
        });
    },
     /**
      * 方法功能：将指定的 data 目标数据  上图 添加到指定的layer 图层中
      * 参数：
      * 1、data  ： 目标点数据
      * 2、layer ： 目标点feature 所在的图层
      */ 
     insertMBPoint: function(data,layer){

        for(var i=0;i<data.length;i++){
            if(!data[i])continue;
            var nm;     // 目标内码
            var text ;  // 目标名称文本
            var type;   // 目标类型
            var point = [parseFloat(data[i].JDUse),parseFloat(data[i].WDUse)];  // 目标坐标点
            var coordinate=ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857');  // 目标坐标点（格式转换后的山）
            var icon = this.baseUrl.targetJbUrl+'?JBKH='+data[i].JBKH+'&JBDH='+data[i].JBDH+'&CC='+data[i].JBCC+'&JBYS='+data[i].JBYS;
            if(data[i].MBNM){
                text = data[i].MBMC;            // 目标名称
                nm = data[i].MBNM;              // 目标内码（设施）
                type = this.targetType.ssmb;    // 目标类型（部队）
            }else{
                text = data[i].BDFH;            // 目标番号（名称）
                nm = data[i].BDNM;              // 目标内码（部队）
                type = this.targetType.bdmb;    // 目标类型（部队）
            }
            var feature=new ol.Feature({    // 目标坐标 要素
            geometry: new ol.geom.Point(coordinate),    // 设置坐标点
            name:text,                  // 设置 名称
            });
            feature.set("nm",nm);       // 存放内码数据
            feature.set("type",type);   // 存放类型数据
            feature.set("info",data[i]);// 存放目标信息
            feature.set("point",point); // 存放坐标信息
            feature.set("coordinate",coordinate);   // 存放坐标信息（转换后坐标）
            //this.mbnmFeatureMap[nm]= feature;      // 目标要素 信息
            //创建目标 坐标样式
            var style=new ol.style.Style({
                image: new ol.style.Icon({
                scale: 0.7,
                src: data[i].JBKH ? icon:""
                }),
                text:new ol.style.Text({
                        textAlign: 'left',
                        textBaseline: "middle",
                        font: "12px 宋体",
                        text:  text,
                        fill: new ol.style.Fill({color: 'blue'}),//字体颜色
                        stroke: new ol.style.Stroke({color: 'white'}),//字体背景色和背景宽度
                        offsetX: 10,
                        offsetY: 15,
                        rotation: 0
                })
            });
            //设置点样式
            feature.setStyle(style);
            //清除坐标点

            //将当前要素添加到矢量数据源中
            layer.getSource().addFeature(feature);
        }

        this.map.removeLayer(layer);
        this.map.addLayer(layer);
      },
      /**
       *  方法功能： 清空指定layer中的 feature 并移除layer
       */
      removeLayer:function(layer){
        layer.getSource().clear();
        this.map.removeLayer(layer);
      },
      /**
       *  方法功能： 清空全部feature 移除全部layer
       */
      removeAllLayer:function(){
        if(this.layers){
            for(var key in this.layers){
                this.layers[key].getSource().clear();
                this.map.removeLayer(this.layers[key]);
            }
        }
        if(this.fxMark){ // 方向选中标识 设置为默认值  true
            for(var key in this.fxMark){
                this.fxMark[key]=true;
            }
        }
      },
      // 移除  目标点要素
      removeFeature: function(layer,feature){
        if (feature) {
          layer.getSource().removeFeature(feature);
          }
      },
      // 获取 目标实力打击探测  数据
      getTargetSldjData: function(layer,type,nm){
        AttackRange.getZzxnArr(type,nm,function(data){
            fxtsst.insertTargetSldjView(layer,data,nm);
        });
      },
      // 获取layer 中的所有 feature
      getLayerFeatures: function(layer){
        if(layer){
            return layer.getSource().getFeatures();
        }
        return null;
      },
      /**
       *    方法功能：根据nm为指定目标 添加实力打击探测图
       *    参数：
       *    1、layer ： 需要处理的目标点图层
       *    2、data  ： 需要上图的数据（实力打击探测数据）
       *    3、nm    ： 所属的目标内码
       */
      insertTargetSldjView: function(layer,data,nm){
        // 获取所有 目标要素
        var features = layer.getSource().getFeatures();
        var point = [];
        // 遍历图层中所有的feature 根据nm 获取到 该目标的坐标信息
        for(var i = 0;i< features.length ;i++){
            var properties = features[i].getProperties();
            if(properties.nm==nm){
                point = properties.point;
                break;
            };
        }
        // 遍历 实力打击探测数据
        for(var i = 0; i< data.length;i++){
            for(var j = 0; j< data[i].length;j++){
                // 根据装备效能内码 获取一种颜色
                var color= AttackRange.getFeatureColor(data[i][j].zzxnnm);
                /**
                 * 上图  包括  圆  线  字
                 * 方法 共 6 个参数  按照顺序  
                 * 分别为：(坐标,半径,内码,名称,颜色,性能内码,效能类型(打击/探测)    
                 */
                AttackRange.showRange(point,data[i][j].zdzyjl,  nm,  data[i][j].sszbjc+"-"+data[i][j].zdxn,  color,  data[i][j].zzxnnm,data[i][j].zylx+data[i][j].xnlx);
            }
        }
      }

}
window.fxtsst = new FXTSST();