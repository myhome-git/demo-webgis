//3维viewer对象
var viewer;
//图层管理对象
var layerManagerUI;
//绘制管理器
var drawingManager;
//界面事件管理
var eventHandler;

function initViewer() {
    //基础底图 imageProvider
    var baseImageProvider = new BeyonMap.UrlTemplateImageryProvider({
        url: BeyonMap.buildModuleUrl('Assets/Textures/NaturalEarthII/') + '{z}/{x}/{reverseY}.jpg',
        tilingScheme: new BeyonMap.GeographicTilingScheme(),
        maximumLevel: 2
    });

    // window.devicePixelRatio = 2;
    viewer = new BeyonMap.Viewer('beyonmapContainer', {
        imageryProvider: baseImageProvider,
        baseLayerPicker: false,
        //terrainProvider : terrainProvider,
        animation: true,
        timeline: true,
        // selectionIndicator:false,
        infoBox: false,
        homeButton: false,
        geocoder: false, //{url : MapServerURL}, proxy : new BeyonMap.BeyonDBProxy('/proxy/'), 
        navigationHelpButton: false,
        fullscreenButton: false,
        layersButton: true,
        scene3DOnly: true,
        shadows: false,
        terrainShadows: BeyonMap.ShadowMode.DISABLED, //BeyonMap.ShadowMode.CAST_ONLY 仅仅投影，BeyonMap.ShadowMode.DISABLED 不投影也不接受投影 BeyonMap.ShadowMode.ENABLED 投影接收投影 BeyonMap.ShadowMode.RECEIVE_ONLY只接受不投影
        terrainShadows: false,
        // infoBox : true,
        contextOptions: {
            allowTextureFilterAnisotropic: false,
            webgl: {
                preserveDrawingBuffer: false
            }
        }
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.fog.density = 4.0e-5;
    viewer.scene.refreshAlways = true;
    navigationInitialization(viewer);
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;
    viewer.scene.skyBox = new BeyonMap.SkyBox({
        sources: {
            positiveX: './img/spacebook/Version2_dark_px.jpg',
            negativeX: './img/spacebook/Version2_dark_mx.jpg',
            positiveY: './img/spacebook/Version2_dark_py.jpg',
            negativeY: './img/spacebook/Version2_dark_my.jpg',
            positiveZ: './img/spacebook/Version2_dark_pz.jpg',
            negativeZ: './img/spacebook/Version2_dark_mz.jpg'
        }
    });

    viewer.scene.sun = new BeyonMap.Sun();
    viewer.scene.moon = new BeyonMap.Moon();
    viewer.scene.globe.enableLighting = true;
    // viewer.scene.camera.position = new BeyonMap.Cartesian3(-6014392.883712972, 20894021.880376052,16534345.512367561);
    // viewer.scene.camera.heading = BeyonMap.Math.toRadians(90)
    // viewer.scene.camera.pitch = BeyonMap.Math.toRadians(-90), 
    // viewer.scene.camera.roll = 0.0
    viewer.scene.camera.flyTo({
        destination: new BeyonMap.Cartesian3.fromDegrees(110, 21, 19000000),
        // orientation: {
        //     heading : 1.7763568394002505e-15, // east, default value is 0.0 (north)
        //     pitch : BeyonMap.Math.toRadians(-90),    // default value (looking down)
        //     roll : 0.0                             // default value
        // }
    });

    //trackEntity的时候是否飞到模型外部框
    viewer.scene.trackedEntityZoomTo = true;

    //全局事件监听初始化
    eventHandler = new BeyonMap.ScreenSpaceEventHandler(viewer.scene.canvas);
}

initViewer();

//图层管理器
var layerManagerView = new LayerManagerView();
//态势树--图层管理器
var layerManagerView_zhts = layerManagerView; //new LayerManagerView();
//态势目标个数统计
var zhts_model_ele = document.getElementById("zhts_box_tree_count");
var zhts_model_count = 0;

var statusManager; //态势树树管理器
var zhts_mbts_managerView = new zhts_mbts_manager(layerManagerView_zhts); //态势过滤属性设置管理器
var ts_removeManager; //态势超时管理器
var receivedSocketData = false; //是否接受数据
var showZHTS = false; //是否显示态势树

var cc_socket = new SocketControl(socketConfig.URL, socketConfig.USER_NAME, socketConfig.PASSWORD, socketConfig
    .VHOST);
cc_socket.zhts_mbts_managerView = zhts_mbts_managerView; //给websocket赋值过滤

$(document).ready(function () {
    //数据
    // var terrainProvider = new BeyonMap.BeyonMapTerrainProvider({
    //     url: IMAGE_CONFIG.DEM_CHINA_MERSH,
    // });
    // viewer.terrainProvider = terrainProvider;
    var googleEleImagery = new BeyonMap.UrlTemplateImageryProvider({
        url: IMAGE_CONFIG.Google_VECTOR,
    });

    var googleImagery = new BeyonMap.UrlTemplateImageryProvider({
        url: IMAGE_CONFIG.Google_RasterUrl,
    });

    var googleAnoImagery = new BeyonMap.UrlTemplateImageryProvider({
        url: IMAGE_CONFIG.Google_RasterAnoUrl,
    });

    var tdtRasterAnoImagery = new BeyonMap.UrlTemplateImageryProvider({
        url: IMAGE_CONFIG.TDT_RasterAnoUrl_LOCAL,
    });
    var tdtRasterImagery = new BeyonMap.UrlTemplateImageryProvider({
        url: IMAGE_CONFIG.TDT_RasterUrl_LOCAL,
        //tilingScheme : new BeyonMap.GeographicTilingScheme(),
    });

    //博阳底图
    var imageryLayer1 = new BeyonImageryLayer(viewer, null, {
        show: true,
        baseLayer: true,
    })
    //谷歌地图
    var imageryLayer2 = new BeyonImageryLayer(viewer, googleEleImagery, {
        show: false,
        baseLayer: false,
    })

    //谷歌影像
    var imageryLayer3 = new BeyonImageryLayer(viewer, googleImagery, {
        show: true,
        baseLayer: false,
    })

    //谷歌影像注记
    var imageryLayer4 = new BeyonImageryLayer(viewer, googleAnoImagery, {
        show: true,
        baseLayer: false,
    })

    //天地图影像
    var imageryTDTRaster = new BeyonImageryLayer(viewer, tdtRasterImagery, {
        show: false,
        baseLayer: false,
    })

    //天地图影像注记
    var imageryTDT = new BeyonImageryLayer(viewer, tdtRasterAnoImagery, {
        show: false,
        baseLayer: false,
    })


    layerManagerUI = new LayerManagerUI(viewer);
    layerManagerUI.setVisile(false);
    layerManagerUI.addDirectoryNode("影像图层", "1");
    var baseLayer3 = layerManagerUI.addDataNode("谷歌影像", "103", "1", {
        checked: true
    });
    //var baseLayer2 = layerManagerUI.addDataNode("谷歌影像","102","1",{checked:true});
    baseLayer3.bindingLayer(imageryLayer3);
    baseLayer3.bindingLayer(imageryLayer4);
    var baseLayer = layerManagerUI.addDataNode("谷歌地图", "101", "1", {
        checked: false
    });
    baseLayer.bindingLayer(imageryLayer2);

    var tdtLayer = layerManagerUI.addDataNode("天地图", "104", "1", {
        checked: false
    });
    tdtLayer.bindingLayer(imageryTDT);
    tdtLayer.bindingLayer(imageryTDTRaster);

    // layerManagerUI.addDirectoryNode("态势图层","2");
    // var tsLayer = layerManagerUI.addDataNode("态势图层","201","2");
    // tsLayer.bindingLayer(status_layer);

    var zhts_mbyx_layer; //目标影像的图层，用以加载目标。

    // layerManagerUI.addDirectoryNode("模型图层","3");
    // var baseLayer1 = layerManagerUI.addDataNode("谷歌地图","301","3",false);
    // baseLayer1.bindingLayer(imageryLayer1);
    // baseLayer1.bindingLayer(imageryLayer2);

    //  var msg = {type:"3D",value:{ pt:view.getCenter(), zoom:view.getZoom(), rot:view.getRotation(),extent:ext }};
    /*浏览器内同步视图*/

    viewer.camera.percentageChanged = 0.1;
    if (WSynchro.source) {
        z = WSynchro.source.map.getView().getZoom();
        pt = WSynchro.source.map.getView().getCenter();
        rot = WSynchro.source.map.getView().getRotation();
        // console.log(pt);
    }

    //接收信息
    WSynchro.on('synchronize', function (e) {
        //console.log(e);
        // Tell we are synchro
        if (e.target == "2D") {
            WSynchro.synchronize();
        }

        //获取相机的范围
        var rectangle = viewer.camera.computeViewRectangle();
        var heading = BeyonMap.Math.toDegrees(viewer.camera.pitch);
        var west = BeyonMap.Math.toRadians(e.extent[0]);
        var sourth = BeyonMap.Math.toRadians(e.extent[1]);
        var east = BeyonMap.Math.toRadians(e.extent[2]);
        var north = BeyonMap.Math.toRadians(e.extent[3]);
        if (rectangle.west == west && rectangle.south == sourth && rectangle.east == east &&
            rectangle.north == north && heading == e.rot) {
            WSynchro.synchronize();
        }
        // Set position (will call WSynchro.synchronize on move end)
        else {
            var rectangle = new BeyonMap.Rectangle(west, sourth, east, north);
            var heading = BeyonMap.Math.toRadians(e.rot);;
            viewer.camera.setView({
                destination: rectangle,
                orientation: {
                    heading: heading, // east, default value is 0.0 (north)
                    pitch: BeyonMap.Math.toRadians(-90), // default value (looking down)
                    roll: 0.0
                }
            });
        }
    });
});

var eventHelper = new BeyonMap.EventHelper();
eventHelper.add(viewer.camera.changed, function () {
    var heading = viewer.camera.heading;
    var position = viewer.camera.positionCartographic;
    var zoom;
    if (viewer.imageryLayers.length < 2)
        zoom = 1;
    else
        zoom: viewer.imageryLayers.get(1).curZoomLevel;
    var msg = {
        target: "2D",
        rot: heading,
        pt: [BeyonMap.Math.toDegrees(position.longitude), BeyonMap.Math.toDegrees(position.latitude)],
        zoom: zoom,
    };
    // console.log(msg);
    WSynchro.synchronize(msg);
});

// status_tree.addNodes(null,[{ mbnm:"", name: "测试节点", isParent: true ,checked:true}],true);
var bExistModelTree = false;
var bShowModelTree = false;

function showMBMXTree(id) {
    if (bShowModelTree) {
        $('#' + id).get(0).parentNode.style.display = "none";
        bShowModelTree = false;
    } else {
        if (bExistModelTree) {
            $('#' + id).get(0).parentNode.style.display = "";
            //$('#'+id).parentNode.show();
            bShowModelTree = true;
        } else {
            //创建模型树
            $('#' + id).window({
                iconCls: 'icon-wjx',
                minimizable: false,
                maximizable: false,
                collapsible: true,
                title: "模型树",
                closed: false,
                left: 130,
                top: 60,
                width: 200,
                height: 600,
                onClose: function () {
                    bShowModelTree = false;
                    //关闭对应弹出框
                    $("#tsjs_gaojing_window").window();
                    $("#tsjs_gaojing_window").window('close');
                    $("#tsjs_config_window").window();
                    $("#tsjs_config_window").window('close');
                },
                onOpen: function () {
                    $.ajax({
                        url: modelSource.url,
                        dataType: "json",
                        success: function (data) {
                            bExistModelTree = true;
                            bShowModelTree = true;
                            //console.log(data);
                            var layerOps = {
                                viewType: ViewType.MODEL,
                                layerId: 51
                            }
                            var layer = layerManagerView.addLayer(layerOps);
                            // tree.addNodes(null,data);
                            var index = 0;
                            data.forEach(function (item) {
                                //添加模型
                                var model;
                                if (layer) {
                                    var modelOps = {
                                        type: item.type,
                                        id: item.id,
                                        layerid: 51,
                                        url: item.url,
                                        position: item.pos,
                                        tilesetUrl: BeyonMap.defaultValue(
                                            item.tilesetUrl, undefined),
                                        name: item.name,
                                        show: false,
                                        code: item.mbnm
                                    }
                                    model = layer.addModel(modelOps);
                                }
                                // if (index==0) {
                                //     tree.addNodes(null,[{name:item.name,layerId:layer.id,id:item.id,pos:item.pos,checked:true}]);
                                //     model.show=true;

                                //     if (item.type==ModelType.TILESET) {
                                //         model.model.tileset.tileLoad.addEventListener(function(model){
                                //             model.locate();});
                                //     }                                    

                                // }else
                                tree.addNodes(null, [{
                                    name: item.name,
                                    layerId: layer.id,
                                    id: item.id,
                                    pos: item.pos
                                }]);

                                index++;
                            });

                        }
                    })
                }
            });
        }

    }


}

function onClickTreeNode(event, treeId, treeNode, clickFlag) {
    var layer = layerManagerView.getLayer(ViewType.MODEL, 51);
    var model = layer.getElement(treeNode.id);
    if (model) {
        //定位
        var option = {
            nm: model._code,
            pos: [model._position.lon, model._position.lat],
            alt: model._position.alt,
            view: model._position.alt + 100
        }
        var entity = model.model.entity;
        if (entity) {
            viewer.zoomTo(entity);
            SWMX.createMx(option);
            SWMX.prepare = model._code;
            treeNode.checked = true;
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            treeObj.updateNode(treeNode);
            onCheckTreeNode(event, treeId, treeNode);

        } else if (model.locate()) {

            //创建tip对象
            //basePath="http://[IP已脱敏]/webgis";
            SWMX.createMx(option);
            SWMX.prepare = model._code;
            treeNode.checked = true;
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            treeObj.updateNode(treeNode);
            onCheckTreeNode(event, treeId, treeNode);
        }

    };

}

function onCheckTreeNode(event, treeId, treeNode) {
    var layer = layerManagerView.getLayer(ViewType.MODEL, 51);
    var checked = treeNode.checked;
    var model = layer.showObj(checked, treeNode.id);
    if (checked && model.model.entity) {
        viewer.zoomTo(model.model.entity);
        viewer.trackedEntity = model.model.entity;
    } else {
        viewer.trackedEntity = null;
    }

};

var callback = {
    onClick: onClickTreeNode,
    onCheck: onCheckTreeNode

}

var tree = new newTree({
    id: "zhts_mbmx_tree",
    callback: callback,
    check: {
        enable: true
    }
});

var syn23DCtrl = new synchronization(cc_socket);

function openWin() {
    start23DAsy = !start23DAsy;
    //WSynchro.open("http://localhost:8025/zhts/zhts.html");
    // if(start23DAsy)
    //     syn23DCtrl.startSynchronization();
    // else
    //     syn23DCtrl.stopSynchronization();
}


var drawManager; //绘制工具
var drawManagerToolbar;

function openDraw() {
    if (!drawManager) {
        drawManager = new BeyonMap.DrawingManager(viewer, {
            heightReference: BeyonMap.HeightReference.CLAMP_TO_GROUND,
            drawingControl: true,
            isOpen: true,
        });
        drawManagerToolbar = true;
        var btns = document.getElementsByClassName("beyonmap-button beyonmap-toolbar-button");
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            if (btn.className.indexOf("displayNone") > 0) {
                continue;
            }
            btn.style.display = drawManagerToolbar ? "none" : "";
        }
        drawManagerToolbar = false;
        return;
    }
    var btns = document.getElementsByClassName("beyonmap-button beyonmap-toolbar-button");
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        if (btn.className.indexOf("displayNone") > 0) {
            continue;
        }
        btn.style.display = drawManagerToolbar ? "none" : "";
    }
    drawManagerToolbar = !drawManagerToolbar;

}
openDraw();

