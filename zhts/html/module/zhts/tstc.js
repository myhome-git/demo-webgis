//初始化全局定时器对象
var internalValObj = {};
//初始化全局定时器序列
var internalIndex = 0;
//存储类别字段的数组
var typearr = ['水面目标', '陆地目标', '空中目标'];

var socket;
//热力目标树形
var rlmbtree;
//操作状态
var operationstatus = undefined;

//态势专题图树形
var ztttree;

var oldstr = parseInt($("#sjjg_inpt").val());
var newstr;

//接收框选中状态
var checkstatus = true;

_FunctionObject = _FunctionObject || {};
_FunctionObject.$layerOpenIndexArray = [];





$(function () {
    
    
    var rlmbsetting = {
        view: {
            selectedMulti: false
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
            onCheck: rlmbOnCheck
        }
    };
    var rlymbEntityNodes = [{
        id: 1,
        pId: 0,
        name: "目标列表",
        isParent: true
    }];
    $.fn.zTree.init($("#ztree_tsrlyb_mb"), rlmbsetting, rlymbEntityNodes);
    rlmbtree = $.fn.zTree.getZTreeObj("ztree_tsrlyb_mb");

    var zttsetting = {
        check: {
            enable: true,
            chkStyle: "radio",
            radioType: "level"
        },
        async: {
            enable: true,
            url: CONFIG.ZTTSBASE + "/zhts/getZttTreeData",
            autoParam: ["id", "name=n", "level=level", "other=condition"],
            dataFilter: filter
        },
        callback: {
            onCheck: zttOnCheck,
            onClick: zttOnClick
        }
    };


    var zttEntityNodes = [];
    $.fn.zTree.init($("#ztree_ztt"), zttsetting);
    ztttree = $.fn.zTree.getZTreeObj("ztree_ztt");

    $("#mbysbwDiv").mCustomScrollbar({
        theme: 'minimal-dark',
        scrollInertia: 100,
        axis: 'y',
        mouseWheel: {
            enable: true,
            axis: 'y',
            preventDefault: true
        }
    });

    layui.use('form', function () {
        var form = layui.form;
        //显隐控制事件调用
        form.on("checkbox(xysettingck)", function (data) {
            zhtsjs.setSocketV(data.elem, socket);
        });
        //信息来源接收事件调用
        form.on("checkbox(rhjgck)", function (data) {
            //选中哪几个就接收哪几个来源的数据
            //具体操作：接收选中的复选框对应的mq数据，并且往对应的树节点上添加数据
            var flag = data.elem.checked;
            var title = data.elem.getAttribute("title");
            var _ = $(data.elem);
            var dyh = _.data("ckvalue");
            var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", dyh, null);
            //修改默认展开层
            TSTCXYSettingTree.zTree().expandNode(node, true, false);
            var queueLayerArr = manager.getCheckedQueue();
            if (flag) { //接收数据
                //node.checked = flag;
                //这里根据当前打开的功能为主，如果打开的时候战略态势，则默认不选中树形节点；如果点开的时候综合态势，则选中所有树形节点
                node.checked = !ZHTSCONFIG.getzltsShowStatus();
                node.doCheck = flag;
                socket.receivemsgAndShow(dyh, socket.notify, flag);
                //将选中的数据源和对应的航迹图层添加至数组
                var obj = {};
                obj.queuename = dyh;
                obj.ckname = _.attr("title");
                queueLayerArr.push(obj);
                manager.setCheckedQueue(queueLayerArr);
                if("融合结果" === title){
                    dsTstj.show(true);
                }
            } else { //停止接收，清除数据
                //node.checked = flag;
                //这里根据当前打开的功能为主，如果打开的时候战略态势，则默认不选中树形节点；如果点开的时候综合态势，则选中所有树形节点
                node.checked = !ZHTSCONFIG.getzltsShowStatus();
                node.doCheck = flag;
                socket.stopreceivemsg(dyh);
                var arrindex = 0;

                //将取消选中的数据源和对应的航迹图层从数组中移除
                for (var i = 0; i < queueLayerArr.length; i++) {
                    if (queueLayerArr[i].queuename == dyh) {
                        arrindex = i;
                    }
                }
                queueLayerArr.splice(arrindex, 1);
                manager.setCheckedQueue(queueLayerArr);

                //取消接收时，删除父节点下面的所有子节点，避免出现数量统计错误的问题
                var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", dyh, null);
                TSTCXYSettingTree.zTree().removeChildNodes(node);
                node.isParent = true;
                node.othernum = 0;
                var spname = node.name;
                if (spname.indexOf("(") != -1) {
                    spname = spname.substring(0, spname.indexOf("("));
                    node.name = spname;
                    node.spname = spname;
                }
                TSTCXYSettingTree.zTree().updateNode(node);
                //如果是停止融合结果，则清除统计图表
                if("融合结果" === title){
                    dsTstj.reset();
                }
            }
            TSTCXYSettingTree.zTree().updateNode(node);
        });
        //热力演变目标类别
        form.on("checkbox(rlybsettingck)", function (data) {
            var _ = $(data.elem);
            if (data.elem.checked) {
                typearr.push(_.data("ckvalue"));
            } else {
                var index = 0;
                for (var i = 0; i < typearr.length; i++) {
                    if (typearr[i] == _.data("ckvalue")) {
                        index = i;
                    }
                }
                typearr.splice(index, 1);
            }
        });
        //标牌设置和航迹设置单选框事件调用
        form.on('radio', function (data) {
            var d = $(data.elem);
            var _ = data.elem;
            var name = d.attr("name");
            switch (name) {
                case 'label_show': //标牌显隐控制调用事件
                    var flag;
                    if (d.data("ckvalue") == "显示") {
                        flag = true;
                    } else {
                        flag = false;
                    }
                    manager.showTag(flag);
                    break;
                case "radio_mbsize":
                    var size = d.val();
                    if (size == '大号') {
                        socket.setAllTrackerScale(1)
                    } else if (size == "中号") {
                        socket.setAllTrackerScale(0.7)
                    } else {
                        socket.setAllTrackerScale(0.5)
                    }
                    break;
                case 'wf_hjlb': //我方航迹类别
                    wflbcheckRadio(_);
                    break;
                case 'wf_hjtype': //我方航迹类型
                    wfcheckRadio(_);
                    break;
                case 'wf_zhtype': //我方字号大小
                    wfzhcheckRadio(_);
                    break;
                case 'wf_hjcolor': //我方航迹颜色
                    wfhjcolorRadio($(_));
                    break;
                case 'df_hjlb': //敌方航迹类别
                    dflbcheckRadio(_);
                    break;
                case 'df_hjtype': //敌方航迹类别
                    dfcheckRadio(_);
                    break;
                case 'df_zhtype': //敌方字号大小
                    dfzhcheckRadio(_);
                    break;
                case 'df_hjcolor': //敌方航迹颜色
                    dfhjcolorRadio($(_));
                    break;
                case 'label_measure': //距离量算/面积量算
                    var val = d.data("ravalue");
                    var oparr = $("#measuretype option");
                    oparr.each(function () {
                        var od = $(this);
                        if (od.val() == val) {
                            od.attr("selected", "selected");
                            od.prop("selected", "selected");
                        } else {
                            od.removeAttr("selected");
                            od.removeProp("selected", "selected");
                        }
                    });
                    var typeSelect = document.getElementById('measuretype');
                    onchangeHandler(BIGMap.getMap(), BIGMap.getMeasureLayer(), typeSelect);
                    break;
                default:
                    break;
            }
        });
        form.render();
    });

    //初始化时间
    var date = new Date();
    var begindate = new Date(date.getTime() - 172800000);
    var nowdateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate());
    var begindateStr = begindate.getFullYear() + "-" + (begindate.getMonth() + 1) + "-" + (begindate.getDate());
    $("#tsjs_rlstart_time").val(begindateStr);
    $("#tsjs_rlend_time").val(nowdateStr);
    $("#tsjs_rlmbstart_time").val(begindateStr);
    $("#tsjs_rlmbend_time").val(nowdateStr);

    //停止热力演变按钮单击事件
    $("#tsjs_rlstop_btn").click(function () {
        stopShow("stopBtn");
    });

    function stopShow(fromWhere) {
        if (ZHTSCONFIG.getshowstatusVal() == 1) { //综合态势
            //关闭动作不是来自于heatLayer（即不是自己把自己关掉）且checkstatus为false时进入代码
            if (fromWhere != 'heatLayer' && !checkstatus) {
                //弹出确认框
                layer.confirm('热力演变停止，继续显示实时数据，是否继续？', {
                    btn: ['确认', '取消']
                }, function (index) {
                    manager.clearJY(true);
                    if (checkstatus == false) {
                        checkstatus = true;
                    }
                    layer.close(index);
                }, function (index) {
                    layer.close(index);
                    return false;
                });
            }
        } else if (ZHTSCONFIG.getshowstatusVal() == 0) {
            //打开隐藏的战略态势
            if (fromWhere != 'heatLayer' && !ZHTSCONFIG.getzltsShowStatus()) {
                //弹出确认框
                layer.confirm('热力演变停止，继续战略态势数据，是否继续？', {
                    btn: ['确认', '取消']
                }, function (index) {
                    //关闭弹出的确认框
                    layer.close(index);
                    adminByGlx.show();
                    zttObj.show();
                    ZHTSCONFIG.setzltsShowStatus(true);
                }, function (index) {
                    layer.close(index);
                    return false;
                });
            }
        } else {
            if (checkstatus == false) {
                checkstatus = true;
            }
        }
        $("#tsjs_rlstart_btn").removeProp("disabled");
        $("#tsjs_rlstart_btn").removeAttr("disabled");
        $("#tsjs_rlstop_btn").prop("disabled", "true");
        $("#tsjs_rlstop_btn").attr("disabled", "true");
        window.clearInterval(internalValObj);
        BIGMap.getHeatmapLayer().closeTool("tstc");
        BIGMap.getHeatmapLayer().getSource().clear();
        BIGMap.getHeatmapLayer().removeStopHeateShow(stopShow);
    }

    //开始热力演变按钮单击事件
    $("#tsjs_rlstart_btn").click(function () {
        //checkstatus为true并且当前处于综合态势页面时进入代码
        if (checkstatus && ZHTSCONFIG.getshowstatusVal() == 1) {
            layer.confirm('查看热力演变将隐藏实时态势，是否继续？', {}, function (index, layero) {
                layer.close(index);
                startTstcShow();
            }, function (index) {
                layer.close(index);
            });
        } else if (ZHTSCONFIG.getzltsShowStatus() && ZHTSCONFIG.getshowstatusVal() == 0) {

            layer.confirm('查看热力演变将隐藏战略态势，是否继续？', {}, function (index, layero) {
                layer.close(index);

                //隐藏专题图编辑框
                adminByGlx.hide();
                zttObj.hide();
                //收起专题图工具弹出框
                TemplateTSZTT.ClosePanel();
                //隐藏专题图目标，删除标牌
                //设置战略态势打开状态为false
                ZHTSCONFIG.setzltsShowStatus(false);

                startTstcShow();
            }, function (index) {
                layer.close(index);
            });

        } else {
            startTstcShow()
        }
    });

    function startTstcShow() {
        //清空地图所有数据
        BIGMap.getHeatmapLayer().openTool("tstc");
        BIGMap.cleanMap();
        BIGMap.getHeatmapLayer().clearAllStatus();
        BIGMap.getHeatmapLayer().addStopHeateShow(stopShow);
        manager.clearJY(false);
        if (checkstatus == true) {
            //隐藏实时态势数据
            //rlFunHideMB(manager);

            checkstatus = false;
        }
        //设置按钮样式，禁止重复点击
        $("#tsjs_rlstart_btn").prop("disabled", "true");
        $("#tsjs_rlstart_btn").attr("disabled", "true");
        $("#tsjs_rlstop_btn").removeProp("disabled");
        $("#tsjs_rlstop_btn").removeAttr("disabled");

        //查询出某段时间内每天的态势热力数据，循环更换
        internalValObj = window.setInterval(loadTSRLDataBySomeDates, 5000);
    }
    //清除热力按钮单击事件
    $("#rlmb_clear_btn").click(function () {
        if (ZHTSCONFIG.getshowstatusVal() == 1) { //综合态势
            //弹出确认框
            layer.confirm('清除数据，继续显示实时数据，是否继续？', {
                btn: ['确认', '取消']
            }, function (index, layero) {
                //关闭弹出的确认框
                layer.close(index);
                manager.clearJY(true);
                if (checkstatus == false) {

                    checkstatus = true;
                }


                //清除按钮地图热力数据
                BIGMap.getHeatmapLayer().getSource().clear();
                //清除树形
                var rootnode = rlmbtree.getNodeByParam("name", "目标列表", null);
                rlmbtree.removeChildNodes(rootnode);
                rootnode.isParent = true;
                rootnode.checked = false;
                rlmbtree.updateNode(rootnode);
                //设置按钮样式
                $("#rlmb_clear_btn").removeProp("disabled");
                $("#rlmb_clear_btn").removeAttr("disabled");
                operationstatus = undefined;
            }, function (index) {
                layer.close(index);
                return false;
            });
        } else { //战略态势
            if (checkstatus == false) {
                checkstatus = true;
            }
            //清除按钮地图热力数据
            BIGMap.getHeatmapLayer().getSource().clear();
            //清除树形
            var rootnode = rlmbtree.getNodeByParam("name", "目标列表", null);
            rlmbtree.removeChildNodes(rootnode);
            rootnode.isParent = true;
            rootnode.checked = false;
            rlmbtree.updateNode(rootnode);
            //设置按钮样式
            $("#rlmb_clear_btn").removeProp("disabled");
            $("#rlmb_clear_btn").removeAttr("disabled");
            operationstatus = undefined;
        }
    });

    //查看热力数据按钮单击事件
    $("#rlmb_search_btn").click(function () {
        /*获取输入框数据，判断是否添加树形节点[不存在则直接添加，存在则删除之前的添加新的]，请求数据[根据内码请求数据，返回抽稀之后的空间数据]，加载热力数据*/
        //获取输入框数据
        var val = $("#rlmbInpt").attr("data-mbmc");
        var begintime = $("#tsjs_rlmbstart_time").val();
        var endtime = $("#tsjs_rlmbend_time").val();
        var zbnm = $("#rlmbInpt").attr("data-mbnm");

        if (val == undefined) {
            xLayerMessage("请输入要查询的目标名称！");
            return;
        } else {
            if (val.trim().length == 0) {
                xLayerMessage("请输入要查询的目标名称！");
                return;
            }
        }

        if (internalValObj) {
            $("#tsjs_rlstart_btn").removeProp("disabled");
            $("#tsjs_rlstart_btn").removeAttr("disabled");
            $("#tsjs_rlstop_btn").prop("disabled", "true");
            $("#tsjs_rlstop_btn").attr("disabled", "true");
            window.clearInterval(internalValObj);
            BIGMap.getHeatmapLayer().getSource().clear();
        } else {

        }
        if (operationstatus == undefined) {
            //获取选中的全部数据源名称，循环关闭接收
            layer.confirm('查看热力数据将隐藏实时态势，是否继续？', {}, function (index, layero) {
                //清空地图所有数据
                BIGMap.cleanMap();

                manager.clearJY(false);
                if (checkstatus == true) {
                    //隐藏实时态势数据
                    //rlFunHideMB(manager);
                    checkstatus = false;
                }

                layer.close(index);
                //发送ajax请求加载热力目标数据
                loadRLMBData(zbnm, begintime, endtime, val);
                //设置按钮样式
                $("#rlmb_clear_btn").removeProp("disabled");
                $("#rlmb_clear_btn").removeAttr("disabled");
                operationstatus = "active";
            }, function (index) {
                layer.close(index);
            });
        } else {

            //发送ajax请求加载热力目标数据
            loadRLMBData(zbnm, begintime, endtime, val);
        }
    });


    //关闭或者刷新页面时如果定时器仍在进行会导致后台程序默认执行，所以应该停止定时器
    window.onbeforeunload = function () {
        if (internalValObj) {
            internalValObj = window.clearInterval(internalValObj);
        }
    };

    //目标消失处理按钮单击事件
    $("#mbxsclBtn").click(function () {
        var plaingrayTime = Number($("#plaingrayInpt").val());
        var plainfadeTime = Number($("#plainfadeInpt").val());
        var boatgrayTime = Number($("#boatgrayInpt").val());
        var boatfadeTime = Number($("#boatfadeInpt").val());
    });

    //首页底部显隐控制按钮
    $("#bpBtn").click(function () {
        var val = $(this).data("btnval");
        var flag;
        if (val == "显") {
            flag = false;
            $(this).data("btnval", "隐");
            $("#bpBtn i").addClass("fa-eye-slash")
            $("#bpBtn i").removeClass("fa-eye");
        } else {
            flag = true;
            $(this).data("btnval", "显");
            $("#bpBtn i").removeClass("fa-eye-slash");
            $("#bpBtn i").addClass("fa-eye");
        }
        manager.showTag(flag);
    });

    //网格计算-开始
    $("#grid-start-btn").click(function () {
        $("#grid-stop-btn").removeAttr("disabled");
        $(this).attr("disabled", "true");
        GridComputing.start();
    });

    //网格计算-停止
    $("#grid-stop-btn").click(function () {
        $("#grid-start-btn").removeAttr("disabled");
        $(this).attr("disabled", "true");
        GridComputing.stop();
    });

    //首页量算开始按钮单击事件
    $("#startmeasureBtn").click(function () {
        //开始量算
        enableMeasure();
    });

    //首页量算停止按钮单击事件
    $("#stopmeasureBtn").click(function () {
        $(this).data("status", 1);
        //停止量算
        disableMeasure(BIGMap.getMap());
    });

    //首页量算清除按钮单击事件
    $("#clearmeasureBtn").click(function () {
        //清除量算图层，去掉提示框
        $(".tooltip2.tooltip-static").remove();
        BIGMap.getMeasureLayer().getSource().clear();
    });

    //初始化量算功能
    var measure = new Measurement(BIGMap.getMap(), BIGMap.getMeasureLayer());
    disableMeasure(BIGMap.getMap());

    //量算弹出框关闭时的回调函数
    TemplateDrawMeasure.ClosePanelCallback = function () {
        $(this).data("status", 1);
        //停止量算
        disableMeasure(BIGMap.getMap());
    };
    //专题图弹框关闭时的回调函数
    TemplateTSZTT.ClosePanelCallback = function () {
        //注销transform
        zttObj.deactiveTransformInteraction();
        ZHTSCONFIG.setShowMenu(false);
        adminByGlx.enableEdit(!adminByGlx.enableEdit());
    };


    //方向态势跳转
    _FunctionObject.DirectionPositionClickCallback = function (_key) {
        //如果没有处于综合态势页面，则触发一下综合态势菜单点击事件
        if(ZHTSCONFIG.showstatus == 0) {$("#leftmenu").find("[x-button-name='zhts']").click();}
        //高亮展示方向态势菜单 -- 开始
        $('.btn-by-glx').removeClass("btn-bean-hover");
        $("[x-button-name='fxts']").addClass("btn-bean-hover");
        //高亮展示方向态势菜单 -- 结束
        var coordinate = [];

        // 4   5   6   7    bsid
        // 东  西  南  北 
        var  param ;    // 确定 传递的 参数 bsid
        var  layer ;    // 确定 传递的 矢量图层
        var  coordinate;
        //暴露给其它地方调用,val代表方位关键字
        switch (_key) {
            case 'east': //东
                param = {BSID:4};
                layer = fxtsst.layers.dongLayer;
                coordinate = [13913711.277947994, 3352944.6588279027];
                //BIGMap.flyTo(coordinate, 2000, 1, function (complete) {}, function () { });
                break;
            case 'south': //南
                param = {BSID:6};
                layer = fxtsst.layers.nanLayer;
                coordinate = [13158379.110292422, 1383672.4976585633];
                //BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
                break;
            case 'western': //西
                param = {BSID:5};
                layer = fxtsst.layers.xiLayer;
                coordinate = [8984917.352764005, 3269839.4667610726];
                //BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
                break;
            case 'north': //北
                param = {BSID:7};
                layer = fxtsst.layers.beiLayer;
                coordinate = [14013047.521464799, 5694252.859132482];
                //BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
                break;
            case 'center': //中
                param = {BSID:7};    
                layer = fxtsst.layers.zhongLayer;
                coordinate = [13154506.819765698, 4794130.414046246];
                //BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
                break;
            default:
                break;
        }

        //给出当前所处方向的提示框  ---  开始
        var text = $("[x-button-name='fxts-"+_key+"']").find("font").html();
        // for(var i=0;i< _FunctionObject.$layerOpenIndexArray.length;i++){
        //     var index = _FunctionObject.$layerOpenIndexArray[i];
        //     layui.layer.close(index);
        // }
        var layerIndex =   layui.layer.msg(text+"态势",{time:3000});
        // _FunctionObject.$layerOpenIndexArray.push(layerIndex);
        // var _msg = $(".layui-layer.layui-layer-dialog.layui-layer-msg");
        // _msg.css({
        //     "top": "10px"
        // });
        //给出当前所处方向的提示框  ---  结束

        BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
        // 如果 方向值 为 true  就查询目标点  并且上图
        if(fxtsst.fxMark[_key]){
            zzfwnl.clearMap();
            $.ajax({url:fxtsst.baseUrl.bsslUrl,data:param,success:function(data){
                var bdnms = [];
                var mbnms = [];
                
                $.each(data,function(i,v){
                    var nm ;
                    if(v.mbzl==fxtsst.targetType.ssmb){
                        mbnms.push(v.mbnm);
                    }else if(v.mbzl==fxtsst.targetType.bdmb){
                        bdnms.push(v.bdnm);
                    }
                   
                    
                })
                if(bdnms.length>0){
                    $.post(fxtsst.baseUrl.bdmbPointUrl,{"bdnms":bdnms.toString()},function(data){   // 插入部队目标 点
                        fxtsst.insertMBPoint(data,layer);
                        $.each(data,function(i,v){
                            // console.log(v);
                            var point = [parseFloat(v.JDUse),parseFloat(v.WDUse)];
                            zzfwnl.actionScope(v.BDNM,v.BDFH,point,fxtsst.targetType.bdmb);
                            
                            // var treeObj = $.fn.zTree.getZTreeObj("tree");
                           
                            fxtsst.getTargetSldjData(layer,fxtsst.targetType.ssmb,v.BDNM);
                            zzfwnl.setTreeNodeAllChecked(true);

                            //fxtsst.getTargetSldjData(layer,fxtsst.targetType.ssmb,v.BDNM);
                           
                        })
                    })
                }
                if(mbnms.length>0){
                    $.post(fxtsst.baseUrl.ssmbPointUrl,{"mbnms":mbnms.toString()},function(data){   //插入设施目标点
                        fxtsst.insertMBPoint(data,layer);
                        $.each(data,function(i,v){
                            // console.log(v);
                            var point = [parseFloat(v.JDUse),parseFloat(v.WDUse)];
                            
                            //fxtsst.getTargetSldjData(layer,fxtsst.targetType.ssmb,v.MBNM);
                            
                            zzfwnl.actionScope(v.MBNM,v.MBMC,point,fxtsst.targetType.ssmb);
                            fxtsst.getTargetSldjData(layer,fxtsst.targetType.ssmb,v.MBNM);
                            //fxtsst.getTargetSldjData(layer,fxtsst.targetType.ssmb,v.MBNM);
                            //
                            zzfwnl.setTreeNodeAllChecked(true);
                        })
                    })
                }
               
            }})
            
            fxtsst.fxMark[_key] = false;
            // BIGMap.flyTo(coordinate, 2000, 1, function (complete) { }, function () { });
            
        }else{
            AttackRange.clearAllRange();    // 清除所有包略图 层
            fxtsst.removeLayer(layer);      // 移除目标点
            zzfwnl.cleanrTreeNodes();       // 清除tree 节点 并关闭树
            fxtsst.fxMark[_key] = true;     
        }
        
    }

    //分域态势回调方法
    _FunctionObject.FYTSClickCallback = function (_key) {
        dsTstj.show(false);
        //给出当前所处分域的提示框  ---  开始
        var text = $("[x-button-name='fyts-"+_key+"']").find("font").html();
        // for(var i=0;i< _FunctionObject.$layerOpenIndexArray.length;i++){
        //     var index = _FunctionObject.$layerOpenIndexArray[i];
        //     layui.layer.close(index);
        // }
        var layerIndex =   layui.layer.msg(text+"态势",{time:3000});
        // _FunctionObject.$layerOpenIndexArray.push(layerIndex);
        // var _msg = $(".layui-layer.layui-layer-dialog.layui-layer-msg");
        // _msg.css({
        //     "top": "10px"
        // });
        //给出当前所处分域的提示框  ---  结束
        //获取综合态势接收显隐配置对象
        var zhtssourceObj = ZHTSCONFIG.getzhtssourceObj();
        switch (_key) {
            case 't': //天情
                //只显示航侦态势的数据，只选中联合空情树形节点
                var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_HZTS_10", null);
                node.checked = true;
                TSTCXYSettingTree.zTree().updateNode(node);

                $(".layui-form[lay-filter='tssettingform']").find("[lay-filter='rhjgck']").each(function (index, el) {
                    if ($(el).attr("data-ckvalue") == "SSTS_HZTS_10") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            return;
                        }
                        if (!zhtssourceObj[$(el).attr("data-ckvalue")]) {
                            hideZLTS();
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = true;
                        }
                        layui.form.val("tssettingform", {
                            "mqhzts": true
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHKQ_3") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhkq": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHHQ_1") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhhq": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_RHJG_4") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqrhjg": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_JZTS_2") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqjzts": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_DZTS_5") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqdzts": false
                        })
                    }
                });
                ZHTSCONFIG.setzhtssourceObj(zhtssourceObj);
                break;
            case 'k': //空情
                //只显示联合空情的数据，只选中联合空情树形节点
                var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_LHKQ_3", null);
                node.checked = true;
                TSTCXYSettingTree.zTree().updateNode(node);

                $(".layui-form[lay-filter='tssettingform']").find("[lay-filter='rhjgck']").each(function (index, el) {
                    if ($(el).attr("data-ckvalue") == "SSTS_HZTS_10") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqhzts": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHKQ_3") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            return;
                        }
                        if (!zhtssourceObj[$(el).attr("data-ckvalue")]) {
                            hideZLTS();
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = true;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhkq": true
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHHQ_1") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhhq": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_RHJG_4") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqrhjg": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_JZTS_2") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqjzts": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_DZTS_5") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqdzts": false
                        })
                    }
                });
                ZHTSCONFIG.setzhtssourceObj(zhtssourceObj);
                break;
            case 'l': //陆情

                break;
            case 'h': //海情
                //只显示联合海情的数据，只选中联合空情树形节点
                var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_LHHQ_1", null);
                node.checked = true;
                TSTCXYSettingTree.zTree().updateNode(node);

                $(".layui-form[lay-filter='tssettingform']").find("[lay-filter='rhjgck']").each(function (index, el) {
                    if ($(el).attr("data-ckvalue") == "SSTS_HZTS_10") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqhzts": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHKQ_3") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhkq": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_LHHQ_1") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            return;
                        }
                        if (!zhtssourceObj[$(el).attr("data-ckvalue")]) {
                            hideZLTS();
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = true;
                        }
                        layui.form.val("tssettingform", {
                            "mqlhhq": true
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_RHJG_4") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqrhjg": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_JZTS_2") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqjzts": false
                        })
                    } else if ($(el).attr("data-ckvalue") == "SSTS_DZTS_5") {
                        if ($(el).next().hasClass("layui-form-checked")) {
                            $(el).next().trigger("click");
                            zhtssourceObj[$(el).attr("data-ckvalue")] = false;
                        }
                        layui.form.val("tssettingform", {
                            "mqdzts": false
                        })
                    }
                });
                ZHTSCONFIG.setzhtssourceObj(zhtssourceObj);
                break;
            default:
                break;
        }
        //高亮展示分域态势菜单 -- 开始
        $('.btn-by-glx').removeClass("btn-bean-hover");
        $("[x-button-name='fyts']").addClass("btn-bean-hover");
        //高亮展示分域态势菜单 -- 结束
    }

    /**
     * 用户登录 by glx
     */
    function rlyb() {
        //隐藏专题图编辑框
        adminByGlx.hide();
        zttObj.hide();
        //收起专题图工具弹出框
        TemplateTSZTT.ClosePanel();
        //隐藏专题图目标，删除标牌

        //设置战略态势打开状态为false
        ZHTSCONFIG.setzltsShowStatus(false);


        if (internalValObj) {
            window.clearInterval(internalValObj);
        }
        BIGMap.getHeatmapLayer().getSource().clear();
        $('.btn-by-glx').removeClass("btn-bean-hover");
        $(this).addClass("btn-bean-hover");
    }
    $("#loginBtn").click(function () {
        var username = $("#username").val();
        var password = $("#password").val();
        //console.log("用户验证：", username + "," + password);
        if (username == "admin" && password == "admin") {
            //success:function(){
            $("#loginFirst").css("display", 'none');
            //}
        } else {
            layer.alert('用户名密码错误！', function (index) {
                layer.close(index);
            });
        }
    });
    var newBtn = $("#zttsCreateBtn");
    newBtn.click(function () {

        //判断时间是否有效
        var $newType = $("#zlts-type");
        var $newTime = $("#zlts-date");
        if ($newType.val().length < 1) {
            layer.msg("请选择新建专题的类型");
            return false;
        } else if ($newTime.val().length < 1) {
            layer.msg("请选择新建专题的时间");
            return false;
        }

        if (internalValObj) {
            window.clearInterval(internalValObj);
        }

        $("#tsjs_rlstart_btn").removeProp("disabled");
        $("#tsjs_rlstart_btn").removeAttr("disabled");
        $("#tsjs_rlstop_btn").prop("disabled", "true");
        $("#tsjs_rlstop_btn").attr("disabled", "true");
        $("#rlmb_clear_btn").prop("disabled", "true");
        $("#rlmb_clear_btn").attr("disabled", "true");

        BIGMap.getHeatmapLayer().getSource().clear();
        manager.clearJY(false);
        ZHTSCONFIG.setshowstatusVal(0);
        adminByGlx.show();
        zttObj.show();



        //判断是否处于打开战略态势功能当中，是的话则不处理，不是的话则重新加载数据
        if (!ZHTSCONFIG.getzltsShowStatus()) { //重新查询，并且加载
            //设置战略态势打开状态为true
            ZHTSCONFIG.setzltsShowStatus(true);
        }

        $('.btn-by-glx').removeClass("btn-bean-hover");
        $("[x-button-name='zlts']").addClass("btn-bean-hover");

        adminByGlx.enableEdit(true);
        adminByGlx.setData();
        zttObj.clean();
        zttObj.queryAllMB();
        //新建的专题图id必须要设置成undefined
        zttObj.currentZtt = zttObj.currentZtt || {};
        zttObj.currentZtt.id = undefined;
        zttObj.deactiveTransformInteraction();
        zttObj.activeTransformInteraction();

        zttObj.currentZtt.zttdate = xUtilBase.classDate.responseDate(new Date(), "yyyy-mm-dd");
        _FcuntionObjectZTT.SetPanelBindData(zttObj.currentZtt);
    });

    //复制专题图 //TODO
    var copyBtn = $("#zttsCopyBtn");
    copyBtn.click(function () {
        if (internalValObj) {
            window.clearInterval(internalValObj);
        }
        $("#tsjs_rlstart_btn").removeProp("disabled");
        $("#tsjs_rlstart_btn").removeAttr("disabled");
        $("#tsjs_rlstop_btn").prop("disabled", "true");
        $("#tsjs_rlstop_btn").attr("disabled", "true");
        $("#rlmb_clear_btn").prop("disabled", "true");
        $("#rlmb_clear_btn").attr("disabled", "true");
        zttObj.copyThisSelectedToNewLayer();
        return false;
        BIGMap.getHeatmapLayer().getSource().clear();
        manager.clearJY(false);
        ZHTSCONFIG.setshowstatusVal(0);
        adminByGlx.show();
        zttObj.show();


        //判断是否处于打开战略态势功能当中，是的话则不处理，不是的话则重新加载数据
        if (!ZHTSCONFIG.getzltsShowStatus()) { //重新查询，并且加载
            //设置战略态势打开状态为true
            ZHTSCONFIG.setzltsShowStatus(true);
        }

        $('.btn-by-glx').removeClass("btn-bean-hover");
        $("[x-button-name='zlts']").addClass("btn-bean-hover");

        zttObj.clean();
        // adminByGlx.enableEdit(true);
        zttObj.deactiveTransformInteraction();
        zttObj.activeTransformInteraction();
        zttObj.copyZTT();
        ZHTSCONFIG.setShowMenu(true);
    });

    //保存专题图
    var saveBtn = $("#zttsSaveBtn");
    saveBtn.click(function () {
        zttObj.saveZtt();
        zttObj.deactiveTransformInteraction();
        ZHTSCONFIG.setShowMenu(false);
    });

    //取消发布专题图
    var unPubBtn = $("#zttsunPubBtn");
    unPubBtn.click(function () {

        layer.confirm('删除当前专题图，以后则不可见，是否继续？', {
            btn: ['确认', '取消']
        }, function (index) {

            //关闭弹出的确认框
            layer.close(index);

            //判断是否有定时器
            if (internalValObj) {
                window.clearInterval(internalValObj);
            }
            $("#tsjs_rlstart_btn").removeProp("disabled");
            $("#tsjs_rlstart_btn").removeAttr("disabled");
            $("#tsjs_rlstop_btn").prop("disabled", "true");
            $("#tsjs_rlstop_btn").attr("disabled", "true");
            $("#rlmb_clear_btn").prop("disabled", "true");
            $("#rlmb_clear_btn").attr("disabled", "true");

            zttObj.httpActionRemoveZTT();
            return;
            BIGMap.getHeatmapLayer().getSource().clear();
            manager.clearJY(false);
            ZHTSCONFIG.setshowstatusVal(0);
            adminByGlx.show();
            zttObj.show();

            //判断是否处于打开战略态势功能当中，是的话则不处理，不是的话则重新加载数据
            if (!ZHTSCONFIG.getzltsShowStatus()) { //重新查询，并且加载
                //设置战略态势打开状态为true
                ZHTSCONFIG.setzltsShowStatus(true);
            }

            $('.btn-by-glx').removeClass("btn-bean-hover");
            $("[x-button-name='zlts']").addClass("btn-bean-hover");

            // adminByGlx.enableEdit(true);
            zttObj.deactiveTransformInteraction();
            zttObj.activeTransformInteraction();
            //取消发布当前专题图
            zttObj.unPublishZTT();
            ZHTSCONFIG.setShowMenu(true);

        }, function (index) {
            layer.close(index);
            return false;
        });

    });

    //刷新当前专题图
    var refreshBtn = $("#zttsRereshBtn");
    refreshBtn.click(function () {
    	/*
        ztttree.reAsyncChildNodes(null, "refresh");
        zttObj.cleanNoTagMB();
        zttObj.clean();
        zttObj.queryZTTByCondition();
        ZHTSCONFIG.setShowMenu(false);
        */
       zttObj.refreshThisZTT();
    });

    //态势专题图编辑按钮
    var editBtn = $("#zttsEditBtn");
    editBtn.click(function () {
        adminByGlx.enableEdit(!adminByGlx.enableEdit());
        zttObj.queryAllMB();
        zttObj.deactiveTransformInteraction();
        zttObj.activeTransformInteraction();
        ZHTSCONFIG.setShowMenu(true);
    })
    var addPanlBtn = $("#zttsAddBtn");
    addPanlBtn.click(function () {
        var _this = this;
        ZHTSCONFIG.setShowMenu(true);
        var element = $("#window-bhpanl-tabs");
        element.empty();
        if (_this._OpenIndex != undefined) {
            layer.close(_this._OpenIndex);
            element.css({
                "display": "none"
            });
            _this._OpenIndex = undefined;
            return false;
        }
        layer.open({
            type: 1,
            title: "<i class='iconfont fa fa-gears'></i><font>标绘面板</font>",
            shadeClose: false,
            shade: false,
            btn: false,
            scrollbar: true,
            content: element,
            area: ["322px", "500px"],
            success: function (dom, index) {
                _this._OpenIndex = index;
                dom.css({
                    "left": "20px",
                    "top": "100px",
                    "right": "auto",
                    "bottom": "auto"
                });
                //_FunctionObject.xLayerMessage("弹出成功");
                zttObj.deactiveTransformInteraction();
                zttObj.activeTransformInteraction();
            },
            cancel: function () {
                element.css({
                    "display": "none"
                });
                _this._OpenIndex = undefined;
            }
        });
        bhPanl.panl('#window-bhpanl-tabs');

    });

});

