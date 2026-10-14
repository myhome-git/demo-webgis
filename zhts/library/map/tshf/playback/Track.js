ol.Playback = ol.Playback || {};

/**
 * 回放目标对象包装
 * @param {*} geoJSON 目标数据 
 * @param {*} options 参数列表
 */
ol.Playback.Track = function (geoJSON, options) {
    this.options = options || {};
    var tickLen = options.tickLen || 250;
    this._staleTime = options.staleTime || 60 * 60 * 1000;
    this._fadeMarkersWhenStale = options.fadeMarkersWhenStale || false;
    this._geoJSON = geoJSON;
    this._tickLen = tickLen;
    this._ticks = [];
    this._marker = null;
    this._hjmarker = null;
    this._trackTooltip = null;
    this._trackTooltipElement = null;
    this._orientations = [];
    var sampleTimes = geoJSON.properties.gpstimes;
    this._orientIcon = options.orientIcons;
    this.gps = options.gps;
    var previousOrientation;
    var samples = geoJSON.geometry.coordinates;
    var currSample = samples[0];
    var nextSample = samples[1];
    this._markerIsHide = true;
    var currSampleTime = sampleTimes[0];
    var t = currSampleTime; // t is used to iterate through tick times
    var nextSampleTime = sampleTimes[1];
    var tmod = t % tickLen; // ms past a tick time
    var rem, ratio;

    // handle edge case of only one t sample
    if (sampleTimes.length === 1) {
        if (tmod !== 0)
            t += tickLen - tmod;
        this._ticks[t] = samples[0];
        this._orientations[t] = 0;
        this._startTime = t;
        this._endTime = t;
        return;
    }

    // interpolate first tick if t not a tick time
    if (tmod !== 0) {
        rem = tickLen - tmod;
        ratio = rem / (nextSampleTime - currSampleTime);
        t += rem;
        this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
    } else {
        this._ticks[t] = currSample;
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
    }

    this._startTime = t;
    t += tickLen;
    while (t < nextSampleTime) {
        ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
        this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
        this._orientations[t] = this._directionOfPoint(currSample, nextSample);
        previousOrientation = this._orientations[t];
        t += tickLen;
    }

    // iterating through the rest of the samples
    for (var i = 1, len = samples.length; i < len; i++) {
        currSample = samples[i];
        nextSample = samples[i + 1];
        t = currSampleTime = sampleTimes[i];
        nextSampleTime = sampleTimes[i + 1];

        tmod = t % tickLen;
        if (tmod !== 0 && nextSampleTime) {
            rem = tickLen - tmod;
            ratio = rem / (nextSampleTime - currSampleTime);
            t += rem;
            this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
            if (nextSample) {
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                previousOrientation = this._orientations[t];
            } else {
                this._orientations[t] = previousOrientation;
            }
        } else {
            this._ticks[t] = currSample;
            if (nextSample) {
                this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                previousOrientation = this._orientations[t];
            } else {
                this._orientations[t] = previousOrientation;
            }
        }

        t += tickLen;
        while (t < nextSampleTime) {
            ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);

            if (nextSampleTime - currSampleTime > options.maxInterpolationTime) {
                this._ticks[t] = currSample;

                if (nextSample) {
                    this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                    previousOrientation = this._orientations[t];
                } else {
                    this._orientations[t] = previousOrientation;
                }
            } else {
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                if (nextSample) {
                    this._orientations[t] = this._directionOfPoint(currSample, nextSample);
                    previousOrientation = this._orientations[t];
                } else {
                    this._orientations[t] = previousOrientation;
                }
            }

            t += tickLen;
        }
    }
    // the last t in the while would be past bounds
    this._endTime = t - tickLen;
    this._lastTick = this._ticks[this._endTime];
};



