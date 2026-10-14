/**
 *  态势回放组件
 * @param {*} map  地图对象
 * @param {*} geoJSON  回放目标数据
 * @param {*} callback 回调函数
 * @param {*} options  参数列表
 */
ol.Playback = function(map, geoJSON, callback, options) {
    this.Util = ol.Playback.Util;
    this.options = {
        tickLen:10000,
        speed: 10*10,
        maxInterpolationTime: 5 * 60 * 1000, // 5 minutes
        positionsLayer: true,
        playControl: false,
        dateControl: false,
        sliderControl: false,
        gps:true,
        _tracksLayer:options.trackslayer,
        _positionslayer:options.positionslayer
            // options
            //mouseOverCallback: fun,
            //clickCallback:fun
    };
    this._trackController = new ol.Playback.TrackController(map, null, this.options);
    Clock.call(this, this._trackController, callback, this.options);
    this._map = map;
    this._tracksLayer = options.trackslayer;
    this._positionsLayer = options.positionslayer
    
    //目标图层
    if (options.positionsLayer) {
        this._positionsLayer = options.positionslayer;
    }
    
    if(geoJSON){
        this.setData(geoJSON); //设置gps数据
    }

    if (this.options.playControl) {
        this.playControl = new PlayControl(this);
        this._map.addControl(this.playControl);
    }
    if (this.options.sliderControl) {
        this.sliderControl = new SliderControl(this);
        this._map.addControl(this.sliderControl);
    }
    if (this.options.dateControl) {
        this.dateControl = new DateControl(this, options);
        this._map.addControl(this.dateControl);
    }

};

ol.Playback.prototype = new Clock();

ol.Playback.prototype.clearData = function() {
    this._trackController.clearTracks();  
    if(this._positionsLayer){
    	this._positionsLayer.getSource().clear();
    }   
};


ol.Playback.prototype.getTrackController = function(){
    return this._trackController;
}
ol.Playback.prototype.getLayer = function(){
    return this._positionsLayer;
}

ol.Playback.prototype.setData = function(geoJSON,c) {
    this.clearData();

    this.addData(geoJSON, this.getTime(),c);

    this.setCursor(this.getStartTime());
};

// bad implementation
ol.Playback.prototype.addData = function(geoJSON, ms,callback) {
    // return if data not set
    if (!geoJSON) {
        return;
    }

    if (geoJSON instanceof Array) {
        for (var i = 0, len = geoJSON.length; i < len; i++) {
            this._trackController.addTrack(new ol.Playback.Track(geoJSON[i], this.options), ms);
        }
    } else {
        if (geoJSON.type == "FeatureCollection") {
            for (var i = 0, len = geoJSON.features.length; i < len; i++) {
                this._trackController.addTrack(new ol.Playback.Track(geoJSON.features[i], this.options), ms);
            }
        } else {
            this._trackController.addTrack(new ol.Playback.Track(geoJSON, this.options), ms);
        }
    }

    //添加轨迹数据到图层上显示
    if(typeof callback === "function"){
        callback(geoJSON,this._positionsLayer);
    }

};

/**
 * 清除数据
 */
ol.Playback.prototype.destroy = function() {
    this.clearData();
    if (this.playControl) {
        this._map.removeControl(this.playControl);
    }
    if (this.sliderControl) {
        this._map.removeControl(this.sliderControl);
    }
    if (this.dateControl) {
        this._map.removeControl(this.dateControl);
    }
    if(this._tracksLayer);{
    	this._tracksLayer.getSource().clear();
    }      
    if(this._positionsLayer);{
    	this._positionsLayer.getSource().clear();
    }  
};

//判断当前图层是否存在地图中
function hasLayerInMap(layer) {
    var layers = map.getLayers();
    for (var i = 0; i < layers.getLength(); i++) {
        var item = layers.item(i);
        if (item === layer)
            return true;
    }
    return false;
}