//初始化热力演变树形数据
function initTSRLGJQYTree() {
    var setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        }
    };
    //发送ajax请求获取树形数据
    $.ajax({
        type: "POST",
        url: CONFIG.ZTTSBASE + "/heatmap/loadTree",
        data: "",
        async: true,
        success: function (obj) {
            // var data = obj.data;
            // for (var i = 0; i < data.length; i++) {
                // if (data[i].icon !== undefined) {
                    // data[i].icon = "../resouces/country/24/" + data[i].icon + ".png";
                // }
            // }
            // $.fn.zTree.init($("#ztree_tsrlyb_gjqy"), setting, data);
            // var zTree = $.fn.zTree.getZTreeObj("ztree_tsrlyb_gjqy");
            // zTree.setting.check.chkboxType = {
                // "Y": "ps",
                // "N": "ps"
            // };
        }
    });
}

//查询某一天的态势热力数据
function loadTSRLDataBySomeDates() {
    //获取态势热力演变设置弹出框内容
    var leibie = "";
    for (var i = 0; i < typearr.length; i++) {
        leibie += "'" + typearr[i] + "'" + ",";
    }
    leibie = leibie.substring(0, leibie.length - 1);
    //获取开始时间、结束时间
    var beginTime = $("#tsjs_rlstart_time").val();
    var endTime = $("#tsjs_rlend_time").val();

    var sjjg = parseInt($("#sjjg_inpt").val());
    newstr = sjjg;
    if (oldstr != newstr) {
        internalIndex = 0;
        oldstr = newstr;
    }
    if (isNaN(sjjg)) {
        xLayerMessage("请输入合法的数值！");
        return;
    }
    var arr = getDateStrArr(beginTime, endTime);
    if (sjjg > arr.length) {
        xLayerMessage("数据间隔超过日期间隔！");
        return;
    }

    var newArr = getSJJGDateStrArr(arr, sjjg);


    //获取选中树形节点数据
    var countrys = "";
    var zTree = $.fn.zTree.getZTreeObj("ztree_tsrlyb_gjqy");
    if (!zTree) {
        return;
    }
    var nodes = zTree.getCheckedNodes(true);
    if (nodes.length > 0) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].name !== "国家/地区") {
                countrys += "'" + nodes[i].name + "'" + ",";
            }
        }
        countrys = countrys.substring(0, countrys.length - 1);
    }
    //发送ajax请求获取热力数据
    $.ajax({
        type: "POST",
        url: CONFIG.ZTTSBASE + "/heatmap/queryDataByDateNew",
        data: {
            "dateStr": arr[internalIndex],
            "leibie": leibie,
            "countrys": countrys
        },
        //async:false,
        beforeSend: function () { },
        success: function (obj) {
            var data = obj.data;
            //转换成wkt格式加载到地图上
            if (data.length > 0) {
                $("#rltime_span").text(arr[internalIndex]);
                BIGMap.getHeatmapLayer().getSource().clear();
                var format = new ol.format.WKT();
                var features = new Array();
                for (var i = 0; i < data.length; i++) {
                    var wkt = data[i].geom;
                    if (wkt) {
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        //将线转换为点
                        var coordinates = feature.getGeometry().getCoordinates();
                        var mulipoint = new ol.geom.MultiPoint();
                        mulipoint.setCoordinates(coordinates);
                        var f = new ol.Feature({
                            geometry: mulipoint
                        });
                        features.push(f);
                    }
                }
                BIGMap.getHeatmapLayer().getSource().addFeatures(features);
            }
        },
        complete: function () {
            //序列加一
            internalIndex++;
            //如果取到最后一个日期，则下一个日期从第一个开始
            if (internalIndex >= newArr.length) {
                internalIndex = 0;
            }
        },
        error: function (req, status, error) { //同时，在数据请求的时候可能会遇到后台服务停止或者崩溃的情况，则仍需要停止定时器，结束后台调用
            if (status == "timeout") {
                if (internalValObj) {
                    internalValObj = window.clearInterval(internalValObj);
                }
                console.log("请求超时，请稍后再试!！");
                return;
            } else if (status === "error") {
                if (internalValObj) {
                    internalValObj = window.clearInterval(internalValObj);
                }
                console.log("数据请求失败，请稍后再试!如果还未解决，请联系管理员！");
                return;
            }
            return;
        }
    });
}
//传递时间数组，和时间间隔，返回对应时间段内的数组数据
function getSJJGDateStrArr(dataArr, sjjg) {
    var arr = new Array();
    var size = dataArr.length;
    var indexArr = new Array();
    if (size % sjjg == 0) { //如果能除尽，则只循环对应间隔数据，拼接新数组
        for (var i = 0; i < size;) {
            i = i + sjjg;
            indexArr.push(i);
        }
    } else { //除不尽，也循环，最后的数据拼接成一个数组
        for (var i = 0; i < size;) {
            i = i + sjjg;
            if (i < size) {
                indexArr.push(i);
            }
        }
    }

    if (sjjg == 1) { //如果数据间隔是1
        for (var x = 0; x < indexArr.length; x++) {
            var arrIndex = indexArr[x] - 1;
            var begin = dataArr[arrIndex];
            var end = begin;
            arr.push(begin);
        }
    } else { //如果不是1
        for (var x = 0; x < indexArr.length; x++) {
            var beginIndex = indexArr[x] - sjjg;
            var endIndex = indexArr[x] - 1;
            var begin = dataArr[beginIndex];
            var end = dataArr[endIndex];
            arr.push(begin + ":" + end);
        }

        if (size % sjjg != 0) {
            if (size % sjjg == 1) { //直接添加数组最后一位
                arr.push(dataArr[size - 1]);
            } else { //添加数组不足间隔的第一位和最后一位
                var begin = dataArr[size - sjjg + 1];
                var end = dataArr[size - 1];
                arr.push(begin + ":" + end);
            }
        }

    }

    return arr;
}

