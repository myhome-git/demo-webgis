Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
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
 * Tag标牌管理对象，用于管理添加到地图上的多个标牌
 * @param {*} options 
 */

function TagManager(options) {
    this.map = options.map; //必传
    this.LinkedTag = [];
    //注册一个连接线Layer类
    this._lineSource = new ol.source.Vector({
        wrapX: false
    });
    this._layer = new ol.layer.Vector({
        renderMode: 'vector',
        source: this._lineSource
    });
    // this.map.addLayer(this._layer);
    this._layer.setMap(this.map);
    //注册一个Drag事件类
    var _self = this;
    var gridWindow = null;
    gridTableLock = ["unLock"];
    // var popup;
    _self.map.on('singleclick', function (evt) {
        _self.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            var featureType = feature.get("featureType");
            if ("grid" == featureType) {
                var features = feature.getProperties().features;
                var len = len = features.length;
                var content = "<table border='1px' width='100%' hight='100%'><tr><td>国家/地区</td><td>目标类别</td><td>目标名称</td><td>机型号</td></tr>";//><td>经度</td><td>纬度</td>
                for (let i = 0; i < len; i++) {
                    var prop = features[i].getProperties();
                    //组合弹出内容
                    content = content + "<tr><td>" + prop.gjstr + "</td><td>" + prop.mblb + "</td><td>" + prop.mbmc + "</td><td>" + prop.jxh + "</td></tr>";//<td>"+prop.lon+"</td><td>"+prop.lat+"</td>
                }
                content += "</table>";
                var gridTable = document.createElement("div");
                gridTable.setAttribute("style", "color: greenyellow;font-size: smaller;text-align: center;height: 100%;width='100%';");
                gridTable.setAttribute("id", "gridTable");
                gridTable.innerHTML = content;
                var offset = ['90px', '370px'];
                if (gridWindow) {
                    try {
                        var oldStyle = $('#layui-layer' + gridWindow).prop("style");
                        offset = [oldStyle.top, oldStyle.left];
                        layer.close(gridWindow);
                        gridWindow = null;
                    } catch (e) {
                    }
                }
                gridWindow = layer.open({
                    type: 1,
                    title: ['网格区域详情', 'font-size:smaller;'],
                    skin: 'layui-layer-molv',
                    maxmin: false,
                    resize: false,
                    offset: offset,
                    maxWidth: '400px',
                    maxHeight: '300px',
                    area: ["auto", "auto"],
                    scrollbar: true,
                    content: gridTable.outerHTML,
                    shade: false,
                });
                $('#layui-layer' + gridWindow).find("tr").hover(
                    function () {
                        $(this).prop("style", "background: dimgray;")
                    },
                    function () {
                        $(this).prop("style", "");
                    }
                );
                // _self.map.removeOverlay(popup);
                // popup = new ol.Overlay({
                //     element: gridTable
                // });
                // popup.setPosition(feature.getProperties().center);
                // _self.map.addOverlay(popup);
            } else {
                var tag = feature.get('tag');
                var showTag = feature.get("showTag");
                var revision = feature.get('revision');
                if (revision) {
                    if (showTag) {
                        feature.set("showTag", false)
                        _self.removeLinkedTag(tag);
                        revision = false;
                    }

                } else if (tag) {
                    if (!showTag) {
                        _self.addLinkedTag(tag);
                        feature.set("showTag", true)
                        revision = true;
                    }

                }
                feature.set('revision', revision)
                //console.log(feature);
                //        	if(typeof feature.click === "function"){
                //        		feature.click(feature);
                //        	}
                if (feature.get('type') == "track") {
                    zhtsjs.alter(feature);
                }
                //        	return feature;
            }
        })
    })

    //处理双击放大地图事件
    var interactions = this.map.getInteractions();
    var length = interactions.getLength();
    for (var i = 0; i < length; i++) {
        var item = interactions.item(i);
        if (item instanceof ol.interaction.DoubleClickZoom) {
            //    this.dblClickZoomInteraction = item;
            interactions.remove(item);
            break;
        }
    }




    /**
     * 处理拖拽事件的对象
     */
    var Drag = function () {
        ol.interaction.Pointer.call(this, {
            handleDownEvent: Drag.prototype.handleDownEvent,
            handleDragEvent: Drag.prototype.handleDragEvent,
            handleMoveEvent: Drag.prototype.handleMoveEvent,
            handleUpEvent: Drag.prototype.handleUpEvent
        });
        this.flag = false;
        this.pixel_;
        this.textMarker;
        this.coordinate_ = null;
        this.cursor_ = 'pointer';
        this.feature_ = null;
        this.previousCursor_ = undefined;
    };

    //继承ol里的鼠标处理
    ol.inherits(Drag, ol.interaction.Pointer);

    /**
     * 处理鼠标按下的事件
     * @param {} evt 
     */
    Drag.prototype.handleDownEvent = function (evt) {
        var map = evt.map;

        //根据状态获取被选中的tag
        var linkedTags = _self.LinkedTag.filter(function (tag) {
            var cursor = tag._container._isSelect;
            return cursor;
        });

        //不在mark上，检查是否点击了点要素
        if (linkedTags.length < 1) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                var tag = feature.get("tagline");
                if (tag) {
                    return null;
                }
                return feature;
            });

            if (feature) {
                this.coordinate_ = evt.coordinate;
                this.feature_ = feature;
                var linkedTag = feature.linktag;
                if (linkedTag) {
                    var tag = feature.getLinkedTag();
                    var pos = tag._textMarker.getPosition();
                    this.originOffset = tag._textMarker.getOffset();
                    var tpixel = map.getPixelFromCoordinate(pos);
                    // this.pixel_  = [tpixel[0]-offset[0],tpixel[1]-offset[1]];
                    this.pixel_ = tpixel;
                    return true;
                }
            }

            return false;
        } else {
            this.textMarker = linkedTags[0];
            this.flag = true;
            this.textMarker._isSelect = true;
            //获取mark源绑定坐标
            var markCoor = this.textMarker.getOrigin();
            this.pixel_ = map.getPixelFromCoordinate(markCoor);
            return !!this.flag;
        }

    };


    /**
     * 处理鼠标拖拽事件
     * @param {} evt 
     */
    Drag.prototype.handleDragEvent = function (evt) {
        var map = evt.map;
        if (this.feature_ != undefined) {
            //专题图目标拖拽
            if (this.feature_.get("type") == "ztt" && this.feature_.get("moveable") == true) {
                var deltaX = evt.coordinate[0] - this.coordinate_[0];
                var deltaY = evt.coordinate[1] - this.coordinate_[1];
                var geometry = this.feature_.getGeometry().clone();
                geometry.translate(deltaX, deltaY);
                this.feature_.setGeometry(geometry);
                this.coordinate_[0] = evt.coordinate[0];
                this.coordinate_[1] = evt.coordinate[1];
            }

        } else {
            //暂时解开默认拖拽功能
            //  var dragable =  this.textMarker.getDragable();
            //  if(!dragable){
            //      return;
            //  }
            if (this.textMarker) {

                var cursor = this.textMarker._container.style.cursor;
                //    console.log(this.textMarker._isSelect);
                if (this.textMarker._isSelect) {
                    var deltaPX = evt.pixel[0] - this.pixel_[0];
                    var deltaPY = evt.pixel[1] - this.pixel_[1];

                    this.textMarker._container.style.cursor = 'pointer';
                    //设置marker的offset参数
                    this.textMarker.setOffset([deltaPX, deltaPY]);
                    var startcoor = this.textMarker.getOrigin();
                    var endcoor = [evt.coordinate[0], evt.coordinate[1]];

                    // var p = this.textMarker._container.offsetParent;
                    // var ofl = p.offsetLeft;
                    // var oft = p.offsetTop;
                    // var ofh = p.offsetHeight;
                    // var ofw = p.offsetWidth;
                    var ele = this.textMarker.getTagMarker().getElement();
                    var c1 = startcoor,
                        p = $(ele).parent().position(),
                        coor4 = this.getPos(map,$(ele), [p.left, p.top]),
                        point = map.getPixelFromCoordinate(c1);
                        var pos = this.getNearest(point, coor4[0]);
              
                    var nearest = map.getCoordinateFromPixel(pos.nearest);
                    var p2 = 0;
                    var lineType = 0;

                    var f = this.textMarker._bindFeature;
                    
                    if(f.get("type")=="ztt"){
                        lineType =0
                    }else if(f.get("type")=="track"){
                        lineType =2;
                    }else {
                        lineType =1;
                    }

                    if (lineType === 0) {
                        p2 = 0
                    } else if (lineType === 1) {
                        p2 = 1 / 4
                    } else if (lineType === 2) {
                        p2 = 1
                    }
                    var middle = [c1[0] + (nearest[0] - c1[0]) * p2, nearest[1]];

                    var line = new ol.geom.LineString([c1, middle, nearest]);
                    // var line = new ol.geom.LineString([startcoor, endcoor]);
                    //设置线的图形
                    this.textMarker.getLinkedLine().setGeometry(line);
                    this.textMarker.getTagMarker().setPositioning(pos.positioning);
                }

            }
        }

    };

    /**
     * 处理鼠标移动事件
     * @param {} evt 
     */
    Drag.prototype.handleMoveEvent = function (evt) {
        if (this.cursor_) {
            var map = evt.map;
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });
            var element = evt.map.getTargetElement();
            if (feature && feature.get("type") === "track") {
                if (element.style.cursor != this.cursor_) {
                    this.previousCursor_ = element.style.cursor;
                    element.style.cursor = this.cursor_;
                }
            } else if (this.previousCursor_ !== undefined) {
                element.style.cursor = this.previousCursor_;
                this.previousCursor_ = undefined;
            }
        }
    };

    /**
     * 处理鼠标抬起的事件
     * @param {} evt 
     */
    Drag.prototype.handleUpEvent = function (e) {
        this.flag = false;
        this.pixel_ = null;
        this.coordinate_ = null;
        this.feature_ = null;
        if (this.textMarker) {
            this.textMarker._isSelect = false;
            //console.log(this.textMarker._isSelect);
        }
    };


    //获取标盘的四个角的四个坐标点  clt是地图坐标
    Drag.prototype.getPos = function (map, dom, lt) {
        var w = dom.width(),
            h = dom.height();
        var lb = [lt[0], lt[1] + h],
            rt = [lt[0] + w, lt[1]],
            rb = [lt[0] + w, lt[1] + h];
        var clt = map.getCoordinateFromPixel(lt),
            clb = map.getCoordinateFromPixel(lb),
            crt = map.getCoordinateFromPixel(rt),
            crb = map.getCoordinateFromPixel(rb);
        return [[lt, rt, rb, lb], [clt, crt, crb, clb]];
    }
    
    //point  与  pixel4[左上，右上，右下，左下]的最近的点
    Drag.prototype.getNearest = function (point, pixel4) {
        var center = [(pixel4[0][0] + pixel4[1][0]) / 2, (pixel4[0][1] + pixel4[3][1]) / 2],
            dx = point[0] - center[0],
            dy = point[1] - center[1],
            nearest,positioning;
        if (dx > 0) {
            if (dy > 0) {
                nearest = pixel4[2];
                positioning="bottom-right";
            } else {
                nearest = pixel4[1]
                positioning = "top-right";
            }
        } else {
            if (dy > 0) {
                nearest = pixel4[3];
                positioning = "bottom-left";
            } else {
                nearest = pixel4[0]
                positioning = "top-left";
            }
        }
        return {nearest,positioning};
    }

    var drag = new Drag();
    this._dragInteraction = drag;
    this.map.addInteraction(drag);
};

