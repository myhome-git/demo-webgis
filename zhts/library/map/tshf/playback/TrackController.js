/**
 * 态势回放组件
 */
ol.Playback = ol.Playback || {};

/**
 * 态势回放控制器
 * @param {*} map 地图对象
 * @param {*} tracks  回放目标列表
 * @param {*} options 参数列表
 */
ol.Playback.TrackController = function (map, tracks, options) {
    this.options = options || {};
    this._map = map;
    this._tracks = [];
    // initialize tick points
    this.setTracks(tracks);
}

/**
 * 清除所有目标对象
 */
ol.Playback.TrackController.prototype.clearTracks = function () {
    while (this._tracks.length > 0) {
        var track = this._tracks.pop();
        var marker = track.getMarker();
        var tooltip = track.getTooltip();
        if (tooltip) {
            this._map.removeOverlay(tooltip);
        }
        if (marker) {
            var id = marker.getId();
            var f = this.options._tracksLayer.getSource().getFeatureById(id);
            if (f) {
                this.options._tracksLayer.getSource().removeFeature(marker);
            }
        }
    }
}

/**
 * 重置所有回放目标对象
 * @param {*} tracks 目标对象 
 */
ol.Playback.TrackController.prototype.setTracks = function (tracks) {
    // reset current tracks
    this.clearTracks();
    this.addTracks(tracks);
}

/**
 * 批量加载回放对象
 * @param {*} tracks 目标对象
 */
ol.Playback.TrackController.prototype.addTracks = function (tracks) {
    // return if nothing is set
    if (!tracks) {
        return;
    }

    if (tracks instanceof Array) {
        for (var i = 0, len = tracks.length; i < len; i++) {
            this.addTrack(tracks[i]);
        }
    } else {
        this.addTrack(tracks);
    }
}

/**
 * 添加单个目标对象
 * @param {*} track 目标对象
 * @param {*} timestamp 时间戳
 */
ol.Playback.TrackController.prototype.addTrack = function (track, timestamp) {
    // return if nothing is set
    if (!track) {
        return;
    }

    var marker = track.setMarker(timestamp, this.options);
    var prop = track._geoJSON.properties;

    if (prop.mbmc == "null" || prop.mbmc == null) {
        prop.mbmc = "";
    }
    var info = this.selectDeviceType(prop.deviceTypeName);
    var scale = 0.7;
    var anchor = info.anchor;
    
    prop.mblb = info.mblb;
    prop.iconInfo = info;

    marker.setProperties(prop);

    var rotat = 0;
    if (info.rotation) {
        rotat = 0;
    } else {
        rotat = ((prop.heading) / 180) * Math.PI;
    }

    var style = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            scale: scale,
            anchor: anchor,
            src: info.iconUrl,
            rotation: rotat
        })),
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
        }),
    });

    marker.setStyle(style);

//    var line = new ol.geom.LineString([], "XY");
//    var feature3 = new ol.Feature({
//        geometry: line,
//    });
//    feature3.setProperties({
//        "ph": prop.ph,
//        "hjtype": "中航迹",
//        "point_count": 100,
//        "size": 1,
//        "color": "red"
//    });
//    feature3.setId(prop.ph);
//    feature3.set("status", "online");
//    marker.bindLineString(feature3);
    if (marker) {
//        this.options._positionslayer.getSource().addFeature(feature3);
        this._tracks.push(track);
    }
}

/**
 * 开始计时
 * @param {*} timestamp 时间戳
 * @param {*} transitionTime 变换时间
 */
ol.Playback.TrackController.prototype.tock = function (timestamp, transitionTime) {
    for (var i = 0, len = this._tracks.length; i < len; i++) {
        var lngLat = this._tracks[i].tick(timestamp);
        if (lngLat != null) {
            this._tracks[i].moveMarker(lngLat, transitionTime, timestamp);
        }
    }
}

/**
 * 获取开始时间
 */
ol.Playback.TrackController.prototype.getStartTime = function () {
    var earliestTime = 0;

    if (this._tracks.length > 0) {
        earliestTime = this._tracks[0].getStartTime();
        for (var i = 1, len = this._tracks.length; i < len; i++) {
            var t = this._tracks[i].getStartTime();
            if (t < earliestTime) {
                earliestTime = t;
            }
        }
    }

    return earliestTime;
}

/**
 * 获取结束时间
 */
ol.Playback.TrackController.prototype.getEndTime = function () {
    var latestTime = 0;

    if (this._tracks.length > 0) {
        latestTime = this._tracks[0].getEndTime();
        for (var i = 1, len = this._tracks.length; i < len; i++) {
            var t = this._tracks[i].getEndTime();
            if (t > latestTime) {
                latestTime = t;
            }
        }
    }

    return latestTime;
}

/**
 * 获取所有回放目标
 */
ol.Playback.TrackController.prototype.getTracks = function () {
    return this._tracks;
};

/**
 * 获取设备类型对应的目标类型和图标信息
 * 
 * @param {type} name
 * @returns {undefined}
 */
ol.Playback.TrackController.prototype.selectDeviceType = function (name) {

    var info = {
        mblb: "",
        iconUrl: "",
        anchor:[0.5,0.5],
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
            info.anchor=[0.5,0.5];
            break;
        case "手持设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.anchor=[0.5,0.9];
            info.rotation = false;
            break;
        case "测绘设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.anchor=[0.5,0.9];
            info.rotation = false;
            break;
        case "船舶设备":
            info.mblb = "水面目标";
            info.anchor=[0.9,0.5];
            info.iconUrl = "images/ship64.png";
            break;
        case "机载设备":
            info.mblb = "空中目标";
            info.iconUrl = "images/plane64.png";
            info.anchor=[0.5,0.9];
            break;
        case "运动设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
            info.anchor=[0.5,0.9];
            break;
        case "安全设备":
            info.mblb = "陆地目标";
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
            info.anchor=[0.5,0.9];
            break;
        default:
            info.mblb = "陆地目标";
            info.anchor=[0.5,0.9];
            info.iconUrl = "images/marker-gold.png";
            info.rotation = false;
    }
    return info;
}
