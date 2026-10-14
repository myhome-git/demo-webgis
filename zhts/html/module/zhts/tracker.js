/**
 *  目标实体对象
 * @param {*} options 
 */
ol.Track = function (options) {
    ol.Feature.call(this);
    this.linestring = null;
    this.multipoint = null;
    this.feature = null;
    this.features = null;
    this.hjstyle = null;
    this.linktag = null;
    this.set("type", "track");
    //设置显示的内容多少，采用层级控制
    //默认0，
    // 1 显示较少内容，2 显示所有重要内容，3 显示自定义信息。
    this.set("showInfoLevel", 0);
    this.set("isFirst", true);
    this.set("showTag", true);
    this.set("showFlag", false);
    this.set("realtime", true);
    this.set("hjclass", "line");
    this.set("hjtype", "linestring");
    this.set("show", true);
    //
    this.set("status", "normal");

    //this.set("circleArr",[]);
    this.circleArr = [];
};

ol.inherits(ol.Track, ol.Feature);

/**
 * 设置航迹样式
 * @param {*} style 
 */
ol.Track.prototype.setHJStyle = function (style) {
    var hjtype = style.hjtype;
    var dw = style.dw;
    var color = style.color;
    var size = style.size;
    var pointCount = style.pointCount;
}

/**
 * 设置是否是第一次加入
 * @param {boolean} isFirst 
 */
ol.Track.prototype.setFirst = function (isFirst) {
    if (isFirst) {
        this.set("isFirst", true);
    } else {
        this.set("isFirst", false);
    }

}

/**
 * 设置标牌是否可拖拽
 * @param {boolean} drag 
 */
ol.Track.prototype.setTagDragable = function (drag) {
    this.linktag.setDragable(drag);
}

/**
 * 获取标牌是否可拖拽的状态
 */
ol.Track.prototype.getTagDragable = function () {
    return this.linktag.getDragable();
}

/**
 * 设置标牌显示信息级别
 * @param {number} level 
 */
ol.Track.prototype.setTagInfoLevel = function (level) {
    if (typeof (level) === 'number') {
        this.set("showInfoLevel", level);
    }
}

/**
 * 获取标牌显示信息级别
 */
ol.Track.prototype.getTagInfoLevel = function () {
    return this.get("showInfoLevel");
}

/**
 * 设置字体大小
 * @param {number} size 
 */
ol.Track.prototype.setFontSize = function (size) {
    if (size instanceof Number) {
        var font = size + "px bold 微软雅黑";
        this.getStyle().getText().setFont(font);
    }
}

/**
 * 设置字体大小类别，通过css样式来控制
 * @param {className} type 
 */
ol.Track.prototype.setTagFontType = function (type) {
    if (this.linktag) {
        this.linktag._container.className = type;
    }
}

/**
 *  设置标牌内容
 * @param {html} content 标牌内容
 */
ol.Track.prototype.setTagContent = function (content) {
    if (this.linktag) {
        this.linktag.setContent(content);
    }
}


/**
 * 设置字体颜色 
 * @param {*} color 
 */
ol.Track.prototype.setFontColor = function (color) {
    if (color) {
        this.getStyle().getText().getFill().setColor(color);
    }
}

/**
 *  移动目标
 * @param {ol.Coordinate} lonlat 
 */
ol.Track.prototype.move = function (lonlat, opt) {
    this.setPosition(lonlat, opt);
}

/**
 * 设置目标位置
 * @param {ol.Coordinate} lonlat 
 * @param {*} timestamp 
 */
ol.Track.prototype.setPosition = function (lonlat, opt) {
    // 坐标转换
    var coor = ol.proj.fromLonLat(lonlat);
    this.getGeometry().setCoordinates(coor);
    //派发geometry变化事件
    this.dispatchEvent("change:geometry");
}


/**
 * 经纬度转换成 度分秒
 * @param {*} value 度
 * @param {*} type  lon 或 lat
 */
