var measureTool;
var tshfIndex;
var gjhfIndex;
/**
 *  初始化一些内容
 * @type type
 */
!(function ($) {
    $(document).ready(function () {
        _FunctionObject.isOpenLeft = true;
        var header = $("#x-header-settings");
        header.find("[x-btn-name='taishihuifang']").on("click", function () {
            openTshf();
        });
        header.find("[x-btn-name='guijihuifang']").on("click", function () {
            openGjhf();
        });

        measureTool = new ole.interaction.MeasureTool();
        BIGMap.getMap().addInteraction(measureTool);

    });

})(jQuery);


function measureLength() {
    measureTool.setTool(true, 'measureLength', false)
}
function measureArea() {
    measureTool.setTool(true, 'measureArea', false)
}
function measureCircle() {
    measureTool.setTool(true, 'measureCircle', false)
}
function clearer() {
    measureTool.setTool(false)
}


function openGjhf() {

    var $layerWindow = $("#gjhf-window");

    //拿出ztree数据，_FunctionObject._DeviceTreeArray
    if (!$layerWindow.data("_initDeviceTree")) {
        var $select = $layerWindow.find("#gjhf-mbmc");
        var $option = $("<option value=''>请选择</option>");
        $select.append($option);

        var _zTreeObject = _FunctionObject._DeviceTreeArray;
        if (!_zTreeObject || _zTreeObject.length < 1) {
            layui.layer.msg("没有可以回放的目标");
            return;
        }

        var _nodes = _zTreeObject[0]["children"] || [];
        if (_nodes) {
            for (var i in _nodes) {
                var _node = _nodes[i];
                var $optgroup = $("<optgroup label=\"" + _node["name"] + "\"></optgroup>");
                var _childrens = _node["children"];
                for (var i in _childrens) {
                    var _children = _childrens[i];
                    var $option = $("<option value='" + _children["id"] + "'>" + _children["name"] + "</option>");
                    $optgroup.append($option);
                }

                $select.append($optgroup);
            }
        }

        _FunctionObject.layuiForm.render();

        $layerWindow.data("_initDeviceTree", true);
    }
    
    
    gjhfIndex = layui.layer.openWin({
        type: 1,
        title: "<i class='iconfont fa fa-send'></i>&nbsp;轨迹回放",
        scrollbar: true,
        offset: "c",
        content: $layerWindow,
        area: ["334px", "360px"],
        success: function (dom, index) {
            dom.css({
                "bottom": "35px",
                "left": "90px",
                "top": "auto",
                "right": "auto"
            })
            _FunctionObject.moduleControl.GUIJIHUIFANG.OpenPanel();
            if (_FunctionObject.isOpenLeft) {
                _FunctionObject.SetPanelContentLeftToggle();
                _FunctionObject.isOpenLeft = false;
            }else{
                _FunctionObject.isOpenLeft = true;
            }

        },
        end: function () {
            $layerWindow.css({"display": "none"});
            _FunctionObject.moduleControl.GUIJIHUIFANG.ClosePanel();
            if (!_FunctionObject.isOpenLeft) {
                _FunctionObject.SetPanelContentLeftToggle();
                _FunctionObject.isOpenLeft = true;
            }else{
                 _FunctionObject.isOpenLeft = false;
            }
        }
    });
    
    if(tshfIndex){
        layui.layer.close(tshfIndex);
    }
    

}

function openTshf() {
   
    var $layerWindow = $("#tshf-window");
    tshfIndex = layui.layer.openWin({
        type: 1,
        title: "<i class='iconfont fa fa-history'></i>&nbsp;态势回放",
        scrollbar: true,
        offset: "c",
        content: $layerWindow,
        area: ["334px", "360px"],
        success: function (dom, index) {
            dom.css({
                "bottom": "35px",
                "left": "90px",
                "top": "auto",
                "right": "auto"
            });
            if (_FunctionObject.isOpenLeft) {
                _FunctionObject.SetPanelContentLeftToggle();
                _FunctionObject.isOpenLeft = false;
            }else{
                _FunctionObject.isOpenLeft = true;
            }
        },
        end: function () {
            $layerWindow.css({"display": "none"});
            if (!_FunctionObject.isOpenLeft) {
                _FunctionObject.SetPanelContentLeftToggle();
                _FunctionObject.isOpenLeft = true;
            }else{
                 _FunctionObject.isOpenLeft = false;
            }
        }
    });
     if(gjhfIndex){
        layui.layer.close(gjhfIndex);
    }

}