//传递开始日期和结束日期，获取所有日期数据
function getDateStrArr(beginTime, endTime) {
    var arr = new Array();
    var beginYear = beginTime.split("-")[0];
    var beginMonth = beginTime.split("-")[1];
    var beginDate = beginTime.split("-")[2];
    var endYear = endTime.split("-")[0];
    var endMonth = endTime.split("-")[1];
    var endDate = endTime.split("-")[2];
    var d1 = new Date(beginYear, beginMonth - 1, beginDate);
    var d2 = new Date(endYear, endMonth - 1, endDate);
    var offset = (d2.getTime() - d1.getTime()) / 86400000;
    for (var i = 0; i <= offset; i++) {
        var ds = new Date(d1.getTime() + 86400000 * i);
        var m = ds.getMonth() + 1;
        var d = ds.getDate();
        var dateStr = ds.getFullYear() + "-" + (m < 10 ? ('0' + m) : m) + "-" + (d < 10 ? ('0' + d) : d);
        arr.push(dateStr);
    }
    return arr;
}


//提示框
function xLayerMessage(text, obj) {
    layer.msg(text, obj);
    var _msg = $(".layui-layer.layui-layer-dialog.layui-layer-msg");
    _msg.css({
        "top": "-1px"
    });
}

//发送ajax请求加载热力目标数据
function loadRLMBData(zbnm, begintime, endtime, val) {
    var format = new ol.format.WKT();
    var source = BIGMap.getHeatmapLayer().getSource();

    //ajax请求数据
    $.ajax({
        type: "POST",
        url: CONFIG.ZTTSBASE + "/heatmap/queryDataByZBNMandDate",
        data: {
            "zbnm": zbnm,
            "begintime": begintime,
            "endtime": endtime
        },
        success: function (obj) {
            var data = obj.data;
            if (data.geom) {
                //获取根节点
                var rootnode = rlmbtree.getNodeByParam("name", "目标列表", null);
                rootnode.checked = true;
                rlmbtree.updateNode(rootnode);
                //获取子节点
                var childnode = rlmbtree.getNodeByParam("name", val, rootnode);
                if (childnode == null) { //直接添加
                    var node = {};
                    node.name = val;
                    node.geom = data.geom;
                    node.checked = true;
                    rlmbtree.addNodes(rootnode, node)[0];

                    //加载热力
                    var features = new Array();
                    var wkt = data.geom;
                    if (wkt) {
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        //将线转换为点
                        var coordinates = feature.getGeometry().getCoordinates();
                        var mulipoint = new ol.geom.MultiPoint();
                        mulipoint.setCoordinates(coordinates);
                        var f = new ol.Feature({
                            geometry: mulipoint
                        });
                        f.setId(val);
                        features.push(f);
                    }

                    BIGMap.getHeatmapLayer().getSource().addFeatures(features);


                } else { //删除之前的，重新添加
                    rlmbtree.removeNode(childnode);
                    var node = {};
                    node.name = val;
                    node.geom = data.geom;
                    node.checked = true;
                    rlmbtree.addNodes(rootnode, node)[0];

                    //清除之前的热力，加载新的
                    var f = source.getFeatureById(val);
                    if (f) {
                        source.removeFeature(f);
                    }


                    //加载热力
                    var features = new Array();
                    var wkt = data.geom;
                    if (wkt) {
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        //将线转换为点
                        var coordinates = feature.getGeometry().getCoordinates();
                        var mulipoint = new ol.geom.MultiPoint();
                        mulipoint.setCoordinates(coordinates);
                        var f = new ol.Feature({
                            geometry: mulipoint
                        });
                        f.setId(val);
                        features.push(f);
                    }

                    BIGMap.getHeatmapLayer().getSource().addFeatures(features);

                }
            } else {
                xLayerMessage("目标暂无热力数据！");
                return;
            }

        }
    });
}