ol.Track.prototype._formatDegree = function (value, type) {
    value = Math.abs(value);
    var d = Math.floor(value);
    var f = Math.floor((value - d) * 60);
    var m = Math.round((value - d) * 360 % 60);
    var dstr = "E";
    if (type === 'lon') {
        if (d < 0) {
            dstr = "W";
        }
    }
    if (type === 'lat') {
        if (d < 0) {
            dstr = "S";
        } else {
            dstr = "N";
        }
    }
    return dstr +  Math.abs(d)  + '°' + f + "′" + m + '″';
}

/**
 * 度分秒转换成经纬度
 * @param {*} value 
 */
ol.Track.prototype._strToDegree = function (value) {
    var d = value.split("°")[0];
    var f = value.split("°")[1].split("′")[0];
    var m = value.split("°")[1].split("′")[1].split("″")[0];
    return Math.abs(d) + (Math.abs(f) / 60 + Math.abs(m) / 3600);
}

/**
 *  目标绑定单种威胁，做到目标动，威胁范围跟着动。
 * @param {ol.Feature} feature 
 */
ol.Track.prototype.bindFeature = function (feature) {
    if (feature) {
        var _bindFeature = this.feature = feature;
        this.on("change:geometry", this._changeFeature, this);
    } else {
        throw "需要绑定的 Feature 对象不能为空！！"
    }
}

/**
 * 改变要素
 * @param {*} evt 
 */
ol.Track.prototype._changeFeature = function (evt) {
    if (this.feature) {
        var _bindFeature = this.feature;
        var coord = evt.target.getGeometry().getCoordinates();
        var center = _bindFeature.getGeometry().getFirstCoordinate();
        var geom = _bindFeature.getGeometry();
        var deltaX = coord[0] - center[0];
        var deltaY = coord[1] - center[1];
        //根据偏移量转换位置
        geom.translate(deltaX, deltaY);
    }
}

/**
 * 解除绑定Feature
 */
ol.Track.prototype.unBindFeature = function () {
    if (this.feature) {
        var _bindFeature = this.feature;
        this.un("change:geometry", this._changeFeature, this);
        return _bindFeature;
    }
    return null;
}


/**
 * 目标绑定多种威胁，做到目标动，所有威胁范围跟着动。
 * @param {Array} features 
 */
ol.Track.prototype.bindFeatures = function (features) {
    if (features) {
        this.features = { wxFeatures: features };
        this.on("change:geometry", this._changeFeatures, this);
    } else {
        throw "请先构建好威胁对象数组！";
    }
}

/**
 * 修改多个对象
 * @param {*} evt 
 */
ol.Track.prototype._changeFeatures = function (evt) {
    if (this.features) {
        var _features = this.features.wxFeatures;
        var coord = evt.target.getGeometry().getCoordinates();
        for (var i = 0; i < _features.length; i++) {
            var _bindFeature = _features[i];
            var center = _bindFeature.getGeometry().getFirstCoordinate();
            var geom = _bindFeature.getGeometry();
            var deltaX = coord[0] - center[0];
            var deltaY = coord[1] - center[1];
            //根据偏移量转换位置
            geom.translate(deltaX, deltaY);

            for(var key in zzfwnl.actionScopeNodeMap){
                if(key.split("_")[0]==_bindFeature.get("nm")){
                    zzfwnl.actionScopeNodeMap[key].point = [evt.target.values_.lon,evt.target.values_.lat];
                    AttackRange.move(_bindFeature.get("nm"),[evt.target.values_.lon,evt.target.values_.lat]);
                }
            }
            
        }
    }
}


/**
 * 解除绑定指定对象 
 */
