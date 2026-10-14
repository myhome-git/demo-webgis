/**
 * 卫星管理
 */
var satellite = function (map, layer,dayNightLayer) {
    this.layer = layer;
    this.dayNightLayer = dayNightLayer;
    this.map = map;
    this.satellits = [];
    this.init(layer);
    this.windowIndex = null;
    var _self = this;
    var selectedFeature;

    map.on('singleclick', function (evt) {
        if (evt.dragging) {
            return;
        }
        var hit = map.hasFeatureAtPixel(evt.pixel);
        if (hit) {
            var features = map.getFeaturesAtPixel(evt.pixel);
            var feature = features[0];
            var coor = ol.proj.toLonLat(evt.coordinate);
            var lonStr = _self._formatDegree(coor[0], "lon");
            var latStr = _self._formatDegree(coor[1], "lat");
            var tle = feature.get("tle");
            var orbit = feature.get("orbit");
            if (tle) {
                selectedFeature= feature;
                let style = feature.getStyle();
                console.log(style)
                let styles = [style];
                
    
    
                // styles.push(
                //     {
                //         image:{
                //             icon:{
                //                 anchor:[25,25],
                //                 anchorXUnits:'pixels',
                //                 anchorYUnits:'pixels',
                //                 src:'static/images/style/topleft.png'
                //             }
                //         }
                //     }
                // );
                // styles.push(
                //     {
                //         image:{
                //             icon:{
                //                 anchor:[25,25],
                //                 anchorXUnits:'pixels',
                //                 anchorYUnits:'pixels',
                //                 anchorOrigin:'top-right',
                //                 src:'static/images/style/topright.png'
                //             }
                //         }
                //     }
                // );
    
                // styles.push(
                //     {
                //         image:{
                //             icon:{
                //                 anchor:[25,25],
                //                 anchorXUnits:'pixels',
                //                 anchorYUnits:'pixels',
                //                 anchorOrigin:'bottom-left',
                //                 src:'static/images/style/bottomleft.png'
                //             }
                //         }
                //     }
                // );
    
                // styles.push(new ol.style.Style(
                //     {
                //         image: new ol.style.Icon({
                //             anchor:[25,25],
                //             anchorXUnits:'pixels',
                //             anchorYUnits:'pixels',
                //             anchorOrigin:'bottom-right',
                //             src:'static/images/style/bottomright.png'
                //         })
                //     })
                // );
    
                // feature.setStyle(styles);


                var content = "<div><label>卫星名称：</label><label>" + tle.name + "</label>&nbsp;&nbsp;&nbsp;<lable>卫星编号：</lable><label>" + tle.satelite_number
                    + "</label></div>"
                    + "<p><hr style='border:1px #000; height:1px'>"
                    + "<div><label>卫星位置：</label><label>" + lonStr + "&nbsp;" + latStr + "</label>&nbsp;&nbsp;&nbsp;<lable>飞行速度：</lable><label>" + orbit.getVelocity().toFixed(2)
                    + "&nbsp;KM/S</label></div></p><hr style='border:1px #000; height:1px'>"
                    + "<pre>" + tle.text + "</pre>";
                let _default = {
                    type: 1,
                    shade: 0,
                    resize: false,
                    title: "<i class='iconfont fa fa-map-marker'></i>" + tle.name + " 星历信息",
                    area: ['530px', '230px'],
                    content: content,

                }
                if (_self.windowIndex) {
                    layui.layer.close(_self.windowIndex);
                    _self.windowIndex = null;
                }

                _self.windowIndex = layui.layer.openWin(_default);
            } 
        }else {
            //map 点击清除掉外框
            if(selectedFeature){
                let styles = selectedFeature.getStyle();
                if(Array.isArray(styles)){
                    selectedFeature.setStyle(styles[0]);
                }
                selectedFeature = null;
            }
        }

    });

}


/**
 * 经纬度转换成 度分秒
 * @param {*} value 度
 * @param {*} type  lon 或 lat
 */