function enableMeasure() {
    measureflag = true;
    //先禁用量算再启用量算
    disableMeasure(BIGMap.getMap());
    var measureLayer = BIGMap.getMeasureLayer();
    addInteraction(BIGMap.getMap(), measureLayer);
    BIGMap.getMap().on('pointermove', pointerMoveHandler);
}

//热力目标树形选中节点调用方法
function rlmbOnCheck(e, treeId, treeNode) {
    var format = new ol.format.WKT();
    var source = BIGMap.getHeatmapLayer().getSource();
    if (treeNode.name == "目标列表") {
        var nodes = treeNode.children;
        if (treeNode.checked) {
            for (var i = 0; i < nodes.length; i++) {
                var nd = nodes[i];
                var f = source.getFeatureById(nd.name);
                //加载热力
                var features = new Array();
                var wkt = nd.geom;
                if (wkt) {
                    var feature = format.readFeature(wkt, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });
                    //将线转换为点
                    var coordinates = feature.getGeometry().getCoordinates();
                    var mulipoint = new ol.geom.MultiPoint();
                    mulipoint.setCoordinates(coordinates);
                    var f = new ol.Feature({
                        geometry: mulipoint
                    });
                    f.setId(nd.name);
                    features.push(f);
                }
                BIGMap.getHeatmapLayer().getSource().addFeatures(features);
            }
        } else {
            for (var i = 0; i < nodes.length; i++) {
                var nd = nodes[i];
                var f = source.getFeatureById(nd.name);
                source.removeFeature(f);
            }
        }
    } else {
        var f = source.getFeatureById(treeNode.name);
        if (treeNode.checked) {

            //加载热力
            var features = new Array();
            var wkt = treeNode.geom;
            if (wkt) {
                var feature = format.readFeature(wkt, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                //将线转换为点
                var coordinates = feature.getGeometry().getCoordinates();
                var mulipoint = new ol.geom.MultiPoint();
                mulipoint.setCoordinates(coordinates);
                var f = new ol.Feature({
                    geometry: mulipoint
                });
                f.setId(treeNode.name);
                features.push(f);
            }
            BIGMap.getHeatmapLayer().getSource().addFeatures(features);
        } else {
            source.removeFeature(f);
        }
    }

}




