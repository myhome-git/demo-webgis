/**
 * 
 * 综合态势管理
 * @param {object} options 
 */
var ZhtsManager = function (options) {

    var _map;
    var _wfFontClass = "wf"; //我方标牌字号样式
    var _dfFontClass = "df"; //敌方标牌字号样式
    var _wfhjsize = 1;  //我方航迹线粗细
    var _dfhjsize = 1;  //敌方航迹线粗细
    var _wfhjcolor = "red";
    var _dfhjcolor = "blue";
    var _timeInternalId; //定时器ID
    if (!options) {
        throw "必须设置参数，至少需要一个 options.map 对象";
        return;
    }
    if (options.map) {
        this.map = options.map;
        _map = this.map;
    } else {
        throw "必须设置 options.map 对象";
        return;
    }

    if (options.tagmanager) {
        this.tagmanager = options.tagmanager;
    }

    var _hjLayer = options.hjLayer || new ol.layer.Vector({
        title: '态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });
    ///////////////////////////////////////////////////////////////
    //根据不同数据源创建不同的航迹图层////////////////////////////////
    ///////////////////////////////////////////////////////////////
    var _rhjghjLayer = options.rhjghjLayer || new ol.layer.Vector({
        title: '融合结果态势航迹',
        renderMode: 'image',
        visible: true,
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _lhhqhjLayer = options.lhhqhjLayer || new ol.layer.Vector({
        title: '联合海情态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _lhkqhjLayer = options.lhkqhjLayer || new ol.layer.Vector({
        title: '联合空情态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _jztshjLayer = options.jztshjLayer || new ol.layer.Vector({
        title: '技侦态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _dztshjLayer = options.dztshjLayer || new ol.layer.Vector({
        title: '电侦态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _hztshjLayer = options.hztshjLayer || new ol.layer.Vector({
        title: '航侦态势航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });
    var _tskbLayer = options.tskbLayer || new ol.layer.Vector({
        title: '态势快报',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _nbzqhjLayer = options.nbqzhjLayer || new ol.layer.Vector({
        title: '联合空情南部战区航迹',
        renderMode: 'image',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    ///////////////////////////////////////////////////////////////
    //根据不同数据源创建不同的航迹图层////////////////////////////////
    ///////////////////////////////////////////////////////////////

    var _mbLayer = options.mbLayer || new ol.layer.Vector({
        title: '态势目标',
        declutter: false,
        zIndex: 1000,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _wsLayer = options.wsLayer || new ol.layer.Vector({
        title: '目标威胁',
        renderMode: 'vector',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    var _jjLayer = options.layer || new ol.layer.Vector({
        title: '警戒区域',
        declutter: false,
        zIndex: 10,
        source: new ol.source.Vector({
            wrapX: false
        })
    });

    _jjLayer.setMap(this.map);
    _hjLayer.setMap(this.map);

    ///////////////////////////////////////////////////////////////
    //将对应航迹图层添加至地图当中////////////////////////////////
    ///////////////////////////////////////////////////////////////
    _rhjghjLayer.setMap(this.map);
    _lhhqhjLayer.setMap(this.map);
    _lhkqhjLayer.setMap(this.map);
    _jztshjLayer.setMap(this.map);
    _dztshjLayer.setMap(this.map);
    _hztshjLayer.setMap(this.map);
    _nbzqhjLayer.setMap(this.map);
    _tskbLayer.setMap(this.map);
    ///////////////////////////////////////////////////////////////
    //将对应航迹图层添加至地图当中////////////////////////////////
    ///////////////////////////////////////////////////////////////

    _wsLayer.setMap(this.map);
    _mbLayer.setMap(this.map);

    this.hjLayer = _hjLayer;

    this.rhjghjLayer = _rhjghjLayer;
    this.lhhqhjLayer = _lhhqhjLayer;
    this.lhkqhjLayer = _lhkqhjLayer;
    this.jztshjLayer = _jztshjLayer;
    this.dztshjLayer = _dztshjLayer;
    this.hztshjLayer = _hztshjLayer;
    this.nbzqhjLayer = _nbzqhjLayer;
    this.tskbLayer = _tskbLayer;

    //多图层航迹对象数组
    var _hjLayerArr = [];
    _hjLayerArr.push(this.rhjghjLayer);
    _hjLayerArr.push(this.lhhqhjLayer);
    _hjLayerArr.push(this.lhkqhjLayer);
    _hjLayerArr.push(this.jztshjLayer);
    _hjLayerArr.push(this.dztshjLayer);
    _hjLayerArr.push(this.hztshjLayer);
    _hjLayerArr.push(this.nbqzhjLayer);
    _hjLayerArr.push(this.tskbLayer);
    this.hjLayerArr = _hjLayerArr;

    var _checkedQueueArr = [{
        "queuename": "SSTS_RHJG_4",
        "ckname": "融合结果"
    }];
    this.checkedQueueArr = _checkedQueueArr;

    this.mbLayer = _mbLayer;
    this.wsLayer = _wsLayer;
    this.jjLayer = _jjLayer;
    this.wfFontClass = _wfFontClass;
    this.dfFontClass = _dfFontClass;
    this.wfhjSize = _wfhjsize;
    this.dfhjSize = _dfhjsize;
    this.wfhjColor = _wfhjcolor;
    this.dfhjColor = _dfhjcolor;

    this.map.on("dblclick", function (evt) {

        var feature = _map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            var tag = feature.get("type");
            if (tag != 'track') {
                return null;
            }
            return feature;
        });

        if (feature) {
            var level = feature.getTagInfoLevel();
            if (level === 0) {
                level = level + 1;
            }
            feature.changeTagContent(level);
            feature.setTagDragable(true);
        }
    });


    var _self = this;
    //获取地图缩放级别,根据对应级别设置目标显示比例
    this.map.getView().on('change:resolution', function (e) {
        var zoomLevel = e.target.getZoom();
        var tracks = manager.mbLayer.getSource().getFeatures(); //获取所有实时态势目标
        var vectorfeatures = BIGMap.getVectorLayer().getSource().getFeatures(); //获取战场环境对象
        if (parseInt(zoomLevel) < 6) { //0.4
            //   for (var i = 0; i < tracks.length; i++) {
            //       var mb = tracks[i];
            //       mb.getStyle().getImage().setScale(_self.getMBScale());
            //   }
            for (var j = 0; j < vectorfeatures.length; j++) {
                var v = vectorfeatures[j];
                if (v.fData != undefined) {
                    v.getStyle().getImage().setScale(_self.getMBScale());
                }

            }
        }
        if (parseInt(zoomLevel) >= 6 && parseInt(zoomLevel) < 9) { //0.6
            //    for (var i = 0; i < tracks.length; i++) {
            //        var mb = tracks[i];
            //       mb.getStyle().getImage().setScale(_self.getMBScale());
            //    }
            for (var j = 0; j < vectorfeatures.length; j++) {
                var v = vectorfeatures[j];
                if (v.fData != undefined) {
                    v.getStyle().getImage().setScale(_self.getMBScale());
                }

            }
        }
        if (parseInt(zoomLevel) >= 9) { //0.8
            //    for (var i = 0; i < tracks.length; i++) {
            //        var mb = tracks[i];
            //        mb.getStyle().getImage().setScale(_self.getMBScale());
            //    }
            for (var j = 0; j < vectorfeatures.length; j++) {
                var v = vectorfeatures[j];
                if (v.fData != undefined) {
                    v.getStyle().getImage().setScale(_self.getMBScale());
                }

            }
        }
    });


    //设置每2分钟检查一次没有位置点更新的目标
    this.checkMBTimeOut(1 * 60 * 1000);
    //初始化右键菜单
    this.initContextmenu();
}

/**
 * 获取适合的目标图标缩放比例
 */
ZhtsManager.prototype.getMBScale = function () {
    var zoomLevel = this.map.getView().getZoom();
    var scale = 0.7;
    if (parseInt(zoomLevel) < 6) { //0.7
        scale = 0.7;
    }
    if (parseInt(zoomLevel) >= 6 && parseInt(zoomLevel) < 9) { //0.8
        scale = 0.9;
    }
    if (parseInt(zoomLevel) >= 9) { //0.8
        scale = 1;
    }
    return scale;
}

/**
 * 设置标牌管理器
 * @param {tagmanager} tagmanager 
 */
ZhtsManager.prototype.setTagmanager = function (tagmanager) {
    if (tagmanager) {
        this.tagmanager = tagmanager;
    }

}

/**
 * 获取标牌管理器
 */
ZhtsManager.prototype.getTagmanager = function () {
    return this.tagmanager;
}

ZhtsManager.prototype.getwfFontClass = function () {
    return this.wfFontClass;
}

ZhtsManager.prototype.setwfFontClass = function (wfFontClass) {
    this.wfFontClass = wfFontClass;
}

ZhtsManager.prototype.getdfFontClass = function () {
    return this.dfFontClass;
}

ZhtsManager.prototype.setdfFontClass = function (dfFontClass) {
    this.dfFontClass = dfFontClass;
}

ZhtsManager.prototype.getdfHJSize = function () {
    return this.dfhjSize;
}

ZhtsManager.prototype.setdfHJSize = function (dfhjSize) {
    this.dfhjSize = dfhjSize;
}

ZhtsManager.prototype.getwfHJSize = function () {
    return this.wfhjSize;
}

ZhtsManager.prototype.setwfHJSize = function (wfhjSize) {
    this.wfhjSize = wfhjSize;
}

ZhtsManager.prototype.getwfHJColor = function () {
    return this.wfhjColor;
}

ZhtsManager.prototype.setwfHJColor = function (wfhjColor) {
    this.wfhjColor = wfhjColor;
}

ZhtsManager.prototype.getdfHJColor = function () {
    return this.dfhjColor;
}

ZhtsManager.prototype.setdfHJColor = function (dfhjColor) {
    this.dfhjColor = dfhjColor;
}


/**
 * 初始化右键菜单
 */
ZhtsManager.prototype.initContextmenu = function () {
    var manager = this;
    var contextmenu_items = [{
        text: '目标信息',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                if (feature.get('type') == "track") {
                    zhtsjs.alter(feature);
                }
            }
        }
    },

    {
        text: '原报信息',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                var prop = feature.getProperties();
                var ysbw = JSON.parse(prop.ysbw);
                var drawDate = new Date(prop.drawtime);
                var timestr = {
                    y: x.getStringRight("0000" + drawDate.getFullYear(), 4) + "",
                    month: x.getStringRight("00" + (drawDate.getMonth() + 1), 2) + "",
                    td: x.getStringRight("00" + drawDate.getDate(), 2) + "",
                    h: x.getStringRight("00" + drawDate.getHours(), 2) + "",
                    m: x.getStringRight("00" + drawDate.getMinutes(), 2) + "",
                    s: x.getStringRight("00" + drawDate.getSeconds(), 2) + ""
                };
                //首先清空
                $("#mbysbwcontentDiv").empty();
                //然后赋值
                var html = "";
                //弹出原报信息框
                for (var key in ysbw) {
                    switch (key) {
                        case 'mb_XNo': //机/舷号
                            html += "<div class='box_info_content' style='color:white;'><font>机/舷号：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbBl': //目标类别
                            html += "<div class='box_info_content' style='color:white;'><font>目标类别：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbC': //目标航向
                            var heading = Number(ysbw[key]).toFixed(2) + "°";
                            html += "<div class='box_info_content' style='color:white;'><font>目标航向：</font><font>" + heading + "</font></div>";
                            break;
                        case 'mbCarryBomb': //可能挂弹
                            html += "<div class='box_info_content' style='color:white;'><font>可能挂弹：</font><font>" + ysbw[key] + "</font></div>"
                            break;
                        case 'mbGj': //目标国籍代码
                            html += "<div class='box_info_content' style='color:white;'><font>目标国籍代码：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbGj_str': //国家地区
                            html += "<div class='box_info_content' style='color:white;'><font>所属国家/地区：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbPos': //目标坐标和时间
                            html += "<div class='box_info_content' style='color:white;'><font>目标经度：</font><font>" + ysbw[key].rpLong +
                                "</font></div><div class='box_info_content' style='color:white;'><font>目标纬度：</font><font>" + ysbw[key].lat + "</font></div>" +
                                "<div class='box_info_content' style='color:white;'><font>发现时间：</font><font>" + ysbw[key].time + "</font></div>" +
                                "<div class='box_info_content' style='color:white;'><font>接收时间：</font><font>" + timestr.y + "-" + timestr.month + "-" + timestr.td + " " + timestr.h + ":" + timestr.m + ":" + timestr.s + "</font></div>";
                            break;
                        case 'mbH': //目标高度/深度
                            html += "<div class='box_info_content' style='color:white;'><font>目标高度/深度：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbJN': //目标架数/舰数
                            html += "<div class='box_info_content' style='color:white;'><font>目标架数/舰数：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbPh': //目标批号
                            html += "<div class='box_info_content' style='color:white;'><font>目标批号：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbSx': //目标属性
                            html += "<div class='box_info_content' style='color:white;'><font>目标属性：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbType': //目标分类
                            html += "<div class='box_info_content' style='color:white;'><font>目标分类：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mbType_str': //目标分类名称
                            html += "<div class='box_info_content' style='color:white;'><font>目标分类名称：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'kh'://军标库号
                            html += "<div class='box_info_content' style='color:white;'><font>军标库号：</font><font>" + prop.jbkh + "</font></div>";
                            break;
                        case 'dh'://军标代号
                            html += "<div class='box_info_content' style='color:white;'><font>军标代号：</font><font>" + prop.jbdh + "</font></div>";
                            break;
                        case 'mbV': //目标速度                                                 
                            if (prop.mblb == '水面目标') {
                                var sd = Number(ysbw[key]).toFixed(2) + " 节";
                            } else {
                                var sd = Number(ysbw[key]).toFixed(2)*3.6 + " 公里/小时";
                            }
                            html += "<div class='box_info_content' style='color:white;'><font>目标速度：</font><font>" + sd + "</font></div>";
                            break;
                        case 'mbXxyID': //目标来源代号
                            html += "<div class='box_info_content' style='color:white;'><font>目标来源代号：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mb_JM': //军民属性
                            html += "<div class='box_info_content' style='color:white;'><font>军民属性：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mb_Xh': //型号
                            html += "<div class='box_info_content' style='color:white;'><font>目标型号：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        case 'mb_MY': //密语
                            html += "<div class='box_info_content' style='color:white;'><font>报文类型：</font><font>" + ysbw[key] + "</font></div>";
                            break;
                        default:
                            break;
                    }
                }
                $("#mbysbwcontentDiv").append(html);
                //打开弹出框
                layer.open({
                    type: 1,
                    title: ysbw.mbPh + "-原报信息",
                    shadeClose: false,
                    shade: false,
                    btn: false,
                    scrollbar: true,
                    offset: "c",
                    content: $("#mbysbwDiv"),
                    area: ["314px", "466px"],
                    success: function (dom, index) {

                    },
                    cancel: function () {

                    }
                });
            }
        }
    },
    {
        text: '目标动向',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                var prop = feature.getProperties();
                var date = prop.time.substr(0, 11);
                var jxh = prop.jxh;
                $.ajax({
                    type: "POST",
                    url: "/dxqbsc/queryDXQB?jjh=" + jxh + "&rq=" + date,
                    async: true,
                    success: function (obj) {
                        if (!obj.msg) {
                            console.log(obj);
                            //首先清空
                            $("#mbysbwcontentDiv").empty();
                            //然后赋值
                            var html = "<pre style='font-size:14px;color:white;background-color:rgba(0,0,0,0.0);border:0'>" + obj.dxqbsc[0]["zwnr"] + "</pre>";
                            $("#mbysbwcontentDiv").append(html);
                            //打开弹出框
                            layer.open({
                                type: 1,
                                title: obj.dxqbsc[0]["qbbt"],
                                shadeClose: false,
                                shade: false,
                                btn: false,
                                scrollbar: true,
                                offset: "c",
                                content: $("#mbysbwDiv"),
                                area: ["600px", "480px"],
                                success: function (dom, index) {

                                },
                                cancel: function () {

                                }
                            });
                        } else {
                            layer.msg("暂无该目标动向信息!");
                        }
                    },
                    error: function () {
                        layer.alert('请求目标动向失败，请检查服务是否正常！');
                    }
                });

            }
        }
    },
    {
        text: '当日轨迹',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                ZHTSCONFIG.settrackObj(feature);
                TemplateAlertCircle.GetModeDangRiGuiJi();
            }
        }
    },
    {
        text: '字体大小',
        items: [{
            text: '小号',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    manager.setTrackerFontSize(feature, "小号");
                }
            }
        },
        {
            text: '正常',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    manager.setTrackerFontSize(feature, "默认");
                }
            }
        },
        {
            text: '大号',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    manager.setTrackerFontSize(feature, "大号");
                }
            }
        },
        {
            text: '初号',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    manager.setTrackerFontSize(feature, "初号");
                }
            }
        },
        ]
    },
    {
        text: '图标大小',
        items: [
            {
                text: '大图标',
                callback: function (obj, map) {
                    var coor = obj.coordinate;
                    var pixel = map.getPixelFromCoordinate(coor);
                    var has = map.hasFeatureAtPixel(pixel);
                    if (has) {
                        var feature = map.getFeaturesAtPixel(pixel)[0];
                        manager.setTrackerScale(feature, 1);
                    }
                }
            },
            {
                text: '中图标',
                callback: function (obj, map) {
                    var coor = obj.coordinate;
                    var pixel = map.getPixelFromCoordinate(coor);
                    var has = map.hasFeatureAtPixel(pixel);
                    if (has) {
                        var feature = map.getFeaturesAtPixel(pixel)[0];
                        manager.setTrackerScale(feature, 0.7);
                    }
                }
            },
            {
                text: '小图标',
                callback: function (obj, map) {
                    var coor = obj.coordinate;
                    var pixel = map.getPixelFromCoordinate(coor);
                    var has = map.hasFeatureAtPixel(pixel);
                    if (has) {
                        var feature = map.getFeaturesAtPixel(pixel)[0];
                        manager.setTrackerScale(feature, 0.5);
                    }
                }
            }
        ]
    },

    {
        text: '航迹类别',
        items: [{
            text: '点航迹',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹类别
                    var prop = feature.getProperties();
                    var queue = prop.queue;
                    var hjLayer = manager.getLayerByQueueName(queue);
                    var hjline = hjLayer.getSource().getFeatureById(fid);
                    var s = hjLayer.getSource();

                    var geom = hjline.getGeometry();
                    var oldFeature;
                    if (geom instanceof ol.geom.LineString) {
                        //首先解除绑定(解除线性绑定)
                        oldFeature = feature.unBindLineString();
                    } else if (geom instanceof ol.geom.MultiPoint) {
                        return;
                    }
                    //轨迹样式切换至点类别
                    //创建多点
                    var multi = new ol.geom.MultiPoint([], "XYZ");
                    multi.setCoordinates(geom.getCoordinates(), "XYZ");
                    var newFeature = new ol.Feature({
                        geometry: multi,
                    });
                    var pro = hjline.getProperties();
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
                        })
                    }));
                    newFeature.setId(fid);
                    //根据属性设置对应样式
                    s.removeFeature(hjline);
                    feature.bindMultiPoint(newFeature);
                    feature.linestring = null;
                    feature.set("hjtype", "multipoint");
                    s.addFeature(newFeature);
                }
            }
        },
        {
            text: '线航迹',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹类别
                    var prop = feature.getProperties();
                    var queue = prop.queue;
                    var hjLayer = manager.getLayerByQueueName(queue);
                    var hjline = hjLayer.getSource().getFeatureById(fid);
                    var s = hjLayer.getSource();
                    var geom = hjline.getGeometry();
                    var oldFeature;
                    if (geom instanceof ol.geom.LineString) {
                        //首先解除绑定(解除线性绑定)
                        return;
                    } else if (geom instanceof ol.geom.MultiPoint) {
                        //解除多点类别绑定
                        oldFeature = feature.unBindMultiPoint();
                    }
                    //轨迹样式切换至线类别
                    var line = new ol.geom.LineString([]);
                    line.setCoordinates(geom.getCoordinates(), "XYZ");
                    var newFeature = new ol.Feature({
                        geometry: line,
                    });
                    var pro = hjline.getProperties();
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
                    newFeature.setId(fid);
                    s.removeFeature(hjline);
                    feature.bindLineString(newFeature);
                    feature.multipoint = null;
                    feature.set("hjtype", "linestring");
                    s.addFeature(newFeature);
                }
            }
        }
        ]
    },
    {
        text: '航迹粗细',
        items: [{
            text: '1像素',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    var value = 1;
                    manager.setHJSize(fid, value, feature);
                }
            }
        },
        {
            text: '2像素',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    var value = 2;
                    manager.setHJSize(fid, value, feature);
                }
            }
        },
        {
            text: '3像素',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    var value = 3;
                    manager.setHJSize(fid, value, feature);
                }
            }
        },
        {
            text: '4像素',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    var value = 4;
                    manager.setHJSize(fid, value, feature);
                }
            }
        },
        {
            text: '5像素',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var fid = feature.getId();
                    var value = 5;
                    manager.setHJSize(fid, value, feature);
                }
            }
        }
        ]
    },
    {
        text: '航迹颜色',
        items: [{
            text: '黄色',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var hjcolor = "orange";
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹颜色
                    manager.setHJColor(fid, hjcolor, feature);
                }
            }
        },
        {
            text: '蓝色',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var hjcolor = "blue";
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹颜色
                    manager.setHJColor(fid, hjcolor, feature);
                }
            }
        },
        {
            text: '绿色',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var hjcolor = "green";
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹颜色
                    manager.setHJColor(fid, hjcolor, feature);
                }
            }
        },
        {
            text: '红色',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var hjcolor = "red";
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹颜色
                    manager.setHJColor(fid, hjcolor, feature);
                }
            }
        },
        {
            text: '紫色',
            callback: function (obj, map) {
                var coor = obj.coordinate;
                var pixel = map.getPixelFromCoordinate(coor);
                var has = map.hasFeatureAtPixel(pixel);
                if (has) {
                    var feature = map.getFeaturesAtPixel(pixel)[0];
                    var hjcolor = "purple";
                    var fid = feature.getId();
                    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹颜色
                    manager.setHJColor(fid, hjcolor, feature);
                }
            }
        }
        ]
    },
    {
        text: '作战能力',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            console.log(coor);
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);


            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                console.log(map.getFeaturesAtPixel(pixel)[0]);
                var values = feature.values_;
                console.log(values);

                if (values.mbnm) {
                    var nm = values.mbnm;
                    var name = values.jxh;
                    var JDUse = parseFloat(values.lon);
                    var WDUse = parseFloat(values.lat);
                    var point = [JDUse, WDUse];
                    var type = "ptmb";
                    // 传递 操作的 地图对象 map 
                    //AttackRange.setMap(map);
                    // 内码  名称  坐标  类型
                    zzfwnl.actionScope(nm,name,point,type);
                    AttackRange.trackMap[nm] = feature;
                }

            }
        }
    }

    ];

    var zttMenu = [{
        text: '显示标牌',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                var fid = feature.getId();

                var oldTag = feature.getLinkedTag();
                if (!oldTag) {
                    var data = {};
                    var lx = feature.get("mbtype");
                    if (lx === '海军基地') {
                        data = {
                            gj: {
                                gjh: "9999",
                                gj: "其他"
                            },
                            jz: "海军",
                            ms: ""
                        }
                    } else if (lx == "空军基地") {
                        data = {
                            gj: {
                                gjh: "9999",
                                gj: "其他"
                            },
                            jz: "空军",
                            ms: ""
                        }

                    } else if (lx == "陆军基地") {
                        data = {
                            gj: {
                                gjh: "9999",
                                gj: "其他"
                            },
                            jz: "陆军",
                            ms: ""
                        }
                    } else {
                        //军种名称
                        var jzmc = feature.get("jz");
                        if (jzmc === "海军") {
                            data = {
                                gj: {
                                    gjh: "9999",
                                    gj: "其他"
                                },
                                jz: "海军",
                                ms: ""
                            }
                        } else if (jzmc === "空军") {
                            data = {
                                gj: {
                                    gjh: "9999",
                                    gj: "其他"
                                },
                                jz: "空军",
                                ms: ""
                            }
                        } else if (jzmc === "陆军") {
                            data = {
                                gj: {
                                    gjh: "9999",
                                    gj: "其他"
                                },
                                jz: "陆军",
                                ms: ""
                            }
                        } else {
                            data = {
                                gj: {
                                    gjh: "9999",
                                    gj: "其他"
                                },
                                jz: "陆军",
                                ms: ""
                            }
                        }
                    }
                    var ele = adminByGlx.showBp(feature, data, map);

                    var positioning = 'top-left';
                    var coordinate = ol.proj.transform(coor, 'EPSG:3857', 'EPSG:4326');

                    if (coordinate[0] < 125 && coordinate[0] > 60) {
                        positioning = "bottom-right";
                    } else if (coordinate[0] > 220 && coordinate[0] < 255) {
                        positioning = "bottom-right";
                    }

                    //添加标牌
                    var bp = new ol.Overlay({
                        id: fid,
                        element: ele.div.get(0),
                        stopEvent: true,
                        positioning: positioning
                    });
                    bp.getElement().fid = fid;

                    //创建标牌
                    var tag = new LinkedTag({
                        map: manager.map,
                        ph: fid,
                        fid: fid,
                        offset: [0, -80],
                        overlay: bp,
                        lineOptions: {
                            color: "black",
                            width: 0.5
                        }
                    });

                    feature.set("tagEle", ele);
                    feature.bindLinkTag(tag);
                    var coor = tag.getLinkedLine().getGeometry().getCoordinates()[1];
                    // bp.setPosition(coor);
                    feature.getLinkedTag().getTagMarker().setPosition(coor);
                    manager.getTagmanager().addLinkedTag(tag);
                    var pos = feature.getGeometry().getCoordinates();
                    //更新一次坐标，手动让目标更新标牌相对位置
                    feature.setPosition(ol.proj.transform(pos, 'EPSG:3857', 'EPSG:4326'));

                }


            }

        }
    },
    {
        text: '删除标牌',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                var fid = feature.getId();
                var oldTag = feature.getLinkedTag();
                if (oldTag) {
                    manager.getTagmanager().removeLinkedTag(oldTag);
                    feature.linktag = null;
                }
            }

        }
    },
    {
        text: '删除目标',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                var fid = feature.getId();
                var oldTag = feature.getLinkedTag();
                if (oldTag) {
                    manager.getTagmanager().removeLinkedTag(oldTag);
                    feature.linktag = null;
                }
                BIGMap.getZttLayer().getSource().removeFeature(feature);
            }
        }
    }
    ];
    var dbfxRightMenu = [{
        text: '军事力量部署',
        callback: function (obj, map) {
            var coor = obj.coordinate;
            var pixel = map.getPixelFromCoordinate(coor);
            var has = map.hasFeatureAtPixel(pixel);
            if (has) {
                var feature = map.getFeaturesAtPixel(pixel)[0];
                jsllbs.feature = feature;

                jsllbs.btnjsllClick(feature);
            }
        }
    }];

    var contextmenu = new ContextMenu({
        width: 120,
        items: contextmenu_items
    });
    this.map.addControl(contextmenu);
    var _map = this.map;
    contextmenu.on('open', function (evt) {
        var feature = _map.forEachFeatureAtPixel(evt.pixel, function (ft, l) {
            return ft;
        });
        if (feature && feature.get('type') === 'track') {
            contextmenu.clear();
            contextmenu.extend(contextmenu_items);
        } else if (feature && (feature.get('type') === 'ztt' || feature.get("type") == 'DBFeature')) {
            if (ZHTSCONFIG.isShowMenu()) {
                contextmenu.clear();
                contextmenu.extend(zttMenu);
            } else {
                contextmenu.clear();
                //  contextmenu.extend(contextmenu_items);
                contextmenu.extend(contextmenu.getDefaultItems());
            }
        } else if (feature && (feature.get('type') === 'ssmb' || feature.get("type") == 'bdmb')){
            contextmenu.clear();
            contextmenu.extend(dbfxRightMenu);
        } else {
            contextmenu.clear();
            //  contextmenu.extend(contextmenu_items);
            contextmenu.extend(contextmenu.getDefaultItems());
        }
    });
}

