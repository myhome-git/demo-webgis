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

    var attackRangeConfig = function () {

        this.opt = {
            name: "attackRangeConfig", //软件的名字
            text: "打击探测图层配置",
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
    //var base = ds_config.base;
    var map;
    var k_dj_vLayer;//对空打击图层
    var h_dj_vLayer;//对海打击图层
    var l_dj_vLayer;//对陆打击图层
    var sx_dj_vLayer;//对水下打击图层
    var k_tc_vLayer;//对空探测图层
    var h_tc_vLayer;//对海探测图层
    var l_tc_vLayer;//对陆探测图层
    var sx_tc_vLayer;//对探测打击图层

    var k_dj_features=[];
    var h_dj_features=[];
    var l_dj_features=[];
    var sx_dj_features=[];
    var k_tc_features=[];
    var h_tc_features=[];
    var l_tc_features=[];
    var sx_tc_features=[];
    attackRangeConfig.prototype = {
        setMap: function(BIGMap){
            map = BIGMap.map;
        },
        init: function (id, dlgDom, index) {//这是所有软件的入口，点击桌面上的图标，会执行这个函数
            //此图层为对空打击图层
            k_dj_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(k_dj_vLayer, 1);
            //此图层为对海打击图层
            h_dj_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(h_dj_vLayer, 1);

            //此图层为对陆打击图层
            l_dj_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(l_dj_vLayer, 1);
            //此图层为对水下打击图层
            sx_dj_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(sx_dj_vLayer, 1);

            //此图层为对空探测图层
            k_tc_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(k_tc_vLayer, 1);
            //此图层为对海探测图层
            h_tc_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(h_tc_vLayer, 1);

            //此图层为对陆探测图层
            l_tc_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(l_tc_vLayer, 1);
            //此图层为对水下探测图层
            sx_tc_vLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            map.addLayer(sx_tc_vLayer, 1);
        },
        getLayerByLx:function (lx){
            var currLayer;
            switch(lx){
                case "海探测":
                currLayer=h_tc_vLayer;
                break;
                case "海打击":
                currLayer=h_dj_vLayer;
                break;
                case "空探测":
                currLayer=k_tc_vLayer;
                break;
                case "空打击":
                currLayer=k_dj_vLayer;
                break;
                case "陆探测":
                currLayer=l_tc_vLayer;
                break;
                case "陆打击":
                currLayer=l_dj_vLayer;
                break;
                case "水下探测":
                currLayer=sx_tc_vLayer;
                break;
                case "水下打击":
                currLayer=sx_dj_vLayer;
                break;

            }
          return currLayer;      
        },
        getFeaturesByLx:function (lx){
            var _that=this;
            var currFeatures;
            switch(lx){
                case "海探测":
                currFeatures=h_tc_features;
                break;
                case "海打击":
                currFeatures=h_dj_features;
                break;
                case "空探测":
                currFeatures=k_tc_features;
                break;
                case "空打击":
                currFeatures=k_dj_features;
                break;
                case "陆探测":
                currFeatures=l_tc_features;
                break;
                case "陆打击":
                currFeatures=l_dj_features;
                break;
                case "水下探测":
                currFeatures=sx_tc_features;
                break;
                case "水下打击":
                currFeatures=sx_dj_features;
                break;

            }
          return currFeatures;      
        },
        clearALL: function(){
            k_dj_features = [];
            h_dj_features = [];
            l_dj_features = [];
            sx_dj_features = [];
            k_tc_features = [];
            h_tc_features = [];
            l_tc_features = [];
            sx_tc_features = [];
            AttackRange.clearRang(k_dj_vLayer);
            AttackRange.clearRang(k_tc_vLayer);
            AttackRange.clearRang(h_dj_vLayer);
            AttackRange.clearRang(h_tc_vLayer);
            AttackRange.clearRang(l_dj_vLayer);
            AttackRange.clearRang(l_tc_vLayer);
            AttackRange.clearRang(sx_dj_vLayer);
            AttackRange.clearRang(sx_tc_vLayer);
        },
        showCircle: function(isShow){
            k_dj_vLayer.setVisible(isShow);
            k_tc_vLayer.setVisible(isShow);
            h_dj_vLayer.setVisible(isShow);
            h_tc_vLayer.setVisible(isShow);
            l_dj_vLayer.setVisible(isShow);
            l_tc_vLayer.setVisible(isShow);
            sx_dj_vLayer.setVisible(isShow);
            sx_tc_vLayer.setVisible(isShow);
        }

    }

    window.AttackRangeConfig = new attackRangeConfig();
    //_win.AttackRangeConfig = a;
    //return a;
    // "attackRange": { "url": "/ds/softs/wzAttackRange/attackRange.js","descript":"打击范围","author":"wz"}
    //zzxnQuerySource: "http://[IP已脱敏]/",
});
