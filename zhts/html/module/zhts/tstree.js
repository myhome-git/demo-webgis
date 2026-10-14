
/**
 * 初始化态势图层树
 */

var TSTCTree = function (map) {
   this._init(map);
}

/**
 * 内部初始化
 * @param {*} map 
 */
TSTCTree.prototype._init = function(map){
    var tagmanager = new TagManager({
        map: map
    });
    var manager = new ZhtsManager({
        map: map
    });
    manager.setTagmanager(tagmanager);
    socket = new SstsWebSocket(CONFIG.MQSOCKET, "/zhts", "zhts", "123456@zhts.com", manager);

    //初始化态势图层树根节点数据
    var TSTCXYSettingTree = new newTree({
        id: 'xymctree',
        setting: {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                },
                keep:{
                    parent:true
                }
            },
            view: {
                expandSpeed: ""
            }
        }
    });

    this.zhtsmanager = manager;
    this.socket = socket;
    this.TSTCXYSettingTree = TSTCXYSettingTree;

    $.ajax({
        type: "GET",
        dataType: "json",
        url: basePath + "/page/ssts/callTC.do",
        success: function (data) {
            //console.log(data);
            var node = [];
            //获取综合态势接收设置配置参数对象
            var tstcsettingObj = ZHTSCONFIG.gettstcsettingObj();

            for (var i = 0; i < data.sststs.length; i++) {
                var tcmc = data.sststs[i].tcmc;
                for (var j = 0; j < tstcsettingObj.length; j++) {
                    if (tstcsettingObj[j].name == tcmc && tstcsettingObj[j].show == true) {
                        if (tcmc == "融合结果") {
                            node.push({
                                // name: data.sststs[i].tcmc,
                                // spname: data.sststs[i].tcmc,
                                name: "态势目标列表",
                                spname: "态势目标列表",
                                snum: 0,
                                dyh: data.sststs[i].dyh,
                                isParent: true,
                                othernum: 0,
                                // doCheck: data.sststs[i].dyh == "SSTS_RHJG_4" ? true : false,
                                // checked: data.sststs[i].dyh == "SSTS_RHJG_4" ? true : false
                                doCheck: true,
                                checked: false
                            });
                        } else {

                            if (tcmc == "态势快报" || tcmc == "联合空情_南部战区") {
                                continue;
                            }

                            node.push({
                                name: data.sststs[i].tcmc,
                                spname: data.sststs[i].tcmc,
                                snum: 0,
                                dyh: data.sststs[i].dyh,
                                isParent: true,
                                othernum: 0,
                                doCheck: true,
                                checked: false
                            });
                        }
                    }
                }
            }
            TSTCXYSettingTree.addNodes(null, node, true);
            //修改默认展开层
            var rootnode = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
            TSTCXYSettingTree.zTree().expandNode(rootnode, true, false);

        },
        error: function (data) {
            console.log(data);
        }
    });


    var checkNodes = function (o) {
        var node = o.t;
        //console.log(node);

        //进行图层显示隐藏
        if (node.name == "态势快报") { //不做处理
            return;
        } else {
            //信源进行图层显示隐藏
            if (node.level == 0) {
                //manager.getLayerByQueueName(node.dyh).setVisible(node.checked);
                manager.showTagByQueue(node.dyh, node.checked);

                var source = manager.mbLayer.getSource();
                var trackers = source.getFeatures();
                //如果之前有隐藏的目标航迹，则图层显示后也需要将之前隐藏的目标航迹显示出来
                if (node.checked) {
                    for (var i = 0; i < trackers.length; i++) {
                        var tracker = trackers[i];
                        var prop = tracker.getProperties();
                        tracker.set("show", true);
                        //显示目标后，目标航迹也要显示出来
                        var fid = prop.queue + "_" + prop.ph;
                        if (node.dyh == prop.queue) {
                            var hjLayer = manager.getLayerByQueueName(prop.queue);
                            var hjFeature = hjLayer.getSource().getFeatureById(fid);

                            //加载目标、对应航线、颜色
                            manager.showMB(hjLayer, fid);
                        }
                    }
                } else {
                    for (var i = 0; i < trackers.length; i++) {
                        var tracker = trackers[i];
                        var prop = tracker.getProperties();
                        tracker.set("show", false);
                        //隐藏目标后，目标航迹也要隐藏出来
                        var fid = prop.queue + "_" + prop.ph;
                        if (node.dyh == prop.queue) {
                            var hjLayer = manager.getLayerByQueueName(prop.queue);
                            var hjFeature = hjLayer.getSource().getFeatureById(fid);

                            //隐藏目标、对应航线、颜色
                            manager.hideMB(hjLayer, fid);
                        }
                    }
                }
            } else {
                var source = manager.mbLayer.getSource();
                var ztree = TSTCXYSettingTree.zTree();
                if (node.isParent) { //选中父节点的时候
                    var nodes = ztree.getNodesByFilter(function (node) {
                        return node.isParent == undefined;
                    }, false, node);
                    for (var i = 0; i < nodes.length; i++) {
                        var mb = nodes[i];
                        var fid = mb.queue + "_" + mb.ph;
                        var tracker = source.getFeatureById(fid);
                        if (tracker == null) {
                            let nodeObj = mb;
                            //把对应的所有父节点数据减1
                            //number 正数代表加，负数代表减。 代表后续操作是加1 还是减1
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
                            ztree.removeNode(mb);
                            continue;
                        }
                        //设置目标透明度，隐藏标牌
                        if (!mb.checked) {
                            tracker.getStyle().getImage().setOpacity(0);
                            var tag = tracker.getLinkedTag();
                            tracker.set("show", false);
                            if (tag) {
                                manager.tagmanager.removeLinkedTag(tag);
                            }
                            //隐藏目标后，航迹也需要隐藏
                            var prop = tracker.getProperties();
                            var hjLayer = manager.getLayerByQueueName(mb.queue);
                            //hjLayer.setVisible(mb.checked)
                            var hjFeature = hjLayer.getSource().getFeatureById(fid);

                            //隐藏目标、对应航线、颜色
                            manager.hideMB(hjLayer, fid);
                        } else {
                            tracker.getStyle().getImage().setOpacity(1);
                            var tag = tracker.getLinkedTag();
                            tracker.set("show", true);
                            manager.getTagmanager().addLinkedTag(tag);

                            //显示目标后，目标航迹也要显示出来
                            var prop = tracker.getProperties();
                            var hjLayer = manager.getLayerByQueueName(mb.queue);
                            //hjLayer.setVisible(mb.checked)
                            var hjFeature = hjLayer.getSource().getFeatureById(fid);

                            //加载目标、对应航线、颜色
                            manager.showMB(hjLayer, fid);
                        }
                    }
                } else { //选中子节点的时候
                    var mb = node;
                    var fid = mb.queue + "_" + mb.ph;
                    var tracker = source.getFeatureById(fid);
                    if (tracker == null) {
                        let nodeObj = mb;
                        //number 正数代表加，负数代表减。 代表后续操作是加1 还是减1
                        var dyh = TSTCXYSettingTree.zTree().getNodesByParam("dyh", nodeObj.queue, null)[0];
                        var param = {gjnm:nodeObj.gjnm,gjstr:nodeObj.gjstr,mblb:nodeObj.mblb,number:-1,dyhName:dyh?dyh.spname.trim():""};
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
                        ztree.removeNode(mb);
                        return;
                    }
                    //设置目标透明度，隐藏标牌
                    if (!mb.checked) {
                        tracker.getStyle().getImage().setOpacity(0);
                        var tag = tracker.getLinkedTag();
                        tracker.set("show", false);
                        if (tag) {
                            manager.tagmanager.removeLinkedTag(tag);
                        }
                        //隐藏目标后，航迹也需要隐藏
                        var prop = tracker.getProperties();
                        var hjLayer = manager.getLayerByQueueName(mb.queue);
                        //hjLayer.setVisible(mb.checked)
                        var hjFeature = hjLayer.getSource().getFeatureById(fid);

                        //隐藏目标、对应航线、颜色
                        manager.hideMB(hjLayer, fid);

                    } else {
                        tracker.getStyle().getImage().setOpacity(1);
                        var tag = tracker.getLinkedTag();
                        tracker.set("show", true);
                        manager.getTagmanager().addLinkedTag(tag);
                        //显示目标后，目标航迹也要显示出来
                        var prop = tracker.getProperties();
                        var hjLayer = manager.getLayerByQueueName(mb.queue);
                        //hjLayer.setVisible(mb.checked)
                        var hjFeature = hjLayer.getSource().getFeatureById(fid);

                        //加载目标、对应航线、颜色
                        manager.showMB(hjLayer, fid);
                    }
                }
            }
        }
    }

    //树形节点选中和取消选中
    TSTCXYSettingTree.check(checkNodes);

    //如果还未接收数据，则在选择节点的时候提示需要先接收数据
    TSTCXYSettingTree.ischeck(function (o) {
        //获取所有选中队列数组
        var checkedQueueArr = manager.getCheckedQueue();
        var node = o.t;
        //进行图层显示隐藏
        if (node.name == "态势快报" || node.name == "联合空情_南部战区") { //不做处理
            return;
        } else { //进行图层显示隐藏
            if (node.level == 0) {
                if (!node.doCheck) {
                    xLayerMessage("请先在图层设置中打开【" + node.name + "】的接收设置!");
                }
            }
        }

    })

    //获取对应目标图层的要素，获取最新坐标，然后定位
    TSTCXYSettingTree.dblclick(function (o) {
        var node = o.t;
        if (!node) {
            return;
        }
        var tracks = manager.mbLayer.getSource().getFeatures();
        for (var i = 0; i < tracks.length; i++) {
            var mb = tracks[i];
            var prop = mb.getProperties();
            if (prop) {
                var queue = prop.queue;
                var ph = prop.ph;
                var lon = prop.lon;
                var lat = prop.lat;
                if (queue === node.queue && ph === node.ph) {
                    //定位到指定目标要素
                    var prjCoor = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
                    BIGMap.flyTo(prjCoor, 2000, 1, function (complete) { });
                    break;
                }
            }
        }
    })

}