ZhtsManager.prototype.getZttMenu = function () {

}

ZhtsManager.prototype.getMbmenu = function () {

}



/**
 * 设置目标字体大小
 */
ZhtsManager.prototype.setTrackerFontSize = function (feature, val) {
    var f = feature;
    var managger = this;
    var prop = f.getProperties();
    if (prop.dwsx === "我" || prop.dwsx === "友") {
        switch (val) {
            case '默认':
                f.setTagFontType("wf");
                break;
            case '初':
                f.setTagFontType("wf large");
                break;
            case '大':
                f.setTagFontType("wf big");
                break;
            case '中':
                f.setTagFontType("wf mid");
                break;
            default:
                f.setTagFontType("wf lite");
                break;
        }
    } else if (prop.dwsx === "敌" || prop.dwsx === "中立" || prop.dwsx === "不明") {
        switch (val) {
            case '默认':
                f.setTagFontType("df");
                break;
            case '初':
                f.setTagFontType("df large");
                break;
            case '大':
                f.setTagFontType("df big");
                break;
            case '中':
                f.setTagFontType("df mid");
                break;
            default:
                f.setTagFontType("df lite");
                break;
        }
    }
}


/**
 * 设置所有目标的图标大小比例
 * @param {*} scale 图标大小比例
 */
