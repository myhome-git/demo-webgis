var vectorLayer;
var googleLayer;
var zhts;
var tracker;
var manager;
//航迹设置参数对象
var hjconfigObj = {
    df: {},
    wf: {}
};
$(document).ready(function () {
    //关闭按钮事件
    $("#closeBtn").click(function () {
        $("#hjconfigDiv").hide();
    });
    //航迹设置按钮点击事件
    $("#hjconfigBtn").click(function () {
        $("#hjconfigDiv").show();
    });
    //应用按钮点击事件(我方目标)
    $("#wf_hjuseBtn").click(function () {
        //获取选中的航迹类型
        var hjtype = $("input[name='wf_hjtype']:checked").val();

        //获取点数
        var pointCount = $("#point_wf_countInpt").val();
        //获取选中的航迹大小
        var hjsize = $("#sl_wf_hjsize option:selected").val();

        //获取选中的航迹颜色
        var hjcolor = $("#sl_wf_hjcolor option:selected").val();

        //拼接对象
        hjconfigObj.wf.pointCount = pointCount;
        hjconfigObj.wf.hjtype = hjtype;
        hjconfigObj.wf.hjsize = hjsize;
        hjconfigObj.wf.hjcolor = hjcolor;

        //判断当前航迹对象是什么类型，然后从新设置航迹样式
        var f = manager.hjLayer.getSource().getFeatures(); //获取航迹
        if (f.length > 0) {
            for (var i = 0; i < f.length; i++) {
                var feature = f[i];
                var geom = feature.getGeometry();
                var dwsx = feature.getProperties().dwsx;
                if (dwsx === "我" || dwsx === "友") {
                    var ph = feature.getProperties().ph;
                    var m;
                    if (geom instanceof ol.geom.LineString) {
                        //由对应航迹当中的ID属性来获取对应的目标对象
                        //获取每个我方目标对象，然后解除绑定
                        tracker = manager.mbLayer.getSource().getFeatureById(ph);

                        //解绑对象，然后重新绑定对象
                        m = tracker.unBindLineString();

                        var line = new ol.geom.LineString(geom.getCoordinates(), "XYZ");
                        var newFeature = new ol.Feature({
                            geometry: line,
                            name: "newLineString"
                        });
                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.wf.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            newFeature.getGeometry().setCoordinates(arr, "XYZ");
                        }
                        newFeature.setProperties({
                            "ph": ph,
                            "hjtype": hjconfigObj.wf.hjtype,
                            "point_count": Number(hjconfigObj.wf.pointCount),
                            "color": hjconfigObj.wf.hjcolor,
                            "size": hjconfigObj.wf.hjsize,
                            "dwsx": dwsx
                        });
                        newFeature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.wf.hjcolor,
                                    width: Number(hjconfigObj.wf.hjsize)
                                })
                            }));

                        newFeature.setId(tracker.getId());
                        tracker.bindLineString(newFeature);
                        tracker.linestring = null;
                        manager.hjLayer.getSource().removeFeature(m);
                        manager.hjLayer.getSource().addFeature(newFeature);

                    } else if (geom instanceof ol.geom.MultiPoint) {
                        //由对应航迹当中的ID属性来获取对应的目标对象
                        //获取每个我方目标对象，然后解除绑定
                        tracker = manager.mbLayer.getSource().getFeatureById(ph);
                        //解除绑定对象，然后重新绑定对象
                        m = tracker.unBindMultiPoint();

                        var multi = new ol.geom.MultiPoint(geom.getCoordinates(), "XYZ");
                        var newFeature = new ol.Feature({
                            geometry: multi,
                            name: "newMultPointFeature"
                        });
                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            newFeature.getGeometry().setCoordinates(arr, "XYZ");
                        }
                        newFeature.setProperties({
                            "ph": ph,
                            "hjtype": hjconfigObj.wf.hjtype,
                            "point_count": Number(hjconfigObj.wf.pointCount),
                            "color": hjconfigObj.wf.hjcolor,
                            "size": hjconfigObj.wf.hjsize,
                            "dwsx": dwsx
                        });
                        newFeature.setStyle(new ol.style.Style({ // multipoint
                            image: new ol.style.Circle({
                                radius: hjconfigObj.wf.hjsize,
                                fill: new ol.style.Fill({
                                    color: hjconfigObj.wf.hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.wf.hjcolor,
                                    width: 1
                                })
                            })
                        }));
                        newFeature.setId(tracker.getId());
                        tracker.bindMultiPoint(newFeature);
                        manager.hjLayer.getSource().removeFeature(m);
                        manager.hjLayer.getSource().addFeature(newFeature);

                    } else {
                        //解除混合样式类别绑定
                    }
                }
            }
        }

    });
    //应用按钮点击事件(敌方目标)
    $("#df_hjuseBtn").click(function () {
        //获取选中的航迹类型
        var hjtype = $("input[name='df_hjtype']:checked").val();

        //获取点数
        var pointCount = $("#point_df_countInpt").val();
        //获取选中的航迹大小
        var hjsize = $("#sl_df_hjsize option:selected").val();

        //获取选中的航迹颜色
        var hjcolor = $("#sl_df_hjcolor option:selected").val();

        //拼接对象
        hjconfigObj.df.pointCount = pointCount;
        hjconfigObj.df.hjtype = hjtype;
        hjconfigObj.df.hjsize = hjsize;
        hjconfigObj.df.hjcolor = hjcolor;


        //判断当前航迹对象是什么类型，然后从新设置航迹样式
        var f = manager.hjLayer.getSource().getFeatures();
        if (f.length > 0) {
            for (var i = 0; i < f.length; i++) {
                var feature = f[i];
                var geom = feature.getGeometry();
                var dwsx = feature.getProperties().dwsx;
                if (dwsx === "敌" || dwsx === "中立" || dwsx === "不明") {
                    var m;
                    var ph = feature.getProperties().ph;
                    if (geom instanceof ol.geom.LineString) {
                        //由对应航迹当中的ID属性来获取对应的目标对象
                        //获取每个我方目标对象，然后解除绑定
                        tracker = manager.mbLayer.getSource().getFeatureById(ph);
                        //解绑对象，然后重新绑定对象
                        m = tracker.unBindLineString();

                        var line = new ol.geom.LineString(geom.getCoordinates(), "XYZ");
                        var newFeature = new ol.Feature({
                            geometry: line,
                        });

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.df.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            newFeature.getGeometry().setCoordinates(arr, "XYZ");
                        }
                        newFeature.setProperties({
                            "ph": ph,
                            "hjtype": hjconfigObj.hjtype,
                            "point_count": Number(hjconfigObj.df.pointCount),
                            "color": hjconfigObj.df.hjcolor,
                            "size": hjconfigObj.df.hjsize,
                            "dwsx": dwsx
                        });
                        newFeature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.df.hjcolor,
                                    width: Number(hjconfigObj.df.hjsize)
                                })
                            }));

                        newFeature.set("status", "online");
                        newFeature.setId(tracker.getId());
                        tracker.bindLineString(newFeature);
                        manager.hjLayer.getSource().removeFeature(m);
                        manager.hjLayer.getSource().addFeature(newFeature);

                    } else if (geom instanceof ol.geom.MultiPoint) {
                        //由对应航迹当中的ID属性来获取对应的目标对象
                        //获取每个我方目标对象，然后解除绑定
                        tracker = manager.mbLayer.getSource().getFeatureById(ph);
                        //解除绑定对象，然后重新绑定对象
                        m = tracker.unBindMultiPoint();

                        var multi = new ol.geom.MultiPoint(geom.getCoordinates(), "XYZ");
                        var newFeature = new ol.Feature({
                            geometry: multi,
                        });

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.df.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            newFeature.getGeometry().setCoordinates(arr, "XYZ");
                        }
                        newFeature.setProperties({
                            "ph": ph,
                            "hjtype": hjconfigObj.df.hjtype,
                            "point_count": Number(hjconfigObj.df.pointCount),
                            "color": hjconfigObj.df.hjcolor,
                            "size": hjconfigObj.df.hjsize,
                            "dwsx": dwsx
                        });
                        newFeature.setStyle(new ol.style.Style({ // multipoint
                            image: new ol.style.Circle({
                                radius: hjconfigObj.df.hjsize,
                                fill: new ol.style.Fill({
                                    color: hjconfigObj.df.hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.df.hjcolor,
                                    width: 1
                                })
                            })
                        }));
                        newFeature.set("status", "online");
                        newFeature.setId(tracker.getId());
                        tracker.bindMultiPoint(newFeature);
                        manager.hjLayer.getSource().removeFeature(m);
                        manager.hjLayer.getSource().addFeature(newFeature);

                    } else {
                        //解除混合样式类别绑定
                    }
                }
            }
        }

    });

});

