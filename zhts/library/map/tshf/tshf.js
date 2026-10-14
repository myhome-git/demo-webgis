/**
 * 态势回放控制
 */
var Tshf = function (map, options) {
    this.init(map, options);

    this.tshfdata = {
        isprocess: false,
        gjdata: {},
        mbtracks: []
    };
}

/**
 * 初始化态势回放
 */
Tshf.prototype.init = function (map, options) {

    layui.use('laydate', function () {
        var laydate = layui.laydate;

        var date = new Date("2018/10/01 00:00:00");
        var ed = date.getTime() + 88200000;
        var st = date.getTime();

        laydate.render({
            elem: '#tshf_start_time',
            type: "datetime",
            calendar: true,
            isInitValue: true,
            value: layui.util.toDateString(st),
//            theme: '#1E9FFF'
        });

        laydate.render({
            elem: '#tshf_end_time',
            type: "datetime",
            calendar: true,
            isInitValue: true,
            value: layui.util.toDateString(ed),
//            theme: '#1E9FFF'
        });

        laydate.render({
            elem: '#gjhf_start_time',
            type: "datetime",
            calendar: true,
            isInitValue: true,
            value: layui.util.toDateString(st),
//            theme: '#1E9FFF'
        });

        laydate.render({
            elem: '#gjhf_end_time',
            type: "datetime",
            calendar: true,
            isInitValue: true,
            value: layui.util.toDateString(ed),
//            theme: '#1E9FFF'
        });

    });

    var callback = null;
    var opt = {
        trackslayer: options.trackslayer,
        positionslayer: options.positionslayer
    };
    this.control = options.control;
    this.positionslayer = options.positionslayer;
    this.trackslayer = options.trackslayer;
    this.manager = options.manager;
    this.gps = options.gps;
    this.map = map;

    var playback = null;

    var typearr = ['水面目标', '陆地目标', '空中目标'];
    this.typearr = typearr;

    var _self = this;

//=======态势回放初始化===========================================================
    //速度控制条
    $("#speed").on("change", function (e) {
        var val = Number(e.target.value);
        if (playback) {
            playback.setSpeed(parseFloat(val) * 10);
        }
        $('#speedlabel').html(val + "X").val(val);
    });

    $("#loadtshf").on("click", function () {
        var st = $("#tshf_start_time").val().replace(/-/g, "/");
        var ed = $("#tshf_end_time").val().replace(/-/g, "/");
        var start = new Date(st).getTime();
        var end = new Date(ed).getTime();
        var timeGap = Number($("#tshf-timeslice").val());
        var timeslice = new TimeSlice(start, end, timeGap, 1);
        var firsttime = timeslice.getTimeGroup()[0];
        timeslice.timeDeCount();

        _self.timeslice = timeslice;
        playback = new ol.Playback(map, null, callback, opt);
        _self.playback = playback;
        _self.playback.setTimeSlice(timeslice);
        _self.playback.setTshf(_self);

        _self.playback.addCallback(function (ms) {
            var s = layui.util.toDateString(ms);
            $("#timelabel").html(s);
        });
        if (firsttime) {
            _self.loadData(playback, firsttime[0], firsttime[1]);
            $("#stop").attr("disabled", "true");
            $("#cleantshf").removeAttr("disabled");
            $("#start").removeAttr("disabled");
            $("#loadtshf").attr("disabled", "true");
        } else {
            layui.layer.alert("时间间隔太短，无数据！", {icon: 0})
        }

    });

    $("#stop").on("click", function () {
        $("#loadtshf").removeAttr("disabled");
        $("#start").removeAttr("disabled");
        $("#stop").attr("disabled", "true");
        if (playback) {
            playback.stop();
        }
    });

    $("#start").on("click", function () {
        $("#loadtshf").attr("disabled", "true");
        $("#stop").removeAttr("disabled");
        $("#start").attr("disabled", "true");
        if (playback) {
            if (!_self.tshfdata.isprocess) {
                //清除所有目标
                _self.manager.clearQueueByXYMCAndLayer("SSTS_BD_TSHF", _self.trackslayer, _self.positionslayer)
                if (_self.tshfdata.mbtracks.length > 0) {
                    //设置新的目标
                    playback.setData(_self.tshfdata.mbtracks);
                    _self.tshfdata.isprocess = true;
                } else {
                    layui.layer.alert("无数据，不可回放！");
                }
            }
            playback.start();
        }
    });

    $("#cleantshf").on("click", function () {
        if (_self.playback) {
            _self.playback.stop();
            //清除回放数据
            playback.destroy();
        }
        $("#loadtshf").removeAttr("disabled");
        $("#start").removeAttr("disabled");
        $("#stop").attr("disabled", "true");
        $("#timelabel").html("");
    });

//=======轨迹回放初始化===========================================================
    //速度控制条
    $("#gjspeed").on("change", function (e) {
        var val = Number(e.target.value);
        if (playback) {
            playback.setSpeed(parseFloat(val) * 10);
        }
        $('#gjspeedlabel').html(val + "X").val(val);
    });

    $("#loadgjhf").on("click", function () {
        var mbid = $("#gjhf-mbmc").val();
        if (mbid == null || mbid == "") {
            layui.layer.alert("请选择一个目标，否则无法进行轨迹回放！", {icon: 0});
            return;
        }
        var st = $("#gjhf_start_time").val().replace(/-/g, "/");
        var ed = $("#gjhf_end_time").val().replace(/-/g, "/");
        var start = new Date(st).getTime();
        var end = new Date(ed).getTime();
        var timeGap = end - start;

        var day = timeGap / (3600 * 1000 * 24);
        if (day > 10) {
            layui.layer.alert("选择的时间段不得超过10天！", {icon: 0});
            return;
        }

        var timeslice = new TimeSlice(start, end, timeGap, 1);
        var firsttime = timeslice.getTimeGroup()[0];
        timeslice.timeDeCount();

        _self.timeslice = timeslice;
        playback = new ol.Playback(map, null, callback, opt);
        _self.playback = playback;
        _self.playback.setTimeSlice(timeslice);
        _self.playback.setTshf(_self);

        _self.playback.addCallback(function (ms) {
//            var s = layui.util.toDateString(ms);
            var time = layui.util.toDateString(ms, "HH:mm:ss");
            var date = layui.util.toDateString(ms, "yyyy-MM-dd");
            $("#gjhf_date").html(date);
            $("#gjhf_time").html(time);
//            $("#gjtimelabel").html(s);
            if (ms) {
                var $slider = $("#slideTest15");
                var _slider = $slider.get(0);
                if (_slider && _slider.layuiSlider) {
                    if (_slider.layuiSlider) {
                        var _number = parseInt((ms - _slider.layuiSlider.config.min) / (_slider.layuiSlider.config.max - _slider.layuiSlider.config.min) * 100);
                        $slider.find(".layui-slider-bar").css({"width": _number + "%"});
                        $slider.find(".layui-slider-wrap").css({"left": _number + "%"});
                        $slider.find(".layui-slider-tips").html(layui.util.toDateString(ms));
                    }
                }
            }
        });
        //清除所有目标
        _self.manager.clearQueueByXYMCAndLayer("SSTS_BD_TSHF", _self.trackslayer, _self.positionslayer);
        if (firsttime) {
            _self.loadGjhfData(playback, firsttime[0], firsttime[1], mbid);
            $("#gjstop").attr("disabled", "true");
            $("#cleangjhf").removeAttr("disabled");
            $("#gjstart").removeAttr("disabled");
            $("#loadgjhf").attr("disabled", "true");
        } else {
            layui.layer.alert("时间间隔太短，无数据！", {icon: 0})
        }

    });

    $("#gjstop").on("click", function () {
        $("#loadgjhf").removeAttr("disabled");
        $("#gjstart").removeAttr("disabled");
        $("#gjstop").attr("disabled", "true");
        if (playback) {
            playback.stop();
        }
    });

    $("#gjstart").on("click", function () {
        $("#loadgjhf").attr("disabled", "true");
        $("#gjstop").removeAttr("disabled");
        $("#gjstart").attr("disabled", "true");
        if (playback) {
            if (!_self.tshfdata.isprocess) {
                //清除所有目标
                _self.trackslayer.getSource().clear();
                _self.tshfdata.isprocess = true;
            }
            playback.start();
        }
    });

    $("#cleangjhf").on("click", function () {
        if (_self.playback) {
            _self.playback.stop();
            //清除回放数据
            playback.destroy();
        }
        $("#loadgjhf").removeAttr("disabled");
        $("#gjstart").removeAttr("disabled");
        $("#gjstop").attr("disabled", "true");
        $("#gjtimelabel").html("");
        _self.control.Stop();
        var $slider = $("#slideTest15");
        $slider.find(".layui-slider-bar").css({"width": 0 + "%"});
        $slider.find(".layui-slider-wrap").css({"left": 0 + "%"});

    });

    //渲染UI，设置类型
    layui.use('form', function () {
        var form = layui.form;
        form.on("checkbox(tshfsettingck)", function (data) {
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

        //显隐航迹
        form.on("checkbox(tshfhj)", function (data) {
            if (data.elem.checked) {
                _self.showHJ(true);
            } else {
                _self.showHJ(false);
            }
        });

    });

}

/**
 * 加载回放目标数据
 */
Tshf.prototype.loadData = function (playback, stime, etime) {

    var _self = this;

    //清除所有目标
    _self.manager.clearQueueByXYMCAndLayer("SSTS_BD_TSHF", this.trackslayer, this.positionslayer);
    //清除回放数据
    playback.destroy();
    _self.tshfdata = {
        isprocess: false,
        mbtracks: []
    };

    var st = layui.util.toDateString(stime);
    var ed = layui.util.toDateString(etime);
    var params = {
        start: st,
        end: ed,
        type: "tshf",
        simplify: false
    };

    var idx = layer.load(0, {time: 30 * 1000})

    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        url: "../mbtshf/getByTimeRange",
        data: JSON.stringify(params),
        success: function (result) {
            var code = result.code;
            var data = result.data;
            var msg = result.msg;
            if (code != 0) {
                layui.layer.alert(msg, {icon: 0});
                return;
            }
            // console.log(data);
            if (data.length > 0) {
                _self.tshfdata.mbtracks = data;
                var trackers = [];
                var lines = [];
                var format = new ol.format.GeoJSON();
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var feature = format.readFeature(item);
                    var prop = feature.getProperties();
                    var tracker = new ol.Track();
                    tracker.set("showTag", false);
                    var lastCoord = feature.getGeometry().getFirstCoordinate();
                    var wgslonlat = lastCoord;
                    if (_self.gps) {
                        var newLonlat = GPS.gcj_encrypt(wgslonlat[1], wgslonlat[0]);
                        wgslonlat[0] = newLonlat.lon;
                        wgslonlat[1] = newLonlat.lat;
                    }
                    wgslonlat = ol.proj.fromLonLat(lastCoord);
                    var point = new ol.geom.Point(wgslonlat, "XY");

                    var ph = prop.sn;
                    var queue = "SSTS_BD_TSHF";
                    var fid = queue + "_" + ph;

                    tracker.setGeometry(point);
                    tracker.set("queue", queue);
                    tracker.setId(fid);

                    prop.queue = queue;
                    prop.lon = wgslonlat[0];
                    prop.lat = wgslonlat[1];
                    if (prop.mbmc == "null" || prop.mbmc == null) {
                        prop.mbmc = "";
                    }
                    if (prop.gjstr == "null" || prop.gjstr == null) {
                        prop.gjstr = "不明";
                    }
                    if (prop.gd == -999999) {
                        prop.gd = 0;
                    }
                    prop.drawtime = new Date().getTime();

                    var info = _self.manager.selectDeviceType(prop.deviceTypeName);
                    prop.mblb = info.mblb;
                    prop.iconinfo = info;

                    var scale = 0.7;
                    var anchor = [0.5, 0.5];
                    if (prop.mblb === '空中目标') {
                        anchor = [0.5, 0.4];

                    } else if (prop.mblb === '水面目标') {
                        anchor = [0.05, 0.5];
                    }
                    var rotat = 0;
                    if (info.rotation) {
                        rotat = ((prop.heading + 90) / 180) * Math.PI;
                    } else {
                        rotat = 0;
                    }

                    var image = new ol.style.Icon(({
                        scale: scale,
                        anchor: anchor,
                        src: info.iconUrl,
                        rotation: rotat
                    }));
                    var style = new ol.style.Style({
                        image: image
                    });
                    tracker.setStyle(style);

                    //第一次的时候采用两个相同的点，这样在二三维切换的时候不会报错
                    var multi = new ol.geom.MultiPoint([point, point]);
                    var linefeature = new ol.Feature({
                        geometry: multi,
                    });
                    var style = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: prop.textColor,
                            width: 1
                        })
                    });

                    linefeature.setStyle(style);

                    linefeature.setProperties({
                        "ph": prop.ph,
                        "hjtype": "短航迹",
                        "point_count": 5,
                        "size": 1,
                        "color": "red"
                    });
                    linefeature.setId(prop.queue + "_" + prop.ph);
                    tracker.bindMultiPoint(linefeature);

                    prop.fssjs = [];
                    prop.gds = [];
                    prop.hxs = [];
                    prop.geometry = tracker.getGeometry();
                    prop.ysbw = {};

                    tracker.setProperties(prop);
                    trackers.push(tracker);
                    lines.push(linefeature);
                }
                _self.trackslayer.getSource().addFeatures(trackers);
                var ext = _self.trackslayer.getSource().getExtent();
                if (ext) {
                    _self.map.getView().fit(ext);
                }
            } else {
                console.log(st + " 至 " + ed + " 该时间段内无数据，继续请求下一个时间段！");
                var count = _self.timeslice.getTimeStepCount();
                var total = _self.timeslice.getTotalTimeStepCount();

                if (count > 0) {
                    var bt = _self.timeslice.getTimeGroup()[(total - count)];
                    _self.timeslice.timeDeCount();
                    _self.updateTshfData(bt[0], bt[1], _self.timeslice.getNum());
                } else {
                    var stt = $("#tshf_start_time").val().replace(/-/g, "/");
                    var edt = $("#tshf_end_time").val().replace(/-/g, "/");
                    layui.layer.alert("开始时间：" + stt + "<br>结束时间：" + edt + "<br>" + " 该时间段内无数据，请选择其他时间段！", {icon: 0});
                }
            }
        },
        error: function (data) {
            console.log(data);
            layui.layer.close(idx);
        },
        complete: function (a, b, c) {
            layui.layer.close(idx);
        }
    });
}

