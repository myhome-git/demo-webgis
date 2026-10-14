var vectorLayer;
var googleLayer;
var zhts;
var tracker;
var manager;
var hjconfigObj = {}; //航迹设置参数对象
$(document).ready(function () {
    var map = new ol.Map({
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 1
        })
    });

    var labelStyle = new ol.style.Style({
        geometry: function (feature) {
            var geometry = feature.getGeometry();
            if (geometry.getType() == 'MultiPolygon') {
                // Only render label for the widest polygon of a multipolygon
                var polygons = geometry.getPolygons();
                var widest = 0;
                for (var i = 0, ii = polygons.length; i < ii; ++i) {
                    var polygon = polygons[i];
                    var width = ol.extent.getWidth(polygon.getExtent());
                    if (width > widest) {
                        widest = width;
                        geometry = polygon;
                    }
                }
            }
            return geometry;
        },
        text: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            overflow: true,
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3
            })
        })
    });
    var countryStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#319FD3',
            width: 1
        })
    });
    var style = [countryStyle, labelStyle];

    vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: 'data/countries.geojson',
            format: new ol.format.GeoJSON()
        }),
        style: function (feature) {
            labelStyle.getText().setText(feature.get('name'));
            return style;
        },
        declutter: false
    });

    //map.addLayer(vectorLayer);

    googleLayer = new ol.layer.Tile({
        title: 'Google地图',
        type: 'base',
        visible: true,
        source: new ol.source.XYZ({
            url: "http://10.17.112.35:9090/bigmap/tile/maptile/1818940751/{z}/{x}/{y}"
        })
    });
    map.addLayer(googleLayer);

    var points = [];
    var p1 = [113.829346, 10.83870111];
    var p2 = [115.537720, 9.752370];
    var p3 = [120.301758, 9.665738];
    map.getView().setCenter(ol.proj.fromLonLat(p1));
    map.getView().setZoom(8);

    manager = new ZhtsManager({
        map: map
    });

    tracker = new ol.Track();

    tracker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(p1)));
    tracker.setId("0001");

    var hl = 1852;
    var cir = new ol.geom.Circle(ol.proj.fromLonLat(p1), 20 * hl);
    var feature = new ol.Feature({
        geometry: cir,
        name: "sname"
    });
    feature.setId("ccccc")

    var cir2 = new ol.geom.Sector(ol.proj.fromLonLat(p1), 50000, -30, 30);
    var feature2 = new ol.Feature({
        geometry: cir2,
        name: "sname2"
    });
    feature2.setId("ccccc2")

    tracker.bindFeatures([feature, feature2]);

    var line = new ol.geom.LineString([]);
    var feature3 = new ol.Feature({
        geometry: line,
        name: "sname3"
    });
    feature3.setProperties({
        "hjtype": "短航迹",
        "point_count": 10,
        "size": 1,
        "color": "red",
        "dw": "敌"
    });
    feature3.setStyle( // linestring
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "red",
                width: 1
            })
        }));

    tracker.bindLineString(feature3);

    var multi = new ol.geom.MultiPoint([]);
    var feature4 = new ol.Feature({
        geometry: multi,
        name: "sname54"
    });

    feature4.setProperties({
        "hjtype": "短航迹",
        "point_count": 20,
        "color": "red",
        "dw": "敌"
    });

    //tracker.bindMultiPoint(feature4);

    manager.mbLayer.getSource().addFeature(tracker);
    manager.wsLayer.getSource().addFeature(feature);
    manager.wsLayer.getSource().addFeature(feature2);
    manager.hjLayer.getSource().addFeature(feature3);
    //manager.hjLayer.getSource().addFeature(feature4);

    var lon = 113.829346;
    for (var index = 0; index < 100; index++) {

        setTimeout(function () {
            lon = lon + 0.1;
            var lat = 10.83870111;
            var p = [lon, lat];
            tracker.move(p);
        }, index * 1000);


    }

    //关闭按钮事件
    $("#closeBtn").click(function () {
        $("#hjconfigDiv").hide();
    });
    //航迹设置按钮点击事件
    $("#hjconfigBtn").click(function () {
        $("#hjconfigDiv").show();
    });
    //应用按钮点击事件
    $("#hjuseBtn").click(function () {
        //获取选中的航迹类型
        var hjtype = $("input[name='hjtype']:checked").val();

        //获取点数
        var pointCount = $("#point_countInpt").val();
        //获取选中的航迹大小
        var hjsize = $("#sl_hjsize option:selected").val();

        //获取选中的航迹颜色
        var hjcolor = $("#sl_hjcolor option:selected").val();

        //拼接对象
        hjconfigObj.pointCount = pointCount;
        hjconfigObj.hjtype = hjtype;
        hjconfigObj.hjsize = hjsize;
        hjconfigObj.hjcolor = hjcolor;


        //判断当前航迹对象是什么类型，然后从新设置航迹样式
        var f = manager.hjLayer.getSource().getFeatures();
        var feature = f[0];
        var geom = feature.getGeometry();
        var m;
        if (geom instanceof ol.geom.LineString) {
            //解绑对象，然后重新绑定对象
            m = tracker.unBindLineString();
            manager.hjLayer.getSource().removeFeature(m);

            var line = new ol.geom.LineString([]);
            var newFeature = new ol.Feature({
                geometry: line,
                name: "newLineString"
            });
            newFeature.setProperties({
                "hjtype": hjconfigObj.hjtype,
                "point_count": Number(hjconfigObj.pointCount),
                "color": hjconfigObj.hjcolor,
                "size": hjconfigObj.hjsize,
                "dw": "敌"
            });
            newFeature.setStyle( // linestring
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: hjconfigObj.hjcolor,
                        width: Number(hjconfigObj.hjsize)
                    })
                }));
            tracker.bindLineString(newFeature);
            manager.hjLayer.getSource().addFeature(newFeature);

        } else if (geom instanceof ol.geom.MultiPoint) {
            //解除绑定对象，然后重新绑定对象
            m = tracker.unBindMultiPoint();
            manager.hjLayer.getSource().removeFeature(m);

            var multi = new ol.geom.MultiPoint([]);
            var newFeature = new ol.Feature({
                geometry: multi,
                name: "newMultPointFeature"
            });
            newFeature.setProperties({
                "hjtype": hjconfigObj.hjtype,
                "point_count": Number(hjconfigObj.pointCount),
                "color": hjconfigObj.hjcolor,
                "size": hjconfigObj.hjsize,
                "dw": "敌"
            });
            newFeature.setStyle(new ol.style.Style({ // multipoint
                image: new ol.style.Circle({
                    radius: hjconfigObj.hjsize,
                    fill: new ol.style.Fill({
                        color: hjconfigObj.hjcolor
                    }),
                    stroke: new ol.style.Stroke({
                        color: hjconfigObj.hjcolor,
                        width: 1
                    })
                })
            }));
            tracker.bindMultiPoint(newFeature);
            manager.hjLayer.getSource().addFeature(newFeature);

        } else {
            //解除混合样式类别绑定
        }
    });

});

