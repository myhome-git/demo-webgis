/**
 * 标牌对象
 * @param {*} options 
 */
function LinkedTag(options) {
    this.map = options.map; //必传
    var _map = this.map;
    this._linkedLine; //连接线
    this._textMarker; //文本框
    this._position;
    this._isSelect = false;
    this._dragable = false;
    this._ph = options.ph;
    this._fid = options.fid;
    var fid = this._fid; //设置唯一id
    this._className = options.className;
    //this._origin;//绑定要素的原点，要素移动时需要更改这个属性

    this.offset = options.offset !== undefined ? options.offset : [48, -48];
    this.color = options.color !== undefined ? options.color : '#777';
    this.fillColor = options.fillColor !== undefined ? options.fillColor : '#fffff9';
    this.font = options.font !== undefined ? options.font : '16px Verdana';
    this.padding = options.padding !== undefined ? options.padding : '2px 4px';
    this["border-width"] = options["border-width"] !== undefined ? options["border-width"] : '2px';
    this["border-color"] = options["border-color"] !== undefined ? options["border-color"] : '#777';
    this.lineOptions = options.lineOptions;

    /*
        this.options= {
            className: '',
            clickable: false,
            draggable: true,
            noHide: true,
            offset: [48, -48],
            'color': '#777',
            'fillColor': '#fffff9',
            'font': '16px Verdana',
            'padding': '2px 4px',
            'border-width': '2px',
            'border-color': '#777',
            lineOptions: null
        };*/
    this._content_canvas;
    this._bindFeature;
    var _self = this;
    //创建overlay
    this._container = document.createElement('div');
    // this._container.style.backgroundColor='red';
    this._container.style.cursor = 'pointer';
    this._container.className = this._className;

    this._container.onmouseout = function (e) {
        this.style.cursor = 'auto';
        this._isSelect = false;
    };
    this._container.onmouseover = function (e) {
        this.style.cursor = 'pointer';
        this._isSelect = true;
    };

    this._container.onmousedown = function (e) {
        this.style.cursor = 'pointer';
        this._isSelect = true;
    };


    if (options.overlay) {

        //如果默认提供的话，使用默认提供的
        this._textMarker = options.overlay;
        this._container = this._textMarker.getElement();
        this._container.style.cursor = 'pointer';

        this._container.onmouseout = function (e) {
            this.style.cursor = 'auto';
            this._isSelect = false;
        };
        this._container.onmouseover = function (e) {
            this.style.cursor = 'pointer';
            this._isSelect = true;
        };

        this._container.onmousedown = function (e) {
            this.style.cursor = 'pointer';
            this._isSelect = true;
        };


    } else {
        //创建一个OverLay对象，用于在map上显示和承载标牌内容。
        this._textMarker = new ol.Overlay({
            id: this._fid,
            element: this._container,
            stopEvent: false,
            offset: this.offset,
            positioning: 'top-left'
        });

        var prop = { ph: this._ph, fid: this._fid };
        this._textMarker.setProperties(prop);

        //处理标牌的双击事件
        this._container.ondblclick = function (e) {
            this.style.cursor = 'pointer';
            this._isSelect = true;
            if (_self._bindFeature) {
                var level = _self._bindFeature.getTagInfoLevel();
                if (level === 0) {
                    level = level + 1;
                }
                _self._bindFeature.changeTagContent(level);
                _self._bindFeature.setTagDragable(true);
                e.stopPropagation();
            }
        };
    }

    //注册分辨率变化事件，用于更新连接线的显示
    this.map.getView().on('change:resolution', function (e) {
        _self.updatePosition();
    });

}

/**
 * 获取标牌对象
 */
LinkedTag.prototype.getTagMarker = function () {
    return this._textMarker;
};

/**
 * 获取连接线要素
 */
LinkedTag.prototype.getLinkedLine = function () {
    return this._linkedLine;
};

/**
 * 获取原始位置
 */
LinkedTag.prototype.getOrigin = function () {
    return this._bindFeature.getGeometry().getCoordinates();
};

/**
 * 设置相对位移
 * @param {} offset 
 */
LinkedTag.prototype.setOffset = function (offset) {
    this.offset = offset;
    this._textMarker.setOffset(offset);
};

LinkedTag.prototype.setPosition = function (position) {
    this._position = position;
    this._textMarker.setPosition(position);
};


/**
 * tag类别，也就是不同的目标颜色类别
 * @param {*} type 
 */
LinkedTag.prototype.setTagType = function (type) {
    this._container.className = type;
}

/**
 * 设置标牌是否可以拖拽
 * @param {*} dragable 
 */
LinkedTag.prototype.setDragable = function (dragable) {
    this._dragable = dragable;
}

/**
 * 获取标牌是否可以拖拽
 */
LinkedTag.prototype.getDragable = function () {
    return this._dragable;
}

/**
 * 设置绑定的Feature
 * @param {*} feature 
 */
LinkedTag.prototype._setBindFeature = function (feature) {
    this._bindFeature = feature;
}

/**
 * 内部处理方法，根据原始点生成一条线要素
 * @param {*} origin 
 */
LinkedTag.prototype._createLineByOrigin = function (origin) {
    var coors = this.getTagMarkerCoordinate(origin);
    var line = new ol.geom.LineString(coors);
    return line;
};


/**
 * 使用两个点创建线
 * @param {*} origin 
 * @param {*} target 
 */
LinkedTag.prototype._createLineByPosition = function (origin,target) {
    var line = new ol.geom.LineString();
    line.appendCoordinate(origin);
    line.appendCoordinate(target);
    return line;
};


/**
 * 获取标牌位置
 * @param {*} origin 
 */
LinkedTag.prototype.getTagMarkerCoordinate = function (origin) {
    var res = this.map.getView().getResolution();
    var disy = res * this.offset[1]; //方向正北
    var disx = res * this.offset[0];
    var coor = [origin[0] + disx, origin[1] - disy];
    return [origin, coor];
};

//地图放大缩小平移，应更新连接线位置
LinkedTag.prototype.updatePosition = function () {
    var coors = this.getTagMarkerCoordinate(this._bindFeature.getGeometry().getCoordinates());
    //var line=new ol.geom.LineString(coors);
    this._linkedLine.getGeometry().setCoordinates(coors);

};

LinkedTag.prototype.updatePositionLine = function () {
    // var coors = this.getTagMarkerCoordinate(this._bindFeature.getGeometry().getCoordinates());
    var origin = this._bindFeature.getGeometry().getCoordinates();
    var target = this._position;
    //var line=new ol.geom.LineString(coors);
    this._linkedLine.getGeometry().setCoordinates([origin,target]);

};

/**
 * 将字符串解析成整型值
 * @param {*} txt 
 */
LinkedTag.prototype._parse_str_to_int = function (txt) {
    if (txt.length > 2) {
        if (txt.charAt(txt.length - 2) == 'p') {
            txt = txt.substr(0, txt.length - 2);
        }
    }
    try {
        return parseInt(txt, 10);
    } catch (e) { }
    return 0;
};

/**
 * 设置标牌显示内容
 * @param {*} _content 文字内容
 */
LinkedTag.prototype.setContent = function (_content) {
    this._content = _content;
    this._container.innerHTML = "<span><strong>" + _content + "</strong></span>";
};