/**
 * 更新态势回放类型专题参数
 * @param {*} data 
 */
Tshf.prototype.updateTshfData = function (stime, etime, num) {
    var _self = this;
    var idx = layer.load(0, {time: 30 * 1000});
    var params = {
        start: layui.util.toDateString(stime),
        end: layui.util.toDateString(etime),
        type: "today",
        simplify: false
    };

    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        url: "../mbtshf/getByTimeRange",
        data: JSON.stringify(params),
        success: function (result) {
            var code = result.code;
            var data = result.data;
            var msg = result.msg;
            if (code != 0) {
                layui.layer.alert(msg, {icon: 0});
                return;
            }
            if (data.length > 0) {
                _self.tshfdata.mbtracks = data;

                if (_self.playback.isPlaying()) {
                    _self.playback.stop();
                }
                _self.playback.setData(data);
                _self.playback.start();
            } else {
                var count = _self.timeslice.getTimeStepCount();
                var total = _self.timeslice.getTotalTimeStepCount();
                if (count > 0) {
                    var bt = _self.timeslice.getTimeGroup()[(total - count)];
                    _self.timeslice.timeDeCount();
                    _self.updateTshfData(bt[0], bt[1], _self.timeslice.getNum());
                } else {
                    var stt = $("#tshf_start_time").val().replace(/-/g, "/");
                    var edt = $("#tshf_end_time").val().replace(/-/g, "/");
                    layui.layer.alert("开始时间：" + stt + "<br>结束时间：" + edt + "<br>" + " 该时间段内无数据，请选择其他时间段！", {icon: 0});
                    $("#loadtshf").removeAttr("disabled");
                    $("#start").attr("disabled", "true");
                    $("#stop").attr("disabled", "true");
                }
            }
        },
        error: function (data) {
            console.log(data);
            layui.layer.close(idx);
        },
        complete: function (a, b, c) {
            layui.layer.close(idx);
        }
    });

}

