/*事件 start*/
//显示态势树
function showZHTSUI(id) {
    $('#' + id).window({
        iconCls: 'icon-wjx',
        minimizable: false,
        maximizable: false,
        collapsible: true,
        title: "态势监视与回放",
        closed: false,
        left: 115,
        top: 80,
        height: 600,
        onClose: function () {
            // wbskt['zhts'].close();
            // //wbskt['tsjs'].close();
            // zhts.clear();
            // //zhtsjs.stop();
            // clearZhtshf();

            //关闭对应弹出框
            $("#tsjs_gaojing_window").window();
            $("#tsjs_gaojing_window").window('close');
            $("#tsjs_config_window").window();
            $("#tsjs_config_window").window('close');
            $("#hjconfigDiv").window();
            $("#hjconfigDiv").window('close');
        },
        onOpen: function () {
            //ZHTSTSHFTree.initTree();
            // ZHTSXSTJTree.initTree();
            // if(wbskt['zhts']){
            //     wbskt['zhts'].connect();
            // }else{
            //     initZHTSHF();
            // }
        }
    });
}

//打开态势监视Tab页态势分层配置window
function showTSJSConfigWindow(id) {
    //关闭态势分层window
    $("#tsjs_gaojing_window").window();
    $("#tsjs_gaojing_window").window('close');
    var _f = $("#zhts_tsjs_window").parent();

    $('#' + id).window({
        iconCls: 'icon-wjx',
        minimizable: false,
        maximizable: false,
        collapsible: true,
        title: "态势显隐设置",
        closed: false,
        left: _f.offset().left + _f.outerWidth() + 2,
        top: _f.offset().top,
        width: 420,
        height: 220,
        onClose: function () { },
        onOpen: function () { }
    });
}

//打开态势监视Tab页态势分层配置window
function showTSHJWindow(id) {
    //关闭态势分层window
    $(id).window();
    $(id).window('close');
    $(id).window({
        iconCls: 'icon-wjx',
        minimizable: false,
        maximizable: false,
        collapsible: true,
        title: "态势航迹设置",
        closed: false,
        left: 480,
        top: 80,
        width: 290,
        height: 250,
        onClose: function () { },
        onOpen: function () { }
    });
}

//态势更新定时删除其中不动的模型,每两分钟查询删除一次
function removeModelInterval() {
    return setInterval(function () {
        var layers = layerManagerView_zhts._collection.get(ViewType.MODEL);
        var nowtime = new Date().getTime();
        var leadingTime = zhts_mbts_managerView.modelSettings.zhts_mbts_clear_model_undate_interval;
        layers.forEach(function (item, key) {
            item.collection.forEach(function (it, key) {
                let timeInterval = nowtime - it.lastUpdateTime;
                //超过5分钟遍历一次，删除已丢失跟踪的模型
                if (timeInterval > leadingTime) {
                    item.remove(it.id);
                    // model = layerManagerView.getLayerObj(ViewType.MODEL,"status_layer_id",key);
                    // model.remove();
                    // modelLoadedList.delete(key);
                }
            });
            // let timeInterval = nowtime - item.lastUpdateTime;
            // //超过5分钟遍历一次，删除已丢失跟踪的模型
            // if(timeInterval>300000){
            //     model = layerManagerView.getLayerObj(ViewType.MODEL,"status_layer_id",key);
            //     model.remove();
            //     modelLoadedList.delete(key);
            // }
        });
        zhts_model_count = zhts_mbts_managerView.getSize();
        zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
    }, zhts_mbts_manager_model_options.zhts_mbts_clear_model_undate_interval);
}

// 显示态势框的窗口
function showZHTSWindow(_id, _fnc) {
    showZHTS = !showZHTS;
    //显示态势树
    showZHTSUI("zhts_tsjs_window");
    //初始化态势树manager
    if (!statusManager) {
        statusManager = new statusTreeManager("zhts_tsjs_tree", cc_socket);
        if (_fnc instanceof Function) {
            _fnc();
        }

    }
}

