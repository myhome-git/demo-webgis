//地图操作类
var _ClassMapObject = {};
(function ($,_object,xUtilBase) {
	$(document).ready(documentReady);

	function documentReady() {
		
		//创建地图，第一个是document对象，第二个是map对象
		_object.CreateMap = function(map){
			
			var _map =  map;
			
			this.$map = $("#"+_map.getTargetElement().getAttribute("id"));
			
			this._default = {
		        center : _map.getView().getCenter() || [12266122.109752484, 4146102.532393503],
		        zoom: _map.getView().getZoom() || 4,
		        rotation: _map.getView().getRotation() || 0
			};
			
			this._olMap = _map || new ol.Map({
		        target: this.$map.attr("id"),
		        layers: [
		          new ol.layer.Tile({
		            source: new ol.source.OSM()
		          })
		        ],
		        view: new ol.View({
		          //center: ol.proj.fromLonLat([37.41, 8.82]),
		          center : this._default.center,
		          zoom: this._default.zoom
		        })
			});
			
			this._olMap = map;
		}
		
		//获取初始化后的map对象
		_object.GetMapObject = function(){
			return this._olMap;
		}
		
		//恢复地图默认
		_object.SetMapReset = function(){
			var _view = this.GetMapObject().getView();
			_view.animate(this._default);
		}
		
		//获取map视图中心点,返回格式[12266122.109752484, 4146102.532393503]
		_object.GetMapViewCenterCoordinates = function(){
			return this.GetMapObject().getView().getCenter();
		}
		
		//锁定地图图层，防止拖动和点击
		_object.SetMapLayerLock = function(_lock){
			if(_lock===undefined){
				_lock = true;
			}
			var _controlClassName = "map-layer-lock";
			if(_lock){
				this.$map.addClass(_controlClassName);
			}else{
				this.$map.removeClass(_controlClassName);
			}
		}
		
		//获取地图是否锁定
		_object.GetMapLayerLock = function(){
			var _controlClassName = "map-layer-lock";
			return this.$map.hasClass(_controlClassName);
		}
		
		//设置地图缩放
		_object.SetMapZoom = function(_actionName,_level){
			var _view = this.GetMapObject().getView();
			if(_actionName=="max"){
				_level = _view.getZoom() + 1;
			}else if(_actionName=="min"){
				_level = _view.getZoom() - 1;
			}
			if(_level>_view.getMaxZoom()){
				_level = _view.getMaxZoom();
			}else if(_level<0){
				_level = 0;
			}
			//_view.setZoom(_level);
			_view.animate({zoom: _level});
		}
		
		//旋转地图
		_object.SetMapRotate = function(_actionName,_func){
			var _this = this;
			var _view = _this.GetMapObject().getView();
			if(_this.GetMapLayerLock() == true){
				return false;
			}
			_this.SetMapLayerLock(true);
			
			//获取角度
			var _angle = _view.getRotation();
			//旋转方向
			if(_actionName=="left"){
				_angle -= Math.PI / 2;
			}else if(_actionName=="right"){
				_angle += Math.PI / 2;
			}
//			console.info(_angle);
			_view.animate({rotation: _angle},function(){
				_this.SetMapLayerLock(false);
				if(_func){
					_func();
				}
			});
		}
		
		//定位地图
		_object.SetMapPosition = function(_viewParams,_func){
			var _this = this;
			if(_this.GetMapLayerLock() == true){
				return false;
			}
			//获取视图对象
			var _view = _this.GetMapObject().getView();
			_this.SetMapLayerLock(true);
			_view.animate(_viewParams,function(){
				_this.SetMapLayerLock(false);
				if(_func){
					_func();
				}
			});
		}
		
		//经纬度转换，例如：[37.41, 8.82] 转换成[12266122.109752484, 4146102.532393503]
		_object.FormatLonLat = function(lon,lat){
			//两种效果一致
			//经纬度转至xy(EPSG:4326->EPSG:3857)
			//ol.proj.transform(coordinates,'EPSG:4326','EPSG:3857');
			//xy转至经纬度(EPSG:3857->EPSG:4326)
			//ol.proj.transform(coordinates,'EPSG:3857','EPSG:4326')
			//return ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
			return ol.proj.fromLonLat([lon, lat]);
		}
		
		//初始化加载
		_object.init = function () {
			
		}
		_object.init();
	}
})(jQuery,_ClassMapObject,xUtilBase);