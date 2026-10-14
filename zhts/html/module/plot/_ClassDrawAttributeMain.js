/**
 * 绘制图标
 * ICON属性接口，采用单例模式
 */
var _ClassDrawAttributeMain = _ClassDrawAttributeMain || {};
(function ($,_object) {
	$(document).ready(documentReady);
	function documentReady() {
		
		var ol = top.ol;
		
		//根据type关键字调取方法
		_object.type = "MAIN";
		
		//面板名称
		_object.name = "主面板";
		
		//element
		_object.element = null;
		
		//面板是否初始化
		_object.initOpen = false;
		
		//是否打开调试
		_object.console = function(){
			var _isRun = false;
			if(_isRun){
				$.each(arguments, function(index,el) {
					console.info(el);
				});
			}
		};
		
		//取出矢量图层
		_object.GetVectorLayer = function(){
			if(this.VectorLayer){
				return this.VectorLayer;
			}
			var _this = this;
			if(!this.VectorLayer){
				var _layers = this.map.getLayers().getArray()[1].getLayers().getArray();
				for(var i=0;i<_layers.length;i++){
					if(_layers[i].get("title")=="专题图图层"){
						_this.VectorLayer = _layers[i];
						return _this.VectorLayer;
					}
				}
			}else{
				return this.VectorLayer;
			}
		}
		
		//属性列表
		_object.ATTRIBUTES = ["STATIC_ICON","STATIC_FONT","DRAW_ICON","DRAW_FONT"];
		_object.CHILDREN_ATTRIBUTES = [];
		
		//打开面板
		_object.OpenPanel = function(){
			this.console("准备打开面板");
			this.element.addClass("open");
		}
		
		//关闭面板
		_object.ClosePanel = function(){
			this.console("准备关闭面板");
			this.element.removeClass("open");
		}
		
		//收缩子节点所有面板
		_object.CloseChildrenAllPanel = function(_id){
			this.console("准备收缩所有面板");
			var _this = this;
			$.each(_this.CHILDREN_ATTRIBUTES, function(index,el) {
				if(el.type!=_id){
					el.ClosePanel();
				}
			});
		}
		
		_object.GetStringParam = function(_string,_name){
			var reg = new RegExp("(^|&)" + _name + "=([^&]*)(&|$)");
			var r = _string.substr(1).match(reg);
			if (r != null) return decodeURIComponent(r[2]); return null;
		}
		
		//解析feature信息
		_object.GetFeatureAttribute = function(_feature){
			this.console("准备解析FeatureAttribute");
			if(!_feature.get("isPlot")){
//				throw new Error("feature type is null");
				return;
			}
			this.feature = _feature;
			
			//返回feature数据
			var _default = {};
			if(_feature.get("type")=="DBFeature"){
				_default = this.FormatStaticFeatureAttributeToObject(_feature);
			}else if(_feature.get("plotType")){
				_default = this.FormatDrawFeatureAttributeToObject(_feature);
			}
			return _default;
		}
		
		//格式化静态Feature数据
		_object.FormatStaticFeatureAttributeToObject = function(_feature){
			this.console("正在解析图像绘制图形："+_feature.get("type_name"));
			var _default = {};
			var _style = _feature.getStyle() || {},
				_image = _style.getImage() || {},
				_iamge_size = _feature.get("px") || [-1,-1],
				_font = _feature.getStyle().getText() || {};
			
			var _coordinates = _feature.getGeometry().getCoordinates();
				_coordinates = ol.proj.transform(_coordinates,'EPSG:3857','EPSG:4326');
			
			_default["TYPE"] = "STATIC_";
			try{
				_default["ICON"] = {
					width : _iamge_size.width,
					height : _iamge_size.height,
					color : this.GetStringParam(_image.getSrc() || "","JBYS"),
					scale : _image.getScale() || 0.7,
					coordinatesX : _coordinates[0],
					coordinatesY : _coordinates[1],
					rotation : _image.getRotation()? (( _image.getRotation() / Math.PI * 180)%360).toString().match(/^\d+/).toString() : 0,
//					rotation : _image.getRotation().toString() || 0,
					opacity : _image.getOpacity().toString() || 1,
					anchor : _image.getAnchor() ? _image.getAnchor().join(",") :  "32,32",
					imageURL : _image.getSrc()
				};
			}catch(e){}
			
			try{
				_default["FONT"] = {
					text : _font.getText(),
					"font-family" : _font.getFont().replace(/(\d+px)/g,"").replace(/(^\s*)|(\s*$)/g, ""),
					"font-size" : _font.getFont().match(/(\d+px)/g).join(""),
					scale : _font.getScale() || 1,
					color : _font.getFill().getColor().toString(),
					offsetX : _font.getOffsetX() || 0,
					offsetY : _font.getOffsetY() || 0,
					rotation : _font.getRotation() || 0
				};
			}catch(e){}
			
			try{
				_default["MIAOSHU"] = {}
			}catch(e){}
			
			return _default;
		}
		
		//格式化绘制类型Feature数据
		_object.FormatDrawFeatureAttributeToObject = function(_feature){
			this.console("正在解析动态绘制图形："+_feature.get("type_name"));
			let _this = this,
				_featureTypeName = _feature.get("plotType");
			
			let _default = {};
			
			let _font = _feature.getStyle() ? _feature.getStyle().getText() : {} || {};

			_default["TYPE"] = "DRAW_"+_featureTypeName;
			_default["ICON"] = {};
			_default["FONT"] = {};
			_default["MIAOSHU"] = {}
			try{
				let _style = _feature.getStyle();
				//如果没有style则向layer中查找
				if(!_style){
					let _plot = top._pageObject.MAP.getPlot();
					_style = _plot.plotDraw.drawLayer.getStyle();
				}
				
				let _stroke = _style.getStroke();
				_default["ICON"] = {
					"stroke-color" : (function(){
						let _color = _stroke.getColor();
						if(_color=="red"){
							_color = "rgba(255,0,0,1)";
						}
						return _color;
					})(),
					"stroke-width" : _stroke.getWidth(),
					"fill-color" : _style.getFill().getColor(),
					"feature" : {
						"type" : _featureTypeName,
						"getGeometry().getPoints()" : _feature.getGeometry().getPoints()
					}
					
				};
			}catch(e){
				//TODO handle the exception
			}
			
			try{
				_default["FONT"] = {
					text : _font.getText(),
					"font-family" : _font.getFont().replace(/(\d+px)/g,"").replace(/(^\s*)|(\s*$)/g, ""),
					"font-size" : _font.getFont().match(/(\d+px)/g).join(""),
					scale : _font.getScale() || 1,
					color : _font.getFill().getColor().toString(),
					offsetX : _font.getOffsetX() || 0,
					offsetY : _font.getOffsetY() || 0,
					rotation : _font.getRotation() || 0
				};
			}catch(e){}
			
			return _default;
		}
		
		//取出feature对象，为了进行设置，需要先进行引用
		_object.GetFeatureObject = function(){
			return this.feature;
		}
		
		_object.SetTitle = function(_name){
			let $doc = window.parent.$("#layer-open-draw-attibute");
			if($doc && $doc.length>0){
				$doc.prev().html(_name);
			}
		}
		
		//设置面板数据
		_object.SetPanel = function(_data){
			this.console("设置面板数据",_data);
			var _this = this;
			_this.ClearPanel();
			_this.ClosePanel();
			if(!_data || $.isEmptyObject(_data)){
				this.console("设置面板数据，data数据异常");
				return;
			}
			this.console("设置面板数据，data数据正常，类型"+_data["TYPE"]);
			if(/^STATIC\_/.test(_data["TYPE"])){
				try{
					_this.SetTitle(_data["FONT"]["text"]);
					for(var i=0;i<_this.ATTRIBUTES.length;i++){
						var _type = _this.ATTRIBUTES[i];
						if(/^DRAW_/.test(_type)){
							
						}else{
							var _o = undefined;
							for(var x=0;x<_this.CHILDREN_ATTRIBUTES.length;x++){
								var _c = _this.CHILDREN_ATTRIBUTES[x];
								if(_c.type==_type){
									_o = _c;
								}
							}
							if(!_o){
								return;
							}
							var $div = $("<div></div>");
							_this.element.append($div);
							_o.element = $div;
							_o.SetPanel(_data[_this.ATTRIBUTES[i].replace(/^STATIC\_/,"")]);
							
							//如果是第一次初始化面板，则默认打开第一个分类对象
							_o.OpenPanel();
//							if(!_this.initOpen){
//								if(i==0){
//									_this.initOpen = true;
//									_o.OpenPanel();
//								}
//							}else{
//								//否则取出上次的打开状态
//								if(_o.windowOpen){
//									_o.OpenPanel();
//								}else{
//									_o.ClosePanel();
//								}
//							}
						}
						
					}
					_this.OpenPanel();
				}catch(e){
					console.info(e.message);
					_this.ClosePanel();
				}
			}else if(/^DRAW\_/.test(_data["TYPE"])){
				let _layerTitle = (function(){
					//如果已经设置text则取出
					if(_data["FONT"]["text"]){
						return _data["FONT"]["text"];
					}
					
					let _title,_featureType = _data["TYPE"].replace(/^DRAW\_/,""),
						_module = getModuleWindowPageObjectByName("module.plot.main");
					
					let $li = _module.LEFTPANEL.$windowDrawGraph.find("li[data-iconname='"+_featureType+"']");
					if($li.length<1){
						console.info("未找到绘制类型"+_featureType);
					}
					_title = $li.attr("title");
					return _title;
				})();
				try{
					_this.SetTitle(_layerTitle||_data["TYPE"]);
					for(var i=0;i<_this.ATTRIBUTES.length;i++){
						var _type = _this.ATTRIBUTES[i];
						if(/^STATIC\_/.test(_type)){
							
						}else{
							var _o = undefined;
							for(var x=0;x<_this.CHILDREN_ATTRIBUTES.length;x++){
								var _c = _this.CHILDREN_ATTRIBUTES[x];
								if(_c.type==_type){
									_o = _c;
								}
							}
							if(!_o){
								return;
							}
							var $div = $("<div></div>");
							_this.element.append($div);
							_o.element = $div;
							_o.SetPanel(_data[_this.ATTRIBUTES[i].replace(/^DRAW\_/,"")]);
							
							//如果是第一次初始化面板，则默认打开第一个分类对象
							_o.OpenPanel();
						}
						
					}
					_this.OpenPanel();
				}catch(e){
					console.info(e.message);
					_this.ClosePanel();
				}
			}
		}
		
		//清除面板表单
		_object.ClearPanel = function(_data){
			this.console("准备清除表单");
			this.element.find(".x-content-draw-title").hide().empty();
			this.element.empty();
		}
		
		_object.CreateFeatureStatic = function(_url){
			var feature = new ol.Feature();
			var point = new ol.geom.Point([0,0]);
            feature.setGeometry(point);
           
            feature.setId("tempFeature-"+xUtilBase.createUUID());
            feature.set("type", "DBFeature");
            feature.set("angle", 0);
            var image = new ol.style.Icon({
                rotation: 0,
                scale : 0.7,
                src: _url|| "/plot-service/plot/api/getJB.do?JBKH=32&JBDH=32600&CC=64&JBYS=R"
            });
            var style = new ol.style.Style({
                image: image,
                text: new ol.style.Text({
				    font: '12px Calibri,sans-serif',
				    fill: new ol.style.Fill({
				      color: '#000'
				    }),
				    stroke: new ol.style.Stroke({
				      color: '#fff',
				      width: 3
				    }),
				    text : "New Object",
				    offsetY:32,
				})
            });
            feature.setStyle(style);
            this.GetVectorLayer().getSource().addFeature(feature);
            this.feature = feature;
		}
		
		_object.CreateFeatureDRAW = function(_option){
//			console.info("传入DRAW数据",_option);
			var _this = this;
		    if(_option["feature"] && _option["feature"]["getGeometry().getPoints()"]){
		    	var _feat = _option["feature"];
		    	var _type = _feat["type"];
		    	var _points = _feat["getGeometry().getPoints()"];
		    	var _plot = P.PlotFactory.createPlot(eval('('+"window."+_type+')'), _points);
		    	var feature = new ol.Feature(_plot);
				feature.set("type","NODB");
			    feature.set("type_name",_type);
			    
			    //设置样式
			    var _newStyle = new ol.style.Style({
					fill: new ol.style.Fill({
						color: _option["fill-color"]
					}), 
					stroke : new ol.style.Stroke({
				        color: _option["stroke-color"],
				        width: _option["stroke-width"]
				    })
				});
				feature.setStyle(_newStyle);
				_this.VectorLayer.getSource().addFeature(feature);
		    }
		}
		
		//设置ICON，这里是分类
		_object.SetOpenLayersSTATIC_ICON = function(_obj){
//			 console.info("触发ICON...",_obj);

			//如果feature不存在，则需要创建
			if(!this.feature){
				return false;
			}
			
			//设置坐标点
			_obj.coordinatesX = Number(_obj.coordinatesX);
			_obj.coordinatesY = Number(_obj.coordinatesY);
			var _coordinates = ol.proj.transform([_obj.coordinatesX,_obj.coordinatesY],'EPSG:4326','EPSG:3857');
			var point = new ol.geom.Point(_coordinates);
			this.feature.setGeometry(point);
			
			var _image = this.feature.getStyle().getImage();
			//获取请求地址
			var _imageURL = _image.getSrc();			
			_imageURL = xUtilBase.setURLParam(_imageURL,"JBYS",_obj.color);
			
			var _NewImage = new ol.style.Icon({
	            rotation: Number(_obj.rotation) * Math.PI / 180,
	            scale : Number(_obj.scale),
	            opacity : Number(_obj.opacity),
	            src: _imageURL
	        });
	        
	        if(_NewImage["setAnchor"]){
	        	var _t = (function(_s){
	            	var _a = _s.split(",");
	            	for(var i=0;i<_a.length;i++){
	            		_a[i] = Number(_a[i]);
	            	}
	            	return _a;
	            })(_obj.anchor.toString() || "");
	            
	        }
	        this.feature.getStyle().setImage(_NewImage);
		}
		
		//设置ICON，这里是分类
		_object.SetOpenLayersSTATIC_FONT = function(_obj){
			
			if(!this.feature){
				return false;
			}
			
//	        console.info("触发FONT...",_obj);
	        var _style = this.feature.getStyle();
	        var _olText = _style.getText();
	        _olText.setFont(_obj["font-size"]+" "+_obj["font-family"] || '12px Calibri,sans-serif');
	        _olText.getFill().setColor(_obj.color);
	        _olText.setText(_obj.text);
	        _olText.setOffsetX(Number(_obj.offsetX));
	        _olText.setOffsetY(Number(_obj.offsetY));
	        _olText.setRotation(Number(_obj.rotation));
	        
	        this.feature.setStyle(_style);
		}
		
		
		_object.SetOpenLayersSTATIC_MIAOSHU = function(_obj){
			if(!this.feature){
				return false;
			}
		}
		
				//设置ICON，这里是分类
		_object.SetOpenLayersDRAW_ICON = function(_obj){
//			 console.info("触发ICON...",_obj);

			//如果feature不存在，则需要创建
			if(!this.feature){
				return false;
			}
			
		    var _newStyle = new ol.style.Style({
				fill: new ol.style.Fill({
					color: _obj["fill-color"]
				}), 
				stroke : new ol.style.Stroke({
			        color: _obj["stroke-color"],
			        width: _obj["stroke-width"]
			    })
			});
			
			this.feature.setStyle(_newStyle)
		}
		
		_object.SetOpenLayersDRAW_FONT = function(_obj){
//			 console.info("触发ICON...",_obj);

			if(!this.feature){
				return false;
			}
			
//	        console.info("触发FONT...",_obj);
	        var _style = this.feature.getStyle();
	        var _olText = _style.getText();
	        _olText.setFont(_obj["font-size"]+" "+_obj["font-family"] || '12px Calibri,sans-serif');
	        _olText.getFill().setColor(_obj.color);
	        _olText.setText(_obj.text);
	        _olText.setOffsetX(Number(_obj.offsetX));
	        _olText.setOffsetY(Number(_obj.offsetY));
	        _olText.setRotation(Number(_obj.rotation));
	        
	        this.feature.setStyle(_style);
		}
		
		//框选
		_object.SetBoxStartSelect = function(_disable){
			
			var _this = this;
			
			//清除
			_this.removeFeatures();
			_this.map.removeLayer(_this._newVector);
			_this.map.removeInteraction(_this.select);
			_this.map.removeInteraction(_this.dragBox);
			
			_this.isSelectBox = _disable;
			
			if(!_this.isSelectBox){
				_this.isSelectBox = true;
				
				var _newVector = _this._newVector = new ol.layer.Vector({
					source: new ol.source.Vector(),
					style: new ol.style.Style({
						fill: new ol.style.Fill({
							color: 'rgba(255, 0, 0, 0.2)'
						}),
						stroke: new ol.style.Stroke({
							color: '#ffcc33',
							width: 2
						}),
						image: new ol.style.Circle({
							radius: 7,
							fill: new ol.style.Fill({
								color: '#ffcc33'
							})
						})
					})
				});
				_this.map.addLayer(_newVector);
				
				var boxSelect = new ol.interaction.Select();
				var selectedFeatures = boxSelect.getFeatures();  
				var dragBox = _this.dragBox = new ol.interaction.DragBox({  
	          	   //condition : ol.events.condition.always  默认是always
	             });
				_this.map.addInteraction(dragBox);
				
				_this.plotEdit = new P.PlotEdit(_this.map);
				
				dragBox.on('boxend', function() {
					
					//清除上次复制的feature
					_this.removeFeatures();
				
					var extent = dragBox.getGeometry().getExtent();  
					_this.GetVectorLayer().getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
						_this._newVector.getSource().addFeature(feature);
						if(feature.get("type")=="NODB"){
							_this.plotEdit.activate(feature);
						}else{
							
						}
						selectedFeatures.push(feature);
					});
					console.info(selectedFeatures.getArray().length);
	            });  
				dragBox.on('boxstart', function() {  
					selectedFeatures.clear();  
				});  
				_this.map.on('click', function() {  
					selectedFeatures.clear();
					_this.map.removeInteraction(_this.dragBox);
				});  
				
				_this.select = boxSelect;
			}
		}
		
		//删除图层中的feature
		_object.removeFeatures = function(){
			var _this = this;
			if(_this._newVector){
				var _array = _this._newVector.getSource().getFeatures();
				for(var i=_array.length-1;i>-1;i--){
					var _feature = _array[i];
					if(/^COPY\_/.test(_feature.get("type"))){
						_this._newVector.getSource().removeFeature();
					}
				}
			}
		}
		
		//默认初始化
		_object.init = function(){
			var _this = this;
			
			function isBIGMAP(_func){
				if(!top.BIGMap){
					setTimeout(function(){
						isBIGMAP(_func);
					},100);
				}else{
					_this.map = top.BIGMap.getMap();
					if(_func){
						_func();
					}
				}
			}
			
			isBIGMAP(function(){
				_this.GetVectorLayer();
			});
				
			$.each(_this.ATTRIBUTES, function(index,el) {
				var _o;
				try{
					_o = new window["_ClassDrawAttribute"+el];
				}catch(e){
					console.info("请检查文件：_ClassDrawAttribute"+el);
				}
				_o.inheritance = _this;
				_this.CHILDREN_ATTRIBUTES.push(_o);
			});
		}
		
		_object.init();
	}
})(jQuery,_ClassDrawAttributeMain);
