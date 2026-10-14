(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    //define(['jquery', ds_config.base + 'softs/wzUnion/turf.js'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function (jQuery) {
  var $ = jQuery, scrollid = 2019,
    _win = typeof window !== "undefined" ? window : this;

  var unionRange = function () {

    this.opt = {
      name: "unionRange", //软件的名字
      text: "打击范围联合",
      css: "",//此功能需要加载的css文件
      icon: "", //软件对应的图标
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
  }

  var format;
  unionRange.prototype = {

    init: function (id, dlgDom, index) {//这是所有软件的入口，点击桌面上的图标，会执行这个函数
      format = new ol.format.GeoJSON();
    },
    convertToPolygonFeature: function (circle) {//将圆形feature转换为区域feature
      var circleGeom = circle.getGeometry();
      // layer.getSource().addFeature(new ol.Feature({
      //   geometry:circleGeom
      // }))
      // console.log(circle.diy.lx);
      var p = ol.geom.Polygon.fromCircle(circleGeom, 90);
      var pf = new ol.Feature({
        geometry: p
      })
      //console.log(circleGeom instanceof ol.geom.Circle ,circleGeom.getCenter(),circleGeom.getRadius())
      return pf;
    },
    clearAll: function (layer) {
      layer.getSource().clear();
    },
    getCircleUnionFeature: function (features, layer,curr_color) {//根据传递过来的圆形数组创建包络图
      var pf_arr = [];
      var self = this;
      self.clearAll(layer);
      if (features.length != 0) {
        $.each(features, function (i, v) {
          //console.log(v.getGeometry() instanceof ol.geom.Circle ,v.getGeometry().getCenter(),v.getGeometry().getRadius())
          var PolygonFeature = self.convertToPolygonFeature(v);
          var pt = format.writeFeatureObject(PolygonFeature);
          pf_arr.push(pt);
        });
        if (pf_arr.length == 1) {
          layer.getSource().addFeature(features[0]);
          return features[0];
        } else {
          var union = turf.union.apply(turf, pf_arr);
          var unionFeature = format.readFeature(union);
          layer.getSource().addFeature(unionFeature);
           var currStyle = new ol.style.Style({
              stroke: new ol.style.Stroke({
                width: 2,
                color: curr_color
              })
            });
      unionFeature.setStyle(currStyle);
          return unionFeature;
        }
      }



    }
  }

  window.UnionRange = new unionRange();
  UnionRange.init();

});