ol.Playback.Track.prototype._interpolatePoint = function (start, end, ratio) {
    try {
        // console.log(ratio);
        var delta = [end[0] - start[0], end[1] - start[1]];
        var offset = [delta[0] * ratio, delta[1] * ratio];
        // console.log(offset);
        return [start[0] + offset[0], start[1] + offset[1]];
    } catch (e) {
        console.log('err: cant interpolate a point');
        console.log(['start', start]);
        console.log(['end', end]);
        console.log(['ratio', ratio]);
    }
};



/**
 * 位置点方向
 * @param {*} start 起始点
 * @param {*} end 结束点
 */
ol.Playback.Track.prototype._directionOfPoint = function (start, end) {
    return this._getBearing(start[1], start[0], end[1], end[0]);
};


ol.Playback.Track.prototype._getBearing = function (startLat, startLong, endLat, endLong) {
    startLat = this._radians(startLat);
    startLong = this._radians(startLong);
    endLat = this._radians(endLat);
    endLong = this._radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0)
            dLong = -(2.0 * Math.PI - dLong);
        else
            dLong = (2.0 * Math.PI + dLong);
    }

    return (this._degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
};

ol.Playback.Track.prototype._radians = function (n) {
    return n * (Math.PI / 180);
};

ol.Playback.Track.prototype._degrees = function (n) {
    return n * (180 / Math.PI);
};

/**
 * 创建一个UUID值
 */
ol.Playback.Track.prototype.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the
    // clock_seq_hi_and_reserved
    // to 01
    s[8] = s[13] = s[18] = s[23] = "";

    var uuid = s.join("");
    return uuid;
}

/**
 * 获取开始时间戳
 */
ol.Playback.Track.prototype.getFirstTick = function () {
    return this._ticks[this._startTime];
};

/**
 * 获取最后一个时间戳
 */
ol.Playback.Track.prototype.getLastTick = function () {
    return this._ticks[this._endTime];
};

/**
 * 获取开始时间
 */
ol.Playback.Track.prototype.getStartTime = function () {
    return this._startTime;
};

/**
 * 获取结束时间
 */
ol.Playback.Track.prototype.getEndTime = function () {
    return this._endTime;
};

/**
 * 获取插值后的目标回放对象
 */
ol.Playback.Track.prototype.getTickMultiPoint = function () {
    var t = this.getStartTime();
    var endT = this.getEndTime();
    var coordinates = [];
    var time = [];
    while (t <= endT) {
        time.push(t);
        coordinates.push(this.tick(t));
        t += this._tickLen;
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'MultiPoint',
            coordinates: coordinates
        },
        properties: {
            time: time
        }
    };
};

ol.Playback.Track.prototype.trackPresentAtTick = function (timestamp) {
    return (timestamp >= this._startTime);
};

ol.Playback.Track.prototype.trackStaleAtTick = function (timestamp) {
    return ((this._endTime + this._staleTime) <= timestamp);
};

/**
 * 秒表跳动
 * @param {*} timestamp 时间戳
 */
ol.Playback.Track.prototype.tick = function (timestamp) {
    if (timestamp >= this._endTime) {
        timestamp = this._endTime;
        if (!this._markerIsHide) {
            this.hideMarker();
            this._markerIsHide = true;
            return null;
        }
    } else if (timestamp < this._startTime) {//当前时间小于开始时间
        timestamp = this._startTime;
        return null;
    } else if (timestamp > this._startTime && timestamp <= this._endTime) {
        if (this._markerIsHide) {
            this.showMarker();
            this._markerIsHide = false;
        }
    }
    return this._ticks[timestamp];
};

/**
 * 获取第一个lonlat
 * @param {*} timestamp 
 */
ol.Playback.Track.prototype.getOneLonlat = function (timestamp) {
    if (timestamp > this._endTime) {
        timestamp = this._endTime;
    } else if (timestamp < this._startTime) {
        timestamp = this._startTime;
    }
    return this._ticks[timestamp];
}

/**
 *  获取当前时间戳目标航行方向
 * @param {*} timestamp  时间戳
 */