//添加树形节点
TSTCTree.prototype.addDataToTree = function(o) {
    var _self = this;
    var TSTCXYSettingTree = this.TSTCXYSettingTree;
    var gjstr = o.gjstr;
    var ztree = TSTCXYSettingTree.zTree();
    var nodes = ztree.getNodesByParam("dyh", o.queue, null);
    var dyh = nodes[0];
    var gjs = ztree.getNodesByParam("spname", o.gjstr, dyh);
    var gj = gjs.length > 0 ? gjs[0] : _self.addNode({
        node: {
            name: o.gjstr,
            spname: o.gjstr,
            snum: 0,
            othernum: 0,
            tp: o.gjstr == "台湾" || o.gjstr == "澳门" || o.gjstr == "香港" ? undefined : o.gjnm,
            //nocheck: true
            checked: o.gjstr == '不明' ? false : dyh.checked,
            nocheck: false
        },
        pn: nodes[0]
    });
    var mblxs = ztree.getNodesByParam("spname", o.mblb, gj);
    var mblx = mblxs.length > 0 ? mblxs[0] : _self.addNode({
        node: {
            name: o.mblb,
            spname: o.mblb,
            snum: 0,
            othernum: 0,
            tp: o.mblb == "空中目标" ? "plane" : "boat",
            //nocheck: true
            checked: gj.checked,
            nocheck: false
        },
        pn: gj
    });
    o.name = o.mbmc == undefined ? o.ph : o.mbmc + "-" + o.ph;
    o.spname = o.mbmc == undefined ? o.ph : o.mbmc + "-" + o.ph;
    o.snum = 0;
    o.nocheck = false;
    o.mbfid = o.queue + "_" + o.ph; //目标唯一ID，用于存储唯一标识
    o.checked = mblx.checked;
    o.tp = o.mblb == "空中目标" ? "plane" : "boat";
    var callback = undefined;
    var ndarr = ztree.getNodesByParam("mbfid", o.mbfid, mblx);
    if (o.spname == "不明") {
        o.checked = false;
    }
    if (ndarr.length == 0) {
        callback = _self.changeNodeCount;
        var objtemp = $.extend(true, {}, o);
        delete objtemp["geometry"];
        TSTCXYSettingTree.addNodes(mblx, [objtemp], true, callback);
    } else {
        ndarr[0].name = o.mbmc == undefined ? o.ph : o.mbmc + "-" + o.ph;
        ndarr[0].spname = o.mbmc == undefined ? o.ph : o.mbmc + "-" + o.ph;
        ztree.updateNode(ndarr[0]);
    }

}