/**
 * 加载轨迹回放代码
 * @param {type} playback
 * @param {type} stime
 * @param {type} etime
 * @returns {undefined}
 */
Tshf.prototype.loadGjhfData = function (playback, stime, etime, mbid) {

    var _self = this;

    //清除所有目标
    _self.manager.clearQueueByXYMCAndLayer("SSTS_BD_TSHF", this.trackslayer, this.positionslayer);
    //清除回放数据
    playback.destroy();
    _self.tshfdata = {
        isprocess: false,
        mbtracks: []
    };

    var st = layui.util.toDateString(stime);
    var ed = layui.util.toDateString(etime);
    var params = {
        start: st,
        end: ed,
        type: "today",
        simplify: false,
        optional: {
            sn: mbid
        }

    };

    var idx = layer.load(0, {time: 30 * 1000})

    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        url: "../mbtshf/getByTimeRange",
        data: JSON.stringify(params),
        success: function (result) {
            var code = result.code;
            var data = result.data;
            var msg = result.msg;
            if (code != 0) {
                layui.layer.alert(msg);
                return;
            }
            // console.log(data);
            if (data.length > 0) {
                var trackers = [];
                var gjs = [];
                var format = new ol.format.GeoJSON();
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var feature = format.readFeature(item);
                    var prop = feature.getProperties();
                    var tracker = new ol.Track();
                    var multi = new ol.geom.MultiPoint([]);
                    tracker.set("showTag", false);
                    var wgslonlat;
                    var lastCoord = feature.getGeometry().getFirstCoordinate();
                    var coords = feature.getGeometry().getCoordinates();
                    for (var j = 0; j < coords.length; j++) {
                        if (_self.gps) {
                            wgslonlat = coords[j];
                            var newLonlat = GPS.gcj_encrypt(wgslonlat[1], wgslonlat[0]);
                            wgslonlat[0] = newLonlat.lon;
                            wgslonlat[1] = newLonlat.lat;
                            wgslonlat = ol.proj.fromLonLat(wgslonlat);
                            var point = new ol.geom.Point(wgslonlat, "XY");
                            multi.appendPoint(point);
                        }
                    }

                    var wgslonlat = lastCoord;
                    if (_self.gps) {
                        var newLonlat = GPS.gcj_encrypt(wgslonlat[1], wgslonlat[0]);
                        wgslonlat[0] = newLonlat.lon;
                        wgslonlat[1] = newLonlat.lat;
                    }
                    wgslonlat = ol.proj.fromLonLat(wgslonlat);
                    var point = new ol.geom.Point(wgslonlat, "XY");
                    multi.appendPoint(point);

                    var ph = prop.sn;
                    var queue = "SSTS_BD_TSHF";
                    var fid = queue + "_" + ph;

                    tracker.setGeometry(point);
                    tracker.set("queue", queue);
                    tracker.setId(fid);

                    prop.queue = queue;
                    prop.lon = wgslonlat[0];
                    prop.lat = wgslonlat[1];
                    if (prop.mbmc == "null" || prop.mbmc == null) {
                        prop.mbmc = "";
                    }
                    if (prop.gjstr == "null" || prop.gjstr == null) {
                        prop.gjstr = "不明";
                    }
                    if (prop.gd == -999999) {
                        prop.gd = 0;
                    }
                    prop.drawtime = new Date().getTime();

                    var info = _self.manager.selectDeviceType(prop.deviceTypeName);
                    prop.mblb = info.mblb;
                    prop.iconinfo = info;

                    var scale = 0.7;
                    var anchor = [0.5, 0.5];
                    if (prop.mblb === '空中目标') {
                        anchor = [0.5, 0.4];

                    } else if (prop.mblb === '水面目标') {
                        anchor = [0.05, 0.5];
                    }
                    var rotat = 0;
                    if (info.rotation) {
                        rotat = ((prop.heading + 90) / 180) * Math.PI;
                    } else {
                        rotat = 0;
                    }

                    var image = new ol.style.Icon(({
                        scale: scale,
                        anchor: anchor,
                        src: info.iconUrl,
                        rotation: rotat
                    }));
                    var style = new ol.style.Style({
                        image: image,
                        text: new ol.style.Text({
                            textAlign: 'left',
                            textBaseline: "middle",
                            offsetX: 10,
                            offsetY: 10,
                            font: "11px 微软雅黑",
                            text: prop.mbmc, //getText(),//this.get('name'),
                            //text:this.get('name'),
                            fill: new ol.style.Fill({
                                color: 'red'
                            }), //字体颜色
                            stroke: new ol.style.Stroke({
                                color: 'white',
                                width: 2
                            }), //字体背景色和背景宽度
                            offsetX: 0,
                            // offsetY: 15,
                            rotation: 0
                        })
                    });
                    tracker.setStyle(style);
                    trackers.push(tracker);

                    var linefeature = new ol.Feature({
                        geometry: multi
                    });
                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 2,
                            fill: new ol.style.Fill({
                                color: "red"
                            }),
                            stroke: new ol.style.Stroke({
                                color: "red",
                                width: 1
                            })
                        })
                    });

                    linefeature.setStyle(style);
                    gjs.push(linefeature);

                }

                _self.tshfdata.mbtracks = data;
                _self.tshfdata.gjdata = gjs;
                _self.trackslayer.getSource().addFeatures(trackers);
                _self.positionslayer.getSource().addFeatures(gjs);
                var ext = _self.positionslayer.getSource().getExtent();
                if (ext) {
                    _self.map.getView().fit(ext);
                }
                //设置新的目标
                playback.setData(_self.tshfdata.mbtracks, function (geojson, layer) {
                    //默认将轨迹点添加到图层上
                    if (_self.tshfdata.gjdata.length > 0) {
                        layer.getSource().addFeatures(_self.tshfdata.gjdata);
                        var opts = {
                            elem: '#slideTest15',
                            theme: '#1E9FFF',
                            tips: true,
                            min: playback.getStartTime(),
                            max: playback.getEndTime(),
                            step: (playback.getEndTime() - playback.getStartTime()) / 100,
                            value: playback.getStartTime(),
                            change: function (value) {

                                if (("" + value) == "NaN") {
                                    return false;
                                }
                                var val = new Date(value.replace(/-/g, "/"));
                                playback.setCursor(val.getTime());
                            },
                            setTips: function (value) {
                                return layui.util.toDateString(value);
                            }
                        };

                        layui.use('slider', function () {
                            $("#slideTest15").layuiSliderRender(opts);
                        });

                    } else {
                        layui.layer.alert("无数据，不可回放！", {icon: 0});
                    }
                });
            } else {
                layui.layer.alert("开始时间：" + st + "<br>结束时间：" + ed + "<br>" + " 该时间段内无数据，请选择其他时间段！", {icon: 0});
                $("#loadgjhf").removeAttr("disabled");
                $("#gjstart").removeAttr("disabled");
                $("#gjstop").attr("disabled", "true");
            }
        },
        error: function (data) {
            console.log(data);
        },
        complete: function (a, b, c) {
            layui.layer.close(idx);
        }
    });
}

/**
 * 暂停回放
 */
Tshf.prototype.stop = function (currentTime) {
    $("#stop").trigger("click");
    $("#gjstop").trigger("click");
    $("#start").attr("disabled", "true");
    $("#gjstart").attr("disabled", "true");
    var $slider = $("#slideTest15");
    $slider.find(".layui-slider-bar").css({"width": 0 + "%"});
    $slider.find(".layui-slider-wrap").css({"left": 0 + "%"});
    $("#x-view-module").find(".control-nav-bar >a[x-btn-name='play'] > .iconfont")
            .removeClass("fa-pause-circle-o").addClass("fa-play-circle-o");
    if(currentTime){
        this.playback.setCursor(currentTime);
    }
    layui.layer.alert("所有轨迹回放完成！", {icon: 1});
}

/**
 * 显示或隐藏航迹
 * @param {*} show 
 */
Tshf.prototype.showHJ = function (show) {
    this.positionslayer.setVisible(show);
}


