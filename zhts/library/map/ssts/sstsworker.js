Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val)
            return i;
    }
    return -1;
};

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * 实时态势WebSocket处理
 */
var SstsWebSocket = function (url, vhost, user, password, manager) {

    var ws = new WebSocket(url);
    var client = Stomp.over(ws);
    this._client = client;
    this.sendClient = null;
    this.subscribes = [];
    client.debug = function (message) {
        //不输出消息内容，只用于配合stomp框架做心跳检查
    };

    this.showTag = {
        show: true
    };
    this.fixGPS = true;

    this.tsld = {
        sync: false
    };

    this.status = {
        receive: false
    };

    this.manager = manager;

    var _self = this;

    var on_connect = function (x) {
        //订阅信息
        console.log("客户端接入....")
    };
    var on_error = function (m) {
        console.log('error,socket链接失败！！！！');
        console.log('重新开始连接！！');
        _self.reconnect();
    };

    this.info = {
        url: url,
        vhost: vhost,
        user: user,
        password: password,
        on_connect: on_connect,
        on_error: on_error
    };
    client.connect(user, password, on_connect, on_error, vhost);
}

/**
 * 接收实时消息
 * 
 */
SstsWebSocket.prototype.receiveMessage = function (queue, callback) {
    var _self = this;
    //判断接收数据之后，根据树形节点选中状态判断显示隐藏
    var sub = this._client.subscribe("/exchange/amq.topic/" + queue, function (m) {
        var data = JSON.parse(m.body);
        var prop = _self._convertData(data);
        prop.queue = queue;

        if (_self.status.receive) {

            var res = _self.manager.map.getView().getResolution();
            var point_count = 5;
            var fid = prop.queue + "_" + prop.ph;
            var source = _self.manager.getMBLayer().getSource();
            var track = source.getFeatureById(fid);
            //判断图层中是否已存在对应的目标对象
            if (track) {
                var lonlat = [prop.lon, prop.lat, prop.gd];
                // feature.set("olcs_model", modelOpt);
                track.setProperties(prop);
                track.move(lonlat);
                //将属性数据外传
                if (callback instanceof Function) {
                    callback(prop.ph, true);
                }

            } else {
                var lonlat = [prop.lon, prop.lat, prop.gd];
                var point = ol.proj.fromLonLat(lonlat);
                var p = new ol.geom.Point(point, "XYZ");
                track = new ol.Track();
                track.setGeometry(p);
                track.setId(fid); //设置唯一辨识
                track.setProperties(prop);

                var _popup = new ol.Overlay.Popup({
                    popupClass: "default shadow", //"tooltips", "warning" "black" "default", "tips", "shadow",
                    closeBox: true,
                    //onclose: function(){ console.log("You close the box"); },
                    // onshow: function() { console.log("You opened the box"); },
                    positioning: 'bottom-center',
                    autoPan: true,
                    offset: [1.2, -20],
                    autoPanAnimation: {
                        duration: 100
                    }
                });
                _popup.setPosition(point);
                track.setStyle(_self.manager.styleFun, res);
                _popup.hide();
                track.bindOverlay(_popup);
                _self.manager.map.addOverlay(_popup);

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
                    "point_count": point_count,
                    "size": 1,
                    "dwsx": prop.dwsx,
                    "color": prop.textColor
                });
                linefeature.setId(prop.queue + "_" + prop.ph);
                track.bindMultiPoint(linefeature);
                var hjlayer = _self.manager.getLayerByQueueName(prop.queue);
                hjlayer.getSource().addFeature(linefeature);
                _self.manager.mbLayer.getSource().addFeature(track);
                //处理是否在线状态         
                if (callback instanceof Function) {
                    callback(prop.ph, true);
                }
            }
        }
    });

    var subscribe = {
        name: queue,
        value: sub
    };
    this.subscribes.push(subscribe);
}

/**
 * 重新链接
 */
SstsWebSocket.prototype.reconnect = function () {
    var _info = this.info;
    var _self = this;
    _self.unsubscribe("SSTS_BD");
    this._client.disconnect();
    var ws = new WebSocket(_info.url);
    this._client = Stomp.over(ws);
    this._client.debug = function (message) {
        //不输出消息内容，只用于配合stomp框架做心跳检查
    };

    this._client.connect(_info.user, _info.password, _info.on_connect, _info.on_error, _info.vhost);
    //一开始默认接收融合结果数据源数据，并且将对应树形节点添加子节点数据
    //循环等待
    var id = setInterval(function () {
        if (_self._client.connected) {
            if (_self.status.receive) {
                _self.receiveMessage("SSTS_BD");
                _self.syncMessage(function (type, title, value) {
                    _FunctionObject.moduleControl.SYSTEMMESSAGE.AlertMessage(type, title, value);
                });
            }
            console.log('重新连接成功！！');
            //清除循环回调
            clearInterval(id);
        }
    }, 2000);
}

