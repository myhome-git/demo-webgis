// var IDMark_A = "_a";
var removeHoverDom = function (treeId, treeNode) {
    // $("#open-layer-setting-" + treeNode.id).unbind().remove();
};

// 监控图层树是否加载完成
let _mapInited = false;

function addDiyDom(treeId, treeNode) {
    if (treeNode.isParent) {
        return;
    }
    let tree = $.fn.zTree.getZTreeObj(treeId);

    let sObj = $("#" + treeNode.tId + "_span");
    let id = treeNode.id;

    var promise = new Promise(function (resolve, reject) {
        var index = setInterval(function () {
            if (_mapInited) {
                clearInterval(index);
                resolve();
            }
        }, 100);
    });
    promise.then(function () {
        let cNode = window.layerManager.GetLayerByNode(treeNode);
        let instance = cNode.Layer.instance;
        if (instance.length <= 0) {
            return;
        }
        let opacity = instance[0].getOpacity() > 1 ? instance[0].getOpacity() : instance[0].getOpacity() * 100;
        //  添加layerui的滑块
        let html = `<div class = 'layer-opacity-slider' style='display: inline-block;width: 100px;'> 
            <div id = 'layer-opacity-slider-${id}'>
            </div>
        </div>`;

        sObj.after(html);

        window.layui.use('slider', () => {
            slider = window.layui.slider;
            treeNode.uiSliders = {};
            treeNode.uiSliders.opacity = slider.render({
                elem: `#layer-opacity-slider-${id}`,
                input: false, //输入框
                value: opacity,
                tips: false,
                change: (value) => {
                    let cNode = window.layerManager.GetLayerByNode(treeNode);
                    let instance = cNode.Layer.instance;
                    instance.forEach(x => {
                        x.setOpacity(value / 100);
                    });
                },
            });
        });

    });

}

// function checkAccessories(treeNode, btn) {
//     var checkedRadio = getCheckedRadio("radio_" + treeNode.id);
//     if (btn.attr("checked")) {
//         if (!checkedRadio) {
//             $("#radio_" + treeNode.children[0].id).attr("checked", true);
//         }
//     } else {
//         checkedRadio.attr("checked", false);
//     }
// }

// function checkBrand(treeNode, btn) {
//     if (btn.attr("checked")) {
//         var pObj = $("#checkbox_" + treeNode.getParentNode().id);
//         if (!pObj.attr("checked")) {
//             pObj.attr("checked", true);
//         }
//     }
// }

// function getCheckedRadio(radioName) {
//     var r = document.getElementsByName(radioName);
//     for (var i = 0; i < r.length; i++) {
//         if (r[i].checked) {
//             return $(r[i]);
//         }
//     }
//     return null;
// }


var defaults = {
    tree_id: "tree2d",
    location: 1,
    defaultIndex: -1,
    maximumLevel: 5,
    moveChangeScene: false,
    setting: {
        view: {
            addDiyDom: addDiyDom,
            removeHoverDom: removeHoverDom,
            selectedMulti: false
        },
        check: {
            enable: true,
        },
        data: {
            simpleData: {
                enable: true
            },
            keep: {
                leaf: true,
                parent: true
            }
        },
        edit: {
            enable: true,
            showRemoveBtn: false,
            showRenameBtn: false,
            drag: {
                drag: {
                    isCopy: false,
                    inner: true,
                }
            }
        },
        callback: {

        }

    },
    InitNode: [
        // { id: 1, pId: 0, name: "影像图层", open: true, nocheck: true },
        // { id: 101, pId: 1, name: "谷歌影像" },
        // { id: 102, pId: 1, name: "航拍数据" },
        // { id: 103, pId: 1, name: "和田切图" },
        // { id: 2, pId: 0, name: "矢量图层" },
        // { id: 108, pId: 2, name: "摄像头数据" },
        // { id: 109, pId: 2, name: "摄像头来自geoJson" },
        // { id: 110, pId: 2, name: "摄像头来自KML" },
        // { id: 3, pId: 0, name: "三维图层" },
        // { id: 112, pId: 3, name: "凭祥数据" },
        // { id: 113, pId: 3, name: "单体模型" },
        // { id: 114, pId: 3, name: "立体矢量" },
        // { id: 4, pId: 0, name: "三维图层" },
        // { id: 115, pId: 4, name: "凭祥数据" },
        // { id: 116, pId: 4, name: "单体模型" },
        // { id: 117, pId: 4, name: "立体矢量" },
        // { id: 5, pId: 0, name: "三维图层" },
        // { id: 118, pId: 5, name: "凭祥数据" },
        // { id: 119, pId: 5, name: "单体模型" },
        // { id: 120, pId: 5, name: "立体矢量" }
    ],
};