// 开始接收态势数据checkBox的checked事件
function checkedTsStatusBox(e) {
    receivedSocketData = e.checked;
    //获取树上已经选中的节点
    statusManager.queueList = statusManager.checkedPNodes();
    if (receivedSocketData) {
        zhts_model_ele.style.display = "";
        zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
        statusManager.queueList.forEach(function (item) {
            var layer = statusManager.layerManager.getLayer(ViewType.MODEL, item);
            if (!layer)
                return;
            statusManager.socket.startReceive(item, showZHTSCallback, layer);
        });
        ts_removeManager = removeModelInterval();
    } else {
        zhts_model_ele.style.display = "none";
        zhts_model_count = 0;
        zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
        statusManager.queueList.forEach(function (queue) {
            statusManager.socket.unsubscribe(queue);
            //删除场景中模型，modelLoadedList中存放id与对象值
            var layer = statusManager.layerManager.getLayer(ViewType.MODEL, queue);
            if (!layer)
                return;
            layer.removeAll();
            // removeQueueModel(queue);
        });
        clearInterval(ts_removeManager); //删除 定时删除超时事件
    }
}

//单击跟随
function checkedTsStatusBoxClickTrack(e) {
    rightClickTrack = e.checked;
    if (rightClickTrack) {
        $("#zhts_ksjs_zoomto").removeAttr("disabled", "disabled");
    } else {
        $("#zhts_ksjs_zoomto").attr("disabled", "disabled");
        viewer.trackedEntity = null;
        layerManagerView_zhts._trackElement = null;
    }
}

function registerTSParamEvent(form) {
    form.on("checkbox", function (e) {
        zhts_mbts_mbxy_event.setSocketV(e.elem);
    })

    // 设置标牌显隐
    form.on("radio", function (e) {
        console.log(e.elem);
        var etarget = $(e.elem);
        var name = etarget.prop("name");
        var value = e.elem.value;
        switch (name) {
            case "label_show":
                var bshow = e.elem.id == "label_hide" ? false : true;
                zhts_mbts_mbxy_event.showTag(bshow);
                break;
            // 敌方航迹类别
            case "df_hjlb":
                zhts_mbts_mbhj_event.updateHJType(value, 1);
                break;
            case "wf_hjlb":
                zhts_mbts_mbhj_event.updateHJType(value, 0);
                break;
            case "df_hjtype":
                zhts_mbts_mbhj_event.checkHJLength(value, 1);
                break;
            case "wf_hjtype":
                zhts_mbts_mbhj_event.checkHJLength(value, 0);
                break;
            case "df_hjcolor":
                zhts_mbts_mbhj_event.updateHJColor(this.value, 1);
                break;
            case "wf_hjcolor":
                zhts_mbts_mbhj_event.updateHJColor(this.value, 0);
                break;
            case "df_zhtype":
                zhts_mbts_mbhj_event.updateLabelFont(this.value, 1);
                break;
            case "wf_zhtype":
                zhts_mbts_mbhj_event.updateLabelFont(this.value, 0);
                break;



            //空间目标按国家 类型排序选择  wlt 20190528
            case "label_kjmb_all_gjdq":
                allKjmbTree(value);
                break;



        }
    });
};

//单击飞往
function checkedTsStatusBoxClickFlyTo(e) {
    //viewer.scene.trackedEntityZoomTo = e.checked; 
}

//态势窗口的显隐事件的 参数设置事件
var zhts_mbts_mbxy_event = (function () {
    return {
        setSocketV: function (o) {
            var prop = $(o).data();
            var type = prop.type;
            var classify = prop.ckvalue;
            var v = $(o).prop("checked");
            var setting = zhts_mbts_managerView.receiveFilterSetting;
            setting[classify][type] = v ? true : false;

            //敌我
            if (type === 'enemy' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["dwsx", "敌"]
                ]);
            }
            if (type === 'our' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["dwsx", "我"]
                ]);
            }

            //陆海空
            if (type === 'ldmb' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mblb", "陆地目标"]
                ]);
            }
            if (type === 'kzmb' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mblb", "空中目标"]
                ]);
            }
            if (type === 'smmb' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mblb", "水面目标"]
                ]);
            }

            //清除舰机
            if (classify === "mblb" && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mbtypename", prop.mbname]
                ]);
            }

            //军用
            if (type === 'jy' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mb_JM", 0]
                ]);
            }

            //民用
            if (type === 'my' && !v) {
                zhts_mbts_managerView.removePartView([
                    ["mb_JM", 1]
                ]);
            }

            //计算目标个数
            if (!v) {
                zhts_model_count = zhts_mbts_managerView.getSize();
                zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
            }
        },
        showTag: function (visible) {
            zhts_mbts_managerView.configs.ts.labelShow = visible;
            zhts_mbts_managerView.setLabelShow(visible);
        }
    }
})();

