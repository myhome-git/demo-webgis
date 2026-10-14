(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function (jQuery) {
  var $ = jQuery, scrollid = 2019,
    _win = typeof window !== "undefined" ? window : this;

  var attackRange = function () {

    this.opt = {
      name: "attackRange", //软件的名字
      text: "打击范围",
      css: "query",//此功能需要加载的css文件
      icon: "img/css.png", //软件对应的图标
      inmediately: true,//转载完成后立即执行本软件的init函数（this.init()）
      //当使用gos提供的layer对话框时，需要传入的参数，详情请参照layui的弹出层，仅支持页面层和ifram层,true表示均用默认值
      //title不用设置，因为title用的是软件的名字
      //type不用设置，这里固定是1，如果希望用其他的弹出层，可以参考layui，layui这个对象是可以直接用的
      //若果不适用gos提供的对话框，dialog参数时0或者false或者undefined即可
      dialog: undefined
    }
    //this.template是要加到对话框中的html代码，如果不需要dialog，这个可以没有，请不要设置成object
    this.template = `
      <div class='zzxnList' >
      <p>性能列表</p>
        
      </div>
    `;
    this.trackMap = {};
  }  

  var baseUrl = {
    ptmb: { url: "/djtcfw/getPtmbZzxn?zbnm=" },//平台目标
    ssmb: { url: "/djtcfw/getSsmbZzxn?mbnm=" },//设施目标
  };
  var ol_geom_line = function (center, randius, sAngle) {
    //90度为正北
    // sAngle = (360 - sAngle +90) % 360;
    //0度为正东
    sAngle = (360 - sAngle) % 360;
    var x = center[0] + randius * Math.cos(degreeToRadian(sAngle));
    var y = center[1] + randius * Math.sin(degreeToRadian(sAngle));
    return [x, y]
  };
  var degreeToRadian = function (degree) {
    return Math.PI * degree / 180;
  };
  var queryUrl = "";
  var map;
  var zzxnArr = [];//作战效能数组
  var r_layer;//半径图层
  var p_layer;//名字点图层
  var features = {};//放置圆
  var lineFeatures = {};//放置半径线
  var namePointFeatures = {};//放置名字点
  var nm;
  var arr_layer={};
  var featureArray={};
  var djFeatures=[];
   var tcFeatures=[];
   var colors=[];
   var blt_color;
   //var track;
  attackRange.prototype = {
    setMap: function(BIGMap){
      map = BIGMap.map;
    },
    init: function (id, dlgDom, index) {//这是所有软件的入口，点击桌面上的图标，会执行这个函数
    //  track = new ol.Track();
     colors=['red','blue','yellow','green','orange','purple'];
      //此图层为半径线图层
      r_layer = new ol.layer.Vector({
        source: new ol.source.Vector()
      });
      // r_layer.setMap(BigMap.getMap());
      map.addLayer(r_layer, 1);
      //此图层为放置名称点的图层
      p_layer = new ol.layer.Vector({
        source: new ol.source.Vector()
      });
      // p_layer.setMap(BigMap.getMap());
      map.addLayer(p_layer, 1);
      // //此图层探测图层
      // tc_layer = new ol.layer.Vector({
      //   source: new ol.source.Vector()
      // });
      // BigMap.getMap().addLayer(tc_layer, 1);
      // //此图层打击图层
      // dj_layer = new ol.layer.Vector({
      //   source: new ol.source.Vector()
      // });
      // BigMap.getMap().addLayer(dj_layer, 1);
    },
    getZzxnArr: function (type, nm, func) {//获取平台目标的作战性能
      this.loadQueryUrl(type);
      this.getZzxn(nm, func);
    },
    getZzxn: function (nm, func) {//根据内码查询作战性能参数
      var _that = this;
      $.ajax({
        type: "post",
        url: queryUrl + nm,
        dataType: "json",
        async: false,
        success: function (data) {
          if (func) {
            func(data.arr);
          } else {
            return data.arr;
          }
        }
      })
    },
    loadQueryUrl: function (type) {//根据不同类型加载查询url
      switch (type) {
        case 'ptmb':
          queryUrl = baseUrl.ptmb.url;
          break;
        case 'ssmb':
          queryUrl = baseUrl.ssmb.url;
          break;
      }
    },
    // 控制是否显示 文字
    showName:function(isShow){
        p_layer.setVisible(isShow);
    },
    // 控制是否显示 半径
    showRadius:function(isShow){
        r_layer.setVisible(isShow);
    },
    /**
     * 参数(坐标,半径,内码,名称,颜色,性能内码,效能类型(打击/探测))
     */
    showRange: function (pos, radius, nm, mc, curr_color, xnnm,lx) {//展示打击或探测范围
      
       //var blt_color=colors[Math.floor(Math.random()*colors.length+1)-1];
       blt_color=curr_color;
      if (features[nm]) {
        if (features[nm][mc]) {
          this.removeFeatureByNmAndMc(nm, mc,blt_color,lx);
          features[nm][mc] = null;
          lineFeatures[nm][mc] = null;
          namePointFeatures[nm][mc] = null;
          return;
        }
      }
      /*绘制圆形 start*/

      var geo = new ol.geom.Circle(ol.proj.fromLonLat(pos),radius);

      var f = new ol.Feature({
        geometry: geo
      });
      var currStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 2,
          color: curr_color
        })
        // fill: new ol.style.Fill({
        //   color: curr_color
        // })
      });
      f.setStyle(currStyle);
      f.diy={};
      f.diy.bj=radius;
      f.diy.lx=lx;
      /*绘制圆形 end*/

      /*绘制半径线 start*/
      var sAnglel = 20 + 20 * xnnm;
      var linell = new ol_geom_line(ol.proj.fromLonLat(pos), radius, sAnglel);
      var line = new ol.geom.LineString([ol.proj.fromLonLat(pos), linell]);
      var linetar = new ol.Feature({
        geometry: line
      })
      var style1 = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'black'
        }),
        fill: new ol.style.Fill({
          color: 'black'
        }),
        zIndex: -1,
        text: new ol.style.Text({
          textAlign: 'left',
          font: "12px 微软雅黑",
          text: (radius / 1000) + "千米",//this.get('name'),
          fill: new ol.style.Fill({ color: 'blue' }),//字体颜色
          stroke: new ol.style.Stroke({ color: 'white', width: 2 }),//字体背景色和背景宽度
        })
      });
      r_layer.getSource().addFeature(linetar);
      linetar.setStyle(style1);
      f.diy.jd=sAnglel;
      /*绘制半径线 end*/
      /*绘制名称点位 start*/
      var linepoint = new ol.Feature({
        geometry: new ol.geom.Point(linell)
      })
      var style2 = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(1,1,1,0)"
        }),
        fill: new ol.style.Fill({
          color: "rgba(1,1,1,0)"
        }),
        zIndex: -1,
        text: new ol.style.Text({
          textAlign: 'left',
          font: "12px 微软雅黑",
          text: mc,//this.get('name'),
          fill: new ol.style.Fill({ color: 'blue' }),//字体颜色
          stroke: new ol.style.Stroke({ color: 'white', width: 2 }),//字体背景色和背景宽度
        })
      });
      p_layer.getSource().addFeature(linepoint);
      linepoint.setStyle(style2);
      /*绘制名称点位 end*/
      if (features[nm]) {
        features[nm][mc] = f;
      } else {
        var currFeatures = {};
        currFeatures[mc] = f;
        features[nm] = currFeatures;
      }
      if (lineFeatures[nm]) {
        lineFeatures[nm][mc] = linetar;
      } else {
        var currLineFeatures = {};
        currLineFeatures[mc] = linetar;
        lineFeatures[nm] = currLineFeatures;
      }
      if (namePointFeatures[nm]) {
        namePointFeatures[nm][mc] = linepoint;
      } else {
        var currPointFeatures = {};
        currPointFeatures[mc] = linepoint;
        namePointFeatures[nm] = currPointFeatures;
      }
      var curr_layer=AttackRangeConfig.getLayerByLx(lx);
      var curr_features=AttackRangeConfig.getFeaturesByLx(lx);

      curr_features.push(f);
      UnionRange.getCircleUnionFeature(curr_features, curr_layer,blt_color);
      f.set("nm",nm);
      linetar.set("nm",nm);
      linepoint.set("nm",nm);
      var fs = [linepoint,linetar,f];
      if(this.trackMap[nm]){
        this.trackMap[nm].bindFeatures(fs);
      }
      
      // //添加入feature数组
      //   var curr_arr=this.getArray(mc);
      //     curr_arr.push(f);
      //     //将圆形feature数组和图层传入 绘制联合包络图
      //     UnionRange.getCircleUnionFeature(curr_arr, this.getLayer(mc),curr_color);
    },
    getLayer:function (mc){
      if(arr_layer[mc]){
        return arr_layer[mc];
      }else{
        var arr_length=Object.getOwnPropertyNames(arr_layer).length;
        var name="layer_"+arr_length;
         window[name]  = new ol.layer.Vector({
        source: new ol.source.Vector()
      });
      // vLayer.setMap(map);
      map.addLayer(window[name], 1);
      arr_layer[mc]=window[name];
      return window[name];
      }
    },
    getArray:function(mc){
      
      if(featureArray[mc]){
        return featureArray[mc];
      }else{
        var arr_length=Object.getOwnPropertyNames(featureArray).length;
        var name="array_"+arr_length;
         window[name]  = [];
        featureArray[mc]=window[name];
        return window[name];
      }
    },
    removeFeatureByNmAndMc: function (nm, mc,blt_color,lx) {//删除范围图像
      r_layer.getSource().removeFeature(lineFeatures[nm][mc]);
      p_layer.getSource().removeFeature(namePointFeatures[nm][mc]);

      var curr_layer=AttackRangeConfig.getLayerByLx(lx);
      var curr_features=AttackRangeConfig.getFeaturesByLx(lx);
      curr_features.splice($.inArray(features[nm][mc], curr_features), 1);
      UnionRange.getCircleUnionFeature(curr_features, curr_layer,blt_color);
      //  var curr_arr=this.getArray(mc);
      //      curr_arr.splice($.inArray(features[nm][mc], curr_arr), 1);
      //     //将圆形feature数组和图层传入 绘制联合包络图
      //     UnionRange.getCircleUnionFeature(curr_arr, this.getLayer(mc),curr_color);
    },
    // clearNmRange: function (nm) {//清除此内码相关的feature
    //   for (var key in features[nm]) {
    //     this.removeRange(features[nm][key]);
    //   }
    //   features[nm] = null;
    // },
    clearRang: function (layer) {//清除此图层上所有的feature
      layer.getSource().clear();
    },

    clearAllRange: function () {
      //清空所有的包络图层
      // for (var key in arr_layer) {
      //    this.clearRang(arr_layer[key]);
      //  }
      //  arr_layer={};
      //  //清空所有的包络图对象数组
      //  featureArray={};

      AttackRangeConfig.clearALL();
      //清空features
      features = {};
      lineFeatures = {};
      namePointFeatures = {};
      this.clearRang(r_layer);
      this.clearRang(p_layer);
    },

    move: function (nm, newPos) {//将某个目标的所有feature移动到新的坐标
       if (features[nm]) {
         for (var key in features[nm]) {
           //重新定义圆形中心点
           var circleFeature = features[nm][key];
           circleFeature.getGeometry().setCenter(ol.proj.fromLonLat(newPos));
           //重新定义线的位置
           var lineFeature=lineFeatures[nm][key];
           var new_linell = new ol_geom_line(ol.proj.fromLonLat(newPos), circleFeature.diy.bj, circleFeature.diy.jd);
            var new_line = new ol.geom.LineString([ol.proj.fromLonLat(newPos), new_linell]);
            lineFeature.setGeometry(new_line);
            //重新定义点的位置
            var pointFeature=namePointFeatures[nm][key];
            pointFeature.getGeometry().setCoordinates(new_linell);
             //var blt_color=colors[Math.floor(Math.random()*colors.length+1)-1];
             //重新形成包络图
             var curr_layer=AttackRangeConfig.getLayerByLx(circleFeature.diy.lx);
             var curr_features=AttackRangeConfig.getFeaturesByLx(circleFeature.diy.lx);
             curr_features.splice($.inArray(features[nm][key], curr_features), 1);
             curr_features.push(circleFeature);
             UnionRange.getCircleUnionFeature(curr_features, curr_layer,blt_color);
         }
       }
     },
    getfeatures: function () {//放置圆
      return features;
    },
    lineFeatures: function () {//放置半径线
      return lineFeatures;
    },
    namePointFeatures: function () {//放置名字点
      return namePointFeatures;
    },
    getFeatureColor: function (xnnm) {//根据不同的性能内码给与不同的颜色
      var color;
      switch (xnnm) {
        case '1':
          color = [255, 87, 34, 0.5];
          break;
        case '2':
          color = [255, 100, 0, 0.5];
          break;
        case '3':
          color = [255, 255, 0, 0.5];
          break;
        case '4':
          color = [255, 120, 100, 0.5];
          break;
        case '5':
          color = [0, 100, 255, 0.5];
          break;
        case '6':
          color = [120, 0, 255, 0.5];
          break;
      }
      return color;
    }
    
  }

  window.AttackRange = new attackRange();
  //_win.AttackRange = a;
  //return a;
  // "attackRange": { "url": "/ds/softs/wzAttackRange/attackRange.js","descript":"打击范围","author":"wz"}
  //zzxnQuerySource: "http://[IP已脱敏]/",
});