LayerManager.prototype = {
    constructor: LayerManager,
    // TreeType: "",
    // Layer: [

    // ],
    //获取图层新的索引

    /***** function *****/
    Init: function () {
        var o = this;
        o.CreateContianer();
        //删除节点之前  解除内部数据之间的绑定
        o.options.setting.callback.beforeRemove = function (event, treeNode) { };

        o.options.setting.callback.onRemove = function (event, treeNode) { };

        o.options.setting.callback.beforeCheck = function (treeId, treeNode) {
            if (treeNode.radio == "c" && treeNode.checked) {
                return false;
            }
        };
        //check节点之后
        o.options.setting.callback.onCheck = function (event, treeId, treeNode) {
            // o.RecursionChildrenNodeToggleShow(o.Tree.getNodeByParam('id', treeNode.id), treeNode.checked);
            //用于radio check显示，其中有考虑wms图层，所以优先级较高
            if (treeNode.radio) {
                // 当radio中存在wms图层组合图层
                if (treeNode.WMS) {
                    var pNode = o.wmsCheckEvent(treeNode, treeNode.checked);
                    o.radioCheckEvent(pNode, pNode.checked, treeNode.WMS == "p");
                } else {
                    o.radioCheckEvent(treeNode, treeNode.checked, treeNode.WMS == "p");
                }
            }
            // 仅仅用于wms图层组使用
            else if (treeNode.WMS && !treeNode.radio) {
                o.wmsCheckEvent(treeNode, treeNode.checked);
            } else {
                var layer = o.GetLayerByNode(treeNode);
                if (layer)
                    layer.Layer.visible = treeNode.checked;
                if (treeNode.checkCallback) {
                    treeNode.checkCallback(o, treeNode);
                }
            }
        };
        //拖拽前判断操作  判断是否是不可移动的图层
        o.options.setting.callback.beforeDrag = function (treeId, treeNodes) {
            // 先定拖拽规则
            if (treeNodes.length > 1) return false;
            let treeNode = treeNodes[0];
            let pNode = treeNode.getParentNode();
            if (!treeNode.allowDrag || !pNode || !pNode.allowDrag) return false;
            return true;
        };
        //拖拽完成前，记录场景图层顺序数据
        o.options.setting.callback.beforeDrop = function (treeId, treeNodes, targetNode, moveType, isCopy) {
            // 先定死是同一节点下的互换
            let pNode = treeNodes[0].getParentNode();
            let tarPNode = targetNode.getParentNode();
            if (pNode != tarPNode) {
                return false;
            }
            return true;
        };
        //拖拽完成后，调整场景图层位置先后
        o.options.setting.callback.onDrop = function (event, treeId, treeNodes, targetNode, moveType) {
            let node = treeNodes[0];
            let logicLayers = new Array();//用于存放所有逻辑图层
            let imageIndexArray = new Array();//用于存放所有imageryLayer的层级关系
            node.getParentNode().children.forEach(x => {
                logicLayers.push(o.GetLayerByNode(x));
            });
            let index = 0;
            logicLayers.forEach(x => {
                x.Layer.instance.forEach(y => {
                    index++;
                });
            });
            for (let i = 0; i < index; i++ , imageIndexArray.push(i));
            // 由大到小排序
            imageIndexArray.sort((x, y) => {
                return y - x;
            });

            // 进行排序
            logicLayers.forEach(x => {
                x.Layer.instance.forEach(y => {
                    y.setZIndex(imageIndexArray[0]);
                    imageIndexArray = imageIndexArray.slice(1);
                });
            });
        };
        //重命名数据  触发事件，修改对应图层的名称--也可以不修改
        o.options.setting.callback.onRename = function (event, treeId, treeNode, isCancel) { };

        //双击节点事件，用于飞往数据的可视域--也可以不修改
        o.options.setting.callback.onClick = function (event, treeId, treeNode) {
            var checked = treeNode.checked;
            o.Tree.checkNode(treeNode, !checked, true, true);
            // var Layer = o.GetLayerByID(treeNode.type, treeNode.id);
        };

        //双击节点事件，用于飞往数据的可视域--也可以不修改
        o.options.setting.callback.onDblClick = function (event, treeId, treeNode) {
            console.log(treeNode);
            // 当时基础地图时，用全局extend
            if (treeNode.olType == "base") {
                var ext = [-180, -90, 180, 90];
                o.Map.getMap().getView().fit(transform(ext));
            }
            // 
        };
		
		debugger;
        //初始化
        $.fn.zTree.init($("#" + o.options.tree_id), o.options.setting, o.options.InitNode);
        o.Tree = $.fn.zTree.getZTreeObj(o.options.tree_id);
        o.Tree.LayerManager = o;
    },

    CreateContianer: function () {
        var o = this;
    },

    AddRadioLayerGroup: function (pid, id, name) {
        var tree = this.Tree;
        pid = pid ? pid : 0;
        var pNode = tree.getNodeByParam("id", pid);
        return tree.addNodes(pNode, {
            id: id,
            pid: pid,
            name: name,
            isParent: true,
            nocheck: true
        })[0];
    },

    AddLayerGroup: function (pid, id, name, bNoCheck, options = {}) {
        var tree = this.Tree;
        pid = pid ? pid : 0;
        var pNode = tree.getNodeByParam("id", pid);
        return tree.addNodes(pNode, {
            id: id,
            pid: pid,
            name: name,
            isParent: true,
            nocheck: bNoCheck ? true : false,
            allowDrag: options.allowDrag
        })[0];
    },

    /*
     **主要用于二维地图基础地图的管理
     **@param pid:父节点id  @param id:自己的id值   @param name：显示名称  @param layer:绑定的openlayer图层，未添加的  @param checked是否显示
     */
    AddOLRadioLayerNode: function (pid, id, name, layer, checked) {
        var tree = this.Tree;
        pid = pid ? pid : 0;
        var pNode = tree.getNodeByParam("id", pid);
        if (!pNode)
            return;

        var node = tree.addNodes(pNode, {
            id: id,
            pid: pid,
            name: name,
            isParent: false,
            checked: false,
            radio: "c",
            olType: "base"
        })[0];
        // 添加到map中去
        layer.setVisible(false);
        this.Map.baseLayerGroup.getLayers().push(layer);
        this.BindingOlLayer(node, layer);

        if (checked) {
            tree.checkNode(node, true, false, true);
        }
        return node;
    },

    // 请求服务端图层数据
    addWmsGroupServerPromise: function (pid, id) {
        var me = this;
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                url: CONFIG.DUP_BASE + "/dtinfo/gp",
                dataType: "JSON",
                data: {},
                success: function (dat0) {
                    resolve(dat0);
                    //console.log(dat0)
                },
                error: function () {
                    reject("网络问题!");
                }
            });
        });
        promise.then(function (dat1) {
            var mapserverhost = dat1.mapserverhost;
            var mapserverport = dat1.mapserverport;
            // var gjb_url = "http://" + mapserverhost.ddValue + ":" + mapserverport.ddValue;
            var gjb_url = "http://" + mapserverhost.ddValue + ":" + mapserverport.ddValue;

            var gp = dat1.gp;
            var promiseList = [];
            gp.forEach(gpData => {
                var promisePart = new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "/dupservice/dtinfo/gp/dataset/" + gpData.gpName + "/gjb/true",
                        dataType: "JSON",
                        data: {},
                        Type: "GET",
                        success: function (dat) {
                            resolve(dat);
                        },
                        error: function (x, y, z) {
                            console.log(x);
                            console.log(y);
                            console.log(z);
                            reject("网络问题!");
                        }
                    });
                });
                promiseList.push(promisePart);
            });

            Promise.all(promiseList).then(function (param) {
                //console.log(param);
                param.forEach(ele => {
                    var alisName;
                    for (var i = 0; i < gp.length; i++) {
                        if (gp[i].gpName == ele.dataset) {
                            alisName = gp[i].gpAlias;
                            break;
                        }
                    }
                    me.AddWSMLayerGroup(pid, ele.dataset + "_wms", alisName, false, {
                        layerGroup: ele.dataset,
                        layers: ele.gplayers,
                    }, {
                            bRadio: true,
                            ServerUrl: gjb_url + "/beyonserver/wms"
                        });
                });
            });

        });
    },

    /**
     * 用于添加wms的图层的图层组节点
     * @Param layerOptions  图层组 { layers:[],layergroup：""图层组名称 }
     * @Param checked 显隐
     */

    AddWSMLayerGroup: function (pid, id, name, checked, layerOptions, options = {}) {
        var tree = this.Tree;
        pid = pid ? pid : 1000105;
        var pNode = tree.getNodeByParam("id", pid);
        // 解析options参数
        var bOver = options.bOver;
        var pParams = {
            id: id,
            pid: pid,
            name: name,
            dataset: layerOptions.layerGroup,
            isParent: true,
            checked: false,
            WMS: "p",
            open: false
        };
        if (options.bRadio)
            pParams.radio = "c";
        var node = tree.addNodes(pNode, pParams)[0];

        // 默认设置是unvisible
        var wmsLayer = new WMSLayer(node, {
            serverUrl: options.ServerUrl,
            layerGroup: layerOptions.layerGroup,
        });
        if (!bOver)
            this.Map.baseLayerGroup.getLayers().push(wmsLayer.instance[0]);
        else
            this.Map.overlayersGroup.getLayers().push(wmsLayer.instance[0]);

        var allLayerArrayStr = [];
        // 生成子图层
        if (layerOptions.layers && layerOptions.layers instanceof Array) {
            var layers = layerOptions.layers;
            layers.forEach(element => {
                allLayerArrayStr.push(element.dtTable);
                // console.log(element.dtName.trim(element.gpName + "_"));
                var nName = element.dtName.substring(element.dtName.indexOf(element.gpName + "_") + (element.gpName + "_").length);
                var cParams = {
                    id: element.dtTable,
                    pid: id,
                    name: nName,
                    isParent: false,
                    checked: false,
                    WMS: "c",
                    wmsLayer: element.dtTable,
                    ext: element.dtExtent
                };
                if (options.bRadio)
                    cParams.radio = "part-c";
                var cNode = tree.addNodes(node, cParams, true)[0];
            });
        }

        // 设置图层
        wmsLayer.SetWMSLayer(allLayerArrayStr);
        this.BindingLayer(node, wmsLayer);

        if (checked) {
            tree.checkNode(node, true, false, true);
        }
        return node;
    },

    /*
     **主要用于二维地图叠加地图的管理
     **@param pid:父节点id  @param id:自己的id值   @param name：显示名称  @param layer:绑定的openlayer图层，未添加的  @param checked是否显示
     */
    AddOLDataNode: function (pid, id, name, layer, checked, bBase, callback) {
        var tree = this.Tree;
        pid = pid ? pid : 0;
        var pNode = tree.getNodeByParam("id", pid);
        if (!pNode)
            return;

        var node = tree.addNodes(pNode, {
            id: id,
            pid: pid,
            name: name,
            isParent: false,
            checked: false,
            checkCallback: callback,
            olType: bBase ? "base" : "over"
        })[0];
        // 添加到map中去
        layer.setVisible(false);
        if (!bBase)
            this.Map.overlayersGroup.getLayers().push(layer);
        else
            this.Map.baseLayerGroup.getLayers().push(layer);
        this.BindingOlLayer(node, layer);
        if (checked) {
            tree.checkNode(node, true, false, true);
        }
        return node;
    },

    /*
     **主要用于二维地图叠加地图的管理
     **@param pid:父节点id  @param id:自己的id值   @param name：显示名称  @param layer:绑定的openlayer图层，未添加的  @param checked是否显示
     */
    BindingOLDataNode: function (pid, id, name, layer, checked, bBase, callback) {
        var tree = this.Tree;
        pid = pid ? pid : 0;
        var pNode = tree.getNodeByParam("id", pid);
        if (!pNode)
            return;

        var node = tree.addNodes(pNode, {
            id: id,
            pid: pid,
            name: name,
            isParent: false,
            checked: false,
            checkCallback: callback,
            olType: bBase ? "base" : "over"
        })[0];
        // 添加到map中去
        layer.setVisible(false);
        // this.Map.overlayersGroup.getLayers().push(layer);
        this.BindingOlLayer(node, layer);
        if (checked) {
            tree.checkNode(node, true, false, true);
        }
        return node;
    },

    /**
     * 绑定基础地图注计图层
     */
    BindingRadioOverLayer: function (node, ollayer, bBaseLay) {
        var layer = this.GetLayerByNode(node);
        if (!layer)
            return;
        ollayer.setVisible(node.checked);
        if (bBaseLay)
            this.Map.baseLayerGroup.getLayers().push(ollayer);
        else
            this.Map.overlayersGroup.getLayers().push(ollayer);
        layer.Layer.addInstance(ollayer);
    },

    //删除某个节点及子节点，移除绑定数据
    RemoveSelectNode: function () {
        var me = this;
        var nodes = me.Tree.getSelectedNodes();
        if (nodes && nodes.length > 0) {
            me.RecursionChildrenNodes(nodes[0]);
        }
    },

    //递归 显示，不显示一个节点的（包含子节点）图层数据 入口
    RecursionChildrenNodeToggleShow: function (node, IsShow) {
        var me = this;
        me.RecursionChildrenNodesSetShow(node, IsShow, me);
    },

    //递归 显示，不显示一个节点的（包含子节点）图层数据 递归方法 /因 me 传参，没用在一个方法里
    RecursionChildrenNodesSetShow: function (node, IsShow, me) {
        //var me = this;
        if (node.isParent) {
            for (var i = 0; i < node.children.length; i++) {
                me.RecursionChildrenNodesSetShow(node.children[i], IsShow, me);
            }
            //me.ToggleShowLayer(node, IsShow);
        } else {
            me.ToggleShowLayer(node, IsShow);
        }
    },

    //显示开关单个图层
    ToggleShowLayer: function (node, isShow) {
        if (node.isParent)
            return;
        var me = this;
        var layer = me.GetLayerByNode(node);
        layer.SetVisible(isShow);
    },

    //获取图层，node：树节点的js对象，返回图层与图层ID对象
    GetLayerByNode: function (node) {
        var me = this;
        var id = node.id;
        var layer = me.GetLayerByID(node.type, id);
        return layer;
    },

    GetLayerByID: function (type, id) {
        var layers = this.Layer;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].id == id) {
                return layers[i];
            }
        }
    },

    CreateOLLayer: function (node, ollayer) {
        var p = new olLayer(node, ollayer);
        return p;
    },

    BindingLayer: function (node, layer) {
        var layer_or = this.GetLayerByNode(node);
        if (layer_or) {
            layer_or.Layer = layer;
        } else {
            this.Layer.push({
                id: node.id,
                Layer: layer
            });
        }
    },

    BindingOlLayer: function (node, ollayer) {
        var layer = this.CreateOLLayer(node, ollayer);
        var layer_or = this.GetLayerByNode(node);
        if (layer_or) {
            layer_or.Layer = layer;
        } else {
            this.Layer.push({
                id: node.id,
                Layer: layer
            });
        }
    },

    /*
     **事件  *** 新增
     */
    // radio的check事件，需要节点与父节点同时满足存在属性 radio ,c 是指子节点，p是指父节点
    radioCheckEvent: function (node, checked, triggerNodeIsP) {
        if (!checked) {
            this.Tree.checkNode(node, true, false, false);
            return;
        }
        var pNode, cNodes;
        pNode = node.getParentNode();
        while (pNode && pNode.nocheck) {
            pNode = pNode.getParentNode();
        }
        cNodes = this.Tree.getNodesByParam("radio", "c", pNode);

        for (var i = 0; i < cNodes.length; i++) {
            var cNode = cNodes[i];
            if (cNode.id === node.id) {
                this.Tree.checkNode(node, true, false, false);
                var layerp = this.GetLayerByNode(cNode);
                if (layerp)
                    layerp.Layer.visible = true;
                if (cNode.WMS == "p") {
                    var gjbName, wmsUnloadMaps;
                    if (node.WMS == "p" && checked) {
                        gjbName = cNode.dataset;
                        wmsUnloadMaps = this.wmsLayerUnLoad.get(gjbName);
                    }
                    var cWmsNodes = cNode.children;
                    if (cWmsNodes && triggerNodeIsP)
                        cWmsNodes.forEach(oo => {
                            if (!gjbName || !wmsUnloadMaps instanceof Array)
                                return;
                            if (wmsUnloadMaps.indexOf(oo.wmsLayer) != -1) {
                                this.Tree.checkNode(oo, false, false, false);
                            }
                        });
                }
                continue;
            } else {
                this.Tree.checkNode(cNode, false, false, false);
                if (cNode.WMS) {
                    var wmsCNodes = cNode.children;
                    if (wmsCNodes) {
                        wmsCNodes.forEach(ele => {
                            this.Tree.checkNode(ele, false, false, false);
                        })
                    }
                }
                var layers = this.GetLayerByNode(cNode);
                if (layers)
                    layers.Layer.visible = false;
            }
        }
    },

    wmsCheckEvent: function (treeNode, checked) {
        var pNode, cNodes, gjbName, wmsUnloadMaps;
        if (treeNode.WMS == "p") {
            gjbName = treeNode.dataset;
            wmsUnloadMaps = this.wmsLayerUnLoad.get(gjbName);
        }
        pNode = treeNode.WMS == "p" ? treeNode : treeNode.getParentNode();
        cNodes = this.Tree.getNodesByParam("WMS", "c", pNode);
        var layers = [];
        cNodes.forEach(x => {
            if (x.checked) {
                if (wmsUnloadMaps instanceof Array && gjbName) {
                    if (wmsUnloadMaps.indexOf(x.wmsLayer) == -1) {
                        layers.push(x.wmsLayer);
                    }
                } else
                    layers.push(x.wmsLayer);
            }
        });

        var layer = this.GetLayerByNode(pNode);
        if (layer)
            layer.Layer.SetWMSLayer(layers);
        // 如果点击的是part-c节点，触发其父节点也就是radio中的一项的节点，让其进行radio的剩下步骤
        // if (treeNode.radio == "part-c") {
        //     this.Tree.checkNode(pNode, pNode.checked, false, true);
        // }

        return pNode;
    },

    // 定制，回调，隐藏其他base图层,
    setOtherVisible: function (o, node) {
        var type = node.olType;
        var visible = !node.checked;
        if (!type || type == "")
            return;
        var nodes = o.Tree.getNodesByParam("olType", type);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id === node.id)
                return;
            if (nodes[i].checked) {
                var layer = o.GetLayerByNode(nodes[i]);
                if (layer)
                    layer.Layer.visible = visible;
            }
        }
    }


}

//构造方法
function LayerManager(map, options) {
    this.Map = map;
    this.Layer = [];
    this.TreeType = "";
    this.ServerBaseUrl = undefined;
    this.options = $.extend({}, defaults, options);
    this.Init();
    this.wmsLayerUnLoad = new Map();
}