//航迹显示设置的事件

var zhts_mbts_mbhj_event = (function () {
    return {
        getType: function (type) { },
        checkHJLength: function (value, type) {
            var count; //点数
            var text;
            switch (value) {
                case "全航迹":
                    count = "99999";
                    text = "全航迹";
                    break
                case "中航迹":
                    count = 50;
                    text = "50点";
                    break
                case "短航迹":
                    count = 10;
                    text = "10点";
                    break
                default:
                    count = 99999;
                    text = "全航迹";
                    break;
            }
            if (type == 1) {
                configs.ts.path_threshold.df = count;
                $("#point_df_countInpt").get(0).value = text;
            } else {
                configs.ts.path_threshold.wf = count;
                $("#point_wf_countInpt").get(0).value = text;
            }
            zhts_mbts_managerView.setHJTime(count, type);
        },
        updateLabelFont: function (value, type) {
            var fontSize = 20;
            switch (value) {
                case "初":
                    fontSize = 40;
                    break
                case "大":
                    fontSize = 30;
                    break
                case "中":
                    fontSize = 20;
                    break
                case "小":
                    fontSize = 10;
                    break
                default:
                    break;
            }
            var font = `${fontSize}px sans-serif`;
            if (type == 1)
                zhts_mbts_managerView.modelSettings.zhts_mbts_model_df_font = font;
            else
                zhts_mbts_managerView.modelSettings.zhts_mbts_model_wf_font = font;

            zhts_mbts_managerView.setLabelFont(font, type);
        },
        updateHJColor: function (value, type, etarget) {
            var color = value;
            switch (value) {
                case "orange":
                    color = BeyonMap.Color.ORANGE;
                    break
                case "blue":
                    color = BeyonMap.Color.BLUE;
                    break
                case "green":
                    color = BeyonMap.Color.GREEN;
                    break
                case "red":
                    color = BeyonMap.Color.RED;
                    break;
                case "black":
                    color = BeyonMap.Color.BLACK;
                    break;
                case "purple":
                    color = BeyonMap.Color.PURPLE;
                    break
                default:
                    break;
            }
            var dwsx = type == 0 ? "wf" : "df";
            var pathType = configs.ts.path_type[dwsx];
            if (pathType == 0) {
                configs.ts.path_color.point[dwsx] = color;
            } else if (pathType == 1) {
                configs.ts.path_color.line[dwsx] = color;
            } else if (pathType == 2) {
                configs.ts.path_color.point[dwsx] = color;
                configs.ts.path_color.line[dwsx] = color;
            }

            zhts_mbts_managerView.setHJColor(color, type);
        },
        updateHJWidth: function (value, type) {
            var width = value;
            var dwsx = type == 0 ? "wf" : "df";
            var pathType = configs.ts.path_type[dwsx];
            if (pathType == 0) {
                configs.ts.path_width.point[dwsx] = width;
            } else if (pathType == 1) {
                configs.ts.path_width.line[dwsx] = width;
            } else if (pathType == 2) {
                configs.ts.path_width.point[dwsx] = width;
                configs.ts.path_width.line[dwsx] = width;
            }

            zhts_mbts_managerView.setHJWidth(width, type);
        },
        updateHJType: function (value, type) {
            var path_type = parseInt(value);
            var dwsx = type == 0 ? "wf" : "df";
            configs.ts.path_type[dwsx] = path_type;
            zhts_mbts_managerView.setHJType(path_type, type);
        }
    }
})();

/* 事件End */

/* 方法start */

