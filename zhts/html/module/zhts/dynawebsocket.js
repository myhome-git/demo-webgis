/**
 * 实时态势WebSocket处理
 */
var SstsWebSocket = function (url, vhost, user, password, manager) {
    //var ws = new WebSocket('ws://10.17.181.34:15674/ws');
    var ws = new WebSocket(url);
    //var ws = new WebSocket('ws://' + window.location.hostname + ':15674/ws');
    var client = Stomp.over(ws);
    this._client = client;
    this.sendClient = null;
    this.subscribes = [];
    this.mbScaleInfo = {
        scale: 0.7,
        size: 64,
        anchor: [0.5, 0.5]
    };
    client.debug = function (message) {
        //不输出消息内容，只用于配合stomp框架做心跳检查
    };
    this.manager = manager;

    this.showTag = {
        show: true
    };
    this.hjline = {
        df: {
            show: true
        },
        wf: {
            show: true
        }
    };
    this.receiveDF = {
        show: true
    };
    this.receiveWF = {
        show: true
    };
    this.receiveMH = {
        show: false
    };
    this.receiveJY = {
        show: true
    };
    this.receiveHAI = {
        show: true
    };

    this.receiveLU = {
        show: true
    };

    this.receiveKONG = {
        show: true
    };


    this.MBClass = {
        "护卫舰": true,
        "驱逐舰": true,
        "巡洋舰": true,
        "航空母舰": true,
        "轰炸机": true,
        "侦察机": true,
        "预警机": true,
        "反潜巡逻机": true
    }

    this.tsld = {
        sync: false
    }

    var _self = this;
    // default receive callback to get message from temporary queues
    client.onreceive = function (m) {
        //  console.log(m)
    }

    var on_connect = function (x) {
        //订阅信息
        console.log("客户端接入....");
    };
    var on_error = function (m) {
        console.log('socket链接失败！！！！' + new Date());
        _FunctionObject.ElementMessageStateCircle._State = "gray";
        _FunctionObject.ElementMessageStateCircle.addClass(_FunctionObject.ElementMessageStateCircle._State);
        //重新连接
        console.log('开始重新连接服务器...' + new Date());
        _self.reconnect();
    };

    this.info = {
        url: url,
        vhost: vhost,
        user: user,
        password: password,
        on_connect: on_connect,
        on_error: on_error
    };

    client.connect(user, password, on_connect, on_error, vhost);
}

/**
 * 重新链接
 */
SstsWebSocket.prototype.reconnect = function () {
    var _info = this.info;
    var _self = this;
    //先清除连接状态
    this._client.disconnect();
    //创建新的连接
    var ws = new WebSocket(_info.url);
    this._client = Stomp.over(ws);
    this._client.debug = function (message) {
        //不输出消息内容，只用于配合stomp框架做心跳检查
    };
    this._client.connect(_info.user, _info.password, _info.on_connect, _info.on_error, _info.vhost);
    var id = setInterval(function () {
        if (_self._client.connected) {
            _self.receivemsgAndShow("SSTS_RHJG_4", _self.notify, true);
            console.log("客户端重新连接成功!");
            //清除循环回调
            clearInterval(id);
        }
    }, 2000);
}

/**
 *  接收实时数据
 * @param {*} queue  参数值：消息队列名称 类型：string
 * @param {*} notify 参数值：外置函数 类型：function
 * @param {*} domCheckStatus 参数值：复选框选中状态 类型：boolean
 */