ZhtsManager.prototype.setAllTrackerScale = function (scale) {
    if (scale > 0) {
        var tracks = manager.mbLayer.getSource().getFeatures(); //获取所有实时态势目标
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            mb.getStyle().getImage().setScale(scale);
        }
    }
}

/**
 * 设置某个目标的缩放比例
 * @param {*} feature 目标
 * @param {*} scale 缩放比例
 */
ZhtsManager.prototype.setTrackerScale = function (feature, scale) {
    if (scale > 0) {
        feature.getStyle().getImage().setScale(scale);
    }
}


/**
 * 停止实时态势数据接收，清除所有实时态势数据
 */
ZhtsManager.prototype.stop = function () {
    //停止定时清除
    this.stopCheck();
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    for (var i = 0; i < tracks.length; i++) {
        var mb = tracks[i];
        var prop = mb.getProperties();
        var hjLayer = _manager.getLayerByQueueName(prop.queue);
        var hjtype = prop.hjtype;
        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();
        //清除线航迹
        if (hjline != null && hjtype == 'linestring') {
            var fid = hjline.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
        }
        //清除点航迹
        if (hjmultipoint != null && hjtype == 'multipoint') {
            var fid = hjmultipoint.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
            // hjLayer.getSource().removeFeature(hjmultipoint);
        }
        //清除绑定威胁要素
        if (wxfeature != null) {
            _manager.mbLayer.getSource().removeFeature(wxfeature);
        }
        //清除tag
        _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
        //删除目标对象
        _manager.mbLayer.getSource().removeFeature(mb);
    }
}