//是否启用避让
function enableDe() {
    vectorLayer.setDeclutter(true);
}
//单选框点击事件(我方)
function wfcheckRadio(obj) {
    var val = obj.value;
    var point_count = "";
    var inpt = $("#point_wf_countInpt");
    switch (val) {
        case '短航迹':
            point_count = 100;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        case '中航迹':
            point_count = 500;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        case '无航迹':
            point_count = 1;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        default:
            point_count = "显示全部";
            inpt.val(point_count);
            inpt.attr("disabled", true);
            break;
    }

    //拼接对象
    hjconfigObj.wf.pointCount = point_count;
    hjconfigObj.wf.hjtype = val;
    hjconfigObj.wf.hjsize = hjconfigObj.wf.hjsize == undefined ? 1 : hjconfigObj.wf.hjsize;
    hjconfigObj.wf.hjcolor = hjconfigObj.wf.hjcolor == undefined ? "red" : hjconfigObj.wf.hjcolor;


    var arr = manager.getHJLayerArr();
    for (var j = 0; j < arr.length; j++) {

        //判断是否是矢量图层
        if (!(arr[j] instanceof ol.layer.Vector)) {
            continue;
        }
        //获取我方所有航迹
        //获取对应数据源
        var s = arr[j].getSource();
        //获取数据源包含的所有要素
        var f = s.getFeatures();
        if (f.length > 0) {
            for (var i = 0; i < f.length; i++) {
                var feature = f[i];
                var dwsx = feature.getProperties().dwsx;
                var pro = feature.getProperties();
                var fid = feature.getId();
                var geom = feature.getGeometry();
                if (dwsx === "我" || dwsx === "友") {
                    var oldFeature;
                    if (geom instanceof ol.geom.LineString) {

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.wf.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            geom.setCoordinates(arr, "XYZ");
                        }

                        feature.setProperties({
                            "ph": pro.ph,
                            "hjtype": hjconfigObj.wf.hjtype,
                            "point_count": Number(hjconfigObj.wf.pointCount),
                            "color": hjconfigObj.wf.hjcolor,
                            "size": hjconfigObj.wf.hjsize,
                            "dwsx": pro.dwsx
                        });
                        feature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.wf.hjcolor,
                                    width: Number(hjconfigObj.wf.hjsize)
                                })
                            }));
                    } else if (geom instanceof ol.geom.MultiPoint) {

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.wf.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            geom.setCoordinates(arr, "XYZ");
                        }
                        feature.setProperties({
                            "ph": pro.ph,
                            "hjtype": hjconfigObj.hjtype,
                            "point_count": Number(hjconfigObj.wf.pointCount),
                            "color": hjconfigObj.wf.hjcolor,
                            "size": hjconfigObj.wf.hjsize,
                            "dwsx": pro.dwsx
                        });
                        feature.setStyle(new ol.style.Style({ // multipoint
                            image: new ol.style.Circle({
                                radius: hjconfigObj.hjsize,
                                fill: new ol.style.Fill({
                                    color: hjconfigObj.wf.hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.wf.hjcolor,
                                    width: 1
                                })
                            })
                        }));

                    }
                }
            }
        }
    }

}
//单选框点击事件(敌方)
function dfcheckRadio(obj) {
    var val = obj.value;
    var point_count = "";
    var inpt = $("#point_df_countInpt");
    switch (val) {
        case '短航迹':
            point_count = 100;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        case '中航迹':
            point_count = 500;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        case '无航迹':
            point_count = 1;
            inpt.val(point_count);
            inpt.removeProp("disabled");
            inpt.removeAttr("disabled");
            break;
        default:
            point_count = "显示全部";
            inpt.val(point_count);
            inpt.attr("disabled", true);
            break;
    }

    //拼接对象
    hjconfigObj.df.pointCount = point_count;
    hjconfigObj.df.hjtype = val;
    hjconfigObj.df.hjsize = hjconfigObj.df.hjsize == undefined ? 1 : hjconfigObj.df.hjsize;
    hjconfigObj.df.hjcolor = hjconfigObj.df.hjcolor == undefined ? "blue" : hjconfigObj.df.hjcolor;

    var arr = manager.getHJLayerArr();
    for (var j = 0; j < arr.length; j++) {
        //判断是否是矢量图层
        if (!(arr[j] instanceof ol.layer.Vector)) {
            continue;
        }
        //获取我方所有航迹
        //获取对应数据源
        var s = arr[j].getSource();
        //获取数据源包含的所有要素
        var f = s.getFeatures();
        if (f.length > 0) {
            for (var i = 0; i < f.length; i++) {
                var feature = f[i];
                var dwsx = feature.getProperties().dwsx;
                var pro = feature.getProperties();
                var fid = feature.getId();
                var geom = feature.getGeometry();
                if (dwsx === "敌" || dwsx === "中立" || dwsx === "不明") {

                    var oldFeature;
                    if (geom instanceof ol.geom.LineString) {

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.df.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            geom.setCoordinates(arr, "XYZ");
                        }
                        feature.setProperties({
                            "ph": pro.ph,
                            "hjtype": hjconfigObj.hjtype,
                            "point_count": Number(hjconfigObj.df.pointCount),
                            "color": hjconfigObj.df.hjcolor,
                            "size": hjconfigObj.df.hjsize,
                            "dwsx": pro.dwsx
                        });
                        feature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.df.hjcolor,
                                    width: Number(hjconfigObj.df.hjsize)
                                })
                            }));

                    } else if (geom instanceof ol.geom.MultiPoint) {

                        var count = geom.getCoordinates().length;
                        var num = Number(hjconfigObj.df.pointCount);
                        if (count > num) {
                            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
                            var arr = geom.getCoordinates().splice((count - num), num);
                            geom.setCoordinates(arr, "XYZ");
                        }
                        feature.setProperties({
                            "ph": pro.ph,
                            "hjtype": hjconfigObj.df.hjtype,
                            "point_count": Number(hjconfigObj.df.pointCount),
                            "color": hjconfigObj.df.hjcolor,
                            "size": hjconfigObj.df.hjsize,
                            "dwsx": pro.dwsx
                        });
                        feature.setStyle(new ol.style.Style({ // multipoint
                            image: new ol.style.Circle({
                                radius: hjconfigObj.df.hjsize,
                                fill: new ol.style.Fill({
                                    color: hjconfigObj.df.hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjconfigObj.df.hjcolor,
                                    width: 1
                                })
                            })
                        }));
                    }
                }
            }
        }
    }
}