SstsWebSocket.prototype.receivemsgAndShow = function (queue, notify, domCheckStatus) {
    var _self = this;
    var manager = this.manager;
    this.notify = notify;
    var _showTag = this.showTag;
    var _df = this.receiveDF;
    var _wf = this.receiveWF;
    var _mh = this.receiveMH;
    var _hai = this.receiveHAI;
    var _lu = this.receiveLU;
    var _kong = this.receiveKONG;
    var _mbclass = this.MBClass;
    var _jy = this.receiveJY;
    var _hjline = this.hjline;

    var source = this.manager.mbLayer.getSource();
    //判断接收数据之后，根据树形节点选中状态判断显示隐藏
    var sub = this._client.subscribe("/exchange/ws.topic/" + queue, function (m) {
        var mb = JSON.parse(m.body);
        var ph = mb.mbPh; //目标批号
        var time = mb.mbPos.time; //发现时间
        var mbsx = mb.mbSx; //目标属性

        //判断是否有密语
        if (mb.mb_MY) {
            //判断是否是消失报
            if (mb.mb_MY == 403 || mb.mb_MY == 404 || mb.mb_MY == 1613) {
                //如果新增的数据也是消失报，则直接返回
                return;
            }
        }

        //不接收民用数据
        if (!_mh.show) {
            if (mb.mb_JM === 1) { //清除民用数据
                return;
            }
        }

        //不接收军用数据
        if (!_jy.show) {
            if (mb.mb_JM != 1) { //清除民用数据
                return;
            }
        }

        //数据处理
        var prop = _self._convertData(mb);
        prop.queue = queue;
        var lon = prop.lon; //目标经度
        var lat = prop.lat; //目标纬度
        var gd = prop.gd;
        var mbtypeName = prop.mbtypename;

        //不接受敌方数据
        if (!_df.show) {
            if (prop.dwsx == '敌') {
                return;
            }
        }
        //不接收我方数据
        if (!_wf.show) {
            if (prop.dwsx == '我') {
                return;
            }
        }
        //不接收我方数据
        if (!_hai.show) {
            if (prop.mblb == '水面目标') {
                return;
            }
        }
        //不接收我方数据
        if (!_lu.show) {
            if (prop.mblb == '陆地目标') {
                return;
            }
        }
        //不接收我方数据
        if (!_kong.show) {
            if (prop.mblb == '空中目标') {
                return;
            }
        }

        //目标类别显示控制
        var hasMBclass = _mbclass[mbtypeName];
        if (hasMBclass === false) {
            return;
        }

        //将属性数据外传
        notify(prop);

        //设置图标的锚点
        var anchor = [0.5, 0.5];
        if (prop.mblb === '空中目标') {
            anchor = [0.5, 0.4];
            if (prop.jxh.indexOf("直升机") > -1) {
                anchor = [0.5, 0.9];
            }
            if (prop.jxh.indexOf("直-") > -1) {
                anchor = [0.5, 0.9];
            }

        } else if (prop.mblb === '水面目标') {
            anchor = [0.1, 0.5];
            if (prop.mbtypename === "民用船只" || prop.mbtypename === "渔船") {
                anchor = [0.09, 0.5];
            }
        }
        // var features = source.getFeatures();

        //暂时缩放设置为1
        var scale = _self.mbScaleInfo.scale;
        var f = manager.mbLayer.getSource().getFeatureById(queue + "_" + ph);

        if (f == null) { //没有图形则添加

            //首先判断图层里面是否有对应编号的位置点，有的话更新位置，没有的话则添加新的
            var lonlat = [parseFloat(lon), parseFloat(lat), parseFloat(gd)];
            var coord = ol.proj.fromLonLat(lonlat);
            var poi = new ol.geom.Point(coord, "XYZ");
            var track = new ol.Track();
            track.setGeometry(poi);
            track.setId(queue + "_" + ph); //设置唯一辨识
            track.setProperties(prop);

            var image = new ol.style.Icon( /** @type {olx.style.IconOptions} */({
                scale: scale,
                anchor: anchor,
                src: basePath + '/page/webgis/jb/getJB.do?JBKH=' + prop.jbkh + '&JBDH=' + prop.jbdh + '&CC=' + prop.jbcc + '&JBYS=' + prop.jbys,
                rotation: ((prop.hx) / 180) * Math.PI
            }));
            var style = new ol.style.Style({
                image: image
            });
            track.setStyle(style);

            var _className = manager.getwfFontClass();
            if (prop.dwsx == '我' || prop.dwsx == '友') {
                _taglineColor = 'rgba(255,0,0,0.5)';
                _className = manager.getwfFontClass();
            } else {
                _taglineColor = 'rgba(0,0,255,0.5)';
                _className = manager.getdfFontClass();
            }
            var tag = new LinkedTag({
                map: manager.map,
                ph: ph,
                fid: queue + "_" + ph,
                offset: [10, 0],
                className: _className,
                lineOptions: {
                    color: _taglineColor,
                    width: 0.3
                }
            });
            track.bindLinkTag(tag);
            var level = track.getTagInfoLevel();
            track.changeTagContent(level);
            //必须先绑定tag标牌和track 后才能添加到管理器中。
            if (_showTag.show) {
                manager.getTagmanager().addLinkedTag(tag);
            }

            var queuelayer = manager.getLayerByQueueName(queue);
            var isVisible = queuelayer.getVisible();
            //如果图层是隐藏的，则目标设置成隐藏模式
            if (!isVisible) {
                track.getStyle().getImage().setOpacity(0);
                var tag = track.getLinkedTag();
                // track.set("showTag", false);
                if (tag) {
                    manager.tagmanager.removeLinkedTag(tag);
                }
            } else {
                var ztree = TSTCXYSettingTree.zTree();
                var rootnode = ztree.getNodesByParam("dyh", prop.queue, null);
                var gjs = ztree.getNodesByParam("spname", prop.gjstr, rootnode[0]);
                if (gjs.length > 0) {
                    var mblxs = ztree.getNodesByParam("spname", prop.mblb, gjs[0]);
                    for (var i = 0; i < mblxs.length; i++) {
                        var mbentity = mblxs[i];
                        if (!mbentity.checked) {
                            track.getStyle().getImage().setOpacity(0);
                            var tag = track.getLinkedTag();
                            track.set("show", false);
                            if (tag) {
                                manager.tagmanager.removeLinkedTag(tag);
                            }
                            //隐藏目标后，航迹也需要隐藏
                            var hjLayer = manager.getLayerByQueueName(queue);
                            var hjFeature = hjLayer.getSource().getFeatureById(queue + "_" + ph);
                            if (hjFeature != null) {
                                var hjgeom = hjFeature.getGeometry();
                                if (prop.dwsx != "我" && prop.dwsx != "友") {
                                    if (hjgeom instanceof ol.geom.LineString) {
                                        hjFeature.getStyle().getStroke().setColor("rgba(255,0,0,0)");
                                    } else {
                                        hjFeature.getStyle().getImage().setOpacity(0);
                                    }
                                } else {
                                    if (hjgeom instanceof ol.geom.LineString) {
                                        hjFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                                    } else {
                                        hjFeature.getStyle().getImage().setOpacity(0);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (prop.dwsx == '敌') {
                if (_hjline.df.show) {
                    var line = new ol.geom.LineString([coord, coord], "XYZ");
                    var feature3 = new ol.Feature({
                        geometry: line,
                    });
                    feature3.setProperties({
                        "ph": ph,
                        "hjtype": "中航迹",
                        "point_count": 500,
                        "size": manager.getdfHJSize(),
                        "dwsx": prop.dwsx,
                        "color": manager.getdfHJColor()
                    });

                    feature3.setId(queue + "_" + ph);
                    feature3.set("status", "online");

                    //根据所传递的数据源，将对应的图形添加至对应的航迹图层当中去
                    track.bindLineString(feature3);

                    //如果一开始目标就是隐藏，则轨迹也隐藏
                    var show = track.get("show");
                    if (show === false) {
                        var hjgeom = feature3.getGeometry();
                        feature3.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                    }
                    _self.addHJFeatureByXYMC(queue, feature3);

                } else {
                    var multi = new ol.geom.MultiPoint([coord, coord], "XYZ");
                    var newFeature = new ol.Feature({
                        geometry: multi,
                    });

                    newFeature.setProperties({
                        "ph": ph,
                        "hjtype": "中航迹",
                        "point_count": 500,
                        "size": manager.getdfHJSize(),
                        "dwsx": prop.dwsx,
                        "color": manager.getdfHJColor()
                    });
                    //newFeature.setId("point_" + ph);
                    newFeature.setId(queue + "_" + ph);
                    newFeature.set("status", "online");
                    track.bindMultiPoint(newFeature);

                    //如果一开始目标就是隐藏，则轨迹也隐藏
                    var show = track.get("show");
                    if (show === false) {
                        var hjgeom = newFeature.getGeometry();
                        newFeature.getStyle().getImage().setOpacity(0);
                    }

                    //根据所传递的数据源，将对应的图形添加至对应的航迹图层当中去
                    _self.addHJFeatureByXYMC(queue, newFeature);
                }
            } else {
                if (_hjline.wf.show) {
                    var line = new ol.geom.LineString([coord, coord], "XYZ");
                    var feature3 = new ol.Feature({
                        geometry: line,
                    });
                    feature3.setProperties({
                        "ph": ph,
                        "hjtype": "中航迹",
                        "point_count": 500,
                        "size": manager.getwfHJSize(),
                        "dwsx": prop.dwsx,
                        "color": manager.getwfHJColor()
                    });
                    feature3.setId(queue + "_" + ph);
                    feature3.set("status", "online");
                    track.bindLineString(feature3);

                    //如果一开始目标就是隐藏，则轨迹也隐藏
                    var show = track.get("show");
                    if (show === false) {
                        var hjgeom = feature3.getGeometry();
                        feature3.getStyle().getStroke().setColor("rgba(255,0,0,0)");
                    }
                    //根据所传递的数据源，将对应的图形添加至对应的航迹图层当中去
                    _self.addHJFeatureByXYMC(queue, feature3);

                } else {
                    var multi = new ol.geom.MultiPoint([coord, coord], "XYZ");
                    var newFeature = new ol.Feature({
                        geometry: multi,
                    });

                    newFeature.setProperties({
                        "ph": ph,
                        "hjtype": "中航迹",
                        "point_count": 500,
                        "size": manager.getwfHJSize(),
                        "dwsx": prop.dwsx,
                        "color": manager.getwfHJColor()
                    });
                    newFeature.setId(queue + "_" + ph);
                    newFeature.set("status", "online");
                    track.bindMultiPoint(newFeature);
                    //如果一开始目标就是隐藏，则轨迹也隐藏
                    var show = track.get("show");
                    if (show === false) {
                        var hjgeom = newFeature.getGeometry();
                        newFeature.getStyle().getImage().setOpacity(0);
                    }
                    //根据所传递的数据源，将对应的图形添加至对应的航迹图层当中去
                    _self.addHJFeatureByXYMC(queue, newFeature);

                }

            }
            //添加目标到图层
            manager.mbLayer.getSource().addFeature(track);

        } else { //有图形则更新位置,没有则添加
            if (f) {
                //判断是否有密语
                if (prop.mbmy) {
                    //判断是否是消失报
                    if (prop.mbmy == 403 || prop.mbmy == 404 || prop.mbmy == 1613) {
                        manager.removeXSMB(manager, f);
                        return;
                    }
                }

                //更新位置
                var lonlat = [parseFloat(lon), parseFloat(lat), parseFloat(gd)];
                f.move(lonlat);

                var kh = f.getProperties().jbkh;
                var dh = f.getProperties().jbdh;
                var fid = f.getId();
                var mbfid = queue + "_" + ph;

                //如果目标的图标缩放比例与默认的缩放比例不一致时，使用图标自身的缩放比例
                if (_self.mbScaleInfo.scale != f.getStyle().getImage().getScale()) {
                    scale = f.getStyle().getImage().getScale();
                }

                //如果原来的库号代号和现在的一样则直接设置航向
                if (prop.jbdh === dh && prop.jbkh === kh) {

                    f.getStyle().getImage().setRotation((prop.hx / 180) * Math.PI);

                    var image = new ol.style.Icon( /** @type {olx.style.IconOptions} */({
                        scale: scale,
                        anchor: anchor,
                        src: basePath + '/page/webgis/jb/getJB.do?JBKH=' + prop.jbkh + '&JBDH=' + prop.jbdh + '&CC=' + prop.jbcc + '&JBYS=' + prop.jbys,
                        rotation: (prop.hx / 180) * Math.PI
                    }));
                    f.getStyle().setImage(image);

                    //如果有新的数据来，则解除灰色，恢复原来的显示颜色
                    if (f.get("status") == "gray") {
                        f.set("status", "normal");
                    }
                    //相同的采用旧的
                    mbfid = fid;
                } else {
                    //如果不一样则采用新的图标，这个是为了解决目标类型变化之后，图标也需要跟着变化
                    var image = new ol.style.Icon( /** @type {olx.style.IconOptions} */({
                        scale: scale,
                        anchor: anchor,
                        src: basePath + '/page/webgis/jb/getJB.do?JBKH=' + prop.jbkh + '&JBDH=' + prop.jbdh + '&CC=' + prop.jbcc + '&JBYS=' + prop.jbys,
                        rotation: (prop.hx / 180) * Math.PI
                    }));
                    f.getStyle().setImage(image);
                    //判断是否需要显示
                    var show = f.get("show");
                    if (show) {
                        f.getStyle().getImage().setOpacity(1);
                    } else {
                        f.getStyle().getImage().setOpacity(0);
                    }
                }

                //更新态势树，删除旧的树节点
                _self.removeOldTreeNode(f, prop);

                var queuelayer = manager.getLayerByQueueName(queue);
                var isVisible = queuelayer.getVisible();
                //如果图层是隐藏的，则目标设置成隐藏模式
                if (!isVisible) {
                    f.getStyle().getImage().setOpacity(0);
                    var tag = f.getLinkedTag();
                    // track.set("showTag", false);
                    if (tag) {
                        manager.tagmanager.removeLinkedTag(tag);
                    }
                    var hjFeature = queuelayer.getSource().getFeatureById(queue + "_" + ph);
                    if (hjFeature != null) {
                        var hjgeom = hjFeature.getGeometry();
                        if (prop.dwsx != "我" && prop.dwsx != "友") {
                            if (hjgeom instanceof ol.geom.LineString) {
                                hjFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                            } else {
                                hjFeature.getStyle().getImage().setOpacity(0);
                            }
                        } else {
                            if (hjgeom instanceof ol.geom.LineString) {
                                hjFeature.getStyle().getStroke().setColor("rgba(255,0,0,0)");
                            } else {
                                hjFeature.getStyle().getImage().setOpacity(0);
                            }
                        }
                    }
                } else {
                    var ztree = TSTCXYSettingTree.zTree();
                    var rootnode = ztree.getNodesByParam("dyh", prop.queue, null);
                    var gjs = ztree.getNodesByParam("spname", prop.gjstr, rootnode[0]);
                    if (gjs.length > 0) {
                        var mblxs = ztree.getNodesByParam("spname", prop.mblb, gjs[0]);
                        for (var i = 0; i < mblxs.length; i++) {
                            var mbentity = mblxs[i];
                            if (!mbentity.checked) {
                                f.getStyle().getImage().setOpacity(0);
                                var tag = f.getLinkedTag();
                                f.set("show", false);
                                if (tag) {
                                    manager.tagmanager.removeLinkedTag(tag);
                                }
                                //隐藏目标后，航迹也需要隐藏
                                var hjLayer = manager.getLayerByQueueName(queue);
                                var hjFeature = hjLayer.getSource().getFeatureById(queue + "_" + ph);
                                if (hjFeature != null) {
                                    var hjgeom = hjFeature.getGeometry();
                                    if (prop.dwsx != "我" && prop.dwsx != "友") {
                                        if (hjgeom instanceof ol.geom.LineString) {
                                            hjFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                                        } else {
                                            hjFeature.getStyle().getImage().setOpacity(0);
                                        }

                                    } else {
                                        if (hjgeom instanceof ol.geom.LineString) {
                                            hjFeature.getStyle().getStroke().setColor("rgba(255,0,0,0)");
                                        } else {
                                            hjFeature.getStyle().getImage().setOpacity(0);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                //最后设置新属性
                f.setProperties(prop);
                var level = f.getTagInfoLevel() - 1;
                f.changeTagContent(level);
            }
        }
    });

    var subscribe = {
        name: queue,
        value: sub
    };
    this.subscribes.push(subscribe);
}


/**
 * 更新态势树，删除旧的树节点
 * @param {*} oldFeature 旧的目标对象
 * @param {*} prop 新的属性
 */
SstsWebSocket.prototype.removeOldTreeNode = function (oldFeature, prop) {
    var f = oldFeature;
    var queue = prop.queue;
    var mbfid = queue + "_" + prop.ph;
    var fid = f.getId();
    //更新实时态势树形数据，找到对应的树形节点，删除并且把对应的所有父节点数据减1     
    var ztree = TSTCXYSettingTree.zTree();
    var treenodes = ztree.getNodesByParam("mbfid", mbfid, null);
    var rootnode = ztree.getNodesByParam("dyh", prop.queue, null);

    // if(treenodes.length>1){
    //     console.log(treenodes);
    // }

    //使用旧的国家名称查询
    var gjs = ztree.getNodesByParam("spname", f.getProperties().gjstr, rootnode[0]);
    for (var j = 0; j < treenodes.length; j++) {
        var node = treenodes[j];
        if (node.queue == queue && (gjs[0].spname != prop.gjstr)) { //没找到对应的树形节点，首先删除
            var nodeObj = node;
            //如果一开始是不明，后续正常，则需要将删除的标牌加上
            var tag = f.getLinkedTag();
            if (tag) {

                var hjLayer = manager.getLayerByQueueName(queue);
                if (node.checked) {
                    manager.getTagmanager().addLinkedTag(tag);
                    f.getStyle().getImage().setOpacity(1);
                } else {
                    manager.getTagmanager().removeLinkedTag(tag);
                    f.getStyle().getImage().setOpacity(0);
                    //隐藏目标后，航迹也需要隐藏
                    var hjLayer = manager.getLayerByQueueName(queue);
                    var hjFeature = hjLayer.getSource().getFeatureById(f.getId());
                    if (hjFeature != null) {
                        var hjgeom = hjFeature.getGeometry();
                        if (prop.dwsx != "我" && prop.dwsx != "友") {
                            if (hjgeom instanceof ol.geom.LineString) {
                                hjFeature.getStyle().getStroke().setColor("rgba(0,0,255,0)");
                            } else {
                                hjFeature.getStyle().getImage().setOpacity(0);
                            }

                        } else {
                            if (hjgeom instanceof ol.geom.LineString) {
                                hjFeature.getStyle().getStroke().setColor("rgba(255,0,0,0)");
                            } else {
                                hjFeature.getStyle().getImage().setOpacity(0);
                            }
                        }
                    }
                }

                f.set("show", true);
                manager.showMB(hjLayer, fid);
            }
            //把对应的所有父节点数据减1
            var dyh = TSTCXYSettingTree.zTree().getNodesByParam("dyh", nodeObj.queue, null)[0];
            var param = {gjnm:nodeObj.gjnm,gjstr:nodeObj.gjstr,mblb:nodeObj.mblb,number:-1,dyhName:dyh?dyh.spname.trim():""};
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
            //删除旧的树节点
            TSTCXYSettingTree.zTree().removeNode(node);
        }
    }
}


/**
 * 处理数据
 * @param {Object} data 目标数据源
 */
SstsWebSocket.prototype._convertData = function (data) {
    var mbsx = data.mbSx; //目标属性
    var dwsx = ""; //敌我属性
    var ys = ""; //军标颜色
    var textColor = "blue";
    var obj = {}; //封装对象
    obj.xxyid = data.mbXxyID;
    obj.ph = data.mbPh; //目标批号
    obj.lon = data.mbPos.rpLong; //目标经度
    //初步解决跨时区经纬度问题
    if (obj.lon >= -180 && obj.lon < -27) {
        obj.lon = 180 + (180 + obj.lon);
    }
    obj.lat = data.mbPos.lat; //目标纬度
    obj.time = data.mbPos.time; //发现时间
    if (data.mbGj_str != undefined) {
        if (data.mbGj_str.trim().length === 0) {
            data.mbGj_str = "不明";
        }
    } else {
        data.mbGj_str = "不明";
    }
    obj.gjstr = data.mbGj_str; //国家名称
    switch (mbsx) {
        case 0:
            dwsx = "敌";
            ys = "B";
            textColor = "blue";
            break;
        case 1:
            dwsx = "我";
            ys = "R";
            textColor = "red";
            obj.gjstr = "中国";
            break;
        case 2:
            dwsx = "友";
            ys = "P";
            textColor = "pink";
            break;
        case 3:
            dwsx = "中立";
            ys = "P";
            textColor = "pink";
            break;
        case 4:
            dwsx = "不明";
            ys = "G";
            textColor = "green";
            break;
        default:
            dwsx = "不明";
            ys = "G";
            textColor = "green";
            break;
    }
    obj.dwsx = dwsx; //敌我属性
    obj.jbys = ys; //军标颜色
    obj.jm = data.mb_JM //军民属性
    var hx = data.mbC;

    var jbkh = 32,
        jbdh = 7200;
    if (data.mbBl == 3) {

        obj.mblb = "空中目标";
        obj.jbkh = 32;
        obj.jbdh = 7200;
        if (data.kh != 0) {
            obj.jbkh = data.kh;
        }
        if (data.dh != 0) {
            obj.jbdh = data.dh;
        }
        //民航飞机
        if (data.mb_JM === 1) {
            obj.jbkh = 32;
            obj.jbdh = 7901;
        }


    } else if (data.mbBl == 1 || data.mbBl == 2) {

        obj.mblb = "水面目标";
        obj.jbkh = 32;
        obj.jbdh = 6800;
        if (data.kh != 0) {
            obj.jbkh = data.kh;
        }
        if (data.dh != 0) {
            obj.jbdh = data.dh;
        }
        //特殊处理
        if (data.mbType_str) {
            if (data.mbType_str.indexOf('供水船') > -1) {
                obj.jbkh = 32;
                obj.jbdh = 6800;
            }
            if (data.mbType_str.indexOf('拖船') > -1) {
                obj.jbkh = 32;
                obj.jbdh = 6800;
            }
            if (data.mbType_str.indexOf('工程船') > -1) {
                obj.jbkh = 32;
                obj.jbdh = 6800;
            }
            if (data.mbType_str.indexOf('救生艇') > -1) {
                obj.jbkh = 32;
                obj.jbdh = 6805;
            }
        }
    }
    obj.jbcc = 64;
    obj.jn = data.mbJN;
    obj.sd = JSON.parse(data.ysbw).mbV*3.6;
    obj.gd = data.mbH;
    obj.mbtype = data.mbType;
    obj.mbtypename = data.mbType_str;
    obj.hx = obj.mblb === "空中目标" ? data.mbC : data.mbC + 90;
    if (data.mb_XNo) {
        obj.jxh = data.mb_XNo;
        if (data.mb_XNo.indexOf("直升机") > -1) {
            obj.hx = 0;
        }
        if (data.mb_XNo.indexOf("直-") > -1) {
            obj.hx = 0;
            obj.jbkh = 32;
            obj.jbdh = 8400;
        }
    } else {
        obj.jxh = "";
    }

    if (obj.gd == -999999) {
        obj.gd = 0;
    }

    obj.heading = data.mbC;
    obj.textColor = textColor; //字体颜色

    obj.xh = data.mb_Xh;
    obj.mbmc = data.mbmc;
    obj.mbmy = data.mb_MY;
    obj.xymc = data.xymc;
    obj.mbnm = data.mbnm;
    if (obj.gjstr == "中国") {
        obj.gjnm = "0101";
    } else {
        obj.gjnm = data.gjnm;
    }
    obj.ysbw = data.ysbw;
    obj.da = data.da;
    obj.drawtime = new Date().getTime();
    //console.log(obj);

    return obj;
}

/**
 * 设置所有目标的缩放比例
 * @param {*} scale 
 */
SstsWebSocket.prototype.setAllTrackerScale = function (scale) {
    var manager = this.manager;
    this.mbScaleInfo.scale = scale;
    manager.setAllTrackerScale(scale);
}

/**
 * 设置单个目标的缩放比例
 * @param {*} feature 
 * @param {*} scale 
 */
SstsWebSocket.prototype.setTrackerScale = function (feature, scale) {
    this.manager.setTrackerScale(feature, scale);
}

/**
 * 同步态势联动
 * @param {*} options 
 */
SstsWebSocket.prototype.syncTSLD = function () {
    var _map = this.manager.map;
    var client = this;
    this.sendClient = this._client.subscribe("/exchange/ws.topic/SSTS_TSLD", function (m) {
        var msg = JSON.parse(m.body);
        // console.log(msg);
        var type = msg.type;
        var value = msg.value;
        if (type == '2D') {
            client.tsld.sync = true;
            var view = _map.getView();
            view.setCenter(ol.proj.fromLonLat(value.pt));
            view.setZoom(value.zoom + 2);
            view.setRotation(value.rot || 0);
            client.tsld.sync = false;
        }

    });

    _map.getView().on(['change:resolution', 'change:rotation'], this._syncMQ, this);

    // Synchronize on move / rotate
    _map.on(['pointerdrag', 'rotateend'], this._syncMQ, this);

}

/**
 * 向MQ发送数据
 */
SstsWebSocket.prototype._syncMQ = function () {

    var _map = manager.map;
    var view = _map.getView();
    var ext = ol.proj.transformExtent(view.calculateExtent(), "EPSG:3857", "EPSG:4326");
    var msg = {
        type: "3D",
        value: {
            pt: view.getCenter(),
            zoom: view.getZoom() + 1,
            rot: view.getRotation(),
            extent: ext
        }
    };

    if (!this.tsld.sync) {
        //  console.log(msg);
        // console.log('change:pointerdrag'+'  change:rotateend');
        this.sendMsg(JSON.stringify(msg));
    }
}

/**
 * 停止接收TSLD
 */
SstsWebSocket.prototype.unsubscribeTSLD = function () {
    var _map = this.manager.map;
    _map.getView().un(['change:resolution', 'change:rotation'], this._syncMQ);

    // Synchronize on move / rotate
    _map.un(['pointerdrag', 'rotateend'], this._syncMQ);

    this._client.unsubscribe(this.sendClient.id);
}


/**
 * 发送消息
 * @param {*} 消息内容 
 */
SstsWebSocket.prototype.sendMsg = function (message) {
    this._client.send("/exchange/ws.topic/SSTS_TSLD", null, message);
}

/**
 * 停止接收数据，并清除所有目标和相关数据
 */
SstsWebSocket.prototype.stop = function () {
    this.manager.stopCheck();
    for (var i = 0; i < this.subscribes.length; i++) {
        var q = this.subscribes[i];
        this._client.unsubscribe(q.value.id);
        this.manager.clearQueue(q.name);
    }
    this.subscribes = [];
}

/**
 * 停止接收数据，并清除所有目标和相关数据
 */
SstsWebSocket.prototype.unsubscribe = function (queue) {
    for (var i = 0; i < this.subscribes.length; i++) {
        var q = this.subscribes[i];
        if (q.name === queue) {
            this._client.unsubscribe(q.value.id);
            this.subscribes.remove(q);
            i--;
            // break;
        }
    }
    this.manager.clearQueue(queue);
}

/**
 * 停止接收数据，并清除所有目标和相关数据[清除对应目标，清除对应航迹]
 * @param {*} queue 
 */
SstsWebSocket.prototype.stopreceivemsg = function (queue) {
    for (var i = 0; i < this.subscribes.length; i++) {
        var q = this.subscribes[i];
        if (q.name === queue) {
            this._client.unsubscribe(q.value.id);
            this.subscribes.remove(q);
            i--;
            // break;
        }
    }
    this.manager.clearQueueByXYMC(queue);
}

/**
 * 根据对应的信原名称，添加至对应的航迹图层当中
 * @param {string} queue 信源名称
 * @param {ol.Feature} f 航迹图形
 */
SstsWebSocket.prototype.addHJFeatureByXYMC = function (queue, f) {
    switch (queue) {
        case 'SSTS_RHJG_4':
            var linefid = f.getId();
            var oldf = manager.rhjghjLayer.getSource().getFeatureById(linefid);
            if (!oldf) {
                manager.rhjghjLayer.getSource().addFeature(f);
            }
            break;
        case 'SSTS_LHHQ_1':
            manager.lhhqhjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_LHKQ_3':
            manager.lhkqhjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_JZTS_2':
            manager.jztshjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_DZTS_5':
            manager.dztshjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_LHKQ_NBZQ_7':
            manager.nbzqhjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_HZTS_10':
            manager.hztshjLayer.getSource().addFeature(f);
            break;
        case 'SSTS_TSKB_11':
            manager.tskbLayer.getSource().addFeature(f);
            break;
        default:
            break;
    }

}