/**
 * 清除队列
 * @param {*} queue 
 */
ZhtsManager.prototype.clearQueue = function (queue) {
    var _manager = this;
    var tagmanager = this.getTagmanager();
    var source = this.mbLayer.getSource();
    var remFeatures = [];
    var tracks = source.getFeatures();
    for (var j = 0; j < tracks.length; j++) {
        var f = tracks[j];
        var _qu = f.getProperties().queue;
        if (_qu === queue) {
            remFeatures.push(f);
        }
    }
    while (remFeatures.length > 0) {
        var mb = remFeatures.pop();
        var prop = mb.getProperties();
        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();
        var showTag = mb.get("showTag");
        if (showTag) {
            tagmanager.removeLinkedTag(mb.getLinkedTag());
        }
        var wxfeature = mb.unBindFeature();
        //清除线航迹
        if (hjline != null) {
            var ph = hjline.getProperties().ph;
            var features = _manager.hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    _manager.hjLayer.getSource().removeFeature(features[i]);
                }
            }
        }
        //清除点航迹
        if (hjmultipoint != null) {
            var ph = hjmultipoint.getProperties().ph;
            var features = _manager.hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    _manager.hjLayer.getSource().removeFeature(features[i]);
                }
            }
        }
        //清除绑定威胁要素
        if (wxfeature != null) {
            var ph = wxfeature.getProperties().ph;
            var features = _manager.wsLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    _manager.wsLayer.getSource().removeFeature(features[i]);
                }
            }
        }
        source.removeFeature(mb);
    }
}

/**
 * 清除民用数据
 */
ZhtsManager.prototype.clearMH = function (v) {
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    if (v) { //显示
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var jm = prop.jm;
            var fid = queue + "_" + ph;
            if (jm == 1) {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(1);
                var tag = mb.getLinkedTag();
                mb.set("show", true);
                _manager.getTagmanager().addLinkedTag(tag);

                //加载目标、对应航线、颜色
                _manager.showMB(hjLayer, fid);
            }
        }
    } else { //隐藏
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var jm = prop.jm;
            var fid = queue + "_" + ph;
            if (jm == 1) {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(0);
                var tag = mb.getLinkedTag();
                mb.set("show", false);
                if (tag) {
                    _manager.tagmanager.removeLinkedTag(tag);
                }

                //加载目标、对应航线、颜色
                _manager.hideMB(hjLayer, fid);
            }
        }
    }
    var rootnode = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    var childnodes = TSTCXYSettingTree.zTree().getNodesByParam("jm", "1", rootnode);
    for (var i = 0; i < childnodes.length; i++) {
        var nd = childnodes[i];
        nd.checked = v;
        TSTCXYSettingTree.zTree().updateNode(nd);
    }
}

/**
 * 清除军用数据
 */
ZhtsManager.prototype.clearJY = function (v) {
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    if (v) { //显示
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var jm = prop.jm;
            var fid = queue + "_" + ph;
            if (jm != 1) {
                var hjLayer = manager.getLayerByQueueName(queue);
                hjLayer.setVisible(true);
                mb.getStyle().getImage().setOpacity(1);
                var tag = mb.getLinkedTag();
                mb.set("show", true);
                _manager.getTagmanager().addLinkedTag(tag);

                //加载目标、对应航线、颜色
                _manager.showMB(hjLayer, fid);
            }
        }
    } else { //隐藏
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var jm = prop.jm;
            var fid = queue + "_" + ph;
            if (jm != 1) {
                var hjLayer = manager.getLayerByQueueName(queue);
                hjLayer.setVisible(false);
                mb.getStyle().getImage().setOpacity(0);
                var tag = mb.getLinkedTag();
                mb.set("show", false);
                if (tag) {
                    _manager.tagmanager.removeLinkedTag(tag);
                }

                //隐藏目标、对应航线、颜色
                _manager.hideMB(hjLayer, fid);
            }
        }
    }
    //所有树形节点都更新为当前选中状态
    // var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    // node.checked = v;
    // TSTCXYSettingTree.zTree().updateNode(node);
    var n0 = TSTCXYSettingTree.zTree().getNodesByParam("level", 0, null);
    for (var x = 0; x < n0.length; x++) {
        var n = n0[x];
        if (n.dyh == "SSTS_RHJG_4") {
            n.checked = v;
        } else {
            n.checked = false;
        }
        TSTCXYSettingTree.zTree().updateNode(n);
    }
    var n1 = TSTCXYSettingTree.zTree().getNodesByParam("level", 1, null);
    for (var i = 0; i < n1.length; i++) {
        var n = n1[i];
        n.checked = v;
        TSTCXYSettingTree.zTree().updateNode(n);
    }
    var n2 = TSTCXYSettingTree.zTree().getNodesByParam("level", 2, null);
    for (var j = 0; j < n2.length; j++) {
        var n = n2[j];
        n.checked = v;
        TSTCXYSettingTree.zTree().updateNode(n);
    }
    var n3 = TSTCXYSettingTree.zTree().getNodesByParam("level", 3, null);
    for (var k = 0; k < n3.length; k++) {
        var n = n3[k];
        n.checked = v;
        TSTCXYSettingTree.zTree().updateNode(n);
    }
}


/**
 * 清除WF
 */
ZhtsManager.prototype.clearWF = function (v) {
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    if (v) { //显示
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var dwsx = prop.dwsx;
            var fid = queue + "_" + ph;
            if (dwsx == '我') {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(1);
                var tag = mb.getLinkedTag();
                mb.set("show", true);
                _manager.getTagmanager().addLinkedTag(tag);

                //加载目标、对应航线、颜色
                _manager.showMB(hjLayer, fid);
            }
        }
    } else { //隐藏
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var dwsx = prop.dwsx;
            var fid = queue + "_" + ph;
            if (dwsx == '我') {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(0);
                var tag = mb.getLinkedTag();
                mb.set("show", false);
                if (tag) {
                    _manager.tagmanager.removeLinkedTag(tag);
                }

                //隐藏目标、对应航线、颜色
                _manager.hideMB(hjLayer, fid);
            }
        }
    }
    var rootnode = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    var childnodes = TSTCXYSettingTree.zTree().getNodesByParam("dwsx", "我", rootnode);
    for (var i = 0; i < childnodes.length; i++) {
        var nd = childnodes[i];
        nd.checked = v;
        TSTCXYSettingTree.zTree().updateNode(nd);
    }
}