//点类别单选框点击事件(我方)
function wflbcheckRadio(obj) {
    var arr = manager.getHJLayerArr();
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
                var tracker = manager.mbLayer.getSource().getFeatureById(fid);
                //如果tracker为空，则跳过
                if (tracker === null) {
                    continue;
                }
                var geom = feature.getGeometry();
                if (dwsx === "我" || dwsx === "友") {
                    //var ph = feature.getProperties().ph;
                    feature.set("status", "offline");
                    var oldFeature;
                    if (geom instanceof ol.geom.LineString) {
                        //首先解除绑定(解除线性绑定)
                        oldFeature = tracker.unBindLineString();
                    } else if (geom instanceof ol.geom.MultiPoint) {
                        //解除多点类别绑定
                        oldFeature = tracker.unBindMultiPoint();
                    } else {
                        //解除混合样式类别绑定
                    }
                    var val = obj.value;
                    switch (val) {
                        case '线类别':
                            //轨迹样式切换至线类别
                            var line = new ol.geom.LineString([], "XYZ");
                            line.setCoordinates(geom.getCoordinates(), "XYZ");
                            var newFeature = new ol.Feature({
                                geometry: line,
                            });
                            var pro = feature.getProperties();

                            //拼接对象
                            hjconfigObj.wf.pointCount = Number(pro.point_count);
                            hjconfigObj.wf.hjtype = pro.hjtype;
                            hjconfigObj.wf.hjsize = Number(pro.size);
                            hjconfigObj.wf.hjcolor = pro.color;
                            newFeature.setProperties({
                                "ph": pro.ph,
                                "hjtype": pro.hjtype,
                                "point_count": Number(pro.point_count),
                                "color": pro.color,
                                "dwsx": pro.dwsx,
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

                            newFeature.set("status", "online");
                            newFeature.setId(fid);
                            s.removeFeature(feature);
                            tracker.bindLineString(newFeature);
                            tracker.multipoint = null;
                            tracker.set("hjtype", "linestring");
                            s.addFeature(newFeature);
                            socket.hjline.wf.show = true;
                            var show = tracker.get("show");
                            if (show === false) {
                                var hjgeom = newFeature.getGeometry();
                                newFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                            }

                            break;
                        case '点类别':
                            //轨迹样式切换至点类别
                            //创建多点
                            var multi = new ol.geom.MultiPoint([], "XYZ");
                            multi.setCoordinates(geom.getCoordinates(), "XYZ");
                            var newFeature = new ol.Feature({
                                geometry: multi,
                            });
                            var pro = feature.getProperties();
                            //拼接对象
                            hjconfigObj.wf.pointCount = Number(pro.point_count);
                            hjconfigObj.wf.hjtype = pro.hjtype;
                            hjconfigObj.wf.hjsize = Number(pro.size);
                            hjconfigObj.wf.hjcolor = pro.color;
                            newFeature.setProperties({
                                "ph": pro.ph,
                                "hjtype": pro.hjtype,
                                "point_count": Number(pro.point_count),
                                "color": pro.color,
                                "dwsx": pro.dwsx,
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
                                }),
                                stroke: new ol.style.Stroke({
                                    color: pro.color,
                                    width: 1
                                })
                            }));

                            newFeature.set("status", "online");
                            newFeature.setId(fid);
                            //根据属性设置对应样式
                            s.removeFeature(feature);
                            tracker.bindMultiPoint(newFeature);
                            tracker.linestring = null;
                            tracker.set("hjtype", "multipoint");
                            s.addFeature(newFeature);
                            socket.hjline.wf.show = false;
                            var show = tracker.get("show");
                            if (show === false) {
                                var hjgeom = newFeature.getGeometry();
                                newFeature.getStyle().getImage().setOpacity(0);
                            }
                            break;
                        default:
                            //轨迹样式切换至点线混合类别
                            break;
                    }
                }
            }
        }
    }

}
//点类别单选框点击事件(敌方)
function dflbcheckRadio(obj) {
    var arr = manager.getHJLayerArr();
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
                var tracker = manager.mbLayer.getSource().getFeatureById(fid);
                //如果tracker为空，则跳过
                if (tracker === null) {
                    continue;
                }
                var geom = feature.getGeometry();
                if (dwsx === "敌" || dwsx === "中立" || dwsx === "不明") {
                    //var ph = feature.getProperties().ph;
                    feature.set("status", "offline");
                    var val = obj.value;
                    var oldFeature;
                    var isLine = true;

                    switch (val) {
                        case '线类别':
                            if (geom instanceof ol.geom.LineString) {
                                //如果原始的数据也是线类型，就放弃。
                                isLine = true;
                                continue;
                            } else if (geom instanceof ol.geom.MultiPoint) {
                                //如果原始数据与val不匹配，则解除多点类别绑定
                                oldFeature = tracker.unBindMultiPoint();
                                isLine = false;

                            } else {
                                //解除混合样式类别绑定
                            }
                            break;

                        case '点类别':
                            if (geom instanceof ol.geom.LineString) {
                                //如果原始数据与val不匹配，则解除线类别绑定
                                oldFeature = tracker.unBindLineString();
                                isLine = true;

                            } else if (geom instanceof ol.geom.MultiPoint) {
                                //如果原始的数据也是multipoint类型，就放弃。
                                isLine = false;
                                continue;
                            } else {
                                //解除混合样式类别绑定
                            }
                            break;

                        default:
                            break;

                    }

                    switch (val) {
                        case '线类别':
                            //轨迹样式切换至线类别
                            var line = new ol.geom.LineString([], "XYZ");
                            line.setCoordinates(geom.getCoordinates(), "XYZ");
                            var newFeature = new ol.Feature({
                                geometry: line,
                            });
                            var pro = feature.getProperties();
                            //拼接对象
                            hjconfigObj.df.pointCount = Number(pro.point_count);
                            hjconfigObj.df.hjtype = pro.hjtype;
                            hjconfigObj.df.hjsize = Number(pro.size);
                            hjconfigObj.df.hjcolor = pro.color;
                            newFeature.setProperties({
                                "ph": pro.ph,
                                "hjtype": pro.hjtype,
                                "point_count": Number(pro.point_count),
                                "color": pro.color,
                                "dwsx": pro.dwsx,
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

                            newFeature.set("status", "online");
                            newFeature.setId(fid);
                            s.removeFeature(feature);
                            tracker.multipoint = null;
                            tracker.bindLineString(newFeature);
                            tracker.set("hjtype", "linestring");
                            s.addFeature(newFeature);
                            socket.hjline.df.show = true;

                            var show = tracker.get("show");
                            if (show === false) {
                                var hjgeom = newFeature.getGeometry();
                                newFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                            }

                            break;
                        case '点类别':
                            //轨迹样式切换至点类别
                            //创建多点
                            var multi = new ol.geom.MultiPoint(geom.getCoordinates(), "XYZ");
                            multi.setCoordinates(geom.getCoordinates(), "XYZ");
                            var newFeature = new ol.Feature({
                                geometry: multi,
                            });
                            var pro = feature.getProperties();
                            //拼接对象
                            hjconfigObj.df.pointCount = Number(pro.point_count);
                            hjconfigObj.df.hjtype = pro.hjtype;
                            hjconfigObj.df.hjsize = Number(pro.size);
                            hjconfigObj.df.hjcolor = pro.color;
                            newFeature.setProperties({
                                "ph": pro.ph,
                                "hjtype": pro.hjtype,
                                "point_count": Number(pro.point_count),
                                "color": pro.color,
                                "dwsx": pro.dwsx,
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
                                    }),

                                }),
                                stroke: new ol.style.Stroke({
                                    color: pro.color,
                                    width: 1
                                })
                            }));
                            newFeature.set("status", "online");
                            newFeature.setId(fid);
                            //根据属性设置对应样式
                            s.removeFeature(feature);
                            tracker.linestring = null;
                            tracker.bindMultiPoint(newFeature);
                            tracker.set("hjtype", "multipoint");
                            s.addFeature(newFeature);
                            socket.hjline.df.show = false;
                            var show = tracker.get("show");
                            if (show === false) {
                                var hjgeom = newFeature.getGeometry();
                                newFeature.getStyle().getImage().setOpacity(0);
                            }
                            break;
                        default:
                            //轨迹样式切换至点线混合类别
                            break;
                    }
                }
            }
        }
    }

}