//获取对应类型的信息对应得模型
function getURL(name, mblb, dwsx) {
    return new Promise(function (resolve, reject) {
        var urlSetting = directoryHelper.getURLFromDirectory(mblb, name, dwsx);
        if (urlSetting) {
            resolve(urlSetting);
        } else {
            $.ajax({
                url: "",
                dataType: "json",
                data: {
                    name: name,
                    mblb: mblb
                },
                success: function (data) {
                    var modelSetting = new modelSettings(data["detialurl"], data["headingX"], data["type"], data["headingD"]);
                    modelSetting.url = data["url"];
                    resolve(modelSetting);
                },
                error: function (error) {
                    reject(error);
                }
            });
        }
    });
}



//添加模型或者跳转模型点
//不同图层下有相同批号，如果直接用批号ID，会造成添加不上

function showZHTSCallback(prop, layer) {
    if (!layer)
        return;
    var id = layer.id + prop.ph;
    var name = prop.gjstr;
    //注释1，此处写死，test_name 原本应该是对应  模型的唯一标志，例如尼米兹级航母，虽然有N多个XXX号尼米兹级航母，但是对应的只有一个尼米兹级航母模型。
    //本应改从推送的数据中获取，但是目前只有目标内码，无法确定模型。
    //名称对应的模型路径本也应去数据库中查询，但是现在，写在配置文件3d/App/js/directory.js中
    var test_name = "test_ship";
    //注释结束
    var mblb = transformObjectType.get(prop.mblb);

    //判断是否添加
    if (layer.has(id)) {
        //跳点
        model = layer.getElement(id);
        // var heading = prop.hx > 180?prop.hx - 360:prop.hx;
        var heading = prop.hx;
        model.pose = {
            heading: heading
        };
        position = {
            lon: prop.lon,
            lat: prop.lat,
            alt: prop.gd
        };
        var timeCur = viewer.beyonmapWidget.clock.currentTime;
        // model.setTimePosition(timeCur, position);
        model.addPosition(position);
        model.lastUpdateTime = new Date().getTime(); //时间用当前系统时间
        //更新标牌,只需要更新属性即可
        model.prop = prop;
        viewer.scene.refreshAlways = true;
        return;
    } else if (layer.LoadingList.has(id)) {
        //如果正在添加对象，则把当前对象的位置添加到列表中，存所有的位置信息，用于跳点使用
        var position = {
            lon: prop.lon,
            lat: prop.lat,
            alt: prop.gd
        };
        var ps = layer.ModelPosition.get(id);
        //如果正在加载列表中存在目前模型的id标识，那么目前先不加载等待加载完成后更新坐标和位置。
        if (ps) {
            ps.push(position);
        } else
            layer.ModelPosition.set(id, [position]);
        return;
    } else {
        layer.LoadingList.set(id, prop);
    }

    var ts_config = zhts_mbts_managerView.configs;

    var promise = getURL(test_name, mblb, prop.dwsx);
    promise.then(function (modelSetting) {
        var url = modelSetting.url;

        var detialurl = modelSetting.detialurl;
        var type = modelSetting.type;
        var headingX = modelSetting.headingX;
        var headingD = modelSetting.headingD;

        var propIn = prop;
        var id = layer.id + propIn.ph;
        // var entityOptions = getEntityOptions(propIn);此处迁移到beyonModel中去，作为beyonModel中entity的一种属性处理；
        //创建path
        var dwType = prop.dwsx == "敌" ? "df" : "wf";
        var pathOptions = {
            show: ts_config.ts.showPath,
            lineColor: ts_config.ts.path_color.line[dwType],
            pointColor: ts_config.ts.path_color.point[dwType],
            lineWidth: ts_config.ts.path_width.line[dwType],
            pointPixel: ts_config.ts.path_width.point[dwType],
            path_threshold: ts_config.ts.path_threshold[dwType],
            pathType: ts_config.ts.path_type[dwType],
        }

        var modelOps = {
            // type: parseInt(ModelType.MODEL),
            type: parseInt(ModelType.ENTITY),
            id: id,
            layerId: layer.id,
            url: url,
            headingD: headingD,
            headingX: headingX,
            pose: {
                heading: prop.hx,
                pitch: 0,
                roll: 0
            },
            detialurl: detialurl,
            minimumPixelSize: zhts_mbts_min_pixel, //在config.js中配置       
            position: {
                lon: propIn.lon,
                lat: propIn.lat,
                alt: propIn.gd
            },
            // tilesetUrl:tilesetUrl,
            name: prop.name,
            show: layer.show, //根据模型的图层的显隐性来控制添加图层中模型的显隐
            // entity:entityOptions,
            pathOptions: pathOptions, //路径
            prop: prop,
            parent: layer,
        }

        var model = layer.addModel(modelOps);
        if (layer.ModelPosition.has(id)) {
            var positionArray = layer.ModelPosition.get(id);
            for (var i = 0; i < positionArray.length; i++) {
                model.pose = positionArray[i];
            }
        }
        model.lastUpdateTime = new Date().getTime();
        layer.ModelPosition.delete(id);
        layer.LoadingList.delete(id);
        zhts_model_count++;
        zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
    });
    viewer.scene.refreshAlways = true;
}
var colorBackGround = new BeyonMap.Color.fromBytes(35, 52, 74, 80);
var borderColor = new BeyonMap.Color.fromCssColorString("#95b8e7");
var padding = new BeyonMap.Cartesian2(0, -20);
var scaleByDistance = new BeyonMap.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.3)