/**
 * 清除DF
 */
ZhtsManager.prototype.clearDF = function (v) {
    var _manager = this;
    var tracks = this.mbLayer.getSource().getFeatures();
    //显示或者隐藏所有目标、标牌、航迹
    if (v) { //显示
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var dwsx = prop.dwsx;
            var fid = queue + "_" + ph;
            if (dwsx == '敌') {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(1);
                var tag = mb.getLinkedTag();
                mb.set("show", true);
                _manager.getTagmanager().addLinkedTag(tag);
                //加载目标、对应航线、颜色
                _manager.showMB(hjLayer, fid);
            }
        }

    } else { //隐藏
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var dwsx = prop.dwsx;
            var fid = queue + "_" + ph;
            if (dwsx == '敌') {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(0);
                var tag = mb.getLinkedTag();
                mb.set("show", false);
                if (tag) {
                    _manager.tagmanager.removeLinkedTag(tag);
                }
                //隐藏目标、对应航线、颜色
                _manager.hideMB(hjLayer, fid)
            }
        }
    }
    var rootnode = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    var childnodes = TSTCXYSettingTree.zTree().getNodesByParam("dwsx", "敌", rootnode);
    for (var i = 0; i < childnodes.length; i++) {
        var nd = childnodes[i];
        nd.checked = v;
        TSTCXYSettingTree.zTree().updateNode(nd);
    }
}



/**
 * 清除MBLB
 */
ZhtsManager.prototype.clearMBLB = function (mblbStr, v) {
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    //显示或者隐藏所有目标、标牌、航迹
    if (v) { //显示
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var mblb = prop.mblb;
            var fid = queue + "_" + ph;
            if (mblb == mblbStr) {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(1);
                var tag = mb.getLinkedTag();
                mb.set("show", true);
                _manager.getTagmanager().addLinkedTag(tag);

                //加载目标、对应航线、颜色
                _manager.showMB(hjLayer, fid);
            }
        }
    } else { //隐藏
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var queue = prop.queue;
            var ph = prop.ph;
            var mblb = prop.mblb;
            var fid = queue + "_" + ph;
            if (mblb == mblbStr) {
                var hjLayer = manager.getLayerByQueueName(queue);
                mb.getStyle().getImage().setOpacity(0);
                var tag = mb.getLinkedTag();
                mb.set("show", false);
                if (tag) {
                    _manager.tagmanager.removeLinkedTag(tag);
                }

                //隐藏目标、对应航线、颜色
                _manager.hideMB(hjLayer, fid);
            }
        }
    }
    var rootnode = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    var pnodes = TSTCXYSettingTree.zTree().getNodesByParam("spname", mblbStr, rootnode);
    var childnodes = TSTCXYSettingTree.zTree().getNodesByParam("mblb", mblbStr, rootnode);
    for (var i = 0; i < childnodes.length; i++) {
        var nd = childnodes[i];
        nd.checked = v;
        TSTCXYSettingTree.zTree().updateNode(nd);
    }
    for (var j = 0; j < pnodes.length; j++) {
        var nd = pnodes[j];
        nd.checked = v;
        var p = nd.getParentNode();
        if (nd.othernum == p.othernum) {
            p.checked = v;
            TSTCXYSettingTree.zTree().updateNode(p);
        }
        TSTCXYSettingTree.zTree().updateNode(nd);
    }

}


/**
 * 清除MB class
 */
ZhtsManager.prototype.clearMBClass = function (classStr) {
    var _manager = this;
    //清除所有目标和相关要素
    var tracks = this.mbLayer.getSource().getFeatures();
    for (var i = 0; i < tracks.length; i++) {
        var mb = tracks[i];
        var prop = mb.getProperties();
        //根据队列名称获取对应图层名称进行清除要素
        var queue = prop.queue;
        var dwsx = prop.dwsx;
        var mbtypename = prop.mbtypename;
        if (mbtypename == classStr) {
            var hjLayer = manager.getLayerByQueueName(queue);
            var hjline = mb.unBindLineString();
            var hjmultipoint = mb.unBindMultiPoint();
            var wxfeature = mb.unBindFeature();
            //清除线航迹
            if (hjline != null) {
                hjLayer.getSource().removeFeature(hjline);
            }
            //清除点航迹
            if (hjmultipoint != null) {
                hjLayer.getSource().removeFeature(hjmultipoint);
            }
            //清除绑定威胁要素
            if (wxfeature != null) {
                _manager.mbLayer.getSource().removeFeature(wxfeature);
            }
            //清除tag
            _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
            //删除目标对象
            _manager.mbLayer.getSource().removeFeature(mb);
        }

    }
}

/**
 * 检查超过时间没有更新的目标，然后清除目标。
 * 
 * @param {*} timeout 
 */
