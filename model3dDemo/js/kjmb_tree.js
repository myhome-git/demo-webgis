czmlManagers = new czmlManager(viewer);

function allKjmbTree(pxlx) {
    czmlManagers.removeAll();
    kjmbTreeManager("kjmbTree_all", pxlx);//空间目标树
}
function kjmbTreeManager(id, pxlx) {


    this.checkedList = new Set();
    _AllGj = [];

    var setting = {
        //id: id,
        view: {
            addHoverDom: addTreeHoverDom,
            removeHoverDom: removeTreeHoverDom
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
            beforeExpand: beforeExpandTreeNode,
            onCheck: onCheckTreeNode,
            onExpand: onExpandTreeNode,
        }
    };
    function addTreeHoverDom(treeId, treeNode) {


        //只有是空间目标添加是否重要目标CheckBox，国家和类型时不显示
        if (treeNode.level == "2") {
            var sObj = $("#" + treeNode.tId + "_span");
            //layer.msg(treeNode.tId);
            var obj = $("#kjmb_tree_check_important_" + treeNode.self_num);
            if (obj.length > 0){
                // $("#kjmb_tree_check_important_" + treeNode.self_num).css("dispaly","");
                return;
            }
               

            var addStr=""
            var checked = false;// = treeNode.importent ? "checked='true'" : "";
            if(treeNode.importent=="true"){
                checked=true;
                addStr = "<input type='checkbox' class='' id='kjmb_tree_check_important_" + treeNode.self_num +
                "' title='重点关注' onfocus='this.blur();'  checked"  + "></input>";
            }else{
                addStr = "<input type='checkbox' class='' id='kjmb_tree_check_important_" + treeNode.self_num +
                "' title='重点关注' onfocus='this.blur();'  " + "></input>";
            }
             
            sObj.after(addStr);
            $("#diy-scrollbar-ztree-box-kjmb-all").mCustomScrollbar("update");
            obj = $("#kjmb_tree_check_important_" + treeNode.self_num);
            obj.unbind("change").bind("change", function (e) {
                var checked = e.target.checked;
               
                $.ajax({
                    url: url_kjmb + "/setSatelliteImportent?userZh=" + _userName + "&selfNum=" + treeNode.self_num + "&importent=" + checked,

                    dataType: "JSON",
                    type: "POST",
                    contentType: "application/json",
                    success: function (data) {
                        if (data) {



                        }

                    },
                    error: function (error) {

                    }
                });

            });
        }


    }
    function removeTreeHoverDom(treeId, treeNode) {
        //$("#kjmb_tree_check_important_" + treeNode.self_num).unbind().remove();
        //$("#kjmb_tree_check_important_" + treeNode.self_num).css("dispaly","none");
    }
    this.checkedPNodes = function () {
        return this.tree.getSelectedNode();
    }

    function onExpandTreeNode() {
        // if (!node.children && node.isParent){

        // }
    }
    function onCheckTreeNode(event, treeId, treeNode) {
        var changeChkNodes = kjmbZTree.getChangeCheckedNodes();
        for (var i = 0; i < changeChkNodes.length; i++) {
            changeChkNodes[i].checkedOld = changeChkNodes[i].checked;
        }
        if (treeNode.checked) {


            changeChkNodes.forEach(ckNode => {
                if (ckNode.isParent && !ckNode.open) {
                    kjmbZTree.expandNode(ckNode, true, false, false, true);
                }
            });
            changeChkNodes.forEach(x => {

                if (x.level >= 2 && x.checked) {
                    $.ajax({
                        url: url_kjmb + "/getCZMLByParam",
                        data: JSON.stringify({
                            self_num: x.self_num,
                        }),
                        dataType: "JSON",
                        type: "POST",
                        contentType: "application/json",
                        success: function (data) {
                            if (data) {
                                //delete data[1].description;
                                //console.log(data);
                                czmlManagers.addFile(data, x.self_num);
                                //czmlManagers.zoomFile(x.self_num);

                            }

                        },
                        error: function (error) {

                        }
                    });
                }
            });
        } else {
            changeChkNodes.forEach(x => {

                if (x.level >= 2 && !x.checked) {
                    if (czmlManagers.collection.has(x.self_num)) {
                        //czmlManagers.show(false, wjm);//两种方式，一种隐藏，一种删除   此种方式占用内存较大
                        czmlManagers.remove(x.self_num);
                    }
                }
            });

        }

    }
    function beforeExpandTreeNode(treeId, node) {
        if (!node.children && node.isParent) {
            var option = {};
            var url = "";
            if (node.level == "0") {

                if (pxlx == "national") {
                    url = "/getType?national=" + node.national;
                    //url="/getTypeByImportent?national=" + node.national+"&userZh="+_userName;
                } else if (pxlx == "type") {
                    url = "/getNational?type=" + node.type;
                    //url="/getNationalByImportent?type=" + node.type+"&userZh="+_userName;
                } else if (pxlx == "importantTarget") {
                    url = "/getTypeByImportent?national=" + node.national + "&userZh=" + _userName + "&importent=true";
                }
                option = {
                    pNode: node,
                    level: 1,
                    national: node.national,
                    type: node.type,
                    pxlx: node.pxlx,
                    postUrl: url,
                }
            } else if (node.level == "1") {
                if (pxlx == "national" || pxlx == "type") {
                    url = "/getChNameAndSelfNum?national=" + node.national + "&type=" + node.type+"&userZh=" + _userName  ;
                    // url = "/getChNameAndSelfNum?national=" + node.national + "&type=" + node.type  ;
                }else if(pxlx=="importantTarget"){
                    url="/getChNameAndSelfNumByImportent?national=" + node.national + "&type=" + node.type  +"&userZh=" + _userName + "&importent=true" ;
                }
                option = {
                    pNode: node,
                    level: 2,
                    national: node.national,
                    type: node.type,
                    pxlx: node.pxlx,
                    postUrl: url,
                    
                }
            }
            getTreeNodesData(option);
        }

    }
    function addNationalNodes(obj, option) {
        var isExistWeizhi = false;//如果已经存在未知，不再添加
        for (var i = 0; i < obj.length; i++) {
            var gj = obj[i];
            if (gj == null || gj.indexOf('未知') >= 0) {
                if (isExistWeizhi) {
                    continue;
                } else {
                    isExistWeizhi = true;
                }
                gj = '未知';

            }
            var gjTp = getGjTp(gj);


            var node = {

                name: gj,
                isParent: true,
                checked: false,
                level: option.level,
                icon: "./images/country/24/" + gjTp + ".png",
                iconSkin: " nodeicon ",
                type: option.type,
                //levelType: option.levelType,
                pxlx: option.pxlx,
                national: gj,
            }

            treeNode = kjmbZTree.addNodes(option.pNode, [node], true)[0];
            if (option.pNode && option.pNode.checked) {
                kjmbZTree.checkNode(treeNode, true, true, true);
            }

        }
    }
    function getGjTp(national) {

        if (_AllGj[national]) {
            return _AllGj[national];
        } else {

            for (var i = 0; i < _AllGj.length; i++) {
                if (_AllGj[i].national.indexOf(national) >= 0) {
                    return _AllGj[i].nm;
                }

            }
        }
        return;
    }
    function addTypeNodes(data, option) {
        var tree = data;
        if (!tree) return false;
        var len = tree.length;
        for (var i = 0; i < len; i++) {

            var node = {

                isParent: true,
                name: tree[i],
                nocheck: false,
                national: option.national,
                level: option.level,
                type: tree[i],
                levelType: option.levelType,
                pxlx: option.pxlx,

            };
            treeNode = kjmbZTree.addNodes(option.pNode, node, true)[0];
            if (option.pNode && option.pNode.checked) {
                kjmbZTree.checkNode(treeNode, true, true, true);
            }

        }
    }
    function addKjmbNodes(data, option) {
        var tree = data;
        if (!tree) return false;
        var len = tree.length;

        for (var i = 0; i < len; i++) {

            var node = {

                isParent: false,
                name: tree[i].ch_name,
                self_num: tree[i].self_num,
                nocheck: false,
                national: option.national,
                level: 2,
                type: option.type,
                levelType: option.levelType,
                importent:tree[i].importent,



            };
            treeNode = kjmbZTree.addNodes(option.pNode, node, true)[0];
            if (option.pNode.checked) {
                kjmbZTree.checkNode(treeNode, true, true, true);
            }

        }
    }
    function getTreeNodesData(option) {

        //发送ajax请求获取树形数据
        $.ajax({
            type: "POST",
            url: url_kjmb + option.postUrl,
            data: "",
            async: true,
            success: function (obj) {
                if (option.level == "0") {
                    if (option.pxlx == "national") {
                        addNationalNodes(obj, option);

                    } else if (option.pxlx == "type") {
                        addTypeNodes(obj, option);
                    } else if (option.pxlx == "importantTarget") {
                        addNationalNodes(obj, option);

                    }

                } else if (option.level == "1") {
                    if (option.pxlx == "national") {
                        addTypeNodes(obj, option);

                    } else if (option.pxlx == "type") {

                        addNationalNodes(obj, option);
                    } else if (option.pxlx == "importantTarget") {
                        addTypeNodes(obj, option);

                    }

                } else if (option.level == "2") {
                    addKjmbNodes(obj, option);
                }

            }
        });
    }
    this.removeTreeChildren = function (node) {
        if (node.children) {
            this.tree.zTree().removeChildNodes(node);
        }
    }
    this.kjmbZTree = $.fn.zTree.init($("#" + id), setting);

    //this.initTree();
    function createTree(pxlx) {
        var url = "";
        if (pxlx == "national") {
            url = "/getNational?type=allType";
            //url="/getNationalByImportent?type=allType&userZh="+_userName;
        } else if (pxlx == "type") {
            url = "/getType?national=allNational";
            //url="/getTypeByImportent?national=allNational";
        } else if (pxlx == "importantTarget") {
            url = "/getNationalByImportent?type=allType&userZh=" + _userName + "&importent=true";
        }
        var option = {
            pNode: null,
            level: 0,
            type: "",
            national: "",
            pxlx: pxlx,//排序类型 按照种类或者国家
            postUrl: url
        }
        getTreeNodesData(option);
    }



    function GetAllNational() {
        $.ajax({
            type: "POST",
            url: url_sjyyfw + "/zbqk/queryAllGjdq",
            data: "",
            async: true,
            success: function (obj) {
                if (obj) {
                    //var nodes = [];
                    for (var i = 0; i < obj.allGjdq.length; i++) {
                        var o = obj.allGjdq[i];

                        _AllGj.push({ "national": o.mc, "nm": o.nm });
                        //_AllGj[o.mc] = o.nm;
                    }

                }
                createTree(pxlx);

            },
            error: function (a, b) {
                createTree(pxlx);
            }

        });
    }
    GetAllNational();





}