//转换属性到模型的标牌label--应该是不是加载模型的时候去使用，因为要求加载的初始化时要用label色块
function getEntityOptions(prop) {
    var entityOptions;
    if (prop.dwsx == "敌") {
        entityOptions = {
            label: {
                text: getInfoBox(prop),
                font: zhts_mbts_managerView.modelSettings.zhts_mbts_model_df_font,
                fillColor: BeyonMap.Color.BLUE,
                outlineWidth: 1,
                outlineColor: borderColor,
                // showBackground:true,
                pixelOffset: padding,
                show: false,
                // backgroundColor : colorBackGround,
                scaleByDistance: scaleByDistance,
                verticalOrigin: BeyonMap.VerticalOrigin.BOTTOM,
                horizontalOrigin: BeyonMap.HorizontalOrigin.LEFT
            }
        }
    } else {
        entityOptions = {
            label: {
                text: getInfoBox(prop),
                font: zhts_mbts_managerView.modelSettings.zhts_mbts_model_wf_font,
                fillColor: BeyonMap.Color.RED,
                outlineWidth: 1,
                outlineColor: borderColor,
                pixelOffset: padding,
                show: false,
                // showBackground:true,
                // backgroundColor :colorBackGround,
                scaleByDistance: scaleByDistance,
                verticalOrigin: BeyonMap.VerticalOrigin.BOTTOM,
                horizontalOrigin: BeyonMap.HorizontalOrigin.LEFT
            }
        }
    }
    return entityOptions;
}
// 'zhts_tsjs_tree'
function statusTreeManager(id, socketCtl) {
    this.socket = socketCtl;
    this.checkedList = new Set();
    var o = this;
    // layerManagerView_zhts = BeyonMap.defaultValue(layerManagerView_zhts,new LayerManagerView());
    this.layerManager = layerManagerView_zhts;
    this.addHoverDom = function (treeId, treeNode) {
        var sObj = $("#" + treeNode.tId + "_span");
        var obj = $("#zhts_tree_check_showLayer_" + treeNode.mbnm);
        if (obj.length > 0)
            return;
        var checked = treeNode.isShowLayer ? "checked='true'" : "";
        var addStr = "<input type='checkbox' class='' id='zhts_tree_check_showLayer_" + treeNode.mbnm +
            "' title='显隐图层' onfocus='this.blur();' " + checked + "></input>";
        sObj.after(addStr);
        obj = $("#zhts_tree_check_showLayer_" + treeNode.mbnm);
        obj.bind("click", function (e) {
            var checked = e.target.checked;
            //e.target.checked = checked;
            zhts_mbts_managerView.setLayerShow(treeNode.mbnm, checked);
            treeNode.isShowLayer = checked;
        });

    }

    this.removeHoverDom = function (treeId, treeNode) {
        $("#zhts_tree_check_showLayer_" + treeNode.mbnm).unbind().remove();
    }
    //控制节点显影
    function showNode(treeNode, bShow) {
        var children = treeNode.children;
        if (!children) {
            var layerId = treeNode.layerId, objectId = treeNode.objectId;
            o.layerManager.showLayerObj(bShow, ViewType.MODEL, layerId, objectId);
        } else {
            for (let index = 0; index < children.length; index++) {
                const cn = children[index];
                showNode(cn, bShow);
            }
        }
    }
    var setting = {
        id: id,
        view: {
            addHoverDom: this.addHoverDom,
            removeHoverDom: this.removeHoverDom
        },
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: function (event, treeId, treeNode) {
                //判断当前监听的队列
                if (treeNode.level == "0") {
                    var checked = treeNode.checked;
                    var mbnm = treeNode.mbnm;
                    if (!receivedSocketData)
                        return;
                    if (checked) {
                        o.tree.checkedPNodes.add(mbnm);
                        var layer = o.layerManager.getLayer(ViewType.MODEL, mbnm);
                        if (!layer)
                            return;
                        o.socket.startReceive(mbnm, showZHTSCallback, layer);
                    } else {
                        o.tree.checkedPNodes.delete(mbnm);
                        o.socket.unsubscribe(mbnm);
                        // removeQueueModel(mbnm);
                        var layer = o.layerManager.getLayer(ViewType.MODEL, mbnm);
                        var allCount = layer.size();
                        zhts_model_count = zhts_model_count - allCount;
                        zhts_model_ele.innerText = "目标总数: " + zhts_model_count;
                        if (layer) {
                            layer.removeAll();
                        }
                        o.removeTreeChildren(treeNode);

                    }
                } else {
                    var checked = treeNode.checked;
                    showNode(treeNode, checked);
                }
            },
            onDblClick: function (event, treeId, treeNode) {
                //飞往模型，高亮显示    
                if (treeNode.isParent) {
                    return;
                }
                var ph = treeNode.ph;
                var queue = treeNode.queue;
                var layer = layerManagerView_zhts.getLayer(ViewType.MODEL, queue);
                var modelId = treeNode.queue + ph;
                var model = layer.collection.get(modelId);
                if (model) {
                    viewer.zoomTo(model.model.entity);
                }
            }
        }
    };
    this.tree = new newTree(setting);
    this.checkedPNodes = function () {
        return this.tree.getSelectedNode();
    }

    this.initTree = function () {
        var me = this;
        me.queues = new Map();
        this.EntityMap = new Map();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: zhts_mbts_treeNode,
            success: function (data) {
                //by gaolixian  2018/08/20
                //yuan var node = [];
                var node = {};
                // end by gaolixian
                for (var i = 0; i < data.sststs.length; i++) {

                    //add  wlt 20190521  与二维保持一致
                    if (data.sststs[i].tcmc == "融合结果") {
                        data.sststs[i].tcmc = "态势目标列表"
                    } else if (data.sststs[i].tcmc == "态势快报" || data.sststs[i].tcmc == "联合空情_南部战区") {
                        continue;
                    }
                    //by gaolixian  2018/08/20
                    node = {
                        mbnm: data.sststs[i].dyh,
                        name: data.sststs[i].tcmc,
                        dyh: data.sststs[i].dyh,
                        othernum: 0,
                        isParent: true,
                        // checked: data.sststs[i].dyh == "SSTS_RHJG_4" ? true : false,
                        checked: false,
                        isShowLayer: true
                    };
                    //yuan node.push({
                    //     name:data.sststs[i].tcmc,
                    //     dyh:data.sststs[i].dyh,
                    //     isParent:true,
                    //     checked:data.sststs[i].dyh == "SSTS_RHJG_4"?true:false
                    // });
                    // end by gaolixian
                    me.EntityMap.set(data.sststs[i].dyh, new Set());
                    me.queues.set(data.sststs[i].tcmc, data.sststs[i].dyh);
                    //bygaolixian  2018/08/20
                    me.tree.addNodes(null, [node], false);
                    //yuan me.tree.addNodes(null,[{ mbnm:data.sststs[i].dyh, name: data.sststs[i].tcmc, isParent:true ,checked:node[i].checked,isShowLayer:true}],false);
                    // end by gaolixian
                    //var layer = me.layerManager.getLayer(ViewType.MODEL,data.sststs[i].dyh);
                    var layer = me.layerManager.addLayer({
                        layerId: data.sststs[i].dyh,
                        name: data.sststs[i].tcmc,
                        viewType: ViewType.MODEL
                    });
                    layer.LoadingList = new Map();
                    layer.ModelPosition = new Map();
                }
                receivedSocketData = true;
                // me.startReceive("SSTS_RHJG_4");
                // checkedTsStatusBox({ checked: true });
            },
            error: function (data) {
                console.log(data);
            }
        });
    }

    this.removeTreeChildren = function (node) {
        if (node.children) {
            this.tree.zTree().removeChildNodes(node);
        }
    }

    this.initTree();

    this.startReceive = function (nm) {
        // if (!name || !this.queues.has(name))
        //     return;
        // var queue = this.queues.get(name);
        var layer = this.layerManager.getLayer(ViewType.MODEL, nm);
        if (!layer)
            return;
        this.socket.startReceive(nm, showZHTSCallback, layer);
    }
    this.stopReceive = function (name) {
        if (!name || !this.queues.has(name))
            return;
        var queue = this.queues.get(name);
        var layer = this.layerManager.getLayer(queue);
        if (layer)
            layer.removeAll();
        this.socket.unsubscribe(queue);
    }

    var scene = viewer.scene;
    scene.preUpdate.addEventListener(function () {
        for (let index = 0; index < viewer.entities.values.length; index++) {
            const entity = viewer.entities.values[index];
            if (BeyonMap.defined(entity.model)) {
                var model = entity.model;
                var entityPosition = entity.position.getValue(viewer.beyonmapWidget.clock.currentTime);
                entity.disCamera = BeyonMap.Cartesian3.distance(entityPosition, viewer.scene.camera.positionWC);
            }

        }
    })
}

