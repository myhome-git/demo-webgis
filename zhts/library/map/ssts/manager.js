
/**
 * 实时态势管理
 */
var SstsManager = function (map, hjlayers, options) {
    this.map = map;
    this.hjlayers = hjlayers;
    this.tagmanager = options.tagmanager;

    var stsource = new ol.source.Vector({
        wrapX: false
    });


    // BIGMap.getHeatmapLayer().setSource(stsource);

    var _mbLayer = options.mbLayer || new ol.layer.Vector({
        id: "ssmb",
        title: '实时目标',
//        renderMode: "image",
        declutter: false,
        visible: true,
        zIndex: 1000,
        source: stsource
    });

    var _wxLayer = options.wxLayer || new ol.layer.Vector({
        title: '目标威胁',
        renderMode: 'vector',
        declutter: false,
        source: new ol.source.Vector({
            wrapX: false
        })
    });
    this.mbLayer = _mbLayer;
    this.wxLayer = _wxLayer;

    _mbLayer.set('displayInLayerSwitcher', true);
    _wxLayer.set('displayInLayerSwitcher', false);
    // _mbLayer.setMap(this.map);
    // _wxLayer.setMap(this.map);
    BIGMap.addOverLayLayer(_mbLayer);
    BIGMap.addOverLayLayer(_wxLayer);
    // _lowLayer.setMap(BIGMap.getMap());
    // BIGMap.addOverLayLayer(_lowLayer);

    //设置每2分钟检查一次没有位置点更新的目标
    this.checkMBTimeOut(2 * 60 * 1000);


    // this.lowLayer.setStyle(style);
    var styleFun = function (feature) {
        console.log(feature);
    }

    // this.lowLayer.setStyle(styleFun);

    var _self = this;
    //获取地图缩放级别,根据对应级别设置目标显示比例
    this.map.getView().on('change:resolution', function (e) {
        var zoomLevel = e.target.getZoom();

        // if (parseInt(zoomLevel) <= 13) { //0.4

        //      _self.mbLayer.setVisible(false);
        // }

        // if (parseInt(zoomLevel) > 13) { //0.8

        //     _self.mbLayer.setVisible(true);
        // }
    });

}

/**
 * 获取航迹图层列表
 */
SstsManager.prototype.getHJLayers = function () {
    return this.hjlayers;
}

/**
 * 获取目标图层
 */
SstsManager.prototype.getMBLayer = function () {
    return this.mbLayer;
}

/**
 * 获取标牌管理器
 */
SstsManager.prototype.getTagmanager = function () {
    return this.tagmanager;
}

/**
 * 设置标牌管理器
 */
SstsManager.prototype.setTagmanager = function (tagmanager) {
    if (tagmanager) {
        this.tagmanager = tagmanager;
    }
}


/**
 * 根据队列名称获取 图层
 * @param {*} queue  参数值：消息队列名称 类型：string
 */
SstsManager.prototype.getLayerByQueueName = function (queue) {
    var hjLayer = undefined;
    for (var i = 0; i < this.hjlayers.length; i++) {
        hjLayer = this.hjlayers[i];
        if (hjLayer.get("queue") === queue) {
            break;
        }
    }
    return hjLayer;
}

/**
 * 根据信源名称删除对应的目标、航迹、标牌
 * @param {*} queue 
 */
SstsManager.prototype.clearQueueByXYMC = function (queue) {
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
        var overlay = mb.unBindOverlay();
        var tag = mb.unBindLinkTag();
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
        if (tag != null) {
            tagmanager.removeLinkedTag(mb.getLinkedTag());
        }

        if (overlay != null) {
            _manager.map.removeOverlay(overlay);
        }

        source.removeFeature(mb);
    }
}

/**
 * 根据信源名称删除对应的目标、航迹、标牌
 * @param {*} queue 
 */