//我方字号大小设置单选框单击事件
function wfzhcheckRadio(obj) {
    var val = obj.value;
    var features = manager.mbLayer.getSource().getFeatures();
    if (features.length > 0) {
        for (var i = 0; i < features.length; i++) {
            var f = features[i];
            var prop = f.getProperties();
            if (prop.dwsx === "我" || prop.dwsx === "友") {
                switch (val) {
                    case '默认':
                        f.setTagFontType("wf");
                        manager.setwfFontClass("wf");
                        break;
                    case '初号':
                        f.setTagFontType("wf large");
                        manager.setwfFontClass("wf large");
                        break;
                    case '大号':
                        f.setTagFontType("wf big");
                        manager.setwfFontClass("wf big");
                        break;
                    case '中号':
                        f.setTagFontType("wf mid");
                        manager.setwfFontClass("wf mid");
                        break;
                    default:
                        f.setTagFontType("wf lite");
                        manager.setwfFontClass("wf lite");
                        break;
                }
            }
        }
    } else {
        //我方没有目标时
        switch (val) {
            case '默认':

                manager.setwfFontClass("wf");
                break;
            case '初号':
                manager.setwfFontClass("wf large");
                break;
            case '大号':
                manager.setwfFontClass("wf big");
                break;
            case '中号':
                manager.setwfFontClass("wf mid");
                break;
            default:
                manager.setwfFontClass("wf lite");
                break;
        }
    }
}