/**
 * 获取拖拽处理器
 */
TagManager.prototype.getDragInteraction = function () {
    return this._dragInteraction;
}

/**
 * 添加标牌和连线 
 * @param {*} linkedTag 
 */
TagManager.prototype.addLinkedTag = function (linkedTag, hide) {
    var marker = linkedTag.getTagMarker();
    var line = linkedTag.getLinkedLine();
    if (marker) {
        this.map.addOverlay(marker);
    }
    if (line) {
        var fid = line.getId();
        var features = this._layer.getSource().getFeatures();
        var has = false;
        for (var i = 0; i < features.length; i++) {
            if (fid === features[i].getId()) {
                has = true;
                break;
            }
        }
        if (!has) {
            this._lineSource.addFeature(line);
        }
    }

    this.LinkedTag.push(linkedTag);
};


/**
 * 删除标牌和连线
 * @param {*} linkedTag 
 */
TagManager.prototype.removeLinkedTag = function (linkedTag) {
    var marker = linkedTag.getTagMarker();
    var line = linkedTag.getLinkedLine();
    if (marker) {
        var fid = marker.getProperties().fid;
        var features = this.map.getOverlays().getArray();
        for (var i = 0; i < features.length; i++) {
            var o = features[i];
            if (fid === o.getProperties().fid) {
                this.map.removeOverlay(o);
            }
        }
    }
    if (line) {
        var fid = line.getId();
        var features = this._layer.getSource().getFeatures();
        for (var i = 0; i < features.length; i++) {
            if (fid === features[i].getId()) {
                this._layer.getSource().removeFeature(features[i]);
            }
        }
    }
    this.LinkedTag.remove(linkedTag);
};