SstsManager.prototype.clearQueueByXYMCAndLayer = function (queue, layer, hjLayer) {
    var _manager = this;
    var tagmanager = this.getTagmanager();
    var source = layer.getSource();
    var remFeatures = [];
    var tracks = source.getFeatures();
    var hjLayer = hjLayer;
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
 * 根据队列名称设置对应的目标透明，并且显示或者隐藏标牌
 * @param {String} queue 队列名称
 * @param {Object} show 是否显示
 */
SstsManager.prototype.showTagByQueue = function (queue, show) {
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
                    var style = f.getStyle();
                    if (style instanceof Array) {
                        style[1].getImage().setOpacity(1);
                    } else {
                        style.getImage().setOpacity(1);
                    }
                    // f.getStyle().getImage().setOpacity(1);
                    //显示标牌
                    var tag = f.getLinkedTag();
                    var s = f.get("showTag");
                    tagmanager.addLinkedTag(tag);
                } else { //如果全局没有选中，则不显示标牌
                    //显示目标
                    // f.getStyle()[1].getImage().setOpacity(1);
                    var style = f.getStyle();
                    if (style instanceof Array) {
                        style[1].getImage().setOpacity(1);
                    } else {
                        style.getImage().setOpacity(1);
                    }
                    //隐藏标牌
                    var showTag = f.get("showTag");
                    if (showTag) {
                        var tag = f.getLinkedTag();
                        tagmanager.removeLinkedTag(tag);
                    }
                }
            } else { //树形节点没有选中
                //隐藏目标
                // f.getStyle()[1].getImage().setOpacity(0);
                var style = f.getStyle();
                if (style instanceof Array) {
                    style[1].getImage().setOpacity(0);
                } else {
                    style.getImage().setOpacity(0);
                }
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
 * 加载目标、对应航线、颜色
 * @param {*} hjLayer 
 * @param {*} fid 
 */
SstsManager.prototype.showMB = function (hjLayer, fid) {
    //显示目标后，目标航迹也要显示出来
    var hjFeature = hjLayer.getSource().getFeatureById(fid);
    var geom = hjFeature.getGeometry();
    var p = hjFeature.getProperties();
    var hjcolor = p.color;
    var size = p.size;
    switch (hjcolor) {
        case 'red':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
SstsManager.prototype.hideMB = function (hjLayer, fid) {
    //显示目标后，目标航迹也要显示出来
    var hjFeature = hjLayer.getSource().getFeatureById(fid);
    var geom = hjFeature.getGeometry();
    var p = hjFeature.getProperties();
    var hjcolor = p.color;
    var size = p.size;
    switch (hjcolor) {
        case 'red':
            if (geom instanceof ol.geom.LineString) {
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
                hjFeature.setStyle(// linestring
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
 * 检查超过时间没有更新的目标，然后清除目标。
 * 
 * @param {*} timeout 
 */
SstsManager.prototype.checkMBTimeOut = function (timeout) {
    var _manager = this;
    this._timeInternalId = setInterval(function () {
        var tracks = _manager.mbLayer.getSource().getFeatures();
        //获取当前时间
        var nowTime = new Date();

        //获取输入框的时间
        var plaingrayTime = Number(5); //空中目标变灰时间
        var plainfadeTime = Number(10); //空中目标消失时间
        var boatgrayTime = Number(30); //水上目标变灰时间
        var boatfadeTime = Number(60); //水上目标消失时间
        var cargrayTime = Number(5);
        var carfadeTime = Number(10);

        //转换成毫秒
        plaingrayTime = plaingrayTime * 60 * 1000;
        plainfadeTime = plainfadeTime * 60 * 1000;
        boatgrayTime = boatgrayTime * 60 * 1000;
        boatfadeTime = boatfadeTime * 60 * 1000;
        cargrayTime = cargrayTime * 60 * 1000;
        carfadeTime = carfadeTime * 60 * 1000;

        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            var mblb = prop.mblb;
            var queue = prop.queue;
            var hjLayer = _manager.getLayerByQueueName(queue);

            if (mblb === '空中目标') {
                //30分钟设置对应目标清除，航向清除
                if (nowTime.getTime() - prop.drawtime >= plainfadeTime) {
                    _manager.removeOldData(hjLayer, mb);
                    //处理是否离线
                    _FunctionObject.SetDeviceTreeState(prop.ph, false);
                }
            } else if (mblb === '水面目标') {
                if (nowTime.getTime() - prop.drawtime >= boatfadeTime) { //进行删除目标和清除航向
                    _manager.removeOldData(hjLayer, mb);
                    //处理是否离线
                    _FunctionObject.SetDeviceTreeState(prop.ph, false);
                }
            } else if (mblb === '陆地目标') {
                if (nowTime.getTime() - prop.drawtime >= carfadeTime) { //进行删除目标和清除航向
                    _manager.removeOldData(hjLayer, mb);
                    //处理是否离线
                    _FunctionObject.SetDeviceTreeState(prop.ph, false);
                }
            }

        }

    }, timeout);
}

/**
 * 删除旧数据
 * @param {type} hjLayer
 * @param {type} mb
 * @returns {undefined}
 */
SstsManager.prototype.removeOldData = function (hjLayer, mb) {
    var _manager = this;
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


/**
 * 获取随机颜色字符串
 */
SstsManager.prototype.getRandomColorStr = function () {
    var r = parseInt(Math.random() * 139),
            g = parseInt(Math.random() * 139),
            b = parseInt(Math.random() * 139);

    return {
        rgb: "rgb(" + r + "," + g + "," + "," + b + ")",
        str: "#" + r.toString(16) + g.toString(16) + b.toString(16),
        arr: [r, g, b]
    }
}

/**
 * 样式设置
 * @param {type} feature
 * @param {type} resolution
 * @returns {ol.style.Style}
 */
SstsManager.prototype.styleFun = function (feature, resolution) {
    var prop = feature.getProperties();
    var info = manager.selectDeviceType(prop.devtype)
    var image = null;

    if (prop.mblb == '水面目标') {
        image = new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({
                color: "blue"
            }),
            stroke: new ol.style.Stroke({
                color: "blue"
            })
        });
    } else if (prop.mblb == '陆地目标') {
        image = new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({
                color: "red"
            }),
            stroke: new ol.style.Stroke({
                color: "red"
            })
        });
    } else if (prop.mblb == '空中目标') {
        image = new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({
                color: "red"
            }),
            stroke: new ol.style.Stroke({
                color: "red"
            })
        });
    } else {
        image = new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({
                color: "green"
            }),
            stroke: new ol.style.Stroke({
                color: "green"
            })
        });
    }

    var style = null;
    var name = prop.mbmc == undefined || prop.mbmc == "" ? prop.ph : prop.mbmc;
    var text = new ol.style.Text({
        textAlign: "center",
        textBaseline: "middle",
        font: "11px 微软雅黑",
        text: name,
        fill: new ol.style.Fill({color: "red"}),
        stroke: new ol.style.Stroke({color: "#ffffff", width: 3}),
        offsetX: 10,
        offsetY: 10,
        rotateWithView: false,
        placement: "point"
    });

    if (resolution < 10) {
        if (prop.mblb == '水面目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 1,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        } else if (prop.mblb == '陆地目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        } else if (prop.mblb == '空中目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        } else {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));

        }

        style = new ol.style.Style({
            image: image,
            text: text
        });

    } else if (resolution > 10 && resolution < 1000) {
        if (prop.mblb == '水面目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 1,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        } else if (prop.mblb == '陆地目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        }  else if (prop.mblb == '空中目标') {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
        } else {
            image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                scale: 0.7,
                anchor: info.anchor,
                rotateWithView: info.rotateWithView,
                src: info.iconUrl,
                rotation: ((prop.hx) / 180) * Math.PI
            }));

        }

        style = new ol.style.Style({
            image: image
        });
    } else {
        style = new ol.style.Style({
            image: image
        });
    }

    return style;
}


