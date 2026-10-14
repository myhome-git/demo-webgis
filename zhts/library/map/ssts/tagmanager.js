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
var TagManager = function (options) {
    this.map = options.map; //必传
    this.LinkedTag = [];
    //注册一个连接线Layer类
    this._lineSource = new ol.source.Vector({
        wrapX: true
    });
    this._layer = new ol.layer.Vector({
        renderMode: 'vector',
        source: this._lineSource
    });
    // this.map.addLayer(this._layer);
    this._layer.setMap(this.map);
    //注册一个Drag事件类
    var _self = this;
    _self.map.on('singleclick', function (evt) {
        _self.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            //TODO
   
            if (feature.get('type') == "track") {
                // zhtsjs.alter(feature);
                InfoTool.showInfo(feature);
            }

        })
    });
    
    _self.map.on("dblclick", function (evt) {

        var feature = _self.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            var tag = feature.get("type");
            if (tag != 'track') {
                return null;
            }
            return feature;
        });

        if (feature) {
           //TODO
          
        }
       
    });

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
                    var endcoor = [evt.coordinate[0], evt.coordinate[1]]; 
                    var startcoor = this.textMarker.getOrigin();
                    // var startcoor =  this.textMarker.getLinkedLine().getGeometry().getCoordinates()[0];
                    var line = new ol.geom.LineString([startcoor, endcoor]);
                    //设置线的图形
                    this.textMarker.getLinkedLine().setGeometry(line);
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
        // this.map.removeOverlay(marker);
    }
    if (line) {
        var fid = line.getId();
        var features = this._layer.getSource().getFeatures();
        for (var i = 0; i < features.length; i++) {
            if (fid === features[i].getId()) {
                this._layer.getSource().removeFeature(features[i]);
            }
        }
        // this._lineSource.removeFeature(l);
    }
    this.LinkedTag.remove(linkedTag);
};