/**
 * 改变节点统计数
 * @param {*} node 
 * @param {*} zTree 
 */
TSTCTree.prototype.changeNodeCount = function(node, zTree) {

    //number 正数代表加，负数代表减。 代表后续操作是加1 还是减1
    var dyh = TSTCXYSettingTree.zTree().getNodesByParam("dyh", node.queue, null)[0];
    var param = {gjnm:node.gjnm,gjstr:node.gjstr,mblb:node.mblb,number:1,dyhName:dyh?dyh.spname.trim():""};
    while ((node = node.getParentNode()) != null) {
        node.othernum = node.othernum + 1;
        node.name = node.spname + "  (" + node.othernum + ")";
        zTree.updateNode(node);
    }
    //统计图表中的数量也加1
    afterNodeCountChange(param);
}

/**
 * 添加节点
 * @param {*} o 
 */
TSTCTree.prototype.addNode = function(o) {
    var TSTCXYSettingTree = this.TSTCXYSettingTree;
    var n = TSTCXYSettingTree.zTree().getNodeByParam("name", o.node.spname, o.pn);
    if (n) {
        return n;
    } else {
        if (o.node.tp) {
            o.node.icon = "../resouces/country/24/" + o.node.tp + ".png";
            o.node.iconSkin = " nodeicon ";
        }
        return TSTCXYSettingTree.zTree().addNodes(o.pn, [o.node], true)[0];
    }
}

/**
 * 获取zhts管理器
 */
TSTCTree.prototype.getZhtsManager = function () {
    return this.zhtsmanager;
}

/**
 * 获取websocket 连接对象
 */
TSTCTree.prototype.getSocket = function () {
    return this.socket;
}

/**
 * 获取态势图层设置树
 */
TSTCTree.prototype.getTSTCSettingTree = function () {
    return this.TSTCXYSettingTree;
}