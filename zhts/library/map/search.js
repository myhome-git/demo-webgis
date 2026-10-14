(function ($) {
    $(document).ready(documentReady);
    function documentReady() {


        $("input[name='mbSearch']").keydown(function (e) {
            return keyDownEvent(e, 'SearchMapMBList', "input[name='mbSearch']");
        });

        function keyDownEvent(e, searchList, selector) {
            // 监听tab键
            if (e.keyCode == 9) {
                var keySelect = $("#" + searchList + ">ul").children(".hoverlike-search-selected");
                var hover = $("#" + searchList + ">ul>li:hover");
                var val;
                if (keySelect.length == 0 && hover.length == 0) {
                    var first = $("#" + searchList + ">ul>li").first();
                    if (first[0])
                        val = $(first[0]).text();
                    else
                        val = $(selector).val();
                } else {
                    var selected = $(keySelect[0] || hover[0]);
                    val = selected.first().text();
                }
                $(selector).val(val);
                setTimeout(function () {
                    $(selector).focus();
                }, 300);
                return false;
            }
            return true;
        }

        $("input[name='mbSearch']").keyup(function (e) {
            var inputValue = $(this).val();

            if (inputValue == "") {
                $("#SearchMapMBList>ul").css("display", "none");
                return;
            }

            if (keyupCodeEvent(e, $(this), 'SearchMapMBList', inputValue, fullPageTargetToUL)) {
                return;
            }

            //页面目标搜索
            var traks = manager.mbLayer.getSource().getFeatures();
            var target = [];
            for (var i = 0; i < traks.length; i++) {
                var trak = traks[i];
                var pop = trak.getProperties();
                if (pop) {
                    if (pop.mbmc && pop.mbmc.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) > -1) {
                        target.push({
                            _source: {
                                sn: pop.sn,
                                mbmc: pop.mbmc,
                                lon: pop.lon,
                                lat: pop.lat
                            }
                        });
                    }
                }
            }
            fullPageTargetToUL(target, true);
        });

        function keyupCodeEvent(e, self, searchList, inputValue, callback) {
            // 回车触发
            if (e.keyCode == 13) {
                var hover = $("#" + searchList + ">ul>li:hover");
                if (hover.length == 0) {
                    hover = $("#" + searchList + ">ul").children(".hoverlike-search-selected");
                }
                self.blur();
                if (hover.length != 0) {
                    hover.click();
                    return true;
                }
                if (callback != null) {
                    //callback(inputValue);
                }

                return true;
            }
            // 上下键
            if (e.keyCode == 40 || e.keyCode == 38) {
                var hover = $("#" + searchList + ">ul>li:hover");
                if (hover.length)
                    return;
                var allLi = $("#" + searchList + ">ul").children();
                if (allLi.length == 0)
                    return;
                var selected = $("#" + searchList + ">ul").children(".hoverlike-search-selected");
                if (selected.length == 0) {
                    var p = allLi.first();
                    p.addClass("hoverlike-search-selected");
                } else {
                    selected.removeClass("hoverlike-search-selected");
                    if (e.keyCode == 40) {
                        var next = selected.next();
                        if (next.length == 0)
                            next = allLi.first();
                        next.addClass("hoverlike-search-selected");
                    } else {
                        var prev = selected.prev();
                        if (prev.length == 0)
                            prev = allLi.last();
                        prev.addClass("hoverlike-search-selected");
                    }
                }
                return true;
            }
            return false;
        }

// 焦点进入
        $("input[name='mbSearch']").focus(function (e) {
            $(this).trigger("keyup");
        });

// 焦点切出
        $("input[name='mbSearch']").blur(function (e) {
            var hover = $("#SearchMapMBList>ul>li:hover");
            if (hover) {
                hover.trigger('click');
            }
            $("#SearchMapMBList>ul").css("display", "none");
        });

//填充推荐列表的各个方法定义--------------------------------------------------------开始
        function fullPageTargetToUL(arr, isClear) {
            //清空推荐列表
            var ulObj = $("#SearchMapMBList").children("ul");
            var historyLi = isClear ? "" : ulObj.html();
            ulObj.html("");
            //填充推荐列表
            var len = arr.length > 10 ? 10 : arr.length;
            for (var i = 0; i < len; i++) {

                var source = arr[i]._source;
                var mbmc = source.mbmc;
                historyLi = historyLi +
                        "<li onclick=pageTargetLiClick('" + mbmc + "','" + source.lon + "','" + source.lat + "')>"
                        +
                        "<span>" + mbmc + "</span>&nbsp;&nbsp;"
                        +
                        "</li>";
            }
            ulObj.html(historyLi);
            $("#SearchMapMBList>ul").css("display", "block");
            // 添加mouseover事件，目的去掉键盘模拟事件
            $("#SearchMapMBList>ul>li").on("mouseover", function (e) {
                var keySelect = $("#SearchMapMBList>ul").children(".hoverlike-search-selected");
                if (keySelect.length) {
                    keySelect.removeClass("hoverlike-search-selected");
                }
            });
        }
//填充推荐列表的各个方法定义-------------------------------------------------------结束


//列表click事件的各个触发函数定义-------------------------------------------------开始

//页面目标列表的触发事件

//列表click事件的各个触发函数定义-------------------------------------------------------------结束

    }
})(jQuery);
function pageTargetLiClick(mbmc, lon, lat) {

    BIGMap.flyTo(ol.proj.transform([Number(lon), Number(lat)], 'EPSG:4326', 'EPSG:3857'), 4000,8);
    // 界面操作
    var ulObj = $("#SearchMapMBList").children("ul");
    offterClickComplete(mbmc);
}

function offterClickComplete(value) {
    var $dom = $("#SearchMapMBList");
    var ulObj = $dom.children("ul");
    $dom.siblings("input").val(value);
    ulObj.html("");
    $dom.find(">ul").css("display", "none");
}