satellite.prototype._formatDegree = function (value, type) {

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
    return dstr + Math.abs(d) + '°' + f + "′" + m + '″';
}

/**
 * 度分秒转换成经纬度
 * @param {*} value 
 */
satellite.prototype._strToDegree = function (value) {
    var d = value.split("°")[0];
    var f = value.split("°")[1].split("′")[0];
    var m = value.split("°")[1].split("′")[1].split("″")[0];
    return Math.abs(d) + (Math.abs(f) / 60 + Math.abs(m) / 3600);
}

/**
 * 初始化卫星管理
 * @param {*} layer 
 */
satellite.prototype.init = function (layer) {
    var _self = this;
    var settings = {
        view: {
            selectedMulti: false
        },
        check: {
            enable: true
        },
        callback: {
            onCheck: sateCheck,
            // onClick: sateCheck
        }

    }

    function sateCheck(event, treeId, treeNode) {

        let _array = [];
        function getNodeData(nodes) {
            $.each(nodes, function (index, el) {
                if (el.userObject != undefined) {
                    _array.push(el.userObject);
                }

                if (el.children && el.children.length > 0) {
                    getNodeData(el.children);
                }
            });
            return _array;
        }

        getNodeData([treeNode]);

        if (treeNode.checked) {
            $.each(_array, function (index, el) {
                var name = el.ch_name;
                var t1 = el.tle_element1;
                var t2 = el.tle_element2;
                var lines = name + "\n" + t1 + "\n" + t2 + "\n";
                var sate = _self.addSatellite(lines);
                _self.satellits.push(sate);
            });
        } else {
            $.each(_array, function (index, el) {
                var name = el.ch_name;
                _self.removeSatelite(name);
            });
        }

    }


    $.ajax({
        type: "get",
        url: getModuleURL("http.satellite.getSatelliteTree"),
        dataType: "json",
        success: function (response) {
            $.fn.zTree.init($("#satelliteTree"), settings, response);
        }
    });

    setInterval(function () {
        var i = 0;
        _self.dayNightLayer.setTime(new Date());
        for (; i < _self.satellits.length; i++) _self.satellits[i].refresh();
    }, 500);

    setInterval(function () {
        var i = 0;
        for (; i < _self.satellits.length; i++) _self.satellits[i].refresh_path();
    }, 1 * 60000);
}

/**
 *  删除已经上图的卫星对象和数组里的对象
 * @param {string} name 
 */
satellite.prototype.removeSatelite = function (name) {
    var _self = this;
    for (let i = 0; i < _self.satellits.length; i++) {
        const sate = _self.satellits[i];
        let tle = sate.tle;
        let sateName = tle.name;
        if (name == sateName) {
            let num = tle.satelite_number;
            let marker = _self.layer.getSource().getFeatureById("point_" + num);
            let path = _self.layer.getSource().getFeatureById("line_" + num);
            let poly = _self.layer.getSource().getFeatureById("polygon_" + num);
            let circle = _self.layer.getSource().getFeatureById("circle_" + num);
            if (marker) {
                _self.layer.getSource().removeFeature(marker);
            }
            if (path) {
                _self.layer.getSource().removeFeature(path);
            }
            if (poly) {
                _self.layer.getSource().removeFeature(poly);
            }
            if (circle) {
                _self.layer.getSource().removeFeature(circle);
            }
            _self.satellits.splice(i, 1);
            break;
        }

    }
}

/**
 *  添加卫星对象到地图上，包括轨道
 * @param {string} lines 
 */
satellite.prototype.addSatellite = function (lines) {
    var tleObj = orbits.util.parseTLE(lines)[0];
    var satOpts = {
        map: map,
        layer: this.layer,
        tle: tleObj,
        pathLength: 2,
        radius: 1000000,
        drawSatellitePolygon: false
    };
    var sat = new orbits.Satellite(satOpts);
    sat.refresh()
    sat.refresh_path();
    return sat;
}

satellite.prototype.getSatellite = function (id) {


}


