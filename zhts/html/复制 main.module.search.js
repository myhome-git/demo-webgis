(function ($,parent,module) {
    module.parent = parent;
	let _this = module;
	
	/**
	 * 代码是2020年9月24日之前代码
	 */
	module.init = function(){
		var match_phrase_params = {
		    "query": {
		        "match_phrase": {
		            "MBMC": ""
		        }
		    },
		    "from": 0,
		    "size": 10
		};
		var match_params = {
		    "query": {
		        "match": {
		            "MBMC": ""
		        }
		    },
		    "from": 0,
		    "size": 10
		};
		var simpleName_params1 = {
		    "query": {
		        "bool": {
		            "must": [{
		                "wildcard": {
		                    "simpleName": ""
		                }
		            }]
		        }
		    },
		    "from": 0,
		    "size": 10
		}
		var simpleName_params2 = {
		    "query": {
		        "bool": {
		            "must": [{
		                "wildcard": {
		                    "simpleName": ""
		                }
		            }]
		        }
		    },
		    "from": 0,
		    "size": 10
		}
		
		$("#SearchInputBox").children(":input").keydown(function (e) {
		    return keyDownEvent(e, 'SearchList', '#SearchInputBox>input');
		});
		
		$("#rlmbInpt").keydown(function (e) {
		    return keyDownEvent(e, 'RlmbSearchList', '#rlmbInpt');
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
		
		$("#SearchInputBox").children(":input").keyup(function (e) {
		    var inputValue = $(this).val();
		
		    if (inputValue == "") {
		        $("#SearchList>ul").css("display", "none");
		        return;
		    }
		
		    if (keyupCodeEvent(e, $(this), 'SearchList', inputValue, fullPageTargetToUL)) {
		        return;
		    }
		
		    //页面目标搜索
		    var traks = manager.mbLayer.getSource().getFeatures();
		    var target = [];
		    for (var i = 0; i < traks.length; i++) {
		        var trak = traks[i];
		        var pop = trak.getProperties();
		        if (pop) {
		            if (pop.jxh && pop.jxh.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) > -1) {
		                target.push({
		                    _source: {
		                        GJNM: pop.gjnm,
		                        jbkh: pop.jbkh,
		                        jbdh: pop.jbdh,
		                        jbys: pop.jbys,
		                        MBMC: pop.jxh,
		                        MBNM: pop.mbnm,
		                        lon: pop.lon,
		                        lat: pop.lat
		                    }
		                });
		            } else if (pop.mbmc && pop.mbmc.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) > -1) {
		                target.push({
		                    _source: {
		                        GJNM: pop.gjnm,
		                        jbkh: pop.jbkh,
		                        jbdh: pop.jbdh,
		                        jbys: pop.jbys,
		                        MBMC: pop.mbmc,
		                        MBNM: pop.mbnm,
		                        lon: pop.lon,
		                        lat: pop.lat
		                    }
		                });
		            }
		
		        }
		    }
		    fullPageTargetToUL(target, true);
		
		    //地名目标搜索
		    var match_phrase = {
		        "query": {
		            "bool": {
		                "should": [{
		                    "match_phrase": {
		                        "name": inputValue.toLocaleLowerCase()
		                    }
		                }, {
		                    "match_phrase": {
		                        "name": inputValue.toLocaleUpperCase()
		                    }
		                }]
		            }
		        },
		        "from": 0,
		        "size": 10
		    };
		    var match = {
		        "query": {
		            "bool": {
		                "should": [{
		                    "match": {
		                        "name": inputValue.toLocaleLowerCase()
		                    }
		                }, {
		                    "match": {
		                        "name": inputValue.toLocaleUpperCase()
		                    }
		                }]
		            }
		        },
		        "from": 0,
		        "size": 10
		    };
		    esSearch("/tjwjqk/geo_names/_search", match_phrase, match, fullGeoNamesToUL);
		
		    //tjwjqk搜索代码开始
		    if (/^[a-zA-Z0-9]+$/.test(inputValue)) {
		        simpleName_params1.query.bool.must[0].wildcard.simpleName = inputValue.toLocaleLowerCase() + "*";
		        simpleName_params2.query.bool.must[0].wildcard.simpleName = "?*" + inputValue.toLocaleLowerCase() + "*";
		        esSearch("/tjwjqk/item/_search", simpleName_params1, simpleName_params2, fullTjwjqkToUL);
		    } else {
		        match_phrase_params.query.match_phrase.MBMC = inputValue;
		        match_params.query.match.MBMC = inputValue;
		        esSearch("/tjwjqk/item/_search", match_phrase_params, match_params, fullTjwjqkToUL);
		    }
		    //tjwjqk搜索代码结束
		
		    return false;
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
		        if (hover.length) return;
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
		$("#SearchInputBox>input").focus(function (e) {
		    $(this).trigger("keyup");
		});
		
		// 焦点切出
		$("#SearchInputBox>input").blur(function (e) {
		    var hover = $("#SearchList>ul>li:hover");
		    if (hover) {
		        hover.trigger('click');
		    }
		    $("#SearchList>ul").css("display", "none");
		});
		
		//es搜索代码--------------------------------------------------------------开始
		function esSearch(url, params1, params2, callback, callbackParam) {
		    var arr = new Array();
		    $.ajax({
		        type: "POST",
		        url: url,
		        contentType: "application/json",
		        data: JSON.stringify(params1),
		        datatype: "json",
		        success: function (msg) {
		            arr = msg.hits.hits;
		            if (arr.length < 10 && params2 != null) {
		                $.ajax({
		                    type: "POST",
		                    url: url,
		                    contentType: "application/json",
		                    data: JSON.stringify(params2),
		                    datatype: "json",
		                    success: function (msg) {
		                        var temp = msg.hits.hits;
		                        if (temp.length > arr.length) {
		                            for (let i = arr.length; i < temp.length; i++) {
		                                arr.push(temp[i]);
		                            }
		                        }
		                        callback(arr, callbackParam);
		                    }
		                });
		            } else {
		                callback(arr, callbackParam);
		            }
		        }
		    });
		}
		//es搜索代码---------------------------------------------------------结束
		
		//填充推荐列表的各个方法定义--------------------------------------------------------开始
		function fullPageTargetToUL(arr, isClear) {
		    //清空推荐列表
		    var ulObj = $("#SearchList").children("ul");
		    var historyLi = isClear ? "" : ulObj.html();
		    ulObj.html("");
		    //填充推荐列表
		    var len = arr.length > 5 ? 5 : arr.length;
		    for (let i = 0; i < len; i++) {
		
		        var source = arr[i]._source;
		        var MBMC = source.MBMC;
		        historyLi = historyLi +
		            "<li onclick=pageTargetLiClick('" + MBMC + "','" + source.MBNM + "','" + source.lon + "','" + source.lat + "')>"
		            /** BY GLX */
		            +
		            "<div style='background:url(../resouces/country/24/" + source.GJNM + ".png) left center no-repeat; padding-left:30px; float:left; width:30px;height:30px;'></div>"
		            /** BY GLX END */
		            +
		            "<span>" + MBMC + "</span>&nbsp;&nbsp;"
		            /** BY GLX */
		            +
		            "<img src=" + '/tsfwzx/page/webgis/jb/getJB?JBKH=' + source.jbkh + '&JBDH=' + source.jbdh + '&CC=32&JBYS=' + source.jbys + " style='height:32px;' />"
		            /** BY GLX END */
		            +
		            "</li>";
		    }
		    ulObj.html(historyLi);
		    $("#SearchList>ul").css("display", "block");
		    // 添加mouseover事件，目的去掉键盘模拟事件
		    $("#SearchList>ul>li").on("mouseover", function (e) {
		        var keySelect = $("#SearchList>ul").children(".hoverlike-search-selected");
		        if (keySelect.length) {
		            keySelect.removeClass("hoverlike-search-selected");
		        }
		    });
		}
		
		function fullGeoNamesToUL(arr) {
		    var ulObj = $("#SearchList").children("ul");
		    var historyLi = ulObj.html();
		    var len = arr.length > 5 ? 5 : arr.length;
		    for (let i = 0; i < len; i++) {
		        var source = arr[i]._source;
		        var id = source.id;
		        var name = source.name.split(" ").join("&nbsp;");
		        var lon = source.lon;
		        var lat = source.lat;
		        historyLi = historyLi +
		            '<li onclick=geoNamesLiClick("' + name + '","' + lon + '","' + lat + '")>' +
		            '<span><i class="iconfont fa fa-map-marker" style="font-size:20px;"></i>&nbsp;' + name + '</span>' +
		            '</li>';
		    }
		    ulObj.html(historyLi);
		    $("#SearchList>ul").css("display", "block");
		    // 添加mouseover事件，目的去掉键盘模拟事件
		    $("#SearchList>ul>li").on("mouseover", function (e) {
		        var keySelect = $("#SearchList>ul").children(".hoverlike-search-selected");
		        if (keySelect.length) {
		            keySelect.removeClass("hoverlike-search-selected");
		        }
		    });
		}
		
		function fullTjwjqkToUL(arr) {
		    var ulObj = $("#SearchList").children("ul");
		    var historyLi = ulObj.html();
		    var len = arr.length > 5 ? 5 : arr.length;
		    for (let i = 0; i < len; i++) {
		        var source = arr[i]._source;
		        var mbmc = source.MBMC;
		        historyLi = historyLi +
		            '<li onclick=tjwjqkTargetLiClick(\'' + mbmc + '\')>' +
		            '<span> <font class="fa fa-crosshairs" style="font-size:20px;"></font>&nbsp; ' + mbmc + '</span>' +
		            '</li>';
		    }
		    ulObj.html(historyLi);
		    $("#SearchList>ul").css("display", "block");
		    // 添加mouseover事件，目的去掉键盘模拟事件
		    $("#SearchList>ul>li").on("mouseover", function (e) {
		        var keySelect = $("#SearchList>ul").children(".hoverlike-search-selected");
		        if (keySelect.length) {
		            keySelect.removeClass("hoverlike-search-selected");
		        }
		    });
		}
		
		//填充推荐列表的各个方法定义-------------------------------------------------------结束
		
		
		//列表click事件的各个触发函数定义-------------------------------------------------开始
		//tjwjqk目标列表的触发事件
		function tjwjqkTargetLiClick(mbmc) {
		    if (/^[a-zA-Z0-9]+$/.test(mbmc)) {
		        var params = {
		            "query": {
		                "bool": {
		                    "must": [{
		                        "wildcard": {
		                            "simpleName": mbmc.toLocaleLowerCase()
		                        }
		                    }]
		                }
		            },
		            "from": 0,
		            "size": 10
		        }
		        esSearch("/tjwjqk/item/_search", params, null, liClickCallBack, mbmc);
		    } else {
		        var params1 = {
		            "query": {
		                "match_phrase": {
		                    "MBMC": mbmc
		                }
		            }
		        };
		        var params2 = {
		            "query": {
		                "match": {
		                    "MBMC": mbmc
		                }
		            }
		        };
		        esSearch("/tjwjqk/item/_search", params1, params2, tjwjqkLiClickCallBack, mbmc);
		    }
		}
		//tjwjqk目标列表的触发事件的回调
		function tjwjqkLiClickCallBack(arr, mbmc) {
		    var mbnms = new Array();
		    for (let i = 0; i < arr.length; i++) {
		        var source = arr[i]._source;
		        if (mbmc == source.MBMC) {
		            mbnms[i] = source.MBNM;
		            break;
		        }
		    }
		    BIGMap.zchjMarkerManager.addMarkerForSearch(mbnms);
		    // 界面操作
		    var ulObj = $("#SearchList").children("ul");
		    offterClickComplete(mbmc);
		}
		
		
		//页面目标列表的触发事件
		function pageTargetLiClick(mbmc, mbnm, lon, lat) {
		
		    BIGMap.flyTo(ol.proj.transform([Number(lon), Number(lat)], 'EPSG:4326', 'EPSG:3857'), 4000);
		    // 界面操作
		    var ulObj = $("#SearchList").children("ul");
		    offterClickComplete(mbmc);
		}
		
		//地名目标列表的触发事件
		function geoNamesLiClick(name, lon, lat) {
		    lon = Number(lon);
		    lat = Number(lat);
		    if (lon >= -180 && lon < -30) {
		        lon = 180 + (180 + lon);
		    }
		    BIGMap.cleanMarkers();
		    var coordinate = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
		    var content = "<div style='color:white;'>名称：" + name + "<br/>坐标：[" + lon + "," + lat + "]</div>";
		    BIGMap.addMarker(coordinate, 0, null, content, null);
		    BIGMap.getDefaultPopup().hide();
		    BIGMap.flyTo(coordinate, 4000,4,function(){
		        BIGMap.getDefaultPopup().show(coordinate, content);
		    });
		
		    offterClickComplete(name.split("&nbsp").join(" "));
		}
		
		function offterClickComplete(value) {
		    var ulObj = $("#SearchList").children("ul");
		    $("#SearchInputBox>input").val(value);
		    $("#SearchList").animate({
		        "height": "0"
		    }, 1000, function () {
		        ulObj.html("");
		    });
		    ulObj.html("");
		    $("#SearchList>ul>li").removeClass(".hoverlike-search-selected");
		    $("#SearchList>ul").css("display", "none");
		}
		//列表click事件的各个触发函数定义-------------------------------------------------------------结束
		
		
		
		//sjfx_mbdak热力搜索的推荐列表代码----------------------开始
		$("#rlmbInpt").keyup(function (e) {
		    var inputValue = $(this).val();
		    if (keyupCodeEvent(e, $(this), 'RlmbSearchList', inputValue, null)) {
		        return;
		    }
		    if (inputValue == "") {
		        $("#RlmbSearchList>ul").css("display", "none");
		        return;
		    }
		    $(this).removeAttr("data-mbmc");
		    $(this).removeAttr("data-mbnm");
		    if (/^[a-zA-Z0-9]+$/.test(inputValue)) {
		        simpleName_params1.query.bool.must[0].wildcard.simpleName = inputValue.toLocaleLowerCase() + "*";
		        simpleName_params2.query.bool.must[0].wildcard.simpleName = "?*" + inputValue.toLocaleLowerCase() + "*";
		        esSearch("/sjfx_mbdak/item/_search", simpleName_params1, simpleName_params2, rlmbfullUL);
		    } else {
		        match_phrase_params.query.match_phrase.MBMC = inputValue;
		        match_params.query.match.MBMC = inputValue;
		        esSearch("/sjfx_mbdak/item/_search", match_phrase_params, match_params, rlmbfullUL);
		    }
		
		});
		
		// 焦点进入RlmbSearchList
		$("#rlmbInpt").focus(function (e) {
		    $(this).trigger("keyup");
		});
		
		// 焦点切出
		$("#rlmbInpt").blur(function (e) {
		    var hover = $("#RlmbSearchList>ul>li:hover");
		    if (hover) {
		        hover.trigger('click');
		    }
		    $("#RlmbSearchList>ul").css("display", "none");
		});
		
		
		function rlmbfullUL(arr) {
		    //清空推荐列表
		    var ulObj = $("#RlmbSearchList").children("ul");
		    ulObj.html("");
		    //填充推荐列表
		    var liList = "";
		    for (let i = 0; i < arr.length; i++) {
		        var source = arr[i]._source;
		        var MBMC = source.MBMC;
		        liList = liList + "<li onclick=rlmbLiClick('" + MBMC + "'" + ",'" + source.MBNM + "')>" + MBMC + "</li>";
		    }
		    ulObj.html(liList);
		    $("#RlmbSearchList>ul").css("display", "block");
		}
		
		function rlmbLiClick(mbmc, mbnm) {
		    var rlmbInpt = $("#rlmbInpt");
		    rlmbInpt.attr("data-mbmc", mbmc);
		    rlmbInpt.attr("data-mbnm", mbnm);
		    rlmbInpt.val(mbmc);
		    $("#RlmbSearchList>ul").css("display", "none");
		}
		//热力搜索的推荐列表代码----------------------结束
		
		//argo浮标号搜索推荐列表代码---------------------------开始
		var argoInput = $("input[name='argo-platform']");
		argoInput.focus(function (e) {
		    $(this).trigger("keyup");
		});
		
		// 焦点切出
		argoInput.blur(function (e) {
		    var hover = $("#argoSearchList>ul>li:hover");
		    if (hover) {
		        hover.trigger('click');
		    }
		    $("#argoSearchList>ul").css("display", "none");
		});
		
		argoInput.keyup(function (e) {
		    var inputValue = $(this).val();
		    if (keyupCodeEvent(e, $(this), 'argoSearchList', inputValue, null)) {
		        return;
		    }
		    if (inputValue == "") {
		        $("#argoSearchList>ul").css("display", "none");
		        return;
		    }
		    var segment = $(this).val();
		    $.ajax({
		        type: "GET",
		        url: "/data-server/argoData/getPlatformBySegment",
		        data: {
		            "segment": segment,
		            "begin":$("#argo-trail-begin").val(),
		            "end":$("#argo-trail-end").val()
		        },
		        datatype: "json",
		        success: function (msg) {
		            var ulObj = $("#argoSearchList").children("ul");
		            ulObj.html("");
		            var liList = "";
		            for (let i = 0, len = msg.length; i < len && i < 10; i++) {
		                liList = liList + "<li onclick=argoLiClick('"+msg[i]+"')>" + msg[i] + "</li>";
		            }
		            ulObj.html(liList);
		            $("#argoSearchList>ul").css("display", "block");
		        }
		    });
		});
		
		function argoLiClick(argoName) {
		    var argoCheckBoxDiv = $("#argo-platform-check");
		    if($("#argoItem-"+argoName).length > 0) {
		        return;
		    }
		    var checkItem = '<span id=argoItem-'+argoName+' style="background-color: darkcyan; margin-right:9px;"><span name="platform-item" style="margin-right: 2px;">'+argoName
		    +'</span><i style="background-color: crimson;" class="iconfont fa fa-remove" onclick=$(this).parent().remove();></i></span>';
		    argoCheckBoxDiv.append(checkItem);
		}
		//argo浮标号搜索推荐列表代码---------------------------结束
		
		//flight航班号搜索推荐列表代码---------------------------开始
		var flightInput = $("input[name='flight-flight']");
		flightInput.focus(function (e) {
		    $(this).trigger("keyup");
		});
		
		// 焦点切出
		flightInput.blur(function (e) {
		    var hover = $("#flightSearchList>ul>li:hover");
		    if (hover) {
		        hover.trigger('click');
		    }
		    $("#flightSearchList>ul").css("display", "none");
		});
		
		flightInput.keyup(function (e) {
		    var inputValue = $(this).val();
		    if (keyupCodeEvent(e, $(this), 'flightSearchList', inputValue, null)) {
		        return;
		    }
		    if (inputValue == "") {
		        $("#flightSearchList>ul").css("display", "none");
		        return;
		    }
		    var segment = $(this).val();
		    $.ajax({
		        type: "GET",
		        url: "/data-server/flight24/getFlightBySegment",
		        data: {
		            "segment": segment,
		            "startDay" : $("#flight-trail-begin").val(),
		            "endDay" : $("#flight-trail-end").val()
		        },
		        datatype: "json",
		        success: function (msg) {
		            var ulObj = $("#flightSearchList").children("ul");
		            ulObj.html("");
		            var liList = "";
		            for (let i = 0, len = msg.length; i < len && i < 10; i++) {
		                liList = liList + "<li onclick=flightLiClick('"+msg[i]+"')>" + msg[i] + "</li>";
		            }
		            ulObj.html(liList);
		            $("#flightSearchList>ul").css("display", "block");
		        }
		    });
		});
		
		function flightLiClick(flight) {
		    flightInput.val(flight);
		}
		//flight航班号搜索推荐列表代码---------------------------结束
		
		//ais船舶编号搜索推荐列表代码-----------------------------开始
		var aisInput = $("input[name='ais-ais']");
		aisInput.focus(function (e) {
		    $(this).trigger("keyup");
		});
		
		// 焦点切出
		aisInput.blur(function (e) {
		    var hover = $("#aisSearchList>ul>li:hover");
		    if (hover) {
		        hover.trigger('click');
		    }
		    $("#aisSearchList>ul").css("display", "none");
		});
		
		aisInput.keyup(function (e) {
		    var inputValue = $(this).val();
		    if (keyupCodeEvent(e, $(this), 'aisSearchList', inputValue, null)) {
		        return;
		    }
		    if (inputValue == "") {
		        $("#aisSearchList>ul").css("display", "none");
		        return;
		    }
		    var segment = $(this).val();
		    $.ajax({
		        type: "GET",
		        url: "/data-server/ais/getAisBySegment",
		        data: {
		            "segment": segment,
		            "startDay" : $("#ais-trail-begin").val(),
		            "endDay" : $("#ais-trail-end").val()
		        },
		        datatype: "json",
		        success: function (msg) {
		            var ulObj = $("#aisSearchList").children("ul");
		            ulObj.html("");
		            var liList = "";
		            for (let i = 0, len = msg.length; i < len && i < 10; i++) {
		                liList = liList + "<li onclick=aisLiClick('"+msg[i]+"')>" + msg[i] + "</li>";
		            }
		            ulObj.html(liList);
		            $("#aisSearchList>ul").css("display", "block");
		        }
		    });
		});
		
		function aisLiClick(ais) {
		    aisInput.val(ais);
		}
		//ais船舶编号搜索推荐列表代码-----------------------------结束
	}
	
})(jQuery,_pageObject,_pageObject.SEARCH={});