eventHandler.setInputAction(function (movement) {
    var cartesian = BeyonMap.pickGlobe(viewer.scene, movement.endPosition);
    if (cartesian) {
        var cartographic = BeyonMap.Cartographic.fromCartesian(cartesian);
        var longitudeString = BeyonMap.Math.toDegrees(cartographic.longitude).toFixed(5);
        var latitudeString = BeyonMap.Math.toDegrees(cartographic.latitude).toFixed(5);
        $("#beyonmap-lonlat-span").text(`经: ${longitudeString} 纬: ${latitudeString}`);
    }
}, BeyonMap.ScreenSpaceEventType.MOUSE_MOVE);

// var initBuffer = function () {
//     viewer.entities.add({
//         model: {
//             url: "../../web3d/data/model/nimizi.glb",
//             minimumPixelSize:128,
//         },
//         position: BeyonMap.Cartesian3.fromDegrees(117, 40, 1000),
//         id:000000,
//         name:"123"
//     });
//     viewer.entities.add({
//         model: {
//             url: "../../web3d/data/model/b1-b.glb",
//         },
//         position: BeyonMap.Cartesian3(0, 0, 0),
//         id:000000,
//     });
//     viewer.scene.primitives.add(new BeyonMap.Model.fromGltf({
//         url: "../../web3d/data/model/nimizi.glb",
//         id: "model_nimizi",
//         show: false
//     }));
//     viewer.scene.primitives.add(new BeyonMap.Model.fromGltf({
//         url: "../../web3d/data/model/b1-b.glb",
//         id: "model_b1-b",
//         show: false,
//     }));
// }