//隐藏或者显示实时态势数据
function rlFunHideMB(manager) {
    var tracks = manager.mbLayer.getSource().getFeatures();
    for (var i = 0; i < tracks.length; i++) {
        var mb = tracks[i];
        var prop = mb.getProperties();
        var queue = prop.queue;
        var ph = prop.ph;
        var jm = prop.jm;
        var fid = queue + "_" + ph;
        if (jm != 1) {
            var hjLayer = manager.getLayerByQueueName(queue);
            mb.getStyle().getImage().setOpacity(0);
            var tag = mb.getLinkedTag();
            mb.set("show", false);
            if (tag) {
                manager.tagmanager.removeLinkedTag(tag);
            }

            //隐藏目标、对应航线、颜色
            manager.hideMB(hjLayer, fid);
        }
    }
    //所有树形节点都更新为当前选中状态
    var node = TSTCXYSettingTree.zTree().getNodeByParam("dyh", "SSTS_RHJG_4", null);
    node.checked = false;
    TSTCXYSettingTree.zTree().updateNode(node);
    var n1 = TSTCXYSettingTree.zTree().getNodesByParam("level", 1, null);
    for (var i = 0; i < n1.length; i++) {
        var n = n1[i];
        n.checked = false;
        TSTCXYSettingTree.zTree().updateNode(n);
    }
    var n2 = TSTCXYSettingTree.zTree().getNodesByParam("level", 2, null);
    for (var j = 0; j < n2.length; j++) {
        var n = n2[j];
        n.checked = false;
        TSTCXYSettingTree.zTree().updateNode(n);
    }
    var n3 = TSTCXYSettingTree.zTree().getNodesByParam("level", 3, null);
    for (var k = 0; k < n3.length; k++) {
        var n = n3[k];
        n.checked = false;
        TSTCXYSettingTree.zTree().updateNode(n);
    }



}