//敌方字号大小设置单选框单击事件
function dfzhcheckRadio(obj) {
    var val = obj.value;
    var features = manager.mbLayer.getSource().getFeatures();
    if (features.length > 0) {
        for (var i = 0; i < features.length; i++) {
            var f = features[i];
            var prop = f.getProperties();
            if (prop.dwsx === "敌" || prop.dwsx === "中立" || prop.dwsx === "不明") {
                switch (val) {
                    case '默认':
                        f.setTagFontType("df");
                        manager.setdfFontClass("df");
                        break;
                    case '初号':
                        f.setTagFontType("df large");
                        manager.setdfFontClass("df large");
                        break;
                    case '大号':
                        f.setTagFontType("df big");
                        manager.setdfFontClass("df big");
                        break;
                    case '中号':
                        f.setTagFontType("df mid");
                        manager.setdfFontClass("df mid");
                        break;
                    default:
                        f.setTagFontType("df lite");
                        manager.setdfFontClass("df lite");
                        break;
                }
            }
        }
    } else {
        //敌方没有目标时
        switch (val) {
            case '默认':
                manager.setdfFontClass("df");
                break;
            case '初号':
                manager.setdfFontClass("df large");
                break;
            case '大号':
                manager.setdfFontClass("df big");
                break;
            case '中号':
                manager.setdfFontClass("df mid");
                break;
            default:
                manager.setdfFontClass("df lite");
                break;
        }
    }
}