// initBuffer();

// lonlatHandler.setInputAction(function(movement){
//         var cartesian = viewer.scene.pickPosition(movement.endPosition);
//         console.log(cartesian);
// },BeyonMap.ScreenSpaceEventType.MOUSE_MOVE);

// dragManagers = new dragManager(viewer);
// pathManager = new PathManager(viewer);


// var paths = [];
// var pathLength = 2;
// var xClip = 5 / pathLength;
// var yClip = 5 / pathLength;
// var shows = false;
// // for (var i = 0; i < pathLength; i++) {
// var x = 100 + xClip;
// var y = 40 + yClip;
// var z = 2000;
// var path = pathManager.addPath("100101100100", {
//     position: new BeyonMap.Cartesian3.fromDegrees(x, y, z),
// });
// //     paths.push(path);
// // }

// //测试添加一个路径，测试功能


// setInterval(function () {
//     // for (var i = 0; i < pathLength; i++) {
//     // var x = 100 + i * xClip * Math.random();
//     // var y = 40 + i * yClip * Math.random();
//     // var z = 2000 + i * Math.random();
//     // paths[i].addPosition(new BeyonMap.Cartesian3.fromDegrees(x, y, z));
//     // }
//     var x = 100 + xClip * Math.random();
//     var y = 40 + yClip * Math.random();
//     var z = 2000 + Math.random();
//     path.addPosition(new BeyonMap.Cartesian3.fromDegrees(x, y, z));
// }, 1000);


// setInterval(function () {
//     pathManager.setAllVisible(shows);
//     shows = !shows;
// }, 2000);


// viewer.dataSources.add(BeyonMap.CzmlDataSource.load("data/MultipartVehicle_part2.czml"))
// czmlManagers.addFile("data/czml/beidou.czml", "beidou");

//注册事件
//1.注册卫星czml添加事件
var czmlManagers = new czmlManager(viewer);
$(".Satellite li a").on("click", function (e) {
    var target = $(e.target);
    var text = target.attr("value");
    czmlManagers.show(false);
    if (text) {
        if (czmlManagers.collection.has(text)) {
            czmlManagers.show(true, text);
        } else {
            var path = "/web3d/data/czml/" + text + ".czml";
            czmlManagers.addFile(path, text);
        }
        $("#btn_Satellite").html("卫星：" + $(this).text());
    } else {
        $("#btn_Satellite").html("卫星");
    }

});