/**
 * 获取设备类型对应的目标类型和图标信息
 * 
 * @param {type} name
 * @returns {undefined}
 */
SstsManager.prototype.selectDeviceType = function (name) {

    var info = {
        mblb: "",
        iconUrl: "",
        rotateWithView: false,
        anchor: [0.5, 0.5],
        rotation: true
    };

    /**
     <option value="1">车载设备</option>
     <option value="2">手持设备</option>
     <option value="3">船舶设备</option>                          
     <option value="4">机载设备</option>
     <option value="5">运动设备</option>
     <option value="6">安全设备</option>
     <option value="7">测绘设备</option>
     */
    switch (name) {
        case "车载设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/car64.png";
            info.rotateWithView=true;
            info.anchor = [0.5, 0.5];
            break;
        case "手持设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotateWithView=false;
            info.anchor = [0.5, 0.9];
            info.rotation = false;
            break;
        case "测绘设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotateWithView=false;
            info.anchor = [0.5, 0.9];
            info.rotation = false;
            break;
        case "船舶设备":
            info.mblb = "水面目标";
            info.anchor = [0.9, 0.5];
            info.iconUrl = "images/ship64.png";
            break;
        case "机载设备":
            info.mblb = "空中目标";
            info.iconUrl = "images/plane64.png";
            info.anchor = [0.5, 0.9];
            break;
        case "运动设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotateWithView=false;
            info.rotation = false;
            info.anchor = [0.5, 0.9];
            break;
        case "安全设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
            info.rotateWithView=false;
            info.anchor = [0.5, 0.9];
            break;
        default:
            info.mblb = "陆地目标";
            info.anchor = [0.5, 0.9];
            info.rotateWithView=false,
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
    }
    return info;
}