//我方航迹颜色单选框单击事件
function wfhjcolorRadio(obj) {
    var hjcolor = obj.val();
    var arr = manager.getHJLayerArr();
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

                if (dwsx === "我" || dwsx === "友") {
                    //var ph = feature.getProperties().ph;

                    //拼接对象
                    hjconfigObj.wf.pointCount = Number(pro.point_count);
                    hjconfigObj.wf.hjtype = pro.hjtype;
                    hjconfigObj.wf.hjsize = Number(pro.size);
                    hjconfigObj.wf.hjcolor = hjcolor;
                    manager.setwfHJColor(hjconfigObj.wf.hjcolor);
                    feature.setProperties({
                        "ph": pro.ph,
                        "hjtype": pro.hjtype,
                        "point_count": Number(pro.point_count),
                        "color": hjcolor,
                        "dwsx": pro.dwsx,
                        "size": Number(pro.size)
                    });
                    if (geom instanceof ol.geom.LineString) {
                        //根据属性设置对应样式
                        feature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjcolor,
                                    width: pro.size
                                })
                            }));
                    } else if (geom instanceof ol.geom.MultiPoint) {
                        feature.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: pro.size,
                                fill: new ol.style.Fill({
                                    color: hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjcolor,
                                    width: Number(pro.size)
                                })
                            })
                        }));
                    }
                }
            }
        }
    }

}