ol.Playback.Track.prototype.courseAtTime = function (timestamp) {
    //return 90;
    if (timestamp > this._endTime)
        timestamp = this._endTime;
    else if (timestamp < this._startTime)
        timestamp = this._startTime;
    return this._orientations[timestamp];
};

/**
 * 显示
 */
ol.Playback.Track.prototype.showMarker = function () {
    this._tracksLayer.getSource().addFeature(this._marker);
}

/**
 * 隐藏标牌
 */
ol.Playback.Track.prototype.hideMarker = function () {
    var id = this._marker.getId();
    var f = this._tracksLayer.getSource().getFeatureById(id);
    if (f) {
        var line = f.unBindLineString();
        var linef = this._positionsLayer.getSource().getFeatureById(id);
        if (linef) {
            this._positionsLayer.getSource().removeFeature(linef);
        }
        this._tracksLayer.getSource().removeFeature(f);
    }
}

/**
 * 设置目标Marker
 * @param {*} timestamp  时间戳
 * @param {*} options 
 */
ol.Playback.Track.prototype.setMarker = function (timestamp, options) {
    var lngLat = null;
    // 如果没有时间戳, 使用第一个时刻
    if (timestamp) {
        lngLat = this.getOneLonlat(timestamp);
    } else {
        lngLat = this.getFirstTick();
    }

    if (lngLat) {
        var ph = this._geoJSON.properties.sn;
        var mbmc = this._geoJSON.properties.mbmc;
        var type = this._geoJSON.properties.deviceTypeName;
        var mblb = this._geoJSON.properties.mblb;
        var mbnm = this._geoJSON.properties.sn;

        if (this.gps) {
            var newLonlat = GPS.gcj_encrypt(lngLat[1], lngLat[0]);
            lngLat[0] = newLonlat.lon;
            lngLat[1] = newLonlat.lat;
        }

        var coordinate = ol.proj.transform(lngLat, 'EPSG:4326', 'EPSG:3857');
        this._marker = new ol.Track();
        this._marker.setGeometry(new ol.geom.Point(coordinate, "XY"));
        this._marker.setId(ph);
        this._marker.setProperties({
            type: 'track',
            isShowHJ: false,
            ph: ph,
            mbmc: mbmc,
            mbnm: mbnm,
            mblb: mblb,
            mbtypename: type,

        });
        this._tracksLayer = options._tracksLayer;
        this._positionsLayer = options._positionslayer;
    }
    return this._marker;
};

/**
 *  更新目标位置
 * @param {*} latLng 目标位置
 * @param {*} transitionTime 变换时间（暂时无用）
 * @param {*} timestamp 时间戳
 */
ol.Playback.Track.prototype.moveMarker = function (latLng, transitionTime, timestamp) {
    if (this._marker) {
       
        var hx = this.courseAtTime(timestamp);
        var prop = this._marker.getProperties();
        if (prop.mblb === '空中目标') {
            if (prop.mbmc.indexOf("直升机") > -1) {
                hx = 0;
            }
        }
         if (this.gps) {
            var newLonlat = GPS.gcj_encrypt(latLng[1], latLng[0]);
            latLng[0] = newLonlat.lon;
            latLng[1] = newLonlat.lat;
        }

        if (prop.iconInfo.rotation) {
            hx = hx + 90;
        } else {
            hx = 0;
        }

        var rotation = (hx / 180) * Math.PI;
        this._marker.getStyle().getImage().setRotation(rotation);
        this._marker.move(latLng);
    }
};

ol.Playback.Track.prototype.getTooltip = function () {
    return this._trackTooltip;
};

/**
 * 获取目标对象
 */
ol.Playback.Track.prototype.getMarker = function () {
    return this._marker;
};

/**
 * 获取航迹目标对象
 */
ol.Playback.Track.prototype.getHJMarker = function () {
    return this._hjmarker;
};