//专题图树形展开选中节点事件
function zttOnCheck(event, treeId, treeNode) {
    //清除图层及document
    zttObj.clearThisLayer();
    _FcuntionObjectZTT.$typeSelect.val("");
    _FcuntionObjectZTT.$createTime.val("");

    if (treeNode.checked === false) {
        return;
    }

    //取出ztree节点选中数据
    var nodes = ztttree.getCheckedNodes(true);
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id != treeNode.id) {
            nodes[i].checked = false;
        }
        ztttree.updateNode(nodes[i]);
    }

    //每次去请求最新数据
    $.ajax({
        type: "POST",
        url: CONFIG.ZTTSBASE + "/zhts/getZttById",
        data: {
            typename: treeNode.typeName,
            id: treeNode.other
        },
        async: true,
        success: function (result) {
            if (!result) {
                layer.msg("服务器返回数据失败");
                return;
            }
            if (result.code == "0") {
                var data = result.data;
                if (data) {
                    //加载专题图
                    zttObj.addToLayer(data);
                    _FcuntionObjectZTT.SetPanelBindData(data);
                    treeNode.otherParam = data;
                    ztttree.updateNode(treeNode);
                } else {
                    layer.msg("服务器返回数据不完整");
                }
            } else {
                layer.msg(result.msg);
            }
        }
    });
}