//是否启用避让
function enableDe() {
    vectorLayer.setDeclutter(true);
}
//单选框点击事件
function checkRadio(obj) {
    var val = obj.value;
    var point_count = "";
    var inpt = $("#point_countInpt");
    switch (val) {
        case '短航迹':
            point_count = 10;
            inpt.val(point_count);
            break;
        case '中航迹':
            point_count = 20;
            inpt.val(point_count);
            break;
        default:
            point_count = "显示全部";
            inpt.val(point_count);
            inpt.attr("disabled", true);
            break;
    }
}

//点类别单选框点击事件
function lbcheckRadio(obj) {
    var f = manager.hjLayer.getSource().getFeatures();
    var feature = f[0];
    var geom = feature.getGeometry();
    var newGeom;
    if (geom instanceof ol.geom.LineString) {
        //首先解除绑定(解除线性绑定)
        newGeom = tracker.unBindLineString();
    } else if (geom instanceof ol.geom.MultiPoint) {
        //解除多点类别绑定
        newGeom = tracker.unBindMultiPoint();
    } else {
        //解除混合样式类别绑定
    }
    var val = obj.value;
    switch (val) {
        case '线类别':
            //轨迹样式切换至线类别
            var line = new ol.geom.LineString([]);
            line.setCoordinates(geom.getCoordinates());
            var newFeature = new ol.Feature({
                geometry: line,
                name: "newLineString"
            });
            var pro = feature.getProperties();
            newFeature.setProperties({
                "hjtype": pro.hjtype,
                "point_count": Number(pro.point_count),
                "color": pro.color,
                "dw": pro.dw,
                "size": Number(pro.size)
            });
            //根据属性设置对应样式
            newFeature.setStyle( // linestring
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: pro.color,
                        width: pro.size
                    })
                }));
            manager.hjLayer.getSource().removeFeature(newGeom);
            tracker.bindLineString(newFeature);
            manager.hjLayer.getSource().addFeature(newFeature);

            break;
        case '点类别':
            //轨迹样式切换至点类别
            //创建多点
            var multi = new ol.geom.MultiPoint([]);
            multi.setCoordinates(geom.getCoordinates());
            var newFeature = new ol.Feature({
                geometry: multi,
                name: "newMultPointFeature"
            });
            var pro = feature.getProperties();
            newFeature.setProperties({
                "hjtype": pro.hjtype,
                "point_count": Number(pro.point_count),
                "color": pro.color,
                "dw": pro.dw,
                "size": Number(pro.size)
            });
            newFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pro.size,
                    fill: new ol.style.Fill({
                        color: pro.color
                    }),
                    stroke: new ol.style.Stroke({
                        color: pro.color,
                        width: 1
                    })
                })
            }));
            //根据属性设置对应样式
            manager.hjLayer.getSource().removeFeature(newGeom);
            tracker.bindMultiPoint(newFeature);
            manager.hjLayer.getSource().addFeature(newFeature);
            break;
        default:
            //轨迹样式切换至点线混合类别
            break;
    }
}