ZhtsManager.prototype.checkMBTimeOut = function (timeout) {
    var _manager = this;
    this._timeInternalId = setInterval(function () {
        var tracks = _manager.mbLayer.getSource().getFeatures();
        //获取当前时间
        var nowTime = new Date();

        var nodeObj;

        //获取输入框的时间
        var plaingrayTime = Number($("#plaingrayInpt").val()); //空中目标变灰时间
        var plainfadeTime = Number($("#plainfadeInpt").val()); //空中目标消失时间
        var boatgrayTime = Number($("#boatgrayInpt").val()); //水上目标变灰时间
        var boatfadeTime = Number($("#boatfadeInpt").val()); //水上目标消失时间

        //转换成毫秒
        plaingrayTime = plaingrayTime * 60 * 1000;
        plainfadeTime = plainfadeTime * 60 * 1000;
        boatgrayTime = boatgrayTime * 60 * 1000;
        boatfadeTime = boatfadeTime * 60 * 1000;

        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var speed = prop.sd;
            var hx = prop.hx;
            var ph = prop.ph;
            var mblb = prop.mblb;
            var queue = prop.queue;
            var mbmc = prop.mbmc;
            var hjLayer = _manager.getLayerByQueueName(queue);
            var fid = queue + "_" + ph;

            var anchor = [0.5, 0.5];
            if (mblb === '空中目标') {
                anchor = [0.5, 0.4];
            } else if (mblb === '水面目标') {
                anchor = [0.05, 0.5];
                if (prop.mbtypename === "民用船只" || prop.mbtypename === "渔船") {
                    anchor = [0.09, 0.5];
                }
            }

            if (mblb === '空中目标') {
                //15分钟设置对应目标变灰 
                if (nowTime.getTime() - prop.drawtime >= plaingrayTime) {

                    //灰色图标
                    var image = new ol.style.Icon( /** @type {olx.style.IconOptions} */({
                        scale: mb.getStyle().getImage().getScale(),
                        anchor: anchor,
                        src: basePath + '/page/webgis/jb/getJB.do?JBKH=' + prop.jbkh + '&JBDH=' + prop.jbdh + '&CC=' + prop.jbcc + '&JBYS=H',
                        rotation: ((prop.hx) / 180) * Math.PI
                    }));
                    var style = new ol.style.Style({
                        image: image
                    });
                    mb.setStyle(style);

                    //设置状态为灰色状态
                    mb.set("status", "gray");
                    //根据对应的树形节点判断是否显示或者隐藏
                    var treenode = TSTCXYSettingTree.zTree().getNodeByParam("mbfid", fid, null);
                    if (treenode) {
                        var show = treenode.checked;
                        //var show = mb.get("show");
                        if (show) {
                            mb.getStyle().getImage().setOpacity(1);
                            //加载目标、对应航线、颜色
                            manager.showMB(hjLayer, fid);

                        } else {
                            mb.getStyle().getImage().setOpacity(0);
                            var fid = prop.queue + "_" + prop.ph;
                            //加载目标、对应航线、颜色
                            manager.hideMB(hjLayer, fid);
                        }
                    }


                }
                //30分钟设置对应目标清除，航向清除
                if (nowTime.getTime() - prop.drawtime >= plainfadeTime) {

                    //TODO
                    var hjline = mb.unBindLineString();
                    var hjmultipoint = mb.unBindMultiPoint();
                    var wxfeature = mb.unBindFeature();
                    var hjtype = mb.get("hjtype");

                    //清除线航迹
                    if (hjline != null) {
                        hjline.set("status", "offline");
                        var fid = hjline.getId();
                        var remFeature = hjLayer.getSource().getFeatureById(fid);
                        if (remFeature != null) {
                            hjLayer.getSource().removeFeature(remFeature);
                        }
                    }
                    //清除点航迹
                    if (hjmultipoint != null) {
                        hjmultipoint.set("status", "offline");
                        var fid = hjmultipoint.getId();
                        var remFeature = hjLayer.getSource().getFeatureById(fid);
                        if (remFeature != null) {
                            hjLayer.getSource().removeFeature(remFeature);
                        }
                    }

                    //清除绑定威胁要素
                    if (wxfeature != null) {
                        _manager.mbLayer.getSource().removeFeature(wxfeature);
                    }
                    //清除tag
                    _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
                    //删除目标对象
                    _manager.mbLayer.getSource().removeFeature(mb);

                    //更新实时态势树形数据，找到对应的树形节点，删除并且把对应的所有父节点数据减1
                    var mbfid = queue + "_" + ph;
                    var treenodes = TSTCXYSettingTree.zTree().getNodesByParam("mbfid", mbfid, null);
                    for (var j = 0; j < treenodes.length; j++) {
                        var node = treenodes[j];
                        if (node.queue == queue) { //找到对应的树形节点，首先删除
                            nodeObj = node;
                            var dyh = TSTCXYSettingTree.zTree().getNodesByParam("dyh", queue, null)[0];
                            var param = {gjnm:nodeObj.gjnm,gjstr:nodeObj.gjstr,mblb:nodeObj.mblb,number:-1,dyhName:dyh?dyh.spname.trim():""};
                            TSTCXYSettingTree.zTree().removeNode(node);
                            //把对应的所有父节点数据减1
                            while ((nodeObj = nodeObj.getParentNode()) != null) {
                                nodeObj.othernum = nodeObj.othernum - 1;
                                if (nodeObj.othernum == 0) {
                                    nodeObj.name = nodeObj.spname;
                                    //如果没有了下面的子节点，则父节点也删除
                                    //一级节点不能删除
                                    if (nodeObj.level > 0) {
                                        TSTCXYSettingTree.zTree().removeNode(nodeObj);
                                    }

                                } else {
                                    nodeObj.name = nodeObj.spname + "  (" + nodeObj.othernum + ")";
                                    TSTCXYSettingTree.zTree().updateNode(nodeObj);

                                }
                            }
                            //统计图表中的数量也加1
                            afterNodeCountChange(param);
                        }
                    }

                }
            } else if (mblb === '水面目标') {

                if (nowTime.getTime() - prop.drawtime >= boatgrayTime) { //变灰时间

                    //灰色图标
                    var image = new ol.style.Icon( /** @type {olx.style.IconOptions} */({
                        scale: mb.getStyle().getImage().getScale(),
                        anchor: anchor,
                        src: basePath + '/page/webgis/jb/getJB.do?JBKH=' + prop.jbkh + '&JBDH=' + prop.jbdh + '&CC=' + prop.jbcc + '&JBYS=H',
                        rotation: ((prop.hx) / 180) * Math.PI
                    }));
                    var style = new ol.style.Style({
                        image: image
                    });
                    mb.setStyle(style);
                    //设置状态为灰色状态
                    mb.set("status", "gray");

                    //根据对应的树形节点判断是否显示或者隐藏
                    var treenode = TSTCXYSettingTree.zTree().getNodeByParam("mbfid", fid, null)
                    if (treenode) {
                        var show = treenode.checked;
                        //var show = mb.get("show");
                        if (show) {
                            mb.getStyle().getImage().setOpacity(1);
                            //加载目标、对应航线、颜色
                            manager.showMB(hjLayer, fid);

                        } else {
                            mb.getStyle().getImage().setOpacity(0);
                            var fid = prop.queue + "_" + prop.ph;
                            //加载目标、对应航线、颜色
                            manager.hideMB(hjLayer, fid);
                        }
                    }
                }
                if (nowTime.getTime() - prop.drawtime >= boatfadeTime) { //进行删除目标和清除航向

                    //TODO
                    var hjline = mb.unBindLineString();
                    var hjmultipoint = mb.unBindMultiPoint();
                    var wxfeature = mb.unBindFeature();

                    //清除线航迹
                    if (hjline != null) {
                        hjline.set("status", "offline");
                        var fid = hjline.getId();
                        var remFeature = hjLayer.getSource().getFeatureById(fid);
                        if (remFeature != null) {
                            hjLayer.getSource().removeFeature(remFeature);
                        }
                    }
                    //清除点航迹
                    if (hjmultipoint != null) {
                        hjmultipoint.set("status", "offline");
                        var fid = hjmultipoint.getId();
                        var remFeature = hjLayer.getSource().getFeatureById(fid);
                        if (remFeature != null) {
                            hjLayer.getSource().removeFeature(remFeature);
                        }
                    }
                    //清除绑定威胁要素
                    if (wxfeature != null) {
                        _manager.mbLayer.getSource().removeFeature(wxfeature);
                    }
                    //清除tag
                    _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
                    //删除目标对象
                    _manager.mbLayer.getSource().removeFeature(mb);

                    //更新实时态势树形数据，找到对应的树形节点，删除并且把对应的所有父节点数据减1
                    var mbfid = queue + "_" + ph;
                    var treenodes = TSTCXYSettingTree.zTree().getNodesByParam("mbfid", mbfid, null);
                    for (var j = 0; j < treenodes.length; j++) {
                        var node = treenodes[j];
                        if (node.queue == queue) { //找到对应的树形节点，首先删除
                            nodeObj = node;
                            var dyh = TSTCXYSettingTree.zTree().getNodesByParam("dyh", queue, null)[0];
                            var param = { gjnm: nodeObj.gjnm, gjstr: nodeObj.gjstr, mblb: nodeObj.mblb, number: -1, dyhName:dyh?dyh.spname.trim():""};
                            TSTCXYSettingTree.zTree().removeNode(node);
                            //把对应的所有父节点数据减1
                            while ((nodeObj = nodeObj.getParentNode()) != null) {
                                nodeObj.othernum = nodeObj.othernum - 1;
                                if (nodeObj.othernum == 0) {
                                    nodeObj.name = nodeObj.spname;
                                    //如果没有了下面的子节点，则父节点也删除
                                    //一级节点不能删除
                                    if (nodeObj.level > 0) {
                                        TSTCXYSettingTree.zTree().removeNode(nodeObj);
                                    }
                                } else {
                                    nodeObj.name = nodeObj.spname + "  (" + nodeObj.othernum + ")";
                                    TSTCXYSettingTree.zTree().updateNode(nodeObj);
                                }
                            }
                            //统计图表中的数量也加1
                            afterNodeCountChange(param);
                        }
                    }
                }
            }

            // console.log(mb);
            // console.log(mb.get("mbnm"))
            //console.log(mb.getFeatures());
            //console.log(mb.unBindFeature());
            //清除无效的航迹
            _manager.cleanOfflineFeatures();

        }

    }, timeout);
}


/**
 * 删除消失的目标
 * @param {*} _manager 
 * @param {*} mb 
 */
ZhtsManager.prototype.removeXSMB = function (_manager, mb) {

    var prop = mb.getProperties();
    var speed = prop.sd;
    var hx = prop.hx;
    var ph = prop.ph;
    var mblb = prop.mblb;
    var queue = prop.queue;
    var mbmc = prop.mbmc;
    var hjLayer = _manager.getLayerByQueueName(queue);
    var fid = queue + "_" + ph;

    if (mblb === '空中目标') {

        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();
        var hjtype = mb.get("hjtype");

        //清除线航迹
        if (hjline != null) {
            hjline.set("status", "offline");
            var fid = hjline.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
        }
        //清除点航迹
        if (hjmultipoint != null) {
            hjmultipoint.set("status", "offline");
            var fid = hjmultipoint.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
        }

        //清除绑定威胁要素
        if (wxfeature != null) {
            _manager.mbLayer.getSource().removeFeature(wxfeature);
        }
        //清除tag
        _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
        //删除目标对象
        _manager.mbLayer.getSource().removeFeature(mb);

        //更新实时态势树形数据，找到对应的树形节点，删除并且把对应的所有父节点数据减1
        var mbfid = queue + "_" + ph;
        var treenodes = TSTCXYSettingTree.zTree().getNodesByParam("mbfid", mbfid, null);
        for (var j = 0; j < treenodes.length; j++) {
            var node = treenodes[j];
            if (node.queue == queue) { //找到对应的树形节点，首先删除
                nodeObj = node;
                TSTCXYSettingTree.zTree().removeNode(node);
                //把对应的所有父节点数据减1
                while ((nodeObj = nodeObj.getParentNode()) != null) {
                    nodeObj.othernum = nodeObj.othernum - 1;
                    if (nodeObj.othernum == 0) {
                        nodeObj.name = nodeObj.spname;
                        //如果没有了下面的子节点，则父节点也删除
                        //一级节点不能删除
                        if (nodeObj.level > 0) {
                            TSTCXYSettingTree.zTree().removeNode(nodeObj);
                        }

                    } else {
                        nodeObj.name = nodeObj.spname + "  (" + nodeObj.othernum + ")";
                        TSTCXYSettingTree.zTree().updateNode(nodeObj);
                        //统计图表中的数量也加1
                        // statistics(node,-1);
                    }

                }
            }
        }

    } else if (mblb === '水面目标') {

        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();

        //清除线航迹
        if (hjline != null) {
            hjline.set("status", "offline");
            var fid = hjline.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
        }
        //清除点航迹
        if (hjmultipoint != null) {
            hjmultipoint.set("status", "offline");
            var fid = hjmultipoint.getId();
            var remFeature = hjLayer.getSource().getFeatureById(fid);
            if (remFeature != null) {
                hjLayer.getSource().removeFeature(remFeature);
            }
        }
        //清除绑定威胁要素
        if (wxfeature != null) {
            _manager.mbLayer.getSource().removeFeature(wxfeature);
        }
        //清除tag
        _manager.getTagmanager().removeLinkedTag(mb.getLinkedTag());
        //删除目标对象
        _manager.mbLayer.getSource().removeFeature(mb);

        //更新实时态势树形数据，找到对应的树形节点，删除并且把对应的所有父节点数据减1
        var mbfid = queue + "_" + ph;
        var treenodes = TSTCXYSettingTree.zTree().getNodesByParam("mbfid", mbfid, null);
        for (var j = 0; j < treenodes.length; j++) {
            var node = treenodes[j];
            if (node.queue == queue) { //找到对应的树形节点，首先删除
                nodeObj = node;
                TSTCXYSettingTree.zTree().removeNode(node);
                //把对应的所有父节点数据减1
                while ((nodeObj = nodeObj.getParentNode()) != null) {
                    nodeObj.othernum = nodeObj.othernum - 1;
                    if (nodeObj.othernum == 0) {
                        nodeObj.name = nodeObj.spname;
                        //如果没有了下面的子节点，则父节点也删除
                        //一级节点不能删除
                        if (nodeObj.level > 0) {
                            TSTCXYSettingTree.zTree().removeNode(nodeObj);
                        }
                    } else {
                        nodeObj.name = nodeObj.spname + "  (" + nodeObj.othernum + ")";
                        TSTCXYSettingTree.zTree().updateNode(nodeObj);
                        //统计图表中的数量也加1
                        // statistics(node,-1);
                    }

                }
            }
        }
    }
}