//{"南苏丹"	:"0254"},{"莱索托"	:"0221"},{"马拉维"	:"0222"},{"塞内加尔"	:"0223"},{"刚果(布)"	:"0224"},{"贝宁"	:"0225"},{"吉布提"	:"0226"},{"几内亚比绍"	:"0227"},{"摩洛哥"	:"0228"},{"纳米比亚"	:"0229"},{"塞拉利昂"	:"0230"},{"坦桑尼亚"	:"0231"},{"中非"	:"0232"},{"阿尔及利亚"	:"0233"},{"赤道几内亚"	:"0234"},{"马达加斯加"	:"0235"},{"尼日尔"	:"0236"},{"索马里"	:"0237"},{"乌干达"	:"0238"},{"圣多美和普林西比"	:"0239"},{"布基纳法索"	:"0240"},{"马里"	:"0241"},{"斯威士兰"	:"0242"},{"南非"	:"0243"},{"埃塞俄比亚"	:"0244"},{"莫桑比克"	:"0245"},{"冈比亚"	:"0246"},{"赞比亚"	:"0247"},{"喀麦隆"	:"0248"},{"厄立特里亚"	:"0249"},{"利比里亚"	:"0250"},{"毛里塔尼亚"	:"0251"},{"卢旺达"	:"0252"},{"乍得"	:"0253"},{"欧洲"	:"03"},{"德国"	:"0301"},{"保加利亚"	:"0302"},{"斯洛文尼亚"	:"0303"},{"乌克兰"	:"0304"},{"英国"	:"0305"},{"希腊"	:"0306"},{"意大利"	:"0307"},{"俄罗斯联邦"	:"0308"},{"拉脱维亚"	:"0309"},{"爱沙尼亚"	:"0310"},{"冰岛"	:"0311"},{"立陶宛"	:"0312"},{"法国"	:"0313"},{"奥地利"	:"0314"},{"瑞典"	:"0315"},{"丹麦"	:"0316"},{"安道尔"	:"0317"},{"匈牙利"	:"0318"},{"马耳他"	:"0319"},{"圣马力诺"	:"0320"},{"波黑"	:"0321"},{"阿尔巴尼亚"	:"0322"},{"爱尔兰"	:"0323"},{"荷兰"	:"0324"},{"西班牙"	:"0325"},{"挪威"	:"0326"},{"克罗地亚"	:"0327"},{"摩尔多瓦"	:"0328"},{"比利时"	:"0329"},{"芬兰"	:"0330"},{"波兰"	:"0331"},{"白俄罗斯"	:"0332"},{"列支敦士登"	:"0333"},{"葡萄牙"	:"0334"},{"马其顿"	:"0335"},{"瑞士联邦"	:"0336"},{"卢森堡"	:"0337"},{"罗马尼亚"	:"0338"},{"塞尔维亚"	:"0339"},{"捷克"	:"0340"},{"摩纳哥"	:"0341"},{"斯洛伐克共和国"	:"0342"},{"梵蒂冈"	:"0343"},{"美洲"	:"04"},{"美国"	:"0401"},{"阿根廷"	:"0402"},{"加拿大"	:"0403"},{"厄瓜多尔"	:"0404"},{"圣卢西亚"	:"0405"},{"苏里南"	:"0406"},{"安提瓜和巴布达"	:"0407"},{"巴哈马"	:"0408"},{"哥伦比亚"	:"0409"},{"格林纳达"	:"0410"},{"墨西哥"	:"0411"},{"多米尼加"	:"0412"},{"伯利兹"	:"0413"},{"智利"	:"0414"},{"危地马拉"	:"0415"},{"尼加拉瓜"	:"0416"},{"多米尼克"	:"0417"},{"哥斯达黎加共和国"	:"0418"},{"圭亚那"	:"0419"},{"巴拿马"	:"0420"},{"圣文森特和格林纳丁"斯	:"0421"},{"玻利维亚"	:"0422"},{"古巴"	:"0423"},{"洪都拉斯"	:"0424"},{"秘鲁"	:"0425"},{"巴西"	:"0426"},{"委内瑞拉"	:"0427"},{"海地"	:"0428"},{"乌拉圭"	:"0429"},{"特立尼达和多巴哥"	:"0430"},{"巴巴多斯"	:"0431"},{"萨尔瓦多"	:"0432"},{"牙买加"	:"0433"},{"巴拉圭"	:"0434"},{"圣基茨和尼维斯联邦"	:"0435"},{"大洋州"	:"05"},{"澳大利亚"	:"0501"},{"瑙鲁"	:"0502"},{"巴布亚新几内亚"	:"0503"},{"帕劳"	:"0504"},{"新西兰"	:"0505"},{"斐济群岛"	:"0506"},{"所罗门群岛"	:"0507"},{"基里巴斯"	:"0508"},{"汤加"	:"0509"},{"马绍尔群岛"	:"0510"},{"瓦努阿图"	:"0511"},{"密克罗尼西亚"	:"0512"},{"图瓦卢"	:"0513"},{"萨摩亚"	:"0514"},{"库克群岛"	:"0515"},{"亚洲"	:"01"},{"中国"	:"0101"},{"台湾"	:"0102"},{"香港"	:"0103"},{"澳门"	:"0104"},{"越南"	:"0105"},{"日本国"	:"0106"},{"土耳其"	:"0107"},{"伊朗"	:"0108"},{"马来西亚"	:"0109"},{"新加坡"	:"0110"},{"哈萨克斯坦"	:"0111"},{"阿富汗"	:"0112"},{"巴林"	:"0113"},{"缅甸"	:"0114"},{"泰国"	:"0115"},{"韩国"	:"0116"},{"尼泊尔"	:"0117"},{"文莱"	:"0118"},{"不丹"	:"0119"},{"印度"	:"0120"},{"巴基斯坦"	:"0121"},{"老挝"	:"0122"},{"柬埔寨"	:"0123"},{"蒙古"	:"0124"},{"朝鲜"	:"0125"},{"印度尼西亚"	:"0126"},{"菲律宾"	:"0127"},{"斯里兰卡"	:"0128"},{"阿曼"	:"0129"},{"卡塔尔"	:"0130"},{"马尔代夫"	:"0131"},{"叙利亚"	:"0132"},{"伊拉克"	:"0133"},{"约旦"	:"0134"},{"科威特"	:"0135"},{"阿联酋"	:"0136"},{"也门"	:"0137"},{"黑山"	:"0344"},{"沙特阿拉伯"	:"0138"},{"以色列"	:"0139"},{"巴勒斯坦"	:"0140"},{"格鲁吉亚"	:"0141"},{"塔吉克斯坦"	:"0142"},{"亚美尼亚"	:"0143"},{"阿塞拜疆"	:"0144"},{"吉尔吉斯斯坦"	:"0145"},{"乌兹别克斯坦"	:"0146"},{"土库曼斯坦"	:"0147"},{"塞浦路斯"	:"0148"},{"孟加拉国"	:"0149"},{"黎巴嫩"	:"0150"},{"东帝汶"	:"0151"},{"非洲"	:"02"},{"利比亚"	:"0201"},{"尼日利亚"	:"0202"},{"突尼斯"	:"0203"},{"埃及"	:"0204"},{"肯尼亚"	:"0205"},{"科特迪瓦"	:"0206"},{"加蓬"	:"0207"},{"津巴布韦"	:"0208"},{"塞舌尔"	:"0209"},{"博茨瓦纳"	:"0210"},{"安哥拉"	:"0211"},{"科摩罗"	:"0212"},{"加纳"	:"0213"},{"毛里求斯"	:"0214"},{"苏丹"	:"0215"},{"多哥"	:"0216"},{"刚果(金)"	:"0217"},{"布隆迪"	:"0218"},{"佛得角"	:"0219"},{"几内亚"	:"0220"}
