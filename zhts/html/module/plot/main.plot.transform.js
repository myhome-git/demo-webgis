var transformInteraction = function (option) {
	this.option = option;
    this.interaction = new ol.interaction.Transform({
        addCondition: ol.events.condition.shiftKeyOnly,
        hitTolerance: 8,
        translateFeature: true,
        scale: true,
        rotate: true,
        keepAspectRatio: true,
        translate: true,
        stretch: true,
        filter : function(feature,alayer){
//      	console.info("进入interaction filter...",feature);
        	if(feature.get("isPlot")){
        		if(feature.get("type")=="DBFeature"){
        			return true;
        		}
        		return false;
        	}
        	return false;
        },
    });
    this.map = this.option.map;
    this.init();
    this.addInteraction();
    this.setInteractionStyle(this.interaction);
    return this;
}

/**
 * 绑定接口
 */
transformInteraction.prototype.addInteraction = function () {
	this.map.addInteraction(this.interaction);
}

/**
 * 解除接口
 */
transformInteraction.prototype.removeInteraction = function () {
	this.map.removeInteraction(this.interaction);
}
/**
 * 初始化
 */
transformInteraction.prototype.init = function () {
	
	//指针
	let _this = this;
	
    // Events handlers
    let startangle = 0;
    let d = [0, 0];
		
    this.interaction.on(['select'], function (e) {
//  	console.info("进入interaction select...",e);
        if (e.feature){
			
			$.each(_this.map.getInteractions().getArray(), function(index,el) {
				if(el instanceof ol.interaction.DragPan){
					_this.map.removeInteraction(el);
					_this.map.getInteractions().insertAt(0,el);
				}
			});
            
            if(_this.option.callback && _this.option.callback.onSelect){
	    		_this.option.callback.onSelect(e);
	    	}
            
        }
    });

    this.interaction.on(['rotatestart', 'translatestart'], function (e) { // Rotation
        if (e.feature.get("type") != undefined && e.feature.get("type") == "DBFeature") {
            startangle = e.feature.get('angle') || 0;
            // Translation
//          d = [0, 0];
        }

    });
    this.interaction.on('rotating', function (e) {
        if (e.feature.get("type") == "DBFeature") {
            //这里转换有问题
//          var rotationVal = ((e.angle * 180 / Math.PI - 180) % 360 + 180);
//          console.info("计算前"+e.angle,rotationVal);
            
            // Set angle attribute to be used on style !
            var newangle = startangle - e.angle;
            e.feature.set('angle', newangle);
            e.feature.getStyle().getImage().setRotation(newangle);
        }

    });
    this.interaction.on('translating', function (e) {
//      if (e.feature.get("type") != undefined && e.feature.get("type") == "DBFeature") {
//          d[0] += e.delta[0];
//          d[1] += e.delta[1];
//      }

    });
    this.interaction.on('scaling', function (e) {});
    this.interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
    	if(_this.option.callback && _this.option.callback.onChangeFeature){
    		_this.option.callback.onChangeFeature(e);
    	}
    });

}

/**
 * 获取事件对象
 */
transformInteraction.prototype.getInteraction = function () {
    return this.interaction;
}

transformInteraction.prototype.setInteractionStyle = function () {
    // Set cursor style
    ol.interaction.Transform.prototype.Cursors['rotate'] = 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=\') 5 5, auto';
    ol.interaction.Transform.prototype.Cursors['rotate0'] = 'url(\'data:image/png;base64,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\') 5 5, auto';

    // Style the rotate handle
    var circle = new ol.style.RegularShape({
        fill: new ol.style.Fill({
            color: [255, 255, 255, 0.01]
        }),
        stroke: new ol.style.Stroke({
            width: 1,
            color: [0, 0, 0, 0.01]
        }),
        radius: 8,
        points: 10
    });
    this.interaction.setStyle('rotate',
        new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf0e2',
                font: "16px Fontawesome",
                textAlign: "left",
                fill: new ol.style.Fill({
                    color: 'red'
                })
            }),
            image: circle
        }));
    // Center of rotation
    this.interaction.setStyle('rotate0',
        new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf0e2',
                font: "20px Fontawesome",
                fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.8]
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'red'
                })
            }),
        }));
    // Style the move handle
    this.interaction.setStyle('translate',
        new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf047',
                font: "20px Fontawesome",
                fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.8]
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'red'
                })
            })
        }));

//  this.interaction.set('translate', this.interaction.get('translate'));
    this.interaction.setCenter();
}