/**
 * 清除无效的航迹
 */
ZhtsManager.prototype.cleanOfflineFeatures = function () {
    var arr = this.getHJLayerArr();
    for (var j = 0; j < arr.length; j++) {
        if (!(arr[j] instanceof ol.layer.Vector)) {
            continue;
        }
        var source = arr[j].getSource();
        //获取数据源包含的所有要素
        var features = source.getFeatures();
        if (features.length > 0) {
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                var prop = feature.getProperties();
                if (prop.status === 'offline') {
                    source.removeFeature(feature);
                }
            }
        }
    }
}

/**
 * 清除定时器
 */
ZhtsManager.prototype.stopCheck = function () {
    if (this._timeInternalId) {
        window.clearInterval(this._timeInternalId);
    }
}

/**
 * 控制全局的标牌显示与隐藏
 * @param {Object} show 
 */
ZhtsManager.prototype.showTag = function (show) {
    var tagmanager = this.tagmanager;
    var source = this.mbLayer.getSource();
    var tracks = source.getFeatures();
    socket.showTag.show = show;
    if (show) {
        for (var i = 0; i < tracks.length; i++) {
            var f = tracks[i];
            var op = f.getStyle().getImage().getOpacity();
            if (op != 0) {
                var tag = f.getLinkedTag();
                var s = f.get("showTag");
                if (!s) {
                    tagmanager.addLinkedTag(tag);
                    f.set("showTag", show);
                }

            }

        }
        console.log("show");
    } else {

        for (var j = 0; j < tracks.length; j++) {
            var f = tracks[j];
            var op = f.getStyle().getImage().getOpacity();
            if (op != 0) {
                var showTag = f.get("showTag");
                if (showTag) {
                    var tag = f.getLinkedTag();
                    f.set("showTag", show);
                    tagmanager.removeLinkedTag(f.getLinkedTag());
                }
            }
        }
        console.log("hide");
    }
}

/**
 * 根据队列名称设置对应的目标透明，并且显示或者隐藏标牌
 * @param {String} queue 队列名称
 * @param {Object} show 是否显示
 */
ZhtsManager.prototype.showTagByQueue = function (queue, show) {
    var tagmanager = this.tagmanager;
    var source = this.mbLayer.getSource();
    var features = source.getFeatures();
    var socketShow = socket.showTag.show;
    for (var i = 0; i < features.length; i++) {
        var f = features[i];
        var prop = f.getProperties();
        var showTag = f.get("showTag");
        if (prop.queue === queue) {
            if (show) { //树形节点选中
                if (socketShow) { //如果全局选中，则显示标牌
                    //显示目标
                    f.getStyle().getImage().setOpacity(1);
                    //显示标牌
                    var tag = f.getLinkedTag();
                    var s = f.get("showTag");
                    tagmanager.addLinkedTag(tag);
                } else { //如果全局没有选中，则不显示标牌
                    //显示目标
                    f.getStyle().getImage().setOpacity(1);
                    //隐藏标牌
                    var showTag = f.get("showTag");
                    if (showTag) {
                        var tag = f.getLinkedTag();
                        tagmanager.removeLinkedTag(tag);
                    }
                }
            } else { //树形节点没有选中
                //隐藏目标
                f.getStyle().getImage().setOpacity(0);
                //隐藏标牌
                var showTag = f.get("showTag");
                if (showTag) {
                    var tag = f.getLinkedTag();
                    tagmanager.removeLinkedTag(tag);
                }
            }
            // if(socktShow){
            //     if (show) {
            //         //显示目标
            //         f.getStyle().getImage().setOpacity(1);
            //         //显示标牌
            //         var tag = f.getLinkedTag();
            //         var s = f.get("showTag");
            //         tagmanager.addLinkedTag(tag);
            //     }else{
            //          //隐藏目标
            //          f.getStyle().getImage().setOpacity(0);
            //          //隐藏标牌
            //          var showTag = f.get("showTag");
            //          if (showTag) {
            //              var tag = f.getLinkedTag();
            //              tagmanager.removeLinkedTag(tag);
            //          }
            //     }
            // }
        }
    }

}

/**
 * 根据队列名称设置对应的目标透明，并且显示或者隐藏标牌
 * @param {ol.layer.Vector} layer 图层名称
 * @param {String} queue 队列名称
 * @param {Object} show 是否显示
 */
ZhtsManager.prototype.showTagByQueueAndLayer = function (layer, queue, show) {
    var tagmanager = this.tagmanager;
    var source = layer.getSource();
    var features = source.getFeatures();
    for (var i = 0; i < features.length; i++) {
        var f = features[i];
        var prop = f.getProperties();
        var showTag = f.get("showTag");
        if (prop.queue === queue) {
            if (show) { //树形节点选中
                //显示目标
                f.getStyle().getImage().setOpacity(1);
                //显示标牌
                var tag = f.getLinkedTag();
                var s = f.get("showTag");
                tagmanager.addLinkedTag(tag);

            } else { //树形节点没有选中
                //隐藏目标
                f.getStyle().getImage().setOpacity(0);
                //隐藏标牌
                var showTag = f.get("showTag");
                if (showTag) {
                    var tag = f.getLinkedTag();
                    tagmanager.removeLinkedTag(tag);
                }
            }
        }
    }

}


/**
 * 根据信源名称删除对应的目标、航迹、标牌
 * @param {*} queue 
 */
ZhtsManager.prototype.clearQueueByXYMC = function (queue) {
    var _manager = this;
    var tagmanager = this.getTagmanager();
    var source = this.mbLayer.getSource();
    var remFeatures = [];
    var tracks = source.getFeatures();
    var hjLayer = this.getLayerByQueueName(queue);
    for (var j = 0; j < tracks.length; j++) {
        var f = tracks[j];
        var _qu = f.getProperties().queue;
        if (_qu === queue) {
            remFeatures.push(f);
        }

    }
    while (remFeatures.length > 0) {
        var mb = remFeatures.pop();
        var prop = mb.getProperties();
        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();
        var showTag = mb.get("showTag");
        if (showTag) {
            tagmanager.removeLinkedTag(mb.getLinkedTag());
        }
        var wxfeature = mb.unBindFeature();
        //清除线航迹
        if (hjline != null) {
            var ph = hjline.getProperties().ph;
            var features = hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    hjLayer.getSource().removeFeature(features[i]);
                }
            }
        }
        //清除点航迹
        if (hjmultipoint != null) {
            var ph = hjmultipoint.getProperties().ph;
            var features = hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    hjLayer.getSource().removeFeature(features[i]);
                }
            }

        }
        //清除绑定威胁要素
        if (wxfeature != null) {
            var ph = wxfeature.getProperties().ph;
            var features = _manager.wsLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    _manager.wsLayer.getSource().removeFeature(features[i]);
                }
            }

        }
        source.removeFeature(mb);
    }
}

/**
 * 根据信源名称删除对应的目标、航迹、标牌
 * @param {*} queue 
 */
ZhtsManager.prototype.clearQueueByXYMCAndLayer = function (queue,layer,hjLayer) {
    var _manager = this;
    var tagmanager = this.getTagmanager();
    var source = layer.getSource();
    var remFeatures = [];
    var tracks = source.getFeatures();
    var hjLayer =hjLayer;
    for (var j = 0; j < tracks.length; j++) {
        var f = tracks[j];
        var _qu = f.getProperties().queue;
        if (_qu === queue) {
            remFeatures.push(f);
        }

    }
    while (remFeatures.length > 0) {
        var mb = remFeatures.pop();
        var prop = mb.getProperties();
        var hjline = mb.unBindLineString();
        var hjmultipoint = mb.unBindMultiPoint();
        var wxfeature = mb.unBindFeature();
        var showTag = mb.get("showTag");
        if (showTag) {
            tagmanager.removeLinkedTag(mb.getLinkedTag());
        }
        var wxfeature = mb.unBindFeature();
        //清除线航迹
        if (hjline != null) {
            var ph = hjline.getProperties().ph;
            var features = hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    hjLayer.getSource().removeFeature(features[i]);
                }
            }
        }
        //清除点航迹
        if (hjmultipoint != null) {
            var ph = hjmultipoint.getProperties().ph;
            var features = hjLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    hjLayer.getSource().removeFeature(features[i]);
                }
            }

        }
        //清除绑定威胁要素
        if (wxfeature != null) {
            var ph = wxfeature.getProperties().ph;
            var features = _manager.wsLayer.getSource().getFeatures();
            for (var i = 0; i < features.length; i++) {
                if (ph === features[i].getProperties().ph) {
                    _manager.wsLayer.getSource().removeFeature(features[i]);
                }
            }

        }
        source.removeFeature(mb);
    }
}