/**
 * 停止接收
 * @returns {undefined}
 */
SstsWebSocket.prototype.stop = function () {
    this._client.disconnect();
}

/**
 * 停止接收数据，并清除所有目标和相关数据
 */
SstsWebSocket.prototype.unsubscribe = function (queue) {
    for (var i = 0; i < this.subscribes.length; i++) {
        var q = this.subscribes[i];
        if (q.name === queue) {
            this._client.unsubscribe(q.value.id);
            this.subscribes.remove(q);
            i--;
        }
    }
}

/**
 * 数据转换
 */
SstsWebSocket.prototype._convertData = function (data) {
    var ph = data.num;
    var lon = parseFloat(data.lon);
    var lat = parseFloat(data.lat);
    var alt = parseFloat(data.altitude) || 0;
    // var alt = parseFloat(data.evel);
    var speed = data.speed;
    // var timestamp = data.time;
    var timestamp = data.gpstime;
    var content = data.content == undefined ? "" : data.content;
    var hx = parseFloat(data.heading);

    var info = this.selectDeviceType(data.deviceTypeName, hx);
    var mblb = info.mblb;

    //纠偏
    if (this.fixGPS) {
        var newLonlat = GPS.gcj_encrypt(lat, lon);
        lon = newLonlat.lon;
        lat = newLonlat.lat;
    }

    //构建属性
    var prop = {
        ph: ph,
        mbmc: data.id,
//        gjstr: data.company,
//        gjnm: "0101",
//        jxh: ph,
        hx: info.hxoffset,
        lon: lon,
        lat: lat,
        gd: alt,
        sd: speed,
        status: data.status,
        devtype: data.deviceTypeName,
        time: timestamp,
        content: content,
//        mbtype: mbtype,
        mblb: mblb,
//        info: data.info,
        drawtime: new Date().getTime(),
        // velocity: velocity,
        textColor: "red",
        dwsx: "我"
    };
    return prop;
}

/**
 * 获取设备类型对应的目标类型和图标信息
 * 
 * @param {type} name
 * @returns {undefined}
 */
SstsWebSocket.prototype.selectDeviceType = function (name, hx) {

    var info = {
        mblb: "",
        iconUrl: "",
        hxoffset: 0,
        anchor: [0.5, 0.5],
        rotation: true
    };

    /**
     <option value="1">车载设备</option>
     <option value="2">手持设备</option>
     <option value="3">船舶设备</option>                          
     <option value="4">机载设备</option>
     <option value="5">运动设备</option>
     <option value="6">安全设备</option>
     <option value="7">测绘设备</option>
     */
    switch (name) {
        case "车载设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/car64.png";
            info.hxoffset = hx + 90,
                    info.anchor = [0.5, 0.5];
            break;
        case "手持设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.anchor = [0.5, 0.9];
            info.hxoffset = 0,
                    info.rotation = false;
            break;
        case "测绘设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.anchor = [0.5, 0.9];
            info.rotation = false;
            break;
        case "船舶设备":
            info.mblb = "水面目标";
            info.anchor = [0.9, 0.5];
            info.hxoffset = hx + 90,
                    info.iconUrl = "images/ship64.png";
            break;
        case "机载设备":
            info.mblb = "空中目标";
            info.iconUrl = "images/plane64.png";
            info.anchor = [0.5, 0.9];
            break;
        case "运动设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
            info.anchor = [0.5, 0.9];
            break;
        case "安全设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
            info.anchor = [0.5, 0.9];
            break;
        default:
            info.mblb = "陆地目标";
            info.anchor = [0.5, 0.9];
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
    }
    return info;
}



/**
 * 同步消息
 * @param {*} options 
 */
SstsWebSocket.prototype.syncMessage = function (callback) {

    var client = this;
    client.sendClient = this._client.subscribe("/exchange/amq.topic/SSTS_MESSAGE", function (m) {
        var msg = JSON.parse(m.body);
        var type = msg.type;
        var title = msg.title;
        var value = msg.content;
        if (callback instanceof Function) {
            callback(type, title, value);
        }
    });

    var subscribe = {
        name: "SSTS_MESSAGE",
        value: client.sendClient
    };
    this.subscribes.push(subscribe);
}