ol.Track.prototype.unBindFeature = function (id) {
    var circleArr = this.circleArr;
    var circle;
    var arrindex;
    if (this.features) {
        var arr = circleArr;
        for (var i = 0; i < arr.length; i++) {
            var prop = arr[i].getProperties();
            //找到对应的圆，返回
            if (prop.id == id) {
                circle = arr[i];
                arrindex = i;
            }
        }
        circleArr.splice(arrindex, 1);
    }
    return circle;
}

/**
 * 解除绑定多个对象 
 */
ol.Track.prototype.unBindFeatures = function () {
    if (this.features) {
        this.un("change:geometry", this._changeFeatures, this);
    }
    return this.features;
}

/**
 * 
 * 绑定线要素，
 * @param {ol.Feature} feature
 */
ol.Track.prototype.bindLineString = function (feature) {
    if (feature) {
        var _feature = this.linestring = feature;
        var prop = _feature.getProperties();
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: prop.color,
                width: prop.size
            })
        });
        this.linestring.setStyle(style);
        this.on("change:geometry", this._changeLineString, this);
    } else {
        throw "需要绑定的 LineString 对象不能为空！！"
    }
}

/**
 * 改变线要素
 * @param {*} evt 
 */
ol.Track.prototype._changeLineString = function (evt) {
    var _feature = this.linestring;
    var type = _feature.getProperties().hjtype;
    var coordinate = evt.target.getGeometry().getCoordinates();
    if (type === "全航迹") {
        _feature.getGeometry().appendCoordinate(coordinate);
    } else {
        _feature.getGeometry().appendCoordinate(coordinate);
        var num = _feature.getProperties().point_count;
        var count = _feature.getGeometry().getCoordinates().length;
        if (count > num) {
            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
            var arr = _feature.getGeometry().getCoordinates().splice(1, num);
            _feature.getGeometry().setCoordinates(arr);
        }
    }
}

/**
 * 解除绑定线要素，解除后返回之前生成的线要素对象，用于构建下一个需要绑定的对象，例如：MultiPoint
 * @returns ol.geom.LineString  返回之前保留的线要素
 */
ol.Track.prototype.unBindLineString = function () {
    if (this.linestring) {
        var _feature = this.linestring;
        this.un("change:geometry", this._changeLineString, this);
        return _feature;
    }
    return null;
}

/**
 * 绑定多点要数
 * @param {ol.Feature} feature 
 */
ol.Track.prototype.bindMultiPoint = function (feature) {
    if (feature) {
        this.multipoint = feature;
        var prop = feature.getProperties();
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: prop.size,
                fill: new ol.style.Fill({
                    color: prop.color
                }),
                stroke: new ol.style.Stroke({
                    color: prop.color,
                    width: 1
                })
            })
        }));
        this.on("change:geometry", this._changeMultiPoint, this);
    } else {
        throw "需要绑定的 MultiPoint 对象不能为空！！"
    }
}

/**
 * 改变多点要素
 * @param {*} evt 
 */
ol.Track.prototype._changeMultiPoint = function (evt) {
    var _feature = this.multipoint;
    var type = _feature.getProperties().hjtype;
    var coordinate = evt.target.getGeometry().getCoordinates();
    if (type === "全航迹") {
        _feature.getGeometry().appendPoint(new ol.geom.Point(coordinate));
    } else {
        _feature.getGeometry().appendPoint(new ol.geom.Point(coordinate));
        var num = _feature.getProperties().point_count;
        var count = _feature.getGeometry().getCoordinates().length;
        if (count > num) {
            //超过num个点，则删除第一个点(从第一个位置开始，往后面取num个)
            var arr = _feature.getGeometry().getCoordinates().splice(1, num);
            _feature.getGeometry().setCoordinates(arr);
        }
    }
}

/**
 * 解除绑定多点要素，返回之前生成的多点要素，用于构建下一个需要绑定的对象，例如：LineString
 * @returns  ol.geom.MultiPoint 之前保留的航迹点
 */
