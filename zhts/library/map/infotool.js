
/**
 * 消息工具
 */
var InfoTool = {
    infoIndex: undefined,
    showInfo: function (feature) {
        var prop = feature.getProperties();

        if (prop.mblb == '水面目标') {
            this._showShipInfo(prop);
        } else if (prop.mblb == '空中目标') {
            this._showPlaneInfo(prop);
        } else {
            this._showCarInfo(feature);
        }

    },

    _showShipInfo: function (data) {

        if (!data.info) {
            layer.alert('暂无该船舶基本信息！', function (index) {
                layer.close(index);
            });
            return;
        }
        var ysbw = data.info;
        var drawDate = new Date(data.drawtime);
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
                case 'machineName':
                    html += "<div class='box_info_content' style='color:white;'><font>船舶名称：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'telphone':
                    html += "<div class='box_info_content' style='color:white;'><font>手机电话：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'devPlate':
                    html += "<div class='box_info_content' style='color:white;'><font>终端类型：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'code':
                    html += "<div class='box_info_content' style='color:white;'><font>终 端  ID：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'devModel':
                    html += "<div class='box_info_content' style='color:white;'><font>终端型号：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'company':
                    html += "<div class='box_info_content' style='color:white;'><font>所属公司：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'installPalce': //
                    html += "<div class='box_info_content' style='color:white;'><font>安装地点：</font><font>" + ysbw[key] + "</font></div>"
                    break;
                case 'installDate':
                    html += "<div class='box_info_content' style='color:white;'><font>安装时间：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'weight': //
                    html += "<div class='box_info_content' style='color:white;'><font>船舶总吨：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'nLoad': //
                    html += "<div class='box_info_content' style='color:white;'><font>船舶核载：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'height':
                    html += "<div class='box_info_content' style='color:white;'><font>船舶高度：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'lenght':
                    html += "<div class='box_info_content' style='color:white;'><font>船舶长度：</font><font>" + ysbw[key] + "</font></div>";
                    break;
                case 'broadband':
                    html += "<div class='box_info_content' style='color:white;'><font>船舶宽带：</font><font>" + ysbw[key] + "</font></div>";
                    break;

                default:
                    break;
            }
        }

        //目标坐标和时间
        html += "<div class='box_info_content' style='color:white;'><font>船舶经度：</font><font>" + data.lon +
                "</font></div><div class='box_info_content' style='color:white;'><font>船舶纬度：</font><font>" + data.lat + "</font></div>" +
                "<div class='box_info_content' style='color:white;'><font>数据时间：</font><font>" + data.time + "</font></div>";


        $("#mbysbwcontentDiv").append(html);
        if (this.infoIndex) {
            // layer.close(this.infoIndex);
            layer.title(ysbw.shipname + "-资料信息", this.infoIndex);
        }
        //打开弹出框
        this.infoIndex = layer.open({
            type: 1,
            title: ysbw.shipname + "-资料信息",
            shadeClose: false,
            shade: false,
            btn: false,
            scrollbar: true,
            offset: "c",
            content: $("#mbysbw"),
            area: ["314px", "390px"],
            success: function (dom, index) {
                layer.title(ysbw.shipname + "-资料信息", index);
            },
            cancel: function () {

            }
        });

    },

    _showPlaneInfo: function (data) {

        if (!data.info) {
            layer.alert('暂无该目标基本信息！', function (index) {
                layer.close(index);
            });
            return;
        }
    },

    _showStationInfo: function (name, data) {
        this.infoIndex = layer.open({
            type: 1,
            title: name + " 地面站信息",
            shadeClose: false,
            shade: false,
            btn: false,
            scrollbar: true,
            offset: "c",
            content: data,
            area: ["314px", "190px"],
            success: function (dom, index) {

            },
            cancel: function () {

            }
        });
    },

    _showCarInfo: function (feature) {
        var prop = feature.getProperties();
        var coor = feature.getGeometry().getCoordinates();
        if (feature.get('type') == "track") {
          //显示popup
          feature.getBindOverlay().addPopupClass("visible");
          feature.dispatchEvent("change:geometry");
        }
    }

}