function getInfoBox(prop, infolevel = 1) {
    //  var flag = showFlag ?("<img src='"+basePath+"/resources/country/24/"+prop.gjnm+".png'>"):"";
    var content;
    switch (infolevel) {
        case 1:
            // 如果开始是 1 ，则需要显示 2 的内容
            content = prop.gjstr + "\n" + prop.jxh + "\n航向：" + prop.hx + "\n" + "速度：" + prop.sd;

            if (prop.gd != -999999) {
                content += "\n高/深：" + prop.gd;
            }

            if (prop.mbtype > 0) {
                content += "\n编码：" + prop.mbtype;

                if (prop.mbtypename) {
                    content += "\n类型：" + prop.mbtypename;
                }
            }
            content += "\n经度：" + formatDegree(prop.lon, "lon") + "\n 纬度：" + formatDegree(prop.lat, "lat") + "\n时间：" + prop.time + "\n" + "批号：" + prop.ph + "\n信原：" + prop.xymc;
            break;
        case 2:
            //如果开始是2 ，则需要显示 3 的内容
            content = prop.gjstr + "\n" + prop.mbmc + "\n" + prop.ph + "\n信原：" + prop.xymc + "\n" + prop.time;
            break;
        case 3:
            //如果开始是 3，则需要显示 1 的内容
            content = prop.gjstr + "\n" + prop.mbmc + "\n" + prop.ph;
            break;
        default:
            content = prop.gjstr + "\n" + prop.mbmc + "\n" + prop.ph;
            break;
    }
    return content;
}

function strToDegree(value) {
    var d = value.split("°")[0];
    var f = value.split("°")[1].split("′")[0];
    var m = value.split("°")[1].split("′")[1].split("″")[0];
    return Math.abs(d) + '.' + (Math.abs(f) / 60 + Math.abs(m) / 3600);
}

function formatDegree(value, type) {
    value = Math.abs(value);
    var d = Math.floor(value);
    var f = Math.floor((value - d) * 60);
    var m = Math.round((value - d) * 360 % 60);
    var dstr = "E";
    if (type === 'lon') {
        if (d < 0) {
            dstr = "W";
        }
    }
    if (type === 'lat') {
        if (d < 0) {
            dstr = "S";
        } else {
            dstr = "N";
        }
    }
    return dstr + d + '°' + f + "′" + m + '″';
}

//将推送过来的属性转换成标牌
function changeModelOptions(model_id, prop) {
    var labelOptions = getEntityOptions(prop);
}


/* 方法 end */