/**
 * 根据对应的信原名称获取对应航迹图层
 * @param {string} queue 信源名称
 */
ZhtsManager.prototype.getLayerByQueueName = function (queue) {
    var hjLayer;
    switch (queue) {
        case 'SSTS_RHJG_4':
            hjLayer = manager.rhjghjLayer;
            break;
        case 'SSTS_LHHQ_1':
            hjLayer = manager.lhhqhjLayer;
            break;
        case 'SSTS_LHKQ_3':
            hjLayer = manager.lhkqhjLayer;
            break;
        case 'SSTS_JZTS_2':
            hjLayer = manager.jztshjLayer;
            break;
        case 'SSTS_DZTS_5':
            hjLayer = manager.dztshjLayer;
            break;
        case 'SSTS_LHKQ_NBZQ_7':
            hjLayer = manager.nbzqhjLayer;
            break;
        case 'SSTS_HZTS_10':
            hjLayer = manager.hztshjLayer;
            break;
        case 'SSTS_TSKB_11':
            hjLayer = manager.tskbLayer;
            break;
        default:
            break;
    }
    return hjLayer;
}

/**
 * 获取所有的航迹图层数组
 * @param {string} queue 信源名称
 */
ZhtsManager.prototype.getHJLayerArr = function () {
    return this.hjLayerArr;
}

/**
 * 设置选中的实时数据队列
 * @param {Array} arr 
 */
ZhtsManager.prototype.setCheckedQueue = function (arr) {
    this.checkedQueueArr = arr;
}

/**
 * 获取目前选中要接收的所有的实时数据队列
 */
ZhtsManager.prototype.getCheckedQueue = function () {
    return this.checkedQueueArr;
}

/**
 * 设置航迹粗细
 * @param {*} fid 
 * @param {*} value 
 * @param {*} feature 
 */
ZhtsManager.prototype.setHJSize = function (fid, value, feature) {
    //根据对应的批号，对应的队列找到对应的航迹，然后修改对应的航迹粗细
    var prop = feature.getProperties();
    var queue = prop.queue;
    var hjLayer = manager.getLayerByQueueName(queue);
    var hj = hjLayer.getSource().getFeatureById(fid);
    var geom = hj.getGeometry();
    var pro = hj.getProperties();
    hj.setProperties({
        "ph": pro.ph,
        "hjtype": pro.hjtype,
        "point_count": Number(pro.point_count),
        "color": pro.color,
        "dwsx": pro.dwsx,
        "size": Number(value)
    });
    if (geom instanceof ol.geom.LineString) {
        //根据属性设置对应样式
        hj.setStyle( // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: pro.color,
                    width: value
                })
            }));
    } else if (geom instanceof ol.geom.MultiPoint) {
        hj.setStyle(new ol.style.Style({
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

/**
 * 设置航迹颜色
 * @param {*} fid 
 * @param {*} hjcolor 
 * @param {*} feature 
 */
ZhtsManager.prototype.setHJColor = function (fid, hjcolor, feature) {
    var prop = feature.getProperties();
    var queue = prop.queue;
    var hjLayer = manager.getLayerByQueueName(queue);
    var hj = hjLayer.getSource().getFeatureById(fid);
    var geom = hj.getGeometry();
    var pro = hj.getProperties();
    hj.setProperties({
        "ph": pro.ph,
        "hjtype": pro.hjtype,
        "point_count": Number(pro.point_count),
        "color": hjcolor,
        "dwsx": pro.dwsx,
        "size": Number(pro.size)
    });
    if (geom instanceof ol.geom.LineString) {
        //根据属性设置对应样式
        hj.setStyle( // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: hjcolor,
                    width: pro.size
                })
            }));
    } else if (geom instanceof ol.geom.MultiPoint) {
        hj.setStyle(new ol.style.Style({
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

/**
 * 给具体目标添加作战效能范围
 * @param {*} params 
 */
ZhtsManager.prototype.addMBCircle = function (params) {
    //根据所传递的参数，找出对应的目标
    var show = params.show;
    var tracks = manager.mbLayer.getSource().getFeatures();
    var mb = null;
    var lon;
    var lat;
    var circleArr;
    for (var i = 0; i < tracks.length; i++) {
        mb = tracks[i];
        var prop = mb.getProperties();
        var ph = prop.ph;
        var queue = prop.queue;
        if (ph == params.pihaoId && queue == params.queueName) { //找到对应目标
            lon = prop.lon;
            lat = prop.lat;
            circleArr = mb.circleArr;
            break;
        }
    }
    if (show) { //如果已经绘制了，则要取消绑定
        var wsSource = manager.wsLayer.getSource().getFeatures();
        var flag = false;
        if (wsSource.length > 0) {
            for (var i = 0; i < wsSource.length; i++) {
                var f = wsSource[i];
                var prop = f.getProperties();
                if (prop.id != params.circleId) {
                    flag = true;
                }
            }
        } else {
            flag = true;
        }
        if (flag) {
            var cir = new ol.geom.Circle(ol.proj.fromLonLat([lon, lat]), params.fw);
            var feature = new ol.Feature({
                geometry: cir,
                name: params.circleId,
                id: params.circleId
            });
            var colorarr = params.color;
            var fillcolor = "rgba(" + colorarr[0] + "," + colorarr[1] + "," + colorarr[2] + ",0.5)";
            var strokecolor = "rgba(" + colorarr[0] + "," + colorarr[1] + "," + colorarr[2] + ",1)";
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillcolor
                }),
                stroke: new ol.style.Stroke({
                    color: strokecolor,
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: fillcolor
                    })
                })
            }));
            //mb.bindFeatures([feature]);
            circleArr.push(feature);
            mb.bindFeatures(circleArr);
            manager.wsLayer.getSource().addFeature(feature);
        }

    } else { //如果没有绘制，则进行绘制，进行绑定
        var circlefeature = mb.unBindFeature(params.circleId);
        manager.wsLayer.getSource().removeFeature(circlefeature);
    }
}

/**
 * 加载目标、对应航线、颜色
 * @param {*} hjLayer 
 * @param {*} fid 
 */
ZhtsManager.prototype.showMB = function (hjLayer, fid) {
    //显示目标后，目标航迹也要显示出来
    var hjFeature = hjLayer.getSource().getFeatureById(fid);
    var geom = hjFeature.getGeometry();
    var p = hjFeature.getProperties();
    var hjcolor = p.color;
    var size = p.size;
    switch (hjcolor) {
        case 'red':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: hjcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'blue':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: hjcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'green':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: hjcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'orange':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: hjcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'purple':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: hjcolor
                        }),
                        stroke: new ol.style.Stroke({
                            color: hjcolor,
                            width: 1
                        })
                    })
                }));
            }
            break;
        default:
            break;
    }
}

/**
 * 隐藏目标、对应航线、颜色
 * @param {*} hjLayer 
 * @param {*} fid 
 */
ZhtsManager.prototype.hideMB = function (hjLayer, fid) {
    //显示目标后，目标航迹也要显示出来
    var hjFeature = hjLayer.getSource().getFeatureById(fid);
    var geom = hjFeature.getGeometry();
    var p = hjFeature.getProperties();
    var hjcolor = p.color;
    var size = p.size;
    switch (hjcolor) {
        case 'red':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "rgba(255,0,0,0)",
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: "rgba(255,0,0,0)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(255,0,0,0)",
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'blue':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "rgba(0,0,255,0)",
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: "rgba(0,0,255,0)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(0,0,255,0)",
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'green':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "rgba(0,128,0,0)",
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: "rgba(0,128,0,0)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(0,128,0,0)",
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'orange':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "rgba(255,165,0,0)",
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: "rgba(255,165,0,0)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(255,165,0,0)",
                            width: 1
                        })
                    })
                }));
            }
            break;
        case 'purple':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle( // linestring
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "rgba(128,0,128,0)",
                            width: size
                        })
                    }));
            } else if (geom instanceof ol.geom.MultiPoint) {
                hjFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: size,
                        fill: new ol.style.Fill({
                            color: "rgba(128,0,128,0)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(128,0,128,0)",
                            width: 1
                        })
                    })
                }));
            }
            break;
        default:
            break;
    }
}

/**
 * 生成历史轨迹颜色方法
 */
ZhtsManager.prototype.lishiguijiColor = function () {
    var r = parseInt(Math.random() * 139),
        g = parseInt(Math.random() * 139),
        b = parseInt(Math.random() * 139);

    return {
        rgb: "rgb(" + r + "," + g + "," + "," + b + ")",
        str: "#" + r.toString(16) + g.toString(16) + b.toString(16),
        arr: [r, g, b]
    }
}