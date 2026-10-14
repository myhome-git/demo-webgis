/**
 * 军事力量部署信息  
 * 
 * 方向态势 上图后  可以查看坐标点目标的军事力量部署信息
 * 
 */
//"jsllbs": { "url": "/ds/softs/hzm/jsllbs/jsllbs.js","descript":"右键菜单目标点军事力量部署","author":"hzm"}
(function (factory) {
    if (typeof define === 'function' && define.amd) {
      define(['jquery'], factory);
    } else {
      factory(jQuery);
    }
  })(function (jQuery) {
    var $ = jQuery,//scrollid = 2019,
      _win = typeof window !== "undefined" ? window : this;


    var hzmLayer;
    var baseUrl = {
      searchCon: "/jsmbsl/queryJSSL"//http://10.55.188.162:20008
    };
  
    var jsllbs = function () {
        this.app = $("#map");

        this.map ;
        this.feature ; // 当前目标要素


        //this.path = 
        this.opt = {
            name: "jsllbs", //软件的名字
            text: "测试属性2",
            icon: "img/css.png", //软件对应的图标(暂无用)
            css: ["jsllbs"],//此功能需要加载的css文件
            inmediately: true,//转载完成后立即执行本软件的init函数（this.init()）
        }
        this.template = `
            <div class='yourclass hzm_cs'>
            <i id='hzm_closebtn'>X</i>
                <ul class="hzm_cs_child"></ul>  
            </div>
            `;
        this.templatepage = "11";


        // 地图 目标元素  鼠标右键菜单
        // this.mbRightMenu = `
        // <div id="xzy-right-click-menu" class="xzy-right-click-menu">
        //     <ul>
        //     <li  class="military-force">军事力量部署</li>
        //     </ul>
        // </div>
        // `;
    }
    jsllbs.prototype = {
      init: function (map) {//这是所有软件的入口，会执行这个函数         
        //this.target = $(this.mbRightMenu).appendTo($(document.body));
        var idValue = $(this.mbRightMenu).attr("id"); // 右键菜单 根节点id值
        this.map = map;
        var _self = this;

        //this.loadRightMenu(this.map,idValue,this);
        // this.btnjsllClick(this.map, _self)
        
      },
      getDom:function(){
        return $(".military-force");;
      },
        // 创建一个  地图小部件  该部件的位置由绑定的地理坐标来决定
        getOverlay: function(id,position){
            if(!position){
            position = "center-center";
            }
            return new ol.Overlay({ 
                    element: document.getElementById(id),
                    positioning: position
                });
        },
       // 加载地图要素右键菜单
    //   loadRightMenu:function(map,idValue,_self){
    //     this.btnjsllClick(map,_self);
    // },
      btnjsllClick: function (feature) {

        var map = this.map;
        var _self = this;
        hzmLayer = new ol.layer.Vector({
          source: new ol.source.Vector()
        })

        this.map.addLayer(hzmLayer)
            //var feature = jsllbs.feature;
            console.log(feature)
            var hzmConId = 'hzm' + feature.get("nm");
            var hzmFeature = 'hzmFe' + feature.get("nm");
            var hzmNewLine;
            //alert(hzmConId);
            if (map.getOverlayById(hzmConId)) { //判断地图是否有弹框
              //右键弹框隐藏
              $("#xzy-right-click-menu").slideUp(200);
              map.removeOverlay(map.getOverlayById(hzmConId))
              var hzmAllFeatures = hzmLayer.getSource().getFeatures()
              //console.log(hzmAllFeatures[0].getProperties())
              for (var i = 0; i < hzmAllFeatures.length; i++) {
                if (hzmAllFeatures[i].getProperties().id === hzmFeature) {
                  hzmLayer.getSource().removeFeature(hzmAllFeatures[i])
                }
              }
    
              return
    
            }
            var target = $(_self.template);
            //console.log(hzmOverlayId)
            var overlay = new ol.Overlay({
              element: target.get(0),
              id: hzmConId,
              autoPan: true,
              autoPanAnimation: {
                duration: 250
              }
            })
    
            //overlay.setPositioning('bottom-right')
    
    
            map.addOverlay(
              overlay
            );
    
            //设置右键overlay坐标
            var newx = parseFloat(feature.get("info").JDUse);
            var newy = parseFloat(feature.get("info").WDUse);
            var newmapcor = ol.proj.fromLonLat([newx, newy])
            overlay.setPosition(newmapcor);
    
            //右键弹框隐藏
            //$("#xzy-right-click-menu").slideUp(200);
    
            var hzmsjnm = feature.get("nm");
            var hzmtype = feature.get("type");
            var param = $.param({ 'sjnm': hzmsjnm, 'type': hzmtype });
            console.log(param)
            //页面渲染
            $.ajax({
              type: "POST",
              //url: baseUrl.searchCon,
              url: '/jsmbsl/queryJSSL',
              //url: 'http://10.55.188.162:20013/jsmbsl/queryJSSL?sjnm=010200200000000981&type=bdmb',
              data: param,
              success: function (data) {
                var bianzhi = data.data.bianzhi;
                var zhuangbei = data.data.zhuangbei;
                var qita = data.data.qita;
                var dazai = data.data.dazai;
                var bushu = data.data.bushu;
                if (bianzhi.length != 0 || zhuangbei.length != 0 || qita.length != 0 || dazai.length != 0 || bushu.length != 0) {
                  if (bianzhi.length > 0) { //添加数据名称
                    target.children(".hzm_cs_child").append("<li class='hzm_tip'>" + bianzhi[0].sjmc + "</li>");
                  } else if (zhuangbei.length > 0) {
                    target.children(".hzm_cs_child").append("<li class='hzm_tip'>" + zhuangbei[0].sjmc + "</li>");
                  } else if (dazai.length > 0) {
                    target.children(".hzm_cs_child").append("<li class='hzm_tip'>" + dazai[0].sjmc + "</li>");
                  } else if (bushu.length > 0) {
                    target.children(".hzm_cs_child").append("<li class='hzm_tip'>" + bushu[0].sjmc + "</li>");
                  } else {
                    target.children(".hzm_cs_child").append("<li class='hzm_tip'>" + qita[0].sjmc + "</li>");
                  }
                  if (bianzhi.length != 0) {  //判断有没有编制
                    target.children(".hzm_cs_child").append("<li class='top_tip'>人员编制</li>");
                    for (var i = 0; i < bianzhi.length; i++) {
                      target.children(".hzm_cs_child").append("<li><span>" + bianzhi[i].slmc + "</span>&nbsp;&nbsp;实力编制数：<i>" + bianzhi[i].slbzs + "</i>&nbsp;&nbsp;实力实有数：<i>" + bianzhi[i].slsys + "</i></li>");
                    }
                  }
                  if (zhuangbei.length != 0) {
                    target.children(".hzm_cs_child").append("<li class='top_tip'>装备</li>");
                    for (var i = 0; i < zhuangbei.length; i++) {
                      target.children(".hzm_cs_child").append("<li><span>" + zhuangbei[i].slmc + "</span>&nbsp;&nbsp;实力编制数：<i>" + zhuangbei[i].slbzs + "</i>&nbsp;&nbsp;实力实有数：<i>" + zhuangbei[i].slsys + "</i></li>");
                    }
                  }
                  if (dazai.length != 0) {
                    target.children(".hzm_cs_child").append("<li class='top_tip'>搭载</li>");
                    for (var i = 0; i < dazai.length; i++) {
                      target.children(".hzm_cs_child").append("<li><span>" + dazai[i].slmc + "</span>&nbsp;&nbsp;实力编制数：<i>" + dazai[i].slbzs + "</i>&nbsp;&nbsp;实力实有数：<i>" + dazai[i].slsys + "</i></li>");
                    }
                  }
                  if (bushu.length != 0) {
                    target.children(".hzm_cs_child").append("<li class='top_tip'>部署</li>");
                    for (var i = 0; i < bushu.length; i++) {
                      target.children(".hzm_cs_child").append("<li><span>" + bushu[i].slmc + "</span>&nbsp;&nbsp;实力编制数：<i>" + bushu[i].slbzs + "</i>&nbsp;&nbsp;实力实有数：<i>" + bushu[i].slsys + "</i></li>");
                    }
                  }
                  if (qita.length != 0) {
                    target.children(".hzm_cs_child").append("<li class='top_tip'>其他</li>");
                    for (var i = 0; i < qita.length; i++) {
                      target.children(".hzm_cs_child").append("<li><span>" + qita[i].slmc + "</span>&nbsp;&nbsp;实力编制数：<i>" + qita[i].slbzs + "</i>&nbsp;&nbsp;实力实有数：<i>" + qita[i].slsys + "</i></li>");
                    }
                  }
                } else {
                  $("#xzy-right-click-menu").slideUp(200);
                  map.removeOverlay(map.getOverlayById(hzmConId))
                  var hzmAllFeatures = hzmLayer.getSource().getFeatures()
                  for (var i = 0; i < hzmAllFeatures.length; i++) {
                    if (hzmAllFeatures[i].getProperties().id === hzmFeature) {
                      hzmLayer.getSource().removeFeature(hzmAllFeatures[i])
                    }
                  }
                  alert("没有数据")
                }
    
    
    
              }
            })
    
    
            //画线
            hzmNewLine = new ol.Feature({
              geometry: new ol.geom.LineString([newmapcor, [(overlay.getPosition())[0], (overlay.getPosition())[1]]]),
              id: hzmFeature
    
            })
            hzmNewLine.setStyle(
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  width: 2,
                  color: [0, 0, 0, 0.8]
                })
              })
            )
            hzmLayer.getSource().addFeature(hzmNewLine)
    
    
            var isdown = false
    
            //拖拽
            target.on("mousedown", function (e) {
              if (e.target.nodeName.toLowerCase() == 'i') {
                isdown = false
              } else {
                isdown = true
              }
            })
            $("#map").on("mousemove", function (e) {
              if (isdown) {
                var t = map.getEventCoordinate(e)
                overlay.setPosition(t);
                //console.log(overlay.getPosition())
    
                //console.log(overlay.getElement())
    
                var oHzmWidth = parseInt(target.outerWidth()); //overay的宽度
                var oHzmHeight = parseInt(target.outerHeight()); //overlay的高度
    
                var pixel = map.getCoordinateFromPixel([e.clientX, e.clientY]);//鼠标点
                var newpixel = map.getCoordinateFromPixel([e.clientX + oHzmWidth, e.clientY]) //右上点
                var newpixel1 = map.getCoordinateFromPixel([e.clientX, e.clientY + oHzmHeight])//左下点
                var newpixel2 = map.getCoordinateFromPixel([e.clientX + oHzmWidth, e.clientY + oHzmHeight])//右下点
    
                var pdtPixel = map.getCoordinateFromPixel([e.clientX + (oHzmWidth / 2), e.clientY]) //上判断点
                var pdlPixel = map.getCoordinateFromPixel([e.clientX, e.clientY + (oHzmHeight / 2)]) //左判断点
                var pdbPixel = map.getCoordinateFromPixel([e.clientX + (oHzmWidth / 2), e.clientY + oHzmHeight]) //下判断点
                var pdrPixel = map.getCoordinateFromPixel([e.clientX + oHzmWidth, e.clientY + (oHzmHeight / 2)]) //右判断点
    
    
                if (newmapcor[0] < pdtPixel[0] && newmapcor[1] > pdlPixel[1]) {
                  hzmNewLine.getGeometry().setCoordinates([newmapcor, [(overlay.getPosition())[0], newmapcor[1]], [(overlay.getPosition())[0], (overlay.getPosition())[1]]])
                } else if (newmapcor[0] < pdbPixel[0] && newmapcor[1] < pdlPixel[1]) {
                  hzmNewLine.getGeometry().setCoordinates([newmapcor, [newpixel1[0], newmapcor[1]], [newpixel1[0], newpixel1[1]]])
                } else if (newmapcor[0] > pdbPixel[0] && newmapcor[1] < pdrPixel[1]) {
                  hzmNewLine.getGeometry().setCoordinates([newmapcor, [newpixel2[0], newmapcor[1]], [newpixel2[0], newpixel2[1]]])
                } else {
                  hzmNewLine.getGeometry().setCoordinates([newmapcor, [newpixel[0], newmapcor[1]], [newpixel[0], newpixel[1]]])
                }
              }
            })
            $("#map").on("mouseup", function () {
              isdown = false
            })
    
            //overlay关闭按钮
            target.children("#hzm_closebtn").click(function (event) {
              map.removeOverlay(map.getOverlayById(hzmConId))
    
              var hzmAllFeatures = hzmLayer.getSource().getFeatures()
              for (var i = 0; i < hzmAllFeatures.length; i++) {
                if (hzmAllFeatures[i].getProperties().id === hzmFeature) {
                  hzmLayer.getSource().removeFeature(hzmAllFeatures[i])
                }
              }
            })    
      },
      clearHzmCon: function (map) {
        var alloverlay = map.getOverlays().a  //清楚所有overlay
        if (alloverlay.length > 0) {
          for (var i = alloverlay.length - 1; i > 0; i--) {
            if (alloverlay[i].id && (alloverlay[i].id).indexOf('hzm') != '-1') {
              map.removeOverlay(alloverlay[i])
            }
          }
        }
  
        var hzmAllFeatures = hzmLayer.getSource().getFeatures()  //清楚所有线
        //console.log(hzmAllFeatures[0].getProperties())
        for (var i = 0; i < hzmAllFeatures.length; i++) {
          if (hzmAllFeatures[i].getProperties().id.indexOf('hzmFe') != '-1') {
            hzmLayer.getSource().removeFeature(hzmAllFeatures[i])
  
            console.log(hzmAllFeatures)
            if (hzmAllFeatures.length === 0) {
              map.removerLayer(hzmLayer)
            }
          }
        }
  
      },
      show: function (b) {
        b ? (this.target.css('display', 'block')) : (this.target.css('display', 'none'))
      }
    }
  
    window.jsllbs = new jsllbs();
  });
  
  
  