ol.Track.prototype.unBindMultiPoint = function () {
    if (this.multipoint) {
        var _points = this.multipoint;
        this.un("change:geometry", this._changeMultiPoint, this);
        return _points;
    }
    return null;
}

/**
 * 解除绑定Tag标牌
 */
ol.Track.prototype.unBindLinkTag = function(){
    if(this.linktag){
        this.un("change:geometry", this._changeTag, this);
        return this.linktag;
    }
}

/**
 * 绑定Tag标牌
 * @param {*} tag 
 */
ol.Track.prototype.bindLinkTag = function (tag) {
    if (tag) {
        var _tag = this.linktag = tag;
        // this.set('tag', _tag);
        this.set('revision', false);
        //将自身赋给绑定的Tag，方便绑定的Tag做对应的变化
        _tag._setBindFeature(this);
        var origin = this.getGeometry().getCoordinates();
        _tag.getTagMarker().setPosition(origin);
        var _linkedLine = _tag._createLineByOrigin(origin);
        if (_tag.lineOptions) {
            var lineStyle = new ol.style.Style({
                stroke: new ol.style.Stroke(_tag.lineOptions),
                zIndex: 1000
            });
            if (!_tag._linkedLine) {
                _tag._linkedLine = new ol.Feature();
            }
            _tag.getLinkedLine().setGeometry(_linkedLine);
            _tag.getLinkedLine().setStyle(lineStyle);
            _tag.getLinkedLine().set("tagline", "tagline");
            _tag.getLinkedLine().set("ph", _tag._ph);
            _tag.getLinkedLine().set("fid", _tag._fid);
            _tag.getLinkedLine().setId(_tag._fid);
        }


        this.on("change:geometry", this._changeTag, this);

    } else {
        throw "需要绑定的 Tag 标牌对象不能为空！！"
    }
}

/**
 * 绑定Tag标牌
 * @param {*} tag 
 */
ol.Track.prototype.bindLinkTagByTarget = function (tag, targetCoord) {
    if (tag) {
        var _tag = this.linktag = tag;
        // this.set('tag', _tag);
        this.set('revision', false);
        //将自身赋给绑定的Tag，方便绑定的Tag做对应的变化
        _tag._setBindFeature(this);
        var origin = this.getGeometry().getCoordinates();
        _tag.getTagMarker().setPosition(targetCoord);
        var _linkedLine = _tag._createLineByPosition(origin, targetCoord);
        if (_tag.lineOptions) {
            var lineStyle = new ol.style.Style({
                stroke: new ol.style.Stroke(_tag.lineOptions),
                zIndex: 1000
            });
            if (!_tag._linkedLine) {
                _tag._linkedLine = new ol.Feature();
            }
            _tag.getLinkedLine().setGeometry(_linkedLine);
            _tag.getLinkedLine().setStyle(lineStyle);
            _tag.getLinkedLine().set("tagline", "tagline");
            _tag.getLinkedLine().set("ph", _tag._ph);
            _tag.getLinkedLine().set("fid", _tag._fid);
            _tag.getLinkedLine().setId(_tag._fid);
        }

        this.on("change:geometry", this._changeTag, this);

    } else {
        throw "需要绑定的 Tag 标牌对象不能为空！！"
    }
}

/**
 * 获取tag
 */
ol.Track.prototype.getLinkedTag = function () {
    return this.linktag;
}

/**
 * 更新linktag 连接线
 */
ol.Track.prototype._updateTagLine = function () {
    if (this.linktag) {
        var coors = this.linktag.getTagMarkerCoordinate(this.getGeometry().getCoordinates());
        this.linktag.getLinkedLine().getGeometry().setCoordinates(coors);
    }
}

/**
 *  修改标牌的位置和连接线的位置
 * 
 * @param {*} evt 
 */