//专题图树形展开点击节点事件
function zttOnClick(event, treeId, treeNode) {
    if (treeNode.level == 3) {
        //清除图层及document
        zttObj.clearThisLayer();
        _FcuntionObjectZTT.$typeSelect.val("");
        _FcuntionObjectZTT.$createTime.val("");

        var nodes = ztttree.getCheckedNodes(true);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id != treeNode.id) {
                nodes[i].checked = false;
            }
            ztttree.updateNode(nodes[i]);
        }
        treeNode.checked = true;
        ztttree.updateNode(treeNode);
        //每次去请求最新数据
        $.ajax({
            type: "POST",
            url: CONFIG.ZTTSBASE + "/zhts/getZttById",
            data: {
                typename: treeNode.typeName,
                id: treeNode.other
            },
            async: true,
            success: function (result) {
                if (!result) {
                    layer.msg("服务器返回数据失败");
                    return;
                }
                if (result.code == "0") {
                    var data = result.data;
                    if (data) {
                        //加载专题图
                        zttObj.addToLayer(data);
                        _FcuntionObjectZTT.SetPanelBindData(data);
                        treeNode.otherParam = data;
                        ztttree.updateNode(treeNode);
                    } else {
                        layer.msg("服务器返回数据不完整");
                    }
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
}

//设置当前选中时反显控制面板
_FcuntionObjectZTT.$typeSelect = $("#zlts-type");
_FcuntionObjectZTT.$createTime = $("#zlts-date");
_FcuntionObjectZTT.SetPanelBindData = function (data) {
    _FcuntionObjectZTT.$typeSelect.val(data.typename);
    var _timeVal = ("" + data.zttdate).replace(/(\s+.*)/g, "");
    _FcuntionObjectZTT.$createTime.val(_timeVal);
}


function filter(treeId, parentNode, childNodes) {
    if (!childNodes) return null;
    for (var i = 0, l = childNodes.length; i < l; i++) {
        childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
    }
    return childNodes;
}

//隐藏战略态势功能
function hideZLTS() {
    manager.clearJY(false);
    //隐藏专题图编辑框
    adminByGlx.hide();
    adminByGlx.enableEdit(false);
    zttObj.hide();
    //收起专题图工具弹出框
    TemplateTSZTT.ClosePanel();
    //隐藏专题图目标，删除标牌

    //设置战略态势打开状态为false
    ZHTSCONFIG.setzltsShowStatus(false);

    if (internalValObj) {
        window.clearInterval(internalValObj);
    }
    BIGMap.getHeatmapLayer().getSource().clear();
    ZHTSCONFIG.setshowstatusVal(1);
    $('.btn-by-glx').removeClass("btn-bean-hover");
}