//敌方航迹颜色单选框单击事件
function dfhjcolorRadio(obj) {
    var hjcolor = obj.val();
    var arr = manager.getHJLayerArr();
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
                var fid = feature.getId();
                var dwsx = feature.getProperties().dwsx;
                var geom = feature.getGeometry();
                var pro = feature.getProperties();

                if (dwsx === "敌" || dwsx === "中立" || dwsx === "不明") {
                    var ph = feature.getProperties().ph;
                    //拼接对象
                    hjconfigObj.df.pointCount = Number(pro.point_count);
                    hjconfigObj.df.hjtype = pro.hjtype;
                    hjconfigObj.df.hjsize = Number(pro.size);
                    hjconfigObj.df.hjcolor = hjcolor;
                    manager.setdfHJColor(hjconfigObj.df.hjcolor);
                    feature.setProperties({
                        "ph": pro.ph,
                        "hjtype": pro.hjtype,
                        "point_count": Number(pro.point_count),
                        "color": hjcolor,
                        "dwsx": pro.dwsx,
                        "size": Number(pro.size)
                    });
                    if (geom instanceof ol.geom.LineString) {
                        //根据属性设置对应样式
                        feature.setStyle( // linestring
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: hjcolor,
                                    width: pro.size
                                })
                            }));
                    } else if (geom instanceof ol.geom.MultiPoint) {
                        feature.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: pro.size,
                                fill: new ol.style.Fill({
                                    color: hjcolor
                                }),
                                stroke: new ol.style.Stroke({
                                    color: hjcolor,
                                    width: Number(pro.size)
                                })
                            })
                        }));
                    }
                }
            }
        }
    }

}

//我方航迹粗细设置
function changewfhjsize(value) {
    var arr = manager.getHJLayerArr();
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

                if (dwsx === "我" || dwsx === "友") {
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
//敌方航迹粗细设置
function changedfhjsize(value) {
    var arr = manager.getHJLayerArr();
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