ol.Track.prototype._changeTag = function (evt) {
    if (this.linktag) {
        var _tag = this.linktag;
        var origin = evt.target.getGeometry().getCoordinates();
        var coor = _tag.getLinkedLine().getGeometry().getCoordinates()[0];
        var last = _tag.getLinkedLine().getGeometry().getCoordinates()[1];
        var _linkedLine = _tag._createLineByOrigin(origin);
        //设置新的线
        _tag.getLinkedLine().setGeometry(_linkedLine);
        _tag.getTagMarker().setPosition(origin);
        //计算目标和标牌的相对位置
        var pixelOrain = _tag.map.getPixelFromCoordinate(last);
        var pixelTarget = _tag.map.getPixelFromCoordinate(coor);
        var deltaPX = pixelOrain[0] - pixelTarget[0];
        var deltaPY = pixelOrain[1] - pixelTarget[1];
        //设置marker的offset参数
        _tag.getTagMarker().setOffset([deltaPX, deltaPY]);

    }
}

/**
 * 更改标牌内容
 */
ol.Track.prototype.changeTagContent = function (infolevel) {
    var prop = this.getProperties();
    var showFlag = this.get("showFlag");
    var realtime = this.get("realtime");
    var time = "";
    var sd ="",heading="";
    var gjstr = prop.gjstr;
    if (realtime) {
        time = prop.time.substr(11, prop.time.length);
    } else {
        time = prop.time;
    }
    //如果台湾就不显示国旗
    if (prop.gjstr == '台湾') {
        showFlag = false;
    }

    //当国家不明时
    if (prop.gjstr == '不明') {
        gjstr = "";
    }

    if(prop.mblb=='水面目标'){
        sd = Number(prop.sd).toFixed(2) + " kn";
    }else{
        sd = Number(prop.sd).toFixed(2) +" km/h";
    }
    heading = Number(prop.heading).toFixed(2) +"°";

    var flag = showFlag ? ("<img src='" + basePath + "/resources/country/24/" + prop.gjnm + ".png'>") : "";
    switch (infolevel) {
        case 1:
            // 如果开始是 1 ，则需要显示 2 的内容
            var content = gjstr + flag + "<br/>全名：" + prop.jxh + "<br>航向：" + heading + "<br>" + "速度：" + sd;

            if (prop.gd != -999999) {
                content += "<br>高/深：" + prop.gd;
            }

            if (prop.mbtype > 0) {
                content += "<br>编码：" + prop.mbtype;

                if (prop.mbtypename) {
                    content += "<br>类型：" + prop.mbtypename;
                }

            }

            content += "<br/>经度：" + this._formatDegree(prop.lon, "lon") + "<br> 纬度：" + this._formatDegree(prop.lat, "lat") + "<br>" + "批号：" + prop.ph + "<br>时间：" + time;

            this.setTagContent(content);
            this.set("showInfoLevel", 2);
            break;
        case 2:
            //如果开始是2 ，则需要显示 3 的内容
            var content = gjstr + flag + "<br/>全名：" + prop.jxh + "<br>批号：" + prop.ph + "<br>时间：" + time;
            this.setTagContent(content);
            this.set("showInfoLevel", 3);
            break;
        case 3:
            var mbmc = prop.mbmc;
            if (!mbmc) {
                mbmc = prop.jxh;
                if (!mbmc) {
                    mbmc = prop.ph;
                }
            }
            //如果开始是 3，则需要显示 1 的内容
            var content = gjstr + flag + "<br/>" + mbmc;

            this.setTagContent(content);
            this.set("showInfoLevel", 1);
            break;
        default:
            var mbmc = prop.mbmc;
            if (!mbmc) {
                mbmc = prop.jxh;
                if (!mbmc) {
                    mbmc = prop.ph;
                }
            }
            var content = gjstr + flag + "<br/>" + mbmc ;

            this.setTagContent(content);
            this.set("showInfoLevel", 1);
            break;
    }

}

var degreeToRadian = function (degree) {
    return Math.PI * degree / 180;
};